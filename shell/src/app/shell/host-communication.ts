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
import {StartupResolutionService} from './startup-resolution';
import {CrossFrameValidator} from './cross-frame-validator';
import {PreviewBridgeMessageType} from 'a2ui-bridge';

/**
 * Schema representing a structured postMessage payload used to communicate
 * event data and lifecycle checks between the host and preview frame.
 */
export interface MessageEnvelope {
  type: string;
  payload?: unknown;
  origin: string;
  timestamp: number;
}

declare global {
  interface Window {
    a2uiHostCommunicationService?: HostCommunicationService;
  }
}

@Injectable({
  providedIn: 'root',
})
/**
 * Core service managing cross-frame message passing and event dispatching
 * between the primary workspace shell and rendering client frames.
 */
export class HostCommunicationService implements OnDestroy {
  private readonly startupResolutionService = inject(StartupResolutionService);
  private iframeWindow: Window | null = null;
  private iframeElement: HTMLIFrameElement | null = null;
  private readonly latestEnvelopeSignal = signal<MessageEnvelope | null>(null);

  public readonly latestEnvelope: Signal<MessageEnvelope | null> =
    this.latestEnvelopeSignal.asReadonly();

  private readonly messageStreamSignal = signal<MessageEnvelope | null>(null);
  public readonly messageStream = this.messageStreamSignal.asReadonly();

  private readonly listeners = new Set<(envelope: MessageEnvelope) => void>();
  private readonly messageHistoryBuffer: MessageEnvelope[] = [];
  private latestCatalogEnvelope: MessageEnvelope | null = null;

  public addListener(listener: (envelope: MessageEnvelope) => void): void {
    this.listeners.add(listener);
  }

  public removeListener(listener: (envelope: MessageEnvelope) => void): void {
    this.listeners.delete(listener);
  }

  public getHistoryBuffer(): MessageEnvelope[] {
    return [...this.messageHistoryBuffer];
  }

  public getLatestCatalog(): MessageEnvelope | null {
    return this.latestCatalogEnvelope;
  }

  public clearHistoryBuffer(): void {
    this.messageHistoryBuffer.length = 0;
    this.latestCatalogEnvelope = null;
  }

  /**
   * Triggers a message stream envelope update. Primarily exposed for testing specifications
   * to safely simulate incoming guest frame postMessages without unsafe casting bypasses.
   */
  private triggerMessageStreamForTesting(envelope: MessageEnvelope): void {
    this.messageStreamSignal.set(envelope);
  }

  public readonly TEST_ONLY = {
    triggerMessageStreamForTesting: (envelope: MessageEnvelope) =>
      this.triggerMessageStreamForTesting(envelope),
  };

  private readonly messageListener = (event: MessageEvent) => {
    const activeWindow = this.iframeElement ? this.iframeElement.contentWindow : this.iframeWindow;
    if (!activeWindow || event.source !== activeWindow) {
      return;
    }

    const expectedUrl = this.startupResolutionService.getResolvedRendererUrl();
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
      const type = data.type;
      const envelope: MessageEnvelope = {
        type,
        payload: data.payload,
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
      this.messageStreamSignal.set(envelope);
      this.listeners.forEach(l => {
        try {
          l(envelope);
        } catch (err) {
          console.error('Error in HostCommunicationService listener:', err);
        }
      });
    }
  };

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', this.messageListener);
      window.a2uiHostCommunicationService = this;
    }
  }

  public registerIframe(contentWindow: Window | null): void {
    this.iframeWindow = contentWindow;
  }

  public registerIframeElement(element: HTMLIFrameElement | null): void {
    this.iframeElement = element;
  }

  public sendMessage(message: {type: PreviewBridgeMessageType; payload?: unknown}): void {
    if (!CrossFrameValidator.validateOutgoingMessage(message)) {
      console.error('Blocked dispatch of malformed message type...', message);
      return;
    }

    const targetWindow = this.iframeElement ? this.iframeElement.contentWindow : this.iframeWindow;
    if (!targetWindow) return;

    const expectedUrl = this.startupResolutionService.getResolvedRendererUrl();
    if (!expectedUrl) return;

    try {
      const targetOrigin = new URL(expectedUrl, globalThis.location?.href).origin;
      targetWindow.postMessage(message, targetOrigin);
    } catch (err) {
      // Ignore malformed URL
    }
  }

  public sendRenderA2UI(payload: unknown[]): void {
    this.sendMessage({type: PreviewBridgeMessageType.RENDER_A2UI, payload});
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('message', this.messageListener);
      delete window.a2uiHostCommunicationService;
    }
  }
}
