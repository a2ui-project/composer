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

function deepCloneSafe(obj: unknown, ancestors = new Set<unknown>()): unknown {
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

    try {
      if (Array.isArray(obj)) {
        return obj.map(item => deepCloneSafe(item, ancestors));
      }

      const res: Record<string, unknown> = {};
      const record = obj as Record<string, unknown>;
      for (const key of Object.keys(record)) {
        try {
          res[key] = deepCloneSafe(record[key], ancestors);
        } catch {
          res[key] = '[Unserializable Property]';
        }
      }
      return res;
    } finally {
      ancestors.delete(obj);
    }
  }

  return obj;
}

function safeSerialize(args: unknown[]): unknown[] {
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
    console[method] = (...args: unknown[]) => {
      original.apply(console, args);

      if (isSerializing) return;

      try {
        isSerializing = true;
        if (a2uiBridge && typeof a2uiBridge.sendMessage === 'function') {
          const message = args
            .map(arg => {
              if (arg instanceof Error) return arg.message;
              if (typeof arg === 'string') return arg;
              const cloned = deepCloneSafe(arg);
              return typeof cloned === 'string' ? cloned : JSON.stringify(cloned);
            })
            .join(' ');

          const errorArg = args.find(arg => arg instanceof Error);
          const stack = errorArg ? (errorArg as Error).stack : undefined;

          a2uiBridge.sendMessage({
            type: 'CONSOLE_LOG',
            payload: {
              level: method,
              message,
              stack,
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
          type: 'CONSOLE_LOG',
          payload: {
            level: 'error',
            message: String(message),
            stack: error ? error.stack : `${source || ''}:${lineno || 0}:${colno || 0}`,
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
        const message = event.reason instanceof Error ? event.reason.message : String(event.reason);
        const stack = event.reason instanceof Error ? event.reason.stack : undefined;

        a2uiBridge.sendMessage({
          type: 'CONSOLE_LOG',
          payload: {
            level: 'error',
            message: `Unhandled Rejection: ${message}`,
            stack,
          },
        });
      }
    } catch (err) {
      originalConsoleError.call(console, 'A2UI Bridge Telemetry Error (Unhandled Rejection):', err);
    }
  });
}
setupInstrumentationOverrides();
