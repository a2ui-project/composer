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

import {TestBed} from '@angular/core/testing';
import {signal} from '@angular/core';
import {beforeEach, describe, expect, it} from 'vitest';
import {RendererSelection} from './renderer-selection';
import {RendererTool} from './renderer-tool';

describe('RendererTool', () => {
  const basic = {
    id: 'default',
    name: 'Angular Basic',
    rendererUrl: 'https://renderers.example/basic/',
    readOnly: true,
  };
  const slack = {
    id: 'slack',
    name: 'Slack Block Kit',
    rendererUrl: 'https://renderers.example/slack/',
    readOnly: true,
  };
  const localSlack = {
    id: 'slack-local',
    name: 'Slack Block Kit',
    rendererUrl: 'http://localhost:4200/slack/',
    readOnly: true,
  };
  const selection = {
    activeRenderer: signal<typeof basic | null>(null),
    renderers: signal([basic, slack, localSlack]),
  };
  let tool: RendererTool;
  beforeEach(() => {
    selection.activeRenderer.set(null);
    selection.renderers.set([basic, slack, localSlack]);
    TestBed.configureTestingModule({
      providers: [{provide: RendererSelection, useValue: selection}],
    });
    tool = TestBed.inject(RendererTool);
  });

  it('offers every configured renderer with the origin it is served from', () => {
    selection.activeRenderer.set(basic);
    const definition = tool.definition()!;
    expect(definition.parametersJsonSchema).toMatchObject({
      properties: {rendererId: {enum: ['default', 'slack', 'slack-local']}},
    });
    expect(definition.description).toContain(
      'Current renderer: default, origin https://renderers.example.',
    );
    expect(definition.description).toContain(
      '{"id":"slack-local","name":"Slack Block Kit","origin":"http://localhost:4200"}',
    );
  });

  it('names the renderer the preview shows as the current one', () => {
    selection.activeRenderer.set(slack);

    expect(tool.definition()!.description).toContain(
      'Current renderer: slack, origin https://renderers.example.',
    );
  });

  it('names no current renderer when the preview shows one that is not configured', () => {
    const description = tool.definition()!.description;

    expect(description).not.toContain('Current renderer');
    expect(description).toContain('Available renderers: ');
  });

  it.each([
    {count: 'no renderers', renderers: []},
    {count: 'one renderer', renderers: [basic]},
  ])('offers no tool with $count to choose from', ({renderers}) => {
    selection.renderers.set(renderers);

    expect(tool.definition()).toBeNull();
  });

  it('returns the configured renderer a call names', () => {
    expect(tool.rendererFor({name: 'switchRenderer', args: {rendererId: 'slack'}})).toBe(slack);
  });

  it.each([
    {name: 'otherTool', args: {rendererId: 'slack'}},
    {name: 'switchRenderer', args: {}},
    {name: 'switchRenderer', args: {rendererId: 7}},
    {name: 'switchRenderer', args: {rendererId: 'https://unregistered.example/'}},
    {name: 'switchRenderer', args: {rendererId: 'slack', url: 'https://unregistered.example/'}},
  ])('rejects $name with $args', call => {
    expect(() => tool.rendererFor(call)).toThrow();
  });
});
