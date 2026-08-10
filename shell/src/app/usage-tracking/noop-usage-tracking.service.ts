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

import {Injectable} from '@angular/core';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {ThemePreference} from '../settings/app-config-provider/app-config-provider';
import {ComposerPanelId} from '../shell/composer-workspace/composer-panel-id';
import {
  ApiKeyAction,
  PromptTurnType,
  ShareTrackingStatus,
  UsageTrackingService,
} from './usage-tracking.service';
import {generateUuid} from '../utils/uuid';

/**
 * No-op implementation of UsageTrackingService used when tracking is disabled or in unit tests.
 */
@Injectable({
  providedIn: 'root',
})
export class NoopUsageTrackingService extends UsageTrackingService {
  readonly composerSessionId = 'noop-session';

  initialize(): void {}

  resetSession(): void {}

  trackPageView(_params: {pagePath: string}): void {}

  trackShareDesign(_params: {status: ShareTrackingStatus; compressedLengthChars: number}): void {}

  trackSessionReset(_params: {totalPromptTurns: number}): void {}

  trackThemeToggle(_params: {theme: ThemePreference}): void {}

  trackChatPrompt(params: {
    promptId?: string;
    catalogId: string;
    turnType: PromptTurnType;
    turnIndex: number;
    attemptNumber: number;
    hasScreenshot: boolean;
    attachmentCount: number;
  }): string {
    return params.promptId || generateUuid();
  }

  trackChatRetry(params: {
    promptId?: string;
    catalogId: string;
    turnIndex: number;
    attemptNumber: number;
    retryOfPromptId?: string;
  }): string {
    return params.promptId || generateUuid();
  }

  trackChatCancel(_params: {promptId: string; turnIndex: number; pipelineStatus: string}): void {}

  trackDebugTabView(_params: {panelId: ComposerPanelId}): void {}

  trackRawMessageExpanded(_params: {messageType: PreviewBridgeMessageType | string}): void {}

  trackDataModelEdit(_params: {isValidJson: boolean}): void {}

  trackJsonEditorEdit(_params: {isValidJson: boolean}): void {}

  trackGalleryView(): void {}

  trackGalleryComponentSelect(_params: {componentKey: string; category: string}): void {}

  trackGalleryCopyUsage(_params: {componentKey: string}): void {}

  trackRendererSwitch(_params: {fromRendererId: string | null; toRendererId: string}): void {}

  trackRendererAdd(_params: {rendererId: string}): void {}

  trackRendererEdit(_params: {rendererId: string}): void {}

  trackRendererDelete(_params: {rendererId: string}): void {}

  trackApiKeyUpdate(_params: {action: ApiKeyAction}): void {}
}
