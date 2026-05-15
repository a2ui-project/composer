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
import {Subject} from 'rxjs';

describe('CatalogManagementService', () => {
  let service: CatalogManagementService;
  let hostCommunicationServiceMock: {
    latestEnvelope: WritableSignal<MessageEnvelope | null>;
    messageStream$: Subject<MessageEnvelope>;
    sendMessage: ReturnType<typeof vi.fn>;
  };
  let indexedDbStorageServiceMock: Partial<IndexedDbStorageService>;
  let startupResolutionServiceMock: Partial<StartupResolutionService>;

  beforeEach(() => {
    TestBed.resetTestingModule();
    vi.useFakeTimers();

    hostCommunicationServiceMock = {
      latestEnvelope: signal<MessageEnvelope | null>(null),
      messageStream$: new Subject<MessageEnvelope>(),
      sendMessage: vi.fn(),
    };

    indexedDbStorageServiceMock = {};
    startupResolutionServiceMock = {};

    TestBed.configureTestingModule({
      providers: [
        CatalogManagementService,
        {provide: HostCommunicationService, useValue: hostCommunicationServiceMock},
        {provide: IndexedDbStorageService, useValue: indexedDbStorageServiceMock},
        {provide: StartupResolutionService, useValue: startupResolutionServiceMock},
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

  it('clears handshake lock when A2UI_CATALOG is received', () => {
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
    expect(service.isHandshakeInProgress()).toBe(false);
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
    expect(service.isHandshakeInProgress()).toBe(false);
  });

  it('clears watchdog timer when A2UI_CATALOG arrives before timeout', () => {
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
    expect(service.isHandshakeInProgress()).toBe(false);

    vi.advanceTimersByTime(2000);
    expect(service.watchdogFired()).toBe(false);
  });
});
