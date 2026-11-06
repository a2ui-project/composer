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

import {
  type DynamicValueContext,
  type DynamicValueStrategy,
  isPrototypePollutionKey,
  resolveDynamicTree,
} from './dynamic-value-strategy.js';

/** Representation of an A2UI v1.0 data binding using Closure-safe bracket notation. */
export interface V10DataBinding {
  ['@path']: string;
}

/** Representation of an A2UI v1.0 function call strictly omitting returnType. */
export interface V10FunctionCall {
  ['@call']: string;
  ['@args']?: Record<string, unknown>;
  ['args']?: Record<string, unknown>;
  ['catalogId']?: string;
}

/** Union of dynamic expressions in v1.0. */
export type V10DynamicExpression = V10DataBinding | V10FunctionCall;

/** Checks whether a value is a non-null, non-array object. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Strategy implementing A2UI v1.0 dynamic value evaluation and normalization.
 */
export class V10DynamicValueStrategy implements DynamicValueStrategy<
  V10DataBinding,
  V10FunctionCall,
  V10DynamicExpression
> {
  readonly version = 'v1.0' as const;

  isDataBinding(value: unknown): value is V10DataBinding {
    return isRecord(value) && typeof value['@path'] === 'string' && Object.keys(value).length === 1;
  }

  isFunctionCall(value: unknown): value is V10FunctionCall {
    if (!isRecord(value) || typeof value['@call'] !== 'string') {
      return false;
    }
    // Strictly omit returnType on v1.0 function calls.
    if ('returnType' in value) {
      return false;
    }
    const args = value['@args'] ?? value['args'];
    const catalogId = value['catalogId'];
    return (
      (args === undefined || isRecord(args)) &&
      (catalogId === undefined || typeof catalogId === 'string')
    );
  }

  normalizeFunctionCall(call: V10FunctionCall): V10FunctionCall {
    const normalized: V10FunctionCall = {
      ['@call']: call['@call'],
      ['@args']: call['@args'] ?? call['args'] ?? {},
    };
    if (typeof call['catalogId'] === 'string') {
      normalized['catalogId'] = call['catalogId'];
    }
    return normalized;
  }

  resolveDynamicValueDeep<T = unknown>(value: unknown, context: DynamicValueContext, depth = 0): T {
    return resolveDynamicTree<T>(
      value,
      node => {
        if (this.isDataBinding(node)) {
          const resolved = context.resolveDynamicValue(node);
          return {resolved: true, value: resolved};
        }
        if (this.isFunctionCall(node)) {
          const dynamicCall = this.normalizeFunctionCall(node);
          const resolved = context.resolveDynamicValue(dynamicCall);
          return {resolved: true, value: resolved};
        }
        return {resolved: false};
      },
      depth,
    );
  }

  resolveDynamicRecord(
    record: Record<string, unknown>,
    context: DynamicValueContext,
    depth = 0,
  ): Record<string, unknown> {
    const resolved: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) {
      if (isPrototypePollutionKey(key)) {
        continue;
      }
      resolved[key] = this.resolveDynamicValueDeep(value, context, depth + 1);
    }
    return resolved;
  }
}

/** Singleton instance of V10DynamicValueStrategy. */
export const v10DynamicValueStrategy = new V10DynamicValueStrategy();
