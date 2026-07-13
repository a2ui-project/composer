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
import {CrossFrameValidator} from '../cross-frame-validator/cross-frame-validator';
import {PreviewBridgeMessageType} from 'a2ui-bridge';

/**
 * Schema representing a structured postMessage payload used to communicate
 * event data and lifecycle checks between the host and preview frame.
 */
export interface MessageEnvelope {
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
  private iframeWindow: Window | null = null;
  private iframeElement: HTMLIFrameElement | null = null;
  private readonly latestEnvelopeSignal = signal<MessageEnvelope | null>(null);

  /** Readonly signal tracking the most recent message envelope */
  readonly latestEnvelope: Signal<MessageEnvelope | null> = this.latestEnvelopeSignal.asReadonly();

  private readonly messageStreamSubject = new ReplaySubject<MessageEnvelope>(1);
  /** Uncoalesced hot event stream broadcasting all incoming message envelopes */
  readonly messageStream$ = this.messageStreamSubject.asObservable();
  /** Readonly signal holding the latest incoming stream message */
  readonly messageStream = toSignal(this.messageStream$, {
    initialValue: null,
  });

  private readonly listeners = new Set<(envelope: MessageEnvelope) => void>();
  private readonly messageHistoryBuffer: MessageEnvelope[] = [];
  private readonly earlyMessageBuffer: MessageEvent[] = [];
  private latestCatalogEnvelope: MessageEnvelope | null = null;

  /**
   * Registers a callback listener to intercept incoming message envelopes.
   * @param listener Callback function invoked upon envelope arrival
   */
  addListener(listener: (envelope: MessageEnvelope) => void): void {
    this.listeners.add(listener);
  }

  /**
   * Removes a previously registered callback listener.
   * @param listener Callback function to remove
   */
  removeListener(listener: (envelope: MessageEnvelope) => void): void {
    this.listeners.delete(listener);
  }

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
      // NOTE: Bracket notation is used to access properties on the incoming postMessage event
      // to prevent compilers from renaming these property accesses during minification.
      const isBridgeMessage =
        event.data &&
        typeof event.data === 'object' &&
        Object.values(PreviewBridgeMessageType).includes(event.data['type']);
      if (!isBridgeMessage || event.data['type'] === PreviewBridgeMessageType.CONSOLE_LOG) {
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
    // NOTE: Bracket notation is used to access properties on the incoming postMessage event
    // to prevent compilers from renaming these property accesses during minification.
    if (data && typeof data === 'object' && data['type']) {
      const type = data['type'] as string;
      const envelope: MessageEnvelope = {
        type,
        payload: data['payload'],
        origin: event.origin,
        timestamp: Date.now(),
      };
      if (type === PreviewBridgeMessageType.A2UI_CATALOG) {
        this.latestCatalogEnvelope = envelope;
      }
      if (type !== PreviewBridgeMessageType.CONSOLE_LOG) {
        this.messageHistoryBuffer.push(envelope);
        if (this.messageHistoryBuffer.length > 100) {
          this.messageHistoryBuffer.shift();
        }
      }
      this.latestEnvelopeSignal.set(envelope);
      this.messageStreamSubject.next(envelope);
      this.listeners.forEach(l => {
        try {
          l(envelope);
        } catch (err) {
          console.error('Error in HostCommunication listener:', err);
        }
      });
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
   * Registers an active content window directly and flushes any buffered early messages.
   * @param contentWindow Target guest window reference
   */
  registerIframe(contentWindow: Window | null): void {
    this.iframeWindow = contentWindow;
    if (contentWindow === null) {
      this.earlyMessageBuffer.length = 0;
    } else {
      this.flushEarlyMessages();
    }
  }

  /**
   * Registers an iframe DOM element and flushes any buffered early messages.
   * @param element Target iframe DOM element reference
   */
  registerIframeElement(element: HTMLIFrameElement | null): void {
    this.iframeElement = element;
    if (element === null) {
      this.earlyMessageBuffer.length = 0;
    } else {
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
   * Helper utility dispatching a RENDER_A2UI layout array to the preview renderer.
   * @param payload Array of layout nodes or configuration objects
   */
  sendRenderA2UI(payload: unknown[]): void {
    // NOTE: Quoted keys prevent compiler minification renaming across frame boundaries.
    // prettier-ignore
    this.sendMessage({
      'type': PreviewBridgeMessageType.RENDER_A2UI,
      'payload': payload,
    });
  }

  /**
   * Triggers a self-screenshot capture within the guest preview iframe.
   * Dispatches a CAPTURE_SCREENSHOT message and returns a Promise resolving to
   * the base64 PNG data URL string once the guest frame responds.
   *
   * @returns A promise resolving to the base64 PNG data URL.
   */
  async captureScreenshot(): Promise<string> {
    if (!this.iframeElement) {
      throw new Error('No active iframe element found to capture screenshot.');
    }

    if (!navigator?.mediaDevices?.getDisplayMedia) {
      throw new Error('Screen capture API (getDisplayMedia) is not supported in this environment.');
    }

    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: {displaySurface: 'browser'},
        // @ts-expect-error - preferCurrentTab is a recent/experimental API not yet in TS types
        preferCurrentTab: true,
      });

      const [track] = stream.getVideoTracks();
      if (!track) {
        throw new Error('No video track found in media stream.');
      }

      // @ts-expect-error - RestrictionTarget is a recent API not yet in TS types
      if (typeof RestrictionTarget !== 'undefined') {
        // @ts-expect-error - RestrictionTarget is not in standard TypeScript definitions yet
        const target = await RestrictionTarget.fromElement(this.iframeElement);
        // @ts-expect-error - restrictTo is not in standard MediaStreamTrack types yet
        await track.restrictTo(target);
      } else {
        console.warn('RestrictionTarget API not supported, capturing full tab.');
      }

      const video = document.createElement('video');
      video.srcObject = stream;
      video.muted = true;

      await new Promise<void>(resolve => {
        video.onloadedmetadata = () => {
          video.play().catch(() => {});
          resolve();
        };
      });

      // Give the browser a tiny buffer to apply the restriction crop visually
      await new Promise(resolve => setTimeout(resolve, 150));

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
      }

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.warn('Capture canceled or failed:', error);
      throw error;
    } finally {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }

  ngOnDestroy(): void {
    this.earlyMessageBuffer.length = 0;
    if (typeof window !== 'undefined') {
      window.removeEventListener('message', this.messageListener);
      delete window.a2uiHostCommunication;
    }
  }
}
