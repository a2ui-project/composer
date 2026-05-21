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

import {describe, it, expect, beforeEach, afterEach, vi, MockInstance} from 'vitest';
import {setupInstrumentationOverrides} from './instrumentation-overrides';
import {a2uiBridge, PreviewBridgeMessageType} from './preview-bridge';

describe('InstrumentationOverrides Diagnostics Telemetry', () => {
  let spy: MockInstance;
  let originalLog: (...data: unknown[]) => void;
  let originalOnError: OnErrorEventHandler;

  beforeEach(() => {
    spy = vi.spyOn(a2uiBridge, 'sendMessage').mockImplementation(() => {});
    originalLog = console.log;
    originalOnError = window.onerror;
    setupInstrumentationOverrides();
  });

  afterEach(() => {
    console.log = originalLog;
    window.onerror = originalOnError;
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
});
