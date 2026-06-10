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
import {stableStringify} from './stable-stringify';

describe('stableStringify', () => {
  it('enforces stable key ordering in nested objects', () => {
    const obj1 = {
      b: 2,
      a: {d: 4, c: 3},
    };
    const obj2 = {
      a: {c: 3, d: 4},
      b: 2,
    };
    expect(stableStringify(obj1)).toBe('{"a":{"c":3,"d":4},"b":2}');
    expect(stableStringify(obj1)).toBe(stableStringify(obj2));
  });

  it('detects and handles circular references', () => {
    const obj: {[key: string]: unknown} = {a: 1};
    obj['self'] = obj;
    expect(stableStringify(obj)).toBe('{"a":1,"self":[Circular]}');
  });

  it('correctly traverses diamond reference graphs (DAGs) without false positive cycle detection', () => {
    const sharedChild = {x: 10};
    const parent = {
      left: sharedChild,
      right: sharedChild,
    };
    expect(stableStringify(parent)).toBe('{"left":{"x":10},"right":{"x":10}}');
  });

  it('serializes BigInt gracefully', () => {
    const obj = {big: 123456789n};
    expect(stableStringify(obj)).toBe('{"big":123456789n}');
  });

  it('serializes Map and Set with different insertion orders but identical content stably', () => {
    const set1 = new Set([3, 1, 2]);
    const set2 = new Set([2, 3, 1]);
    expect(stableStringify(set1)).toBe('Set[1,2,3]');
    expect(stableStringify(set1)).toBe(stableStringify(set2));

    const map1 = new Map([
      ['b', 2],
      ['a', 1],
    ]);
    const map2 = new Map([
      ['a', 1],
      ['b', 2],
    ]);
    expect(stableStringify(map1)).toBe('Map{"a":1,"b":2}');
    expect(stableStringify(map1)).toBe(stableStringify(map2));
  });

  it('handles special types: Date, RegExp, Function, Symbol, NaN, Infinity, undefined', () => {
    const testDate = new Date('2026-06-10T21:52:11.000Z');
    const invalidDate = new Date(NaN);
    const testRegExp = /abc/gi;
    const testFn = function myFunc() {};
    const anonFn = [function () {}][0];
    const testSym = Symbol('mySym');
    const emptySym = Symbol();

    expect(stableStringify(testDate)).toBe('[Date: 2026-06-10T21:52:11.000Z]');
    expect(stableStringify(invalidDate)).toBe('[Date: Invalid Date]');
    expect(stableStringify(testRegExp)).toBe('[RegExp: /abc/gi]');
    expect(stableStringify(testFn)).toBe('[Function: "myFunc"]');
    expect(stableStringify(anonFn)).toBe('[Function: "anonymous"]');
    expect(stableStringify(testSym)).toBe('[Symbol: "mySym"]');
    expect(stableStringify(emptySym)).toBe('[Symbol: ""]');
    expect(stableStringify(NaN)).toBe('[NaN]');
    expect(stableStringify(Infinity)).toBe('[Infinity]');
    expect(stableStringify(-Infinity)).toBe('[-Infinity]');
    expect(stableStringify(undefined)).toBe('undefined');
  });

  it('gracefully catches throwing property getters', () => {
    const obj = {
      normal: 'ok',
      get throwing() {
        throw new Error('Getter failure');
      },
    };
    expect(stableStringify(obj)).toBe('{"normal":"ok","throwing":[Getter Error]}');
  });

  it('prevents delimiter injection in Symbol and Function serialization', () => {
    const maliciousSym = Symbol('mySym]\n[Another');
    const fn = () => {};
    Object.defineProperty(fn, 'name', {value: 'malicious]\n[Name'});

    expect(stableStringify(maliciousSym)).toBe('[Symbol: "mySym]\\n[Another"]');
    expect(stableStringify(fn)).toBe('[Function: "malicious]\\n[Name"]');
  });

  it('removes objects from visited WeakSet when their own iteration throws', () => {
    const throwingProxy = new Proxy(
      {},
      {
        ownKeys() {
          throw new Error('Iteration crash');
        },
      },
    );
    const obj = {
      first: throwingProxy,
      second: throwingProxy,
    };
    expect(stableStringify(obj)).toBe('{"first":[Getter Error],"second":[Getter Error]}');
  });

  it('serializes Error objects correctly', () => {
    const err = new Error('Test error message');
    expect(stableStringify(err)).toBe('[Error: "Test error message"]');
  });

  it('serializes null, boolean, and plain arrays correctly', () => {
    expect(stableStringify(null)).toBe('null');
    expect(stableStringify(true)).toBe('true');
    expect(stableStringify(false)).toBe('false');
    expect(stableStringify([1, 'a', false])).toBe('[1,"a",false]');
  });

  it('omits object properties with undefined values', () => {
    const obj = {a: 1, b: undefined, c: 'three'};
    expect(stableStringify(obj)).toBe('{"a":1,"c":"three"}');
  });

  it('serializes Map with object keys, Set with object elements, and null-prototype objects', () => {
    const keyObj = {id: 1};
    const valObj = {name: 'val'};
    const map = new Map([[keyObj, valObj]]);
    expect(stableStringify(map)).toBe('Map{{"id":1}:{"name":"val"}}');

    const set = new Set([{elem: 'a'}, {elem: 'b'}]);
    expect(stableStringify(set)).toBe('Set[{"elem":"a"},{"elem":"b"}]');

    const nullProto = Object.create(null);
    nullProto.foo = 'bar';
    expect(stableStringify(nullProto)).toBe('{"foo":"bar"}');
  });
});
