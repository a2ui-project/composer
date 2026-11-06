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
import {CAR_BOOKING, CAR_BOOKING_V1_0} from './initial-draft';
import {tryParseJsonArray} from '../../utils/json';

/**
 * Strategy interface defining draft generation, detection, and sanitization
 * operations scoped to a specific A2UI protocol version.
 */
export interface DraftProtocolStrategy {
  /** The protocol version governed by this strategy. */
  readonly version: A2uiProtocolVersion;

  /** Returns the initial showcase/starter draft for this protocol version. */
  getStarterDraft(catalogId?: string): string;

  /** Returns a blank surface canvas template for this protocol version. */
  getBlankDraft(catalogId?: string, surfaceId?: string): string;

  /** Checks if the content matches an untouched starter draft of this version. */
  isStarterDraft(content: string): boolean;

  /** Checks if the content matches an untouched blank draft template of this version. */
  isBlankDraft(content: string): boolean;

  /**
   * Sanitizes, normalizes, and strips dangerous properties (e.g. __proto__,
   * constructor, prototype, mock rules) from a layout JSON string.
   */
  sanitizeLayout(value: string): string;
}

/**
 * Checks whether the given JSON content represents an untouched starter draft
 * of any supported protocol version (CAR_BOOKING v0.9 or CAR_BOOKING_V1_0 v1.0).
 *
 * @param content The JSON layout string to inspect.
 * @returns `true` if content is an untouched starter draft, `false` otherwise.
 */
export function isUntouchedStarterDraft(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed) {
    return false;
  }
  if (trimmed === CAR_BOOKING.trim() || trimmed === CAR_BOOKING_V1_0.trim()) {
    return true;
  }
  const parsed = tryParseJsonArray(trimmed);
  if (!parsed.success) {
    return false;
  }
  const pStr = JSON.stringify(parsed.data);
  const v09Parsed = tryParseJsonArray(CAR_BOOKING);
  if (v09Parsed.success && JSON.stringify(v09Parsed.data) === pStr) {
    return true;
  }
  const v10Parsed = tryParseJsonArray(CAR_BOOKING_V1_0);
  if (v10Parsed.success && JSON.stringify(v10Parsed.data) === pStr) {
    return true;
  }
  return false;
}

/**
 * Checks whether the given JSON content represents an untouched blank surface draft
 * template of any supported protocol version.
 *
 * @param content The JSON layout string to inspect.
 * @returns `true` if content is an untouched blank draft, `false` otherwise.
 */
export function isUntouchedBlankDraft(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed) {
    return false;
  }
  const parsed = tryParseJsonArray(trimmed);
  if (!parsed.success || parsed.data.length !== 1) {
    return false;
  }
  const block = parsed.data[0];
  if (!block || typeof block !== 'object' || Array.isArray(block)) {
    return false;
  }
  const record = block as Record<string, unknown>;
  const cs = record['createSurface'];
  if (!cs || typeof cs !== 'object' || Array.isArray(cs)) {
    return false;
  }
  const csRecord = cs as Record<string, unknown>;
  if (typeof csRecord['surfaceId'] !== 'string') {
    return false;
  }
  if (Array.isArray(csRecord['components']) && csRecord['components'].length > 0) {
    return false;
  }
  if (
    csRecord['dataModel'] &&
    typeof csRecord['dataModel'] === 'object' &&
    Object.keys(csRecord['dataModel']).length > 0
  ) {
    return false;
  }
  return true;
}
