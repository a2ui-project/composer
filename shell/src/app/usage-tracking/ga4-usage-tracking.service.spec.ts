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

import {DOCUMENT} from '@angular/common';
import {signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  AppConfigProvider,
  EnvMode,
  ThemePreference,
} from '../settings/app-config-provider/app-config-provider';
import {ComposerPanelId} from '../shell/composer-workspace/composer-panel-id';
import {StartupResolution} from '../shell/startup-resolution/startup-resolution';
import {StartupConfigStateService} from '../shell/startup-resolution/state/startup-config-state.service';
import {CatalogManagement} from '../storage/catalog-management/catalog-management';
import {Ga4UsageTrackingService} from './ga4-usage-tracking.service';
import {
  ApiKeyAction,
  PromptTurnType,
  ShareTrackingStatus,
  UsageType,
  USAGE_TRACKING_CONFIG,
} from './usage-tracking.service';

describe('Ga4UsageTrackingService', () => {
  let service: Ga4UsageTrackingService;
  let mockWindow: {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  };
  let mockDocument: Partial<Document>;

  const mockStartupResolution = {
    isThirdPartyEnvironment: signal(false),
    selectedRendererId: signal('lit'),
  };

  const mockStartupConfigState = {
    selectedRendererId: signal('lit'),
  };

  const mockAppConfigProvider = {
    envMode: signal(EnvMode.STANDALONE),
  };

  const mockCatalogManagement = {
    activeCatalog: signal({catalogId: 'basic-catalog', title: 'Basic Catalog'}),
  };

  beforeEach(() => {
    mockWindow = {
      dataLayer: [],
      gtag: vi.fn((...args: unknown[]) => {
        mockWindow.dataLayer.push(args);
      }),
    };

    mockDocument = {
      defaultView: mockWindow as unknown as Window,
      querySelector: vi.fn().mockReturnValue(null),
      createElement: vi.fn().mockImplementation((tag: string) => document.createElement(tag)),
      head: {
        appendChild: vi.fn(),
      } as unknown as HTMLHeadElement,
    };

    TestBed.configureTestingModule({
      providers: [
        Ga4UsageTrackingService,
        {
          provide: USAGE_TRACKING_CONFIG,
          useValue: {enabled: true, measurementId: 'G-TEST1234'},
        },
        {provide: StartupResolution, useValue: mockStartupResolution},
        {provide: StartupConfigStateService, useValue: mockStartupConfigState},
        {provide: AppConfigProvider, useValue: mockAppConfigProvider},
        {provide: CatalogManagement, useValue: mockCatalogManagement},
        {provide: DOCUMENT, useValue: mockDocument},
      ],
    });

    service = TestBed.inject(Ga4UsageTrackingService);
  });

  it('initializes gtag dataLayer and appends script tag when enabled', () => {
    service.initialize();
    expect(mockWindow.dataLayer.length).toBeGreaterThanOrEqual(1);
    expect(mockDocument.head?.appendChild).toHaveBeenCalled();
  });

  it('creates fallback gtag function when undefined', () => {
    delete mockWindow.gtag;
    mockWindow.dataLayer = [];
    service.initialize();
    expect(mockWindow.gtag).toBeDefined();

    // Call the newly created fallback function
    mockWindow.gtag!('event', 'test_event', {key: 'value'});

    // Convert arguments to array for easy assertion
    const lastPushed = Array.from(
      mockWindow.dataLayer[mockWindow.dataLayer.length - 1] as ArrayLike<unknown>,
    );
    expect(lastPushed).toEqual(['event', 'test_event', {key: 'value'}]);
  });

  it('does not dispatch events when tracking is disabled', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        Ga4UsageTrackingService,
        {
          provide: USAGE_TRACKING_CONFIG,
          useValue: {enabled: false, measurementId: ''},
        },
        {provide: StartupResolution, useValue: mockStartupResolution},
        {provide: StartupConfigStateService, useValue: mockStartupConfigState},
        {provide: AppConfigProvider, useValue: mockAppConfigProvider},
        {provide: CatalogManagement, useValue: mockCatalogManagement},
        {provide: DOCUMENT, useValue: mockDocument},
      ],
    });
    const disabledService = TestBed.inject(Ga4UsageTrackingService);
    disabledService.trackPageView({pagePath: '/test'});
    expect(mockWindow.gtag).not.toHaveBeenCalled();
  });

  it('resets session uuid when resetSession is called', () => {
    const initialSession = service.composerSessionId;
    service.resetSession();
    expect(service.composerSessionId).not.toBe(initialSession);
  });

  it('tracks page view event with baseline dimensions', () => {
    service.trackPageView({pagePath: '/chat'});
    expect(mockWindow.gtag).toHaveBeenCalledWith(
      'event',
      'page_view',
      expect.objectContaining({
        composer_session_id: service.composerSessionId,
        usage_type: UsageType.FIRST_PARTY,
        env_mode: EnvMode.STANDALONE,
        active_renderer_id: 'lit',
        catalog_id: 'basic-catalog',
        page_path: '/chat',
      }),
    );
  });

  it('tracks share design event', () => {
    service.trackShareDesign({
      status: ShareTrackingStatus.SUCCESS,
      compressedLengthChars: 120,
    });
    expect(mockWindow.gtag).toHaveBeenCalledWith(
      'event',
      'share_design',
      expect.objectContaining({
        status: ShareTrackingStatus.SUCCESS,
        compressed_length_chars: 120,
      }),
    );
  });

  it('tracks session reset event', () => {
    service.trackSessionReset({totalPromptTurns: 4});
    expect(mockWindow.gtag).toHaveBeenCalledWith(
      'event',
      'session_reset',
      expect.objectContaining({
        total_prompt_turns: 4,
      }),
    );
  });

  it('tracks theme toggle event', () => {
    service.trackThemeToggle({theme: ThemePreference.DARK});
    expect(mockWindow.gtag).toHaveBeenCalledWith(
      'event',
      'theme_toggle',
      expect.objectContaining({
        theme: ThemePreference.DARK,
      }),
    );
  });

  it('tracks chat prompt event and returns resolved promptId', () => {
    const returnedId = service.trackChatPrompt({
      promptId: 'prompt-1',
      catalogId: 'basic-catalog',
      turnType: PromptTurnType.INITIAL,
      turnIndex: 0,
      attemptNumber: 1,
      hasScreenshot: true,
      attachmentCount: 2,
    });
    expect(returnedId).toBe('prompt-1');
    expect(mockWindow.gtag).toHaveBeenCalledWith(
      'event',
      'chat_prompt',
      expect.objectContaining({
        prompt_id: 'prompt-1',
        catalog_id: 'basic-catalog',
        turn_type: PromptTurnType.INITIAL,
        turn_index: 0,
        attempt_number: 1,
        has_screenshot: true,
        attachment_count: 2,
      }),
    );
  });

  it('generates promptId if omitted in trackChatPrompt', () => {
    const returnedId = service.trackChatPrompt({
      catalogId: 'basic-catalog',
      turnType: PromptTurnType.FOLLOWUP,
      turnIndex: 1,
      attemptNumber: 1,
      hasScreenshot: false,
      attachmentCount: 0,
    });
    expect(returnedId).toBeTruthy();
    expect(mockWindow.gtag).toHaveBeenCalledWith(
      'event',
      'chat_prompt',
      expect.objectContaining({
        prompt_id: returnedId,
        turn_type: PromptTurnType.FOLLOWUP,
      }),
    );
  });

  it('tracks chat retry event and includes retry_of_prompt_id if provided', () => {
    const returnedId = service.trackChatRetry({
      promptId: 'retry-prompt-1',
      catalogId: 'basic-catalog',
      turnIndex: 0,
      attemptNumber: 2,
      retryOfPromptId: 'parent-prompt-1',
    });
    expect(returnedId).toBe('retry-prompt-1');
    expect(mockWindow.gtag).toHaveBeenCalledWith(
      'event',
      'chat_prompt_retry',
      expect.objectContaining({
        prompt_id: 'retry-prompt-1',
        catalog_id: 'basic-catalog',
        turn_index: 0,
        attempt_number: 2,
        retry_of_prompt_id: 'parent-prompt-1',
      }),
    );
  });

  it('generates promptId if omitted in trackChatRetry', () => {
    const returnedId = service.trackChatRetry({
      catalogId: 'basic-catalog',
      turnIndex: 1,
      attemptNumber: 2,
    });
    expect(returnedId).toBeTruthy();
    expect(mockWindow.gtag).toHaveBeenCalledWith(
      'event',
      'chat_prompt_retry',
      expect.objectContaining({
        prompt_id: returnedId,
        turn_index: 1,
      }),
    );
  });

  it('tracks chat cancel event', () => {
    service.trackChatCancel({
      promptId: 'prompt-1',
      turnIndex: 0,
      pipelineStatus: 'streaming',
    });
    expect(mockWindow.gtag).toHaveBeenCalledWith(
      'event',
      'chat_prompt_cancel',
      expect.objectContaining({
        prompt_id: 'prompt-1',
        turn_index: 0,
        pipeline_status_at_cancel: 'streaming',
      }),
    );
  });

  it('tracks debug tab view event', () => {
    service.trackDebugTabView({panelId: ComposerPanelId.RawMessages});
    expect(mockWindow.gtag).toHaveBeenCalledWith(
      'event',
      'debug_tab_view',
      expect.objectContaining({tab_id: ComposerPanelId.RawMessages}),
    );
  });

  it('tracks raw message expanded event', () => {
    service.trackRawMessageExpanded({
      messageType: PreviewBridgeMessageType.CONSOLE_LOG,
    });
    expect(mockWindow.gtag).toHaveBeenCalledWith(
      'event',
      'raw_message_expanded',
      expect.objectContaining({
        message_type: PreviewBridgeMessageType.CONSOLE_LOG,
      }),
    );
  });

  it('tracks data model edit event', () => {
    service.trackDataModelEdit({isValidJson: true});
    expect(mockWindow.gtag).toHaveBeenCalledWith(
      'event',
      'data_model_edit',
      expect.objectContaining({is_valid_json: true}),
    );
  });

  it('tracks json editor edit event', () => {
    service.trackJsonEditorEdit({isValidJson: false});
    expect(mockWindow.gtag).toHaveBeenCalledWith(
      'event',
      'json_editor_edit',
      expect.objectContaining({is_valid_json: false}),
    );
  });

  it('tracks gallery view event', () => {
    service.trackGalleryView();
    expect(mockWindow.gtag).toHaveBeenCalledWith(
      'event',
      'gallery_view',
      expect.objectContaining({catalog_id: 'basic-catalog'}),
    );
  });

  it('tracks gallery component select event', () => {
    service.trackGalleryComponentSelect({
      componentKey: 'button',
      category: 'actions',
    });
    expect(mockWindow.gtag).toHaveBeenCalledWith(
      'event',
      'gallery_component_select',
      expect.objectContaining({
        component_key: 'button',
        category: 'actions',
      }),
    );
  });

  it('tracks gallery copy usage event', () => {
    service.trackGalleryCopyUsage({
      componentKey: 'button',
    });
    expect(mockWindow.gtag).toHaveBeenCalledWith(
      'event',
      'gallery_copy_usage',
      expect.objectContaining({
        component_key: 'button',
      }),
    );
  });

  it('tracks renderer switch event', () => {
    service.trackRendererSwitch({
      fromRendererId: 'lit',
      toRendererId: 'angular',
    });
    expect(mockWindow.gtag).toHaveBeenCalledWith(
      'event',
      'renderer_switch',
      expect.objectContaining({
        from_renderer_id: 'lit',
        to_renderer_id: 'angular',
      }),
    );
  });

  it('tracks renderer add event', () => {
    service.trackRendererAdd({rendererId: 'custom-r'});
    expect(mockWindow.gtag).toHaveBeenCalledWith(
      'event',
      'renderer_add',
      expect.objectContaining({renderer_id: 'custom-r'}),
    );
  });

  it('tracks renderer edit event', () => {
    service.trackRendererEdit({rendererId: 'custom-r'});
    expect(mockWindow.gtag).toHaveBeenCalledWith(
      'event',
      'renderer_edit',
      expect.objectContaining({renderer_id: 'custom-r'}),
    );
  });

  it('tracks renderer delete event', () => {
    service.trackRendererDelete({rendererId: 'custom-r'});
    expect(mockWindow.gtag).toHaveBeenCalledWith(
      'event',
      'renderer_delete',
      expect.objectContaining({renderer_id: 'custom-r'}),
    );
  });

  it('tracks api key update event', () => {
    service.trackApiKeyUpdate({action: ApiKeyAction.SELECT});
    expect(mockWindow.gtag).toHaveBeenCalledWith(
      'event',
      'api_key_update',
      expect.objectContaining({
        action: ApiKeyAction.SELECT,
      }),
    );
  });

  it('dispatches conversation_view event', () => {
    service.trackConversationView();
    expect(mockWindow.gtag).toHaveBeenCalledWith(
      'event',
      'conversation_view',
      expect.objectContaining({
        catalog_id: 'basic-catalog',
      }),
    );
  });

  it('dispatches conversation_session_end event with expected variables', () => {
    service.trackConversationSessionEnd({
      durationSeconds: 15.5,
      interfaceCount: 3,
    });
    expect(mockWindow.gtag).toHaveBeenCalledWith(
      'event',
      'conversation_session_end',
      expect.objectContaining({
        duration_seconds: 15.5,
        interface_count: 3,
      }),
    );
  });
});
