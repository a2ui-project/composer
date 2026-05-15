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
import {signal, WritableSignal} from '@angular/core';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {Subject} from 'rxjs';

describe('CatalogManagementService', () => {
  let service: CatalogManagementService;
  let hostCommunicationServiceMock: {
    latestEnvelope: WritableSignal<MessageEnvelope | null>;
    messageStream$: Subject<MessageEnvelope>;
    sendMessage: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    vi.useFakeTimers();

    hostCommunicationServiceMock = {
      latestEnvelope: signal<MessageEnvelope | null>(null),
      messageStream$: new Subject<MessageEnvelope>(),
      sendMessage: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        CatalogManagementService,
        {provide: HostCommunicationService, useValue: hostCommunicationServiceMock},
      ],
    });

    service = TestBed.inject(CatalogManagementService);
  });

  afterEach(() => {
    hostCommunicationServiceMock.latestEnvelope.set(null);
    TestBed.flushEffects();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('initializes successfully with handshake not in progress', () => {
    expect(service).toBeTruthy();
    expect(service.isHandshakeInProgress()).toBe(false);
    expect(service.catalogError()).toBeNull();
  });

  it('sets handshake lock to true and sends GET_CATALOG when RENDERER_READY is received', () => {
    hostCommunicationServiceMock.messageStream$.next({
      type: 'RENDERER_READY',
      origin: 'http://localhost',
    });

    expect(service.isHandshakeInProgress()).toBe(true);
    expect(hostCommunicationServiceMock.sendMessage).toHaveBeenCalledWith({type: 'GET_CATALOG'});
  });

  it('logs a warning and ignores subsequent RENDERER_READY if handshake is already in progress', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    hostCommunicationServiceMock.messageStream$.next({
      type: 'RENDERER_READY',
      origin: 'http://localhost',
    });

    expect(service.isHandshakeInProgress()).toBe(true);
    expect(hostCommunicationServiceMock.sendMessage).toHaveBeenCalledTimes(1);

    // Trigger second RENDERER_READY
    hostCommunicationServiceMock.messageStream$.next({
      type: 'RENDERER_READY',
      origin: 'http://localhost',
      payload: 'retry',
    });

    expect(warnSpy).toHaveBeenCalledWith('Handshake already in progress. Ignoring RENDERER_READY.');
    expect(hostCommunicationServiceMock.sendMessage).toHaveBeenCalledTimes(1);
  });

  it('clears handshake lock when A2UI_CATALOG is received and hashing completes', async () => {
    hostCommunicationServiceMock.messageStream$.next({
      type: 'RENDERER_READY',
      origin: 'http://localhost',
    });
    expect(service.isHandshakeInProgress()).toBe(true);

    hostCommunicationServiceMock.messageStream$.next({
      type: 'A2UI_CATALOG',
      origin: 'http://localhost',
      payload: {},
    });

    vi.useRealTimers();
    await new Promise(resolve => setTimeout(resolve, 50));
    vi.useFakeTimers();
    expect(service.isHandshakeInProgress()).toBe(false);
    expect(service.catalogError()).toBeNull();
  });

  it('resets handshake lock and logs error on 5-second watchdog timeout if A2UI_CATALOG is not received', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    hostCommunicationServiceMock.messageStream$.next({
      type: 'RENDERER_READY',
      origin: 'http://localhost',
    });
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
  });

  it('clears watchdog timer when A2UI_CATALOG arrives before timeout', async () => {
    hostCommunicationServiceMock.messageStream$.next({
      type: 'RENDERER_READY',
      origin: 'http://localhost',
    });
    expect(service.isHandshakeInProgress()).toBe(true);

    vi.advanceTimersByTime(3000);
    expect(service.isHandshakeInProgress()).toBe(true);

    hostCommunicationServiceMock.messageStream$.next({
      type: 'A2UI_CATALOG',
      origin: 'http://localhost',
      payload: {},
    });

    vi.useRealTimers();
    await new Promise(resolve => setTimeout(resolve, 50));
    vi.useFakeTimers();
    expect(service.isHandshakeInProgress()).toBe(false);

    vi.advanceTimersByTime(2000);
    expect(service.watchdogFired()).toBe(false);
  });

  it('rejects malformed A2UI_CATALOG payload and sets catalogError signal', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    hostCommunicationServiceMock.messageStream$.next({
      type: 'A2UI_CATALOG',
      origin: 'http://localhost',
      payload: null,
    });

    expect(service.catalogError()).toBe('Invalid or malformed A2UI_CATALOG payload received.');
    expect(errorSpy).toHaveBeenCalledWith(
      'Invalid or malformed A2UI_CATALOG payload received.',
      null,
    );
  });

  it('sanitizes malicious HTML tags in title and description and computes deterministic SHA-256 hash', async () => {
    const payload = {
      title: 'Catalog Title <script>alert(1)</script>',
      description: 'Catalog Description <img src=x onerror=alert(1)>',
      components: [{id: 'button', name: 'Button'}],
    };

    hostCommunicationServiceMock.messageStream$.next({
      type: 'A2UI_CATALOG',
      origin: 'http://localhost',
      payload,
    });

    vi.useRealTimers();
    await new Promise(resolve => setTimeout(resolve, 50));
    vi.useFakeTimers();

    expect(service.lastCatalogString()).toContain('Catalog Title ');
    expect(service.lastCatalogString()).not.toContain('<script>');
    expect(service.lastCatalogString()).toContain('Catalog Description ');
    expect(service.lastCatalogString()).not.toContain('onerror');

    const expectedHash = service.lastChecksumHash();
    expect(expectedHash).toBeTruthy();
    expect(expectedHash.length).toBe(64);

    // Verify deterministic hashing for identical catalog structures
    const payloadIdentical = {
      components: [{id: 'button', name: 'Button'}],
      title: 'Catalog Title <script>alert(1)</script>',
      description: 'Catalog Description <img src=x onerror=alert(1)>',
    };

    hostCommunicationServiceMock.messageStream$.next({
      type: 'A2UI_CATALOG',
      origin: 'http://localhost',
      payload: payloadIdentical,
    });

    vi.useRealTimers();
    await new Promise(resolve => setTimeout(resolve, 50));
    vi.useFakeTimers();

    expect(service.lastChecksumHash()).toBe(expectedHash);
  });
});
