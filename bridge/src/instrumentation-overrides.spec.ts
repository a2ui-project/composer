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

import {describe, it, expect, beforeEach, afterEach, beforeAll, vi, MockInstance} from 'vitest';

const consoleErrorSpy = vi.hoisted(() => {
  return vi.spyOn(console, 'error').mockImplementation(() => {});
});
import {setupInstrumentationOverrides} from './instrumentation-overrides';
import {a2uiBridge} from './preview-bridge';
import {PreviewBridgeMessageType} from './bridge-message';

describe('InstrumentationOverrides Diagnostics Telemetry', () => {
  let spy: MockInstance;
  let originalLog: (...data: unknown[]) => void;
  let originalOnError: OnErrorEventHandler;

  beforeAll(() => {
    setupInstrumentationOverrides();
  });

  beforeEach(() => {
    spy = vi.spyOn(a2uiBridge, 'sendMessage').mockImplementation(() => {});
    originalLog = console.log;
    originalOnError = window.onerror;
  });

  afterEach(() => {
    console.log = originalLog;
    window.onerror = originalOnError;
    consoleErrorSpy.mockClear();
    spy.mockClear();
    vi.restoreAllMocks();
  });

  it('captures native console.log calls routing telemetry directly to the bridge interface', () => {
    console.log('Diagnostic statement active', {key: 'value'});

    expect(spy).toHaveBeenCalledWith({
      type: PreviewBridgeMessageType.CONSOLE_LOG,
      payload: {
        level: 'log',
        message: 'Diagnostic statement active {"key":"value"}',
        stack: undefined,
      },
    });
  });

  it('hooks window.onerror capturing unhandled script exceptions reliably', () => {
    const err = new Error('fatal');
    if (window.onerror) {
      window.onerror('Uncaught reference error', 'app.js', 14, 2, err);
    }

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: PreviewBridgeMessageType.CONSOLE_LOG,
        payload: expect.objectContaining({
          level: 'error',
          message: 'Uncaught reference error',
          stack: err.stack,
        }),
      }),
    );
  });

  it('serializes non-clonable primitive targets safely to prevent DataCloneError', () => {
    const callbackFunc = () => {};
    const uniqueSymbol = Symbol('debug-tag');
    console.log(callbackFunc, uniqueSymbol);

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          message: '[Function Callback] Symbol(debug-tag)',
        }),
      }),
    );
  });

  it('serializes circular object graphs safely without dropping non-circular fields', () => {
    const circularObj: Record<string, unknown> = {name: 'parent'};
    circularObj['self'] = circularObj;
    console.log(circularObj);

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          message: '{"name":"parent","self":"[Circular Reference]"}',
        }),
      }),
    );
  });

  it('preserves non-enumerable fields of nested Error objects during array serialization', () => {
    const nestedError = new Error('Inner failure');
    console.log({errorTarget: nestedError});

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          message: expect.stringContaining('Inner failure'),
        }),
      }),
    );
  });

  it('serializes Directed Acyclic Graphs successfully without flagging shared properties as circular', () => {
    const childNode = {id: 'shared-child'};
    const dagGraph = {
      leftChild: childNode,
      rightChild: childNode,
    };
    console.log(dagGraph);

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          message: '{"leftChild":{"id":"shared-child"},"rightChild":{"id":"shared-child"}}',
        }),
      }),
    );
  });

  it('serializes bigint and DOM nodes safely', () => {
    const bigIntValue = 9007199254740991n;
    const domNode = document.createElement('div');
    console.log(bigIntValue, domNode, window);

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          message: '9007199254740991n [DOM Node: DIV] [Window Scope]',
        }),
      }),
    );
  });

  it('handles throwing getters gracefully during object serialization', () => {
    const objWithGetter = {
      normalProp: 'valid',
      get throwingProp() {
        throw new Error('Getter threw');
      },
    };
    console.log(objWithGetter);

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          message: '{"normalProp":"valid","throwingProp":"[Unserializable Property]"}',
        }),
      }),
    );
  });

  it('captures unhandled promise rejection events and routes error telemetry', () => {
    const error = new Error('Promise target crashed');
    const event = new PromiseRejectionEvent('unhandledrejection', {
      promise: Promise.resolve(),
      reason: error,
    });
    window.dispatchEvent(event);

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: PreviewBridgeMessageType.CONSOLE_LOG,
        payload: expect.objectContaining({
          level: 'error',
          message: 'Unhandled Rejection: Promise target crashed',
          stack: error.stack,
        }),
      }),
    );
  });

  it('captures unhandled promise rejection with a string reason safely without stack', () => {
    const event = new PromiseRejectionEvent('unhandledrejection', {
      promise: Promise.resolve(),
      reason: 'Fatal rejection string',
    });
    window.dispatchEvent(event);

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: PreviewBridgeMessageType.CONSOLE_LOG,
        payload: {
          level: 'error',
          message: 'Unhandled Rejection: Fatal rejection string',
          stack: undefined,
        },
      }),
    );
  });

  it('serializes arrays and nested arrays safely', () => {
    console.log([42, [100, 'nested-item']]);

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          message: '[42,[100,"nested-item"]]',
        }),
      }),
    );
  });

  it('recursively clones Map and Set instances, resolving complex nested items and circular references', () => {
    const complexObj: Record<string, unknown> = {data: 'nested'};
    complexObj['self'] = complexObj;

    const testMap = new Map<unknown, unknown>();
    testMap.set('circularKey', complexObj);
    testMap.set(complexObj, 'circularVal');

    const testSet = new Set<unknown>();
    testSet.add(complexObj);

    console.log(testMap, testSet);

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          message:
            '[["circularKey",{"data":"nested","self":"[Circular Reference]"}],[{"data":"nested","self":"[Circular Reference]"},"circularVal"]] [{"data":"nested","self":"[Circular Reference]"}]',
        }),
      }),
    );
  });

  it('catches and reports telemetry errors on original console in case of bridge message failures', () => {
    spy.mockImplementationOnce(() => {
      throw new Error('Bridge transport crashed');
    });

    console.log('Telemetry payload');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'A2UI Bridge Telemetry Error (Console):',
      expect.any(Error),
    );
  });

  it('catches and reports telemetry errors on original console in case of window.onerror message failures', () => {
    spy.mockImplementationOnce(() => {
      throw new Error('Bridge transport crashed');
    });

    if (window.onerror) {
      window.onerror('Uncaught exception', 'app.js', 10, 5);
    }

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'A2UI Bridge Telemetry Error (Window Error):',
      expect.any(Error),
    );
  });

  it('catches and reports telemetry errors on original console in case of unhandledrejection message failures', () => {
    spy.mockImplementationOnce(() => {
      throw new Error('Bridge transport crashed');
    });

    const event = new PromiseRejectionEvent('unhandledrejection', {
      promise: Promise.resolve(),
      reason: 'Async failure',
    });
    window.dispatchEvent(event);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'A2UI Bridge Telemetry Error (Unhandled Rejection):',
      expect.any(Error),
    );
  });

  it('delegates to the original window.onerror handler after capturing error telemetry', () => {
    const originalOnErrorMock = vi.fn();
    window.onerror = originalOnErrorMock;

    setupInstrumentationOverrides();

    if (window.onerror) {
      window.onerror('Script failed', 'app.js', 20, 10);
    }

    expect(originalOnErrorMock).toHaveBeenCalledWith('Script failed', 'app.js', 20, 10, undefined);
  });

  it('handles window.onerror missing/undefined parameters gracefully routing default trace telemetry', () => {
    if (window.onerror) {
      window.onerror('Minimal failure message', undefined, undefined, undefined);
    }

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: PreviewBridgeMessageType.CONSOLE_LOG,
        payload: {
          level: 'error',
          message: 'Minimal failure message',
          stack: ':0:0',
        },
      }),
    );
  });

  it('prevents infinite telemetry cycles by using recursion guard early-return', () => {
    let innerCallCount = 0;

    // Mock bridge sendMessage to call console.log, creating dynamic recursion
    spy.mockImplementation(() => {
      innerCallCount++;
      console.log('Recursive inner log message');
    });

    console.log('Main external log trigger');

    // Recursive log should be captured but early return prevents infinite telemetry loops
    expect(innerCallCount).toBe(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          message: 'Main external log trigger',
        }),
      }),
    );
  });
});
