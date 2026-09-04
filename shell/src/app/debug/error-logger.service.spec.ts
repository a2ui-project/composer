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
import {describe, it, expect, beforeEach} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {ErrorLogger, ErrorLogItem, isErrorLike} from './error-logger.service';
import {safeSerialize} from 'a2ui-bridge';

describe('ErrorLogger Service Tests', () => {
  let service: ErrorLogger;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorLogger);
  });

  it('verifies non-clashing overloads for partial items and variadic', () => {
    const emitted: ErrorLogItem[] = [];
    service.errorStream$.subscribe(item => emitted.push(item));

    service.error({message: 'Partial msg error', sourceTag: '[ChatParser]'});
    service.warn({message: 'Partial msg warn', sourceTag: '[ChatParser]'});
    service.info({message: 'Partial msg info', sourceTag: '[ChatParser]'});
    service.log({message: 'Partial msg log', sourceTag: '[ChatParser]'});

    service.error(new Error('Variadic error'), {some: 'data'});
    service.warn('Failed to load', {some: 'data'});
    service.info('Info data', {some: 'data'});
    service.log('Log data', {some: 'data'});

    expect(emitted.length).toBe(8);

    expect(emitted[0].level).toBe('error');
    expect(emitted[1].level).toBe('warn');
    expect(emitted[2].level).toBe('info');
    expect(emitted[3].level).toBe('log');

    expect(emitted[0].message).toBe('Partial msg error');
    expect(emitted[1].message).toBe('Partial msg warn');
    expect(emitted[2].message).toBe('Partial msg info');
    expect(emitted[3].message).toBe('Partial msg log');

    expect(emitted[4].message).toBe('Variadic error {"some":"data"}');
    expect(emitted[5].message).toBe('Failed to load {"some":"data"}');
    expect(emitted[6].message).toBe('Info data {"some":"data"}');
    expect(emitted[7].message).toBe('Log data {"some":"data"}');
  });

  it('provides a withTag factory for tagged logging', () => {
    const emitted: ErrorLogItem[] = [];
    service.errorStream$.subscribe(item => emitted.push(item));

    const tagged = service.withTag('[MyModule]');
    tagged.error('Error message', {detail: 1});
    tagged.warn('Warning');
    tagged.info('Information', 'extra');
    tagged.log('Debugging');

    expect(emitted.length).toBe(4);
    for (const item of emitted) {
      expect(item.sourceTag).toBe('[MyModule]');
    }

    expect(emitted[0].level).toBe('error');
    expect(emitted[0].message).toBe('Error message {"detail":1}');

    expect(emitted[1].level).toBe('warn');
    expect(emitted[1].message).toBe('Warning');

    expect(emitted[2].level).toBe('info');
    expect(emitted[2].message).toBe('Information extra');

    expect(emitted[3].level).toBe('log');
    expect(emitted[3].message).toBe('Debugging');
  });

  it('covers serialization fallback branch (throw in sanitize)', () => {
    const badObj = {
      get foo() {
        throw new Error('Cannot stringify');
      },
    };
    expect(safeSerialize(badObj)).toBe('[Unserializable]');
  });

  it('serializes undefined and functions to string representation', () => {
    expect(safeSerialize(undefined)).toBe('undefined');
    expect(safeSerialize(() => {})).toBe('undefined');
  });

  it('preserves generic objects with intersecting keys instead of swallowing them as log items', () => {
    const emitted: ErrorLogItem[] = [];
    service.errorStream$.subscribe(item => emitted.push(item));

    const normalPayload = {id: '123', someOtherProp: true};
    service.error(normalPayload);

    expect(emitted.length).toBe(1);
    expect(emitted[0].message).toContain('someOtherProp');
    expect(emitted[0].message).toContain('123');
  });

  it('verifies duck-typing isErrorLike accurately unpacks name, message, and stack on cross-realm Error objects while rejecting A2UI dictionary nodes', () => {
    const regularError = new Error('Regular error');
    expect(isErrorLike(regularError)).toBe(true);

    const crossRealmLikeError = {
      name: 'TypeError',
      message: 'Cross realm',
      stack: 'Error syntax at...',
    };
    expect(isErrorLike(crossRealmLikeError)).toBe(true);

    const a2uiNode = {
      component: 'Button',
      message: 'Click me',
      stack: 'layout',
    };
    expect(isErrorLike(a2uiNode)).toBe(false);

    const domElement = {
      nodeType: 1,
      tagName: 'DIV',
      message: 'DOM error',
      stack: 'DOM stack',
    };
    expect(isErrorLike(domElement)).toBe(false);
  });

  it('verifies leaf-level circular detection preserves valid non-circular duplicate nodes and emits [Circular] only on offending leaf references without whole-graph collapse', () => {
    const a = {b: 1};
    const validDuplicate = {first: a, second: a};

    const serializedValid = safeSerialize(validDuplicate);
    expect(serializedValid).toBe('{"first":{"b":1},"second":{"b":1}}');

    const circularObj: Record<string, unknown> = {data: 'test'};
    circularObj['selfRef'] = circularObj;

    const serializedCircular = safeSerialize(circularObj);
    expect(serializedCircular).toBe('{"data":"test","selfRef":"[Circular]"}');
  });

  it('normalizes partial error objects without stack', () => {
    const emitted: ErrorLogItem[] = [];
    service.errorStream$.subscribe(item => emitted.push(item));
    service.error({sourceTag: '[Shell]'} as Partial<ErrorLogItem>);
    expect(emitted[0].message).toBe('');

    service.error({id: '123'} as Partial<ErrorLogItem>);
    expect(emitted[1].id).toBe('123');
  });

  it('handles unstringified variadic logs', () => {
    const emitted: ErrorLogItem[] = [];
    service.errorStream$.subscribe(item => emitted.push(item));
    // Since it doesn't match PartialErrorLogItem anymore, it serialize
    service.error({unknown: 'object'});
    expect(emitted[0].message).toBe('{"unknown":"object"}');
  });

  it('handles arrays in safeSerialize securely', () => {
    const val = [1, 2, {a: 3}];
    expect(safeSerialize(val)).toBe('[1,2,{"a":3}]');
  });

  it('verifies bigint values serialize cleanly to 123n without throwing TypeError', () => {
    const val = {num: 123n};
    const serialized = safeSerialize(val);
    expect(serialized).toBe('{"num":"123n"}');
  });

  it('verifies cross-realm DOM Element references (nodeType === 1) serialize to tag representations without property access crashes', () => {
    const mockElement: Record<string, unknown> = {
      nodeType: 1,
      tagName: 'BUTTON',
      circularClassList: {},
    };
    mockElement['circularClassList'] = mockElement;

    const serialized = safeSerialize(mockElement);
    expect(serialized).toBe('"[Element: <button>]"');
  });
});
