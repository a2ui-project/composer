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

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {RawMessages} from './raw-messages';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {RawMessagesHarness} from './test/raw-messages.harness';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {
  HostCommunication,
  MessageEnvelope,
} from '../../shell/host-communication/host-communication';
import {signal, WritableSignal} from '@angular/core';
import {ChatState, LlmLogEntry, LlmLogType} from '../../chat/chat-state/chat-state';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {PreviewBridgeMessageType} from 'a2ui-bridge';

describe('RawMessages', () => {
  let fixture: ComponentFixture<RawMessages>;
  let component: RawMessages;
  let harness: RawMessagesHarness;
  let messageStreamSignal: WritableSignal<MessageEnvelope | null>;
  let hostCommMock: Partial<HostCommunication>;
  let listeners: Set<(env: MessageEnvelope) => void>;
  let emitMessage: (env: MessageEnvelope) => void;

  let latestLlmLogSignal: WritableSignal<LlmLogEntry | null>;
  let llmHistorySignal: WritableSignal<LlmLogEntry[]>;
  let chatStateMock: Partial<ChatState>;

  beforeEach(async () => {
    messageStreamSignal = signal<MessageEnvelope | null>(null);
    listeners = new Set();
    emitMessage = (env: MessageEnvelope) => {
      listeners.forEach(l => l(env));
      messageStreamSignal.set(env);
    };

    hostCommMock = {
      messageStream: messageStreamSignal,
      addListener: vi.fn(l => listeners.add(l)),
      removeListener: vi.fn(l => listeners.delete(l)),
      getHistoryBuffer: vi.fn(() => []),
      getLatestCatalog: vi.fn(() => null),
      clearHistoryBuffer: vi.fn(),
    };
    latestLlmLogSignal = signal<LlmLogEntry | null>(null);
    llmHistorySignal = signal<LlmLogEntry[]>([]);

    const originalSet = latestLlmLogSignal.set;
    latestLlmLogSignal.set = (val: LlmLogEntry | null) => {
      originalSet(val);
      if (val) {
        llmHistorySignal.update(history => {
          const isDuplicate = history.some(
            item => item.timestamp === val.timestamp && item.type === val.type,
          );
          if (isDuplicate) return history;
          return [...history, val];
        });
      }
    };

    chatStateMock = {
      latestLlmLog: latestLlmLogSignal,
      llmHistory: llmHistorySignal,
      clearRawLlmHistory: vi.fn(() => {
        latestLlmLogSignal.set(null);
        llmHistorySignal.set([]);
      }),
    };

    await TestBed.configureTestingModule({
      imports: [RawMessages],
      providers: [
        provideNoopAnimations(),
        {
          provide: HostCommunication,
          useValue: hostCommMock,
        },
        {
          provide: ChatState,
          useValue: chatStateMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RawMessages);
    component = fixture.componentInstance;
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, RawMessagesHarness);
  });

  it('displays the placeholder initially when history is empty', async () => {
    expect(await harness.hasPlaceholder()).toBe(true);
    expect(await harness.getLoggedMessagesCount()).toBe(0);
  });

  it('accumulates received messages prepending the newest at index 0', async () => {
    const envelope1: MessageEnvelope = {
      type: 'FIRST_MSG',
      payload: {data: 1},
      origin: 'http://localhost:3000',
      timestamp: 1715940000000,
    };
    emitMessage(envelope1);
    fixture.detectChanges();

    expect(await harness.hasPlaceholder()).toBe(false);
    expect(await harness.getLoggedMessagesCount()).toBe(1);
    expect(await harness.getMessageTextAt(0)).toContain('FIRST_MSG');

    const envelope2: MessageEnvelope = {
      type: 'SECOND_MSG',
      payload: {data: 2},
      origin: 'http://localhost:3000',
      timestamp: 1715940005000,
    };
    emitMessage(envelope2);
    fixture.detectChanges();

    expect(await harness.getLoggedMessagesCount()).toBe(2);
    expect(await harness.getMessageTextAt(0)).toContain('SECOND_MSG');
    expect(await harness.getMessageTextAt(1)).toContain('FIRST_MSG');
  });

  it('ignores CONSOLE_LOG messages completely', async () => {
    emitMessage({
      type: PreviewBridgeMessageType.CONSOLE_LOG,
      payload: {msg: 'hello'},
      origin: 'http://localhost',
      timestamp: 1715940000000,
    });
    fixture.detectChanges();

    expect(await harness.getLoggedMessagesCount()).toBe(0);
    expect(await harness.hasPlaceholder()).toBe(true);
  });

  it('formats timestamps as HH:mm:ss.SSS correctly', async () => {
    const epoch = new Date();
    epoch.setHours(12);
    epoch.setMinutes(30);
    epoch.setSeconds(5);
    epoch.setMilliseconds(123);

    const envelope: MessageEnvelope = {
      type: 'TIME_TEST',
      origin: 'http://localhost:3000',
      timestamp: epoch.getTime(),
    };
    emitMessage(envelope);
    fixture.detectChanges();

    const formatted = await harness.getMessageTimestampAt(0);
    expect(formatted).toBe('12:30:05.123');
  });

  it('caps message history strictly at 100 entries', async () => {
    for (let i = 1; i <= 105; i++) {
      emitMessage({
        type: `MSG_${i}`,
        origin: 'http://localhost',
        timestamp: 1715940000000 + i * 1000,
      });
      fixture.detectChanges();
    }

    expect(await harness.getLoggedMessagesCount()).toBe(100);
    expect(await harness.getMessageTextAt(0)).toContain('MSG_105');
    expect(await harness.getMessageTextAt(99)).toContain('MSG_6');
  });

  it('clears logs when clearLogs() is invoked', async () => {
    emitMessage({
      type: 'TEST',
      origin: 'http://localhost',
      timestamp: Date.now(),
    });
    latestLlmLogSignal.set({
      type: LlmLogType.REQUEST,
      payload: {},
      timestamp: Date.now(),
    });
    fixture.detectChanges();
    expect(await harness.getLoggedMessagesCount()).toBe(2);

    component.clearLogs();
    fixture.detectChanges();

    expect(await harness.getLoggedMessagesCount()).toBe(0);
    expect(await harness.hasPlaceholder()).toBe(true);
    expect(chatStateMock.clearRawLlmHistory).toHaveBeenCalled();
  });

  it('forces container scroll-to-top on rendering new messages via afterRenderEffect', async () => {
    const containerEl = component.TEST_ONLY.logContainer()?.nativeElement;
    expect(containerEl).toBeDefined();

    if (containerEl) {
      const spy = vi.spyOn(containerEl, 'scrollTop', 'set');

      emitMessage({
        type: 'SCROLL_TEST',
        origin: 'http://localhost',
        timestamp: Date.now(),
      });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(spy).toHaveBeenCalledWith(0);
    }
  });

  it('seeds merged postMessage history and LLM history sorted chronologically descending', async () => {
    const pastEnvelopes: MessageEnvelope[] = [
      {
        type: 'POST_MSG_1',
        payload: {},
        origin: 'http://localhost',
        timestamp: 1000,
      },
      {
        type: 'POST_MSG_3',
        payload: {},
        origin: 'http://localhost',
        timestamp: 3000,
      },
    ];
    const pastLlmLogs: LlmLogEntry[] = [
      {
        type: LlmLogType.REQUEST,
        payload: {prompt: 'first prompt'},
        timestamp: 2000,
      },
      {
        type: LlmLogType.RESPONSE,
        payload: {response: 'second response'},
        timestamp: 4000,
      },
    ];

    vi.spyOn(hostCommMock, 'getHistoryBuffer').mockReturnValue(pastEnvelopes);
    llmHistorySignal.set(pastLlmLogs);

    // Recreate fixture to load constructor with both history collections
    fixture.destroy();
    const newFixture = TestBed.createComponent(RawMessages);
    newFixture.detectChanges();
    const newHarness = await TestbedHarnessEnvironment.harnessForFixture(
      newFixture,
      RawMessagesHarness,
    );

    expect(await newHarness.getLoggedMessagesCount()).toBe(4);
    // Expect descending order (newest first: timestamp 4000, 3000, 2000, 1000)
    expect(await newHarness.getMessageTextAt(0)).toContain('LLM_RESPONSE');
    expect(await newHarness.getMessageTextAt(1)).toContain('POST_MSG_3');
    expect(await newHarness.getMessageTextAt(2)).toContain('LLM_REQUEST');
    expect(await newHarness.getMessageTextAt(3)).toContain('POST_MSG_1');
  });

  it('filters out duplicate entries matching timestamp and type', async () => {
    emitMessage({
      type: 'TEST_DUPE',
      origin: 'http://localhost',
      timestamp: 12345,
    });
    fixture.detectChanges();

    emitMessage({
      type: 'TEST_DUPE',
      origin: 'http://localhost',
      timestamp: 12345,
    });
    fixture.detectChanges();

    expect(await harness.getLoggedMessagesCount()).toBe(1);
  });

  it('asserts RENDERER_READY is non-collapsible, while all other types are collapsible', async () => {
    emitMessage({
      type: PreviewBridgeMessageType.RENDERER_READY,
      payload: {},
      origin: 'http://localhost',
      timestamp: 1000,
    });
    emitMessage({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      payload: {},
      origin: 'http://localhost',
      timestamp: 2000,
    });
    emitMessage({
      type: PreviewBridgeMessageType.DATA_MODEL_CHANGE,
      payload: {},
      origin: 'http://localhost',
      timestamp: 3000,
    });
    latestLlmLogSignal.set({
      type: LlmLogType.REQUEST,
      payload: {},
      timestamp: 4000,
    });
    fixture.detectChanges();

    expect(await harness.getLoggedMessagesCount()).toBe(4);

    // Index 0 is request (collapsible/expansion panel)
    expect(await harness.isMessageCollapsibleAt(0)).toBe(true);
    expect(await harness.getMessageTextAt(0)).toContain(LlmLogType.REQUEST);

    // Index 1 is DATA_MODEL_CHANGE (collapsible/expansion panel)
    expect(await harness.isMessageCollapsibleAt(1)).toBe(true);
    expect(await harness.getMessageTextAt(1)).toContain(PreviewBridgeMessageType.DATA_MODEL_CHANGE);

    // Index 2 is A2UI_CATALOG (collapsible/expansion panel)
    expect(await harness.isMessageCollapsibleAt(2)).toBe(true);
    expect(await harness.getMessageTextAt(2)).toContain(PreviewBridgeMessageType.A2UI_CATALOG);

    // Index 3 is RENDERER_READY (non-collapsible/plain text envelope)
    expect(await harness.isMessageCollapsibleAt(3)).toBe(false);
    expect(await harness.getMessageTextAt(3)).toContain(PreviewBridgeMessageType.RENDERER_READY);
  });
});
