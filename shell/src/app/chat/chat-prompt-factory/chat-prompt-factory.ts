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
import type {A2uiProtocolVersion} from 'a2ui-bridge';
import type {VersionRegistry} from '../../shared/protocol/version-registry';
import {selectCatalogsForVersion} from '../../storage/catalog-management/catalog-domain';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
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
  private readonly strategies: VersionRegistry<PromptProtocolStrategy> = {
    'v0.9': this.v09Strategy,
    'v1.0': this.v10Strategy,
  };

  readonly customInstructionsState = signal<CustomInstructionsState>(this.loadInitialState());
  readonly presets = computed(() => this.customInstructionsState().presets);
  readonly activePresetId = computed(() => this.customInstructionsState().activePresetId);
  readonly activePreset = computed(() => {
    const state = this.customInstructionsState();
    return state.presets.find(p => p.id === state.activePresetId) ?? null;
  });
  readonly customInstructions = computed(() => this.activePreset()?.content ?? '');
  readonly hasCustomInstructions = computed(() => this.customInstructions().trim().length > 0);

  private readonly textOnlySystemPrompt = computed<string>(() => this.composeSystemPrompt());
  private readonly multimodalSystemPrompt = computed<string>(() =>
    this.composeSystemPrompt({includeMultimodalGuidelines: true}),
  );

  readonly systemPrompt = this.textOnlySystemPrompt;

  /**
   * Builds the system prompt for a specific protocol version and optional
   * draft-replacement / multimodal guidelines.
   */
  buildSystemPrompt(options?: {
    protocolVersion?: A2uiProtocolVersion;
    replacesDraft?: boolean;
    includeMultimodalGuidelines?: boolean;
  }): string {
    if (options?.protocolVersion || options?.replacesDraft) {
      return this.composeSystemPrompt(options);
    }
    return options?.includeMultimodalGuidelines
      ? this.multimodalSystemPrompt()
      : this.textOnlySystemPrompt();
  }

  private composeSystemPrompt(options?: {
    protocolVersion?: A2uiProtocolVersion;
    replacesDraft?: boolean;
    includeMultimodalGuidelines?: boolean;
  }): string {
    const support = this.catalogManagement.protocolSupport();
    const version = options?.protocolVersion ?? support.defaultVersion;
    const {primary: effectivePrimary, catalogs: effectiveCatalogs} = selectCatalogsForVersion(
      support,
      version,
      this.catalogManagement.activeCatalog(),
      this.catalogManagement.activeCatalogs(),
    );

    const mcpSupported = this.mcpManager.doesCatalogSupportMcp(
      effectiveCatalogs.length > 0 ? effectiveCatalogs : effectivePrimary,
    );
    const activeServers = mcpSupported ? this.mcpManager.getActiveServersWithTools() : [];

    return this.strategies[version].buildSystemPrompt({
      activeCatalog: effectivePrimary,
      activeCatalogs: effectiveCatalogs,
      activeServers,
      customInstructions: this.customInstructions(),
      includeMultimodalGuidelines: Boolean(options?.includeMultimodalGuidelines),
      replacesDraft: Boolean(options?.replacesDraft),
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
