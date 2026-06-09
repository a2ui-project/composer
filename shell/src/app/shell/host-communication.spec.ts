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
import {HostCommunication} from './host-communication';
import {StartupResolution} from './startup-resolution';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {PreviewBridgeMessageType} from 'a2ui-bridge';

describe('HostCommunication', () => {
  let service: HostCommunication;
  let startupResolutionMock: Partial<StartupResolution>;

  beforeEach(() => {
    startupResolutionMock = {
      getResolvedRendererUrl: vi.fn().mockReturnValue('http://localhost:3000/renderer'),
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: StartupResolution,
          useValue: startupResolutionMock,
        },
      ],
    });

    service = TestBed.inject(HostCommunication);
  });

  afterEach(() => {
    service.ngOnDestroy();
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
      data: {type: PreviewBridgeMessageType.RENDERER_READY, payload: {status: 'ok'}},
    });

    window.dispatchEvent(event);

    expect(service.latestEnvelope()).toEqual({
      type: PreviewBridgeMessageType.RENDERER_READY,
      payload: {status: 'ok'},
      origin: 'http://localhost:3000',
      timestamp: expect.any(Number),
    });
  });

  it('assigns undefined payload when incoming message omits payload field', () => {
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
    service.registerIframe(mockIframeWindow);

    const event = new MessageEvent('message', {
      source: mockIframeWindow,
      origin: 'http://localhost:3000',
      data: {type: PreviewBridgeMessageType.RENDERER_READY},
    });

    window.dispatchEvent(event);

    expect(service.latestEnvelope()).toEqual({
      type: PreviewBridgeMessageType.RENDERER_READY,
      payload: undefined,
      origin: 'http://localhost:3000',
      timestamp: expect.any(Number),
    });
  });

  it('rejects message and does not emit envelope when source does not match registered iframe', () => {
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
    const unauthorizedWindow = {postMessage: vi.fn()} as unknown as Window;
    service.registerIframe(mockIframeWindow);

    const event = new MessageEvent('message', {
      source: unauthorizedWindow,
      origin: 'http://localhost:3000',
      data: {type: PreviewBridgeMessageType.RENDERER_READY},
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
      data: {type: PreviewBridgeMessageType.RENDERER_READY},
    });

    window.dispatchEvent(event);

    expect(service.latestEnvelope()).toBeNull();
  });

  it('sends message back to registered iframe using resolved target origin', () => {
    const mockIframeWindow = {
      postMessage: vi.fn(),
    } as unknown as Window;
    service.registerIframe(mockIframeWindow);

    service.sendMessage({type: PreviewBridgeMessageType.GET_CATALOG});

    expect(mockIframeWindow.postMessage).toHaveBeenCalledWith(
      {type: PreviewBridgeMessageType.GET_CATALOG},
      'http://localhost:3000',
    );
  });

  it('blocks sendMessage when payload is malformed', () => {
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
    service.registerIframe(mockIframeWindow);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    service.sendMessage({
      type: PreviewBridgeMessageType.RENDER_A2UI,
      payload: {invalid: 'not an array'},
    });

    expect(mockIframeWindow.postMessage).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Blocked dispatch of malformed message type...', {
      type: PreviewBridgeMessageType.RENDER_A2UI,
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
      {type: PreviewBridgeMessageType.RENDER_A2UI, payload: validPayload},
      'http://localhost:3000',
    );
  });

  it('validates origin and emits envelope when message is received from registered iframe element', () => {
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
    const mockIFrameElement = {contentWindow: mockIframeWindow} as unknown as HTMLIFrameElement;
    service.registerIframeElement(mockIFrameElement);

    const event = new MessageEvent('message', {
      source: mockIframeWindow,
      origin: 'http://localhost:3000',
      data: {type: PreviewBridgeMessageType.RENDERER_READY, payload: {status: 'ok'}},
    });

    window.dispatchEvent(event);

    expect(service.latestEnvelope()).toEqual({
      type: PreviewBridgeMessageType.RENDERER_READY,
      payload: {status: 'ok'},
      origin: 'http://localhost:3000',
      timestamp: expect.any(Number),
    });
  });

  it('sends message back to registered iframe element', () => {
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
    const mockIFrameElement = {contentWindow: mockIframeWindow} as unknown as HTMLIFrameElement;
    service.registerIframeElement(mockIFrameElement);

    service.sendMessage({type: PreviewBridgeMessageType.GET_CATALOG});

    expect(mockIframeWindow.postMessage).toHaveBeenCalledWith(
      {type: PreviewBridgeMessageType.GET_CATALOG},
      'http://localhost:3000',
    );
  });

  it('ignores incoming message if event data is null, non-object, or missing type', () => {
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
    service.registerIframe(mockIframeWindow);

    const events = [
      new MessageEvent('message', {
        source: mockIframeWindow,
        origin: 'http://localhost:3000',
        data: null,
      }),
      new MessageEvent('message', {
        source: mockIframeWindow,
        origin: 'http://localhost:3000',
        data: 'string-data',
      }),
      new MessageEvent('message', {
        source: mockIframeWindow,
        origin: 'http://localhost:3000',
        data: {payload: {}},
      }),
    ];

    for (const event of events) {
      window.dispatchEvent(event);
      expect(service.latestEnvelope()).toBeNull();
    }
  });

  it('ignores incoming messages and blocks sendMessage when resolved renderer URL is null', () => {
    startupResolutionMock.getResolvedRendererUrl = vi.fn().mockReturnValue(null);
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
    service.registerIframe(mockIframeWindow);

    const event = new MessageEvent('message', {
      source: mockIframeWindow,
      origin: 'http://localhost:3000',
      data: {type: PreviewBridgeMessageType.RENDERER_READY},
    });

    window.dispatchEvent(event);
    expect(service.latestEnvelope()).toBeNull();

    service.sendMessage({type: PreviewBridgeMessageType.GET_CATALOG});
    expect(mockIframeWindow.postMessage).not.toHaveBeenCalled();
  });

  it('handles malformed resolved renderer URL gracefully in messageListener and sendMessage', () => {
    startupResolutionMock.getResolvedRendererUrl = vi.fn().mockReturnValue('http://[');
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
    service.registerIframe(mockIframeWindow);

    const event = new MessageEvent('message', {
      source: mockIframeWindow,
      origin: 'http://localhost:3000',
      data: {type: PreviewBridgeMessageType.RENDERER_READY},
    });

    window.dispatchEvent(event);
    expect(service.latestEnvelope()).toBeNull();

    expect(() => service.sendMessage({type: PreviewBridgeMessageType.GET_CATALOG})).not.toThrow();
    expect(mockIframeWindow.postMessage).not.toHaveBeenCalled();
  });

  it('excludes CONSOLE_LOG messages from the messageHistoryBuffer while keeping other control messages', () => {
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
    service.registerIframe(mockIframeWindow);

    // Send a non-console control message
    window.dispatchEvent(
      new MessageEvent('message', {
        source: mockIframeWindow,
        origin: 'http://localhost:3000',
        data: {type: PreviewBridgeMessageType.RENDERER_READY},
      }),
    );

    // Send a console log message
    window.dispatchEvent(
      new MessageEvent('message', {
        source: mockIframeWindow,
        origin: 'http://localhost:3000',
        data: {
          type: PreviewBridgeMessageType.CONSOLE_LOG,
          payload: {level: 'log', message: 'info log'},
        },
      }),
    );

    const history = service.getHistoryBuffer();
    expect(history.length).toBe(1);
    expect(history[0].type).toBe(PreviewBridgeMessageType.RENDERER_READY);
  });

  it('cleans up global window event listeners and properties upon destruction', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    service.ngOnDestroy();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));
    expect(window.a2uiHostCommunication).toBeUndefined();

    removeEventListenerSpy.mockRestore();
  });
});
