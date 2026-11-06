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
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {RpcReplyForm} from './rpc-reply-form';
import {RpcReplyFormHarness} from './test/rpc-reply-form.harness';
import {PendingRpcRegistry, PendingRpcEntry} from '../pending-rpc-registry';
import {HostCommunication} from '../../../shell/host-communication/host-communication';

describe('RpcReplyForm', () => {
  let fixture: ComponentFixture<RpcReplyForm>;
  let harness: RpcReplyFormHarness;
  let registry: PendingRpcRegistry;
  let mockHostComm: {
    sendRenderA2UI: ReturnType<typeof vi.fn>;
  };
  let dummyWindow: Window;
  let mockEntry: PendingRpcEntry;

  beforeEach(async () => {
    vi.useFakeTimers();
    dummyWindow = {} as Window;
    mockHostComm = {
      sendRenderA2UI: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RpcReplyForm],
      providers: [PendingRpcRegistry, {provide: HostCommunication, useValue: mockHostComm}],
    }).compileComponents();

    registry = TestBed.inject(PendingRpcRegistry);
    registry.registerFrame(dummyWindow);

    mockEntry = registry.registerRpc({
      functionCallId: 'rpc-test-1',
      surfaceId: 'surface-alpha',
      callFunction: {['@call']: 'calculateTotal', ['@args']: {amount: 100}},
      sourceWindow: dummyWindow,
    });

    fixture = TestBed.createComponent(RpcReplyForm);
    fixture.componentRef.setInput('rpc', mockEntry);
    fixture.detectChanges();

    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, RpcReplyFormHarness);
  });

  afterEach(() => {
    registry.ngOnDestroy();
    vi.useRealTimers();
  });

  it('renders pending form with remaining countdown', async () => {
    expect(await harness.isPending()).toBe(true);
    const timeText = await harness.getRemainingTime();
    expect(timeText).toContain('30');

    vi.advanceTimersByTime(10000);
    fixture.detectChanges();
    const updatedTimeText = await harness.getRemainingTime();
    expect(updatedTimeText).toContain('20');
  });

  it('calculates remaining countdown accurately when initialized with an offset', async () => {
    const startedAt = Date.now() - 15000;
    const offsetEntry = registry.registerRpc({
      functionCallId: 'rpc-offset-1',
      surfaceId: 'surface-offset',
      callFunction: {['@call']: 'delayedCall'},
      sourceWindow: dummyWindow,
      startedAtMs: startedAt,
    });

    const offsetFixture = TestBed.createComponent(RpcReplyForm);
    offsetFixture.componentRef.setInput('rpc', offsetEntry);
    offsetFixture.detectChanges();

    const offsetHarness = await TestbedHarnessEnvironment.harnessForFixture(
      offsetFixture,
      RpcReplyFormHarness,
    );

    const timeText = await offsetHarness.getRemainingTime();
    expect(timeText).toContain('15');
  });

  it('submits valid JSON object via Reply Value', async () => {
    await harness.setValueInput('{"status": "ok", "total": 123}');
    await harness.clickReplyValue();
    fixture.detectChanges();

    expect(registry.getRpc('rpc-test-1')?.status).toBe('replied');
    expect(mockHostComm.sendRenderA2UI).toHaveBeenCalledWith(
      [
        {
          version: '1.0',
          agentFunctionResponse: {
            functionCallId: 'rpc-test-1',
            value: {status: 'ok', total: 123},
          },
        },
      ],
      dummyWindow,
    );

    const badge = await harness.getStatusBadge();
    expect(badge).toBe('Replied');
    expect(await harness.isPending()).toBe(false);
  });

  it('submits plain text string when not starting with { or [', async () => {
    await harness.setValueInput('plain string response');
    await harness.clickReplyValue();
    fixture.detectChanges();

    expect(registry.getRpc('rpc-test-1')?.status).toBe('replied');
    expect(mockHostComm.sendRenderA2UI).toHaveBeenCalledWith(
      [
        {
          version: '1.0',
          agentFunctionResponse: {
            functionCallId: 'rpc-test-1',
            value: 'plain string response',
          },
        },
      ],
      dummyWindow,
    );
  });

  it('submits JSON primitives (numbers, booleans, null)', async () => {
    await harness.setValueInput('42');
    await harness.clickReplyValue();
    fixture.detectChanges();

    expect(mockHostComm.sendRenderA2UI).toHaveBeenCalledWith(
      [
        {
          version: '1.0',
          agentFunctionResponse: {
            functionCallId: 'rpc-test-1',
            value: 42,
          },
        },
      ],
      dummyWindow,
    );
  });

  it('blocks submission and shows validation error for malformed JSON starting with { or [', async () => {
    await harness.setValueInput('{ broken json');
    await harness.clickReplyValue();
    fixture.detectChanges();

    expect(await harness.getValidationError()).toBeTruthy();
    expect(registry.getRpc('rpc-test-1')?.status).toBe('pending');
    expect(mockHostComm.sendRenderA2UI).not.toHaveBeenCalled();

    await harness.setValueInput('[ broken array');
    await harness.clickReplyValue();
    fixture.detectChanges();

    expect(await harness.getValidationError()).toBeTruthy();
    expect(mockHostComm.sendRenderA2UI).not.toHaveBeenCalled();

    await harness.setValueInput('"unterminated string');
    await harness.clickReplyValue();
    fixture.detectChanges();

    expect(await harness.getValidationError()).toContain('Malformed JSON:');
    expect(registry.getRpc('rpc-test-1')?.status).toBe('pending');
    expect(mockHostComm.sendRenderA2UI).not.toHaveBeenCalled();
  });

  it('submits error code and message via Reply Error', async () => {
    await harness.setErrorCode('CUSTOM_DENIED');
    await harness.setErrorMessage('Not permitted');
    await harness.clickReplyError();
    fixture.detectChanges();

    expect(registry.getRpc('rpc-test-1')?.status).toBe('rejected');
    expect(mockHostComm.sendRenderA2UI).toHaveBeenCalledWith(
      [
        {
          version: '1.0',
          agentFunctionResponse: {
            functionCallId: 'rpc-test-1',
            error: {
              code: 'CUSTOM_DENIED',
              message: 'Not permitted',
            },
          },
        },
      ],
      dummyWindow,
    );

    const badge = await harness.getStatusBadge();
    expect(badge).toBe('Rejected');
    expect(await harness.isPending()).toBe(false);
  });

  it('displays Timed out badge when RPC reaches 30s deadline', async () => {
    expect(await harness.isPending()).toBe(true);

    vi.advanceTimersByTime(30000);
    fixture.detectChanges();

    expect(registry.getRpc('rpc-test-1')?.status).toBe('timed_out');
    const badge = await harness.getStatusBadge();
    expect(badge).toBe('Timed out');
    expect(await harness.isPending()).toBe(false);
  });
});
