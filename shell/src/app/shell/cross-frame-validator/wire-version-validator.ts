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

import type {A2uiProtocolVersion} from 'a2ui-bridge';
import type {TaggedLogger} from '../../debug/error-logger.service';

type A2uiWireProtocolVersion = A2uiProtocolVersion;

/**
 * Common strategy contract for versioned cross-frame wire validators.
 */
export interface A2uiWireVersionValidator {
  readonly version: A2uiWireProtocolVersion;

  /**
   * Validates a SEND_TO_SERVER payload against this protocol version's specification.
   *
   * @param payload The SEND_TO_SERVER payload to validate.
   * @param errors An optional array to collect validation error messages.
   * @param logger A logger to record validation messages to.
   * @returns `true` if valid, `false` otherwise.
   */
  validateSendToServer(
    payload: unknown,
    errors: string[] | undefined,
    logger: Pick<TaggedLogger, 'error' | 'warn'>,
  ): boolean;

  /**
   * Validates a RENDER_A2UI item against this protocol version's specification.
   *
   * @param item The single RENDER_A2UI item to validate.
   * @param errors An optional array to collect validation error messages.
   * @param logger A logger to record validation messages to.
   * @returns `true` if valid, `false` otherwise.
   */
  validateRenderItem(
    item: unknown,
    errors: string[] | undefined,
    logger: Pick<TaggedLogger, 'error' | 'warn'>,
  ): boolean;
}

/**
 * Checks whether an object or any of its nested structures contains prototype
 * pollution properties ('__proto__', 'constructor', 'prototype') or non-standard prototypes.
 *
 * @param val The value to inspect.
 * @param maxDepth Maximum recursion depth to prevent stack overflows.
 * @returns `true` if prototype pollution is detected, `false` otherwise.
 */
export function hasPrototypePollution(val: unknown, maxDepth = 64): boolean {
  if (!val || typeof val !== 'object') {
    return false;
  }
  if (maxDepth <= 0) {
    return true;
  }
  if (Array.isArray(val)) {
    for (const item of val) {
      if (hasPrototypePollution(item, maxDepth - 1)) {
        return true;
      }
    }
    return false;
  }
  const obj = val as Record<string, unknown>;
  const proto = Object.getPrototypeOf(obj);
  if (proto !== Object.prototype && proto !== null) {
    return true;
  }
  const ownProps = Object.getOwnPropertyNames(obj);
  for (const prop of ownProps) {
    if (prop === '__proto__' || prop === 'constructor' || prop === 'prototype') {
      return true;
    }
  }
  for (const key of Object.keys(obj)) {
    const child = obj[key];
    if (child && typeof child === 'object') {
      if (hasPrototypePollution(child, maxDepth - 1)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Recursively creates a sanitized deep clone of an object or array, omitting any
 * prototype pollution keys ('__proto__', 'constructor', 'prototype').
 *
 * @param value The value to sanitize.
 * @param maxDepth Maximum recursion depth to guard against circular references.
 * @returns A sanitized copy of the input value.
 */
export function stripPrototypePollutionKeys<T>(value: T, maxDepth = 20): T {
  if (!value || typeof value !== 'object' || maxDepth <= 0) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(item => stripPrototypePollutionKeys(item, maxDepth - 1)) as unknown as T;
  }
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    result[key] = stripPrototypePollutionKeys(val, maxDepth - 1);
  }
  return result as T;
}

/**
 * Records a validation error message to the logger and errors collection.
 */
export function recordError(
  errorMsg: string,
  errors: string[] | undefined,
  logger: Pick<TaggedLogger, 'error' | 'warn'>,
): void {
  logger.error(errorMsg);
  if (errors) {
    errors.push(errorMsg);
  }
}
