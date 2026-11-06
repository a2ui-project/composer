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

import {Injectable, computed, inject, signal} from '@angular/core';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {Catalog, CatalogJson} from '../../storage/models/catalog-storage.model';
import {McpClientManagerService} from '../../mcp/mcp-client-manager.service';
import {LocalStorageInteractions} from '../../storage/local-storage-interactions/local-storage-interactions';
import {LocalStorageKey} from '../../storage/models/local-storage-keys';
import {PromptProtocolStrategy} from './prompt-protocol-strategy';
import {V09PromptStrategy} from './v0-9-prompt-strategy';
import {V10PromptStrategy} from './v1-0-prompt-strategy';

/**
 * Representation of a named custom instruction preset.
 */
export declare interface CustomInstructionPreset {
  id: string;
  name: string;
  content: string;
}

/**
 * Persisted state of custom instruction presets and active selection.
 */
export declare interface CustomInstructionsState {
  presets: CustomInstructionPreset[];
  activePresetId: string | null;
}

/**
 * Constructs dynamic system prompts based on the active protocol version, catalog schemas, and MCP state.
 */
@Injectable({
  providedIn: 'root',
})
export class ChatPromptFactory {
  private readonly catalogManagement = inject(CatalogManagement);
  private readonly mcpManager = inject(McpClientManagerService);
  private readonly localStorageInteractions = inject(LocalStorageInteractions);
  private readonly v09Strategy = inject(V09PromptStrategy);
  private readonly v10Strategy = inject(V10PromptStrategy);

  readonly customInstructionsState = signal<CustomInstructionsState>(this.loadInitialState());
  readonly presets = computed(() => this.customInstructionsState().presets);
  readonly activePresetId = computed(() => this.customInstructionsState().activePresetId);
  readonly activePreset = computed(() => {
    const state = this.customInstructionsState();
    return state.presets.find(p => p.id === state.activePresetId) ?? null;
  });
  readonly customInstructions = computed(() => this.activePreset()?.content ?? '');
  readonly hasCustomInstructions = computed(() => this.customInstructions().trim().length > 0);

  private readonly activeStrategy = computed<PromptProtocolStrategy>(() => {
    const version = this.catalogManagement.activeProtocolVersion();
    return version === 'v1.0' ? this.v10Strategy : this.v09Strategy;
  });

  private readonly textOnlySystemPrompt = computed<string>(() => this.composeSystemPrompt(false));
  private readonly multimodalSystemPrompt = computed<string>(() => this.composeSystemPrompt(true));

  readonly systemPrompt = this.textOnlySystemPrompt;

  /**
   * Builds the system prompt with optional multimodal image-to-UI guidelines.
   *
   * @param options Flag controlling whether multimodal guidelines are included.
   * @returns Generated system prompt string.
   */
  buildSystemPrompt(options?: {includeMultimodalGuidelines?: boolean}): string {
    return options?.includeMultimodalGuidelines
      ? this.multimodalSystemPrompt()
      : this.textOnlySystemPrompt();
  }

  private composeSystemPrompt(includeMultimodalGuidelines: boolean): string {
    const catalog = this.catalogManagement.activeCatalog();
    const catalogs = this.catalogManagement.activeCatalogs();
    const effectiveCatalogs: (Catalog | CatalogJson)[] =
      catalogs && catalogs.length > 0 ? [...catalogs] : catalog ? [catalog] : [];

    const mcpSupported = this.mcpManager.doesCatalogSupportMcp(
      effectiveCatalogs.length > 0 ? effectiveCatalogs : catalog,
    );
    const activeServers = mcpSupported ? this.mcpManager.getActiveServersWithTools() : [];

    return this.activeStrategy().buildSystemPrompt({
      activeCatalog: catalog,
      activeCatalogs: effectiveCatalogs,
      activeServers,
      customInstructions: this.customInstructions(),
      includeMultimodalGuidelines,
    });
  }

  /**
   * Updates the custom instruction state and persists it to local storage.
   *
   * @param state New custom instructions state.
   */
  setCustomInstructionsState(state: CustomInstructionsState): void {
    const validPreset = state.presets.some(p => p.id === state.activePresetId);
    const normalizedState: CustomInstructionsState = {
      presets: state.presets,
      activePresetId: validPreset ? state.activePresetId : null,
    };
    this.customInstructionsState.set(normalizedState);
    this.localStorageInteractions.setItem(
      LocalStorageKey.CUSTOM_INSTRUCTIONS,
      JSON.stringify(normalizedState),
    );
  }

  private loadInitialState(): CustomInstructionsState {
    const raw = this.localStorageInteractions.getItem(LocalStorageKey.CUSTOM_INSTRUCTIONS);
    if (!raw) {
      return {presets: [], activePresetId: null};
    }
    try {
      const parsed = JSON.parse(raw) as Partial<CustomInstructionsState>;
      if (!parsed || !Array.isArray(parsed.presets)) {
        return {presets: [], activePresetId: null};
      }
      const presets: CustomInstructionPreset[] = parsed.presets.filter(
        (p: unknown): p is CustomInstructionPreset =>
          typeof p === 'object' &&
          p !== null &&
          typeof (p as CustomInstructionPreset).id === 'string' &&
          typeof (p as CustomInstructionPreset).name === 'string' &&
          typeof (p as CustomInstructionPreset).content === 'string',
      );
      const activePresetId =
        typeof parsed.activePresetId === 'string' &&
        presets.some(p => p.id === parsed.activePresetId)
          ? parsed.activePresetId
          : null;
      return {presets, activePresetId};
    } catch {
      return {presets: [], activePresetId: null};
    }
  }
}
