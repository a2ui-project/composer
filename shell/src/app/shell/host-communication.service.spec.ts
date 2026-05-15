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
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
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
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
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
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
    const unauthorizedWindow = {postMessage: vi.fn()} as unknown as Window;
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
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
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

    service.sendMessage({type: 'GET_CATALOG'});

    expect(mockIframeWindow.postMessage).toHaveBeenCalledWith(
      {type: 'GET_CATALOG'},
      'http://localhost:3000',
    );
  });

  it('blocks sendMessage when payload is malformed', () => {
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
    service.registerIframe(mockIframeWindow);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    service.sendMessage({type: 'RENDER_A2UI', payload: {invalid: 'not an array'}});

    expect(mockIframeWindow.postMessage).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Blocked dispatch of malformed message type...', {
      type: 'RENDER_A2UI',
      payload: {invalid: 'not an array'},
    });

    consoleSpy.mockRestore();
  });

  it('blocks sendRenderA2UI when array items lack version v0.9', () => {
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
    service.registerIframe(mockIframeWindow);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    service.sendRenderA2UI([{updateDataModel: {surfaceId: 's-1'}}]);

    expect(mockIframeWindow.postMessage).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('successfully invokes postMessage when sendRenderA2UI is called with a valid payload', () => {
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
    service.registerIframe(mockIframeWindow);

    const validPayload = [{version: 'v0.9', updateDataModel: {surfaceId: 's-1'}}];
    service.sendRenderA2UI(validPayload);

    expect(mockIframeWindow.postMessage).toHaveBeenCalledWith(
      {type: 'RENDER_A2UI', payload: validPayload},
      'http://localhost:3000',
    );
  });
});
