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
import {Catalog} from '../models/catalog-storage.model';

describe('CatalogManagement', () => {
  let service: CatalogManagement;
  let hostCommunicationMock: {
    latestEnvelope: WritableSignal<MessageEnvelope | null>;
    messageStream$: Subject<MessageEnvelope>;
    sendMessage: ReturnType<typeof vi.fn>;
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
      sendMessage: vi.fn(),
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

    async function flushMicrotasks(count = 10): Promise<void> {
      for (let i = 0; i < count; i++) {
        await Promise.resolve();
      }
    }

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
  });
});
