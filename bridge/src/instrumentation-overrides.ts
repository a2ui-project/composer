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

import {PreviewBridgeMessageType, BridgeMessage} from './bridge-message';

export interface TelemetrySender {
  sendMessage(msg: BridgeMessage): void;
}

let isInstrumented: boolean;
const methods: Array<'log' | 'warn' | 'error' | 'info' | 'debug'> = [
  'log',
  'warn',
  'error',
  'info',
  'debug',
];
let originalConsoleMethods: Partial<
  Record<'log' | 'warn' | 'error' | 'info' | 'debug', (...args: unknown[]) => void>
>;
let originalOnError: OnErrorEventHandler;
let rejectionHandler: ((event: PromiseRejectionEvent) => void) | null;

/**
 * Safely and deeply clones a value or object, resolving potential serialization
 * issues such as circular references, DOM nodes, functions, symbols, BigInts,
 * and error objects to ensure it can be converted to JSON without throwing exceptions.
 *
 * - Circular references are replaced with `"[Circular Reference]"`.
 * - Functions are replaced with `"[Function Callback]"`.
 * - Symbols are converted to their string representations (e.g., `"Symbol(foo)"`).
 * - BigInts are converted to their string representation postfixed with "n" (e.g., `"42n"`).
 * - DOM Nodes are replaced with `"[DOM Node: <nodeName>]"`.
 * - Window objects are replaced with `"[Window Scope]"`.
 * - Errors are mapped to an object containing their `message` and `stack`.
 * - Unserializable properties are caught and replaced with `"[Unserializable Property]"`.
 *
 * @param obj The value or object to safely clone.
 * @param ancestors A set of ancestor object references used to track and prevent circular references during recursion.
 * @returns A safe, deep-cloned representation of the input value.
 */
function deepCloneSafe(obj: unknown, ancestors: Set<unknown> = new Set<unknown>()): unknown {
  if (obj instanceof Error) {
    return {message: obj.message, stack: obj.stack};
  }
  if (obj === undefined) return 'undefined';
  if (obj instanceof Date) return obj.toISOString();
  if (obj instanceof RegExp) return obj.toString();
  if (obj instanceof Map) {
    return Array.from(obj.entries()).map(([k, v]) => [
      deepCloneSafe(k, ancestors),
      deepCloneSafe(v, ancestors),
    ]);
  }
  if (obj instanceof Set) {
    return Array.from(obj.values()).map(v => deepCloneSafe(v, ancestors));
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

/**
 * Injects telemetry hooks and overrides into global console functions and window-level
 * error events within a browser environment.
 *
 * Specifically, this function:
 * 1. Intercepts global logging methods (`console.log`, `console.warn`, `console.error`,
 *    `console.info`, and `console.debug`), forwarding the logged content as a `CONSOLE_LOG`
 *    telemetry message over the `a2uiBridge` after passing them to the original implementation.
 * 2. Installs a custom `window.onerror` handler to capture and forward unhandled synchronous
 *    runtime errors.
 * 3. Installs a window-level listener for `'unhandledrejection'` events to capture and forward
 *    unhandled asynchronous promise rejections.
 *
 * The overrides are safe and include recursion protection (preventing infinite loops
 * during serialization failures or when logging from within the interceptor itself).
 * If run outside a browser context (e.g. Server-Side Rendering), the function immediately returns.
 */
interface InstrumentedConsoleMethod {
  (...args: unknown[]): void;
  __a2uiOriginal?: (...args: unknown[]) => void;
}

/**
 * Safely invokes the pristine `console.error` (if preserved) or native `console.error`
 * to report telemetry execution failures without causing recursive loops.
 */
function logTelemetryError(label: string, err: unknown): void {
  const originalError = (originalConsoleMethods && originalConsoleMethods.error) || console.error;
  originalError.call(console, label, err);
}

function overrideConsoleMethods(sender: TelemetrySender): void {
  if (!originalConsoleMethods) {
    originalConsoleMethods = {};
  }

  let isSerializing = false;

  methods.forEach(method => {
    const current = console[method] as InstrumentedConsoleMethod;
    if (current && current.__a2uiOriginal) {
      // Already instrumented, skip re-wrapping to prevent nested closures and leaks
      return;
    }
    const original = current;
    originalConsoleMethods[method] = original;
    const wrapper = (...args: unknown[]) => {
      original.apply(console, args);

      if (isSerializing) return;

      try {
        isSerializing = true;
        const message = args
          .map(arg => {
            if (arg === undefined) return 'undefined';
            if (arg instanceof Error) return arg.message;
            if (typeof arg === 'string') return arg;
            const cloned = deepCloneSafe(arg);
            return typeof cloned === 'string' ? cloned : JSON.stringify(cloned);
          })
          .join(' ');

        const errorArg = args.find(arg => arg instanceof Error);
        const stack = errorArg ? (errorArg as Error).stack : undefined;

        // NOTE: Quoted keys prevent compiler minification renaming across frame boundaries.
        // prettier-ignore
        sender.sendMessage({
          'type': PreviewBridgeMessageType.CONSOLE_LOG,
          'payload': {
            'level': method,
            'message': message,
            'stack': stack,
          },
        });
      } catch (err) {
        logTelemetryError('A2UI Bridge Telemetry Error (Console):', err);
      } finally {
        isSerializing = false;
      }
    };
    (wrapper as InstrumentedConsoleMethod).__a2uiOriginal = original;
    console[method] = wrapper;
  });
}

function overrideWindowError(sender: TelemetrySender): void {
  originalOnError = window.onerror;

  window.onerror = (
    message: string | Event,
    source: string | undefined,
    lineno: number | undefined,
    colno: number | undefined,
    error: Error | undefined,
  ): boolean => {
    try {
      // NOTE: Quoted keys prevent compiler minification renaming across frame boundaries.
      // prettier-ignore
      sender.sendMessage({
        'type': PreviewBridgeMessageType.CONSOLE_LOG,
        'payload': {
          'level': 'error',
          'message': String(message),
          'stack': error ? error.stack : `${source || ''}:${lineno || 0}:${colno || 0}`,
        },
      });
    } catch (err) {
      logTelemetryError('A2UI Bridge Telemetry Error (Window Error):', err);
    }

    if (originalOnError) {
      // Delegates back to the original handler to ensure native browser error
      // reporting or existing tooling continues to function
      return originalOnError(message, source, lineno, colno, error);
    }
    return false;
  };
}

function overrideUnhandledRejection(sender: TelemetrySender): void {
  rejectionHandler = event => {
    try {
      // Extracts the rejection reason from the event, determining whether it
      // is a standard `Error` object (retaining its message and stack trace)
      // or a generic type (coerced to a string).
      // The details are sent to the host as an error-level `CONSOLE_LOG`
      // telemetry message over the `a2uiBridge`.
      const message = event.reason instanceof Error ? event.reason.message : String(event.reason);
      const stack = event.reason instanceof Error ? event.reason.stack : undefined;

      // NOTE: Quoted keys prevent compiler minification renaming across frame boundaries.
      // prettier-ignore
      sender.sendMessage({
        'type': PreviewBridgeMessageType.CONSOLE_LOG,
        'payload': {
          'level': 'error',
          'message': `Unhandled Rejection: ${message}`,
          'stack': stack,
        },
      });
    } catch (err) {
      logTelemetryError('A2UI Bridge Telemetry Error (Unhandled Rejection):', err);
    }
  };

  window.addEventListener('unhandledrejection', rejectionHandler);
}

export function setupInstrumentationOverrides(sender: TelemetrySender): void {
  if (isInstrumented || typeof window === 'undefined') return;
  isInstrumented = true;

  overrideConsoleMethods(sender);
  overrideWindowError(sender);
  overrideUnhandledRejection(sender);
}

/**
 * Unrolls console overrides, restores window.onerror, and removes event listeners
 * to cleanly teardown telemetry instrumentation.
 */
export function teardownInstrumentationOverrides(): void {
  if (!isInstrumented || typeof window === 'undefined') return;

  methods.forEach(method => {
    if (originalConsoleMethods[method]) {
      console[method] = originalConsoleMethods[method]!;
    }
  });
  originalConsoleMethods = {};

  window.onerror = originalOnError;
  originalOnError = null;

  if (rejectionHandler) {
    window.removeEventListener('unhandledrejection', rejectionHandler);
    rejectionHandler = null;
  }

  isInstrumented = false;
}
