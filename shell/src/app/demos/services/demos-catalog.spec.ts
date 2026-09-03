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

import {TestBed} from '@angular/core/testing';
import {signal} from '@angular/core';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {ReplaySubject} from 'rxjs';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {
  HostCommunication,
  MessageEnvelope,
} from '../../shell/host-communication/host-communication';
import {PreviewBridgeMessageType, type Demo} from 'a2ui-bridge';
import {DemosCatalog} from './demos-catalog';
import {Catalog} from '../../storage/models/catalog-storage.model';

class MockCatalogManagement {
  readonly activeCatalog = signal<Catalog | null>(null);
}

class MockHostCommunication {
  sendToFrame = vi.fn();
  readonly messageStream$ = new ReplaySubject<MessageEnvelope>(1);
}

/** Builds a fake coordinator iframe with a distinct contentWindow identity. */
function createCoordinator(): HTMLIFrameElement {
  return {contentWindow: {} as Window} as HTMLIFrameElement;
}

describe('DemosCatalog', () => {
  let service: DemosCatalog;
  let catalogManagementMock: MockCatalogManagement;
  let hostCommunicationMock: MockHostCommunication;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DemosCatalog,
        {provide: CatalogManagement, useClass: MockCatalogManagement},
        {provide: HostCommunication, useClass: MockHostCommunication},
      ],
    });

    service = TestBed.inject(DemosCatalog);
    catalogManagementMock = TestBed.inject(CatalogManagement) as unknown as MockCatalogManagement;
    hostCommunicationMock = TestBed.inject(HostCommunication) as unknown as MockHostCommunication;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('sends no request until demosActive and activeCatalog are both set', () => {
    const coordinator = createCoordinator();
    service.setCoordinator(coordinator);

    service.setDemosActive(true);
    TestBed.tick();
    expect(hostCommunicationMock.sendToFrame).not.toHaveBeenCalled();

    catalogManagementMock.activeCatalog.set({components: {}});
    TestBed.tick();

    expect(hostCommunicationMock.sendToFrame).toHaveBeenCalledTimes(1);
    expect(hostCommunicationMock.sendToFrame).toHaveBeenCalledWith(
      {type: PreviewBridgeMessageType.GET_DEMOS},
      coordinator,
    );
  });

  it('caches a DEMOS envelope whose sourceWindow is the coordinator contentWindow', () => {
    const coordinator = createCoordinator();
    service.setCoordinator(coordinator);
    service.setDemosActive(true);
    catalogManagementMock.activeCatalog.set({components: {}});
    TestBed.tick();

    const demos: Demo[] = [{id: 'demo-1', name: 'Demo One', description: 'A demo', a2ui: []}];
    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.DEMOS,
      payload: demos,
      origin: 'http://localhost',
      timestamp: Date.now(),
      sourceWindow: coordinator.contentWindow,
    });
    TestBed.tick();

    expect(service.demos()).toEqual(demos);
  });

  it('drops null entries from a DEMOS payload instead of stranding the wall', () => {
    const coordinator = createCoordinator();
    service.setCoordinator(coordinator);
    service.setDemosActive(true);
    catalogManagementMock.activeCatalog.set({components: {}});
    TestBed.tick();

    const first: Demo = {id: 'demo-1', name: 'Demo One', description: 'A demo', a2ui: []};
    const second: Demo = {id: 'demo-2', name: 'Demo Two', description: 'Another demo', a2ui: []};

    // Reading `name` off a null entry throws inside the messageStream$
    // subscriber, where RxJS routes it to the global unhandled-error handler:
    // the envelope is dropped and `loadingDemos` never clears.
    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.DEMOS,
      payload: [first, null, second],
      origin: 'http://localhost',
      timestamp: Date.now(),
      sourceWindow: coordinator.contentWindow,
    });
    TestBed.tick();

    expect(service.demos()).toEqual([first, second]);
    expect(service.loadingDemos()).toBe(false);
  });

  it('preserves ampersands and angle brackets in demo name and description', () => {
    const coordinator = createCoordinator();
    service.setCoordinator(coordinator);
    service.setDemosActive(true);
    catalogManagementMock.activeCatalog.set({components: {}});
    TestBed.tick();

    const demos: Demo[] = [
      {id: 'demo-1', name: 'Tables & Charts', description: 'Q1 < Q2', a2ui: []},
    ];
    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.DEMOS,
      payload: demos,
      origin: 'http://localhost',
      timestamp: Date.now(),
      sourceWindow: coordinator.contentWindow,
    });
    TestBed.tick();

    // Both fields reach the DOM only through interpolation and a plain-text
    // [title] attribute, so HTML-encoding them here would surface literally
    // as "Tables &amp; Charts" on the card.
    expect(service.demos()).toEqual(demos);
  });

  it('replaces non-string demo text with an empty string', () => {
    const coordinator = createCoordinator();
    service.setCoordinator(coordinator);
    service.setDemosActive(true);
    catalogManagementMock.activeCatalog.set({components: {}});
    TestBed.tick();

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.DEMOS,
      payload: [{id: 'demo-1', name: {}, description: 42, a2ui: []}],
      origin: 'http://localhost',
      timestamp: Date.now(),
      sourceWindow: coordinator.contentWindow,
    });
    TestBed.tick();

    expect(service.demos()).toEqual([{id: 'demo-1', name: '', description: '', a2ui: []}]);
  });

  it('ignores a DEMOS envelope originating from a window other than the coordinator', () => {
    const coordinator = createCoordinator();
    service.setCoordinator(coordinator);
    service.setDemosActive(true);
    catalogManagementMock.activeCatalog.set({components: {}});
    TestBed.tick();

    const otherWindow = {} as Window;
    const demos: Demo[] = [{id: 'demo-1', name: 'Demo One', description: 'A demo', a2ui: []}];
    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.DEMOS,
      payload: demos,
      origin: 'http://localhost',
      timestamp: Date.now(),
      sourceWindow: otherWindow,
    });
    TestBed.tick();

    expect(service.demos()).toBeNull();
  });

  it('falls back to an empty array once the 2 second timeout elapses, once the coordinator has been ready', () => {
    vi.useFakeTimers();
    const coordinator = createCoordinator();
    service.setCoordinator(coordinator);
    service.setDemosActive(true);
    catalogManagementMock.activeCatalog.set({components: {}});
    TestBed.tick();

    // The initial request cannot be answered (the coordinator frame is still
    // on about:blank), so no fallback timer is armed for it yet. A
    // RENDERER_READY marks the coordinator ready and triggers the re-request
    // that the fallback timer below actually covers.
    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.RENDERER_READY,
      origin: 'http://localhost',
      timestamp: Date.now(),
      sourceWindow: coordinator.contentWindow,
    });
    TestBed.tick();

    expect(service.loadingDemos()).toBe(true);
    expect(service.demos()).toBeNull();

    vi.advanceTimersByTime(2000);

    expect(service.loadingDemos()).toBe(false);
    expect(service.demos()).toEqual([]);
  });

  it('leaves demos unresolved rather than falsely empty when the coordinator never reports ready', () => {
    vi.useFakeTimers();
    const coordinator = createCoordinator();
    service.setCoordinator(coordinator);
    service.setDemosActive(true);
    catalogManagementMock.activeCatalog.set({components: {}});
    TestBed.tick();

    expect(service.loadingDemos()).toBe(true);
    expect(service.demos()).toBeNull();

    // No RENDERER_READY ever arrives (e.g. a slow-booting dev bundle still
    // mid-boot). The initial request was never landable, so the fallback
    // timer must never have been armed for it: falling back to [] here
    // would flash "No Demos Available" over a renderer that is still coming
    // up.
    vi.advanceTimersByTime(2000);

    expect(service.loadingDemos()).toBe(true);
    expect(service.demos()).toBeNull();
  });

  it('arms the fallback when RENDERER_READY lands before activeCatalog resolves', () => {
    vi.useFakeTimers();
    const coordinator = createCoordinator();
    service.setDemosActive(true);
    service.setCoordinator(coordinator);
    TestBed.tick();

    // Real cold-load ordering, which the tests above invert: `CatalogManagement`
    // sends GET_CATALOG *in response to* RENDERER_READY and only sets
    // `activeCatalog` once the later A2UI_CATALOG reply lands. So the
    // coordinator reports ready while `activeCatalog` is still null, and that
    // boot has to be recorded even though the re-request below it is gated off.
    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.RENDERER_READY,
      origin: 'http://localhost',
      timestamp: Date.now(),
      sourceWindow: coordinator.contentWindow,
    });
    TestBed.tick();

    expect(hostCommunicationMock.sendToFrame).not.toHaveBeenCalled();

    catalogManagementMock.activeCatalog.set({components: {}});
    TestBed.tick();

    expect(hostCommunicationMock.sendToFrame).toHaveBeenCalledWith(
      {type: PreviewBridgeMessageType.GET_DEMOS},
      coordinator,
    );
    expect(service.loadingDemos()).toBe(true);

    // The coordinator has already proven it can respond, so a renderer that
    // never answers GET_DEMOS must still resolve to the empty state rather
    // than spinning on "Loading demos..." forever.
    vi.advanceTimersByTime(2000);

    expect(service.loadingDemos()).toBe(false);
    expect(service.demos()).toEqual([]);
  });

  it('clears the cache back to null when setDemosActive(false) is called', () => {
    const coordinator = createCoordinator();
    service.setCoordinator(coordinator);
    service.setDemosActive(true);
    catalogManagementMock.activeCatalog.set({components: {}});
    TestBed.tick();

    const demos: Demo[] = [{id: 'demo-1', name: 'Demo One', description: 'A demo', a2ui: []}];
    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.DEMOS,
      payload: demos,
      origin: 'http://localhost',
      timestamp: Date.now(),
      sourceWindow: coordinator.contentWindow,
    });
    TestBed.tick();
    expect(service.demos()).toEqual(demos);

    service.setDemosActive(false);
    TestBed.tick();

    expect(service.demos()).toBeNull();
  });

  it('requests demos once the coordinator registers after activation and catalog resolution', () => {
    // This mirrors the real route ordering: the route component activates
    // demos and the catalog resolves before the coordinator iframe's
    // viewChild query resolves and calls setCoordinator().
    service.setDemosActive(true);
    catalogManagementMock.activeCatalog.set({components: {}});
    TestBed.tick();

    expect(hostCommunicationMock.sendToFrame).not.toHaveBeenCalled();

    const coordinator = createCoordinator();
    service.setCoordinator(coordinator);
    TestBed.tick();

    expect(hostCommunicationMock.sendToFrame).toHaveBeenCalledWith(
      {type: PreviewBridgeMessageType.GET_DEMOS},
      coordinator,
    );
  });

  it('re-requests demos when a RENDERER_READY envelope arrives while the gate is open', () => {
    const coordinator = createCoordinator();
    service.setCoordinator(coordinator);
    service.setDemosActive(true);
    catalogManagementMock.activeCatalog.set({components: {}});
    TestBed.tick();

    expect(hostCommunicationMock.sendToFrame).toHaveBeenCalledTimes(1);

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.RENDERER_READY,
      origin: 'http://localhost',
      timestamp: Date.now(),
      sourceWindow: coordinator.contentWindow,
    });
    TestBed.tick();

    expect(hostCommunicationMock.sendToFrame).toHaveBeenCalledTimes(2);
    expect(hostCommunicationMock.sendToFrame).toHaveBeenLastCalledWith(
      {type: PreviewBridgeMessageType.GET_DEMOS},
      coordinator,
    );
  });

  it('dedupes a second RENDERER_READY envelope from the same window', () => {
    const coordinator = createCoordinator();
    service.setCoordinator(coordinator);
    service.setDemosActive(true);
    catalogManagementMock.activeCatalog.set({components: {}});
    TestBed.tick();

    expect(hostCommunicationMock.sendToFrame).toHaveBeenCalledTimes(1);

    const readyEnvelope: MessageEnvelope = {
      type: PreviewBridgeMessageType.RENDERER_READY,
      origin: 'http://localhost',
      timestamp: Date.now(),
      sourceWindow: coordinator.contentWindow,
    };

    hostCommunicationMock.messageStream$.next(readyEnvelope);
    TestBed.tick();
    expect(hostCommunicationMock.sendToFrame).toHaveBeenCalledTimes(2);

    // React <StrictMode> double-fires RENDERER_READY per frame mount; the
    // second envelope from the same window identity must not re-request.
    hostCommunicationMock.messageStream$.next(readyEnvelope);
    TestBed.tick();
    expect(hostCommunicationMock.sendToFrame).toHaveBeenCalledTimes(2);
  });

  it('re-requests demos when activeCatalog receives a new object identity', () => {
    const coordinator = createCoordinator();
    service.setCoordinator(coordinator);
    service.setDemosActive(true);
    catalogManagementMock.activeCatalog.set({components: {}});
    TestBed.tick();

    expect(hostCommunicationMock.sendToFrame).toHaveBeenCalledTimes(1);

    // A renderer switch produces a brand new Catalog object identity, even if
    // structurally similar to the previous one.
    catalogManagementMock.activeCatalog.set({components: {}});
    TestBed.tick();

    expect(hostCommunicationMock.sendToFrame).toHaveBeenCalledTimes(2);
  });
});
