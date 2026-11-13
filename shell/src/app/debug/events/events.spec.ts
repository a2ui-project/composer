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
import {Events} from './events';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {EventsHarness} from './test/events.harness';
import {describe, it, expect, beforeEach} from 'vitest';
import {Subject} from 'rxjs';
import {
  HostCommunication,
  MessageEnvelope,
  SendToServerEnvelope,
} from '../../shell/host-communication/host-communication';
import type {
  V10CallAgentFunctionPayload,
  V10RendererFunctionResponsePayload,
} from '../../shell/cross-frame-validator/v1-0-wire-validator';
import {signal} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {PreviewBridgeMessageType} from 'a2ui-bridge';

import {PendingRpcRegistry} from './pending-rpc-registry';

type CallAgentFunctionEnvelope = SendToServerEnvelope & {
  payload: {callAgentFunction: V10CallAgentFunctionPayload};
};
type RendererFunctionResponseEnvelope = SendToServerEnvelope & {
  payload: {rendererFunctionResponse: V10RendererFunctionResponsePayload};
};

describe('Events', () => {
  let fixture: ComponentFixture<Events>;
  let harness: EventsHarness;
  let registry: PendingRpcRegistry;
  let mockMessageStream: ReturnType<typeof signal<MessageEnvelope | null>>;
  let mockHostComm: Partial<HostCommunication>;

  beforeEach(async () => {
    const messageStreamSubject = new Subject<MessageEnvelope>();
    const callAgentFunctionSubject = new Subject<CallAgentFunctionEnvelope>();
    const rendererFunctionResponseSubject = new Subject<RendererFunctionResponseEnvelope>();
    mockMessageStream = signal<MessageEnvelope | null>(null);
    const originalSet = mockMessageStream.set.bind(mockMessageStream);
    mockMessageStream.set = (val: MessageEnvelope | null) => {
      originalSet(val);
      if (val) {
        messageStreamSubject.next(val);
        if (val.type === PreviewBridgeMessageType.SEND_TO_SERVER && val.payload) {
          const p = val.payload as Record<string, unknown>;
          if (p['callAgentFunction']) {
            callAgentFunctionSubject.next(val as unknown as CallAgentFunctionEnvelope);
          }
          if (p['rendererFunctionResponse']) {
            rendererFunctionResponseSubject.next(
              val as unknown as RendererFunctionResponseEnvelope,
            );
          }
        }
      }
    };

    mockHostComm = {
      messageStream: mockMessageStream.asReadonly(),
      messageStream$: messageStreamSubject.asObservable(),
      callAgentFunction$: callAgentFunctionSubject.asObservable(),
      rendererFunctionResponse$: rendererFunctionResponseSubject.asObservable(),
      sendRenderA2UI: () => {},
      getEnvelopeHistory: () => [],
    };

    await TestBed.configureTestingModule({
      imports: [Events, MatTableModule],
      providers: [PendingRpcRegistry, {provide: HostCommunication, useValue: mockHostComm}],
    }).compileComponents();

    registry = TestBed.inject(PendingRpcRegistry);
    fixture = TestBed.createComponent(Events);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, EventsHarness);
  });

  it('creates the events component via test harness', async () => {
    expect(harness).toBeTruthy();
  });

  it('displays placeholder initially', async () => {
    expect(await harness.hasPlaceholder()).toBe(true);
    expect(await harness.getRowsCount()).toBe(0);
  });

  it('ignores irrelevant message types', async () => {
    mockMessageStream.set({
      type: 'SOME_OTHER_TYPE',
      payload: {action: {name: 'TestClick', timestamp: 1600000000000}},
      origin: 'http://localhost',
      timestamp: 1600000000000,
    });
    fixture.detectChanges();

    expect(await harness.hasPlaceholder()).toBe(true);
    expect(await harness.getRowsCount()).toBe(0);
  });

  it('processes and displays SEND_TO_SERVER actions correctly', async () => {
    const actionTimestamp = new Date('2026-05-18T12:30:05.123Z').getTime();
    mockMessageStream.set({
      type: PreviewBridgeMessageType.SEND_TO_SERVER,
      payload: {
        action: {
          name: 'test-action',
          surfaceId: 'test-surface',
          sourceComponentId: 'test-component',
          context: {key: 'val'},
          timestamp: actionTimestamp,
        },
      },
      origin: 'http://localhost',
      timestamp: Date.now(),
    });
    fixture.detectChanges();

    expect(await harness.hasPlaceholder()).toBe(false);
    expect(await harness.getRowsCount()).toBe(1);

    const row = await harness.getRowValuesAt(0);
    expect(row.time).toMatch(/\d{2}:\d{2}:\d{2}\.\d{3}/);
    expect(row.action).toBe('test-action');
    expect(row.surface).toBe('test-surface');
    expect(row.component).toBe('test-component');
    expect(JSON.parse(row.context)).toEqual({key: 'val'});
  });

  it('supports contextParameters and null context fallback mappings safely', async () => {
    // 1. Test contextParameters fallback
    mockMessageStream.set({
      type: PreviewBridgeMessageType.SEND_TO_SERVER,
      payload: {
        action: {
          name: 'action-fallback-1',
          surfaceId: 'surf-1',
          sourceComponent: 'comp-1',
          contextParameters: {param: 'value'},
        },
      },
      origin: 'http://localhost',
      timestamp: Date.now(),
    });
    fixture.detectChanges();

    let row = await harness.getRowValuesAt(0);
    expect(JSON.parse(row.context)).toEqual({param: 'value'});

    // 2. Test null context fallback
    mockMessageStream.set({
      type: PreviewBridgeMessageType.SEND_TO_SERVER,
      payload: {
        action: {
          name: 'action-fallback-2',
          surfaceId: 'surf-1',
          sourceComponent: 'comp-1',
        },
      },
      origin: 'http://localhost',
      timestamp: Date.now(),
    });
    fixture.detectChanges();

    row = await harness.getRowValuesAt(0);
    expect(row.context).toBe('null');
  });

  it('safely parses stringified action JSON payloads', async () => {
    mockMessageStream.set({
      type: PreviewBridgeMessageType.SEND_TO_SERVER,
      payload: {
        action: JSON.stringify({
          name: 'stringified-action',
          surfaceId: 'surf-string',
          sourceComponent: 'comp-string',
          context: {data: 'parsed'},
        }),
      },
      origin: 'http://localhost',
      timestamp: Date.now(),
    });
    fixture.detectChanges();

    const row = await harness.getRowValuesAt(0);
    expect(row.action).toBe('stringified-action');
    expect(row.surface).toBe('surf-string');
    expect(row.component).toBe('comp-string');
    expect(JSON.parse(row.context)).toEqual({data: 'parsed'});
  });

  it('ignores malformed SEND_TO_SERVER payloads gracefully without throwing', async () => {
    const initialCount = await harness.getRowsCount();

    // 1. Payload is null
    mockMessageStream.set({
      type: PreviewBridgeMessageType.SEND_TO_SERVER,
      payload: null,
      origin: 'http://localhost',
      timestamp: Date.now(),
    });
    fixture.detectChanges();
    expect(await harness.getRowsCount()).toBe(initialCount);

    // 2. Action is null
    mockMessageStream.set({
      type: PreviewBridgeMessageType.SEND_TO_SERVER,
      payload: {action: null},
      origin: 'http://localhost',
      timestamp: Date.now(),
    });
    fixture.detectChanges();
    expect(await harness.getRowsCount()).toBe(initialCount);

    // 3. Action is non-parseable string
    mockMessageStream.set({
      type: PreviewBridgeMessageType.SEND_TO_SERVER,
      payload: {action: 'not-a-json-string'},
      origin: 'http://localhost',
      timestamp: Date.now(),
    });
    fixture.detectChanges();
    expect(await harness.getRowsCount()).toBe(initialCount);
  });

  it('prepends newer events at index 0', async () => {
    mockMessageStream.set({
      type: PreviewBridgeMessageType.SEND_TO_SERVER,
      payload: {
        action: {
          name: 'action-1',
          surfaceId: 'surf-1',
          sourceComponent: 'comp-1',
          timestamp: Date.now(),
        },
      },
      origin: 'http://localhost',
      timestamp: Date.now(),
    });
    fixture.detectChanges();

    mockMessageStream.set({
      type: PreviewBridgeMessageType.SEND_TO_SERVER,
      payload: {
        action: {
          name: 'action-2',
          surfaceId: 'surf-2',
          sourceComponent: 'comp-2',
          timestamp: Date.now(),
        },
      },
      origin: 'http://localhost',
      timestamp: Date.now() + 1,
    });
    fixture.detectChanges();

    expect(await harness.getRowsCount()).toBe(2);
    const row0 = await harness.getRowValuesAt(0);
    expect(row0.action).toBe('action-2');
    const row1 = await harness.getRowValuesAt(1);
    expect(row1.action).toBe('action-1');
  });

  it('caps history at 100 entries strictly', async () => {
    for (let i = 0; i < 120; i++) {
      mockMessageStream.set({
        type: PreviewBridgeMessageType.SEND_TO_SERVER,
        payload: {
          action: {
            name: `action-${i}`,
            surfaceId: 'surf',
            sourceComponent: 'comp',
            timestamp: Date.now() + i,
          },
        },
        origin: 'http://localhost',
        timestamp: Date.now() + i,
      });
      fixture.detectChanges();
    }

    expect(await harness.getRowsCount()).toBe(100);
    const newestRow = await harness.getRowValuesAt(0);
    expect(newestRow.action).toBe('action-119');
    const oldestRow = await harness.getRowValuesAt(99);
    expect(oldestRow.action).toBe('action-20');
  });

  it('clears logs and restores placeholder on clearLogs()', async () => {
    mockMessageStream.set({
      type: PreviewBridgeMessageType.SEND_TO_SERVER,
      payload: {
        action: {
          name: 'some-action',
          timestamp: Date.now(),
        },
      },
      origin: 'http://localhost',
      timestamp: Date.now(),
    });
    fixture.detectChanges();

    expect(await harness.getRowsCount()).toBe(1);

    fixture.componentInstance.clearLogs();
    fixture.detectChanges();

    expect(await harness.getRowsCount()).toBe(0);
    expect(await harness.hasPlaceholder()).toBe(true);
  });

  it('hydrates eventsLog with pre-existing SEND_TO_SERVER events from HostCommunication.getEnvelopeHistory()', async () => {
    const historicalTimestamp1 = new Date('2026-05-18T10:00:00.000Z').getTime();
    const historicalTimestamp2 = new Date('2026-05-18T10:05:00.000Z').getTime();

    const historicalEnvelopes: MessageEnvelope[] = [
      {
        type: PreviewBridgeMessageType.SEND_TO_SERVER,
        payload: {
          action: {
            name: 'action-first',
            surfaceId: 'surf-first',
            sourceComponentId: 'comp-first',
            context: {step: 1},
            timestamp: historicalTimestamp1,
          },
        },
        origin: 'http://localhost',
        timestamp: historicalTimestamp1,
      },
      {
        type: PreviewBridgeMessageType.CONSOLE_LOG,
        payload: {level: 'warn', message: 'Warning log'},
        origin: 'http://localhost',
        timestamp: historicalTimestamp1 + 1000,
      },
      {
        type: PreviewBridgeMessageType.SEND_TO_SERVER,
        payload: {
          action: {
            name: 'action-second',
            surfaceId: 'surf-second',
            sourceComponentId: 'comp-second',
            context: {step: 2},
            timestamp: historicalTimestamp2,
          },
        },
        origin: 'http://localhost',
        timestamp: historicalTimestamp2,
      },
    ];

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [Events, MatTableModule],
      providers: [
        {
          provide: HostCommunication,
          useValue: {
            messageStream: signal<MessageEnvelope | null>(null).asReadonly(),
            messageStream$: new Subject<MessageEnvelope>().asObservable(),
            getEnvelopeHistory: () => historicalEnvelopes,
          },
        },
      ],
    }).compileComponents();

    const hydratedFixture = TestBed.createComponent(Events);
    hydratedFixture.detectChanges();
    const hydratedHarness = await TestbedHarnessEnvironment.harnessForFixture(
      hydratedFixture,
      EventsHarness,
    );

    expect(await hydratedHarness.hasPlaceholder()).toBe(false);
    expect(await hydratedHarness.getRowsCount()).toBe(2);

    const row0 = await hydratedHarness.getRowValuesAt(0);
    expect(row0.action).toBe('action-second');
    expect(row0.surface).toBe('surf-second');
    expect(row0.component).toBe('comp-second');
    expect(JSON.parse(row0.context)).toEqual({step: 2});

    const row1 = await hydratedHarness.getRowValuesAt(1);
    expect(row1.action).toBe('action-first');
    expect(row1.surface).toBe('surf-first');
    expect(row1.component).toBe('comp-first');
    expect(JSON.parse(row1.context)).toEqual({step: 1});
  });

  it('captures and displays callAgentFunction from registered frame with RpcReplyForm', async () => {
    const dummyWindow = {} as Window;
    registry.registerFrame(dummyWindow);

    mockMessageStream.set({
      type: PreviewBridgeMessageType.SEND_TO_SERVER,
      payload: {
        callAgentFunction: {
          surfaceId: 'surf-1',
          functionCallId: 'call-abc',
          callFunction: {
            ['@call']: 'submitForm',
            ['@args']: {name: 'Alice'},
          },
        },
      },
      origin: 'http://localhost',
      timestamp: Date.now(),
      sourceWindow: dummyWindow,
    });
    fixture.detectChanges();

    expect(await harness.hasPlaceholder()).toBe(false);
    expect(await harness.getRowsCount()).toBe(1);

    const row = await harness.getRowValuesAt(0);
    expect(row.action).toContain('submitForm');
    expect(row.surface).toBe('surf-1');

    const form = await harness.getRpcReplyFormAt(0);
    expect(form).not.toBeNull();
    expect(await form!.isPending()).toBe(true);

    await form!.setValueInput('{"status": "ok"}');
    await form!.clickReplyValue();
    fixture.detectChanges();

    expect(registry.getRpc('call-abc')?.status).toBe('replied');
    expect(await form!.getStatusBadge()).toBe('Replied');
  });

  it('ignores callAgentFunction from unregistered window', async () => {
    const otherWindow = {} as Window;

    mockMessageStream.set({
      type: PreviewBridgeMessageType.SEND_TO_SERVER,
      payload: {
        callAgentFunction: {
          surfaceId: 'surf-1',
          functionCallId: 'call-unregistered',
          callFunction: {['@call']: 'unregisteredFunc'},
        },
      },
      origin: 'http://localhost',
      timestamp: Date.now(),
      sourceWindow: otherWindow,
    });
    fixture.detectChanges();

    expect(await harness.getRowsCount()).toBe(0);
    expect(await harness.hasPlaceholder()).toBe(true);
  });

  it('captures and displays rendererFunctionResponse events', async () => {
    mockMessageStream.set({
      type: PreviewBridgeMessageType.SEND_TO_SERVER,
      payload: {
        rendererFunctionResponse: {
          surfaceId: 'surf-renderer',
          functionCallId: 'func-123',
          result: {success: true},
        },
      },
      origin: 'http://localhost',
      timestamp: Date.now(),
    });
    fixture.detectChanges();

    expect(await harness.getRowsCount()).toBe(1);
    const row = await harness.getRowValuesAt(0);
    expect(row.action).toBe('rendererFunctionResponse');
    expect(row.surface).toBe('surf-renderer');
    expect(JSON.parse(row.context)).toEqual({success: true});
  });

  it('evicts pending RPC and cancels timer when rows exceed 100', async () => {
    const dummyWindow = {} as Window;
    registry.registerFrame(dummyWindow);

    mockMessageStream.set({
      type: PreviewBridgeMessageType.SEND_TO_SERVER,
      payload: {
        callAgentFunction: {
          surfaceId: 'surf-evict',
          functionCallId: 'call-to-evict',
          callFunction: {['@call']: 'evictMe'},
        },
      },
      origin: 'http://localhost',
      timestamp: Date.now(),
      sourceWindow: dummyWindow,
    });
    fixture.detectChanges();

    expect(registry.getRpc('call-to-evict')?.status).toBe('pending');

    for (let i = 0; i < 100; i++) {
      mockMessageStream.set({
        type: PreviewBridgeMessageType.SEND_TO_SERVER,
        payload: {
          action: {
            name: `action-push-${i}`,
            timestamp: Date.now() + i + 1,
          },
        },
        origin: 'http://localhost',
        timestamp: Date.now() + i + 1,
      });
      fixture.detectChanges();
    }

    expect(await harness.getRowsCount()).toBe(100);
    expect(registry.getRpc('call-to-evict')).toBeUndefined();
  });

  it('cancels all pending RPCs when clearLogs() is called', async () => {
    const dummyWindow = {} as Window;
    registry.registerFrame(dummyWindow);

    mockMessageStream.set({
      type: PreviewBridgeMessageType.SEND_TO_SERVER,
      payload: {
        callAgentFunction: {
          surfaceId: 'surf-1',
          functionCallId: 'call-clear',
          callFunction: {['@call']: 'clearMe'},
        },
      },
      origin: 'http://localhost',
      timestamp: Date.now(),
      sourceWindow: dummyWindow,
    });
    fixture.detectChanges();

    expect(registry.getRpc('call-clear')?.status).toBe('pending');

    fixture.componentInstance.clearLogs();
    fixture.detectChanges();

    expect(await harness.getRowsCount()).toBe(0);
    expect(registry.getRpc('call-clear')).toBeUndefined();
  });

  it('hydrates eventsLog with historical callAgentFunction and rendererFunctionResponse envelopes', async () => {
    const dummyWindow = {} as Window;
    const historicalTime = Date.now() - 5000;

    const historicalEnvelopes: MessageEnvelope[] = [
      {
        type: PreviewBridgeMessageType.SEND_TO_SERVER,
        payload: {
          callAgentFunction: {
            surfaceId: 'surf-hist',
            functionCallId: 'hist-rpc-1',
            callFunction: {['@call']: 'historicalCall'},
          },
        },
        origin: 'http://localhost',
        timestamp: historicalTime,
        sourceWindow: dummyWindow,
      },
      {
        type: PreviewBridgeMessageType.SEND_TO_SERVER,
        payload: {
          rendererFunctionResponse: {
            surfaceId: 'surf-hist',
            functionCallId: 'hist-func-2',
            result: {hydrated: true},
          },
        },
        origin: 'http://localhost',
        timestamp: historicalTime + 1000,
      },
    ];

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [Events, MatTableModule],
      providers: [
        PendingRpcRegistry,
        {
          provide: HostCommunication,
          useValue: {
            messageStream: signal<MessageEnvelope | null>(null).asReadonly(),
            messageStream$: new Subject<MessageEnvelope>().asObservable(),
            sendRenderA2UI: () => {},
            getEnvelopeHistory: () => historicalEnvelopes,
          },
        },
      ],
    }).compileComponents();

    const localRegistry = TestBed.inject(PendingRpcRegistry);
    localRegistry.registerFrame(dummyWindow);

    const hydratedFixture = TestBed.createComponent(Events);
    hydratedFixture.detectChanges();
    const hydratedHarness = await TestbedHarnessEnvironment.harnessForFixture(
      hydratedFixture,
      EventsHarness,
    );

    expect(await hydratedHarness.getRowsCount()).toBe(2);
    const row0 = await hydratedHarness.getRowValuesAt(0);
    expect(row0.action).toBe('rendererFunctionResponse');

    const row1 = await hydratedHarness.getRowValuesAt(1);
    expect(row1.action).toContain('historicalCall');
    const form = await hydratedHarness.getRpcReplyFormAt(1);
    expect(form).not.toBeNull();
  });
});
