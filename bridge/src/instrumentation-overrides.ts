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

import {a2uiBridge} from './preview-bridge';

function deepCloneSafe(obj: any, ancestors = new Set<any>()): any {
  if (obj instanceof Error) {
    return {message: obj.message, stack: obj.stack};
  }
  if (typeof obj === 'function') return '[Function Callback]';
  if (typeof obj === 'symbol') return obj.toString();
  if (typeof obj === 'bigint') return `${obj.toString()}n`;
  if (typeof Node !== 'undefined' && obj instanceof Node) return `[DOM Node: ${obj.nodeName}]`;
  if (typeof window !== 'undefined' && obj === window) return '[Window Scope]';

  if (typeof obj === 'object' && obj !== null) {
    if (ancestors.has(obj)) {
      return '[Circular Reference]';
    }
    ancestors.add(obj);

    if (Array.isArray(obj)) {
      const res = obj.map(item => deepCloneSafe(item, ancestors));
      ancestors.delete(obj);
      return res;
    }

    const res: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      try {
        res[key] = deepCloneSafe(obj[key], ancestors);
      } catch {
        res[key] = '[Unserializable Property]';
      }
    }
    ancestors.delete(obj);
    return res;
  }

  return obj;
}

function safeSerialize(args: any[]): any[] {
  return args.map(arg => deepCloneSafe(arg));
}

/**
 * Injects hooks into global console functions and runtime error handlers
 * to intercept and marshal diagnostic telemetry logs back to the host.
 */
export function setupInstrumentationOverrides(): void {
  if (typeof window === 'undefined') return;

  const originalConsoleError = console.error;
  let isSerializing = false;

  const methods: Array<'log' | 'warn' | 'error' | 'info' | 'debug'> = [
    'log',
    'warn',
    'error',
    'info',
    'debug',
  ];

  methods.forEach(method => {
    const original = console[method];
    console[method] = (...args: any[]) => {
      original.apply(console, args);

      if (isSerializing) return;

      try {
        isSerializing = true;
        if (a2uiBridge && typeof a2uiBridge.sendMessage === 'function') {
          a2uiBridge.sendMessage({
            type: 'CONSOLE_LOG',
            payload: {
              level: method,
              arguments: safeSerialize(args),
            },
          });
        }
      } catch (err) {
        originalConsoleError.call(console, 'A2UI Bridge Telemetry Error (Console):', err);
      } finally {
        isSerializing = false;
      }
    };
  });

  const originalOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    try {
      if (a2uiBridge && typeof a2uiBridge.sendMessage === 'function') {
        a2uiBridge.sendMessage({
          type: 'WINDOW_ERROR',
          payload: {
            message: String(message),
            source: source || '',
            lineno: lineno || 0,
            colno: colno || 0,
            error: error ? {message: error.message, stack: error.stack} : null,
          },
        });
      }
    } catch (err) {
      originalConsoleError.call(console, 'A2UI Bridge Telemetry Error (Window Error):', err);
    }

    if (originalOnError) {
      return originalOnError(message, source, lineno, colno, error);
    }
    return false;
  };

  window.addEventListener('unhandledrejection', event => {
    try {
      if (a2uiBridge && typeof a2uiBridge.sendMessage === 'function') {
        const reasonPayload =
          event.reason instanceof Error
            ? {message: event.reason.message, stack: event.reason.stack}
            : safeSerialize([event.reason])[0];

        a2uiBridge.sendMessage({
          type: 'UNHANDLED_REJECTION',
          payload: {
            reason: reasonPayload,
          },
        });
      }
    } catch (err) {
      originalConsoleError.call(console, 'A2UI Bridge Telemetry Error (Unhandled Rejection):', err);
    }
  });
}

setupInstrumentationOverrides();
