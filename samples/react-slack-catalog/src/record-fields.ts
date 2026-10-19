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

/**
 * @fileoverview Reads fields from values whose shape TypeScript doesn't know,
 * such as bound A2UI props and `@copilotkit/channels-ui` node props. Each
 * reader returns an empty or `undefined` result when the field is missing or
 * has another type.
 */

/** The array in `value[field]`, or an empty array. */
export function arrayField(value: unknown, field: string): unknown[] {
  const fieldValue = recordField(value, field);
  return Array.isArray(fieldValue) ? fieldValue : [];
}

/** The string in `value[field]`, or `undefined`. */
export function stringField(value: unknown, field: string): string | undefined {
  const fieldValue = recordField(value, field);
  return typeof fieldValue === 'string' ? fieldValue : undefined;
}

/** `value[field]` when `value` is an object, or `undefined`. */
export function recordField(value: unknown, field: string): unknown {
  return isRecord(value) ? value[field] : undefined;
}

/** Whether `value` is a non-null object, whose fields can be read by name. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
