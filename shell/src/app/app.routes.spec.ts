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
import {provideRouter, Router} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {signal} from '@angular/core';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {routes} from './app.routes';
import {StartupResolution} from './shell/startup-resolution';
import {ChatState} from './chat/chat-state/chat-state';
import {ChatCoordinator} from './chat/chat-service/chat-coordinator';
import {StateSync} from './chat/state-sync/state-sync';
import {AppConfigProvider, EnvMode, AuthType} from './settings/app-config-provider';
import {LlmClient} from './chat/llm-client/llm-client';
import {CatalogManagement} from './storage/catalog-management';
import {IndexedDbStorage} from './storage/indexed-db-storage';
import {LocalStorageInteractions} from './settings/local-storage-interactions';
import {PipelineStatus} from './chat/pipeline-status/pipeline-status';

class MockStartupResolution {
  public readonly resolvedUrl = signal('http://localhost:4200');
  public readonly isLockedContext = signal(false);
  public isEnvironmentValid = vi.fn().mockReturnValue(true);
  public isExtensionMode = vi.fn().mockReturnValue(false);
  public isContextLocked = vi.fn().mockReturnValue(false);
  public getResolvedRendererUrl = vi.fn().mockReturnValue('http://localhost:4200');
  public isThirdPartyEnvironment = vi.fn().mockReturnValue(false);
}

class MockChatState {
  public readonly chatHistory = signal([]);
  public readonly pipelineStatus = signal(PipelineStatus.IDLE);
  public readonly isProgrammaticStreamActive = signal(false);
  public readonly latestLlmLog = signal(null);
  public readonly llmHistory = signal([]);
}

class MockChatCoordinator {
  public readonly systemPrompt = signal('');
  public readonly pipelineStatus = signal(PipelineStatus.IDLE);
  public readonly isProgrammaticStreamActive = signal(false);
}

class MockStateSync {
  public readonly activeDraft = signal('{}');
  public updateDraft = vi.fn();
  public hydrateActiveDraft = vi.fn(() => '{}');
}

class MockAppConfigProvider {
  public readonly envMode = signal(EnvMode.STANDALONE);
  public readonly authType = signal(AuthType.ONE_PARTY);
  public readonly rendererUrl = signal('http://localhost:4200/renderer');
  public readonly geminiApiKey = signal('');
  public readonly themePreference = signal('light');
  public setThemePreference = vi.fn();
  public setGeminiApiKey = vi.fn();
  public setRendererUrl = vi.fn();
}

describe('App Routes Active Verification', () => {
  let harness: RouterTestingHarness;
  let router: Router;
  let mockStartupResolution: MockStartupResolution;

  beforeEach(async () => {
    mockStartupResolution = new MockStartupResolution();

    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideNoopAnimations(),
        {provide: StartupResolution, useValue: mockStartupResolution},
        {provide: ChatState, useClass: MockChatState},
        {provide: ChatCoordinator, useClass: MockChatCoordinator},
        {provide: StateSync, useClass: MockStateSync},
        {provide: AppConfigProvider, useClass: MockAppConfigProvider},
        {provide: LlmClient, useValue: {chat: vi.fn(), chatStream: vi.fn()}},
        {
          provide: CatalogManagement,
          useValue: {
            activeCatalogTitle: signal(''),
            activeCatalogDescription: signal(''),
            activeCatalog: signal(null),
            catalogError: signal(null),
            isHandshakeInProgress: signal(false),
            watchdogFired: signal(false),
            lastCatalogString: signal(''),
            lastChecksumHash: signal(''),
            catalogHashDelta: signal(false),
          },
        },
        {
          provide: IndexedDbStorage,
          useValue: {flushAllRecords: vi.fn().mockResolvedValue(undefined)},
        },
        {
          provide: LocalStorageInteractions,
          useValue: {removeItem: vi.fn(), getItem: vi.fn().mockReturnValue(null)},
        },
      ],
    }).compileComponents();

    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('activates root workspace dashboard pathway on valid environment', async () => {
    await harness.navigateByUrl('/');
    expect(router.url).toBe('/');
  });

  it('activates gallery pathway on gallery route navigation', async () => {
    await harness.navigateByUrl('/gallery');
    expect(router.url).toBe('/gallery');
  });

  it('redirects to settings view when environment evaluates as invalid', async () => {
    mockStartupResolution.isEnvironmentValid.mockReturnValue(false);
    await harness.navigateByUrl('/');
    expect(router.url).toBe('/settings');
  });

  it('redirects unknown wildcard pathways to root route', async () => {
    await harness.navigateByUrl('/unknown-wildcard-route');
    expect(router.url).toBe('/');
  });
});
