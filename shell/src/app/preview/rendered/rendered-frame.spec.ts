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
import {RenderedFrame} from './rendered-frame';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {RenderedFrameHarness} from './test/rendered-frame.harness';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {StartupResolution} from '../../shell/startup-resolution/startup-resolution';
import {HostCommunication} from '../../shell/host-communication/host-communication';
import {AppConfigProvider} from '../../settings/app-config-provider/app-config-provider';
import {ChatState, LlmLogEntry, LlmLogType} from '../../chat/chat-state/chat-state';
import {signal, WritableSignal} from '@angular/core';

class MockChatState {
  readonly isProgrammaticStreamActive = signal<boolean>(false);
  readonly latestLlmLog = signal<LlmLogEntry | null>(null);
  readonly llmHistory = signal<LlmLogEntry[]>([]);
  addRawLlmLog(type: LlmLogType, payload: unknown): void {
    const entry = {type, timestamp: Date.now(), payload};
    this.latestLlmLog.set(entry);
    this.llmHistory.update(h => [...h, entry].slice(-50));
  }
  clearRawLlmHistory(): void {
    this.latestLlmLog.set(null);
    this.llmHistory.set([]);
  }
}

describe('RenderedFrame Live Preview Viewport', () => {
  let fixture: ComponentFixture<RenderedFrame>;
  let harness: RenderedFrameHarness;
  let startupResolutionServiceMock: Partial<StartupResolution>;
  let hostCommunicationServiceMock: Partial<HostCommunication>;
  let resolvedUrlSignal: WritableSignal<string | null>;
  let themePreferenceSignal: WritableSignal<'light' | 'dark'>;
  let chatStateMock: MockChatState;

  beforeEach(async () => {
    resolvedUrlSignal = signal('http://localhost:3000/renderer');
    themePreferenceSignal = signal<'light' | 'dark'>('light');
    startupResolutionServiceMock = {
      resolvedUrl: resolvedUrlSignal,
    };

    hostCommunicationServiceMock = {
      registerIframeElement: vi.fn(),
      registerIframe: vi.fn(),
      sendTheme: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RenderedFrame],
      providers: [
        {
          provide: StartupResolution,
          useValue: startupResolutionServiceMock,
        },
        {
          provide: HostCommunication,
          useValue: hostCommunicationServiceMock,
        },
        {
          provide: AppConfigProvider,
          useValue: {
            themePreference: themePreferenceSignal,
          },
        },
        {
          provide: ChatState,
          useClass: MockChatState,
        },
      ],
    }).compileComponents();

    chatStateMock = TestBed.inject(ChatState) as unknown as MockChatState;
    fixture = TestBed.createComponent(RenderedFrame);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, RenderedFrameHarness);
  });

  it('renders the iframe securely bound to the active renderer URL', async () => {
    expect(await harness.hasIframe()).toBe(true);
    expect(await harness.getIframeSrc()).toBe(
      'http://localhost:3000/renderer?origin=http%3A%2F%2Flocalhost%3A3000&theme=light',
    );
  });

  it('registers the iframe element with HostCommunication upon view initialization', () => {
    expect(hostCommunicationServiceMock.registerIframeElement).toHaveBeenCalled();
  });

  it('dispatches sendTheme via hostCommunication when theme preference changes without reloading iframe URL', async () => {
    expect(hostCommunicationServiceMock.sendTheme).toHaveBeenCalledWith('light');
    const initialSrc = await harness.getIframeSrc();

    themePreferenceSignal.set('dark');
    fixture.detectChanges();

    expect(hostCommunicationServiceMock.sendTheme).toHaveBeenCalledWith('dark');
    expect(await harness.getIframeSrc()).toBe(initialSrc);
  });

  it('renders a placeholder when no renderer URL is resolved', async () => {
    fixture.destroy();
    resolvedUrlSignal.set(null);
    const nullFixture = TestBed.createComponent(RenderedFrame);
    nullFixture.detectChanges();
    const nullHarness = await TestbedHarnessEnvironment.harnessForFixture(
      nullFixture,
      RenderedFrameHarness,
    );

    expect(await nullHarness.hasIframe()).toBe(false);
  });

  it('renders a placeholder when the renderer URL is malformed and fails parsing', async () => {
    fixture.destroy();
    resolvedUrlSignal.set('http://[invalid]');
    const malformedFixture = TestBed.createComponent(RenderedFrame);
    malformedFixture.detectChanges();
    const malformedHarness = await TestbedHarnessEnvironment.harnessForFixture(
      malformedFixture,
      RenderedFrameHarness,
    );

    expect(await malformedHarness.hasIframe()).toBe(false);
  });

  it('correctly handles relative renderer URLs and appends the origin', async () => {
    fixture.destroy();
    resolvedUrlSignal.set('/renderer');
    const relativeFixture = TestBed.createComponent(RenderedFrame);
    relativeFixture.detectChanges();
    const relativeHarness = await TestbedHarnessEnvironment.harnessForFixture(
      relativeFixture,
      RenderedFrameHarness,
    );

    expect(await relativeHarness.hasIframe()).toBe(true);
    expect(await relativeHarness.getIframeSrc()).toBe(
      'http://localhost:3000/renderer?origin=http%3A%2F%2Flocalhost%3A3000&theme=light',
    );
  });

  it('visually locks manual preview visual click dispatches during active model stream turns', async () => {
    expect(await harness.isLocked()).toBe(false);

    // Lock active stream
    chatStateMock.isProgrammaticStreamActive.set(true);
    fixture.detectChanges();
    expect(await harness.isLocked()).toBe(true);

    // Release lock
    chatStateMock.isProgrammaticStreamActive.set(false);
    fixture.detectChanges();
    expect(await harness.isLocked()).toBe(false);
  });
});
