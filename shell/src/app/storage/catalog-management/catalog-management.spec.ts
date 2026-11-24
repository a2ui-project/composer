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
import {ErrorLogger} from '../../debug/error-logger.service';
import {CatalogManagement} from './catalog-management';
import {
  HostCommunication,
  MessageEnvelope,
} from '../../shell/host-communication/host-communication';
import {IndexedDbStorage} from '../indexed-db-storage/indexed-db-storage';
import {StartupResolution} from '../../shell/startup-resolution/startup-resolution';
import {signal, Signal, WritableSignal} from '@angular/core';
import {Subject} from 'rxjs';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {Catalog, getCatalogId} from '../models/catalog-storage.model';
import {stableStringify} from '../stable-stringify/stable-stringify';

describe('CatalogManagement', () => {
  let service: CatalogManagement;
  let hostCommunicationMock: {
    latestEnvelope: WritableSignal<MessageEnvelope | null>;
    messageStream$: Subject<MessageEnvelope>;
    windowUnregistered$: Subject<Window>;
    sendMessage: ReturnType<typeof vi.fn>;
    isRegisteredWindow: ReturnType<typeof vi.fn>;
  };
  let indexedDbStorageMock: {
    getCatalogRecord: ReturnType<typeof vi.fn>;
    saveCatalogRecord: ReturnType<typeof vi.fn>;
  };
  let resolvedUrlSignal: WritableSignal<string | null>;
  let startupResolutionMock: {
    getResolvedRendererUrl: ReturnType<typeof vi.fn>;
    resolvedUrl: Signal<string | null>;
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    vi.useFakeTimers();
    vi.spyOn(crypto.subtle, 'digest').mockResolvedValue(new Uint8Array(32).buffer);

    hostCommunicationMock = {
      latestEnvelope: signal<MessageEnvelope | null>(null),
      messageStream$: new Subject<MessageEnvelope>(),
      windowUnregistered$: new Subject<Window>(),
      sendMessage: vi.fn(),
      isRegisteredWindow: vi.fn().mockReturnValue(true),
    };

    indexedDbStorageMock = {
      getCatalogRecord: vi.fn().mockResolvedValue(null),
      saveCatalogRecord: vi.fn().mockResolvedValue(undefined),
    };

    resolvedUrlSignal = signal<string | null>('http://localhost/renderer');
    startupResolutionMock = {
      getResolvedRendererUrl: vi.fn().mockReturnValue('http://localhost/renderer'),
      resolvedUrl: resolvedUrlSignal.asReadonly(),
    };

    TestBed.configureTestingModule({
      providers: [
        CatalogManagement,
        {
          provide: HostCommunication,
          useValue: hostCommunicationMock,
        },
        {
          provide: IndexedDbStorage,
          useValue: indexedDbStorageMock,
        },
        {
          provide: StartupResolution,
          useValue: startupResolutionMock,
        },
      ],
    });

    service = TestBed.inject(CatalogManagement);
  });

  afterEach(() => {
    hostCommunicationMock.latestEnvelope.set(null);
    TestBed.tick();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  async function flushMicrotasks(count = 10): Promise<void> {
    for (let i = 0; i < count; i++) {
      await Promise.resolve();
    }
  }

  /**
   * Unregisters `target` the way HostCommunication.unregisterIframe does: the
   * window leaves the registry first, then the notification is emitted.
   */
  function unregisterWindow(registered: Set<Window>, target: Window): void {
    registered.delete(target);
    hostCommunicationMock.windowUnregistered$.next(target);
  }

  /** Completes a live RENDERER_READY to A2UI_CATALOG handshake from `source`. */
  async function establishLiveCatalog(source: Window, catalogId: string): Promise<void> {
    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.RENDERER_READY,
      origin: 'http://localhost',
      timestamp: 1,
      sourceWindow: source,
    });
    TestBed.tick();
    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload: {catalogId, protocolVersion: '1.0'},
      timestamp: 2,
      sourceWindow: source,
    });
    TestBed.tick();
    await flushMicrotasks();
  }

  function announceRendererReady(source: Window): void {
    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.RENDERER_READY,
      origin: 'http://localhost',
      timestamp: 3,
      sourceWindow: source,
    });
    TestBed.tick();
  }

  it('initializes successfully with handshake not in progress', () => {
    expect(service).toBeTruthy();
    expect(service.isHandshakeInProgress()).toBe(false);
    expect(service.catalogError()).toBeNull();
    expect(service.activeCatalog()).toBeNull();

    expect(service.catalogHashDelta()).toBe(false);
    expect(service.activeCatalogTitle()).toBe('');
    expect(service.activeCatalogDescription()).toBe('');
  });

  it(
    'sets handshake lock to true and sends GET_CATALOG when RENDERER_READY ' + 'is received',
    () => {
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 1001,
      });
      TestBed.tick();

      expect(service.isHandshakeInProgress()).toBe(true);
      expect(hostCommunicationMock.sendMessage).toHaveBeenCalledWith({
        type: PreviewBridgeMessageType.GET_CATALOG,
      });
    },
  );

  it('logs a warning and ignores subsequent RENDERER_READY', () => {
    const warnSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'warn').mockImplementation(() => {});

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.RENDERER_READY,
      origin: 'http://localhost',
      timestamp: 1002,
    });
    TestBed.tick();

    expect(service.isHandshakeInProgress()).toBe(true);
    expect(hostCommunicationMock.sendMessage).toHaveBeenCalledTimes(1);

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.RENDERER_READY,
      origin: 'http://localhost',
      payload: 'retry',
      timestamp: 1003,
    });
    TestBed.tick();

    expect(warnSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Handshake already in progress. Ignoring RENDERER_READY.'),
      }),
    );
    expect(hostCommunicationMock.sendMessage).toHaveBeenCalledTimes(1);
  });

  it('clears handshake lock when A2UI_CATALOG arrives and hashing completes', async () => {
    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.RENDERER_READY,
      origin: 'http://localhost',
      timestamp: 1004,
    });
    TestBed.tick();
    expect(service.isHandshakeInProgress()).toBe(true);

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload: {catalogId: 'test-catalog'},
      timestamp: 1005,
    });
    TestBed.tick();

    vi.useRealTimers();
    vi.restoreAllMocks();
    await new Promise(resolve => setTimeout(resolve, 50));
    vi.useFakeTimers();

    expect(service.isHandshakeInProgress()).toBe(false);
    expect(service.catalogError()).toBeNull();
    expect(service.activeCatalog()).toEqual({catalogId: 'test-catalog'});
  });

  it(
    'resets handshake lock and logs error on 5-second watchdog timeout if ' +
      'A2UI_CATALOG is not received',
    () => {
      const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error').mockImplementation(() => {});

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 1006,
      });
      TestBed.tick();
      expect(service.isHandshakeInProgress()).toBe(true);

      vi.advanceTimersByTime(5000);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Watchdog timeout: A2UI_CATALOG'),
        }),
      );
      expect(service.watchdogFired()).toBe(true);
      expect(service.catalogError()).toBe(
        'Watchdog timeout: A2UI_CATALOG not received within 5 seconds.',
      );
      expect(service.isHandshakeInProgress()).toBe(false);
      expect(service.hasReceivedCatalogResponse()).toBe(true);
      expect(service.handshakeState()).toBe('settled');
      expect(service.activeProtocolVersion()).toBe('v0.9');
    },
  );

  it('clears watchdog timer when A2UI_CATALOG arrives before timeout', async () => {
    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.RENDERER_READY,
      origin: 'http://localhost',
      timestamp: 1007,
    });
    TestBed.tick();
    expect(service.isHandshakeInProgress()).toBe(true);

    vi.advanceTimersByTime(3000);
    expect(service.isHandshakeInProgress()).toBe(true);

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload: {catalogId: 'test-catalog'},
      timestamp: 1008,
    });
    TestBed.tick();

    vi.useRealTimers();
    vi.restoreAllMocks();
    await new Promise(resolve => setTimeout(resolve, 50));
    vi.useFakeTimers();

    expect(service.isHandshakeInProgress()).toBe(false);

    vi.advanceTimersByTime(2000);
    expect(service.watchdogFired()).toBe(false);
  });

  it('rejects malformed A2UI_CATALOG payload and sets catalogError signal', () => {
    const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error').mockImplementation(() => {});

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload: null,
      timestamp: 1009,
    });
    TestBed.tick();

    expect(service.catalogError()).toBe('Invalid or malformed A2UI_CATALOG payload received.');
    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Invalid or malformed A2UI_CATALOG'),
      }),
    );
  });

  it(
    'handles flat catalog error payloads returned by the preview bridge, ' +
      'updating catalogError signal',
    async () => {
      const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error').mockImplementation(() => {});

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 3001,
      });
      TestBed.tick();

      expect(service.isHandshakeInProgress()).toBe(true);

      // Simulate bridge sending a flat error payload
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: {
          error: {message: 'Bridge in-memory catalog processing crash'},
        },
        timestamp: 3002,
      });
      TestBed.tick();

      expect(service.catalogError()).toBe('Bridge in-memory catalog processing crash');
      expect(service.isHandshakeInProgress()).toBe(false);
      expect(service.hasReceivedCatalogResponse()).toBe(true);
      expect(service.handshakeState()).toBe('settled');
      expect(service.activeProtocolVersion()).toBe('v0.9');
      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Handshake failed with bridge error:'),
        }),
      );
      errorSpy.mockRestore();
    },
  );

  it('catches DataCloneError during catalog cloning and updates catalogError signal', async () => {
    const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error').mockImplementation(() => {});

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.RENDERER_READY,
      origin: 'http://localhost',
      timestamp: 3003,
    });
    TestBed.tick();

    expect(service.isHandshakeInProgress()).toBe(true);

    const nonClonablePayload = {
      title: 'Title',
      description: 'Desc',
      schemas: [],
      badProp: function () {},
    };

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload: nonClonablePayload,
      timestamp: 3004,
    });
    TestBed.tick();

    expect(service.catalogError()).toBe('Failed to clone or serialize catalog payload.');
    expect(service.isHandshakeInProgress()).toBe(false);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Failed to clone or serialize catalog'),
      }),
    );
    errorSpy.mockRestore();
  });

  it('settles handshake error when secondary catalog in catalogs array fails structuredClone and recovers on next valid handshake', async () => {
    const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error').mockImplementation(() => {});

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.RENDERER_READY,
      origin: 'http://localhost',
      timestamp: 3005,
    });
    TestBed.tick();
    expect(service.isHandshakeInProgress()).toBe(true);

    const validPrimary = {
      catalogId: 'primary-ok',
      title: 'Primary',
      components: {},
    };
    const nonClonableSecondary = {
      catalogId: 'secondary-bad',
      title: 'Secondary',
      badFn: () => {},
    };

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload: {
        catalog: validPrimary,
        catalogs: [validPrimary, nonClonableSecondary],
      },
      timestamp: 3006,
    });
    TestBed.tick();

    expect(service.catalogError()).toBe('Failed to clone or serialize catalog payload.');
    expect(service.isHandshakeInProgress()).toBe(false);
    expect(service.handshakeState()).toBe('settled');
    expect(service.hasReceivedCatalogResponse()).toBe(true);

    // Subsequent valid handshake should recover cleanly
    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload: {
        catalogId: 'recovered-after-secondary-clone-failure',
        title: 'Recovered Catalog',
        components: {},
      },
      timestamp: 3007,
    });
    TestBed.tick();

    await flushMicrotasks();

    expect(service.catalogError()).toBeNull();
    expect(service.activeCatalog()?.['catalogId']).toBe('recovered-after-secondary-clone-failure');
    errorSpy.mockRestore();
  });

  it('sanitizes HTML tags in title and description and computes SHA-256 hash', async () => {
    const payload = {
      catalogId: 'test-catalog',
      title: 'Catalog Title <script>alert(1)</script>',
      description: 'Catalog Description <img src=x onerror=alert(1)>',
      components: {
        button: {name: 'Button'},
      },
    };

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload,
      timestamp: 1010,
    });
    TestBed.tick();

    vi.useRealTimers();
    vi.restoreAllMocks();
    await new Promise(resolve => setTimeout(resolve, 50));
    vi.useFakeTimers();
    vi.spyOn(crypto.subtle, 'digest').mockResolvedValue(new Uint8Array(32).buffer);

    expect(service.lastCatalogString()).toContain('Catalog Title ');
    expect(service.lastCatalogString()).not.toContain('<script>');
    expect(service.lastCatalogString()).toContain('Catalog Description ');
    expect(service.lastCatalogString()).not.toContain('onerror');

    expect(service.activeCatalogTitle()).toBe('Catalog Title ');
    expect(service.activeCatalogDescription()).toBe('Catalog Description <img src="x" />');

    const expectedHash = service.lastChecksumHash();
    expect(expectedHash).toBeTruthy();
    expect(expectedHash.length).toBe(64);

    // Verify deterministic hashing for identical catalog structures
    const payloadIdentical = {
      catalogId: 'test-catalog',
      components: {
        button: {name: 'Button'},
      },
      title: 'Catalog Title <script>alert(1)</script>',
      description: 'Catalog Description <img src=x onerror=alert(1)>',
    };

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload: payloadIdentical,
      timestamp: 1011,
    });
    TestBed.tick();

    vi.useRealTimers();
    vi.restoreAllMocks();
    await new Promise(resolve => setTimeout(resolve, 50));
    vi.useFakeTimers();
    vi.spyOn(crypto.subtle, 'digest').mockResolvedValue(new Uint8Array(32).buffer);

    expect(service.lastChecksumHash()).toBe(expectedHash);
  });

  it('executes IndexedDB write transaction on delta when no cached record exists', async () => {
    indexedDbStorageMock.getCatalogRecord.mockResolvedValue(null);

    const payload = {
      catalogId: 'test-catalog',
      title: 'New Catalog',
      description: 'New Description',
      components: {},
    };

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload,
      timestamp: 1012,
    });
    TestBed.tick();

    vi.useRealTimers();
    vi.restoreAllMocks();
    await new Promise(resolve => setTimeout(resolve, 50));
    vi.useFakeTimers();
    vi.spyOn(crypto.subtle, 'digest').mockResolvedValue(new Uint8Array(32).buffer);

    expect(indexedDbStorageMock.getCatalogRecord).toHaveBeenCalledWith('http://localhost/renderer');
    expect(service.catalogHashDelta()).toBe(true);
    expect(indexedDbStorageMock.saveCatalogRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        rendererUrl: 'http://localhost/renderer',
        catalogString: service.lastCatalogString(),
        checksumHash: service.lastChecksumHash(),
        lastAccessed: expect.any(Number),
      }),
    );

    expect(service.activeCatalog()).toEqual(payload);
    expect(service.activeCatalogTitle()).toBe('New Catalog');
    expect(service.activeCatalogDescription()).toBe('New Description');
  });

  it('executes IndexedDB write transaction on delta when cached hash differs', async () => {
    indexedDbStorageMock.getCatalogRecord.mockResolvedValue({
      rendererUrl: 'http://localhost/renderer',
      catalogString: '{}',
      checksumHash: 'oldhash',
      lastAccessed: 1000,
    });

    const payload = {
      catalogId: 'test-catalog',
      title: 'Updated Catalog',
      description: 'Updated Description',
      components: {},
    };

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload,
      timestamp: 1013,
    });
    TestBed.tick();

    vi.useRealTimers();
    vi.restoreAllMocks();
    await new Promise(resolve => setTimeout(resolve, 50));
    vi.useFakeTimers();
    vi.spyOn(crypto.subtle, 'digest').mockResolvedValue(new Uint8Array(32).buffer);

    expect(indexedDbStorageMock.getCatalogRecord).toHaveBeenCalledWith('http://localhost/renderer');
    expect(service.catalogHashDelta()).toBe(true);
    expect(indexedDbStorageMock.saveCatalogRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        rendererUrl: 'http://localhost/renderer',
        catalogString: service.lastCatalogString(),
        checksumHash: service.lastChecksumHash(),
        lastAccessed: expect.any(Number),
      }),
    );

    expect(service.activeCatalog()).toEqual(payload);
    expect(service.activeCatalogTitle()).toBe('Updated Catalog');
    expect(service.activeCatalogDescription()).toBe('Updated Description');
  });

  it('updates lastAccessed but delta is false when cached hash matches', async () => {
    const payload = {
      catalogId: 'test-catalog',
      title: 'Matching Catalog',
      description: 'Matching Description',
      components: {},
    };

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload,
      timestamp: 1014,
    });
    TestBed.tick();

    vi.useRealTimers();
    vi.restoreAllMocks();
    await new Promise(resolve => setTimeout(resolve, 50));
    vi.useFakeTimers();
    vi.spyOn(crypto.subtle, 'digest').mockResolvedValue(new Uint8Array(32).buffer);

    const computedHash = service.lastChecksumHash();
    const computedCatalogString = service.lastCatalogString();
    indexedDbStorageMock.saveCatalogRecord.mockClear();

    indexedDbStorageMock.getCatalogRecord.mockResolvedValue({
      rendererUrl: 'http://localhost/renderer',
      catalogString: computedCatalogString,
      checksumHash: computedHash,
      lastAccessed: 1000,
    });

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload,
      timestamp: 1015,
    });
    TestBed.tick();

    vi.useRealTimers();
    vi.restoreAllMocks();
    await new Promise(resolve => setTimeout(resolve, 50));
    vi.useFakeTimers();
    vi.spyOn(crypto.subtle, 'digest').mockResolvedValue(new Uint8Array(32).buffer);

    expect(service.catalogHashDelta()).toBe(false);
    expect(indexedDbStorageMock.saveCatalogRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        rendererUrl: 'http://localhost/renderer',
        catalogString: computedCatalogString,
        checksumHash: computedHash,
        lastAccessed: expect.any(Number),
      }),
    );
  });

  it('handles insecure context when crypto.subtle is unavailable', async () => {
    const originalCrypto = globalThis.crypto;
    Object.defineProperty(globalThis, 'crypto', {
      value: {...originalCrypto, subtle: undefined},
      writable: true,
      configurable: true,
    });

    const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error').mockImplementation(() => {});

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload: {catalogId: 'test-catalog'},
      timestamp: 2001,
    });
    TestBed.tick();

    await vi.advanceTimersByTimeAsync(0);

    expect(service.catalogError()).toBeNull();
    expect(service.activeCatalog()).toEqual({catalogId: 'test-catalog'} as Catalog);
    expect(service.isHandshakeInProgress()).toBe(false);

    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto,
      writable: true,
      configurable: true,
    });
    errorSpy.mockRestore();
  });

  it('handles cryptographic digest failures gracefully', async () => {
    const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error').mockImplementation(() => {});
    const digestSpy = vi
      .spyOn(crypto.subtle, 'digest')
      .mockRejectedValue(new Error('Digest failed'));

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload: {catalogId: 'test-catalog'},
      timestamp: 2002,
    });
    TestBed.tick();

    await vi.advanceTimersByTimeAsync(0);

    expect(service.catalogError()).toBe('Failed to compute catalog hash or access storage.');
    expect(service.isHandshakeInProgress()).toBe(false);

    digestSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('handles IndexedDbStorage failures gracefully', async () => {
    const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error').mockImplementation(() => {});
    indexedDbStorageMock.getCatalogRecord.mockRejectedValue(new Error('Database read failure'));

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload: {catalogId: 'test-catalog'},
      timestamp: 2003,
    });
    TestBed.tick();

    await vi.advanceTimersByTimeAsync(0);

    expect(service.catalogError()).toBe('Failed to compute catalog hash or access storage.');
    expect(service.isHandshakeInProgress()).toBe(false);
    errorSpy.mockRestore();
  });

  it('handshakes without IndexedDB if renderer URL is null', async () => {
    startupResolutionMock.getResolvedRendererUrl.mockReturnValue(null);
    indexedDbStorageMock.getCatalogRecord.mockClear();
    indexedDbStorageMock.saveCatalogRecord.mockClear();

    const payload = {
      catalogId: 'test-catalog',
      title: 'Null URL Catalog',
      description: 'Null URL Description',
      components: {},
    };

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload,
      timestamp: 2004,
    });
    TestBed.tick();

    await vi.advanceTimersByTimeAsync(0);

    expect(indexedDbStorageMock.getCatalogRecord).not.toHaveBeenCalled();
    expect(indexedDbStorageMock.saveCatalogRecord).not.toHaveBeenCalled();

    expect(service.activeCatalog()).toEqual(payload);
    expect(service.activeCatalogTitle()).toBe('Null URL Catalog');
    expect(service.catalogError()).toBeNull();
    expect(service.isHandshakeInProgress()).toBe(false);
  });

  it('correctly resolves and sanitizes title and description from raw postMessage catalog payload using bracket notation', async () => {
    // prettier-ignore
    const payload = {
      'title': 'Test Title <b>Bold</b>',
      'description': 'Test Description <i>Italic</i>',
      'catalogId': 'custom-catalog-id',
      'components': {},
    };

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload,
      timestamp: 2005,
    });
    TestBed.tick();

    await vi.advanceTimersByTimeAsync(0);

    expect(service.activeCatalogTitle()).toBe('Test Title <b>Bold</b>');
    expect(service.activeCatalogDescription()).toBe('Test Description <i>Italic</i>');
    expect(service.activeCatalog()?.['catalogId']).toBe('custom-catalog-id');
  });

  it('rejects A2UI_CATALOG payload if catalogId and $id are missing', () => {
    const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error').mockImplementation(() => {});

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload: {
        title: 'No ID Catalog',
        components: {},
      },
      timestamp: 2006,
    });
    TestBed.tick();

    expect(service.catalogError()).toBe(
      'Catalog is missing a valid identifier (catalogId or $id).',
    );
    expect(service.isHandshakeInProgress()).toBe(false);
    expect(service.activeCatalog()).toBeNull();
    errorSpy.mockRestore();
  });

  it('ignores watchdog timeout execution if watchdogTimerId is manually cleared', () => {
    const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error').mockImplementation(() => {});

    // Trigger RENDERER_READY to start the watchdog timer
    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.RENDERER_READY,
      origin: 'http://localhost',
      timestamp: 3001,
    });
    TestBed.tick();

    // Manually corrupt private watchdogTimerId state
    (service as unknown as {watchdogTimerId: ReturnType<typeof setTimeout> | null})[
      'watchdogTimerId'
    ] = null;

    // Fast forward past the 5 second timeout limit
    vi.advanceTimersByTime(5000);

    // Expect the timeout handler to have returned early without throwing or setting errors
    expect(service.catalogError()).toBeNull();
    expect(service.isHandshakeInProgress()).toBe(true);

    errorSpy.mockRestore();
  });

  it('handles flat catalog error payloads without message, using default error message', async () => {
    const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error').mockImplementation(() => {});

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.RENDERER_READY,
      origin: 'http://localhost',
      timestamp: 4001,
    });
    TestBed.tick();

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload: {
        error: {}, // No message
      },
      timestamp: 4002,
    });
    TestBed.tick();

    expect(service.catalogError()).toBe(
      'Unknown error occurred in preview bridge during handshake.',
    );
    expect(service.isHandshakeInProgress()).toBe(false);
    errorSpy.mockRestore();
  });

  it('keeps messageStream$ alive after ingesting a malformed A2UI_CATALOG payload', async () => {
    const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error').mockImplementation(() => {});

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      payload: {
        error: {message: 'Initial bridge failure'},
      },
      origin: 'http://localhost',
      timestamp: 4001,
    });
    TestBed.tick();

    expect(service.catalogError()).toBe('Initial bridge failure');
    expect(service.isHandshakeInProgress()).toBe(false);

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      payload: {
        catalogId: 'recovered-catalog',
        title: 'Recovered Title',
      },
      origin: 'http://localhost',
      timestamp: 4002,
    });
    TestBed.tick();

    vi.useRealTimers();
    vi.restoreAllMocks();
    await new Promise(resolve => setTimeout(resolve, 50));
    vi.useFakeTimers();

    expect(service.activeCatalog()).toEqual(
      expect.objectContaining({
        catalogId: 'recovered-catalog',
        title: 'Recovered Title',
      }),
    );
    expect(service.catalogError()).toBeNull();
    errorSpy.mockRestore();
  });

  it('updates activeCatalog from cached record when resolvedUrl signal changes to a cached renderer URL', async () => {
    const cachedCatalog = {catalogId: 'cached-cat', title: 'Cached Title', components: {}};
    indexedDbStorageMock.getCatalogRecord.mockImplementation(async (url: string) => {
      if (url === 'http://localhost/cached-renderer') {
        return {
          rendererUrl: 'http://localhost/cached-renderer',
          catalogString: JSON.stringify(cachedCatalog),
          checksumHash: 'cachedhash123',
          lastAccessed: 1000,
        };
      }
      return null;
    });

    resolvedUrlSignal.set('http://localhost/cached-renderer');
    TestBed.tick();

    vi.useRealTimers();
    vi.restoreAllMocks();
    await new Promise(resolve => setTimeout(resolve, 50));
    vi.useFakeTimers();

    expect(service.activeCatalog()).toEqual(cachedCatalog);
    expect(service.activeCatalogTitle()).toBe('Cached Title');
    expect(service.catalogError()).toBeNull();
  });

  it('resets activeCatalog to null when resolvedUrl signal changes to an uncached renderer URL', async () => {
    indexedDbStorageMock.getCatalogRecord.mockResolvedValue(null);

    resolvedUrlSignal.set('http://localhost/uncached-renderer');
    TestBed.tick();

    vi.useRealTimers();
    vi.restoreAllMocks();
    await new Promise(resolve => setTimeout(resolve, 50));
    vi.useFakeTimers();

    expect(service.activeCatalog()).toBeNull();
    expect(service.activeCatalogTitle()).toBe('');
    expect(service.catalogError()).toBeNull();
  });

  it('exposes handshakeState', async () => {
    expect(service.handshakeState()).toBe('idle');

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.RENDERER_READY,
      origin: 'http://localhost',
      timestamp: 1000,
    });
    TestBed.tick();

    hostCommunicationMock.messageStream$.next({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload: {
        catalogId: 'test-cat',
        title: 'Test Catalog',
        components: {},
      },
      timestamp: 1001,
    });
    TestBed.tick();

    vi.useRealTimers();
    await new Promise(resolve => setTimeout(resolve, 50));
    vi.useFakeTimers();

    expect(service.handshakeState()).toBe('settled');

    TestBed.resetTestingModule();
  });

  describe('protocol versioning and multi-catalog support', () => {
    it('defaults activeProtocolVersion to v0.9 and hasReceivedCatalogResponse to false before handshake', () => {
      expect(service.hasReceivedCatalogResponse()).toBe(false);
      expect(service.activeProtocolVersion()).toBe('v0.9');
      expect(service.activeCatalogs()).toEqual([]);
    });

    it('settles with activeProtocolVersion v1.0 on empty catalog response {}', () => {
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: {},
        timestamp: 4001,
      });
      TestBed.tick();

      expect(service.hasReceivedCatalogResponse()).toBe(true);
      expect(service.handshakeState()).toBe('settled');
      expect(service.activeCatalog()).toBeNull();
      expect(service.activeCatalogs()).toEqual([]);
      expect(service.activeProtocolVersion()).toBe('v1.0');
    });

    it('settles with activeProtocolVersion v1.0 on { catalog: null }', () => {
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: {catalog: null},
        timestamp: 4002,
      });
      TestBed.tick();

      expect(service.hasReceivedCatalogResponse()).toBe(true);
      expect(service.handshakeState()).toBe('settled');
      expect(service.activeCatalog()).toBeNull();
      expect(service.activeCatalogs()).toEqual([]);
      expect(service.activeProtocolVersion()).toBe('v1.0');
    });

    it('preserves primary $id precedence over secondary catalogId in mergedActiveCatalog', async () => {
      const primaryCatalog: Catalog = {
        $id: 'https://test/primary-only-dollar-id.json',
        components: {
          Text: {type: 'object'},
        },
      };
      const secondaryCatalog: Catalog = {
        catalogId: 'https://test/secondary.json',
        components: {
          Chart: {type: 'object'},
        },
      };

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: {
          catalog: primaryCatalog,
          catalogs: [primaryCatalog, secondaryCatalog],
        },
        timestamp: 40025,
      });
      TestBed.tick();
      await flushMicrotasks();

      const merged = service.mergedActiveCatalog();
      expect(merged).not.toBeNull();
      expect(getCatalogId(merged!)).toBe('https://test/primary-only-dollar-id.json');
      expect(merged!.components).toEqual({
        Text: {type: 'object'},
        Chart: {type: 'object'},
      });
    });

    it('settles with activeProtocolVersion v1.0 when catalog has protocolVersion 1.0', async () => {
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: {
          catalogId: 'cat-v1',
          protocolVersion: '1.0',
          components: {},
        },
        timestamp: 4003,
      });
      TestBed.tick();
      await flushMicrotasks();

      expect(service.hasReceivedCatalogResponse()).toBe(true);
      expect(service.activeProtocolVersion()).toBe('v1.0');
    });

    it('settles with activeProtocolVersion v1.0 when catalog has protocolVersion v1.0', async () => {
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: {
          catalogId: 'cat-v1',
          protocolVersion: 'v1.0',
          components: {},
        },
        timestamp: 4004,
      });
      TestBed.tick();
      await flushMicrotasks();

      expect(service.hasReceivedCatalogResponse()).toBe(true);
      expect(service.activeProtocolVersion()).toBe('v1.0');
    });

    it('settles with activeProtocolVersion v0.9 when catalog has protocolVersion 0.9 or v0.9 or omitted or unknown', async () => {
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: {
          catalogId: 'cat-v09',
          protocolVersion: '0.9',
          components: {},
        },
        timestamp: 4005,
      });
      TestBed.tick();
      await flushMicrotasks();

      expect(service.hasReceivedCatalogResponse()).toBe(true);
      expect(service.activeProtocolVersion()).toBe('v0.9');
    });

    it('settles with activeProtocolVersion v1.0 when a secondary catalog has protocolVersion 1.x or v1.0', async () => {
      const primaryV09 = {
        catalogId: 'primary-v09',
        title: 'Primary v0.9',
        components: {},
      };
      const secondaryV1 = {
        catalogId: 'secondary-v1',
        title: 'Secondary v1.x',
        protocolVersion: '1.1',
        components: {},
      };

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: {
          catalog: primaryV09,
          catalogs: [primaryV09, secondaryV1],
        },
        timestamp: 40051,
      });
      TestBed.tick();
      await flushMicrotasks();

      expect(service.hasReceivedCatalogResponse()).toBe(true);
      expect(service.activeProtocolVersion()).toBe('v1.0');
    });

    it('handles multi-catalog payload { catalog, catalogs } and caches catalogsJson', async () => {
      const primaryCat = {catalogId: 'primary-cat', title: 'Primary', components: {}};
      const secondaryCat = {catalogId: 'secondary-cat', title: 'Secondary', components: {}};

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: {
          catalog: primaryCat,
          catalogs: [primaryCat, secondaryCat],
        },
        timestamp: 4006,
      });
      TestBed.tick();
      await flushMicrotasks();

      expect(service.activeCatalog()).toEqual(primaryCat);
      expect(service.activeCatalogs()).toEqual([primaryCat, secondaryCat]);

      expect(indexedDbStorageMock.saveCatalogRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          catalogJson: primaryCat,
          catalogsJson: [primaryCat, secondaryCat],
        }),
      );
    });

    it('resets hasReceivedCatalogResponse to false when rendererUrl changes to an uncached URL', async () => {
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: {
          catalogId: 'cat-1',
          components: {},
        },
        timestamp: 4007,
      });
      TestBed.tick();
      await flushMicrotasks();

      expect(service.hasReceivedCatalogResponse()).toBe(true);

      indexedDbStorageMock.getCatalogRecord.mockResolvedValue(null);
      resolvedUrlSignal.set('http://localhost/new-renderer');
      TestBed.tick();
      await flushMicrotasks();

      expect(service.hasReceivedCatalogResponse()).toBe(false);
      expect(service.activeProtocolVersion()).toBe('v0.9');
      expect(service.activeCatalogs()).toEqual([]);
    });

    it('hydrates multi-catalog from cached record with catalogsJson', async () => {
      const cachedRecord = {
        rendererUrl: 'http://localhost/cached-multi',
        catalogString: JSON.stringify({catalogId: 'c1'}),
        checksumHash: 'hash-c1',
        lastAccessed: 1000,
        catalogJson: {catalogId: 'c1', title: 'C1', components: {}},
        catalogsJson: [
          {catalogId: 'c1', title: 'C1', components: {}},
          {catalogId: 'c2', title: 'C2', components: {}},
        ],
      };
      indexedDbStorageMock.getCatalogRecord.mockImplementation(async (url: string) => {
        if (url === 'http://localhost/cached-multi') {
          return cachedRecord;
        }
        return null;
      });

      resolvedUrlSignal.set('http://localhost/cached-multi');
      TestBed.tick();
      await flushMicrotasks();

      expect(service.hasReceivedCatalogResponse()).toBe(true);
      expect(service.activeCatalog()).toEqual({catalogId: 'c1', title: 'C1', components: {}});
      expect(service.activeCatalogs()).toEqual([
        {catalogId: 'c1', title: 'C1', components: {}},
        {catalogId: 'c2', title: 'C2', components: {}},
      ]);
    });

    it('merges components and functions in mergedActiveCatalog with primary-wins precedence and collision warnings', async () => {
      const warnSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'warn').mockImplementation(() => {});
      const basicCat = {
        $id: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
        protocolVersion: '1.0',
        components: {
          Text: {type: 'object', description: 'Primary Text'},
          Button: {type: 'object'},
        },
        functions: {
          formatString: {type: 'object', description: 'Primary formatString'},
        },
      };
      const mcpCat = {
        $id: 'https://a2ui.org/composer/v1_0/catalogs/mcp-functions/catalog.json',
        protocolVersion: '1.0',
        components: {
          Text: {type: 'object', description: 'Colliding Secondary Text'},
        },
        functions: {
          formatString: {type: 'object', description: 'Colliding formatString'},
          callMcpTool: {type: 'object'},
        },
      };

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: {
          catalog: basicCat,
          catalogs: [basicCat, mcpCat],
        },
        timestamp: 4010,
      });
      TestBed.tick();
      await flushMicrotasks();

      const merged = service.mergedActiveCatalog();
      expect(merged).not.toBeNull();
      expect(merged?.['$id']).toBe(basicCat['$id']);
      expect(merged?.components?.['Text']?.['description']).toBe('Primary Text');
      expect(merged?.components?.['Button']).toBeDefined();
      const functionsMap = merged?.functions as Record<string, Record<string, unknown>> | undefined;
      expect(functionsMap?.['formatString']?.['description']).toBe('Primary formatString');
      expect(functionsMap?.['callMcpTool']).toBeDefined();
      expect(warnSpy).toHaveBeenCalled();

      warnSpy.mockRestore();
    });

    it('exposes dual-version protocolSupport and announcedCatalogs while scoping activeCatalogs and collision checks to defaultVersion', async () => {
      const warnSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'warn').mockImplementation(() => {});
      const v1Basic = {
        $id: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
        catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
        protocolVersion: '1.0',
        components: {
          Text: {type: 'object', description: 'v1.0 Text'},
        },
      };
      const mcpV1 = {
        $id: 'https://a2ui.org/composer/v1_0/catalogs/mcp-functions/catalog.json',
        catalogId: 'https://a2ui.org/composer/v1_0/catalogs/mcp-functions/catalog.json',
        protocolVersion: '1.0',
        functions: {
          callMcpTool: {type: 'object'},
        },
      };
      const v09Composer = {
        $id: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
        catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
        protocolVersion: '0.9',
        components: {
          Text: {type: 'object', description: 'v0.9 Composer Text'},
          LegacyCard: {type: 'object', description: 'v0.9 only component'},
        },
      };
      const v09Npm = {
        $id: 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json',
        catalogId: 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json',
        protocolVersion: '0.9',
        components: {
          Text: {type: 'object', description: 'v0.9 npm Text'},
          LegacyCard: {type: 'object', description: 'v0.9 only component'},
        },
      };

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: {
          catalog: v1Basic,
          catalogs: [v1Basic, mcpV1, v09Composer, v09Npm],
        },
        timestamp: 40105,
      });
      TestBed.tick();
      await flushMicrotasks();

      expect(service.activeCatalogs()).toEqual([v1Basic, mcpV1]);
      expect(service.announcedCatalogs()).toEqual([v1Basic, mcpV1, v09Composer, v09Npm]);
      expect(service.activeProtocolVersion()).toBe('v1.0');
      expect(service.protocolSupport()).toEqual({
        defaultVersion: 'v1.0',
        versions: ['v1.0', 'v0.9'],
        catalogsByVersion: {
          'v1.0': [v1Basic, mcpV1],
          'v0.9': [v09Composer, v09Npm],
        },
        announcedCatalogCount: 4,
      });

      const merged = service.mergedActiveCatalog();
      expect(merged?.components?.['Text']?.['description']).toBe('v1.0 Text');
      expect(merged?.components?.['LegacyCard']).toBeUndefined();
      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });

    it('merges mixed array and map catalog functions with primary-wins precedence and collision warnings', async () => {
      const warnSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'warn').mockImplementation(() => {});
      const arrayCat = {
        $id: 'https://a2ui.org/specification/v1_0/catalogs/slack/catalog.json',
        protocolVersion: '1.0',
        components: {
          Card: {type: 'object', description: 'Primary Card'},
        },
        functions: [
          {name: 'required', returnType: 'boolean', parameters: {type: 'object'}},
          {
            name: 'formatString',
            returnType: 'string',
            parameters: {type: 'object', description: 'Primary Array formatString'},
          },
        ],
      };
      const mapCat = {
        $id: 'https://a2ui.org/composer/v1_0/catalogs/mcp-functions/catalog.json',
        protocolVersion: '1.0',
        components: {
          Card: {type: 'object', description: 'Colliding Secondary Card'},
        },
        functions: {
          formatString: {type: 'object', description: 'Colliding Map formatString'},
          callMcpTool: {type: 'object'},
        },
      };

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: {
          catalog: arrayCat,
          catalogs: [arrayCat, mapCat],
        },
        timestamp: 4020,
      });
      TestBed.tick();
      await flushMicrotasks();

      const merged = service.mergedActiveCatalog();
      expect(merged).not.toBeNull();
      expect(merged?.components?.['Card']?.['description']).toBe('Primary Card');
      const functionsMap = merged?.functions as Record<string, Record<string, unknown>> | undefined;
      expect(functionsMap?.['required']).toBeDefined();
      expect(functionsMap?.['callMcpTool']).toBeDefined();
      expect(functionsMap?.['formatString']).toBeDefined();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('functions=[formatString]'),
        }),
      );

      warnSpy.mockRestore();
    });

    it('merges $defs primary-first across all catalogs in activeCatalogs without overwriting primary $defs keys', async () => {
      const primaryCat = {
        $id: 'https://example.com/primary.json',
        components: {Btn: {type: 'object'}},
        $defs: {
          SharedType: {type: 'string', description: 'Primary SharedType'},
          PrimaryOnlyType: {type: 'number'},
        },
      };
      const secondaryCat = {
        $id: 'https://example.com/secondary.json',
        components: {Card: {type: 'object'}},
        $defs: {
          SharedType: {type: 'boolean', description: 'Secondary Colliding SharedType'},
          SecondaryOnlyType: {type: 'array'},
        },
      };

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: {
          catalog: primaryCat,
          catalogs: [primaryCat, secondaryCat],
        },
        timestamp: 4030,
      });
      TestBed.tick();
      await flushMicrotasks();

      const merged = service.mergedActiveCatalog();
      expect(merged).not.toBeNull();
      const defs = (merged as Record<string, unknown>)['$defs'] as Record<string, unknown>;
      expect(defs).toBeDefined();
      expect((defs['SharedType'] as Record<string, unknown>)['description']).toBe(
        'Primary SharedType',
      );
      expect(defs['PrimaryOnlyType']).toBeDefined();
      expect(defs['SecondaryOnlyType']).toBeDefined();
    });

    it('produces a catalogString and checksumHash delta when only a secondary catalog changes while keeping single-catalog serialization identical', async () => {
      vi.spyOn(crypto.subtle, 'digest').mockImplementation(async (_algo, data) => {
        const input = new Uint8Array(data as ArrayBuffer);
        const out = new Uint8Array(32);
        for (let i = 0; i < input.length; i++) {
          out[i % 32] = (out[i % 32] * 31 + input[i]) % 256;
        }
        return out.buffer;
      });

      const singleCat = {
        catalogId: 'cat-single',
        title: 'Single',
        components: {Btn: {type: 'object'}},
      };

      // 1. Single catalog emission
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: singleCat,
        timestamp: 4040,
      });
      TestBed.tick();
      await flushMicrotasks();

      const singleCatalogString = service.lastCatalogString();
      const singleHash = service.lastChecksumHash();
      expect(singleCatalogString).toBe(stableStringify(singleCat));
      expect(singleHash).toBeTruthy();

      // 2. Multi-catalog emission (primary + secondary v1)
      const primaryCat = {
        catalogId: 'cat-multi-primary',
        title: 'Primary',
        components: {Btn: {type: 'object'}},
      };
      const secondaryCatV1 = {
        catalogId: 'cat-multi-secondary',
        title: 'Secondary v1',
        components: {Card: {type: 'object'}},
      };

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: {
          catalog: primaryCat,
          catalogs: [primaryCat, secondaryCatV1],
        },
        timestamp: 4041,
      });
      TestBed.tick();
      await flushMicrotasks();

      const multiV1String = service.lastCatalogString();
      const multiV1Hash = service.lastChecksumHash();
      expect(multiV1String).toBe(stableStringify([primaryCat, secondaryCatV1]));

      // 3. Multi-catalog emission with change ONLY in secondary catalog
      const secondaryCatV2 = {
        catalogId: 'cat-multi-secondary',
        title: 'Secondary v2 Modified',
        components: {Card: {type: 'object', description: 'Updated'}},
      };

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: {
          catalog: primaryCat,
          catalogs: [primaryCat, secondaryCatV2],
        },
        timestamp: 4042,
      });
      TestBed.tick();
      await flushMicrotasks();

      const multiV2String = service.lastCatalogString();
      const multiV2Hash = service.lastChecksumHash();
      expect(multiV2String).toBe(stableStringify([primaryCat, secondaryCatV2]));
      expect(multiV2String).not.toBe(multiV1String);
      expect(multiV2Hash).not.toBe(multiV1Hash);
    });

    it('cancels the watchdog and re-issues GET_CATALOG when a detached frame remounts under the same resolvedUrl', async () => {
      const warnSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'warn').mockImplementation(() => {});
      const win1 = {name: 'win1'} as unknown as Window;
      const win2 = {name: 'win2'} as unknown as Window;
      const registered = new Set<Window>([win1]);
      hostCommunicationMock.isRegisteredWindow.mockImplementation((w: Window) => registered.has(w));

      // Frame 1 announces RENDERER_READY while registered -> GET_CATALOG sent to win1
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 5001,
        sourceWindow: win1,
      });
      TestBed.tick();
      expect(service.isHandshakeInProgress()).toBe(true);
      expect(hostCommunicationMock.sendMessage).toHaveBeenCalledTimes(1);
      expect(hostCommunicationMock.sendMessage).toHaveBeenCalledWith(
        {type: PreviewBridgeMessageType.GET_CATALOG},
        win1,
      );

      // While win1 is STILL registered, a concurrent RENDERER_READY from win2 is still ignored
      registered.add(win2);
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 5002,
        sourceWindow: win2,
      });
      TestBed.tick();
      expect(hostCommunicationMock.sendMessage).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledTimes(1);

      // Now win1 detaches (unregistered) before answering A2UI_CATALOG
      registered.delete(win1);
      warnSpy.mockClear();

      // Advance 3s into the first watchdog window, then win2 announces RENDERER_READY
      vi.advanceTimersByTime(3000);
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 5003,
        sourceWindow: win2,
      });
      TestBed.tick();

      // Watchdog must have been restarted and GET_CATALOG re-issued to win2 immediately
      expect(warnSpy).not.toHaveBeenCalled();
      expect(hostCommunicationMock.sendMessage).toHaveBeenCalledTimes(2);
      expect(hostCommunicationMock.sendMessage).toHaveBeenNthCalledWith(
        2,
        {type: PreviewBridgeMessageType.GET_CATALOG},
        win2,
      );

      // Advancing past win1's original 5s deadline (+2.5s = 5.5s total) must NOT fire win1's stale watchdog
      vi.advanceTimersByTime(2500);
      expect(service.watchdogFired()).toBe(false);
      expect(service.isHandshakeInProgress()).toBe(true);

      // win2 completes the handshake cleanly
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: {catalogId: 'cat-remounted', protocolVersion: '1.0'},
        timestamp: 5004,
        sourceWindow: win2,
      });
      TestBed.tick();
      await flushMicrotasks();

      expect(service.isHandshakeInProgress()).toBe(false);
      expect(service.watchdogFired()).toBe(false);
      expect(service.activeCatalog()?.catalogId).toBe('cat-remounted');
      expect(service.activeProtocolVersion()).toBe('v1.0');
    });

    it('ignores late A2UI_CATALOG responses from a superseded handshake window', async () => {
      const warnSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'warn').mockImplementation(() => {});
      const win1 = {name: 'win1'} as unknown as Window;
      const win2 = {name: 'win2'} as unknown as Window;
      const registered = new Set<Window>([win1]);
      hostCommunicationMock.isRegisteredWindow.mockImplementation((w: Window) => registered.has(w));

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 5101,
        sourceWindow: win1,
      });
      TestBed.tick();

      // win1 detaches and win2 takes over the handshake
      registered.delete(win1);
      registered.add(win2);
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 5102,
        sourceWindow: win2,
      });
      TestBed.tick();

      // Stale A2UI_CATALOG from win1 arrives after win2 became active handshakeWindow
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: {catalogId: 'stale-win1-cat'},
        timestamp: 5103,
        sourceWindow: win1,
      });
      TestBed.tick();
      await flushMicrotasks();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Ignoring A2UI_CATALOG from stale renderer window.',
        }),
      );
      expect(service.isHandshakeInProgress()).toBe(true);
      expect(service.handshakeState()).toBe('in-progress');
      expect(service.activeCatalog()).toBeNull();
      expect(service.hasReceivedCatalogResponse()).toBe(false);

      // win2's own A2UI_CATALOG still settles cleanly
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: {catalogId: 'fresh-win2-cat', protocolVersion: '1.0'},
        timestamp: 5104,
        sourceWindow: win2,
      });
      TestBed.tick();
      await flushMicrotasks();

      expect(service.isHandshakeInProgress()).toBe(false);
      expect(service.handshakeState()).toBe('settled');
      expect(service.activeCatalog()?.catalogId).toBe('fresh-win2-cat');
      expect(service.activeProtocolVersion()).toBe('v1.0');
      warnSpy.mockRestore();
    });

    it('ignores A2UI_CATALOG from another window when RENDERER_READY is handled right after a renderer URL change', async () => {
      const warnSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'warn').mockImplementation(() => {});
      const winA = {name: 'winA'} as unknown as Window;
      const winB = {name: 'winB'} as unknown as Window;

      // The URL changes and the new frame announces before anything has
      // observed the change: no tick, no flush and no signal read in between.
      resolvedUrlSignal.set('http://localhost/renderer-next');
      startupResolutionMock.getResolvedRendererUrl.mockReturnValue(
        'http://localhost/renderer-next',
      );
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 5201,
        sourceWindow: winA,
      });
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: {catalogId: 'other-window-cat', protocolVersion: '1.0'},
        timestamp: 5202,
        sourceWindow: winB,
      });
      TestBed.tick();
      await flushMicrotasks();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Ignoring A2UI_CATALOG from stale renderer window.',
        }),
      );
      expect(service.isHandshakeInProgress()).toBe(true);
      expect(service.handshakeState()).toBe('in-progress');
      expect(service.activeCatalog()).toBeNull();
      expect(service.hasReceivedCatalogResponse()).toBe(false);

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: {catalogId: 'handshake-window-cat', protocolVersion: '1.0'},
        timestamp: 5203,
        sourceWindow: winA,
      });
      TestBed.tick();
      await flushMicrotasks();

      expect(service.isHandshakeInProgress()).toBe(false);
      expect(service.handshakeState()).toBe('settled');
      expect(service.activeCatalog()?.catalogId).toBe('handshake-window-cat');
      warnSpy.mockRestore();
    });

    it('lets a replacement frame take over a handshake started right after a renderer URL change', () => {
      const winA = {name: 'winA'} as unknown as Window;
      const winB = {name: 'winB'} as unknown as Window;
      const registered = new Set<Window>([winA]);
      hostCommunicationMock.isRegisteredWindow.mockImplementation((w: Window) => registered.has(w));

      resolvedUrlSignal.set('http://localhost/renderer-next');
      startupResolutionMock.getResolvedRendererUrl.mockReturnValue(
        'http://localhost/renderer-next',
      );
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 5301,
        sourceWindow: winA,
      });
      expect(hostCommunicationMock.sendMessage).toHaveBeenCalledTimes(1);

      // winA detaches before answering and winB announces in its place.
      registered.delete(winA);
      registered.add(winB);
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 5302,
        sourceWindow: winB,
      });

      expect(hostCommunicationMock.sendMessage).toHaveBeenCalledTimes(2);
      expect(hostCommunicationMock.sendMessage).toHaveBeenNthCalledWith(
        2,
        {type: PreviewBridgeMessageType.GET_CATALOG},
        winB,
      );
    });

    describe('when the renderer URL is resolved after construction', () => {
      const winA = {name: 'winA'} as unknown as Window;
      const winB = {name: 'winB'} as unknown as Window;

      beforeEach(() => {
        // Rebuild the service with no renderer URL yet, as on first load.
        TestBed.resetTestingModule();
        resolvedUrlSignal.set(null);
        startupResolutionMock.getResolvedRendererUrl.mockReturnValue(null);
        TestBed.configureTestingModule({
          providers: [
            CatalogManagement,
            {provide: HostCommunication, useValue: hostCommunicationMock},
            {provide: IndexedDbStorage, useValue: indexedDbStorageMock},
            {provide: StartupResolution, useValue: startupResolutionMock},
          ],
        });
        service = TestBed.inject(CatalogManagement);

        // The URL resolves and the frame announces before anything has
        // observed the change: no tick, no flush and no signal read.
        resolvedUrlSignal.set('http://localhost/renderer');
        startupResolutionMock.getResolvedRendererUrl.mockReturnValue('http://localhost/renderer');
        hostCommunicationMock.messageStream$.next({
          type: PreviewBridgeMessageType.RENDERER_READY,
          origin: 'http://localhost',
          timestamp: 5401,
          sourceWindow: winA,
        });
      });

      it('commits the catalog answered by the announcing window', async () => {
        hostCommunicationMock.messageStream$.next({
          type: PreviewBridgeMessageType.A2UI_CATALOG,
          origin: 'http://localhost',
          payload: {catalogId: 'first-load-cat', title: 'First Load', protocolVersion: '1.0'},
          timestamp: 5402,
          sourceWindow: winA,
        });
        TestBed.tick();
        await flushMicrotasks();

        expect(service.isHandshakeInProgress()).toBe(false);
        expect(service.catalogError()).toBeNull();
        expect(service.activeCatalog()?.catalogId).toBe('first-load-cat');
        expect(service.activeCatalogTitle()).toBe('First Load');
      });

      it('commits a catalog that carries no source window', async () => {
        hostCommunicationMock.messageStream$.next({
          type: PreviewBridgeMessageType.A2UI_CATALOG,
          origin: 'http://localhost',
          payload: {catalogId: 'first-load-cat', title: 'First Load', protocolVersion: '1.0'},
          timestamp: 5403,
        });
        TestBed.tick();
        await flushMicrotasks();

        expect(service.isHandshakeInProgress()).toBe(false);
        expect(service.catalogError()).toBeNull();
        expect(service.activeCatalog()?.catalogId).toBe('first-load-cat');
        expect(service.activeCatalogTitle()).toBe('First Load');
      });

      it('ignores a catalog from another window and reports the watchdog timeout', async () => {
        const logger = TestBed.inject(ErrorLogger);
        const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});
        const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});

        hostCommunicationMock.messageStream$.next({
          type: PreviewBridgeMessageType.A2UI_CATALOG,
          origin: 'http://localhost',
          payload: {catalogId: 'other-window-cat', title: 'Other', protocolVersion: '1.0'},
          timestamp: 5404,
          sourceWindow: winB,
        });
        TestBed.tick();
        await flushMicrotasks();

        expect(warnSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Ignoring A2UI_CATALOG from stale renderer window.',
          }),
        );
        expect(service.isHandshakeInProgress()).toBe(true);
        expect(service.activeCatalog()).toBeNull();

        vi.advanceTimersByTime(5000);

        expect(errorSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Watchdog timeout: A2UI_CATALOG not received within 5 seconds.',
          }),
        );
        expect(service.watchdogFired()).toBe(true);
        expect(service.activeCatalog()).toBeNull();
        expect(service.activeCatalogTitle()).toBe('');
        warnSpy.mockRestore();
        errorSpy.mockRestore();
      });
    });

    it('cancels stale watchdog without error when a secondary frame detaches after catalog receipt', async () => {
      const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error').mockImplementation(() => {});
      const win1 = {name: 'coordinator'} as unknown as Window;
      const win2 = {name: 'evicted-card'} as unknown as Window;
      const registered = new Set<Window>([win1]);
      hostCommunicationMock.isRegisteredWindow.mockImplementation((w: Window) => registered.has(w));

      // Initial coordinator handshake completes cleanly
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 5201,
        sourceWindow: win1,
      });
      TestBed.tick();
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: {catalogId: 'coordinator-cat', protocolVersion: '1.0'},
        timestamp: 5202,
        sourceWindow: win1,
      });
      TestBed.tick();
      await flushMicrotasks();
      expect(service.hasReceivedCatalogResponse()).toBe(true);

      // Secondary card mounts, starts handshake, then unmounts before answering
      registered.add(win2);
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 5203,
        sourceWindow: win2,
      });
      TestBed.tick();
      expect(service.isHandshakeInProgress()).toBe(true);

      registered.delete(win2);
      vi.advanceTimersByTime(5000);

      expect(errorSpy).not.toHaveBeenCalled();
      expect(service.watchdogFired()).toBe(false);
      expect(service.catalogError()).toBeNull();
      expect(service.isHandshakeInProgress()).toBe(false);
      expect(service.handshakeState()).toBe('settled');
      errorSpy.mockRestore();
    });

    it('still fires watchdog error if an unregistered initial frame times out before any catalog receipt', () => {
      const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error').mockImplementation(() => {});
      const win1 = {name: 'coordinator'} as unknown as Window;
      const registered = new Set<Window>([win1]);
      hostCommunicationMock.isRegisteredWindow.mockImplementation((w: Window) => registered.has(w));

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 5301,
        sourceWindow: win1,
      });
      TestBed.tick();

      registered.delete(win1);
      vi.advanceTimersByTime(5000);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Watchdog timeout: A2UI_CATALOG not received within 5 seconds.',
        }),
      );
      expect(service.watchdogFired()).toBe(true);
      expect(service.catalogError()).toBe(
        'Watchdog timeout: A2UI_CATALOG not received within 5 seconds.',
      );
      errorSpy.mockRestore();
    });

    it('fires watchdog error when catalog is established and handshake window is still registered', async () => {
      const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error').mockImplementation(() => {});
      const win1 = {name: 'coordinator'} as unknown as Window;
      const win2 = {name: 'stalled-card'} as unknown as Window;
      const registered = new Set<Window>([win1]);
      hostCommunicationMock.isRegisteredWindow.mockImplementation((w: Window) => registered.has(w));

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 5401,
        sourceWindow: win1,
      });
      TestBed.tick();
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: {catalogId: 'coordinator-cat', protocolVersion: '1.0'},
        timestamp: 5402,
        sourceWindow: win1,
      });
      TestBed.tick();
      await flushMicrotasks();

      registered.add(win2);
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 5403,
        sourceWindow: win2,
      });
      TestBed.tick();

      // win2 stays registered and never answers -> must still fire watchdog timeout.
      vi.advanceTimersByTime(5000);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Watchdog timeout: A2UI_CATALOG not received within 5 seconds.',
        }),
      );
      expect(service.watchdogFired()).toBe(true);
      expect(service.catalogError()).toBe(
        'Watchdog timeout: A2UI_CATALOG not received within 5 seconds.',
      );
      errorSpy.mockRestore();
    });

    it('does not swallow watchdog error when a prior handshake failed and a subsequent frame detaches', async () => {
      const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error').mockImplementation(() => {});
      const win1 = {name: 'failed-win'} as unknown as Window;
      const win2 = {name: 'detached-followup'} as unknown as Window;
      const registered = new Set<Window>([win1]);
      hostCommunicationMock.isRegisteredWindow.mockImplementation((w: Window) => registered.has(w));

      // Initial handshake fails via malformed payload -> settleHandshakeError sets hasReceivedCatalogResponse = true
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 5501,
        sourceWindow: win1,
      });
      TestBed.tick();
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: 'malformed',
        timestamp: 5502,
        sourceWindow: win1,
      });
      TestBed.tick();
      await flushMicrotasks();
      expect(service.hasReceivedCatalogResponse()).toBe(true);
      expect(service.catalogError()).toBe('Invalid or malformed A2UI_CATALOG payload received.');
      errorSpy.mockClear();

      // Subsequent frame starts a fresh handshake (clearing _catalogError) and detaches before answering
      registered.add(win2);
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 5503,
        sourceWindow: win2,
      });
      TestBed.tick();
      registered.delete(win2);
      vi.advanceTimersByTime(5000);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Watchdog timeout: A2UI_CATALOG not received within 5 seconds.',
        }),
      );
      expect(service.watchdogFired()).toBe(true);
      expect(service.catalogError()).toBe(
        'Watchdog timeout: A2UI_CATALOG not received within 5 seconds.',
      );
      errorSpy.mockRestore();
    });

    it('completes a subsequent RENDERER_READY to A2UI_CATALOG handshake normally after a silent detached clear', async () => {
      const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error').mockImplementation(() => {});
      const win1 = {name: 'coordinator'} as unknown as Window;
      const win2 = {name: 'evicted-card'} as unknown as Window;
      const win3 = {name: 'next-card'} as unknown as Window;
      const registered = new Set<Window>([win1]);
      hostCommunicationMock.isRegisteredWindow.mockImplementation((w: Window) => registered.has(w));

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 5601,
        sourceWindow: win1,
      });
      TestBed.tick();
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: {catalogId: 'coordinator-cat', protocolVersion: '1.0'},
        timestamp: 5602,
        sourceWindow: win1,
      });
      TestBed.tick();
      await flushMicrotasks();

      // Silent clear after win2 detaches
      registered.add(win2);
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 5603,
        sourceWindow: win2,
      });
      TestBed.tick();
      registered.delete(win2);
      vi.advanceTimersByTime(5000);
      expect(service.isHandshakeInProgress()).toBe(false);
      expect(errorSpy).not.toHaveBeenCalled();

      // Subsequent win3 completes a full handshake normally
      registered.add(win3);
      hostCommunicationMock.sendMessage.mockClear();
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 5604,
        sourceWindow: win3,
      });
      TestBed.tick();
      expect(hostCommunicationMock.sendMessage).toHaveBeenCalledWith(
        {type: PreviewBridgeMessageType.GET_CATALOG},
        win3,
      );

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: {catalogId: 'cat-after-clear', protocolVersion: '1.0'},
        timestamp: 5605,
        sourceWindow: win3,
      });
      TestBed.tick();
      await flushMicrotasks();

      expect(service.activeCatalog()?.catalogId).toBe('cat-after-clear');
      expect(service.isHandshakeInProgress()).toBe(false);
      expect(service.watchdogFired()).toBe(false);
      expect(service.catalogError()).toBeNull();
      errorSpy.mockRestore();
    });

    it('logs watchdog error after A -> B -> A renderer URL switches without a fresh live handshake', async () => {
      const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error').mockImplementation(() => {});
      const winA1 = {name: 'winA1'} as unknown as Window;
      const winA2 = {name: 'winA2'} as unknown as Window;
      const registered = new Set<Window>([winA1]);
      hostCommunicationMock.isRegisteredWindow.mockImplementation((w: Window) => registered.has(w));

      // Establish live catalog on URL A
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 5701,
        sourceWindow: winA1,
      });
      TestBed.tick();
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: {catalogId: 'cat-a', protocolVersion: '1.0'},
        timestamp: 5702,
        sourceWindow: winA1,
      });
      TestBed.tick();
      await flushMicrotasks();

      // Switch to URL B with no handshake outcome or watchdog read, then return to URL A
      resolvedUrlSignal.set('http://localhost/renderer-b');
      startupResolutionMock.getResolvedRendererUrl.mockReturnValue('http://localhost/renderer-b');
      TestBed.tick();

      resolvedUrlSignal.set('http://localhost/renderer');
      startupResolutionMock.getResolvedRendererUrl.mockReturnValue('http://localhost/renderer');
      TestBed.tick();

      // On return to A, a frame announces RENDERER_READY and is unregistered before answering
      registered.add(winA2);
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 5703,
        sourceWindow: winA2,
      });
      TestBed.tick();
      registered.delete(winA2);
      vi.advanceTimersByTime(5000);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Watchdog timeout: A2UI_CATALOG not received within 5 seconds.',
        }),
      );
      expect(service.watchdogFired()).toBe(true);
      expect(service.catalogError()).toBe(
        'Watchdog timeout: A2UI_CATALOG not received within 5 seconds.',
      );
      errorSpy.mockRestore();
    });

    it('logs watchdog error when catalog is hydrated only from IndexedDB cache and frame detaches', async () => {
      const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error').mockImplementation(() => {});
      const cachedCatalog = {
        catalogId: 'cached-cat',
        protocolVersion: '1.0',
        title: 'Cached Title',
        components: {Text: {type: 'object'}},
      };
      indexedDbStorageMock.getCatalogRecord.mockResolvedValue({
        rendererUrl: 'http://localhost/cached-only',
        catalogString: JSON.stringify(cachedCatalog),
        checksumHash: 'cachedhash123',
        lastAccessed: 1000,
      });

      resolvedUrlSignal.set('http://localhost/cached-only');
      startupResolutionMock.getResolvedRendererUrl.mockReturnValue('http://localhost/cached-only');
      TestBed.tick();
      await flushMicrotasks();
      TestBed.tick();
      await flushMicrotasks();

      expect(service.hasReceivedCatalogResponse()).toBe(true);
      expect(service.activeCatalog()?.catalogId).toBe('cached-cat');

      const winCached = {name: 'winCached'} as unknown as Window;
      const registered = new Set<Window>([winCached]);
      hostCommunicationMock.isRegisteredWindow.mockImplementation((w: Window) => registered.has(w));

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 5801,
        sourceWindow: winCached,
      });
      TestBed.tick();
      registered.delete(winCached);
      vi.advanceTimersByTime(5000);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Watchdog timeout: A2UI_CATALOG not received within 5 seconds.',
        }),
      );
      expect(service.watchdogFired()).toBe(true);
      expect(service.catalogError()).toBe(
        'Watchdog timeout: A2UI_CATALOG not received within 5 seconds.',
      );
      errorSpy.mockRestore();
    });

    it('clears the handshake at once when its window is unregistered after a live catalog', async () => {
      const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error').mockImplementation(() => {});
      const win1 = {name: 'coordinator'} as unknown as Window;
      const win2 = {name: 'evicted-card'} as unknown as Window;
      const registered = new Set<Window>([win1]);
      hostCommunicationMock.isRegisteredWindow.mockImplementation((w: Window) => registered.has(w));

      await establishLiveCatalog(win1, 'coordinator-cat');
      registered.add(win2);
      announceRendererReady(win2);
      expect(service.isHandshakeInProgress()).toBe(true);
      expect(service.handshakeState()).toBe('in-progress');

      unregisterWindow(registered, win2);

      // No timer has advanced: the handshake ends with the unregistration.
      expect(service.isHandshakeInProgress()).toBe(false);
      expect(service.handshakeState()).toBe('settled');
      expect(service.catalogError()).toBeNull();
      expect(service.watchdogFired()).toBe(false);
      expect(errorSpy).not.toHaveBeenCalled();
      expect(service.activeCatalog()?.catalogId).toBe('coordinator-cat');

      vi.advanceTimersByTime(5000);

      expect(service.isHandshakeInProgress()).toBe(false);
      expect(service.handshakeState()).toBe('settled');
      expect(service.catalogError()).toBeNull();
      expect(service.watchdogFired()).toBe(false);
      expect(errorSpy).not.toHaveBeenCalled();
      errorSpy.mockRestore();
    });

    it('keeps the handshake when a different window is unregistered', async () => {
      const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error').mockImplementation(() => {});
      const win1 = {name: 'coordinator'} as unknown as Window;
      const win2 = {name: 'stalled-card'} as unknown as Window;
      const win3 = {name: 'other-card'} as unknown as Window;
      const registered = new Set<Window>([win1]);
      hostCommunicationMock.isRegisteredWindow.mockImplementation((w: Window) => registered.has(w));

      await establishLiveCatalog(win1, 'coordinator-cat');
      registered.add(win2);
      registered.add(win3);
      announceRendererReady(win2);

      unregisterWindow(registered, win3);

      expect(service.isHandshakeInProgress()).toBe(true);
      expect(service.handshakeState()).toBe('in-progress');
      expect(errorSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(5000);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Watchdog timeout: A2UI_CATALOG not received within 5 seconds.',
        }),
      );
      expect(service.watchdogFired()).toBe(true);
      errorSpy.mockRestore();
    });

    it('keeps the watchdog running when the handshake window is unregistered before any live catalog', () => {
      const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error').mockImplementation(() => {});
      const win1 = {name: 'coordinator'} as unknown as Window;
      const registered = new Set<Window>([win1]);
      hostCommunicationMock.isRegisteredWindow.mockImplementation((w: Window) => registered.has(w));

      announceRendererReady(win1);

      unregisterWindow(registered, win1);

      expect(service.isHandshakeInProgress()).toBe(true);
      expect(service.handshakeState()).toBe('in-progress');
      expect(errorSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(4999);
      expect(errorSpy).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Watchdog timeout: A2UI_CATALOG not received within 5 seconds.',
        }),
      );
      expect(service.watchdogFired()).toBe(true);
      expect(service.catalogError()).toBe(
        'Watchdog timeout: A2UI_CATALOG not received within 5 seconds.',
      );
      errorSpy.mockRestore();
    });

    it('does not count a live catalog from the previous renderer URL', async () => {
      const win1 = {name: 'previous-renderer'} as unknown as Window;
      const win2 = {name: 'next-renderer'} as unknown as Window;
      const registered = new Set<Window>([win1]);
      hostCommunicationMock.isRegisteredWindow.mockImplementation((w: Window) => registered.has(w));

      await establishLiveCatalog(win1, 'previous-cat');

      // The URL moves on, and the new frame announces and is unregistered
      // before any effect has observed the change.
      resolvedUrlSignal.set('http://localhost/renderer-next');
      startupResolutionMock.getResolvedRendererUrl.mockReturnValue(
        'http://localhost/renderer-next',
      );

      registered.add(win2);
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 4,
        sourceWindow: win2,
      });
      expect(service.isHandshakeInProgress()).toBe(true);

      unregisterWindow(registered, win2);

      expect(service.isHandshakeInProgress()).toBe(true);
      expect(service.handshakeState()).toBe('in-progress');
    });
  });

  describe('stale async catalog continuation guards', () => {
    function createDeferred<T>(): {
      promise: Promise<T>;
      resolve: (value: T) => void;
      reject: (reason?: unknown) => void;
    } {
      let resolve!: (value: T) => void;
      let reject!: (reason?: unknown) => void;
      const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return {promise, resolve, reject};
    }

    function switchRendererUrl(url: string | null): void {
      resolvedUrlSignal.set(url);
      startupResolutionMock.getResolvedRendererUrl.mockReturnValue(url);
      TestBed.tick();
    }

    async function flushMicrotasks(count = 15): Promise<void> {
      for (let i = 0; i < count; i++) {
        await Promise.resolve();
      }
    }

    const catalogA: Catalog = {
      catalogId: 'https://a2ui-project.github.io/composer/catalogs/slack/v1',
      title: 'Slack Catalog A',
      components: {SlackMsg: {type: 'object'}},
    };

    const catalogB: Catalog = {
      catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
      protocolVersion: '1.0',
      title: 'Angular Basic B',
      components: {Text: {type: 'object'}},
    };

    it('drops stale A2UI_CATALOG continuation if renderer switches while awaiting checksum', async () => {
      const digestDeferred = createDeferred<ArrayBuffer>();
      vi.spyOn(crypto.subtle, 'digest')
        .mockReturnValueOnce(digestDeferred.promise)
        .mockResolvedValue(new Uint8Array(32).fill(7).buffer);

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 5001,
      });
      TestBed.tick();

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: catalogA,
        timestamp: 5002,
      });
      TestBed.tick();

      switchRendererUrl('http://localhost/renderer-b');
      await flushMicrotasks();

      expect(service.handshakeState()).toBe('idle');
      expect(service.isHandshakeInProgress()).toBe(false);
      expect(service.activeCatalog()).toBeNull();
      expect(service.hasReceivedCatalogResponse()).toBe(false);

      digestDeferred.resolve(new Uint8Array(32).fill(1).buffer);
      await flushMicrotasks();

      expect(indexedDbStorageMock.saveCatalogRecord).not.toHaveBeenCalled();
      expect(service.activeCatalog()).toBeNull();
      expect(service.activeCatalogs()).toEqual([]);
      expect(service.hasReceivedCatalogResponse()).toBe(false);
      expect(service.handshakeState()).toBe('idle');
      expect(service.isHandshakeInProgress()).toBe(false);
      expect(service.lastCatalogString()).toBe('');
      expect(service.lastChecksumHash()).toBe('');

      // Renderer B's own later handshake proceeds and settles cleanly without getting stuck.
      hostCommunicationMock.sendMessage.mockClear();
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 5003,
      });
      TestBed.tick();
      expect(hostCommunicationMock.sendMessage).toHaveBeenCalledWith({
        type: PreviewBridgeMessageType.GET_CATALOG,
      });
      expect(service.isHandshakeInProgress()).toBe(true);
      expect(service.handshakeState()).toBe('in-progress');

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: catalogB,
        timestamp: 5004,
      });
      TestBed.tick();
      await flushMicrotasks();

      expect(indexedDbStorageMock.saveCatalogRecord).toHaveBeenCalledTimes(1);
      expect(indexedDbStorageMock.saveCatalogRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          rendererUrl: 'http://localhost/renderer-b',
          catalogJson: catalogB,
        }),
      );
      expect(service.activeCatalog()).toEqual(catalogB);
      expect(service.hasReceivedCatalogResponse()).toBe(true);
      expect(service.handshakeState()).toBe('settled');
      expect(service.isHandshakeInProgress()).toBe(false);

      await vi.advanceTimersByTimeAsync(6000);
      expect(service.watchdogFired()).toBe(false);
      expect(service.catalogError()).toBeNull();
    });

    it('drops stale A2UI_CATALOG continuation if renderer switches while awaiting IndexedDB getCatalogRecord', async () => {
      const getRecordDeferred = createDeferred<null>();
      indexedDbStorageMock.getCatalogRecord.mockImplementation(async (url: string) => {
        if (url === 'http://localhost/renderer') {
          return getRecordDeferred.promise;
        }
        return null;
      });

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: catalogA,
        timestamp: 5010,
      });
      TestBed.tick();
      await flushMicrotasks();

      expect(indexedDbStorageMock.getCatalogRecord).toHaveBeenCalledWith(
        'http://localhost/renderer',
      );

      switchRendererUrl('http://localhost/renderer-b');
      await flushMicrotasks();

      getRecordDeferred.resolve(null);
      await flushMicrotasks();

      expect(indexedDbStorageMock.saveCatalogRecord).not.toHaveBeenCalled();
      expect(service.activeCatalog()).toBeNull();
      expect(service.activeCatalogs()).toEqual([]);
      expect(service.hasReceivedCatalogResponse()).toBe(false);
      expect(service.handshakeState()).toBe('idle');
      expect(service.isHandshakeInProgress()).toBe(false);
      expect(service.lastCatalogString()).toBe('');
      expect(service.lastChecksumHash()).toBe('');
    });

    it('drops stale A2UI_CATALOG continuation if renderer switches while awaiting IndexedDB saveCatalogRecord', async () => {
      const saveRecordDeferred = createDeferred<void>();
      indexedDbStorageMock.saveCatalogRecord.mockImplementationOnce(async () => {
        return saveRecordDeferred.promise;
      });

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: catalogA,
        timestamp: 5020,
      });
      TestBed.tick();
      await flushMicrotasks();

      expect(indexedDbStorageMock.saveCatalogRecord).toHaveBeenCalledTimes(1);

      switchRendererUrl('http://localhost/renderer-b');
      await flushMicrotasks();

      saveRecordDeferred.resolve();
      await flushMicrotasks();

      expect(service.activeCatalog()).toBeNull();
      expect(service.activeCatalogs()).toEqual([]);
      expect(service.hasReceivedCatalogResponse()).toBe(false);
      expect(service.handshakeState()).toBe('idle');
      expect(service.isHandshakeInProgress()).toBe(false);
      expect(service.lastCatalogString()).toBe('');
      expect(service.lastChecksumHash()).toBe('');
    });

    it('drops stale A2UI_CATALOG continuation on A -> B -> A generation bounce', async () => {
      const digestDeferred = createDeferred<ArrayBuffer>();
      vi.spyOn(crypto.subtle, 'digest')
        .mockReturnValueOnce(digestDeferred.promise)
        .mockResolvedValue(new Uint8Array(32).fill(9).buffer);

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: catalogA,
        timestamp: 5030,
      });
      TestBed.tick();

      switchRendererUrl('http://localhost/renderer-b');
      switchRendererUrl('http://localhost/renderer');

      digestDeferred.resolve(new Uint8Array(32).fill(2).buffer);
      await flushMicrotasks();

      expect(indexedDbStorageMock.saveCatalogRecord).not.toHaveBeenCalled();
      expect(service.activeCatalog()).toBeNull();
      expect(service.hasReceivedCatalogResponse()).toBe(false);
      expect(service.handshakeState()).toBe('idle');
    });

    it('ignores async errors from stale A2UI_CATALOG continuations after switching renderers', async () => {
      const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error').mockImplementation(() => {});
      const digestDeferred = createDeferred<ArrayBuffer>();
      vi.spyOn(crypto.subtle, 'digest').mockReturnValueOnce(digestDeferred.promise);

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        origin: 'http://localhost',
        payload: catalogA,
        timestamp: 5040,
      });
      TestBed.tick();

      switchRendererUrl('http://localhost/renderer-b');

      digestDeferred.reject(new Error('digest failed after switch'));
      await flushMicrotasks();

      expect(service.catalogError()).toBeNull();
      expect(service.hasReceivedCatalogResponse()).toBe(false);
      expect(service.handshakeState()).toBe('idle');
      expect(service.isHandshakeInProgress()).toBe(false);
      errorSpy.mockRestore();
    });
  });
});
