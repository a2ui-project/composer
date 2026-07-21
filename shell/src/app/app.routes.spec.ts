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
import {Component, signal} from '@angular/core';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {routes} from './app.routes';
import {ComposerWorkspace} from './shell/composer-workspace/composer-workspace';
import {CopilotSidebar} from './copilotkit/copilot-sidebar/copilot-sidebar';
import {StartupResolution} from './shell/startup-resolution/startup-resolution';
import {ChatState} from './chat/chat-state/chat-state';
import {ChatCoordinator} from './chat/chat-service/chat-coordinator';
import {StateSync} from './chat/state-sync/state-sync';
import {
  AppConfigProvider,
  EnvMode,
  AuthType,
  ThemePreference,
} from './settings/app-config-provider/app-config-provider';
import {LlmClient} from './chat/llm-client/llm-client';
import {CatalogManagement} from './storage/catalog-management/catalog-management';
import {IndexedDbStorage} from './storage/indexed-db-storage/indexed-db-storage';
import {LocalStorageInteractions} from './storage/local-storage-interactions/local-storage-interactions';
import {PipelineStatus} from './chat/pipeline-status/pipeline-status';

/**
 * Stubs the docked sidebar so routing into the workspace does not require the
 * CopilotKit runtime (COPILOT_KIT_CONFIG) — this suite verifies routing only.
 */
@Component({
  selector: 'a2ui-composer-copilot-sidebar',
  standalone: true,
  template: '',
})
class CopilotSidebarStub {}

class MockStartupResolution {
  readonly resolvedUrl = signal('http://localhost:4200');
  readonly isLockedContext = signal(false);
  isEnvironmentValid = vi.fn().mockReturnValue(true);
  isExtensionMode = vi.fn().mockReturnValue(false);
  isContextLocked = vi.fn().mockReturnValue(false);
  getResolvedRendererUrl = vi.fn().mockReturnValue('http://localhost:4200');
  isThirdPartyEnvironment = vi.fn().mockReturnValue(false);
}

class MockChatState {
  readonly chatHistory = signal<unknown[]>([]);
  readonly pipelineStatus = signal(PipelineStatus.IDLE);
  readonly isProgrammaticStreamActive = signal(false);
  readonly latestLlmLog = signal<unknown>(null);
  readonly llmHistory = signal<unknown[]>([]);
}

class MockChatCoordinator {
  readonly systemPrompt = signal('');
  readonly pipelineStatus = signal(PipelineStatus.IDLE);
  readonly isProgrammaticStreamActive = signal(false);
}

class MockStateSync {
  readonly activeDraft = signal('{}');
  updateDraft = vi.fn();
  hydrateActiveDraft = vi.fn(() => '{}');
}

class MockAppConfigProvider {
  readonly envMode = signal(EnvMode.STANDALONE);
  readonly authType = signal(AuthType.FIRST_PARTY);
  readonly rendererUrl = signal('http://localhost:4200/renderer');
  readonly geminiApiKey = signal('');
  readonly themePreference = signal<ThemePreference>(ThemePreference.LIGHT);
  readonly includeScreenshot = signal<boolean>(true);
  setThemePreference = vi.fn();
  setGeminiApiKey = vi.fn();
  setRendererUrl = vi.fn();
  setIncludeScreenshot = vi.fn((include: boolean) => {
    this.includeScreenshot.set(include);
  });
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
    })
      .overrideComponent(ComposerWorkspace, {
        remove: {imports: [CopilotSidebar]},
        add: {imports: [CopilotSidebarStub]},
      })
      .compileComponents();

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
