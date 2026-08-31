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
import {HostCommunication, MessageEnvelope} from './host-communication';
import {StartupResolution} from '../startup-resolution/startup-resolution';
import {
  AppConfigProvider,
  ThemePreference,
} from '../../settings/app-config-provider/app-config-provider';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {signal, WritableSignal} from '@angular/core';

describe('HostCommunication', () => {
  let service: HostCommunication;
  let startupResolutionMock: Partial<StartupResolution>;
  let themePreferenceSignal: WritableSignal<ThemePreference>;

  beforeEach(() => {
    themePreferenceSignal = signal<ThemePreference>(ThemePreference.LIGHT);
    startupResolutionMock = {
      getResolvedRendererUrl: vi.fn().mockReturnValue('http://localhost:3000/renderer'),
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: StartupResolution,
          useValue: startupResolutionMock,
        },
        {
          provide: AppConfigProvider,
          useValue: {
            themePreference: themePreferenceSignal,
          },
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
      sourceWindow: mockIframeWindow,
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
      sourceWindow: mockIframeWindow,
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
    window.dispatchEvent(
      new MessageEvent('message', {
        source: mockIframeWindow,
        origin: 'http://localhost:3000',
        data: {type: PreviewBridgeMessageType.RENDERER_READY},
      }),
    );

    service.sendMessage({type: PreviewBridgeMessageType.GET_CATALOG});

    expect(mockIframeWindow.postMessage).toHaveBeenCalledWith(
      {type: PreviewBridgeMessageType.GET_CATALOG},
      'http://localhost:3000',
    );
  });

  it('blocks sendMessage when payload is malformed', () => {
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
    service.registerIframe(mockIframeWindow);
    (mockIframeWindow.postMessage as ReturnType<typeof vi.fn>).mockClear();
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
    (mockIframeWindow.postMessage as ReturnType<typeof vi.fn>).mockClear();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    service.sendRenderA2UI([{updateDataModel: {surfaceId: 's-1'}}]);

    expect(mockIframeWindow.postMessage).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('successfully invokes postMessage when sendRenderA2UI is called with a valid payload', () => {
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
    service.registerIframe(mockIframeWindow);
    window.dispatchEvent(
      new MessageEvent('message', {
        source: mockIframeWindow,
        origin: 'http://localhost:3000',
        data: {type: PreviewBridgeMessageType.RENDERER_READY},
      }),
    );

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
    service.registerIframe(mockIFrameElement);

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
      sourceWindow: mockIframeWindow,
    });
  });

  it('sends message back to registered iframe element', () => {
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
    const mockIFrameElement = {contentWindow: mockIframeWindow} as unknown as HTMLIFrameElement;
    service.registerIframe(mockIFrameElement);
    window.dispatchEvent(
      new MessageEvent('message', {
        source: mockIframeWindow,
        origin: 'http://localhost:3000',
        data: {type: PreviewBridgeMessageType.RENDERER_READY},
      }),
    );

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

  it('buffers early messages when no iframe is registered and replays them upon registration', () => {
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;

    const event = new MessageEvent('message', {
      source: mockIframeWindow,
      origin: 'http://localhost:3000',
      data: {type: PreviewBridgeMessageType.RENDERER_READY, payload: {status: 'early'}},
    });

    window.dispatchEvent(event);

    expect(service.latestEnvelope()).toBeNull();

    service.registerIframe(mockIframeWindow);

    expect(service.latestEnvelope()).toEqual({
      type: PreviewBridgeMessageType.RENDERER_READY,
      payload: {status: 'early'},
      origin: 'http://localhost:3000',
      timestamp: expect.any(Number),
      sourceWindow: mockIframeWindow,
    });
  });

  it('buffers early messages when no iframe is registered and replays them upon element registration', () => {
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
    const mockIFrameElement = {contentWindow: mockIframeWindow} as unknown as HTMLIFrameElement;

    const event = new MessageEvent('message', {
      source: mockIframeWindow,
      origin: 'http://localhost:3000',
      data: {type: PreviewBridgeMessageType.RENDERER_READY, payload: {status: 'early-element'}},
    });

    window.dispatchEvent(event);

    expect(service.latestEnvelope()).toBeNull();

    service.registerIframe(mockIFrameElement);

    expect(service.latestEnvelope()).toEqual({
      type: PreviewBridgeMessageType.RENDERER_READY,
      payload: {status: 'early-element'},
      origin: 'http://localhost:3000',
      timestamp: expect.any(Number),
      sourceWindow: mockIframeWindow,
    });
  });

  it('caps early message buffering strictly at 20 messages via sliding ring eviction', () => {
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;

    for (let i = 0; i < 25; i++) {
      window.dispatchEvent(
        new MessageEvent('message', {
          source: mockIframeWindow,
          origin: 'http://localhost:3000',
          data: {type: PreviewBridgeMessageType.RENDERER_READY, payload: {index: i}},
        }),
      );
    }

    expect(service.latestEnvelope()).toBeNull();

    service.registerIframe(mockIframeWindow);

    const history = service.getHistoryBuffer();
    expect(history.length).toBe(20);
    expect(history[0].payload).toEqual({index: 5});
    expect(history[19].payload).toEqual({index: 24});
  });

  it('broadcasts uncoalesced multi-message stream replay via messageStream$', () => {
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
    service.registerIframe(mockIframeWindow);

    const emitted: MessageEnvelope[] = [];
    const sub = service.messageStream$.subscribe(envelope => {
      emitted.push(envelope);
    });

    for (let i = 0; i < 3; i++) {
      window.dispatchEvent(
        new MessageEvent('message', {
          source: mockIframeWindow,
          origin: 'http://localhost:3000',
          data: {type: PreviewBridgeMessageType.RENDERER_READY, payload: {batchId: i}},
        }),
      );
    }

    expect(emitted.length).toBe(3);
    expect(emitted[0].payload).toEqual({batchId: 0});
    expect(emitted[1].payload).toEqual({batchId: 1});
    expect(emitted[2].payload).toEqual({batchId: 2});

    sub.unsubscribe();
  });

  it('purges early message buffer when iframe is unregistered', () => {
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
    window.dispatchEvent(
      new MessageEvent('message', {
        source: mockIframeWindow,
        origin: 'http://localhost:3000',
        data: {type: PreviewBridgeMessageType.RENDERER_READY, payload: {status: 'buffered'}},
      }),
    );

    service.registerIframe(null);

    service.registerIframe(mockIframeWindow);

    expect(service.latestEnvelope()).toBeNull();
  });

  it('purges early message buffer when service is destroyed', () => {
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
    window.dispatchEvent(
      new MessageEvent('message', {
        source: mockIframeWindow,
        origin: 'http://localhost:3000',
        data: {type: PreviewBridgeMessageType.RENDERER_READY, payload: {status: 'buffered'}},
      }),
    );

    service.ngOnDestroy();

    service.registerIframe(mockIframeWindow);

    expect(service.latestEnvelope()).toBeNull();
  });

  it('instantly relays the most recent envelope to late subscribers via messageStream$', () => {
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
    service.registerIframe(mockIframeWindow);

    window.dispatchEvent(
      new MessageEvent('message', {
        source: mockIframeWindow,
        origin: 'http://localhost:3000',
        data: {type: PreviewBridgeMessageType.RENDERER_READY, payload: {index: 100}},
      }),
    );

    let lateEnvelope: MessageEnvelope | null = null;
    const sub = service.messageStream$.subscribe(envelope => {
      lateEnvelope = envelope;
    });

    expect(lateEnvelope).toBeDefined();
    expect(lateEnvelope!.payload).toEqual({index: 100});

    sub.unsubscribe();
  });

  it('cleans up global window event listeners and properties upon destruction', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    service.ngOnDestroy();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));
    expect(window.a2uiHostCommunication).toBeUndefined();

    removeEventListenerSpy.mockRestore();
  });

  it('caches the latest catalog envelope when receiving an A2UI_CATALOG message', () => {
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
    service.registerIframe(mockIframeWindow);

    const catalogPayload = {components: {}};
    const event = new MessageEvent('message', {
      source: mockIframeWindow,
      origin: 'http://localhost:3000',
      data: {
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        payload: catalogPayload,
      },
    });

    window.dispatchEvent(event);

    const latestCatalog = service.getLatestCatalog();
    expect(latestCatalog).toEqual({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      payload: catalogPayload,
      origin: 'http://localhost:3000',
      timestamp: expect.any(Number),
      sourceWindow: mockIframeWindow,
    });

    const history = service.getHistoryBuffer();
    expect(history.length).toBe(1);
    expect(history[0].type).toBe(PreviewBridgeMessageType.A2UI_CATALOG);
  });

  it('caps the message history buffer at 100 entries strictly using FIFO eviction', () => {
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
    service.registerIframe(mockIframeWindow);

    for (let i = 0; i < 105; i++) {
      window.dispatchEvent(
        new MessageEvent('message', {
          source: mockIframeWindow,
          origin: 'http://localhost:3000',
          data: {
            type: PreviewBridgeMessageType.RENDERER_READY,
            payload: {index: i},
          },
        }),
      );
    }

    const history = service.getHistoryBuffer();
    expect(history.length).toBe(100);
    expect(history[0].payload).toEqual({index: 5});
    expect(history[99].payload).toEqual({index: 104});
  });

  it('dispatches SET_THEME message via sendTheme', () => {
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
    service.registerIframe(mockIframeWindow);
    window.dispatchEvent(
      new MessageEvent('message', {
        source: mockIframeWindow,
        origin: 'http://localhost:3000',
        data: {type: PreviewBridgeMessageType.RENDERER_READY},
      }),
    );

    service.sendTheme(ThemePreference.DARK);

    expect(mockIframeWindow.postMessage).toHaveBeenCalledWith(
      {
        type: PreviewBridgeMessageType.SET_THEME,
        payload: {theme: ThemePreference.DARK},
      },
      'http://localhost:3000',
    );
  });

  it('automatically re-sends current themePreference when RENDERER_READY is received', () => {
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
    service.registerIframe(mockIframeWindow);
    themePreferenceSignal.set(ThemePreference.DARK);

    const event = new MessageEvent('message', {
      source: mockIframeWindow,
      origin: 'http://localhost:3000',
      data: {type: PreviewBridgeMessageType.RENDERER_READY},
    });

    window.dispatchEvent(event);

    expect(mockIframeWindow.postMessage).toHaveBeenCalledWith(
      {
        type: PreviewBridgeMessageType.SET_THEME,
        payload: {theme: ThemePreference.DARK},
      },
      'http://localhost:3000',
    );
  });

  it('suppresses automatic dispatch of current themePreference upon iframe registration', () => {
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
    themePreferenceSignal.set(ThemePreference.DARK);

    service.registerIframe(mockIframeWindow);

    expect(mockIframeWindow.postMessage).not.toHaveBeenCalled();
  });

  it('preserves early message buffer when registering an unattached iframe element with null contentWindow', () => {
    const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;

    window.dispatchEvent(
      new MessageEvent('message', {
        source: mockIframeWindow,
        origin: 'http://localhost:3000',
        data: {type: PreviewBridgeMessageType.RENDERER_READY, payload: {status: 'early'}},
      }),
    );

    const unattachedIframe = {contentWindow: null} as unknown as HTMLIFrameElement;
    service.registerIframe(unattachedIframe);

    expect(service.latestEnvelope()).toBeNull();

    service.registerIframe(mockIframeWindow);

    expect(service.latestEnvelope()).toEqual({
      type: PreviewBridgeMessageType.RENDERER_READY,
      payload: {status: 'early'},
      origin: 'http://localhost:3000',
      timestamp: expect.any(Number),
      sourceWindow: mockIframeWindow,
    });
  });

  describe('getIframeElement', () => {
    it('returns the registered iframe element or null when unregistered', () => {
      expect(service.getIframeElement()).toBeNull();

      const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
      const mockIFrameElement = {contentWindow: mockIframeWindow} as unknown as HTMLIFrameElement;

      service.registerIframe(mockIFrameElement);
      expect(service.getIframeElement()).toBe(mockIFrameElement);

      service.registerIframe(null);
      expect(service.getIframeElement()).toBeNull();
    });
  });

  describe('Renderer Readiness', () => {
    it('initializes renderer readiness signal to false', () => {
      expect(service.isRendererReady()).toBe(false);
    });

    it('resets renderer readiness to false when iframe target is re-registered or nulled', () => {
      // Simulate ready
      const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
      service.registerIframe(mockIframeWindow);
      window.dispatchEvent(
        new MessageEvent('message', {
          source: mockIframeWindow,
          origin: 'http://localhost:3000',
          data: {type: PreviewBridgeMessageType.RENDERER_READY},
        }),
      );
      expect(service.isRendererReady()).toBe(true);

      // Null it out
      service.registerIframe(null);
      expect(service.isRendererReady()).toBe(false);

      // Register again
      service.registerIframe(mockIframeWindow);
      expect(service.isRendererReady()).toBe(false);
    });

    it('transitions renderer readiness to true upon receiving RENDERER_READY message and triggers sendTheme', () => {
      const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
      service.registerIframe(mockIframeWindow);
      expect(service.isRendererReady()).toBe(false);

      window.dispatchEvent(
        new MessageEvent('message', {
          source: mockIframeWindow,
          origin: 'http://localhost:3000',
          data: {type: PreviewBridgeMessageType.RENDERER_READY},
        }),
      );

      expect(service.isRendererReady()).toBe(true);
      expect(mockIframeWindow.postMessage).toHaveBeenCalledWith(
        {
          type: PreviewBridgeMessageType.SET_THEME,
          payload: {theme: ThemePreference.LIGHT},
        },
        'http://localhost:3000',
      );
    });

    it('queues outbound messages when renderer is not ready', () => {
      const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
      service.registerIframe(mockIframeWindow);
      expect(service.isRendererReady()).toBe(false);

      service.sendMessage({type: PreviewBridgeMessageType.GET_CATALOG});
      expect(mockIframeWindow.postMessage).not.toHaveBeenCalled();

      // Checking that outboundMessageBuffer buffered the message.
      // We can assert via internal state if possible, but the best way is to send RENDERER_READY and check if it's flushed.
      // But wait, the flush spec will cover flushing. To prove queueing, we can check mock postMessage count before and after RENDERER_READY.
    });

    it('flushes queued outbound messages in order when RENDERER_READY is received', () => {
      const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
      service.registerIframe(mockIframeWindow);

      service.sendMessage({type: PreviewBridgeMessageType.GET_CATALOG});
      service.sendMessage({type: PreviewBridgeMessageType.CONSOLE_LOG});
      expect(mockIframeWindow.postMessage).not.toHaveBeenCalled();

      window.dispatchEvent(
        new MessageEvent('message', {
          source: mockIframeWindow,
          origin: 'http://localhost:3000',
          data: {type: PreviewBridgeMessageType.RENDERER_READY},
        }),
      );

      // It should have sent SET_THEME plus the 2 queued messages
      expect(mockIframeWindow.postMessage).toHaveBeenNthCalledWith(
        1,
        {
          type: PreviewBridgeMessageType.SET_THEME,
          payload: {theme: ThemePreference.LIGHT},
        },
        'http://localhost:3000',
      );
      expect(mockIframeWindow.postMessage).toHaveBeenNthCalledWith(
        2,
        {type: PreviewBridgeMessageType.GET_CATALOG},
        'http://localhost:3000',
      );
      expect(mockIframeWindow.postMessage).toHaveBeenNthCalledWith(
        3,
        {type: PreviewBridgeMessageType.CONSOLE_LOG},
        'http://localhost:3000',
      );
      expect(mockIframeWindow.postMessage).toHaveBeenCalledTimes(3);
    });

    it('clears the outbound buffer on registerTarget, unregisterTarget, and ngOnDestroy', () => {
      const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;

      // Seed buffer
      service.registerIframe(mockIframeWindow);
      service.sendMessage({type: PreviewBridgeMessageType.GET_CATALOG});
      expect(service['outboundMessageBuffer'].length).toBe(1);

      // Clears on unregisterTarget (registerIframe(null))
      service.registerIframe(null);
      expect(service['outboundMessageBuffer'].length).toBe(0);

      // Seed buffer again
      service.registerIframe(mockIframeWindow);
      service.sendMessage({type: PreviewBridgeMessageType.GET_CATALOG});
      expect(service['outboundMessageBuffer'].length).toBe(1);

      // Clears on registerTarget (registerIframe with target)
      service.registerIframe(mockIframeWindow);
      expect(service['outboundMessageBuffer'].length).toBe(0);

      // Seed buffer again
      service.sendMessage({type: PreviewBridgeMessageType.GET_CATALOG});
      expect(service['outboundMessageBuffer'].length).toBe(1);

      // Clears on ngOnDestroy
      service.ngOnDestroy();
      expect(service['outboundMessageBuffer'].length).toBe(0);
    });
    it('allows outbound messages in sendMessage when renderer is ready', () => {
      const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
      service.registerIframe(mockIframeWindow);

      window.dispatchEvent(
        new MessageEvent('message', {
          source: mockIframeWindow,
          origin: 'http://localhost:3000',
          data: {type: PreviewBridgeMessageType.RENDERER_READY},
        }),
      );

      expect(service.isRendererReady()).toBe(true);

      service.sendMessage({type: PreviewBridgeMessageType.GET_CATALOG});
      expect(mockIframeWindow.postMessage).toHaveBeenCalledWith(
        {type: PreviewBridgeMessageType.GET_CATALOG},
        'http://localhost:3000',
      );
    });

    it('resets renderer readiness to false upon destruction (ngOnDestroy)', () => {
      const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
      service.registerIframe(mockIframeWindow);
      window.dispatchEvent(
        new MessageEvent('message', {
          source: mockIframeWindow,
          origin: 'http://localhost:3000',
          data: {type: PreviewBridgeMessageType.RENDERER_READY},
        }),
      );
      expect(service.isRendererReady()).toBe(true);

      service.ngOnDestroy();
      expect(service.isRendererReady()).toBe(false);
    });

    it('preserves readiness on repeated RENDERER_READY messages', () => {
      const mockIframeWindow = {postMessage: vi.fn()} as unknown as Window;
      service.registerIframe(mockIframeWindow);

      const readyEvent = new MessageEvent('message', {
        source: mockIframeWindow,
        origin: 'http://localhost:3000',
        data: {type: PreviewBridgeMessageType.RENDERER_READY},
      });

      window.dispatchEvent(readyEvent);
      expect(service.isRendererReady()).toBe(true);
      expect(mockIframeWindow.postMessage).toHaveBeenCalledTimes(1);

      // Send another one
      window.dispatchEvent(readyEvent);
      expect(service.isRendererReady()).toBe(true);
      // It should send SET_THEME again on each RENDERER_READY per standard behavior
      expect(mockIframeWindow.postMessage).toHaveBeenCalledTimes(2);
    });
  });

  describe('multiple registered iframes', () => {
    it('accepts incoming messages from all concurrently registered iframes', () => {
      const canvasWindow = {postMessage: vi.fn()} as unknown as Window;
      const canvasIframe = {contentWindow: canvasWindow} as unknown as HTMLIFrameElement;

      const inlineWindow = {postMessage: vi.fn()} as unknown as Window;
      const inlineIframe = {contentWindow: inlineWindow} as unknown as HTMLIFrameElement;

      // Register canvas iframe first
      service.registerIframe(canvasIframe);

      // Register inline iframe subsequently (e.g. flight card rendered in chat)
      service.registerIframe(inlineIframe);

      // Verify message from the second (inline) iframe is accepted
      const inlineEvent = new MessageEvent('message', {
        source: inlineWindow,
        origin: 'http://localhost:3000',
        data: {type: PreviewBridgeMessageType.SEND_TO_SERVER, payload: {action: 'flight_clicked'}},
      });
      window.dispatchEvent(inlineEvent);
      expect(service.latestEnvelope()?.payload).toEqual({action: 'flight_clicked'});

      // Verify future message from the first (canvas) iframe is STILL accepted
      const canvasEvent = new MessageEvent('message', {
        source: canvasWindow,
        origin: 'http://localhost:3000',
        data: {type: PreviewBridgeMessageType.SEND_TO_SERVER, payload: {action: 'canvas_clicked'}},
      });
      window.dispatchEvent(canvasEvent);
      expect(service.latestEnvelope()?.payload).toEqual({action: 'canvas_clicked'});
    });

    it('unregisters an iframe correctly when unregisterIframe is called', () => {
      const canvasWindow = {postMessage: vi.fn()} as unknown as Window;
      const canvasIframe = {contentWindow: canvasWindow} as unknown as HTMLIFrameElement;

      service.registerIframe(canvasIframe);
      service.unregisterIframe(canvasIframe);

      const event = new MessageEvent('message', {
        source: canvasWindow,
        origin: 'http://localhost:3000',
        data: {type: PreviewBridgeMessageType.SEND_TO_SERVER, payload: {action: 'ignored'}},
      });
      window.dispatchEvent(event);
      expect(service.latestEnvelope()).toBeNull();
    });

    it('cross-falls back between registered iframes and registered windows on unregister', () => {
      const windowTarget = {postMessage: vi.fn()} as unknown as Window;
      const iframeWindow = {postMessage: vi.fn()} as unknown as Window;
      const iframeElement = {contentWindow: iframeWindow} as unknown as HTMLIFrameElement;

      service.registerIframe(iframeElement);
      service.registerIframe(windowTarget);

      service.unregisterIframe(windowTarget);

      window.dispatchEvent(
        new MessageEvent('message', {
          source: iframeWindow,
          origin: 'http://localhost:3000',
          data: {type: PreviewBridgeMessageType.RENDERER_READY},
        }),
      );
      vi.mocked(iframeWindow.postMessage).mockClear();

      service.sendTheme(ThemePreference.DARK);
      expect(iframeWindow.postMessage).toHaveBeenCalled();

      vi.mocked(iframeWindow.postMessage).mockClear();
      service.unregisterIframe(iframeElement);

      service.sendTheme(ThemePreference.LIGHT);
      expect(iframeWindow.postMessage).not.toHaveBeenCalled();
    });

    it('dispatches sendRenderA2UI to the explicitly provided target iframe instead of the default registered frame', () => {
      const defaultWindow = {postMessage: vi.fn()} as unknown as Window;
      const defaultIframe = {contentWindow: defaultWindow} as unknown as HTMLIFrameElement;
      service.registerIframe(defaultIframe);
      window.dispatchEvent(
        new MessageEvent('message', {
          source: defaultWindow,
          origin: 'http://localhost:3000',
          data: {type: PreviewBridgeMessageType.RENDERER_READY},
        }),
      );
      vi.mocked(defaultWindow.postMessage).mockClear();

      const specificWindow = {postMessage: vi.fn()} as unknown as Window;
      const specificIframe = {contentWindow: specificWindow} as unknown as HTMLIFrameElement;

      const payload = [{version: 'v0.9', createSurface: {surfaceId: 'test', catalogId: 'test'}}];
      service.sendRenderA2UI(payload, specificIframe);

      expect(specificWindow.postMessage).toHaveBeenCalledWith(
        {
          type: PreviewBridgeMessageType.RENDER_A2UI,
          payload,
        },
        'http://localhost:3000',
      );
      expect(defaultWindow.postMessage).not.toHaveBeenCalled();
    });
  });
});
