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
import {describe, it, expect, beforeEach} from 'vitest';
import {ChatState, LlmLogType} from './chat-state';
import {MessageRole} from '../llm-client/llm-client';
import {PipelineStatus} from '../pipeline-status/pipeline-status';

describe('ChatState Reactive Standalone Database', () => {
  let chatState: ChatState;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChatState],
    });
    chatState = TestBed.inject(ChatState);
  });

  it('initializes reactive signals with default idle values', () => {
    expect(chatState.chatHistory()).toEqual([]);
    expect(chatState.pipelineStatus()).toBe(PipelineStatus.IDLE);
    expect(chatState.isProgrammaticStreamActive()).toBe(false);
    expect(chatState.latestLlmLog()).toBeNull();
    expect(chatState.llmHistory()).toEqual([]);
  });

  it('updates chat history transactionally enforcing immutability', () => {
    const initialMessages = [{role: MessageRole.USER, content: 'Hello'}];
    chatState.setChatHistory(initialMessages);
    expect(chatState.chatHistory()).toEqual(initialMessages);

    chatState.updateChatHistory(history => [
      ...history,
      {role: MessageRole.MODEL, content: 'Hi there'},
    ]);

    expect(chatState.chatHistory()).toHaveLength(2);
    expect(chatState.chatHistory()[1]).toEqual({
      role: MessageRole.MODEL,
      content: 'Hi there',
    });
  });

  it('manages stream activity locks and pipeline status milestones', () => {
    chatState.setPipelineStatus(PipelineStatus.VALIDATING);
    expect(chatState.pipelineStatus()).toBe(PipelineStatus.VALIDATING);

    chatState.setProgrammaticStreamActive(true);
    expect(chatState.isProgrammaticStreamActive()).toBe(true);

    chatState.setProgrammaticStreamActive(false);
    expect(chatState.isProgrammaticStreamActive()).toBe(false);
  });

  it('enforces a strict 50-entry FIFO sliding log truncation on raw LLM telemetry logs', () => {
    for (let i = 0; i < 55; i++) {
      chatState.addRawLlmLog(LlmLogType.REQUEST, {index: i});
    }

    const history = chatState.llmHistory();
    expect(history).toHaveLength(50);
    expect((history[0].payload as {index: number}).index).toBe(5);
    expect((history[49].payload as {index: number}).index).toBe(54);

    const latest = chatState.latestLlmLog();
    expect(latest).not.toBeNull();
    expect((latest?.payload as {index: number}).index).toBe(54);
  });

  it('clears raw LLM telemetry history completely', () => {
    chatState.addRawLlmLog(LlmLogType.RESPONSE, {data: 'test'});
    expect(chatState.latestLlmLog()).not.toBeNull();
    expect(chatState.llmHistory()).toHaveLength(1);

    chatState.clearRawLlmHistory();
    expect(chatState.latestLlmLog()).toBeNull();
    expect(chatState.llmHistory()).toEqual([]);
  });
});
