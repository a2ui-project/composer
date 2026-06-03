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
import {RenderedFrameComponent} from './rendered-frame.component';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {RenderedFrameHarness} from './test/rendered-frame.harness';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {StartupResolutionService} from '../../shell/startup-resolution.service';
import {HostCommunicationService} from '../../shell/host-communication.service';
import {ChatStateService, LlmLogEntry, LlmLogType} from '../../chat/chat-state/chat-state.service';
import {signal, WritableSignal} from '@angular/core';

class MockChatStateService {
  public readonly isProgrammaticStreamActive = signal<boolean>(false);
  public readonly latestLlmLog = signal<LlmLogEntry | null>(null);
  public readonly llmHistory = signal<LlmLogEntry[]>([]);
  public addRawLlmLog(type: LlmLogType, payload: unknown): void {
    const entry = {type, timestamp: Date.now(), payload};
    this.latestLlmLog.set(entry);
    this.llmHistory.update(h => [...h, entry].slice(-50));
  }
  public clearRawLlmHistory(): void {
    this.latestLlmLog.set(null);
    this.llmHistory.set([]);
  }
}

describe('RenderedFrameComponent Live Preview Viewport', () => {
  let fixture: ComponentFixture<RenderedFrameComponent>;
  let harness: RenderedFrameHarness;
  let startupResolutionServiceMock: Partial<StartupResolutionService>;
  let hostCommunicationServiceMock: Partial<HostCommunicationService>;
  let resolvedUrlSignal: WritableSignal<string | null>;
  let chatStateMock: MockChatStateService;

  beforeEach(async () => {
    resolvedUrlSignal = signal('http://localhost:3000/renderer');
    startupResolutionServiceMock = {
      resolvedUrl: resolvedUrlSignal,
    };

    hostCommunicationServiceMock = {
      registerIframe: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RenderedFrameComponent],
      providers: [
        {
          provide: StartupResolutionService,
          useValue: startupResolutionServiceMock,
        },
        {
          provide: HostCommunicationService,
          useValue: hostCommunicationServiceMock,
        },
        {
          provide: ChatStateService,
          useClass: MockChatStateService,
        },
      ],
    }).compileComponents();

    chatStateMock = TestBed.inject(ChatStateService) as unknown as MockChatStateService;
    fixture = TestBed.createComponent(RenderedFrameComponent);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, RenderedFrameHarness);
  });

  it('renders the iframe securely bound to the active renderer URL', async () => {
    expect(await harness.hasIframe()).toBe(true);
    expect(await harness.getIframeSrc()).toBe(
      'http://localhost:3000/renderer?origin=http%3A%2F%2Flocalhost%3A3000',
    );
  });

  it('registers the iframe contentWindow with HostCommunicationService upon view initialization', () => {
    expect(hostCommunicationServiceMock.registerIframe).toHaveBeenCalled();
  });

  it('renders a placeholder when no renderer URL is resolved', async () => {
    fixture.destroy();
    resolvedUrlSignal.set(null);
    const nullFixture = TestBed.createComponent(RenderedFrameComponent);
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
    const malformedFixture = TestBed.createComponent(RenderedFrameComponent);
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
    const relativeFixture = TestBed.createComponent(RenderedFrameComponent);
    relativeFixture.detectChanges();
    const relativeHarness = await TestbedHarnessEnvironment.harnessForFixture(
      relativeFixture,
      RenderedFrameHarness,
    );

    expect(await relativeHarness.hasIframe()).toBe(true);
    expect(await relativeHarness.getIframeSrc()).toBe(
      'http://localhost:3000/renderer?origin=http%3A%2F%2Flocalhost%3A3000',
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
