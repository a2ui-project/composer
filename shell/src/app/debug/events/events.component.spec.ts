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
import {EventsComponent} from './events.component';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {EventsHarness} from './test/events.harness';
import {describe, it, expect, beforeEach} from 'vitest';
import {HostCommunicationService, MessageEnvelope} from '../../shell/host-communication.service';
import {signal} from '@angular/core';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {MatTableModule} from '@angular/material/table';
import {PreviewBridgeMessageType} from 'a2ui-bridge';

describe('EventsComponent', () => {
  let fixture: ComponentFixture<EventsComponent>;
  let harness: EventsHarness;
  let mockMessageStream: ReturnType<typeof signal<MessageEnvelope | null>>;
  let mockHostCommService: any;

  beforeEach(async () => {
    mockMessageStream = signal<MessageEnvelope | null>(null);
    mockHostCommService = {
      messageStream: mockMessageStream,
    };

    await TestBed.configureTestingModule({
      imports: [EventsComponent, MatTableModule],
      providers: [
        provideNoopAnimations(),
        {provide: HostCommunicationService, useValue: mockHostCommService},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventsComponent);
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
});
