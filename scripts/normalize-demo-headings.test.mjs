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

function singleMessageWith(components) {
  return {
    version: '1.0',
    createSurface: {
      surfaceId: 'demo',
      catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
      components,
    },
  };
}

test('preserves v1.0 Markdown heading prefixes in createSurface and updateComponents when variant is omitted or body/caption', () => {
  const components = [
    {id: 'h1', component: 'Text', text: '# Heading 1'},
    {id: 'h2', component: 'Text', text: '## Login'},
    {id: 'h3', component: 'Text', text: '### OS 87 · Vienna to New York'},
    {id: 'h4', component: 'Text', text: '#### Total'},
    {id: 'h5', component: 'Text', text: '##### Subsection'},
    {id: 'h6', component: 'Text', text: '###### Minor detail'},
    {id: 'body-heading', component: 'Text', variant: 'body', text: '## Body Heading'},
    {id: 'caption-text', component: 'Text', variant: 'caption', text: 'Caption text'},
  ];
  const createSurfaceMessages = [singleMessageWith(components)];
  const updateComponentsMessages = [
    {version: '1.0', updateComponents: {surfaceId: 'demo', components}},
  ];

  assert.deepEqual(normalizeDemoHeadings(createSurfaceMessages), createSurfaceMessages);
  assert.deepEqual(normalizeDemoHeadings(updateComponentsMessages), updateComponentsMessages);
});

test('removes duplicate Markdown markers when legacy heading variants h1-h6 are present in createSurface or updateComponents', () => {
  const components = Array.from({length: 6}, (_, index) => ({
    id: `heading-${index + 1}`,
    component: 'Text',
    variant: `h${index + 1}`,
    text: `${'#'.repeat(index + 1)} h${index + 1} Section Title`,
  }));
  const messages = [singleMessageWith(components)];
  const original = structuredClone(messages);

  const normalized = normalizeDemoHeadings(messages);

  assert.deepEqual(
    normalized[0].createSurface.components,
    components.map((component, index) => ({
      ...component,
      text: `h${index + 1} Section Title`,
    })),
  );
  assert.deepEqual(messages, original, 'normalization must not mutate source messages');
});

test('preserves v1.0 non-heading hashes, bindings, and other components in createSurface', () => {
  const components = [
    {id: 'hashtag', component: 'Text', text: '#Trending'},
    {id: 'internal', component: 'Text', text: 'PR #42 and Issue #123'},
    {id: 'binding', component: 'Text', text: {'@path': '/title'}},
    {id: 'button-label', component: 'Button', text: '# Submit'},
  ];
  const messages = [singleMessageWith(components)];

  assert.deepEqual(normalizeDemoHeadings(messages), messages);
});

