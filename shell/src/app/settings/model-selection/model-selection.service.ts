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

import {Injectable, Signal, computed, inject, signal} from '@angular/core';
import {StartupConfigStateService} from '../../shell/startup-resolution/state/startup-config-state.service';
import {LocalStorageInteractions} from '../../storage/local-storage-interactions/local-storage-interactions';
import {LocalStorageKey} from '../../storage/models/local-storage-keys';
import {AppConfigProvider, AuthType} from '../app-config-provider/app-config-provider';

/**
 * Backend-agnostic thinking depth. Each LLM client maps these onto its own
 * API (e.g. Gemini `ThinkingLevel`).
 */
export enum ThinkingLevel {
  MINIMAL = 'minimal',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

const ALL_THINKING_LEVELS: readonly ThinkingLevel[] = [
  ThinkingLevel.MINIMAL,
  ThinkingLevel.LOW,
  ThinkingLevel.MEDIUM,
  ThinkingLevel.HIGH,
];

/** Human-friendly labels for the thinking level selector. */
export const THINKING_LEVEL_LABELS: Readonly<Record<ThinkingLevel, string>> = {
  [ThinkingLevel.MINIMAL]: 'Minimal',
  [ThinkingLevel.LOW]: 'Low',
  [ThinkingLevel.MEDIUM]: 'Medium',
  [ThinkingLevel.HIGH]: 'High',
};

/** A selectable LLM model, resolved from `config.json.models`. */
export declare interface LlmModelOption {
  /** Stable key of the entry in `config.json.models`. */
  readonly id: string;
  /** Label shown to the user. */
  readonly name: string;
  /** Model identifier sent to the backend. */
  readonly model: string;
  /** Thinking levels the model accepts, in display order. Empty if unsupported. */
  readonly thinkingLevels: readonly ThinkingLevel[];
  /** Level used when the user has not chosen one, if the model supports levels. */
  readonly defaultThinkingLevel?: ThinkingLevel;
  /** Authentication mode the entry is restricted to, if any. */
  readonly authType?: AuthType;
}

/**
 * Parses a user- or config-supplied thinking level string, returning
 * `undefined` for unknown values.
 */
export function parseThinkingLevel(value: unknown): ThinkingLevel | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const normalized = value.trim().toLowerCase();
  return ALL_THINKING_LEVELS.find(level => level === normalized);
}

/**
 * Tracks which LLM model and thinking level the user selected from the
 * allow-list declared in `config.json.models`, persisting the choice in
 * LocalStorage.
 *
 * When the config declares no models, `selectedModel()` is `null` and LLM
 * clients keep their built-in defaults, so deployments that have not adopted
 * the `models` section behave exactly as before.
 */
@Injectable({
  providedIn: 'root',
})
export class ModelSelectionService {
  private readonly startupConfigState = inject(StartupConfigStateService);
  private readonly storage = inject(LocalStorageInteractions);
  private readonly configProvider = inject(AppConfigProvider);

  private readonly storedModelId = signal<string | null>(
    this.storage.getItem(LocalStorageKey.SELECTED_MODEL),
  );
  private readonly storedThinkingLevel = signal<ThinkingLevel | undefined>(
    parseThinkingLevel(this.storage.getItem(LocalStorageKey.SELECTED_THINKING_LEVEL)),
  );

  /**
   * Models the user may choose from in the active authentication mode, in
   * config order.
   */
  readonly models: Signal<readonly LlmModelOption[]> = computed(() => {
    const authType = this.configProvider.authType();
    return this.startupConfigState
      .models()
      .map(config => toModelOption(config))
      .filter(
        (option): option is LlmModelOption =>
          option !== null && (option.authType === undefined || option.authType === authType),
      );
  });

  /** Whether the deployment declares any selectable models. */
  readonly hasModels: Signal<boolean> = computed(() => this.models().length > 0);

  /**
   * The active model: the persisted selection when it is still allowed,
   * otherwise the first entry. `null` when the config declares no models.
   */
  readonly selectedModel: Signal<LlmModelOption | null> = computed(() => {
    const models = this.models();
    if (models.length === 0) {
      return null;
    }
    const storedId = this.storedModelId();
    return models.find(m => m.id === storedId) ?? models[0];
  });

  /** Id of the active model, or `null` when none is configured. */
  readonly selectedModelId: Signal<string | null> = computed(
    () => this.selectedModel()?.id ?? null,
  );

  /**
   * The active thinking level: the persisted choice when the active model
   * accepts it, otherwise the model's default, otherwise its first level.
   * `undefined` when the active model does not support thinking levels.
   */
  readonly thinkingLevel: Signal<ThinkingLevel | undefined> = computed(() => {
    const model = this.selectedModel();
    if (!model || model.thinkingLevels.length === 0) {
      return undefined;
    }
    const stored = this.storedThinkingLevel();
    if (stored && model.thinkingLevels.includes(stored)) {
      return stored;
    }
    return model.defaultThinkingLevel ?? model.thinkingLevels[0];
  });

  /**
   * Persists the user's model choice. Unknown ids are ignored so a stale
   * selection can never escape the allow-list.
   */
  selectModel(id: string): void {
    if (!this.models().some(m => m.id === id)) {
      return;
    }
    this.storedModelId.set(id);
    this.storage.setItem(LocalStorageKey.SELECTED_MODEL, id);
  }

  /** Persists the user's thinking level choice. */
  selectThinkingLevel(level: ThinkingLevel): void {
    if (!parseThinkingLevel(level)) {
      return;
    }
    this.storedThinkingLevel.set(level);
    this.storage.setItem(LocalStorageKey.SELECTED_THINKING_LEVEL, level);
  }
}

function toModelOption(config: unknown): LlmModelOption | null {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return null;
  }
  const raw = config as {
    model?: unknown;
    displayName?: unknown;
    thinkingLevels?: unknown;
    defaultThinkingLevel?: unknown;
    authType?: unknown;
  };
  const model = typeof raw.model === 'string' ? raw.model.trim() : '';
  if (!model) {
    return null;
  }
  const thinkingLevels = Array.isArray(raw.thinkingLevels)
    ? raw.thinkingLevels
        .map(parseThinkingLevel)
        .filter((level): level is ThinkingLevel => level !== undefined)
    : [];
  const defaultLevel = parseThinkingLevel(raw.defaultThinkingLevel);
  return {
    id: model,
    name: typeof raw.displayName === 'string' && raw.displayName.trim() ? raw.displayName : model,
    model,
    thinkingLevels: [...new Set(thinkingLevels)],
    defaultThinkingLevel:
      defaultLevel && thinkingLevels.includes(defaultLevel) ? defaultLevel : undefined,
    authType: parseAuthType(raw.authType),
  };
}

function parseAuthType(value: unknown): AuthType | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === AuthType.FIRST_PARTY) {
    return AuthType.FIRST_PARTY;
  }
  if (normalized === AuthType.THIRD_PARTY) {
    return AuthType.THIRD_PARTY;
  }
  return undefined;
}
