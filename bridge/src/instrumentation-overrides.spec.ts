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

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {setupInstrumentationOverrides} from './instrumentation-overrides';
import {a2uiBridge} from './preview-bridge';

describe('InstrumentationOverrides Diagnostics Telemetry', () => {
  let spy: any;
  let originalLog: any;
  let originalOnError: any;

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
      type: 'CONSOLE_LOG',
      payload: {
        level: 'log',
        arguments: ['Diagnostic statement active', {key: 'value'}],
      },
    });
  });

  it('hooks window.onerror capturing unhandled script exceptions reliably', () => {
    if (window.onerror) {
      window.onerror('Uncaught reference error', 'app.js', 14, 2, new Error('fatal'));
    }

    expect(spy).toHaveBeenCalledWith({
      type: 'WINDOW_ERROR',
      payload: {
        message: 'Uncaught reference error',
        source: 'app.js',
        lineno: 14,
        colno: 2,
        error: {
          message: 'fatal',
          stack: expect.any(String),
        },
      },
    });
  });

  it('serializes circular references gracefully replacing recursive depths with markers', () => {
    const parentNode: any = {nodeId: 44};
    const childNode: any = {nodeId: 45, parent: parentNode};
    parentNode.firstChild = childNode;

    console.log(parentNode);

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          arguments: [
            {
              nodeId: 44,
              firstChild: {
                nodeId: 45,
                parent: '[Circular Reference]',
              },
            },
          ],
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
          arguments: [
            {
              errorTarget: {
                message: 'Inner failure',
                stack: expect.any(String),
              },
            },
          ],
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
          arguments: [
            {
              leftChild: {id: 'shared-child'},
              rightChild: {id: 'shared-child'},
            },
          ],
        }),
      }),
    );
  });
});
