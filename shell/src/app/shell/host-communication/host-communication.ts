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

import {Injectable, inject, signal, Signal, OnDestroy} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {ReplaySubject} from 'rxjs';
import {StartupResolution} from '../startup-resolution/startup-resolution';
import {
  AppConfigProvider,
  ThemePreference,
} from '../../settings/app-config-provider/app-config-provider';
import {CrossFrameValidator} from '../cross-frame-validator/cross-frame-validator';
import {PreviewBridgeMessageType} from 'a2ui-bridge';

/**
 * Schema representing a structured postMessage payload used to communicate
 * event data and lifecycle checks between the host and preview frame.
 */
export declare interface MessageEnvelope {
  /** Discriminator action type identifying the specific message intent */
  type: string;
  /** Optional payload attached to the message transaction */
  payload?: unknown;
  /** Fully resolved origin URI string of the dispatching sender */
  origin: string;
  /** Epoch millisecond timestamp recording when the message was received */
  timestamp: number;
}

declare global {
  interface Window {
    a2uiHostCommunication?: HostCommunication;
  }
}

/**
 * Core service managing cross-frame message passing and event dispatching
 * between the primary workspace shell and rendering client frames.
 */
@Injectable({
  providedIn: 'root',
})
export class HostCommunication implements OnDestroy {
  private readonly startupResolution = inject(StartupResolution);
  private readonly configProvider = inject(AppConfigProvider);
  private iframeWindow: Window | null = null;
  private iframeElement: HTMLIFrameElement | null = null;
  private readonly latestEnvelopeSignal = signal<MessageEnvelope | null>(null);
  private readonly isRendererReadySignal = signal<boolean>(false);

  /** Readonly signal tracking the most recent message envelope */
  readonly latestEnvelope: Signal<MessageEnvelope | null> = this.latestEnvelopeSignal.asReadonly();

  /** Readonly signal tracking if the guest renderer is ready */
  readonly isRendererReady = this.isRendererReadySignal.asReadonly();

  private readonly messageStreamSubject = new ReplaySubject<MessageEnvelope>(1);
  /** Uncoalesced hot event stream broadcasting all incoming message envelopes */
  readonly messageStream$ = this.messageStreamSubject.asObservable();
  /** Readonly signal holding the latest incoming stream message */
  readonly messageStream = toSignal(this.messageStream$, {
    initialValue: null,
  });

  private readonly messageHistoryBuffer: MessageEnvelope[] = [];
  private readonly earlyMessageBuffer: MessageEvent[] = [];
  private readonly outboundMessageBuffer: Array<{
    type: PreviewBridgeMessageType;
    payload?: unknown;
  }> = [];
  private latestCatalogEnvelope: MessageEnvelope | null = null;

  /**
   * Retrieves a snapshot copy of the recent message history buffer.
   * @returns Array of stored message envelopes
   */
  getHistoryBuffer(): MessageEnvelope[] {
    return [...this.messageHistoryBuffer];
  }

  /**
   * Retrieves the most recent catalog message envelope received from the preview frame.
   * @returns Latest catalog envelope or null if none received
   */
  getLatestCatalog(): MessageEnvelope | null {
    return this.latestCatalogEnvelope;
  }

  /**
   * Clears the historical message buffer and resets the tracked catalog state.
   */
  clearHistoryBuffer(): void {
    this.messageHistoryBuffer.length = 0;
    this.latestCatalogEnvelope = null;
  }

  /**
   * Triggers a message stream envelope update. Primarily exposed for testing specifications
   * to safely simulate incoming guest frame postMessages without unsafe casting bypasses.
   */
  private triggerMessageStreamForTesting(envelope: MessageEnvelope): void {
    this.messageStreamSubject.next(envelope);
  }

  /** Test-only hooks to simulate incoming stream messages */
  readonly TEST_ONLY = {
    triggerMessageStreamForTesting: (envelope: MessageEnvelope) =>
      this.triggerMessageStreamForTesting(envelope),
  };

  private readonly messageListener = (event: MessageEvent) => {
    const activeWindow = this.iframeElement ? this.iframeElement.contentWindow : this.iframeWindow;
    if (!activeWindow) {
      const isBridgeMessage =
        event.data &&
        typeof event.data === 'object' &&
        Object.values(PreviewBridgeMessageType).includes(event.data.type);
      if (!isBridgeMessage || event.data.type === PreviewBridgeMessageType.CONSOLE_LOG) {
        return;
      }
      this.earlyMessageBuffer.push(event);
      if (this.earlyMessageBuffer.length > 20) {
        this.earlyMessageBuffer.shift();
      }
      return;
    }
    if (event.source !== activeWindow) {
      return;
    }

    const expectedUrl = this.startupResolution.getResolvedRendererUrl();
    if (!expectedUrl) {
      return;
    }

    try {
      const expectedOrigin = new URL(expectedUrl, globalThis.location?.href).origin;
      if (event.origin !== expectedOrigin) {
        return;
      }
    } catch (err) {
      return;
    }

    const data = event.data;
    if (data && typeof data === 'object' && data.type) {
      const type = data.type as string;
      const envelope: MessageEnvelope = {
        type,
        payload: data.payload,
        origin: event.origin,
        timestamp: Date.now(),
      };
      if (type === PreviewBridgeMessageType.A2UI_CATALOG) {
        this.latestCatalogEnvelope = envelope;
      }
      if (type === PreviewBridgeMessageType.RENDERER_READY) {
        this.isRendererReadySignal.set(true);
        this.sendTheme(this.configProvider.themePreference());
        const pending = [...this.outboundMessageBuffer];
        this.outboundMessageBuffer.length = 0;
        for (const msg of pending) {
          this.sendMessage(msg);
        }
      }
      if (type !== PreviewBridgeMessageType.CONSOLE_LOG) {
        this.messageHistoryBuffer.push(envelope);
        if (this.messageHistoryBuffer.length > 100) {
          this.messageHistoryBuffer.shift();
        }
      }
      this.latestEnvelopeSignal.set(envelope);
      this.messageStreamSubject.next(envelope);
    }
  };

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', this.messageListener);
      window.a2uiHostCommunication = this;
    }
  }

  private flushEarlyMessages(): void {
    const activeWindow = this.iframeElement ? this.iframeElement.contentWindow : this.iframeWindow;
    if (activeWindow && this.earlyMessageBuffer.length > 0) {
      const messages = [...this.earlyMessageBuffer];
      this.earlyMessageBuffer.length = 0;
      for (const msg of messages) {
        this.messageListener(msg);
      }
    }
  }

  /**
   * Registers an active iframe DOM element or content window target and flushes
   * any buffered early messages.
   * @param target Target iframe element, window reference, or null to unregister
   */
  registerIframe(target: HTMLIFrameElement | Window | null): void {
    this.outboundMessageBuffer.length = 0;
    if (!target) {
      this.iframeElement = null;
      this.iframeWindow = null;
      this.earlyMessageBuffer.length = 0;
      this.isRendererReadySignal.set(false);
      return;
    }

    let windowTarget: Window | null = null;
    if ('contentWindow' in target) {
      this.iframeElement = target as HTMLIFrameElement;
      windowTarget = target.contentWindow;
    } else {
      this.iframeElement = null;
      windowTarget = target as Window;
    }

    this.iframeWindow = windowTarget;
    this.isRendererReadySignal.set(false);
    if (windowTarget) {
      this.flushEarlyMessages();
    }
  }

  /**
   * Validates and dispatches a structured postMessage payload to the registered guest frame.
   * @param message Structured message payload
   */
  sendMessage(message: {type: PreviewBridgeMessageType; payload?: unknown}): void {
    if (!CrossFrameValidator.validateOutgoingMessage(message)) {
      console.error('Blocked dispatch of malformed message type...', message);
      return;
    }

    if (!this.isRendererReady()) {
      console.debug('Queueing outbound message; renderer is not yet ready.', message);
      this.outboundMessageBuffer.push(message);
      return;
    }

    const targetWindow = this.iframeElement ? this.iframeElement.contentWindow : this.iframeWindow;
    if (!targetWindow) return;

    const expectedUrl = this.startupResolution.getResolvedRendererUrl();
    if (!expectedUrl) return;

    try {
      const targetOrigin = new URL(expectedUrl, globalThis.location?.href).origin;
      targetWindow.postMessage(message, targetOrigin);
    } catch (err) {
      // Ignore malformed URL
    }
  }

  /**
   * Helper utility dispatching a SET_THEME message to the preview renderer.
   * @param theme Target theme option
   */
  sendTheme(theme: ThemePreference): void {
    this.sendMessage({
      type: PreviewBridgeMessageType.SET_THEME,
      payload: {
        theme: theme,
      },
    });
  }

  /**
   * Helper utility dispatching a RENDER_A2UI layout array to the preview renderer.
   * @param payload Array of layout nodes or configuration objects
   */
  sendRenderA2UI(payload: unknown[]): void {
    this.sendMessage({
      type: PreviewBridgeMessageType.RENDER_A2UI,
      payload: payload,
    });
  }

  /**
   * Retrieves the currently registered iframe element, if any.
   * @returns HTMLIFrameElement or null
   */
  getIframeElement(): HTMLIFrameElement | null {
    return this.iframeElement;
  }

  ngOnDestroy(): void {
    this.outboundMessageBuffer.length = 0;
    this.isRendererReadySignal.set(false);
    this.earlyMessageBuffer.length = 0;
    this.messageStreamSubject.complete();
    if (typeof window !== 'undefined') {
      window.removeEventListener('message', this.messageListener);
      delete window.a2uiHostCommunication;
    }
  }
}
