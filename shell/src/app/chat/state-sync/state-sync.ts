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
import {of, Subject, timer} from 'rxjs';
import {filter, map, skip, switchMap, takeUntil} from 'rxjs/operators';
import {ChatState} from '../chat-state/chat-state';
import {MessageRole} from '../llm-client/llm-client';
import {CAR_BOOKING} from '../chat-service/initial-draft';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {RenderA2uiItem, A2uiComponentInstance, UpdateComponentsDetails} from 'a2ui-bridge';
import {StartupConfigStateService} from '../../shell/startup-resolution/state/startup-config-state.service';
import {tryParseJsonArray, formatJson} from '../../utils/json';
import {ErrorLogger} from '../../debug/error-logger.service';

/**
 * Manages in-memory volatile autosave draft layouts and bidirectionally
 * synchronizes active editor modifications directly into the LLM history log
 * context. Excludes mock rules configurations aggressively to establish context
 * security isolation, debounces canvas updates to reduce network payloads,
 * and provides state hydration to prevent layout data loss across session
 * navigation swappings.
 */
const BASIC_CATALOG_ID = 'https://a2ui.org/specification/v0_9/basic_catalog.json';
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
  private readonly catalogManagement = inject(CatalogManagement);
  private readonly startupConfigState = inject(StartupConfigStateService);
  private readonly logger = inject(ErrorLogger).withTag('[StateSync]');

  // A "draft" represents the volatile, unsaved in-memory JSON array
  // payload containing the active surface setup, component hierarchy,
  // and data models currently rendered on the preview canvas.
  //
  // We maintain separate channels for `_activeDraft` and `userDraftInput$`
  // to prevent feedback loops when syncing with LLM chat history:
  // - `_activeDraft` is the source of truth for active editor/preview
  //   UI bindings, updating instantly.
  // - `userDraftInput$` is an event stream used to debounce and sync
  //   user edits back to the history. LLM-initiated edits update
  //   `_activeDraft` directly, bypassing history sync.
  private previousCatalogId: string | null = null;
  private isDraftModified = false;
  private lastSynchronizedLayout: string | null = null;
  private readonly _activeDraft = signal<string>('');
  /**
   * Volatile, read-only reactive Signal exposing the currently buffered
   * in-memory canvas layout string.
   */
  readonly activeDraft = this._activeDraft.asReadonly();

  /**
   * Monotonically increasing counter incremented on each in-memory session reset.
   */
  readonly sessionResetNonce = signal(0);

  private readonly userDraftInput$ = new Subject<string>();
  private readonly cancelPendingDraftSync$ = new Subject<void>();

  constructor() {
    // A renderer change replaces only an untouched sample. A canvas the user or the
    // assistant changed stays, so it can be viewed in the new renderer.
    toObservable(this.startupConfigState.selectedRendererId)
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.isDraftModified) {
          this.flushDraft();
        }
      });

    toObservable(this.catalogManagement.activeCatalog)
      .pipe(
        filter(catalog => !!catalog),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(catalog => {
        const catalogId = (catalog!.catalogId || catalog!.$id || '') as string;
        const isInitialHandshake = this.previousCatalogId === null;
        const isCatalogChange =
          this.previousCatalogId !== null && this.previousCatalogId !== catalogId;

        if ((isInitialHandshake || isCatalogChange) && !this.isDraftModified) {
          const initial = this.getInitialDraft(catalogId);
          this._activeDraft.set(initial);
          this.userDraftInput$.next(initial);
        }

        this.previousCatalogId = catalogId;
      });

    const sharedA2uiPayload$ = this.startupConfigState.sharedA2uiPayload
      ? toObservable(this.startupConfigState.sharedA2uiPayload)
      : of(null);

    sharedA2uiPayload$
      .pipe(
        filter((payload): payload is string => !!payload),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((payload: string) => {
        this.injectExternalDraft(payload);
      });

    this.userDraftInput$
      .pipe(
        switchMap(val =>
          timer(300).pipe(
            map(() => val),
            takeUntil(this.cancelPendingDraftSync$),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((val: string) => {
        this.syncLayoutToHistory(val);
      });
  }

  /**
   * Caches a fresh raw layout text update inside volatile memory,
   * queueing synchronization.
   */
  updateDraft(value: string): void {
    this.isDraftModified = true;
    this._activeDraft.set(value);
    this.userDraftInput$.next(value);
  }

  /**
   * Injects an external layout draft (e.g. from deep link shared payload).
   */
  injectExternalDraft(value: string): void {
    this.isDraftModified = true;
    this._activeDraft.set(value);
    this.userDraftInput$.next(value);
  }

  /** Synchronizes the current sanitized canvas before a prompt is submitted. */
  syncActiveDraftToHistory(): void {
    this.syncLayoutToHistory(this._activeDraft());
  }

  /**
   * Whether the canvas holds a change the user or the assistant made, rather than
   * the renderer's sample or a blank New Session canvas.
   */
  hasEditedDraft(): boolean {
    return this.isDraftModified;
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
    this.cancelPendingDraftSync$.next();
    this.isDraftModified = true;
    // Restoring a previous draft after this response must update context again.
    this.lastSynchronizedLayout = null;
    this._activeDraft.set(value);
  }

  /**
   * Wipes all dynamic draft context instantly, resetting layout
   * memory to default.
   */
  flushDraft(): void {
    this.cancelPendingDraftSync$.next();
    this.isDraftModified = false;
    this.lastSynchronizedLayout = null;
    this.previousCatalogId = null;
    const catalog = this.catalogManagement.activeCatalog();
    let catalogId = catalog ? catalog.catalogId || catalog.$id || '' : '';
    const activeRenderer = this.startupConfigState.activeRenderer();
    if (!activeRenderer?.samplePayload && !catalogId) {
      catalogId = BASIC_CATALOG_ID;
    }
    const initial = this.getInitialDraft(catalogId);
    this._activeDraft.set(initial);
    if (initial) {
      this.userDraftInput$.next(initial);
    }
  }

  /**
   * Resets the active draft in-memory to a blank surface (createSurface only)
   * for the active catalog, cancels any pending user-edit debounce timer,
   * increments sessionResetNonce, and synchronously syncs the blank surface
   * into chat history.
   */
  resetToBlankDraft(): void {
    this.cancelPendingDraftSync$.next();
    const catalog = this.catalogManagement.activeCatalog();
    const effectiveCatalogId =
      (catalog ? catalog.catalogId || catalog.$id || '' : '') || BASIC_CATALOG_ID;
    this.isDraftModified = false;
    this.lastSynchronizedLayout = null;
    this.previousCatalogId = effectiveCatalogId;
    const blank = this.buildBlankSurfaceDraft(effectiveCatalogId);
    this._activeDraft.set(blank);
    this.sessionResetNonce.update(n => n + 1);
    this.syncLayoutToHistory(blank);
  }

  private getInitialDraft(catalogId: string): string {
    const activeRenderer = this.startupConfigState.activeRenderer();
    if (activeRenderer?.samplePayload) {
      return activeRenderer.samplePayload;
    }
    if (catalogId === BASIC_CATALOG_ID) {
      return CAR_BOOKING;
    }
    if (!catalogId) {
      return '';
    }
    return this.buildBlankSurfaceDraft(catalogId);
  }

  private buildBlankSurfaceDraft(catalogId: string): string {
    const draftObj: RenderA2uiItem[] = [
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'sample-surface',
          catalogId: catalogId,
          sendDataModel: true,
        },
      },
    ];
    return formatJson(draftObj);
  }

  /**
   * Normalizes, isolates, and synchronizes layouts changes into the trailing
   * history context node.
   */
  private syncLayoutToHistory(layout: string): void {
    // A model commit may have superseded an editor update still in the debounce queue.
    if (layout !== this._activeDraft()) {
      return;
    }
    const sanitizedLayoutString = this.sanitizeLayout(layout);
    if (!sanitizedLayoutString) {
      return;
    }
    const history = this.chatState.chatHistory();
    // Prompt submission can already have synchronized this pending editor update.
    if (history.length > 0 && sanitizedLayoutString === this.lastSynchronizedLayout) {
      return;
    }
    this.lastSynchronizedLayout = sanitizedLayoutString;

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
    // A2UI JSON array brackets.
    // This ensures plain user text prompt dispatches are preserved
    // completely intact!
    const isLastMessageLayoutSnapshot =
      lastMessage.role === MessageRole.USER && lastMessage.content.trim().startsWith('[');

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

    const parsed = tryParseJsonArray(trimmed);
    if (parsed.success) {
      const sanitized = parsed.data
        .map(block => {
          if (block && typeof block === 'object' && !Array.isArray(block)) {
            return this.sanitizeBlock(block as RenderA2uiItem);
          }
          return block;
        })
        .filter((b): b is RenderA2uiItem => b !== null);
      return formatJson(sanitized);
    }

    this.logger.warn(
      'Discarding malformed layout JSON during sanitization: not a valid JSON array',
    );
    // Return empty fallback content if parsing or sanitization fails completely
    return '';
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
        const filtered = updateComponents[COMPONENTS].filter((comp: unknown) => {
          if (comp !== null && typeof comp === 'object' && !Array.isArray(comp)) {
            const compObj = comp as A2uiComponentInstance;
            return compObj[ID] !== MOCK_RULES_CONTAINER;
          }
          return true;
        });

        updateComponents[COMPONENTS] = filtered.map((component: unknown) => {
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
