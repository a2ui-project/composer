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
import {normalizeDemoHeadings} from './normalize-demo-headings.mjs';

function messageWith(components) {
  return {updateComponents: {surfaceId: 'demo', components}};
}

test('removes duplicate Markdown markers from literal Text heading variants', () => {
  const components = Array.from({length: 6}, (_, index) => ({
    id: `heading-${index + 1}`,
    component: 'Text',
    variant: `h${index + 1}`,
    text: `${'#'.repeat(index + 1)} Invitation Builder`,
  }));
  const messages = [messageWith(components)];
  const original = structuredClone(messages);

  const normalized = normalizeDemoHeadings(messages);

  assert.deepEqual(
    normalized[0].updateComponents.components,
    components.map(component => ({...component, text: 'Invitation Builder'})),
  );
  assert.deepEqual(messages, original, 'normalization must not mutate source messages');
});

test('preserves Markdown bodies, bindings, mismatched levels, and meaningful hashes', () => {
  const components = [
    {id: 'body', component: 'Text', variant: 'body', text: '# Markdown heading'},
    {id: 'default', component: 'Text', text: '## Markdown heading'},
    {id: 'binding', component: 'Text', variant: 'h1', text: {path: '/title'}},
    {id: 'mismatch', component: 'Text', variant: 'h1', text: '## Other level'},
    {id: 'hashtag', component: 'Text', variant: 'h1', text: '#Invitation'},
    {id: 'internal', component: 'Text', variant: 'h1', text: 'Issue #123'},
    {id: 'label', component: 'Button', variant: 'h1', text: '# Keep label'},
  ];
  const messages = [
    {updateDataModel: {surfaceId: 'demo', value: {title: '# Dynamic title'}}},
    messageWith(components),
  ];

  assert.deepEqual(normalizeDemoHeadings(messages), messages);
});
