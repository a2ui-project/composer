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

import {Injectable, inject, signal, DestroyRef} from '@angular/core';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {debounceTime, distinctUntilChanged, skip} from 'rxjs/operators';
import {ChatState} from '../chat-state/chat-state';
import {MessageRole} from '../llm-client/llm-client';
import {CAR_BOOKING} from '../chat-service/initial-draft';
import {tryParseJsonArray} from '../../utils/json';
import {RenderA2uiItem, A2uiComponentInstance, UpdateComponentsDetails} from 'a2ui-bridge';

/**
 * Manages in-memory volatile autosave draft layouts and bidirectionally
 * synchronizes active editor modifications directly into the LLM history log
 * context. Excludes mock rules configurations aggressively to establish context
 * security isolation, debounces canvas updates to reduce network payloads,
 * and provides state hydration to prevent layout data loss across session
 * navigation swappings.
 */
const UPDATE_COMPONENTS = 'updateComponents';
const COMPONENTS = 'components';
const REGISTER_MOCK_RULES = 'registerMockRules';
const MOCK_RULES_CONFIG = 'mockRulesConfig';
const RULES = 'rules';
const ID = 'id';
const CHILDREN = 'children';
const MOCK_RULES_CONTAINER = 'mock_rules_container';

@Injectable({
  providedIn: 'root',
})
export class StateSync {
  private readonly destroyRef = inject(DestroyRef);
  private readonly chatState = inject(ChatState);

  private readonly _activeDraft = signal<string>(CAR_BOOKING);
  /**
   * Volatile, read-only reactive Signal exposing the currently buffered
   * in-memory canvas layout string.
   */
  readonly activeDraft = this._activeDraft.asReadonly();

  private readonly _draftInput = signal<string>('');

  constructor() {
    toObservable(this._draftInput)
      .pipe(skip(1), debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((val: string) => {
        this.syncLayoutToHistory(val);
      });
  }

  /**
   * Caches a fresh raw layout text update inside volatile memory,
   * queueing synchronization.
   */
  updateDraft(value: string): void {
    this._activeDraft.set(value);
    this._draftInput.set(value);
  }

  /**
   * Retrieves the current volatile in-memory draft configuration state
   * on panel re-hydration cycles.
   */
  hydrateActiveDraft(): string {
    return this._activeDraft();
  }

  /**
   * Directly updates the editor layout draft from LLM pipeline,
   * bypassing standard debounces and context history synchronization.
   */
  commitLayoutFromLlm(value: string): void {
    this._activeDraft.set(value);
  }

  /**
   * Wipes all dynamic draft context instantly, resetting layout
   * memory to default.
   */
  flushDraft(): void {
    this._activeDraft.set(CAR_BOOKING);
  }

  /**
   * Normalizes, isolates, and synchronizes layouts changes into the trailing
   * history context node.
   */
  private syncLayoutToHistory(layout: string): void {
    const sanitizedLayoutString = this.sanitizeLayout(layout);
    const history = this.chatState.chatHistory();

    if (history.length === 0) {
      // Initialize logs context if empty
      this.chatState.setChatHistory([
        {
          role: MessageRole.USER,
          content: sanitizedLayoutString,
        },
      ]);
      return;
    }

    const lastMessage = history[history.length - 1];
    // Verify that the last message is indeed a user message AND starts with
    // A2UI JSON Lines version wrappers.
    // This ensures plain user text prompt dispatches are preserved
    // completely intact!
    const isLastMessageLayoutSnapshot =
      lastMessage.role === MessageRole.USER && lastMessage.content.trim().startsWith('{"version"');

    if (isLastMessageLayoutSnapshot) {
      // Overwrite trailing turn in-place to avoid array inflation
      // (prompt bloat!)
      const updatedHistory = [...history];
      updatedHistory[updatedHistory.length - 1] = {
        role: MessageRole.USER,
        content: sanitizedLayoutString,
      };
      this.chatState.setChatHistory(updatedHistory);
    } else {
      // Append a new USER message node representing visual snapshot if last
      // belongs to MODEL or represents human textual instructions
      this.chatState.updateChatHistory(h => [
        ...h,
        {
          role: MessageRole.USER,
          content: sanitizedLayoutString,
        },
      ]);
    }
  }

  /**
   * Sanitizes rules setups commands and strips nested mock configurations.
   */
  private sanitizeLayout(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }

    // Try parsing as a single JSON array first to support pretty-printed or multi-line JSON arrays
    const parsedArray = tryParseJsonArray(trimmed);
    if (parsedArray) {
      const sanitized = parsedArray
        .map(block => {
          if (block && typeof block === 'object' && !Array.isArray(block)) {
            return this.sanitizeBlock(block as RenderA2uiItem);
          }
          return block;
        })
        .filter(Boolean);
      return sanitized.map(b => JSON.stringify(b)).join('\n') + '\n';
    }

    const lines = trimmed
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const sanitizedLines: string[] = [];

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          continue;
        }
        const sanitized = this.sanitizeBlock(parsed as RenderA2uiItem);
        if (sanitized) {
          sanitizedLines.push(JSON.stringify(sanitized));
        }
      } catch (err) {
        // Discard conversational wrappers or malformed syntax blocks
        console.warn(
          '[StateSync] Discarding malformed layout JSON Line ' + 'during sanitization:',
          line,
          err,
        );
      }
    }

    return sanitizedLines.length > 0 ? sanitizedLines.join('\n') + '\n' : '';
  }

  private sanitizeBlock(parsed: RenderA2uiItem): RenderA2uiItem | null {
    if (parsed[REGISTER_MOCK_RULES] || parsed[MOCK_RULES_CONFIG]) {
      return null;
    }

    if (
      parsed[UPDATE_COMPONENTS] &&
      typeof parsed[UPDATE_COMPONENTS] === 'object' &&
      parsed[UPDATE_COMPONENTS] !== null
    ) {
      const updateComponents = parsed[UPDATE_COMPONENTS] as UpdateComponentsDetails;
      if (Array.isArray(updateComponents[COMPONENTS])) {
        // Actively filter out component with ID 'mock_rules_container'
        const filtered = updateComponents[COMPONENTS].filter(comp => {
          if (comp !== null && typeof comp === 'object' && !Array.isArray(comp)) {
            const compObj = comp as A2uiComponentInstance;
            return compObj[ID] !== MOCK_RULES_CONTAINER;
          }
          return true;
        });

        updateComponents[COMPONENTS] = filtered.map(component => {
          if (component !== null && typeof component === 'object' && !Array.isArray(component)) {
            return this.sanitizeComponentObject(component as Record<string, unknown>);
          }
          return component;
        });
      }
    }
    return parsed;
  }

  /**
   * Recursively sanitizes component declarations mapping. Strips property
   * keys matching /rules/ or prefix /^mock/i dynamically.
   */
  private sanitizeComponentObject(obj: Record<string, unknown>): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(obj)) {
      if (key === RULES || /^mock/i.test(key)) {
        continue;
      }

      if (key === CHILDREN && Array.isArray(val)) {
        // Exclude children pointing to the 'mock_rules_container'
        cleaned[key] = val.filter(childId => childId !== MOCK_RULES_CONTAINER);
      } else if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        cleaned[key] = this.sanitizeComponentObject(val as Record<string, unknown>);
      } else if (Array.isArray(val)) {
        cleaned[key] = val.map(item => {
          if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
            return this.sanitizeComponentObject(item as Record<string, unknown>);
          }
          return item;
        });
      } else {
        cleaned[key] = val;
      }
    }

    return cleaned;
  }
}
