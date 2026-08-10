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
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {beforeEach, describe, expect, it} from 'vitest';
import {ThemePreference} from '../settings/app-config-provider/app-config-provider';
import {ComposerPanelId} from '../shell/composer-workspace/composer-panel-id';
import {NoopUsageTrackingService} from './noop-usage-tracking.service';
import {ApiKeyAction, PromptTurnType, ShareTrackingStatus} from './usage-tracking.service';

describe('NoopUsageTrackingService', () => {
  let service: NoopUsageTrackingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NoopUsageTrackingService],
    });
    service = TestBed.inject(NoopUsageTrackingService);
  });

  it('exposes a noop composerSessionId', () => {
    expect(service.composerSessionId).toBe('noop-session');
  });

  it('executes all tracking methods cleanly without side effects or errors', () => {
    expect(() => {
      service.initialize();
      service.resetSession();
      service.trackPageView({pagePath: '/test'});
      service.trackShareDesign({
        status: ShareTrackingStatus.SUCCESS,
        compressedLengthChars: 100,
      });
      service.trackSessionReset({totalPromptTurns: 3});
      service.trackThemeToggle({theme: ThemePreference.DARK});
      const promptId = service.trackChatPrompt({
        promptId: 'p1',
        catalogId: 'cat1',
        turnType: PromptTurnType.INITIAL,
        turnIndex: 0,
        attemptNumber: 1,
        hasScreenshot: false,
        attachmentCount: 0,
      });
      expect(promptId).toBe('p1');
      const retryId = service.trackChatRetry({
        promptId: 'p1',
        catalogId: 'cat1',
        turnIndex: 0,
        attemptNumber: 2,
      });
      expect(retryId).toBe('p1');
      service.trackChatCancel({
        promptId: 'p1',
        turnIndex: 0,
        pipelineStatus: 'streaming',
      });
      service.trackDebugTabView({panelId: ComposerPanelId.RawMessages});
      service.trackRawMessageExpanded({
        messageType: PreviewBridgeMessageType.CONSOLE_LOG,
      });
      service.trackDataModelEdit({isValidJson: true});
      service.trackJsonEditorEdit({isValidJson: true});
      service.trackGalleryView();
      service.trackGalleryComponentSelect({
        componentKey: 'button',
        category: 'basics',
      });
      service.trackGalleryCopyUsage({componentKey: 'button'});
      service.trackRendererSwitch({
        fromRendererId: 'lit',
        toRendererId: 'angular',
      });
      service.trackRendererAdd({rendererId: 'custom-1'});
      service.trackRendererEdit({rendererId: 'custom-1'});
      service.trackRendererDelete({rendererId: 'custom-1'});
      service.trackApiKeyUpdate({action: ApiKeyAction.SELECT});
    }).not.toThrow();
  });
});
