/*
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

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  extractSurfaceComponents,
  validateV10Components,
  getChildReferences,
} from '../samples/shared/validate-components.ts';
import {compareFilenames, idFromFilename, withoutReplacedExamples} from './generate-demos.mjs';

test('getChildReferences collects child, children array, children object, trigger, content, and tabs', () => {
  const props = {
    child: 'single_child',
    children: ['child_a', 'child_b'],
    trigger: 'trigger_btn',
    content: 'modal_body',
    tabs: [{child: 'tab1_child'}, {child: 'tab2_child'}],
  };

  const refs = getChildReferences(props);
  assert.deepEqual(refs, [
    'single_child',
    'child_a',
    'child_b',
    'trigger_btn',
    'modal_body',
    'tab1_child',
    'tab2_child',
  ]);
});

test('getChildReferences extracts dynamic list template children.componentId', () => {
  const props = {
    children: {
      path: '/items',
      componentId: 'row_template',
    },
  };

  const refs = getChildReferences(props);
  assert.deepEqual(refs, ['row_template']);
});

test('validateV10Components passes for valid component hierarchy', () => {
  const components = [
    {id: 'root', component: 'Card', child: 'content'},
    {id: 'content', component: 'Column', children: ['title', 'btn']},
    {id: 'title', component: 'Text', text: 'Hello World'},
    {
      id: 'btn',
      component: 'Button',
      child: 'btn_label',
      action: {event: {name: 'submit', context: {}}},
    },
    {id: 'btn_label', component: 'Text', text: 'Click me'},
  ];

  assert.doesNotThrow(() => {
    validateV10Components(components, 'test-valid');
  });
});

test('validateV10Components throws when root component is missing', () => {
  const components = [{id: 'header', component: 'Text', text: 'No root'}];

  assert.throws(
    () => validateV10Components(components, 'test-no-root'),
    /test-no-root: needs a root and unique component ids\./,
  );
});

test('validateV10Components throws when component ids are duplicated', () => {
  const components = [
    {id: 'root', component: 'Column', children: ['dup']},
    {id: 'dup', component: 'Text', text: 'First'},
    {id: 'dup', component: 'Text', text: 'Second'},
  ];

  assert.throws(
    () => validateV10Components(components, 'test-dup-id'),
    /test-dup-id: needs a root and unique component ids\./,
  );
});

test('validateV10Components throws when unknown basic component is referenced', () => {
  const components = [{id: 'root', component: 'NonExistentComponent', foo: 'bar'}];

  assert.throws(
    () => validateV10Components(components, 'test-unknown'),
    /test-unknown: unknown basic component NonExistentComponent\./,
  );
});

test('validateV10Components throws when component schema validation fails', () => {
  const components = [
    {id: 'root', component: 'Text', text: 12345}, // text must be string or binding object
  ];

  assert.throws(
    () => validateV10Components(components, 'test-schema-fail'),
    /test-schema-fail: component "Text" \(id: "root"\) failed schema validation/,
  );
});

test('validateV10Components throws when child reference is missing from ids', () => {
  const components = [{id: 'root', component: 'Card', child: 'missing_child'}];

  assert.throws(
    () => validateV10Components(components, 'test-missing-child'),
    /test-missing-child: root references missing child missing_child\./,
  );
});

test('validateV10Components allows requireRoot: false when validating fragments', () => {
  const fragments = [
    {id: 'item_1', component: 'Text', text: 'Item 1'},
    {id: 'item_2', component: 'Text', text: 'Item 2'},
  ];

  assert.doesNotThrow(() => {
    validateV10Components(fragments, 'fragments', {requireRoot: false});
  });
});

test('extractSurfaceComponents accumulates and updates components across messages', () => {
  const messages = [
    {
      createSurface: {
        surfaceId: 'test-surf',
        components: [
          {id: 'root', component: 'Card', child: 'initial'},
          {id: 'initial', component: 'Text', text: 'Initial'},
        ],
      },
    },
    {
      updateComponents: {
        surfaceId: 'test-surf',
        components: [
          {id: 'initial', component: 'Text', text: 'Updated'},
          {id: 'extra', component: 'Text', text: 'Extra'},
        ],
      },
    },
  ];

  const result = extractSurfaceComponents(messages, 'test-extract');
  assert.equal(result.length, 3);
  const initial = result.find(c => c.id === 'initial');
  assert.equal(initial?.text, 'Updated');
});

test('extractSurfaceComponents throws on duplicate ids within a single message', () => {
  const messages = [
    {
      createSurface: {
        surfaceId: 'test-surf',
        components: [
          {id: 'root', component: 'Text', text: 'A'},
          {id: 'root', component: 'Text', text: 'B'},
        ],
      },
    },
  ];

  assert.throws(
    () => extractSurfaceComponents(messages, 'test-single-msg-dup'),
    /test-single-msg-dup: duplicate component id "root" within message\./,
  );
});

test('compareFilenames orders numeric prefixes before un-prefixed filenames', () => {
  const files = ['10_modal.json', '01_flight.json', 'custom.json', '02_system.json'];
  files.sort(compareFilenames);
  assert.deepEqual(files, ['01_flight.json', '02_system.json', '10_modal.json', 'custom.json']);
});

test('idFromFilename extracts demo id from filename', () => {
  assert.equal(idFromFilename('01_flight.json'), 'flight');
  assert.equal(idFromFilename('37_native-grid.json'), 'native-grid');
  assert.equal(idFromFilename('demo.json'), 'demo');
});

test('withoutReplacedExamples removes examples case-insensitively when showcase exists', () => {
  const showcases = [{name: 'Flight status'}];
  const examples = [
    {name: 'Flight Status', id: 'flight-status'},
    {name: 'System dashboard', id: 'system-dashboard'},
  ];

  const filtered = withoutReplacedExamples(examples, showcases);
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'system-dashboard');
});
