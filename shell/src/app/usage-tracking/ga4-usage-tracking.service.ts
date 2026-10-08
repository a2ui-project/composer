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
import {LocalStorageInteractions} from '../storage/local-storage-interactions/local-storage-interactions';
import {LocalStorageKey} from '../storage/models/local-storage-keys';
import {
  ApiKeyAction,
  PromptTurnType,
  ShareTrackingStatus,
  UsageType,
  ComposerErrorTelemetryParams,
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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Google Analytics 4 implementation of UsageTrackingService with safe script injection
 * and baseline dimensions enrichment.
 *
 * ### Custom Dimensions & Metrics Provisioning
 * All custom event parameters emitted by this service must be provisioned as Custom Dimensions
 * or Custom Metrics in the target GA4 property to be visible in GA4 reports and explorations.
 *
 * - Use `scripts/create_ga4_dimensions.sh` to idempotently provision all dimensions and metrics
 *   via the GA4 Admin API (`v1beta`). Authenticate using Google OAuth 2.0 Playground
 *   (`https://developers.google.com/oauthplayground/`): authorize
 *   `https://www.googleapis.com/auth/analytics.edit`, exchange the authorization code for an
 *   access token, and run `ACCESS_TOKEN="<token>" ./scripts/create_ga4_dimensions.sh`.
 *
 * - Use `scripts/update_ga4_dimensions.mjs` to automatically scan this service for new
 *   event parameters and update `scripts/create_ga4_dimensions.sh` (with `--check` and `--dry-run`
 *   flags available for automated CI verification and change previews).
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
  private readonly localStorageInteractions = inject(LocalStorageInteractions);
  private readonly document = inject(DOCUMENT);

  /**
   * Ephemeral session identifier generated per tab load and regenerated upon workspace reset.
   *
   * NOTE: This is distinct from GA4's `client_id`. `composer_session_id` is sent solely as a
   * custom event parameter (via `getBaselineDimensions()`) to correlate turns and interactions
   * within a single Composer workspace run, whereas `client_id` tracks persistent unique users/devices
   * across multiple visits over time.
   */
  private _composerSessionId: string = generateUuid();

  /**
   * In-memory cache for the resolved persistent client ID.
   *
   * Guarantees idempotency on this service instance, ensuring repeated calls return the identical
   * UUID even in sandboxed iframes or restricted environments where accessing `localStorage` throws
   * a `SecurityError`.
   */
  private _persistentClientId?: string;

  get composerSessionId(): string {
    return this._composerSessionId;
  }

  resetSession(): void {
    this._composerSessionId = generateUuid();
  }

  /**
   * Retrieves, validates, or generates the persistent client ID stored in localStorage.
   *
   * LocalStorage is origin-isolated, preventing returning users from being treated as new visitors
   * due to cookie churn or eviction on shared domains. Validates existing values against a strict
   * UUID v4 regex to prevent poisoned or malformed data. If localStorage is unavailable or throws
   * a `SecurityError` (handled by `LocalStorageInteractions`), gracefully falls back to a generated
   * UUID and caches it in `_persistentClientId` for in-memory session stability.
   */
  protected getOrCreatePersistentClientId(): string {
    if (this._persistentClientId) {
      return this._persistentClientId;
    }

    const storedId = this.localStorageInteractions.getItem(LocalStorageKey.GA4_CLIENT_ID);
    if (storedId && UUID_REGEX.test(storedId.trim())) {
      this._persistentClientId = storedId.trim();
      return this._persistentClientId;
    }

    const newId = generateUuid();
    this.localStorageInteractions.setItem(LocalStorageKey.GA4_CLIENT_ID, newId);
    this._persistentClientId = newId;
    return this._persistentClientId;
  }

  initialize(): void {
    if (!this.config.enabled || !this.config.measurementId) {
      return;
    }

    const windowObj = this.document.defaultView;
    if (!windowObj) {
      return;
    }

    // Resolve config options (which access localStorage) before assigning windowObj.gtag
    // so synchronous storage warnings cannot queue composer_error events before gtag('config', ...).
    const configOptions = this.getConfigOptions();

    windowObj.dataLayer = windowObj.dataLayer || [];
    if (!windowObj.gtag) {
      windowObj.gtag = function () {
        // eslint-disable-next-line prefer-rest-params
        windowObj.dataLayer?.push(arguments);
      };
    }

    windowObj.gtag('js', new Date());
    windowObj.gtag('config', this.config.measurementId, configOptions);

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

  private getUsageType(): UsageType {
    return this.startupResolution.isThirdPartyEnvironment()
      ? UsageType.THIRD_PARTY
      : UsageType.FIRST_PARTY;
  }

  /**
   * Configuration options passed to `gtag('config', measurementId, options)`.
   *
   * Includes essential safeguards against cookie churn and multi-app collisions:
   * - `send_page_view: false`: Disables gtag.js's automatic initial `page_view` so events are dispatched
   *   explicitly via Angular Router / `trackPageView()` with custom baseline dimensions attached.
   * - `cookie_prefix: 'a2ui_composer'`: Prefixes GA4 cookies (e.g. `a2ui_composer_ga` instead of `_ga`)
   *   to prevent collisions or overwrites with other applications sharing the parent domain.
   * - `cookie_domain: hostname || 'auto'`: Locks cookies to the exact application hostname (e.g.
   *   `a2ui-composer.corp.google.com`) rather than defaulting to `'auto'` (which writes to the shared
   *   `.corp.google.com` superdomain where Chrome's 180-cookie limit frequently evicts cookies).
   * - `client_id: this.getOrCreatePersistentClientId()`: Supplies the origin-isolated `localStorage` UUID
   *   so returning users on the same browser are consistently counted as the same unique user even if
   *   browser cookies are cleared or evicted.
   */
  protected getConfigOptions(): Record<string, unknown> {
    const hostname = this.document.defaultView?.location?.hostname;
    return {
      // Disable automatic page view so trackPageView() can attach baseline dimensions.
      ['send_page_view']: false,
      // Prefix cookies to avoid collisions with other apps sharing parent domains (e.g. .corp.google.com).
      ['cookie_prefix']: 'a2ui_composer',
      // Lock cookies to the exact hostname rather than writing to .corp.google.com superdomain.
      ['cookie_domain']: hostname || 'auto',
      // Supply stable, origin-isolated client ID from localStorage to survive cookie eviction.
      ['client_id']: this.getOrCreatePersistentClientId(),
      // Page-load-constant dimensions, attached here so GA4 automatic events
      // (session_start, user_engagement, ...) that bypass getBaselineDimensions() carry them too.
      ['usage_type']: this.getUsageType(),
      ['env_mode']: this.appConfigProvider.envMode(),
    };
  }

  protected getBaselineDimensions(): Record<string, unknown> {
    const activeRendererId = this.startupConfigState.selectedRendererId() || 'default';
    const catalogObj = this.catalogManagement.activeCatalog();
    const catalogId = catalogObj ? catalogObj.catalogId || catalogObj.$id || '' : '';
    return {
      ['send_to']: this.config.measurementId,
      ['composer_session_id']: this._composerSessionId,
      ['usage_type']: this.getUsageType(),
      ['env_mode']: this.appConfigProvider.envMode(),
      ['active_renderer_id']: activeRendererId,
      ['catalog_id']: catalogId,
    };
  }

  protected dispatchGtagEvent(name: string, params?: Record<string, unknown>): void {
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

    try {
      windowObj.gtag('event', name, payload);
    } catch {
      // Suppress runtime exceptions silently. Otherwise, we could get into an
      // infinite loop where this throws, and we want to log an error somewhere
      // which sends the error back to the trackComposerError() method, which
      // calls this method, which then fails, etc...
    }
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

  trackComposerError(params: ComposerErrorTelemetryParams): void {
    if (!this.config.enabled) return;
    const sanitizedInvalidProperty =
      params.invalidProperty && // Second line of defense: bounds SHAPE and LENGTH only.
      // Primary defense against PII is the context-bound extraction in ErrorTelemetryReporter.
      /^[a-zA-Z0-9_$-]{1,64}$/.test(params.invalidProperty)
        ? params.invalidProperty
        : 'none_or_redacted';

    const customParams = {
      ['event_category']: 'error',
      ['event_label']: params.errorCategory,
      ['source_tag']:
        params.sourceTag && /^\[[a-zA-Z0-9_-]{1,64}\]$/.test(params.sourceTag)
          ? params.sourceTag
          : '[Unknown]',
      ['error_type']: params.errorCategory,
      ['error_category']: params.errorCategory,
      ['line']: params.line ?? -1,
      ['column']: params.column ?? -1,
      ['invalid_property']: sanitizedInvalidProperty,
    };
    this.dispatchGtagEvent('composer_error', customParams);
  }
}
