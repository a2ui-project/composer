/*
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * TODO: Replace this file with imports from `@a2ui/mcp-catalog/v0_9` once published to NPM.
 *
 * Type guards and recursive resolution utilities for A2UI dynamic values.
 *
 * While `DataContext.resolveDynamicValue` resolves a single top-level `DynamicValue`,
 * these helpers recursively traverse nested objects and arrays to resolve embedded
 * data bindings and function calls.
 */

import type {DataBinding, DataContext, FunctionCall} from '@a2ui/web_core/v0_9';
import {
  type DynamicValueContext,
  type DynamicValueStrategy,
  isPrototypePollutionKey,
  resolveDynamicTree,
} from './dynamic-value-strategy.js';

/** Representation of an A2UI v0.9 data binding. */
export type V09DataBinding = DataBinding;

/** Representation of an A2UI v0.9 function call. */
export type V09FunctionCall = FunctionCall;

/** Union of dynamic expression types (`DataBinding` or `FunctionCall`) that require runtime evaluation. */
export type DynamicExpression = DataBinding | FunctionCall;
export type V09DynamicExpression = DynamicExpression;

/** Checks whether a value is a non-null, non-array object. */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Checks whether `value` is an A2UI `DataBinding` (an object with a string `path` property).
 */
export function isDataBinding(value: unknown): value is DataBinding {
  return isRecord(value) && typeof value['path'] === 'string';
}

/**
 * Checks whether `value` is an A2UI `FunctionCall` (an object with a string `call` property).
 */
export function isFunctionCall(value: unknown): value is FunctionCall {
  return isRecord(value) && typeof value['call'] === 'string';
}

/**
 * Recursively resolves dynamic values within arrays, objects, or primitive nodes.
 */
export function resolveDynamicValueDeep<T = unknown>(
  value: unknown,
  context: DataContext | DynamicValueContext,
  depth = 0,
): T {
  return resolveDynamicTree<T>(
    value,
    node => {
      if (isDataBinding(node)) {
        const resolved = (context as DataContext).resolveDynamicValue(node);
        return {resolved: true, value: resolved};
      }
      if (isFunctionCall(node)) {
        const dynamicCall: FunctionCall =
          node.args !== undefined && node.returnType !== undefined
            ? node
            : {
                call: node.call,
                args: node.args ?? {},
                returnType: node.returnType ?? 'any',
              };
        const resolved = (context as DataContext).resolveDynamicValue(dynamicCall);
        return {resolved: true, value: resolved};
      }
      return {resolved: false};
    },
    depth,
  );
}

/**
 * Resolves each property value in a key-value record (such as function arguments).
 */
export function resolveDynamicRecord(
  record: Record<string, unknown>,
  context: DataContext | DynamicValueContext,
  depth = 0,
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (isPrototypePollutionKey(key)) {
      continue;
    }
    resolved[key] = resolveDynamicValueDeep(value, context, depth + 1);
  }
  return resolved;
}

/**
 * Strategy implementing A2UI v0.9 dynamic value evaluation and normalization.
 */
export class V09DynamicValueStrategy implements DynamicValueStrategy<
  DataBinding,
  FunctionCall,
  DynamicExpression
> {
  readonly version = 'v0.9' as const;

  isDataBinding(value: unknown): value is DataBinding {
    return isDataBinding(value) && Object.keys(value).length === 1;
  }

  isFunctionCall(value: unknown): value is FunctionCall {
    if (!isFunctionCall(value)) {
      return false;
    }
    const args = value['args'];
    const returnType = value['returnType'];
    return (
      (args === undefined || isRecord(args)) &&
      (returnType === undefined || typeof returnType === 'string')
    );
  }

  normalizeFunctionCall(call: FunctionCall): FunctionCall {
    if (call.args !== undefined && call.returnType !== undefined) {
      return call;
    }
    return {
      call: call.call,
      args: call.args ?? {},
      returnType: call.returnType ?? 'any',
    };
  }

  resolveDynamicValueDeep<T = unknown>(value: unknown, context: DynamicValueContext, depth = 0): T {
    return resolveDynamicValueDeep<T>(value, context, depth);
  }

  resolveDynamicRecord(
    record: Record<string, unknown>,
    context: DynamicValueContext,
    depth = 0,
  ): Record<string, unknown> {
    return resolveDynamicRecord(record, context, depth);
  }
}

/** Singleton instance of V09DynamicValueStrategy. */
export const v09DynamicValueStrategy = new V09DynamicValueStrategy();
