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

import {
  DestroyRef,
  EffectRef,
  Injectable,
  Injector,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {Subscription} from 'rxjs';
import {sanitizeHtml} from 'safevalues';
import {SettingsService, RendererOption} from '../../settings/settings-service/settings.service';
import {
  HostCommunication,
  MessageEnvelope,
} from '../../shell/host-communication/host-communication';
import {PreviewUrlParam} from '../../preview/preview-url-param';
import {StartupResolution} from '../../shell/startup-resolution/startup-resolution';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {Catalog} from '../../storage/models/catalog-storage.model';
import {stableStringify} from '../../storage/stable-stringify/stable-stringify';

/** How long a newly selected renderer has to load and send its catalog. */
const CATALOG_TIMEOUT_MS = 15_000;

/**
 * Switches the preview to another configured renderer and reports when it's
 * ready to generate against: loaded, handshaken, and with its catalog active.
 *
 * Use it wherever a preview is open and a prompt may follow right away: the
 * chat panel's renderer menu, and a model tool that switches renderers
 * mid-conversation. It calls `SettingsService.selectRenderer`, which saves the
 * choice and asks the user to allow a new origin, and then waits for the
 * preview. The Settings page calls `SettingsService.selectRenderer` directly,
 * because it shows no preview to wait for.
 *
 * While a switch is in progress, `isSwitching` is true; if it fails, `error`
 * holds a message for the user.
 */
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
    return selected && isSameUrl(selected.rendererUrl, resolvedUrl)
      ? selected
      : (this.renderers().find(renderer => isSameUrl(renderer.rendererUrl, resolvedUrl)) ?? null);
  });
  readonly isSwitching = this.switching.asReadonly();
  /** Why the last switch failed, shown under the chat panel's renderer menu. */
  readonly error = this.selectionError.asReadonly();

  /**
   * Selects the renderer and resolves once its catalog is active.
   *
   * @throws If the renderer isn't configured, isn't allowed, doesn't become
   *     ready in time, or the selection changes or is canceled first. The
   *     message is also published through `error`.
   */
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
      throw abortReason(signal);
    }
    const reuseCatalog = this.isReady(renderer);
    if (this.selectedRendererId() === id && reuseCatalog) {
      return;
    }

    this.switching.set(true);
    const wait = new CatalogWait(this.catalogWaitHost(), renderer, reuseCatalog, signal);
    let selectionSettled = false;
    // Settings owns origin approval and persistence. Keep the selector locked until that
    // operation settles, even if the caller cancels while an origin approval is pending.
    const selection = this.settings.selectRenderer(id, signal).then(
      allowed => {
        selectionSettled = true;
        if (!allowed) {
          throw new Error(this.notAllowedMessage(renderer));
        }
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
      if (selectionSettled) {
        this.switching.set(false);
      } else {
        void selection.then(
          () => this.switching.set(false),
          () => this.switching.set(false),
        );
      }
    }
  }

  /**
   * Explains why Settings declined the renderer and what the user can do.
   *
   * Renderers from the app config or saved in Settings are trusted, so from the
   * renderer menu this means the URL isn't HTTP(S). Settings also declines an
   * origin that isn't configured when the user chooses Deny in the origin
   * confirmation dialog.
   */
  private notAllowedMessage(renderer: RendererOption): string {
    let url: URL | null = null;
    try {
      url = new URL(renderer.rendererUrl, document.baseURI);
    } catch {
      // Reported below as an unusable URL.
    }
    if (!url || (url.protocol !== 'http:' && url.protocol !== 'https:')) {
      return `Couldn't switch to ${renderer.name} because its URL isn't an http or https address. Fix its URL in Settings, or choose another renderer.`;
    }
    return `Couldn't switch to ${renderer.name} because loading renderers from ${url.origin} wasn't allowed. Choose it again and select Allow, or choose another renderer.`;
  }

  /** Whether the preview already shows the renderer with a usable catalog. */
  private isReady(renderer: RendererOption): boolean {
    return (
      isSameUrl(renderer.rendererUrl, this.startup.resolvedUrl()) &&
      this.frameMatches(renderer) &&
      this.host.isRendererReady() &&
      !!this.catalog.activeCatalog() &&
      !this.catalog.isHandshakeInProgress() &&
      !this.catalog.catalogError()
    );
  }

  /** Whether the preview iframe is loaded from the renderer's URL. */
  private frameMatches(renderer: RendererOption): boolean {
    const frame = this.host.getIframeElement();
    if (!frame) {
      return false;
    }
    try {
      const actual = new URL(frame.src, document.baseURI);
      const expected = new URL(renderer.rendererUrl, document.baseURI);
      // Drop the parameters the preview adds, so only the renderer's own URL is compared.
      for (const url of [actual, expected]) {
        for (const param of Object.values(PreviewUrlParam)) {
          url.searchParams.delete(param);
        }
        url.searchParams.sort();
      }
      return actual.href === expected.href;
    } catch {
      return false;
    }
  }

  private catalogWaitHost(): CatalogWaitHost {
    return {
      host: this.host,
      catalog: this.catalog,
      injector: this.injector,
      destroyRef: this.destroyRef,
      selectedRendererId: () => this.selectedRendererId(),
      resolvedUrl: () => this.startup.resolvedUrl(),
      renderers: () => this.renderers(),
      frameMatches: renderer => this.frameMatches(renderer),
      isReady: renderer => this.isReady(renderer),
    };
  }
}

/** What a {@link CatalogWait} reads from the app while it waits. */
interface CatalogWaitHost {
  host: HostCommunication;
  catalog: CatalogManagement;
  injector: Injector;
  destroyRef: DestroyRef;
  selectedRendererId(): string | null;
  resolvedUrl(): string | null;
  renderers(): RendererOption[];
  frameMatches(renderer: RendererOption): boolean;
  isReady(renderer: RendererOption): boolean;
}

/**
 * Waits for a newly selected renderer to finish its handshake and deliver its
 * catalog, so generation never starts against the previous renderer's catalog.
 *
 * It resolves once Settings has accepted the selection, the preview shows the
 * renderer, and its catalog is active: either the one the renderer just sent,
 * or the current one when the renderer was already loaded (`reuseCatalog`).
 * It rejects if the selection changes, the renderer reports a catalog error,
 * the caller aborts, the app is destroyed, or the renderer takes too long.
 *
 * Progress is re-checked whenever a bridge message arrives or any signal it
 * reads changes.
 */
class CatalogWait {
  readonly promise: Promise<void>;
  private resolve!: () => void;
  private reject!: (reason: Error) => void;
  private settled = false;

  /** Settings has allowed and committed the selection. */
  private accepted = false;
  /** The selection has pointed at this renderer at least once. */
  private targetSelected = false;
  /** The preview window that announced RENDERER_READY for this handshake. */
  private readySource: Window | null = null;
  /** The catalog the renderer sent, to recognize it once it's active. */
  private receivedCatalog: {
    previous: Catalog | null;
    id: string | undefined;
    fingerprint: string | undefined;
  } | null = null;
  /** A catalog error that predates this switch and shouldn't fail it. */
  private readonly previousCatalogError: string | null;

  private readonly subscription: Subscription;
  private readonly watcher: EffectRef;
  private readonly timer: ReturnType<typeof setTimeout>;
  private readonly onAbort = () => this.fail(abortReason(this.signal));
  private readonly unregisterDestroy: () => void;

  constructor(
    private readonly app: CatalogWaitHost,
    private readonly renderer: RendererOption,
    private readonly reuseCatalog: boolean,
    private readonly signal?: AbortSignal,
  ) {
    this.promise = new Promise<void>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
    this.previousCatalogError = app.catalog.catalogError();
    // The message stream replays its latest message on subscription. That message
    // belongs to the previous handshake, even when both renderers share an origin,
    // so ignore anything delivered before the subscription is in place.
    let listening = false;
    this.subscription = app.host.messageStream$.subscribe(envelope => {
      if (listening) {
        this.onBridgeMessage(envelope);
      }
    });
    listening = true;
    this.watcher = effect(() => this.check(), {injector: app.injector});
    this.timer = setTimeout(
      () => this.fail(new Error('Renderer did not become ready. Try selecting it again.')),
      CATALOG_TIMEOUT_MS,
    );
    signal?.addEventListener('abort', this.onAbort, {once: true});
    this.unregisterDestroy = app.destroyRef.onDestroy(this.onAbort);
  }

  /** Called once Settings has committed the selection. */
  acceptSelection(): void {
    if (this.settled) {
      return;
    }
    this.accepted = true;
    this.targetSelected = true;
    this.check();
    // If the renderer was already loaded but its handshake failed or never
    // finished, ask it for its catalog again rather than reloading it or
    // treating the cached catalog as a finished handshake.
    if (
      !this.settled &&
      !this.readySource &&
      this.app.host.isRendererReady() &&
      this.app.frameMatches(this.renderer)
    ) {
      this.readySource = this.app.host.getIframeElement()?.contentWindow ?? null;
      this.app.host.sendMessage({type: PreviewBridgeMessageType.GET_CATALOG});
    }
  }

  /** Stops listening. Safe to call more than once. */
  dispose(): void {
    this.settled = true;
    clearTimeout(this.timer);
    this.watcher.destroy();
    this.subscription.unsubscribe();
    this.signal?.removeEventListener('abort', this.onAbort);
    this.unregisterDestroy();
  }

  /** Records the handshake messages sent by this renderer's preview window. */
  private onBridgeMessage(envelope: MessageEnvelope): void {
    if (this.settled || !this.isFromRendererFrame(envelope)) {
      return;
    }
    if (envelope.type === PreviewBridgeMessageType.RENDERER_READY) {
      this.readySource = envelope.sourceWindow ?? null;
    } else if (
      envelope.type === PreviewBridgeMessageType.A2UI_CATALOG &&
      this.readySource === envelope.sourceWindow
    ) {
      this.recordCatalog(envelope.payload);
    }
    this.check();
  }

  /** Whether the message came from the preview iframe while it shows this renderer. */
  private isFromRendererFrame(envelope: MessageEnvelope): boolean {
    if (
      this.app.selectedRendererId() !== this.renderer.id ||
      !isSameUrl(this.renderer.rendererUrl, this.app.resolvedUrl()) ||
      !this.app.frameMatches(this.renderer)
    ) {
      return false;
    }
    const frameWindow = this.app.host.getIframeElement()?.contentWindow;
    return !!frameWindow && envelope.sourceWindow === frameWindow;
  }

  /**
   * Remembers the catalog the renderer sent so `check` can tell when it has
   * become the active catalog. CatalogManagement sanitizes the title and
   * description before storing a catalog, so the fingerprint does the same.
   */
  private recordCatalog(payload: unknown): void {
    let id: string | undefined;
    let fingerprint: string | undefined;
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      const catalogId = 'catalogId' in payload ? payload.catalogId : undefined;
      const schemaId = '$id' in payload ? payload.$id : undefined;
      id =
        typeof catalogId === 'string'
          ? catalogId
          : typeof schemaId === 'string'
            ? schemaId
            : undefined;
      const sanitized = {...payload};
      if ('title' in sanitized && typeof sanitized.title === 'string') {
        sanitized.title = sanitizeHtml(sanitized.title).toString();
      }
      if ('description' in sanitized && typeof sanitized.description === 'string') {
        sanitized.description = sanitizeHtml(sanitized.description).toString();
      }
      fingerprint = stableStringify(sanitized);
    }
    this.receivedCatalog = {previous: this.app.catalog.activeCatalog(), id, fingerprint};
  }

  /** Settles the wait if the switch has succeeded or can no longer succeed. */
  private check(): void {
    // Read every signal first, so the effect tracks them even when it returns early.
    const selectedId = this.app.selectedRendererId();
    const resolvedUrl = this.app.resolvedUrl();
    const activeCatalog = this.app.catalog.activeCatalog();
    const handshakeInProgress = this.app.catalog.isHandshakeInProgress();
    const catalogError = this.app.catalog.catalogError();
    if (this.settled) {
      return;
    }
    if (selectedId === this.renderer.id) {
      this.targetSelected = true;
    }
    if (this.selectionChanged(selectedId, resolvedUrl)) {
      this.fail(new Error('Renderer changed before its catalog was ready.'));
      return;
    }
    if (this.readySource && catalogError && catalogError !== this.previousCatalogError) {
      this.fail(new Error(`Could not load renderer: ${catalogError}`));
      return;
    }
    const catalogReady =
      this.reuseCatalog || this.isReceivedCatalogActive(activeCatalog, handshakeInProgress);
    if (this.accepted && catalogReady && this.app.isReady(this.renderer)) {
      this.settled = true;
      this.resolve();
    }
  }

  /**
   * Whether something else has moved the selection away from this renderer:
   * another selection after this one was made, a different preview URL after
   * Settings accepted it, or the renderer being removed or edited in Settings.
   */
  private selectionChanged(selectedId: string | null, resolvedUrl: string | null): boolean {
    return (
      (this.targetSelected && selectedId !== this.renderer.id) ||
      (this.accepted && !isSameUrl(this.renderer.rendererUrl, resolvedUrl)) ||
      !this.app
        .renderers()
        .some(
          option =>
            option.id === this.renderer.id && option.rendererUrl === this.renderer.rendererUrl,
        )
    );
  }

  /** Whether the catalog this renderer sent is now the active, settled catalog. */
  private isReceivedCatalogActive(
    activeCatalog: Catalog | null,
    handshakeInProgress: boolean,
  ): boolean {
    const received = this.receivedCatalog;
    return (
      !!received &&
      !!activeCatalog &&
      activeCatalog !== received.previous &&
      (activeCatalog.catalogId || activeCatalog.$id) === received.id &&
      stableStringify(activeCatalog) === received.fingerprint &&
      !handshakeInProgress
    );
  }

  private fail(error: Error): void {
    if (this.settled) {
      return;
    }
    this.settled = true;
    this.reject(error);
  }
}

/**
 * Whether two renderer URLs address the same page. A renderer opened from a
 * `?renderer=` link resolves to a normalized URL, so `http://host:3456` and
 * `http://host:3456/` must match.
 */
function isSameUrl(configuredUrl: string, resolvedUrl: string | null): boolean {
  if (resolvedUrl === null) {
    return false;
  }
  try {
    return (
      new URL(configuredUrl, document.baseURI).href === new URL(resolvedUrl, document.baseURI).href
    );
  } catch {
    return configuredUrl === resolvedUrl;
  }
}

function abortReason(signal?: AbortSignal): Error | DOMException {
  return signal?.reason instanceof Error || signal?.reason instanceof DOMException
    ? signal.reason
    : new DOMException('Renderer change canceled.', 'AbortError');
}
