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

import {Injectable, Signal, computed, effect, inject, signal, untracked} from '@angular/core';
import {ThinkingLevel} from '@google/genai';
import {StartupConfigStateService} from '../../shell/startup-resolution/state/startup-config-state.service';
import {LocalStorageInteractions} from '../../storage/local-storage-interactions/local-storage-interactions';
import {LocalStorageKey} from '../../storage/models/local-storage-keys';
import {ErrorLogger} from '../../debug/error-logger.service';
import {AppConfigProvider, AuthType} from '../app-config-provider/app-config-provider';

/** Human-friendly labels for the thinking level selector. */
export const THINKING_LEVEL_LABELS = {
  [ThinkingLevel.MINIMAL]: 'Minimal',
  [ThinkingLevel.LOW]: 'Low',
  [ThinkingLevel.MEDIUM]: 'Medium',
  [ThinkingLevel.HIGH]: 'High',
} as const satisfies Partial<Record<ThinkingLevel, string>>;

export type SupportedThinkingLevel = keyof typeof THINKING_LEVEL_LABELS;

/** Type guard checking whether a value is a supported thinking level. */
export function isSupportedThinkingLevel(level: unknown): level is SupportedThinkingLevel {
  return typeof level === 'string' && Object.hasOwn(THINKING_LEVEL_LABELS, level);
}

/** A selectable LLM model, resolved from `config.json.models`. */
export declare interface LlmModelOption {
  /** Stable key of the entry in `config.json.models`. */
  readonly id: string;
  /** Label shown to the user. */
  readonly name: string;
  /** Model identifier sent to the backend. */
  readonly model: string;
  /** Thinking levels the model accepts, in display order. Empty if unsupported. */
  readonly thinkingLevels: readonly SupportedThinkingLevel[];
  /** Level used when the user has not chosen one, if the model supports levels. */
  readonly defaultThinkingLevel?: SupportedThinkingLevel;
  /** Authentication mode the entry is restricted to, if any. */
  readonly authType?: AuthType;
}

/**
 * Parses a user- or config-supplied thinking level string, returning
 * `undefined` for unknown or unspecified values.
 */
export function parseThinkingLevel(value: unknown): SupportedThinkingLevel | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const normalized = value.trim().toUpperCase();
  return isSupportedThinkingLevel(normalized) ? normalized : undefined;
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
  private readonly errorLogger = inject(ErrorLogger);

  private readonly storedModelId = signal<string | null>(
    this.storage.getItem(LocalStorageKey.SELECTED_MODEL),
  );
  private readonly storedThinkingLevel = signal<SupportedThinkingLevel | undefined>(
    parseThinkingLevel(this.storage.getItem(LocalStorageKey.SELECTED_THINKING_LEVEL)),
  );

  private readonly parsedStartupModels = computed<ParsedStartupModels>(() =>
    parseModelConfigs(this.startupConfigState.models()),
  );

  constructor() {
    effect(() => {
      const warnings = this.parsedStartupModels().warnings;
      untracked(() => {
        for (const warning of warnings) {
          this.errorLogger.warn(warning);
        }
      });
    });
  }

  /**
   * Models the user may choose from in the active authentication mode, in
   * config order.
   */
  readonly models: Signal<readonly LlmModelOption[]> = computed(() => {
    const authType = this.configProvider.authType();
    return this.parsedStartupModels().options.filter(
      option => option.authType === undefined || option.authType === authType,
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
  readonly thinkingLevel: Signal<SupportedThinkingLevel | undefined> = computed(() => {
    const model = this.selectedModel();
    if (!model || model.thinkingLevels.length === 0) {
      return undefined;
    }
    const stored = this.storedThinkingLevel();
    if (stored && model.thinkingLevels.includes(stored)) {
      return stored;
    }
    if (model.defaultThinkingLevel && model.thinkingLevels.includes(model.defaultThinkingLevel)) {
      return model.defaultThinkingLevel;
    }
    return model.thinkingLevels[0];
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
    const parsed = parseThinkingLevel(level);
    if (!parsed) {
      return;
    }
    this.storedThinkingLevel.set(parsed);
    this.storage.setItem(LocalStorageKey.SELECTED_THINKING_LEVEL, parsed);
  }
}

interface ParsedModelResult {
  readonly option: LlmModelOption;
  readonly warnings: readonly string[];
}

interface ParsedStartupModels {
  readonly options: readonly LlmModelOption[];
  readonly warnings: readonly string[];
}

function parseModelConfigs(configs: readonly unknown[]): ParsedStartupModels {
  const options: LlmModelOption[] = [];
  const warnings: string[] = [];
  for (const config of configs) {
    const parsed = toModelOption(config);
    if (parsed) {
      options.push(parsed.option);
      warnings.push(...parsed.warnings);
    }
  }
  return {options, warnings};
}

function toModelOption(config: unknown): ParsedModelResult | null {
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
  const warnings: string[] = [];
  const thinkingLevels: SupportedThinkingLevel[] = [];
  if (Array.isArray(raw.thinkingLevels)) {
    for (const item of raw.thinkingLevels) {
      const parsed = parseThinkingLevel(item);
      if (parsed) {
        thinkingLevels.push(parsed);
      } else if (item !== undefined && item !== null && item !== '') {
        warnings.push(`Unrecognized thinking level "${item}" for model "${model}"`);
      }
    }
  }
  const defaultLevel = parseThinkingLevel(raw.defaultThinkingLevel);
  if (
    raw.defaultThinkingLevel !== undefined &&
    raw.defaultThinkingLevel !== null &&
    raw.defaultThinkingLevel !== '' &&
    !defaultLevel
  ) {
    warnings.push(
      `Unrecognized default thinking level "${raw.defaultThinkingLevel}" for model "${model}"`,
    );
  }
  return {
    option: {
      id: model,
      name: typeof raw.displayName === 'string' && raw.displayName.trim() ? raw.displayName : model,
      model,
      thinkingLevels: [...new Set(thinkingLevels)],
      defaultThinkingLevel:
        defaultLevel && thinkingLevels.includes(defaultLevel) ? defaultLevel : undefined,
      authType: parseAuthType(raw.authType),
    },
    warnings,
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
