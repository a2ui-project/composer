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

import {describe, it, expect, beforeEach, vi} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {EventType, type BaseEvent, type RunAgentInput} from '@ag-ui/core';
import {firstValueFrom, toArray} from 'rxjs';
import {GeminiA2uiAgent, RENDER_A2UI_TOOL, A2UI_REPAIR_TOOL} from './gemini-a2ui-agent';
import {A2uiGenerationService, type GenerationResult} from '../a2ui-generation/a2ui-generation.service';

class FakeGenerationService {
  result: GenerationResult = {
    ok: true,
    blocks: [{version: 'v0.9'}, {version: 'v0.9'}],
    layoutText: '[]',
    heals: [],
    surfaceTitle: 'Book a Car',
  };
  /** Thinking deltas replayed through `opts.onThinking` during generate(). */
  thinkingDeltas: string[] = [];
  cancel = vi.fn();
  systemPrompt = () => 'SYSTEM PROMPT';
  generate = vi.fn(
    async (_messages: unknown, opts?: {onThinking?: (delta: string, accumulated: string) => void}) => {
      let accumulated = '';
      for (const delta of this.thinkingDeltas) {
        accumulated += delta;
        opts?.onThinking?.(delta, accumulated);
      }
      return this.result;
    },
  );
}

function makeInput(userText: string): RunAgentInput {
  return {
    threadId: 't1',
    runId: 'r1',
    messages: [{id: 'm1', role: 'user', content: userText}],
    tools: [],
    context: [],
    forwardedProps: {},
    state: {},
  } as unknown as RunAgentInput;
}

function runToEvents(agent: GeminiA2uiAgent, input: RunAgentInput): Promise<BaseEvent[]> {
  return firstValueFrom(agent.run(input).pipe(toArray()));
}

describe('GeminiA2uiAgent', () => {
  let fake: FakeGenerationService;
  let agent: GeminiA2uiAgent;

  beforeEach(() => {
    fake = new FakeGenerationService();
    TestBed.configureTestingModule({
      providers: [GeminiA2uiAgent, {provide: A2uiGenerationService, useValue: fake}],
    });
    agent = TestBed.inject(GeminiA2uiAgent);
  });

  it('emits status narration then a render_a2ui tool call on success', async () => {
    const events = await runToEvents(agent, makeInput('a booking form'));
    const types = events.map(e => e.type);

    expect(types).toEqual([
      EventType.RUN_STARTED,
      EventType.TEXT_MESSAGE_START,
      EventType.TEXT_MESSAGE_CONTENT,
      EventType.TEXT_MESSAGE_END,
      EventType.TOOL_CALL_START,
      EventType.TOOL_CALL_ARGS,
      EventType.TOOL_CALL_END,
      EventType.RUN_FINISHED,
    ]);

    const start = events.find(e => e.type === EventType.TOOL_CALL_START) as {toolCallName: string};
    expect(start.toolCallName).toBe(RENDER_A2UI_TOOL);
    const argsEvent = events.find(e => e.type === EventType.TOOL_CALL_ARGS) as {delta: string};
    expect(JSON.parse(argsEvent.delta)).toEqual({surfaceTitle: 'Book a Car', blocks: fake.result.blocks});
    // Raw model JSONL is never streamed as assistant content.
    const content = events.find(e => e.type === EventType.TEXT_MESSAGE_CONTENT) as {delta: string};
    expect(content.delta).toBe('Generating your UI…');
  });

  it('streams the model thinking as an AG-UI reasoning message before the tool call', async () => {
    fake.thinkingDeltas = ['I need ', 'a booking form'];
    const events = await runToEvents(agent, makeInput('a booking form'));

    expect(events.map(e => e.type)).toEqual([
      EventType.RUN_STARTED,
      EventType.TEXT_MESSAGE_START,
      EventType.TEXT_MESSAGE_CONTENT,
      EventType.TEXT_MESSAGE_END,
      EventType.REASONING_MESSAGE_START,
      EventType.REASONING_MESSAGE_CONTENT,
      EventType.REASONING_MESSAGE_CONTENT,
      EventType.REASONING_MESSAGE_END,
      EventType.TOOL_CALL_START,
      EventType.TOOL_CALL_ARGS,
      EventType.TOOL_CALL_END,
      EventType.RUN_FINISHED,
    ]);

    const start = events.find(e => e.type === EventType.REASONING_MESSAGE_START) as {role: string};
    expect(start.role).toBe('reasoning');
    const deltas = events
      .filter(e => e.type === EventType.REASONING_MESSAGE_CONTENT)
      .map(e => (e as {delta: string}).delta);
    expect(deltas).toEqual(['I need ', 'a booking form']);
  });

  it('emits no reasoning events when the model returns no thinking', async () => {
    const events = await runToEvents(agent, makeInput('a form'));
    const types = events.map(e => e.type);
    expect(types).not.toContain(EventType.REASONING_MESSAGE_START);
    expect(types).not.toContain(EventType.REASONING_MESSAGE_CONTENT);
  });

  it('emits an a2ui_repair tool call when the pipeline healed component names', async () => {
    fake.result = {...(fake.result as object as GenerationResult & {ok: true}), heals: [{from: 'textbox', to: 'TextField'}]};
    const events = await runToEvents(agent, makeInput('a form'));

    const toolStarts = events.filter(e => e.type === EventType.TOOL_CALL_START) as Array<{toolCallName: string}>;
    expect(toolStarts.map(t => t.toolCallName)).toEqual([RENDER_A2UI_TOOL, A2UI_REPAIR_TOOL]);
    const repairArgs = events.filter(e => e.type === EventType.TOOL_CALL_ARGS)[1] as {delta: string};
    expect(JSON.parse(repairArgs.delta)).toEqual({fixes: [{from: 'textbox', to: 'TextField'}]});
  });

  it('does NOT emit a repair tool call when there are no heals', async () => {
    const events = await runToEvents(agent, makeInput('a form'));
    const toolStarts = events.filter(e => e.type === EventType.TOOL_CALL_START) as Array<{toolCallName: string}>;
    expect(toolStarts.map(t => t.toolCallName)).toEqual([RENDER_A2UI_TOOL]);
  });

  it('maps a generation error to a friendly message + RUN_ERROR', async () => {
    fake.result = {
      ok: false,
      title: 'Invalid API Key',
      message: 'The provided Gemini API key is invalid or missing.',
      tip: 'Update your key in Settings.',
      retryable: true,
    };
    const events = await runToEvents(agent, makeInput('a form'));
    const types = events.map(e => e.type);
    expect(types).toContain(EventType.RUN_ERROR);
    expect(types).not.toContain(EventType.TOOL_CALL_START);
    const err = events.find(e => e.type === EventType.RUN_ERROR) as {message: string};
    expect(err.message).toBe('The provided Gemini API key is invalid or missing.');
  });

  it('prepends the system prompt and passes user turns to generate()', async () => {
    await runToEvents(agent, makeInput('make a dashboard'));
    const passed = fake.generate.mock.calls[0][0];
    expect(passed[0]).toEqual({role: 'system', content: 'SYSTEM PROMPT'});
    expect(passed.at(-1)).toEqual({role: 'user', content: 'make a dashboard'});
  });

  it('cancels the in-flight generation when the subscription is torn down', () => {
    const sub = agent.run(makeInput('x')).subscribe();
    sub.unsubscribe();
    expect(fake.cancel).toHaveBeenCalled();
  });
});
