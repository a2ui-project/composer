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
import {CopilotKit, provideCopilotKit} from '@copilotkit/angular';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {RendererSelection} from './renderer-selection';
import {RendererTool} from './renderer-tool';

describe('RendererTool', () => {
  const selection = {
    selectedRendererId: signal('default'),
    renderers: signal([
      {id: 'default', name: 'Angular Basic', rendererUrl: '/basic'},
      {id: 'slack', name: 'Slack Block Kit', rendererUrl: '/slack'},
    ]),
    selectRenderer: vi.fn<(id: string, signal?: AbortSignal) => Promise<void>>(),
  };
  let tool: RendererTool;
  beforeEach(() => {
    vi.clearAllMocks();
    selection.selectRenderer.mockResolvedValue();
    TestBed.configureTestingModule({
      providers: [
        provideCopilotKit({enableInspector: false}),
        {provide: RendererSelection, useValue: selection},
      ],
    });
    tool = TestBed.inject(RendererTool);
  });

  it('registers a real CopilotKit handler and executes it from a native model call', async () => {
    expect(TestBed.inject(CopilotKit).core.getTool({toolName: 'switchRenderer'})).toBeDefined();
    const signal = new AbortController().signal;
    await tool.execute({name: 'switchRenderer', args: {rendererId: 'slack'}}, signal);
    expect(selection.selectRenderer).toHaveBeenCalledWith('slack', signal);
    expect(tool.definition().parametersJsonSchema).toMatchObject({
      properties: {rendererId: {enum: ['default', 'slack']}},
    });
    expect(tool.definition().description).toContain('Current renderer: default');
  });

  it('rejects unknown tools, unknown renderers, URLs and extra arguments before mutation', async () => {
    const signal = new AbortController().signal;
    for (const call of [
      {name: 'otherTool', args: {rendererId: 'slack'}},
      {name: 'switchRenderer', args: {rendererId: 'https://unregistered.example/'}},
      {name: 'switchRenderer', args: {rendererId: 'slack', url: 'https://unregistered.example/'}},
    ])
      await expect(tool.execute(call, signal)).rejects.toThrow();
    expect(selection.selectRenderer).not.toHaveBeenCalled();
  });

  it('propagates switch failures and canceled turns', async () => {
    const call = {name: 'switchRenderer', args: {rendererId: 'slack'}};
    selection.selectRenderer.mockRejectedValueOnce(new Error('Renderer did not load'));
    await expect(tool.execute(call, new AbortController().signal)).rejects.toThrow(
      'Renderer did not load',
    );
    const abort = new AbortController();
    abort.abort(new Error('Stopped'));
    await expect(tool.execute(call, abort.signal)).rejects.toThrow('Stopped');
    expect(selection.selectRenderer).toHaveBeenCalledTimes(1);
  });
});
