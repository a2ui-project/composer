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

import {signal} from '@angular/core';
import {TestBed, ComponentFixture} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {StartupResolution} from '../../shell/startup-resolution/startup-resolution';
import {HostCommunication} from '../../shell/host-communication/host-communication';
import {
  AppConfigProvider,
  ThemePreference,
} from '../../settings/app-config-provider/app-config-provider';
import {ChatState} from '../../chat/chat-state/chat-state';
import {A2aChatHistory} from './chat-history';
import {A2aChatHistoryHarness} from './test/chat-history.harness';

describe('A2aChatHistory', () => {
  let fixture: ComponentFixture<A2aChatHistory>;
  let harness: A2aChatHistoryHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [A2aChatHistory],
      providers: [
        {
          provide: StartupResolution,
          useValue: {resolvedUrl: signal('http://localhost:3000/renderer')},
        },
        {
          provide: HostCommunication,
          useValue: {
            registerIframe: vi.fn(),
            unregisterIframe: vi.fn(),
            sendTheme: vi.fn(),
            sendRenderA2UI: vi.fn(),
            messageStream: signal(null),
          },
        },
        {
          provide: AppConfigProvider,
          useValue: {themePreference: signal(ThemePreference.LIGHT)},
        },
        {
          provide: ChatState,
          useValue: {isProgrammaticStreamActive: signal(false)},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(A2aChatHistory);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, A2aChatHistoryHarness);
  });

  it('renders connecting state when isConnecting is true', async () => {
    fixture.componentRef.setInput('isConnecting', true);
    fixture.componentRef.setInput('endpoint', 'http://localhost:8088');
    fixture.detectChanges();

    expect(await harness.isConnecting()).toBe(true);
    expect(await harness.hasWelcomeShowcase()).toBe(false);
  });

  it('renders welcome showcase when messages are empty and not connecting', async () => {
    fixture.componentRef.setInput('isConnecting', false);
    fixture.componentRef.setInput('agentInfo', {
      name: 'Weather Agent',
      description: 'Test description',
      skills: [{id: 's1', name: 'Forecast'}],
      endpoint: 'http://localhost:8080',
    });
    fixture.detectChanges();

    expect(await harness.hasWelcomeShowcase()).toBe(true);
    expect(await harness.getShowcaseTitleText()).toBe('Weather Agent');
    expect(await harness.getCapabilityCount()).toBeGreaterThanOrEqual(2); // Streaming + A2UI + skills
  });

  it('renders messages list when messages are provided', async () => {
    fixture.componentRef.setInput('messages', [
      {
        id: '1',
        sender: 'user',
        text: 'Hello',
        timestamp: Date.now(),
      },
      {
        id: '2',
        sender: 'agent',
        text: 'Hi user',
        timestamp: Date.now(),
      },
    ]);
    fixture.detectChanges();

    expect(await harness.hasWelcomeShowcase()).toBe(false);
    expect(await harness.getMessageCount()).toBe(2);
  });

  it('scrolls to bottom on update if shouldAutoScroll is true', () => {
    const el = fixture.componentInstance['scrollContainerRef']()?.nativeElement;
    if (el) {
      Object.defineProperty(el, 'scrollHeight', {value: 1000, configurable: true});
      Object.defineProperty(el, 'clientHeight', {value: 400, configurable: true});
      el.scrollTop = 950;
      fixture.componentInstance['handleViewportScroll']();
      fixture.componentInstance.ngAfterViewChecked();
      expect(el.scrollTop).toBe(1000);
    }
  });

  it('disables shouldAutoScroll when user scrolls upward via wheel event', () => {
    fixture.componentInstance['shouldAutoScroll'] = true;
    const wheelEvent = new WheelEvent('wheel', {deltaY: -50});
    fixture.componentInstance['handleWheel'](wheelEvent);
    expect(fixture.componentInstance['shouldAutoScroll']).toBe(false);
  });

  it('disables shouldAutoScroll on touchstart', () => {
    fixture.componentInstance['shouldAutoScroll'] = true;
    fixture.componentInstance['handleTouchStart']();
    expect(fixture.componentInstance['shouldAutoScroll']).toBe(false);
  });

  it('disables shouldAutoScroll when viewport scroll moves upward', () => {
    const el = fixture.componentInstance['scrollContainerRef']()?.nativeElement;
    if (el) {
      Object.defineProperty(el, 'scrollHeight', {value: 2000, configurable: true});
      Object.defineProperty(el, 'clientHeight', {value: 400, configurable: true});

      // User was at bottom
      el.scrollTop = 1600;
      fixture.componentInstance['handleViewportScroll']();
      expect(fixture.componentInstance['shouldAutoScroll']).toBe(true);

      // User scrolls up by 50px
      el.scrollTop = 1550;
      fixture.componentInstance['handleViewportScroll']();
      expect(fixture.componentInstance['shouldAutoScroll']).toBe(false);
    }
  });
});
