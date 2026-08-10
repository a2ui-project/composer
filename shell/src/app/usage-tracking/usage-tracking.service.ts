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

import {InjectionToken} from '@angular/core';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {ThemePreference} from '../settings/app-config-provider/app-config-provider';
import {ComposerPanelId} from '../shell/composer-workspace/composer-panel-id';

/**
 * Classification tag separating Google-internal usage from 3P open-source users.
 */
export enum UsageType {
  FIRST_PARTY = '1P',
  THIRD_PARTY = '3P',
}

/**
 * Chat prompt turn type differentiating initial prompts from multi-turn follow-ups.
 */
export enum PromptTurnType {
  INITIAL = 'initial',
  FOLLOWUP = 'followup',
}

/**
 * Actions performed on API keys in settings.
 */
export enum ApiKeyAction {
  SELECT = 'select',
  ADD = 'add',
  DELETE = 'delete',
}

/**
 * Status of the share design action.
 */
export enum ShareTrackingStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  INVALID_JSON = 'invalid-json',
  CLIPBOARD_UNAVAILABLE = 'clipboard_unavailable',
}

/**
 * Static or injected configuration for usage tracking.
 */
export interface UsageTrackingConfig {
  readonly enabled: boolean;
  readonly measurementId: string;
}

/**
 * Default usage tracking configuration disabling telemetry out-of-the-box.
 */
export const DEFAULT_USAGE_TRACKING_CONFIG: UsageTrackingConfig = {
  enabled: false,
  measurementId: '',
};

/**
 * Injection token for usage tracking configuration.
 */
export const USAGE_TRACKING_CONFIG = new InjectionToken<UsageTrackingConfig>(
  'USAGE_TRACKING_CONFIG',
  {
    providedIn: 'root',
    factory: () => DEFAULT_USAGE_TRACKING_CONFIG,
  },
);

/**
 * Abstract usage tracking service defining the contract for telemetry collection.
 */
export abstract class UsageTrackingService {
  /**
   * Initializes analytics scripts and global data layer bindings.
   */
  abstract initialize(): Promise<void> | void;

  /**
   * The current ephemeral session UUID.
   */
  abstract readonly composerSessionId: string;

  /**
   * Resets the ephemeral session identifier to break turn correlation.
   */
  abstract resetSession(): void;

  /**
   * Tracks virtual page views across Angular routes.
   */
  abstract trackPageView(params: {pagePath: string}): void;

  /**
   * Tracks share design URL generation attempts.
   */
  abstract trackShareDesign(params: {
    status: ShareTrackingStatus;
    compressedLengthChars: number;
  }): void;

  /**
   * Tracks session reset button clicks.
   */
  abstract trackSessionReset(params: {totalPromptTurns: number}): void;

  /**
   * Tracks light/dark theme toggles.
   */
  abstract trackThemeToggle(params: {theme: ThemePreference}): void;

  /**
   * Tracks user prompt dispatches to the LLM assistant.
   */
  abstract trackChatPrompt(params: {
    promptId?: string;
    catalogId: string;
    turnType: PromptTurnType;
    turnIndex: number;
    attemptNumber: number;
    hasScreenshot: boolean;
    attachmentCount: number;
  }): string;

  /**
   * Tracks prompt retries after failed turns.
   */
  abstract trackChatRetry(params: {
    promptId?: string;
    catalogId: string;
    turnIndex: number;
    attemptNumber: number;
    retryOfPromptId?: string;
  }): string;

  /**
   * Tracks cancellation of in-flight LLM streams.
   */
  abstract trackChatCancel(params: {
    promptId: string;
    turnIndex: number;
    pipelineStatus: string;
  }): void;

  /**
   * Tracks navigation and tab switches in the Dockview debug drawer.
   */
  abstract trackDebugTabView(params: {panelId: ComposerPanelId}): void;

  /**
   * Tracks raw message accordions expanded in raw messages panel.
   */
  abstract trackRawMessageExpanded(params: {messageType: PreviewBridgeMessageType | string}): void;

  /**
   * Tracks debounced manual edits in the Data Model panel.
   */
  abstract trackDataModelEdit(params: {isValidJson: boolean}): void;

  /**
   * Tracks debounced manual edits in the Monaco raw JSON editor.
   */
  abstract trackJsonEditorEdit(params: {isValidJson: boolean}): void;

  /**
   * Tracks navigating to the components gallery view.
   */
  abstract trackGalleryView(): void;

  /**
   * Tracks selecting a component card within the gallery.
   */
  abstract trackGalleryComponentSelect(params: {componentKey: string; category: string}): void;

  /**
   * Tracks copying component usage code from the gallery.
   */
  abstract trackGalleryCopyUsage(params: {componentKey: string}): void;

  /**
   * Tracks switching active renderer profiles in settings.
   */
  abstract trackRendererSwitch(params: {fromRendererId: string | null; toRendererId: string}): void;

  /**
   * Tracks registering a new custom renderer endpoint.
   */
  abstract trackRendererAdd(params: {rendererId: string}): void;

  /**
   * Tracks editing an existing renderer configuration.
   */
  abstract trackRendererEdit(params: {rendererId: string}): void;

  /**
   * Tracks deleting a custom renderer endpoint.
   */
  abstract trackRendererDelete(params: {rendererId: string}): void;

  /**
   * Tracks API key selection or management actions without logging secret key tokens.
   */
  abstract trackApiKeyUpdate(params: {action: ApiKeyAction}): void;
}
