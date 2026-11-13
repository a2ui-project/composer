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

import {describe, it, expect} from 'vitest';
import {
  V09DynamicValueStrategy,
  v09DynamicValueStrategy,
  isDataBinding,
  isFunctionCall,
  resolveDynamicValueDeep,
} from './v0-9-dynamic-value-strategy.js';
import type {DynamicValueContext} from './dynamic-value-strategy.js';

describe('V09DynamicValueStrategy', () => {
  const strategy = new V09DynamicValueStrategy();

  it('exposes version v0.9', () => {
    expect(strategy.version).toBe('v0.9');
    expect(v09DynamicValueStrategy.version).toBe('v0.9');
  });

  describe('isDataBinding', () => {
    it('identifies valid v0.9 data bindings with single path property', () => {
      expect(strategy.isDataBinding({path: '/user/name'})).toBe(true);
      expect(strategy.isDataBinding({path: 'relative/path'})).toBe(true);
    });

    it('rejects bindings with extra properties or incorrect path types', () => {
      expect(strategy.isDataBinding({path: '/user', extra: true})).toBe(false);
      expect(strategy.isDataBinding({path: '/foo', extra: 1})).toBe(false);
      expect(isDataBinding({path: '/foo', extra: 1})).toBe(false);
      expect(isDataBinding({path: '/foo'})).toBe(true);
      expect(strategy.isDataBinding({path: 123})).toBe(false);
      expect(strategy.isDataBinding({'@path': '/user'})).toBe(false);
      expect(strategy.isDataBinding(null)).toBe(false);
      expect(strategy.isDataBinding([])).toBe(false);
    });
  });

  describe('isFunctionCall', () => {
    it('identifies valid v0.9 function calls', () => {
      expect(strategy.isFunctionCall({call: 'formatString'})).toBe(true);
      expect(
        strategy.isFunctionCall({
          call: 'formatString',
          args: {value: 'hi'},
          returnType: 'string',
        }),
      ).toBe(true);
      expect(strategy.isFunctionCall({call: 'test', args: {}})).toBe(true);
    });

    it('rejects invalid function calls', () => {
      expect(strategy.isFunctionCall({'@call': 'formatString'})).toBe(false);
      expect(isFunctionCall({'@call': 'formatString'})).toBe(false);
      expect(strategy.isFunctionCall({call: 123})).toBe(false);
      expect(strategy.isFunctionCall({call: 'fn', args: 'invalid'})).toBe(false);
      expect(isFunctionCall({call: 'fn', args: 'invalid'})).toBe(false);
      expect(strategy.isFunctionCall({call: 'fn', returnType: 123})).toBe(false);
      expect(isFunctionCall({call: 'fn', returnType: 123})).toBe(false);
      expect(strategy.isFunctionCall(null)).toBe(false);
    });
  });

  describe('normalizeFunctionCall', () => {
    it('normalizes function call by filling in default args and returnType', () => {
      const bareCall = {call: 'now'};
      const normalized = strategy.normalizeFunctionCall(bareCall);
      expect(normalized).toEqual({
        call: 'now',
        args: {},
        returnType: 'any',
      });
    });

    it('preserves complete function call on normalization', () => {
      const fullCall = {call: 'now', args: {tz: 'UTC'}, returnType: 'string'};
      expect(strategy.normalizeFunctionCall(fullCall)).toBe(fullCall);
    });
  });

  describe('resolveDynamicValueDeep & resolveDynamicRecord', () => {
    const mockContext: DynamicValueContext = {
      resolveDynamicValue: (v: unknown) => {
        if (typeof v === 'object' && v !== null && 'path' in v) {
          return `resolved:${(v as {path: string}).path}`;
        }
        if (typeof v === 'object' && v !== null && 'call' in v) {
          return `called:${(v as {call: string}).call}`;
        }
        return v;
      },
    };

    it('deeply resolves bindings and calls within objects and arrays', () => {
      const input = {
        title: {path: '/title'},
        unbound: {path: '/foo', extra: 1},
        list: [{call: 'fn1'}, {path: '/item'}],
        nested: {
          inner: {call: 'fn2', args: {x: 1}},
        },
      };

      const resolved = strategy.resolveDynamicValueDeep(input, mockContext);
      expect(resolved).toEqual({
        title: 'resolved:/title',
        unbound: {path: '/foo', extra: 1},
        list: ['called:fn1', 'resolved:/item'],
        nested: {
          inner: 'called:fn2',
        },
      });

      const standaloneResolved = resolveDynamicValueDeep({path: '/foo', extra: 1}, mockContext);
      expect(standaloneResolved).toEqual({path: '/foo', extra: 1});
    });

    it('sanitizes prototype pollution keys during record resolution', () => {
      const dangerousObj = JSON.parse(
        '{"__proto__": {"polluted": true}, "constructor": "bad", "prototype": "bad", "safe": 123}',
      );
      const resolved = strategy.resolveDynamicRecord(dangerousObj, mockContext);
      expect(resolved).toEqual({safe: 123});
      expect(Object.prototype.hasOwnProperty.call(resolved, '__proto__')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(resolved, 'constructor')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(resolved, 'prototype')).toBe(false);
    });

    it('enforces maximum recursion depth', () => {
      let obj: unknown = {path: '/deep'};
      for (let i = 0; i < 110; i++) {
        obj = {child: obj};
      }
      const resolved = strategy.resolveDynamicValueDeep(obj, mockContext);
      expect(resolved).toBeDefined();
    });

    it('passes through Promises without blocking', () => {
      const promise = Promise.resolve('async');
      expect(strategy.resolveDynamicValueDeep(promise, mockContext)).toBe(promise);
    });
  });
});
