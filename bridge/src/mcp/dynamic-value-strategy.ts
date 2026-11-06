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

/** Maximum recursion depth when resolving nested dynamic values to prevent infinite loops. */
export const MAX_RESOLUTION_DEPTH = 100;

/** Minimal context interface for evaluating dynamic values. */
export interface DynamicValueContext {
  resolveDynamicValue<T = unknown>(value: unknown): T;
  set?(path: string, value: unknown): void;
}

/**
 * Checks whether an object property key is a prototype pollution vector.
 */
export function isPrototypePollutionKey(key: string): boolean {
  return key === '__proto__' || key === 'constructor' || key === 'prototype';
}

/** Checks whether a value is a non-null, non-array object. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Result of evaluating a potential dynamic expression node.
 */
export type DynamicExpressionResult = {resolved: true; value: unknown} | {resolved: false};

/**
 * Recursively resolves dynamic values within arrays, objects, and nested nodes
 * using the provided resolution callback while guarding against prototype pollution and stack overflows.
 *
 * @param value The value, array, or object to resolve.
 * @param resolveExpression Callback to resolve a dynamic expression leaf node.
 * @param depth Current recursion depth.
 * @returns Fully resolved data structure.
 */
export function resolveDynamicTree<T = unknown>(
  value: unknown,
  resolveExpression: (val: unknown) => DynamicExpressionResult,
  depth = 0,
): T {
  if (depth >= MAX_RESOLUTION_DEPTH) {
    return value as T;
  }
  if (!isRecord(value) && !Array.isArray(value)) {
    return value as T;
  }
  if (typeof (value as {then?: unknown}).then === 'function') {
    return value as T;
  }
  if (Array.isArray(value)) {
    return value.map(item =>
      resolveDynamicTree(item, resolveExpression, depth + 1),
    ) as unknown as T;
  }
  const exprResult = resolveExpression(value);
  if (exprResult.resolved) {
    if (exprResult.value === value) {
      return exprResult.value as unknown as T;
    }
    return resolveDynamicTree(exprResult.value, resolveExpression, depth + 1);
  }
  const resolved: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value)) {
    if (isPrototypePollutionKey(key)) {
      continue;
    }
    resolved[key] = resolveDynamicTree(val, resolveExpression, depth + 1);
  }
  return resolved as T;
}

/**
 * Strategy interface abstracting version-specific dynamic value representation and resolution
 * across A2UI specifications (v0.9 and v1.0).
 */
export interface DynamicValueStrategy<
  TBinding = unknown,
  TFunctionCall = unknown,
  TExpression = unknown,
> {
  /** The protocol version handled by this strategy ('v0.9' or 'v1.0'). */
  readonly version: 'v0.9' | 'v1.0';

  /** Checks whether a value is a DataBinding. */
  isDataBinding(value: unknown): value is TBinding;

  /** Checks whether a value is a FunctionCall. */
  isFunctionCall(value: unknown): value is TFunctionCall;

  /** Normalizes a function call with default arguments and specification-compliant fields. */
  normalizeFunctionCall(call: TFunctionCall): TFunctionCall;

  /** Recursively resolves dynamic values within arrays, objects, or primitive nodes. */
  resolveDynamicValueDeep<T = unknown>(
    value: unknown,
    context: DynamicValueContext,
    depth?: number,
  ): T;

  /** Recursively resolves dynamic values within a record while sanitizing prototype pollution keys. */
  resolveDynamicRecord(
    record: Record<string, unknown>,
    context: DynamicValueContext,
    depth?: number,
  ): Record<string, unknown>;
}

import {v09DynamicValueStrategy} from './v0-9-dynamic-value-strategy.js';
import {v10DynamicValueStrategy} from './v1-0-dynamic-value-strategy.js';

/**
 * Returns the DynamicValueStrategy corresponding to the requested protocol version.
 *
 * @param version Protocol version string ('v0.9', '0.9', 'v1.0', or '1.0').
 * @returns Concrete DynamicValueStrategy instance for the version.
 */
export function getDynamicValueStrategy(
  version?: 'v0.9' | 'v1.0' | '0.9' | '1.0' | string | null,
): DynamicValueStrategy {
  if (!version || typeof version !== 'string') {
    return v09DynamicValueStrategy;
  }
  const trimmed = version.trim();
  if (trimmed === 'v1.0' || trimmed === '1.0' || trimmed.startsWith('1.') || trimmed.startsWith('v1.')) {
    return v10DynamicValueStrategy;
  }
  return v09DynamicValueStrategy;
}

/**
 * Resolves a dynamic value or tree against context using either version-specific strategies
 * or inspecting the value nodes against both v0.9 and v1.0 patterns.
 *
 * @param value The value, array, or object to resolve.
 * @param context The data context used for evaluation.
 * @param version Optional protocol version to select strategy explicitly.
 * @returns Fully resolved value structure.
 */
export function resolveDynamicValueWithContext<T = unknown>(
  value: unknown,
  context: DynamicValueContext,
  version?: 'v0.9' | 'v1.0' | '0.9' | '1.0' | string | null,
): T {
  if (version) {
    const strategy = getDynamicValueStrategy(version);
    return strategy.resolveDynamicValueDeep<T>(value, context);
  }
  return resolveDynamicTree<T>(
    value,
    node => {
      if (v10DynamicValueStrategy.isDataBinding(node)) {
        return {resolved: true, value: context.resolveDynamicValue(node)};
      }
      if (v09DynamicValueStrategy.isDataBinding(node)) {
        return {resolved: true, value: context.resolveDynamicValue(node)};
      }
      if (v10DynamicValueStrategy.isFunctionCall(node)) {
        const call = v10DynamicValueStrategy.normalizeFunctionCall(node);
        return {resolved: true, value: context.resolveDynamicValue(call)};
      }
      if (v09DynamicValueStrategy.isFunctionCall(node)) {
        const call = v09DynamicValueStrategy.normalizeFunctionCall(node);
        return {resolved: true, value: context.resolveDynamicValue(call)};
      }
      return {resolved: false};
    },
    0,
  );
}

/**
 * Resolves dynamic values deeply within arrays, objects, or primitive nodes.
 *
 * @param value The value or data structure to resolve.
 * @param context Dynamic evaluation context.
 * @param depth Current recursion depth.
 * @param strategy Optional strategy override (defaults to inspecting both versions).
 * @returns Fully resolved data structure.
 */
export function resolveDynamicValueDeep<T = unknown>(
  value: unknown,
  context: DynamicValueContext,
  depth = 0,
  strategy?: DynamicValueStrategy,
): T {
  if (strategy) {
    return strategy.resolveDynamicValueDeep<T>(value, context, depth);
  }
  return resolveDynamicValueWithContext<T>(value, context);
}

/**
 * Recursively resolves dynamic values within an object record's properties.
 *
 * @param record Key-value record whose values should be evaluated.
 * @param context Dynamic evaluation context.
 * @param depth Current recursion depth.
 * @param strategy Optional strategy override.
 * @returns New record with all dynamic expressions resolved.
 */
export function resolveDynamicRecord(
  record: Record<string, unknown>,
  context: DynamicValueContext,
  depth = 0,
  strategy?: DynamicValueStrategy,
): Record<string, unknown> {
  if (strategy) {
    return strategy.resolveDynamicRecord(record, context, depth);
  }
  const resolved: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (isPrototypePollutionKey(key)) {
      continue;
    }
    resolved[key] = resolveDynamicValueDeep(value, context, depth + 1);
  }
  return resolved;
}

