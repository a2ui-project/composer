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
import {Injectable, inject} from '@angular/core';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {trustedResourceUrl} from 'safevalues';
import {setScriptSrc} from 'safevalues/dom';
import {
  AppConfigProvider,
  ThemePreference,
} from '../settings/app-config-provider/app-config-provider';
import {ComposerPanelId} from '../shell/composer-workspace/composer-panel-id';
import {StartupResolution} from '../shell/startup-resolution/startup-resolution';
import {StartupConfigStateService} from '../shell/startup-resolution/state/startup-config-state.service';
import {CatalogManagement} from '../storage/catalog-management/catalog-management';
import {
  ApiKeyAction,
  PromptTurnType,
  ShareTrackingStatus,
  UsageType,
  USAGE_TRACKING_CONFIG,
  UsageTrackingService,
} from './usage-tracking.service';
import {generateUuid} from '../utils/uuid';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Google Analytics 4 implementation of UsageTrackingService with safe script injection
 * and baseline dimensions enrichment.
 */
@Injectable({
  providedIn: 'root',
})
export class Ga4UsageTrackingService extends UsageTrackingService {
  private readonly config = inject(USAGE_TRACKING_CONFIG);
  private readonly startupResolution = inject(StartupResolution);
  private readonly startupConfigState = inject(StartupConfigStateService);
  private readonly appConfigProvider = inject(AppConfigProvider);
  private readonly catalogManagement = inject(CatalogManagement);
  private readonly document = inject(DOCUMENT);

  private _composerSessionId: string = generateUuid();

  get composerSessionId(): string {
    return this._composerSessionId;
  }

  resetSession(): void {
    this._composerSessionId = generateUuid();
  }

  initialize(): void {
    if (!this.config.enabled || !this.config.measurementId) {
      return;
    }

    const windowObj = this.document.defaultView;
    if (!windowObj) {
      return;
    }

    windowObj.dataLayer = windowObj.dataLayer || [];
    if (!windowObj.gtag) {
      windowObj.gtag = function () {
        // eslint-disable-next-line prefer-rest-params
        windowObj.dataLayer?.push(arguments);
      };
    }

    windowObj.gtag('js', new Date());
    windowObj.gtag('config', this.config.measurementId, this.getConfigOptions());

    const existingScript = this.document.querySelector(
      `script[src*="${this.config.measurementId}"]`,
    );
    if (!existingScript && this.document.head) {
      const script = this.document.createElement('script');
      script.async = true;
      const safeUrl = trustedResourceUrl`https://www.googletagmanager.com/gtag/js?id=${this.config.measurementId}`;
      setScriptSrc(script, safeUrl);
      this.document.head.appendChild(script);
    }
  }

  protected getConfigOptions(): Record<string, unknown> {
    return {
      ['send_page_view']: false,
    };
  }

  protected getBaselineDimensions(): Record<string, unknown> {
    const is3P = this.startupResolution.isThirdPartyEnvironment();
    const activeRendererId = this.startupConfigState.selectedRendererId() || 'default';
    const catalogObj = this.catalogManagement.activeCatalog();
    const catalogId = catalogObj ? catalogObj.catalogId || catalogObj.$id || '' : '';
    return {
      ['send_to']: this.config.measurementId,
      ['composer_session_id']: this._composerSessionId,
      ['usage_type']: is3P ? UsageType.THIRD_PARTY : UsageType.FIRST_PARTY,
      ['env_mode']: this.appConfigProvider.envMode(),
      ['active_renderer_id']: activeRendererId,
      ['catalog_id']: catalogId,
    };
  }

  private dispatchGtagEvent(name: string, params?: Record<string, unknown>): void {
    if (!this.config.enabled || !this.config.measurementId) {
      return;
    }

    const windowObj = this.document.defaultView;
    if (!windowObj || !windowObj.gtag) {
      return;
    }

    const payload = {
      ...this.getBaselineDimensions(),
      ...(params || {}),
    };

    windowObj.gtag('event', name, payload);
  }

  trackPageView(params: {pagePath: string}): void {
    this.dispatchGtagEvent('page_view', {
      ['page_path']: params.pagePath,
    });
  }

  trackShareDesign(params: {status: ShareTrackingStatus; compressedLengthChars: number}): void {
    this.dispatchGtagEvent('share_design', {
      ['status']: params.status,
      ['compressed_length_chars']: params.compressedLengthChars,
    });
  }

  trackSessionReset(params: {totalPromptTurns: number}): void {
    this.dispatchGtagEvent('session_reset', {
      ['total_prompt_turns']: params.totalPromptTurns,
    });
  }

  trackThemeToggle(params: {theme: ThemePreference}): void {
    this.dispatchGtagEvent('theme_toggle', {
      ['theme']: params.theme,
    });
  }

  trackChatPrompt(params: {
    promptId?: string;
    catalogId: string;
    turnType: PromptTurnType;
    turnIndex: number;
    attemptNumber: number;
    hasScreenshot: boolean;
    attachmentCount: number;
  }): string {
    const promptId = params.promptId || generateUuid();
    this.dispatchGtagEvent('chat_prompt', {
      ['prompt_id']: promptId,
      ['catalog_id']: params.catalogId,
      ['turn_type']: params.turnType,
      ['turn_index']: params.turnIndex,
      ['attempt_number']: params.attemptNumber,
      ['has_screenshot']: params.hasScreenshot,
      ['attachment_count']: params.attachmentCount,
    });
    return promptId;
  }

  trackChatRetry(params: {
    promptId?: string;
    catalogId: string;
    turnIndex: number;
    attemptNumber: number;
    retryOfPromptId?: string;
  }): string {
    const promptId = params.promptId || generateUuid();
    this.dispatchGtagEvent('chat_prompt_retry', {
      ['prompt_id']: promptId,
      ['catalog_id']: params.catalogId,
      ['turn_index']: params.turnIndex,
      ['attempt_number']: params.attemptNumber,
      ...(params.retryOfPromptId ? {['retry_of_prompt_id']: params.retryOfPromptId} : {}),
    });
    return promptId;
  }

  trackChatCancel(params: {promptId: string; turnIndex: number; pipelineStatus: string}): void {
    this.dispatchGtagEvent('chat_prompt_cancel', {
      ['prompt_id']: params.promptId,
      ['turn_index']: params.turnIndex,
      ['pipeline_status_at_cancel']: params.pipelineStatus,
    });
  }

  trackDebugTabView(params: {panelId: ComposerPanelId}): void {
    this.dispatchGtagEvent('debug_tab_view', {
      ['tab_id']: params.panelId,
    });
  }

  trackRawMessageExpanded(params: {messageType: PreviewBridgeMessageType | string}): void {
    this.dispatchGtagEvent('raw_message_expanded', {
      ['message_type']: params.messageType,
    });
  }

  trackDataModelEdit(params: {isValidJson: boolean}): void {
    this.dispatchGtagEvent('data_model_edit', {
      ['is_valid_json']: params.isValidJson,
    });
  }

  trackJsonEditorEdit(params: {isValidJson: boolean}): void {
    this.dispatchGtagEvent('json_editor_edit', {
      ['is_valid_json']: params.isValidJson,
    });
  }

  trackGalleryView(): void {
    this.dispatchGtagEvent('gallery_view');
  }

  trackGalleryComponentSelect(params: {componentKey: string; category: string}): void {
    this.dispatchGtagEvent('gallery_component_select', {
      ['component_key']: params.componentKey,
      ['category']: params.category,
    });
  }

  trackGalleryCopyUsage(params: {componentKey: string}): void {
    this.dispatchGtagEvent('gallery_copy_usage', {
      ['component_key']: params.componentKey,
    });
  }

  trackRendererSwitch(params: {fromRendererId: string | null; toRendererId: string}): void {
    this.dispatchGtagEvent('renderer_switch', {
      ['from_renderer_id']: params.fromRendererId,
      ['to_renderer_id']: params.toRendererId,
    });
  }

  trackRendererAdd(params: {rendererId: string}): void {
    this.dispatchGtagEvent('renderer_add', {
      ['renderer_id']: params.rendererId,
    });
  }

  trackRendererEdit(params: {rendererId: string}): void {
    this.dispatchGtagEvent('renderer_edit', {
      ['renderer_id']: params.rendererId,
    });
  }

  trackRendererDelete(params: {rendererId: string}): void {
    this.dispatchGtagEvent('renderer_delete', {
      ['renderer_id']: params.rendererId,
    });
  }

  trackApiKeyUpdate(params: {action: ApiKeyAction}): void {
    this.dispatchGtagEvent('api_key_update', {
      ['action']: params.action,
    });
  }

  trackConversationView(): void {
    this.dispatchGtagEvent('conversation_view');
  }

  trackConversationSessionEnd(params: {durationSeconds: number; interfaceCount: number}): void {
    this.dispatchGtagEvent('conversation_session_end', {
      ['duration_seconds']: params.durationSeconds,
      ['interface_count']: params.interfaceCount,
    });
  }
}
