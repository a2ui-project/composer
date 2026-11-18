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

  it('assigns distinct node keys across surfaces with identical component ids', () => {
    const components = [
      {id: 'root', component: 'Card', child: 'title'},
      {id: 'title', component: 'Text', text: 'Hi'},
      {id: 'orphan', component: 'Text', text: 'Unused'},
    ];
    const [first, second] = buildComponentTrees(
      [
        {version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: 'test'}},
        {version: 'v0.9', updateComponents: {surfaceId: 's1', components}},
        {version: 'v0.9', createSurface: {surfaceId: 's2', catalogId: 'test'}},
        {version: 'v0.9', updateComponents: {surfaceId: 's2', components}},
      ],
      CATALOG,
    );
    expect(first.root!.key).not.toBe(second.root!.key);
    expect(first.root!.children[0].key).not.toBe(second.root!.children[0].key);
    expect(first.unreachable[0].key).not.toBe(second.unreachable[0].key);
  });

  it('builds a tree from inline v1.0 createSurface components', () => {
    const messages = [
      {
        version: '1.0',
        createSurface: {
          surfaceId: 's',
          components: [
            {id: 'root', component: 'Card', child: 'title'},
            {id: 'title', component: 'Text'},
          ],
        },
      },
    ];

    const [tree] = buildComponentTrees(messages, CATALOG);

    expect(outline(tree.root)).toEqual(['Card#root', '  child:Text#title']);
    expect(tree.componentCount).toBe(2);
  });

  it('merges subsequent updateComponents onto inline createSurface components', () => {
    const messages = [
      {
        version: '1.0',
        createSurface: {
          surfaceId: 's',
          components: [
            {id: 'root', component: 'Card', child: 'title'},
            {id: 'title', component: 'Text'},
          ],
        },
      },
      {
        version: '1.0',
        updateComponents: {
          surfaceId: 's',
          components: [
            {id: 'root', component: 'Column', children: ['title', 'extra']},
            {id: 'extra', component: 'Text'},
          ],
        },
      },
    ];

    const [tree] = buildComponentTrees(messages, CATALOG);

    expect(outline(tree.root)).toEqual([
      'Column#root',
      '  children:Text#title',
      '  children:Text#extra',
    ]);
    expect(tree.componentCount).toBe(3);
  });

  it('follows v1.0 Child references in unbundled catalogs', () => {
    const v1Catalog: Catalog = {
      catalogId: 'v1-basic',
      components: {
        Column: {properties: {children: {$ref: 'common_types.json#/$defs/ChildList'}}},
        Card: {properties: {child: {$ref: 'common_types.json#/$defs/Child'}}},
        Modal: {
          properties: {
            trigger: {$ref: 'common_types.json#/$defs/Child'},
            content: {$ref: 'common_types.json#/$defs/Child'},
          },
        },
        Text: {properties: {text: {type: 'string'}}},
      },
    };
    const messages = surface([
      {id: 'root', component: 'Column', children: ['card', 'modal']},
      {id: 'card', component: 'Card', child: 'title'},
      {id: 'title', component: 'Text'},
      {id: 'modal', component: 'Modal', trigger: 'open', content: 'body'},
      {id: 'open', component: 'Text'},
      {id: 'body', component: 'Text'},
    ]);

    const [tree] = buildComponentTrees(messages, v1Catalog);

    expect(outline(tree.root)).toEqual([
      'Column#root',
      '  children:Card#card',
      '    child:Text#title',
      '  children:Modal#modal',
      '    trigger:Text#open',
      '    content:Text#body',
    ]);
    expect(tree.unreachable).toEqual([]);
  });

  it('resolves Draft-07 #/definitions/ references in custom catalogs', () => {
    const draft07Catalog = {
      catalogId: 'draft-07',
      components: {
        Modal: {$ref: '#/definitions/ModalProps'},
        Text: {properties: {text: {type: 'string'}}},
      },
      definitions: {
        ModalProps: {
          properties: {
            trigger: {$ref: `${COMMON}/ComponentId`},
            content: {$ref: `${COMMON}/ComponentId`},
          },
        },
      },
    };
    const messages = surface([
      {id: 'root', component: 'Modal', trigger: 'open', content: 'body'},
      {id: 'open', component: 'Text'},
      {id: 'body', component: 'Text'},
    ]);

    const [tree] = buildComponentTrees(messages, draft07Catalog);

    expect(outline(tree.root)).toEqual([
      'Modal#root',
      '  trigger:Text#open',
      '  content:Text#body',
    ]);
    expect(tree.unreachable).toEqual([]);
  });

  it('ignores inherited prototype properties on catalog components and definitions', () => {
    const inheritedDefs = Object.create({
      InheritedSlot: {properties: {secret: {$ref: `${COMMON}/ComponentId`}}},
    }) as Record<string, Record<string, unknown>>;
    const catalog = {
      catalogId: 'proto-guard',
      components: {
        Column: {properties: {children: {$ref: `${COMMON}/ChildList`}}},
        UsesDefsProto: {$ref: '#/$defs/InheritedSlot'},
        UsesDefinitionsProto: {$ref: '#/definitions/InheritedSlot'},
        Text: {properties: {text: {type: 'string'}}},
      },
      $defs: inheritedDefs,
      definitions: inheritedDefs,
    };
    const messages = surface([
      {
        id: 'root',
        component: 'Column',
        children: ['constructorComp', 'defsComp', 'definitionsComp'],
      },
      {id: 'constructorComp', component: 'constructor', child: 'fallbackLeaf'},
      {id: 'fallbackLeaf', component: 'Text'},
      {id: 'defsComp', component: 'UsesDefsProto', secret: 'hiddenA'},
      {id: 'definitionsComp', component: 'UsesDefinitionsProto', secret: 'hiddenB'},
      {id: 'hiddenA', component: 'Text'},
      {id: 'hiddenB', component: 'Text'},
    ]);

    const [tree] = buildComponentTrees(messages, catalog);

    expect(outline(tree.root)).toEqual([
      'Column#root',
      '  children:constructor#constructorComp',
      '    child:Text#fallbackLeaf',
      '  children:UsesDefsProto#defsComp',
      '  children:UsesDefinitionsProto#definitionsComp',
    ]);
    expect(tree.unreachable.map(node => node.id)).toEqual(['hiddenA', 'hiddenB']);
  });
});
