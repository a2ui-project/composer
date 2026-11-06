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
import {filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {ChatState} from '../chat-state/chat-state';
import {ChatCleaner} from '../chat-cleaner/chat-cleaner';
import {MessageRole} from '../llm-client/llm-client';
import {BASIC_CATALOG_ID_V0_9, BASIC_CATALOG_ID_V1_0} from '../chat-service/initial-draft';
import {
  DraftProtocolStrategy,
  isUntouchedStarterDraft,
  isUntouchedBlankDraft,
} from '../chat-service/draft-protocol-strategy';
import {V09DraftStrategy} from '../chat-service/v0-9-draft-strategy';
import {V10DraftStrategy} from '../chat-service/v1-0-draft-strategy';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import type {A2uiProtocolVersion} from 'a2ui-bridge';
import {StartupConfigStateService} from '../../shell/startup-resolution/state/startup-config-state.service';
import {ErrorLogger} from '../../debug/error-logger.service';
import {getCatalogId} from '../../storage/models/catalog-storage.model';

/**
 * Manages in-memory volatile autosave draft layouts and bidirectionally
 * synchronizes active editor modifications directly into the LLM history log
 * context. Excludes mock rules configurations aggressively to establish context
 * security isolation, debounces canvas updates to reduce network payloads,
 * and provides state hydration to prevent layout data loss across session
 * navigation swappings.
 */
@Injectable({
  providedIn: 'root',
})
export class StateSync {
  private readonly destroyRef = inject(DestroyRef);
  private readonly chatState = inject(ChatState);
  private readonly chatCleaner = inject(ChatCleaner);
  private readonly catalogManagement = inject(CatalogManagement);
  private readonly startupConfigState = inject(StartupConfigStateService);
  private readonly logger = inject(ErrorLogger).withTag('[StateSync]');
  private readonly v09Strategy = inject(V09DraftStrategy);
  private readonly v10Strategy = inject(V10DraftStrategy);

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
  private isDraftEdited = false;
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
    toObservable(this.catalogManagement.activeCatalog)
      .pipe(
        filter(catalog => !!catalog),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(catalog => {
        const catalogId = getCatalogId(catalog!) || '';
        const isInitialHandshake = this.previousCatalogId === null;
        const isCatalogChange =
          this.previousCatalogId !== null && this.previousCatalogId !== catalogId;

        if ((isInitialHandshake || isCatalogChange) && !this.isDraftEdited) {
          const initial = this.getInitialDraft(catalogId);
          this._activeDraft.set(initial);
          this.userDraftInput$.next(initial);
        }

        this.previousCatalogId = catalogId;
      });

    toObservable(this.catalogManagement.activeProtocolVersion)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(version => {
        this.handleProtocolVersionChange(version);
      });

    toObservable(this.catalogManagement.hasReceivedCatalogResponse)
      .pipe(
        filter(received => received),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.handleProtocolVersionChange(this.getActiveProtocolVersion());
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
        // While a response streams, its model turn must stay the conversation's last
        // turn. The editor and preview are locked then, so a canvas change can only be
        // a reset to the renderer's sample, for example after the assistant switched
        // renderers; the response replaces it, and the next prompt sends the canvas
        // with its request either way.
        if (this.chatState.isProgrammaticStreamActive()) {
          return;
        }
        this.syncLayoutToHistory(val);
      });
  }

  /**
   * Caches a fresh raw layout text update inside volatile memory,
   * queueing synchronization.
   */
  updateDraft(value: string): void {
    this.isDraftEdited = true;
    this._activeDraft.set(value);
    this.userDraftInput$.next(value);
  }

  /**
   * Injects an external layout draft (e.g. from deep link shared payload).
   */
  injectExternalDraft(value: string): void {
    this.isDraftEdited = true;
    this._activeDraft.set(value);
    this.userDraftInput$.next(value);
  }

  /** Synchronizes the current sanitized canvas before a prompt is submitted. */
  syncActiveDraftToHistory(): void {
    this.syncLayoutToHistory(this._activeDraft());
  }

  /**
   * Whether the canvas has been edited since it was last reset to the renderer's sample
   * or a blank New Session canvas. An edit is anything that replaces the canvas: the user
   * typing in the JSON editor, an assistant response that changes it, or a shared link
   * opening a design. The canvas stays edited even if it's changed back to match the
   * sample.
   */
  hasEditedDraft(): boolean {
    return this.isDraftEdited;
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
    this.isDraftEdited = true;
    // Record the sanitized layout committed by the model so follow-up prompts without
    // editor modifications do not append a duplicate USER snapshot, while restoring a
    // previous draft still updates context.
    this.lastSynchronizedLayout = this.sanitizeLayout(value) || null;
    this._activeDraft.set(value);
  }

  /**
   * Wipes all dynamic draft context instantly, resetting layout
   * memory to default.
   */
  flushDraft(): void {
    this.cancelPendingDraftSync$.next();
    this.isDraftEdited = false;
    this.lastSynchronizedLayout = null;
    this.previousCatalogId = null;
    const catalog = this.catalogManagement.activeCatalog();
    let catalogId = (catalog && getCatalogId(catalog)) || '';
    const activeRenderer = this.startupConfigState.activeRenderer();
    if (!activeRenderer?.samplePayload && !catalogId) {
      catalogId =
        this.getActiveProtocolVersion() === 'v1.0' ? BASIC_CATALOG_ID_V1_0 : BASIC_CATALOG_ID_V0_9;
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
    const version = this.getActiveProtocolVersion();
    const defaultCatalogId = version === 'v1.0' ? BASIC_CATALOG_ID_V1_0 : BASIC_CATALOG_ID_V0_9;
    const effectiveCatalogId = (catalog && getCatalogId(catalog)) || defaultCatalogId;
    this.isDraftEdited = false;
    this.lastSynchronizedLayout = null;
    this.previousCatalogId = effectiveCatalogId;
    const strategy = this.getStrategy(version);
    const blank = strategy.getBlankDraft(effectiveCatalogId);
    this._activeDraft.set(blank);
    this.sessionResetNonce.update(n => n + 1);
    this.syncLayoutToHistory(blank);
  }

  private handleProtocolVersionChange(version: A2uiProtocolVersion): void {
    if (!this.hasReceivedCatalogResponse()) {
      return;
    }

    if (this.isDraftEdited) {
      return; // Strictly preserve any user-edited or URL-bootstrapped draft!
    }

    const currentDraft = this._activeDraft();
    const strategy = this.getStrategy(version);
    const catalog = this.catalogManagement.activeCatalog();
    let targetCatalogId = (catalog?.catalogId || catalog?.$id || '') as string;
    if (targetCatalogId === BASIC_CATALOG_ID_V0_9 && version === 'v1.0') {
      targetCatalogId = BASIC_CATALOG_ID_V1_0;
    } else if (targetCatalogId === BASIC_CATALOG_ID_V1_0 && version === 'v0.9') {
      targetCatalogId = BASIC_CATALOG_ID_V0_9;
    }

    if (isUntouchedStarterDraft(currentDraft)) {
      const newStarter = strategy.getStarterDraft(targetCatalogId);
      if (newStarter !== currentDraft) {
        this._activeDraft.set(newStarter);
        this.userDraftInput$.next(newStarter);
      }
    } else if (isUntouchedBlankDraft(currentDraft)) {
      const newBlank = strategy.getBlankDraft(targetCatalogId || undefined);
      if (newBlank !== currentDraft) {
        this._activeDraft.set(newBlank);
        this.userDraftInput$.next(newBlank);
      }
    }
  }

  private getStrategy(version?: A2uiProtocolVersion): DraftProtocolStrategy {
    const v = version ?? this.getActiveProtocolVersion();
    return v === 'v1.0' ? this.v10Strategy : this.v09Strategy;
  }

  private getActiveProtocolVersion(): A2uiProtocolVersion {
    return this.catalogManagement.activeProtocolVersion();
  }

  private hasReceivedCatalogResponse(): boolean {
    return this.catalogManagement.hasReceivedCatalogResponse();
  }

  private getInitialDraft(catalogId: string): string {
    const activeRenderer = this.startupConfigState.activeRenderer();
    if (activeRenderer?.samplePayload) {
      return activeRenderer.samplePayload;
    }
    if (!catalogId) {
      return '';
    }
    const version = this.getActiveProtocolVersion();
    const strategy = this.getStrategy(version);
    if (
      catalogId === BASIC_CATALOG_ID_V0_9 ||
      catalogId === BASIC_CATALOG_ID_V1_0 ||
      catalogId === 'https://a2ui.org/specification/v0_9/basic_catalog.json'
    ) {
      return strategy.getStarterDraft(catalogId);
    }
    return strategy.getBlankDraft(catalogId);
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
          isSnapshot: true,
        },
      ]);
      return;
    }

    const lastMessage = history[history.length - 1];
    // Verify that the last message is an unprompted user layout snapshot so
    // plain user text prompts (including those starting with '[') are preserved intact.
    const isLastMessageLayoutSnapshot = this.chatCleaner.isUserLayoutSnapshot(lastMessage);

    if (isLastMessageLayoutSnapshot) {
      // Overwrite trailing turn in-place to avoid array inflation
      // (prompt bloat!)
      const updatedHistory = [...history];
      updatedHistory[updatedHistory.length - 1] = {
        role: MessageRole.USER,
        content: sanitizedLayoutString,
        isSnapshot: true,
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
          isSnapshot: true,
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
    if (trimmed.includes('"v1.0"') || trimmed.includes('"1.0"')) {
      const sanitized = this.v10Strategy.sanitizeLayout(trimmed);
      if (!sanitized) {
        this.logger.warn(
          'Discarding malformed layout JSON during sanitization: not a valid JSON array',
        );
      }
      return sanitized;
    }
    const sanitized = this.getStrategy().sanitizeLayout(trimmed);
    if (!sanitized) {
      this.logger.warn(
        'Discarding malformed layout JSON during sanitization: not a valid JSON array',
      );
    }
    return sanitized;
  }
}
