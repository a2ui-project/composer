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

import {signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {ReplaySubject} from 'rxjs';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {RendererOption, SettingsService} from '../../settings/settings-service/settings.service';
import {
  HostCommunication,
  MessageEnvelope,
} from '../../shell/host-communication/host-communication';
import {StartupResolution} from '../../shell/startup-resolution/startup-resolution';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {Catalog} from '../../storage/models/catalog-storage.model';
import {RendererSelection} from './renderer-selection';

describe('RendererSelection', () => {
  const renderers: RendererOption[] = [
    {id: 'standard', name: 'Standard A2UI', rendererUrl: '/standard/', readOnly: true},
    {id: 'lit', name: 'Lit', rendererUrl: '/lit/', readOnly: true},
  ];
  const standardCatalog: Catalog = {catalogId: 'standard', components: {Text: {}}};
  const litCatalog: Catalog = {catalogId: 'lit', components: {Text: {}, Row: {}}};
  let service: RendererSelection;
  let frame: HTMLIFrameElement;
  let messages: ReplaySubject<MessageEnvelope>;
  let selectedRendererId: ReturnType<typeof signal<string | null>>;
  let resolvedUrl: ReturnType<typeof signal<string | null>>;
  let activeCatalog: ReturnType<typeof signal<Catalog | null>>;
  let isHandshakeInProgress: ReturnType<typeof signal<boolean>>;
  let catalogError: ReturnType<typeof signal<string | null>>;
  let isRendererReady: ReturnType<typeof signal<boolean>>;
  let configuredRenderers: ReturnType<typeof signal<RendererOption[]>>;
  let selectRenderer: ReturnType<typeof vi.fn<(id: string) => Promise<boolean>>>;
  let sendMessage: ReturnType<typeof vi.fn>;

  function emit(
    type: PreviewBridgeMessageType,
    payload?: unknown,
    sourceWindow = frame.contentWindow,
  ) {
    messages.next({type, payload, sourceWindow, origin: location.origin, timestamp: Date.now()});
    TestBed.flushEffects();
  }

  function ready() {
    frame.src = '/lit/?origin=http%3A%2F%2Flocalhost%3A3000&theme=dark';
    isRendererReady.set(true);
    isHandshakeInProgress.set(true);
    emit(PreviewBridgeMessageType.RENDERER_READY);
  }

  function finishCatalog(catalog = litCatalog) {
    emit(PreviewBridgeMessageType.A2UI_CATALOG, catalog);
    activeCatalog.set(structuredClone(catalog));
    isHandshakeInProgress.set(false);
    TestBed.flushEffects();
  }

  beforeEach(() => {
    vi.useFakeTimers();
    frame = document.createElement('iframe');
    document.body.append(frame);
    frame.src = '/standard/?theme=dark';
    messages = new ReplaySubject<MessageEnvelope>(1);
    selectedRendererId = signal<string | null>('standard');
    resolvedUrl = signal<string | null>('/standard/');
    activeCatalog = signal<Catalog | null>(standardCatalog);
    isHandshakeInProgress = signal(false);
    catalogError = signal<string | null>(null);
    isRendererReady = signal(true);
    configuredRenderers = signal(renderers);
    selectRenderer = vi.fn(async id => {
      selectedRendererId.set(id);
      resolvedUrl.set(renderers.find(renderer => renderer.id === id)?.rendererUrl ?? null);
      activeCatalog.set(null);
      catalogError.set(null);
      isRendererReady.set(false);
      return true;
    });
    sendMessage = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        RendererSelection,
        {
          provide: SettingsService,
          useValue: {
            renderers: configuredRenderers,
            getRenderers: configuredRenderers,
            selectedRendererId,
            selectRenderer,
          },
        },
        {provide: StartupResolution, useValue: {resolvedUrl}},
        {
          provide: CatalogManagement,
          useValue: {activeCatalog, isHandshakeInProgress, catalogError},
        },
        {
          provide: HostCommunication,
          useValue: {
            messageStream$: messages.asObservable(),
            isRendererReady,
            getIframeElement: () => frame,
            sendMessage,
          },
        },
      ],
    });
    service = TestBed.inject(RendererSelection);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    frame.remove();
    vi.useRealTimers();
  });

  it('exposes registered options and the active renderer reactively', () => {
    expect(service.activeRenderer()).toEqual(renderers[0]);
    configuredRenderers.set([renderers[1]]);
    expect(service.renderers()).toEqual([renderers[1]]);
    expect(service.activeRenderer()).toBeNull();
    selectedRendererId.set('lit');
    resolvedUrl.set('/lit/');
    expect(service.activeRenderer()).toEqual(renderers[1]);
  });

  it('does not reload an already ready selected renderer', async () => {
    await service.selectRenderer('standard');
    expect(selectRenderer).not.toHaveBeenCalled();
    expect(service.isSwitching()).toBe(false);
  });

  it('retries a failed handshake for the current renderer and waits for its new catalog', async () => {
    selectedRendererId.set('lit');
    resolvedUrl.set('/lit/');
    frame.src = '/lit/';
    activeCatalog.set(litCatalog);
    catalogError.set('Earlier handshake failed');
    selectRenderer.mockResolvedValue(true);
    const selection = service.selectRenderer('lit');
    await Promise.resolve();
    expect(sendMessage).toHaveBeenCalledWith({type: PreviewBridgeMessageType.GET_CATALOG});
    TestBed.flushEffects();
    await Promise.resolve();
    expect(service.isSwitching()).toBe(true);
    expect(service.error()).toBeNull();
    emit(PreviewBridgeMessageType.A2UI_CATALOG, litCatalog);
    activeCatalog.set(structuredClone(litCatalog));
    catalogError.set(null);
    TestBed.flushEffects();
    await selection;
    expect(service.error()).toBeNull();
  });

  it('rejects unregistered IDs without changing settings', async () => {
    await expect(service.selectRenderer('https://untrusted.example')).rejects.toThrow('registered');
    expect(selectRenderer).not.toHaveBeenCalled();
    expect(service.error()).toContain('registered');
  });

  it('waits for the selected iframe handshake and catalog processing, ignoring cached catalogs', async () => {
    const switched = vi.fn();
    const selection = service.selectRenderer('lit').then(switched);
    await Promise.resolve();
    activeCatalog.set(litCatalog);
    TestBed.flushEffects();
    await Promise.resolve();
    expect(switched).not.toHaveBeenCalled();
    ready();
    emit(PreviewBridgeMessageType.A2UI_CATALOG, litCatalog);
    await Promise.resolve();
    expect(switched).not.toHaveBeenCalled();
    activeCatalog.set(structuredClone(litCatalog));
    TestBed.flushEffects();
    await Promise.resolve();
    expect(switched).not.toHaveBeenCalled();
    isHandshakeInProgress.set(false);
    TestBed.flushEffects();
    await selection;
    expect(switched).toHaveBeenCalledOnce();
    expect(selectRenderer).toHaveBeenCalledWith('lit');
    expect(service.isSwitching()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('ignores replayed messages, old frames, and catalogs without a ready handshake', async () => {
    emit(PreviewBridgeMessageType.RENDERER_READY);
    const switched = vi.fn();
    const selection = service.selectRenderer('lit').then(switched);
    await Promise.resolve();
    frame.src = '/lit/';
    isRendererReady.set(true);
    finishCatalog();
    emit(PreviewBridgeMessageType.RENDERER_READY, undefined, window);
    finishCatalog();
    await Promise.resolve();
    expect(switched).not.toHaveBeenCalled();
    ready();
    finishCatalog();
    await selection;
    expect(switched).toHaveBeenCalledOnce();
  });

  it('rejects concurrent selection without interrupting the first switch', async () => {
    const selection = service.selectRenderer('lit');
    await expect(service.selectRenderer('standard')).rejects.toThrow('already in progress');
    expect(selectRenderer).toHaveBeenCalledOnce();
    ready();
    finishCatalog();
    await selection;
  });

  it('honors settings origin approval failures', async () => {
    selectRenderer.mockResolvedValue(false);
    await expect(service.selectRenderer('lit')).rejects.toThrow('not approved');
    expect(service.error()).toContain('not approved');
    expect(service.isSwitching()).toBe(false);
  });

  it('rejects if another settings surface changes the renderer while loading', async () => {
    const selection = service.selectRenderer('lit');
    const rejection = expect(selection).rejects.toThrow('changed before');
    await Promise.resolve();
    ready();
    selectedRendererId.set('standard');
    resolvedUrl.set('/standard/');
    TestBed.flushEffects();
    await rejection;
    finishCatalog();
    expect(service.error()).toContain('changed before');
  });

  it('rejects if a configured renderer URL changes during the handshake', async () => {
    const selection = service.selectRenderer('lit');
    const rejection = expect(selection).rejects.toThrow('changed before');
    await Promise.resolve();
    configuredRenderers.set([renderers[0], {...renderers[1], rendererUrl: '/other-lit/'}]);
    TestBed.flushEffects();
    await rejection;
  });

  it('surfaces renderer handshake errors without accepting a cached catalog', async () => {
    const selection = service.selectRenderer('lit');
    const rejection = expect(selection).rejects.toThrow('Invalid catalog');
    await Promise.resolve();
    ready();
    activeCatalog.set(litCatalog);
    catalogError.set('Invalid catalog');
    isHandshakeInProgress.set(false);
    TestBed.flushEffects();
    await rejection;
    expect(service.isSwitching()).toBe(false);
  });

  it('times out if the new renderer never sends a handshake', async () => {
    const selection = service.selectRenderer('lit');
    const rejection = expect(selection).rejects.toThrow('did not become ready');
    await vi.advanceTimersByTimeAsync(15_000);
    await rejection;
    expect(service.isSwitching()).toBe(false);
  });

  it('cancels a pending handshake and does not accept late messages', async () => {
    const controller = new AbortController();
    const selection = service.selectRenderer('lit', controller.signal);
    const rejection = expect(selection).rejects.toMatchObject({name: 'AbortError'});
    await Promise.resolve();
    ready();
    controller.abort(new DOMException('Renderer change canceled.', 'AbortError'));
    await rejection;
    finishCatalog();
    expect(service.error()).toContain('canceled');
    expect(service.isSwitching()).toBe(false);
  });

  it('does not change settings for an already canceled request', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(service.selectRenderer('lit', controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
    expect(selectRenderer).not.toHaveBeenCalled();
  });

  it('preserves the callers cancellation error', async () => {
    const controller = new AbortController();
    const cancellation = new Error('Generation stopped.');
    cancellation.name = 'CancelError';
    const selection = service.selectRenderer('lit', controller.signal);
    const rejection = expect(selection).rejects.toBe(cancellation);
    await Promise.resolve();
    controller.abort(cancellation);
    await rejection;
  });

  it('keeps the active label on the actual renderer when settings deny a new selection', async () => {
    selectRenderer.mockImplementation(async id => {
      selectedRendererId.set(id);
      return false;
    });
    await expect(service.selectRenderer('lit')).rejects.toThrow('not approved');
    expect(service.activeRenderer()).toEqual(renderers[0]);
  });

  it('ignores a stale catalog with the same ID but different components', async () => {
    const switched = vi.fn();
    const selection = service.selectRenderer('lit').then(switched);
    await Promise.resolve();
    ready();
    emit(PreviewBridgeMessageType.A2UI_CATALOG, litCatalog);
    activeCatalog.set({catalogId: 'lit', components: {Text: {}}});
    isHandshakeInProgress.set(false);
    TestBed.flushEffects();
    await Promise.resolve();
    expect(switched).not.toHaveBeenCalled();
    activeCatalog.set(structuredClone(litCatalog));
    TestBed.flushEffects();
    await selection;
  });

  it('keeps selection locked while settings approval is pending after cancellation', async () => {
    let approve!: (allowed: boolean) => void;
    selectRenderer.mockReturnValue(
      new Promise(resolve => {
        approve = resolve;
      }),
    );
    const controller = new AbortController();
    const selection = service.selectRenderer('lit', controller.signal);
    const rejection = expect(selection).rejects.toMatchObject({name: 'AbortError'});
    controller.abort();
    await rejection;
    expect(service.isSwitching()).toBe(true);
    approve(false);
    await Promise.resolve();
    await Promise.resolve();
    expect(service.isSwitching()).toBe(false);
  });
});
