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

import {DestroyRef, Injectable, Injector, computed, effect, inject, signal} from '@angular/core';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {sanitizeHtml} from 'safevalues';
import {SettingsService, RendererOption} from '../../settings/settings-service/settings.service';
import {HostCommunication} from '../../shell/host-communication/host-communication';
import {StartupResolution} from '../../shell/startup-resolution/startup-resolution';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {Catalog} from '../../storage/models/catalog-storage.model';
import {stableStringify} from '../../storage/stable-stringify/stable-stringify';

/** Shares renderer selection and catalog readiness between the composer and frontend tools. */
@Injectable({providedIn: 'root'})
export class RendererSelection {
  private readonly settings = inject(SettingsService);
  private readonly startup = inject(StartupResolution);
  private readonly host = inject(HostCommunication);
  private readonly catalog = inject(CatalogManagement);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly switching = signal(false);
  private readonly selectionError = signal<string | null>(null);

  readonly renderers = computed(() => {
    this.settings.renderers();
    return this.settings.getRenderers();
  });
  readonly selectedRendererId = this.settings.selectedRendererId;
  readonly activeRenderer = computed(() => {
    const resolvedUrl = this.startup.resolvedUrl();
    const selected = this.renderers().find(renderer => renderer.id === this.selectedRendererId());
    return selected?.rendererUrl === resolvedUrl
      ? selected
      : (this.renderers().find(renderer => renderer.rendererUrl === resolvedUrl) ?? null);
  });
  readonly isSwitching = this.switching.asReadonly();
  readonly error = this.selectionError.asReadonly();

  async selectRenderer(id: string, signal?: AbortSignal): Promise<void> {
    if (this.isSwitching()) {
      throw new Error('A renderer change is already in progress.');
    }
    this.selectionError.set(null);
    const renderer = this.renderers().find(option => option.id === id);
    if (!renderer) {
      const error = new Error('Choose a renderer registered in Composer settings.');
      this.selectionError.set(error.message);
      throw error;
    }
    if (signal?.aborted) {
      throw this.abortReason(signal);
    }
    const reuseCatalog = this.isReady(renderer);
    if (this.selectedRendererId() === id && reuseCatalog) return;

    this.switching.set(true);
    const wait = this.waitForCatalog(renderer, reuseCatalog, signal);
    let selectionSettled = false;
    // Settings owns origin approval and persistence. Keep the selector locked until that
    // operation settles, even if the caller cancels while an origin approval is pending.
    const selection = (
      signal ? this.settings.selectRenderer(id, signal) : this.settings.selectRenderer(id)
    ).then(
      allowed => {
        selectionSettled = true;
        if (!allowed) throw new Error('The selected renderer was not approved.');
        wait.acceptSelection();
      },
      error => {
        selectionSettled = true;
        throw error;
      },
    );
    try {
      await Promise.all([selection, wait.promise]);
    } catch (error) {
      this.selectionError.set(
        error instanceof Error || error instanceof DOMException
          ? error.message
          : 'Could not change the renderer.',
      );
      throw error;
    } finally {
      wait.dispose();
      if (selectionSettled) this.switching.set(false);
      else
        void selection.then(
          () => this.switching.set(false),
          () => this.switching.set(false),
        );
    }
  }

  private abortReason(signal?: AbortSignal): Error | DOMException {
    return signal?.reason instanceof Error || signal?.reason instanceof DOMException
      ? signal.reason
      : new DOMException('Renderer change canceled.', 'AbortError');
  }

  private isReady(renderer: RendererOption): boolean {
    return (
      this.startup.resolvedUrl() === renderer.rendererUrl &&
      this.frameMatches(renderer) &&
      this.host.isRendererReady() &&
      !!this.catalog.activeCatalog() &&
      !this.catalog.isHandshakeInProgress() &&
      !this.catalog.catalogError()
    );
  }

  private frameMatches(renderer: RendererOption): boolean {
    const frame = this.host.getIframeElement();
    if (!frame) return false;
    try {
      const actual = new URL(frame.src, document.baseURI);
      const expected = new URL(renderer.rendererUrl, document.baseURI);
      // The preview appends bridge origins and theme to the configured URL.
      for (const url of [actual, expected]) {
        url.searchParams.delete('origin');
        url.searchParams.delete('theme');
        url.searchParams.sort();
      }
      return actual.href === expected.href;
    } catch {
      return false;
    }
  }

  private waitForCatalog(renderer: RendererOption, reuseCatalog: boolean, signal?: AbortSignal) {
    let accepted = false;
    let settled = false;
    let targetSelected = false;
    let readySource: Window | null = null;
    let receivedCatalog = false;
    let catalogBeforeMessage: Catalog | null = null;
    let expectedCatalogId: string | undefined;
    let expectedCatalogString: string | undefined;
    const previousCatalogError = this.catalog.catalogError();
    let resolve!: () => void;
    let reject!: (reason: Error) => void;
    const promise = new Promise<void>((onResolve, onReject) => {
      resolve = onResolve;
      reject = onReject;
    });
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };
    const check = () => {
      const selectedId = this.selectedRendererId();
      const resolvedUrl = this.startup.resolvedUrl();
      const activeCatalog = this.catalog.activeCatalog();
      const handshakeInProgress = this.catalog.isHandshakeInProgress();
      const catalogError = this.catalog.catalogError();
      if (settled) return;
      if (selectedId === renderer.id) targetSelected = true;
      if (
        (targetSelected && selectedId !== renderer.id) ||
        (accepted && resolvedUrl !== renderer.rendererUrl) ||
        !this.renderers().some(
          option => option.id === renderer.id && option.rendererUrl === renderer.rendererUrl,
        )
      ) {
        fail(new Error('Renderer changed before its catalog was ready.'));
        return;
      }
      if (readySource && catalogError && catalogError !== previousCatalogError) {
        fail(new Error(`Could not load renderer: ${catalogError}`));
        return;
      }
      const freshCatalogReady =
        receivedCatalog &&
        activeCatalog !== catalogBeforeMessage &&
        !!activeCatalog &&
        (activeCatalog.catalogId || activeCatalog.$id) === expectedCatalogId &&
        stableStringify(activeCatalog) === expectedCatalogString &&
        !handshakeInProgress;
      if (accepted && (reuseCatalog || freshCatalogReady) && this.isReady(renderer)) {
        settled = true;
        resolve();
      }
    };
    // ReplaySubject's existing message is intentionally ignored: it belongs to the
    // previous handshake, even when both renderers have the same origin.
    let listening = false;
    const subscription = this.host.messageStream$.subscribe(envelope => {
      if (
        !listening ||
        settled ||
        this.selectedRendererId() !== renderer.id ||
        this.startup.resolvedUrl() !== renderer.rendererUrl ||
        !this.frameMatches(renderer)
      )
        return;
      const frameWindow = this.host.getIframeElement()?.contentWindow;
      if (!frameWindow || envelope.sourceWindow !== frameWindow) return;
      if (envelope.type === PreviewBridgeMessageType.RENDERER_READY) {
        readySource = frameWindow;
      } else if (
        envelope.type === PreviewBridgeMessageType.A2UI_CATALOG &&
        readySource === frameWindow
      ) {
        receivedCatalog = true;
        catalogBeforeMessage = this.catalog.activeCatalog();
        const payload = envelope.payload;
        if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
          const catalogId = 'catalogId' in payload ? payload.catalogId : undefined;
          const schemaId = '$id' in payload ? payload.$id : undefined;
          expectedCatalogId =
            typeof catalogId === 'string'
              ? catalogId
              : typeof schemaId === 'string'
                ? schemaId
                : undefined;
          const sanitizedCatalog = {...payload};
          if ('title' in sanitizedCatalog && typeof sanitizedCatalog.title === 'string') {
            sanitizedCatalog.title = sanitizeHtml(sanitizedCatalog.title).toString();
          }
          if (
            'description' in sanitizedCatalog &&
            typeof sanitizedCatalog.description === 'string'
          ) {
            sanitizedCatalog.description = sanitizeHtml(sanitizedCatalog.description).toString();
          }
          expectedCatalogString = stableStringify(sanitizedCatalog);
        }
      }
      check();
    });
    listening = true;
    const watcher = effect(check, {injector: this.injector});
    const timer = setTimeout(
      () => fail(new Error('Renderer did not become ready. Try selecting it again.')),
      15_000,
    );
    const onAbort = () => fail(this.abortReason(signal));
    signal?.addEventListener('abort', onAbort, {once: true});
    const unregisterDestroy = this.destroyRef.onDestroy(onAbort);
    return {
      promise,
      acceptSelection: () => {
        if (settled) return;
        accepted = true;
        targetSelected = true;
        check();
        // Retry an existing, failed or unfinished handshake without reloading the
        // renderer or accepting its cached catalog as a completed handshake.
        if (
          !settled &&
          !readySource &&
          this.host.isRendererReady() &&
          this.frameMatches(renderer)
        ) {
          readySource = this.host.getIframeElement()?.contentWindow ?? null;
          this.host.sendMessage({type: PreviewBridgeMessageType.GET_CATALOG});
        }
      },
      dispose: () => {
        settled = true;
        clearTimeout(timer);
        watcher.destroy();
        subscription.unsubscribe();
        signal?.removeEventListener('abort', onAbort);
        unregisterDestroy();
      },
    };
  }
}
