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
import {Errors} from './errors';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ErrorsHarness} from './test/errors.harness';
import {describe, it, expect, beforeEach} from 'vitest';
import {
  HostCommunication,
  MessageEnvelope,
} from '../../shell/host-communication/host-communication';
import {signal} from '@angular/core';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {MatTableModule} from '@angular/material/table';
import {PreviewBridgeMessageType} from 'a2ui-bridge';

describe('Errors', () => {
  let fixture: ComponentFixture<Errors>;
  let harness: ErrorsHarness;
  let mockMessageStream: ReturnType<typeof signal<MessageEnvelope | null>>;
  let mockHostComm: Partial<HostCommunication>;

  beforeEach(async () => {
    mockMessageStream = signal<MessageEnvelope | null>(null);
    mockHostComm = {
      messageStream: mockMessageStream.asReadonly(),
    };

    await TestBed.configureTestingModule({
      imports: [Errors, MatTableModule],
      providers: [provideNoopAnimations(), {provide: HostCommunication, useValue: mockHostComm}],
    }).compileComponents();

    fixture = TestBed.createComponent(Errors);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, ErrorsHarness);
  });

  it('creates the errors component via test harness', async () => {
    expect(harness).toBeTruthy();
  });

  it('displays placeholder initially', async () => {
    expect(await harness.hasPlaceholder()).toBe(true);
    expect(await harness.getRowsCount()).toBe(0);
  });

  it('ignores irrelevant message types', async () => {
    mockMessageStream.set({
      type: 'SOME_OTHER_TYPE',
      payload: {level: 'error', message: 'Ignored error'},
      origin: 'http://localhost',
      timestamp: Date.now(),
    });
    fixture.detectChanges();

    expect(await harness.hasPlaceholder()).toBe(true);
    expect(await harness.getRowsCount()).toBe(0);
  });

  it('processes CONSOLE_LOG error level messages and maps console source correctly', async () => {
    mockMessageStream.set({
      type: PreviewBridgeMessageType.CONSOLE_LOG,
      payload: {
        level: 'error',
        message: 'Simple console error message',
      },
      origin: 'http://localhost',
      timestamp: Date.now(),
    });
    fixture.detectChanges();

    expect(await harness.hasPlaceholder()).toBe(false);
    expect(await harness.getRowsCount()).toBe(1);

    const row = await harness.getRowValuesAt(0);
    expect(row.time).toMatch(/\d{2}:\d{2}:\d{2}\.\d{3}/);
    expect(row.source).toBe('console');
    expect(row.message).toContain('Simple console error message');
  });

  it('maps console error containing exception markers as exception source', async () => {
    // 1. Check stack presence
    mockMessageStream.set({
      type: PreviewBridgeMessageType.CONSOLE_LOG,
      payload: {
        level: 'error',
        message: 'Error occurred',
        stack: 'Error\n  at main.ts:10:5',
      },
      origin: 'http://localhost',
      timestamp: Date.now(),
    });
    fixture.detectChanges();

    let row = await harness.getRowValuesAt(0);
    expect(row.source).toBe('exception');

    // 2. Check Uncaught marker
    mockMessageStream.set({
      type: PreviewBridgeMessageType.CONSOLE_LOG,
      payload: {
        level: 'error',
        message: 'Uncaught TypeError: Cannot read property',
      },
      origin: 'http://localhost',
      timestamp: Date.now(),
    });
    fixture.detectChanges();

    row = await harness.getRowValuesAt(0);
    expect(row.source).toBe('exception');
  });

  it('processes DATA_MODEL_CHANGE non-empty validation errors correctly', async () => {
    // 1. Check non-empty validation errors array
    mockMessageStream.set({
      type: PreviewBridgeMessageType.DATA_MODEL_CHANGE,
      payload: {
        validationErrors: ['Missing required field title', 'Invalid surface id'],
      },
      origin: 'http://localhost',
      timestamp: Date.now(),
    });
    fixture.detectChanges();

    expect(await harness.hasPlaceholder()).toBe(false);
    expect(await harness.getRowsCount()).toBe(1);

    let row = await harness.getRowValuesAt(0);
    expect(row.source).toBe('validation');
    expect(row.message).toBe('Missing required field title, Invalid surface id');

    // 2. Check validation errors object
    mockMessageStream.set({
      type: PreviewBridgeMessageType.DATA_MODEL_CHANGE,
      payload: {
        validationErrors: {field: 'required'},
      },
      origin: 'http://localhost',
      timestamp: Date.now(),
    });
    fixture.detectChanges();

    row = await harness.getRowValuesAt(0);
    expect(row.source).toBe('validation');
    expect(JSON.parse(row.message)).toEqual({field: 'required'});
  });

  it('ignores empty or null validationErrors payloads gracefully', async () => {
    mockMessageStream.set({
      type: PreviewBridgeMessageType.DATA_MODEL_CHANGE,
      payload: {
        validationErrors: [],
      },
      origin: 'http://localhost',
      timestamp: Date.now(),
    });
    fixture.detectChanges();

    expect(await harness.getRowsCount()).toBe(0);
    expect(await harness.hasPlaceholder()).toBe(true);
  });

  it('prepends newer errors at index 0', async () => {
    mockMessageStream.set({
      type: PreviewBridgeMessageType.CONSOLE_LOG,
      payload: {
        level: 'error',
        message: 'Error 1',
      },
      origin: 'http://localhost',
      timestamp: Date.now(),
    });
    fixture.detectChanges();

    mockMessageStream.set({
      type: PreviewBridgeMessageType.CONSOLE_LOG,
      payload: {
        level: 'error',
        message: 'Error 2',
      },
      origin: 'http://localhost',
      timestamp: Date.now() + 1,
    });
    fixture.detectChanges();

    expect(await harness.getRowsCount()).toBe(2);
    const row0 = await harness.getRowValuesAt(0);
    expect(row0.message).toContain('Error 2');
    const row1 = await harness.getRowValuesAt(1);
    expect(row1.message).toContain('Error 1');
  });

  it('caps history at 100 entries strictly', async () => {
    for (let i = 0; i < 120; i++) {
      mockMessageStream.set({
        type: PreviewBridgeMessageType.CONSOLE_LOG,
        payload: {
          level: 'error',
          message: `Error-${i}`,
        },
        origin: 'http://localhost',
        timestamp: Date.now() + i,
      });
      fixture.detectChanges();
    }

    expect(await harness.getRowsCount()).toBe(100);
    const newestRow = await harness.getRowValuesAt(0);
    expect(newestRow.message).toContain('Error-119');
    const oldestRow = await harness.getRowValuesAt(99);
    expect(oldestRow.message).toContain('Error-20');
  });

  it('handles collapsible stack trace traces correctly', async () => {
    mockMessageStream.set({
      type: PreviewBridgeMessageType.CONSOLE_LOG,
      payload: {
        level: 'error',
        message: 'Exception with stack',
        stack: 'Stack trace details here\n  at file.ts:10',
      },
      origin: 'http://localhost',
      timestamp: Date.now(),
    });
    fixture.detectChanges();

    expect(await harness.getRowsCount()).toBe(1);

    // Toggle stack trace expansion:
    await harness.toggleStackAt(0);
    fixture.detectChanges();

    const stackText = await harness.getStackTextAt(0);
    expect(stackText).toContain('Stack trace details here');
    expect(stackText).toContain('at file.ts:10');

    // Toggle again to collapse
    await harness.toggleStackAt(0);
    fixture.detectChanges();
  });

  it('clears logs and resets expanded rows cleanly on clearLogs()', async () => {
    mockMessageStream.set({
      type: PreviewBridgeMessageType.CONSOLE_LOG,
      payload: {
        level: 'error',
        message: 'Clean error',
        stack: 'stack trace',
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
    expect(fixture.componentInstance.expandedRows().size).toBe(0);
  });
});
