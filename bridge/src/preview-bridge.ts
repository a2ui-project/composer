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

declare const process: {env?: {NODE_ENV?: string}} | undefined;
import './instrumentation-overrides';

export interface BridgeMessage {
  type: string;
  payload?: unknown;
  [key: string]: unknown;
}

export type MessageHandler = (payload: unknown) => void;

/**
 * Inter-frame communication bridge establishing connection pathways
 * between the catalog container and the rendering shell host.
 */
export class PreviewBridge {
  private processors = new Map<string, Set<MessageHandler>>();
  private isListening = false;
  private overlayElement: HTMLDivElement | null = null;

  constructor() {
    this.initMessageListener();
    this.initLifecycleHandshake();
    this.initCatalogHandler();
  }

  public registerMessageProcessor(type: string, handler: MessageHandler): void {
    if (!this.processors.has(type)) {
      this.processors.set(type, new Set<MessageHandler>());
    }
    this.processors.get(type)!.add(handler);
  }

  public unregisterMessageProcessor(type: string, handler: MessageHandler): void {
    const handlers = this.processors.get(type);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.processors.delete(type);
      }
    }
  }

  public sendMessage(message: BridgeMessage): void {
    if (
      typeof window !== 'undefined' &&
      window.parent &&
      (window.parent !== window ||
        (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test'))
    ) {
      window.parent.postMessage(message, '*');
    }
  }

  private initMessageListener(): void {
    if (this.isListening || typeof window === 'undefined') return;

    window.addEventListener('message', (event: MessageEvent) => {
      if (event.source !== window.parent && event.source !== window) return;

      if (
        event.origin &&
        globalThis.location &&
        globalThis.location.origin !== 'null' &&
        event.origin !== globalThis.location.origin
      ) {
        return;
      }

      const data = event.data as BridgeMessage;
      if (!data || typeof data !== 'object' || !data.type) return;

      if (data.type === 'SET_BLOCKING_STATE') {
        const payloadObj = data.payload as {blocked?: boolean; message?: string} | undefined;
        const blocked = !!(payloadObj && payloadObj.blocked);
        const messageStr = payloadObj && payloadObj.message;
        this.handleBlockingOverlay(blocked, messageStr);
      }

      const handlers = this.processors.get(data.type);
      if (handlers) {
        const payload = data.payload !== undefined ? data.payload : data;
        Array.from(handlers).forEach(handler => {
          try {
            handler(payload);
          } catch (err) {
            console.error(`Error executing message processor for type ${data.type}:`, err);
          }
        });
      }
    });

    this.isListening = true;
  }

  private handleBlockingOverlay(blocked: boolean, customMessage?: string): void {
    if (typeof document === 'undefined' || !document.body) return;

    if (blocked) {
      if (!this.overlayElement || !this.overlayElement.isConnected) {
        this.overlayElement = document.createElement('div');
        this.overlayElement.id = 'a2ui-blocking-overlay';
        Object.assign(this.overlayElement.style, {
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: '999999',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          backdropFilter: 'blur(4px)',
        });

        const messageNode = document.createElement('p');
        messageNode.id = 'a2ui-blocking-message';
        messageNode.innerText = customMessage || 'Processing framework layouts...';
        this.overlayElement.appendChild(messageNode);

        const button = document.createElement('button');
        button.innerText = 'Force Unblock';
        Object.assign(button.style, {
          marginTop: '16px',
          padding: '10px 20px',
          fontSize: '15px',
          fontWeight: 'bold',
          cursor: 'pointer',
          backgroundColor: '#f44336',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        });

        button.addEventListener('click', () => {
          this.sendMessage({type: 'FORCE_UNBLOCK', payload: {}});
          this.handleBlockingOverlay(false);
        });

        this.overlayElement.appendChild(button);
        document.body.appendChild(this.overlayElement);
      } else {
        const msgElement = this.overlayElement.querySelector('#a2ui-blocking-message');
        if (msgElement) {
          (msgElement as HTMLElement).innerText =
            customMessage || 'Processing framework layouts...';
        }
      }
    } else {
      if (this.overlayElement) {
        if (this.overlayElement.parentNode) {
          this.overlayElement.parentNode.removeChild(this.overlayElement);
        }
        this.overlayElement = null;
      }
    }
  }

  private initLifecycleHandshake(): void {
    const emitReady = () => {
      this.sendMessage({type: 'RENDERER_READY'});
    };

    if (typeof document !== 'undefined') {
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(emitReady, 0);
      } else {
        window.addEventListener('DOMContentLoaded', emitReady);
      }
    }
  }

  private initCatalogHandler(): void {
    this.registerMessageProcessor('GET_CATALOG', async () => {
      if (typeof window === 'undefined' || !window.fetch) return;
      try {
        const res = await window.fetch('/catalog');
        if (!res.ok) {
          throw new Error(`Catalog fetch failed with status: ${res.status}`);
        }
        const catalog = await res.json();
        this.sendMessage({
          type: 'A2UI_CATALOG',
          payload: {catalog},
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.sendMessage({
          type: 'A2UI_CATALOG',
          payload: {catalog: {}, error: {message: errorMessage}},
        });
      }
    });
  }
}

declare global {
  interface Window {
    a2uiBridge: PreviewBridge;
  }
}

const bridgeInstance = new PreviewBridge();
if (typeof window !== 'undefined') {
  window.a2uiBridge = bridgeInstance;
}

export const a2uiBridge = bridgeInstance;
