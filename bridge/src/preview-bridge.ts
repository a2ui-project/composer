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

declare const process: any;

export interface BridgeMessage {
  type: string;
  payload?: any;
  [key: string]: any;
}

export type MessageHandler = (payload: any) => void;

/**
 * Inter-frame communication bridge establishing connection pathways
 * between the catalog container and the rendering shell host.
 */
export class PreviewBridge {
  private processors = new Map<string, Set<MessageHandler>>();
  private isListening = false;

  constructor() {
    this.initMessageListener();
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
