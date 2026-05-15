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
import {HostCommunicationService} from './host-communication.service';
import {StartupResolutionService} from './startup-resolution.service';
import {describe, it, expect, beforeEach, vi} from 'vitest';

describe('HostCommunicationService', () => {
  let service: HostCommunicationService;
  let startupResolutionServiceMock: Partial<StartupResolutionService>;

  beforeEach(() => {
    startupResolutionServiceMock = {
      getResolvedRendererUrl: vi.fn().mockReturnValue('http://localhost:3000/renderer'),
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: StartupResolutionService,
          useValue: startupResolutionServiceMock,
        },
      ],
    });

    service = TestBed.inject(HostCommunicationService);
  });

  it('initializes successfully', () => {
    expect(service).toBeTruthy();
  });

  it('validates origin and emits envelope when source and origin match', () => {
    const mockIframeWindow = {} as Window;
    service.registerIframe(mockIframeWindow);

    const event = new MessageEvent('message', {
      source: mockIframeWindow,
      origin: 'http://localhost:3000',
      data: {type: 'RENDERER_READY', payload: {status: 'ok'}},
    });

    window.dispatchEvent(event);

    expect(service.latestEnvelope()).toEqual({
      type: 'RENDERER_READY',
      payload: {status: 'ok'},
      origin: 'http://localhost:3000',
    });
  });

  it('assigns undefined payload when incoming message omits payload field', () => {
    const mockIframeWindow = {} as Window;
    service.registerIframe(mockIframeWindow);

    const event = new MessageEvent('message', {
      source: mockIframeWindow,
      origin: 'http://localhost:3000',
      data: {type: 'RENDERER_READY'},
    });

    window.dispatchEvent(event);

    expect(service.latestEnvelope()).toEqual({
      type: 'RENDERER_READY',
      payload: undefined,
      origin: 'http://localhost:3000',
    });
  });

  it('rejects message and does not emit envelope when source does not match registered iframe', () => {
    const mockIframeWindow = {} as Window;
    const unauthorizedWindow = {} as Window;
    service.registerIframe(mockIframeWindow);

    const event = new MessageEvent('message', {
      source: unauthorizedWindow,
      origin: 'http://localhost:3000',
      data: {type: 'RENDERER_READY'},
    });

    window.dispatchEvent(event);

    expect(service.latestEnvelope()).toBeNull();
  });

  it('rejects message when origin does not match resolved renderer URL', () => {
    const mockIframeWindow = {} as Window;
    service.registerIframe(mockIframeWindow);

    const event = new MessageEvent('message', {
      source: mockIframeWindow,
      origin: 'http://malicious-origin.com',
      data: {type: 'RENDERER_READY'},
    });

    window.dispatchEvent(event);

    expect(service.latestEnvelope()).toBeNull();
  });

  it('sends message back to registered iframe using resolved target origin', () => {
    const mockIframeWindow = {
      postMessage: vi.fn(),
    } as unknown as Window;
    service.registerIframe(mockIframeWindow);

    service.sendMessage({type: 'UPDATE_LAYOUT'});

    expect(mockIframeWindow.postMessage).toHaveBeenCalledWith(
      {type: 'UPDATE_LAYOUT'},
      'http://localhost:3000',
    );
  });
});
