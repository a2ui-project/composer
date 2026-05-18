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
import {RawMessagesComponent} from './raw-messages.component';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {RawMessagesHarness} from './test/raw-messages.harness';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {HostCommunicationService, MessageEnvelope} from '../../shell/host-communication.service';
import {signal, WritableSignal} from '@angular/core';

describe('RawMessagesComponent', () => {
  let fixture: ComponentFixture<RawMessagesComponent>;
  let component: RawMessagesComponent;
  let harness: RawMessagesHarness;
  let messageStreamSignal: WritableSignal<MessageEnvelope | null>;
  let hostCommMock: Partial<HostCommunicationService>;

  beforeEach(async () => {
    messageStreamSignal = signal<MessageEnvelope | null>(null);
    hostCommMock = {
      messageStream: messageStreamSignal,
    };

    await TestBed.configureTestingModule({
      imports: [RawMessagesComponent],
      providers: [
        {
          provide: HostCommunicationService,
          useValue: hostCommMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RawMessagesComponent);
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
    messageStreamSignal.set(envelope1);
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
    messageStreamSignal.set(envelope2);
    fixture.detectChanges();

    expect(await harness.getLoggedMessagesCount()).toBe(2);
    expect(await harness.getMessageTextAt(0)).toContain('SECOND_MSG');
    expect(await harness.getMessageTextAt(1)).toContain('FIRST_MSG');
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
    messageStreamSignal.set(envelope);
    fixture.detectChanges();

    const formatted = await harness.getMessageTimestampAt(0);
    expect(formatted).toBe('12:30:05.123');
  });

  it('caps message history strictly at 100 entries', async () => {
    for (let i = 1; i <= 105; i++) {
      messageStreamSignal.set({
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
    messageStreamSignal.set({
      type: 'TEST',
      origin: 'http://localhost',
      timestamp: Date.now(),
    });
    fixture.detectChanges();
    expect(await harness.getLoggedMessagesCount()).toBe(1);

    component.clearLogs();
    fixture.detectChanges();

    expect(await harness.getLoggedMessagesCount()).toBe(0);
    expect(await harness.hasPlaceholder()).toBe(true);
  });

  it('forces container scroll-to-top on rendering new messages via afterRenderEffect', async () => {
    const containerEl = component.logContainer()?.nativeElement;
    expect(containerEl).toBeDefined();

    if (containerEl) {
      const spy = vi.spyOn(containerEl, 'scrollTop', 'set');

      messageStreamSignal.set({
        type: 'SCROLL_TEST',
        origin: 'http://localhost',
        timestamp: Date.now(),
      });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(spy).toHaveBeenCalledWith(0);
    }
  });
});
