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
import {CatalogManagementService} from './catalog-management.service';
import {HostCommunicationService, MessageEnvelope} from '../shell/host-communication.service';
import {IndexedDbStorageService} from './indexed-db-storage.service';
import {StartupResolutionService} from '../shell/startup-resolution.service';
import {signal, WritableSignal} from '@angular/core';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {Catalog} from './catalog-storage.model';

describe('CatalogManagementService', () => {
  let service: CatalogManagementService;
  let hostCommunicationServiceMock: {
    latestEnvelope: WritableSignal<MessageEnvelope | null>;
    messageStream: WritableSignal<MessageEnvelope | null>;
    sendMessage: ReturnType<typeof vi.fn>;
  };
  let indexedDbStorageServiceMock: {
    getCatalogRecord: ReturnType<typeof vi.fn>;
    saveCatalogRecord: ReturnType<typeof vi.fn>;
  };
  let startupResolutionServiceMock: {
    getResolvedRendererUrl: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    vi.useFakeTimers();
    vi.spyOn(crypto.subtle, 'digest').mockResolvedValue(new Uint8Array(32).buffer);

    hostCommunicationServiceMock = {
      latestEnvelope: signal<MessageEnvelope | null>(null),
      messageStream: signal<MessageEnvelope | null>(null),
      sendMessage: vi.fn(),
    };

    indexedDbStorageServiceMock = {
      getCatalogRecord: vi.fn().mockResolvedValue(null),
      saveCatalogRecord: vi.fn().mockResolvedValue(undefined),
    };

    startupResolutionServiceMock = {
      getResolvedRendererUrl: vi.fn().mockReturnValue('http://localhost/renderer'),
    };

    TestBed.configureTestingModule({
      providers: [
        CatalogManagementService,
        {
          provide: HostCommunicationService,
          useValue: hostCommunicationServiceMock,
        },
        {
          provide: IndexedDbStorageService,
          useValue: indexedDbStorageServiceMock,
        },
        {
          provide: StartupResolutionService,
          useValue: startupResolutionServiceMock,
        },
      ],
    });

    service = TestBed.inject(CatalogManagementService);
  });

  afterEach(() => {
    hostCommunicationServiceMock.latestEnvelope.set(null);
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
      hostCommunicationServiceMock.messageStream.set({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 1001,
      });
      TestBed.tick();

      expect(service.isHandshakeInProgress()).toBe(true);
      expect(hostCommunicationServiceMock.sendMessage).toHaveBeenCalledWith({
        type: PreviewBridgeMessageType.GET_CATALOG,
      });
    },
  );

  it(
    'logs a warning and ignores subsequent RENDERER_READY if handshake ' + 'is already in progress',
    () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      hostCommunicationServiceMock.messageStream.set({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 1002,
      });
      TestBed.tick();

      expect(service.isHandshakeInProgress()).toBe(true);
      expect(hostCommunicationServiceMock.sendMessage).toHaveBeenCalledTimes(1);

      hostCommunicationServiceMock.messageStream.set({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        payload: 'retry',
        timestamp: 1003,
      });
      TestBed.tick();

      expect(warnSpy).toHaveBeenCalledWith(
        'Handshake already in progress. Ignoring RENDERER_READY.',
      );
      expect(hostCommunicationServiceMock.sendMessage).toHaveBeenCalledTimes(1);
    },
  );

  it('clears handshake lock when A2UI_CATALOG arrives and hashing completes', async () => {
    hostCommunicationServiceMock.messageStream.set({
      type: PreviewBridgeMessageType.RENDERER_READY,
      origin: 'http://localhost',
      timestamp: 1004,
    });
    TestBed.tick();
    expect(service.isHandshakeInProgress()).toBe(true);

    hostCommunicationServiceMock.messageStream.set({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload: {},
      timestamp: 1005,
    });
    TestBed.tick();

    vi.useRealTimers();
    vi.restoreAllMocks();
    await new Promise(resolve => setTimeout(resolve, 50));
    vi.useFakeTimers();

    expect(service.isHandshakeInProgress()).toBe(false);
    expect(service.catalogError()).toBeNull();
    expect(service.activeCatalog()).toEqual({});
  });

  it(
    'resets handshake lock and logs error on 5-second watchdog timeout if ' +
      'A2UI_CATALOG is not received',
    () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      hostCommunicationServiceMock.messageStream.set({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 1006,
      });
      TestBed.tick();
      expect(service.isHandshakeInProgress()).toBe(true);

      vi.advanceTimersByTime(5000);
      expect(errorSpy).toHaveBeenCalledWith(
        'Watchdog timeout: A2UI_CATALOG not received within 5 seconds.',
      );
      expect(service.watchdogFired()).toBe(true);
      expect(service.catalogError()).toBe(
        'Watchdog timeout: A2UI_CATALOG not received within 5 seconds.',
      );
      expect(service.isHandshakeInProgress()).toBe(false);
    },
  );

  it('clears watchdog timer when A2UI_CATALOG arrives before timeout', async () => {
    hostCommunicationServiceMock.messageStream.set({
      type: PreviewBridgeMessageType.RENDERER_READY,
      origin: 'http://localhost',
      timestamp: 1007,
    });
    TestBed.tick();
    expect(service.isHandshakeInProgress()).toBe(true);

    vi.advanceTimersByTime(3000);
    expect(service.isHandshakeInProgress()).toBe(true);

    hostCommunicationServiceMock.messageStream.set({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload: {},
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
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    hostCommunicationServiceMock.messageStream.set({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload: null,
      timestamp: 1009,
    });
    TestBed.tick();

    expect(service.catalogError()).toBe('Invalid or malformed A2UI_CATALOG payload received.');
    expect(errorSpy).toHaveBeenCalledWith(
      'Invalid or malformed A2UI_CATALOG payload received.',
      null,
    );
  });

  it(
    'handles flat catalog error payloads returned by the preview bridge, ' +
      'updating catalogError signal',
    async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      hostCommunicationServiceMock.messageStream.set({
        type: PreviewBridgeMessageType.RENDERER_READY,
        origin: 'http://localhost',
        timestamp: 3001,
      });
      TestBed.tick();

      expect(service.isHandshakeInProgress()).toBe(true);

      // Simulate bridge sending a flat error payload
      hostCommunicationServiceMock.messageStream.set({
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
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    },
  );

  it('sanitizes HTML tags in title and description and computes SHA-256 hash', async () => {
    const payload = {
      title: 'Catalog Title <script>alert(1)</script>',
      description: 'Catalog Description <img src=x onerror=alert(1)>',
      components: {
        button: {name: 'Button'},
      },
    };

    hostCommunicationServiceMock.messageStream.set({
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
    expect(service.activeCatalogDescription()).toBe('Catalog Description <img src="x">');

    const expectedHash = service.lastChecksumHash();
    expect(expectedHash).toBeTruthy();
    expect(expectedHash.length).toBe(64);

    // Verify deterministic hashing for identical catalog structures
    const payloadIdentical = {
      components: {
        button: {name: 'Button'},
      },
      title: 'Catalog Title <script>alert(1)</script>',
      description: 'Catalog Description <img src=x onerror=alert(1)>',
    };

    hostCommunicationServiceMock.messageStream.set({
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
    indexedDbStorageServiceMock.getCatalogRecord.mockResolvedValue(null);

    const payload = {
      title: 'New Catalog',
      description: 'New Description',
      components: {},
    };

    hostCommunicationServiceMock.messageStream.set({
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

    expect(indexedDbStorageServiceMock.getCatalogRecord).toHaveBeenCalledWith(
      'http://localhost/renderer',
    );
    expect(service.catalogHashDelta()).toBe(true);
    expect(indexedDbStorageServiceMock.saveCatalogRecord).toHaveBeenCalledWith({
      rendererUrl: 'http://localhost/renderer',
      catalogString: service.lastCatalogString(),
      checksumHash: service.lastChecksumHash(),
      lastAccessed: expect.any(Number),
    });

    expect(service.activeCatalog()).toEqual(payload);
    expect(service.activeCatalogTitle()).toBe('New Catalog');
    expect(service.activeCatalogDescription()).toBe('New Description');
  });

  it('executes IndexedDB write transaction on delta when cached hash differs', async () => {
    indexedDbStorageServiceMock.getCatalogRecord.mockResolvedValue({
      rendererUrl: 'http://localhost/renderer',
      catalogString: '{}',
      checksumHash: 'oldhash',
      lastAccessed: 1000,
    });

    const payload = {
      title: 'Updated Catalog',
      description: 'Updated Description',
      components: {},
    };

    hostCommunicationServiceMock.messageStream.set({
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

    expect(indexedDbStorageServiceMock.getCatalogRecord).toHaveBeenCalledWith(
      'http://localhost/renderer',
    );
    expect(service.catalogHashDelta()).toBe(true);
    expect(indexedDbStorageServiceMock.saveCatalogRecord).toHaveBeenCalledWith({
      rendererUrl: 'http://localhost/renderer',
      catalogString: service.lastCatalogString(),
      checksumHash: service.lastChecksumHash(),
      lastAccessed: expect.any(Number),
    });

    expect(service.activeCatalog()).toEqual(payload);
    expect(service.activeCatalogTitle()).toBe('Updated Catalog');
    expect(service.activeCatalogDescription()).toBe('Updated Description');
  });

  it('updates lastAccessed but delta is false when cached hash matches', async () => {
    const payload = {
      title: 'Matching Catalog',
      description: 'Matching Description',
      components: {},
    };

    hostCommunicationServiceMock.messageStream.set({
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
    indexedDbStorageServiceMock.saveCatalogRecord.mockClear();

    indexedDbStorageServiceMock.getCatalogRecord.mockResolvedValue({
      rendererUrl: 'http://localhost/renderer',
      catalogString: computedCatalogString,
      checksumHash: computedHash,
      lastAccessed: 1000,
    });

    hostCommunicationServiceMock.messageStream.set({
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
    expect(indexedDbStorageServiceMock.saveCatalogRecord).toHaveBeenCalledWith({
      rendererUrl: 'http://localhost/renderer',
      catalogString: computedCatalogString,
      checksumHash: computedHash,
      lastAccessed: expect.any(Number),
    });
  });

  it('handles insecure context when crypto.subtle is unavailable', async () => {
    const originalCrypto = globalThis.crypto;
    Object.defineProperty(globalThis, 'crypto', {
      value: {...originalCrypto, subtle: undefined},
      writable: true,
      configurable: true,
    });

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    hostCommunicationServiceMock.messageStream.set({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload: {},
      timestamp: 2001,
    });
    TestBed.tick();

    await vi.advanceTimersByTimeAsync(0);

    expect(service.catalogError()).toBe('Failed to compute catalog hash or access storage.');
    expect(service.isHandshakeInProgress()).toBe(false);

    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto,
      writable: true,
      configurable: true,
    });
    errorSpy.mockRestore();
  });

  it('handles cryptographic digest failures gracefully', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const digestSpy = vi
      .spyOn(crypto.subtle, 'digest')
      .mockRejectedValue(new Error('Digest failed'));

    hostCommunicationServiceMock.messageStream.set({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload: {},
      timestamp: 2002,
    });
    TestBed.tick();

    await vi.advanceTimersByTimeAsync(0);

    expect(service.catalogError()).toBe('Failed to compute catalog hash or access storage.');
    expect(service.isHandshakeInProgress()).toBe(false);

    digestSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('handles IndexedDbStorageService failures gracefully', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    indexedDbStorageServiceMock.getCatalogRecord.mockRejectedValue(
      new Error('Database read failure'),
    );

    hostCommunicationServiceMock.messageStream.set({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload: {},
      timestamp: 2003,
    });
    TestBed.tick();

    await vi.advanceTimersByTimeAsync(0);

    expect(service.catalogError()).toBe('Failed to compute catalog hash or access storage.');
    expect(service.isHandshakeInProgress()).toBe(false);
    errorSpy.mockRestore();
  });

  it('handshakes without IndexedDB if renderer URL is null', async () => {
    startupResolutionServiceMock.getResolvedRendererUrl.mockReturnValue(null);
    indexedDbStorageServiceMock.getCatalogRecord.mockClear();
    indexedDbStorageServiceMock.saveCatalogRecord.mockClear();

    const payload = {
      title: 'Null URL Catalog',
      description: 'Null URL Description',
      components: {},
    };

    hostCommunicationServiceMock.messageStream.set({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://localhost',
      payload,
      timestamp: 2004,
    });
    TestBed.tick();

    await vi.advanceTimersByTimeAsync(0);

    expect(indexedDbStorageServiceMock.getCatalogRecord).not.toHaveBeenCalled();
    expect(indexedDbStorageServiceMock.saveCatalogRecord).not.toHaveBeenCalled();

    expect(service.activeCatalog()).toEqual(payload);
    expect(service.activeCatalogTitle()).toBe('Null URL Catalog');
    expect(service.catalogError()).toBeNull();
    expect(service.isHandshakeInProgress()).toBe(false);
  });
});
