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
import {DataContext, DataModel, Catalog, createFunctionImplementation} from '@a2ui/web_core/v1_0';
import {z} from 'zod/v3';
import {V10DynamicValueStrategy, v10DynamicValueStrategy} from './v1-0-dynamic-value-strategy.js';
import type {DynamicValueContext} from './dynamic-value-strategy.js';

describe('V10DynamicValueStrategy', () => {
  const strategy = new V10DynamicValueStrategy();

  it('exposes version v1.0', () => {
    expect(strategy.version).toBe('v1.0');
    expect(v10DynamicValueStrategy.version).toBe('v1.0');
  });

  describe('isDataBinding', () => {
    it('identifies valid v1.0 data bindings with @path property', () => {
      expect(strategy.isDataBinding({['@path']: '/user/name'})).toBe(true);
      expect(strategy.isDataBinding({['@path']: 'relative/path'})).toBe(true);
    });

    it('rejects bindings with extra properties or incorrect path types', () => {
      expect(strategy.isDataBinding({['@path']: '/user', extra: true})).toBe(false);
      expect(strategy.isDataBinding({['@path']: 123})).toBe(false);
      expect(strategy.isDataBinding({path: '/user'})).toBe(false);
      expect(strategy.isDataBinding(null)).toBe(false);
      expect(strategy.isDataBinding([])).toBe(false);
    });
  });

  describe('isFunctionCall', () => {
    it('identifies valid v1.0 function calls with @call and args and catalogId', () => {
      expect(strategy.isFunctionCall({['@call']: 'formatString'})).toBe(true);
      expect(
        strategy.isFunctionCall({
          ['@call']: 'formatString',
          ['args']: {value: 'hi'},
        }),
      ).toBe(true);
      expect(
        strategy.isFunctionCall({
          ['@call']: 'customFn',
          ['args']: {x: 1},
          ['catalogId']: 'https://example.com/catalog.json',
        }),
      ).toBe(true);
      // Rejects legacy @args prefix in v1.0
      expect(
        strategy.isFunctionCall({
          ['@call']: 'formatString',
          ['@args']: {value: 'hi'},
        }),
      ).toBe(false);
    });

    it('strictly rejects function calls containing returnType per v1.0 specification', () => {
      expect(
        strategy.isFunctionCall({
          ['@call']: 'formatString',
          ['args']: {value: 'hi'},
          returnType: 'string',
        }),
      ).toBe(false);
      expect(
        strategy.isFunctionCall({
          ['@call']: 'fn',
          ['returnType']: 'any',
        }),
      ).toBe(false);
    });

    it('rejects invalid function calls', () => {
      expect(strategy.isFunctionCall({call: 'formatString'})).toBe(false);
      expect(strategy.isFunctionCall({['@call']: 123})).toBe(false);
      expect(strategy.isFunctionCall({['@call']: 'fn', ['args']: 'invalid'})).toBe(false);
      expect(strategy.isFunctionCall({['@call']: 'fn', ['@args']: {x: 1}})).toBe(false);
      expect(strategy.isFunctionCall({['@call']: 'fn', ['catalogId']: 123})).toBe(false);
      expect(strategy.isFunctionCall(null)).toBe(false);
    });
  });

  describe('normalizeFunctionCall', () => {
    it('normalizes function call strictly omitting returnType and emitting args', () => {
      const bareCall = {['@call']: 'now'};
      const normalized = strategy.normalizeFunctionCall(bareCall);
      expect(normalized).toEqual({
        ['@call']: 'now',
        ['args']: {},
      });
      expect('returnType' in (normalized as Record<string, unknown>)).toBe(false);
      expect('@args' in (normalized as Record<string, unknown>)).toBe(false);
    });

    it('normalizes function call preserving catalogId and arguments without returnType', () => {
      const call = {
        ['@call']: 'calc',
        ['args']: {factor: 2},
        ['catalogId']: 'math-catalog',
      };
      const normalized = strategy.normalizeFunctionCall(call);
      expect(normalized).toEqual({
        ['@call']: 'calc',
        ['args']: {factor: 2},
        ['catalogId']: 'math-catalog',
      });
      expect('returnType' in (normalized as Record<string, unknown>)).toBe(false);
    });
  });

  describe('resolveDynamicValueDeep & resolveDynamicRecord', () => {
    const mockContext: DynamicValueContext = {
      resolveDynamicValue: (v: unknown) => {
        if (typeof v === 'object' && v !== null && '@path' in v) {
          return `resolved:${(v as {['@path']: string})['@path']}`;
        }
        if (typeof v === 'object' && v !== null && '@call' in v) {
          return `called:${(v as {['@call']: string})['@call']}`;
        }
        return v;
      },
    };

    it('deeply resolves bindings and calls within objects and arrays', () => {
      const input = {
        title: {['@path']: '/title'},
        list: [{['@call']: 'fn1'}, {['@path']: '/item'}],
        nested: {
          inner: {['@call']: 'fn2', ['args']: {x: 1}},
        },
      };

      const resolved = strategy.resolveDynamicValueDeep(input, mockContext);
      expect(resolved).toEqual({
        title: 'resolved:/title',
        list: ['called:fn1', 'resolved:/item'],
        nested: {
          inner: 'called:fn2',
        },
      });
    });

    it('sanitizes prototype pollution keys during record resolution', () => {
      const dangerousObj = JSON.parse(
        '{"__proto__": {"polluted": true}, "constructor": "bad", "prototype": "bad", "safe": 456}',
      );
      const resolved = strategy.resolveDynamicRecord(dangerousObj, mockContext);
      expect(resolved).toEqual({safe: 456});
      expect(Object.prototype.hasOwnProperty.call(resolved, '__proto__')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(resolved, 'constructor')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(resolved, 'prototype')).toBe(false);
    });

    it('enforces maximum recursion depth', () => {
      let obj: unknown = {['@path']: '/deep'};
      for (let i = 0; i < 110; i++) {
        obj = {child: obj};
      }
      const resolved = strategy.resolveDynamicValueDeep(obj, mockContext);
      expect(resolved).toBeDefined();
    });

    it('passes through Promises without blocking', () => {
      const promise = Promise.resolve('v1.0 async');
      expect(strategy.resolveDynamicValueDeep(promise, mockContext)).toBe(promise);
    });

    it('evaluates dynamic values against a real @a2ui/web_core/v1_0 DataContext', () => {
      const dataModel = new DataModel();
      dataModel.set('/user/name', 'Alice');
      dataModel.set('/user/count', 42);

      const catalog = new Catalog(
        'test-catalog',
        '1.0',
        [],
        [
          createFunctionImplementation(
            {
              name: 'double',
              returnType: 'any',
              schema: z.object({value: z.number()}),
            },
            args => (args.value as number) * 2,
          ),
        ],
      );

      const surface = {
        protocolVersion: '1.0',
        dataModel,
        defaultCatalog: catalog,
      };
      const context = new DataContext(surface);

      const input = {
        name: {['@path']: '/user/name'},
        doubled: {['@call']: 'double', args: {value: 21}},
      };

      const resolved = strategy.resolveDynamicValueDeep(input, context);
      expect(resolved).toEqual({
        name: 'Alice',
        doubled: 42,
      });
    });
  });
});
