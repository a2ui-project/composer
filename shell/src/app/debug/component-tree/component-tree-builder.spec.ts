/**
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {describe, it, expect} from 'vitest';
import {Catalog} from '../../storage/models/catalog-storage.model';
import {ComponentTreeNode, buildComponentTrees} from './component-tree-builder';

const COMMON = 'https://a2ui.org/specification/v0_9/common_types.json#/$defs';

const CATALOG: Catalog = {
  catalogId: 'test',
  components: {
    Column: {
      allOf: [
        {$ref: `${COMMON}/ComponentCommon`},
        {properties: {children: {$ref: `${COMMON}/ChildList`}}},
      ],
    },
    Card: {properties: {child: {$ref: `${COMMON}/ComponentId`}}},
    Tabs: {
      properties: {
        tabs: {
          type: 'array',
          items: {properties: {title: {type: 'string'}, child: {$ref: `${COMMON}/ComponentId`}}},
        },
      },
    },
    Modal: {$ref: '#/$defs/ModalProps'},
    Text: {properties: {text: {type: 'string'}}},
  },
  $defs: {
    ModalProps: {
      properties: {
        trigger: {$ref: `${COMMON}/ComponentId`},
        content: {$ref: `${COMMON}/ComponentId`},
      },
    },
  },
};

function surface(components: Array<Record<string, unknown>>) {
  return [
    {version: 'v0.9', createSurface: {surfaceId: 's', catalogId: 'test'}},
    {version: 'v0.9', updateComponents: {surfaceId: 's', components}},
  ];
}

/** Renders a tree as indented `via:type#id [flags]` lines. */
function outline(node: ComponentTreeNode | null, depth = 0): string[] {
  if (!node) return [];
  const flags = [
    node.status !== 'ok' ? node.status : '',
    node.shared ? 'shared' : '',
    node.template !== null ? `each ${node.template}` : '',
  ].filter(Boolean);
  const line =
    '  '.repeat(depth) +
    `${node.via ? node.via + ':' : ''}${node.type ?? '?'}#${node.id}` +
    (flags.length ? ` [${flags.join(', ')}]` : '');
  return [line, ...node.children.flatMap(c => outline(c, depth + 1))];
}

describe('buildComponentTrees', () => {
  it('follows ComponentId and ChildList references found in the catalog schema', () => {
    const [tree] = buildComponentTrees(
      surface([
        {id: 'root', component: 'Column', children: ['card', 'tabs', 'modal']},
        {id: 'card', component: 'Card', child: 'title'},
        {id: 'title', component: 'Text', text: 'Hi'},
        {
          id: 'tabs',
          component: 'Tabs',
          tabs: [
            {title: 'A', child: 'a'},
            {title: 'B', child: 'b'},
          ],
        },
        {id: 'a', component: 'Text'},
        {id: 'b', component: 'Text'},
        {id: 'modal', component: 'Modal', trigger: 'open', content: 'body'},
        {id: 'open', component: 'Text'},
        {id: 'body', component: 'Text'},
      ]),
      CATALOG,
    );
    expect(outline(tree.root)).toEqual([
      'Column#root',
      '  children:Card#card',
      '    child:Text#title',
      '  children:Tabs#tabs',
      '    tabs[0].child:Text#a',
      '    tabs[1].child:Text#b',
      '  children:Modal#modal',
      '    trigger:Text#open',
      '    content:Text#body',
    ]);
    expect(tree.unreachable).toEqual([]);
    expect(tree.componentCount).toBe(9);
  });

  it('reports missing, cyclic, shared, template and unreachable components', () => {
    const [tree] = buildComponentTrees(
      surface([
        {id: 'root', component: 'Column', children: ['loop', 'shared', 'shared', 'ghost']},
        {id: 'loop', component: 'Card', child: 'root'},
        {id: 'shared', component: 'Column', children: {componentId: 'item', path: '/items'}},
        {id: 'item', component: 'Text'},
        {id: 'orphan', component: 'Card', child: 'orphanChild'},
        {id: 'orphanChild', component: 'Text'},
      ]),
      CATALOG,
    );
    expect(outline(tree.root)).toEqual([
      'Column#root',
      '  children:Card#loop',
      '    child:Column#root [cycle]',
      '  children:Column#shared [shared]',
      '    children:Text#item [each /items]',
      '  children:Column#shared [shared]',
      '    children:Text#item [each /items]',
      '  children:?#ghost [missing]',
    ]);
    expect(tree.unreachable.map(n => outline(n))).toEqual([
      ['Card#orphan', '  child:Text#orphanChild'],
    ]);
  });

  it('falls back to child/children without a catalog and tracks surface lifecycle', () => {
    const trees = buildComponentTrees(
      [
        ...surface([
          {id: 'root', component: 'Box', children: ['x']},
          {id: 'x', component: 'Thing', child: 'y'},
          {id: 'y', component: 'Thing'},
        ]),
        {version: 'v0.9', createSurface: {surfaceId: 'gone', catalogId: 'test'}},
        {version: 'v0.9', deleteSurface: {surfaceId: 'gone'}},
      ],
      null,
    );
    expect(trees.map(t => t.surfaceId)).toEqual(['s']);
    expect(outline(trees[0].root)).toEqual(['Box#root', '  children:Thing#x', '    child:Thing#y']);
  });

  it('has no root until the root component is defined', () => {
    const [tree] = buildComponentTrees(surface([{id: 'x', component: 'Text'}]), CATALOG);
    expect(tree.root).toBeNull();
    expect(tree.unreachable.map(n => n.id)).toEqual(['x']);
  });

  it('follows references in bundled catalogs with namespaced $defs', () => {
    const bundled: Catalog = {
      catalogId: 'bundled',
      components: {
        Row: {
          allOf: [
            {$ref: '#/$defs/common_types_ComponentCommon'},
            {properties: {children: {$ref: '#/$defs/common_types_ChildList'}}},
          ],
        },
        Button: {properties: {child: {$ref: '#/$defs/common_types_ComponentId'}}},
        Text: {properties: {text: {type: 'string'}}},
      },
      $defs: {
        common_types_ComponentCommon: {
          properties: {id: {$ref: '#/$defs/common_types_ComponentId'}},
        },
        common_types_ComponentId: {type: 'string'},
        common_types_ChildList: {},
      },
    };
    const [tree] = buildComponentTrees(
      surface([
        {id: 'root', component: 'Row', children: ['btn']},
        {id: 'btn', component: 'Button', child: 'label'},
        {id: 'label', component: 'Text', text: 'Go'},
      ]),
      bundled,
    );
    expect(outline(tree.root)).toEqual([
      'Row#root',
      '  children:Button#btn',
      '    child:Text#label',
    ]);
    expect(tree.unreachable).toEqual([]);
  });
});
