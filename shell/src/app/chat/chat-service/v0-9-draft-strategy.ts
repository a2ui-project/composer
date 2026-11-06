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

import {Injectable} from '@angular/core';
import {DraftProtocolStrategy} from './draft-protocol-strategy';
import {CAR_BOOKING, BASIC_CATALOG_ID_V0_9} from './initial-draft';
import {tryParseJsonArray, formatJson} from '../../utils/json';

const REGISTER_MOCK_RULES = 'registerMockRules';
const MOCK_RULES_CONFIG = 'mockRulesConfig';
const UPDATE_COMPONENTS = 'updateComponents';
const UPDATE_DATA_MODEL = 'updateDataModel';
const COMPONENTS = 'components';
const RULES = 'rules';
const ID = 'id';
const CHILDREN = 'children';
const MOCK_RULES_CONTAINER = 'mock_rules_container';

/**
 * Draft protocol strategy implementation for A2UI v0.9 specifications.
 */
@Injectable({
  providedIn: 'root',
})
export class V09DraftStrategy implements DraftProtocolStrategy {
  readonly version = 'v0.9' as const;

  /**
   * Returns the starter showcase draft for A2UI v0.9.
   *
   * @param _catalogId Unused catalog identifier.
   * @returns The raw v0.9 CAR_BOOKING JSON string.
   */
  getStarterDraft(_catalogId?: string): string {
    return CAR_BOOKING;
  }

  /**
   * Returns a blank v0.9 surface draft template.
   *
   * @param catalogId Optional catalog identifier, defaulting to the basic catalog.
   * @param surfaceId Surface identifier for createSurface, defaulting to 'sample-surface'.
   * @returns Formatted JSON array containing a blank v0.9 createSurface message.
   */
  getBlankDraft(catalogId?: string, surfaceId = 'sample-surface'): string {
    const draftObj = [
      {
        version: 'v0.9',
        createSurface: {
          surfaceId,
          catalogId: catalogId || BASIC_CATALOG_ID_V0_9,
          sendDataModel: true,
        },
      },
    ];
    return formatJson(draftObj);
  }

  /**
   * Checks whether the given string represents an untouched v0.9 starter draft.
   *
   * @param content The layout JSON string to evaluate.
   * @returns `true` if identical to CAR_BOOKING, `false` otherwise.
   */
  isStarterDraft(content: string): boolean {
    const trimmed = content.trim();
    if (!trimmed) {
      return false;
    }
    if (trimmed === CAR_BOOKING.trim()) {
      return true;
    }
    const parsed = tryParseJsonArray(trimmed);
    if (!parsed.success) {
      return false;
    }
    const starterParsed = tryParseJsonArray(CAR_BOOKING);
    if (!starterParsed.success) {
      return false;
    }
    return JSON.stringify(parsed.data) === JSON.stringify(starterParsed.data);
  }

  /**
   * Checks whether the given string represents an untouched blank v0.9 draft.
   *
   * @param content The layout JSON string to evaluate.
   * @returns `true` if content is a blank v0.9 draft, `false` otherwise.
   */
  isBlankDraft(content: string): boolean {
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
    if (record['version'] !== 'v0.9' && record['version'] !== '0.9') {
      return false;
    }
    const cs = record['createSurface'];
    if (!cs || typeof cs !== 'object' || Array.isArray(cs)) {
      return false;
    }
    const csRecord = cs as Record<string, unknown>;
    if (typeof csRecord['surfaceId'] !== 'string') {
      return false;
    }
    // A blank v0.9 draft has no components or data model in createSurface
    if ('components' in csRecord || 'dataModel' in csRecord) {
      return false;
    }
    return true;
  }

  /**
   * Sanitizes, normalizes, and strips dangerous properties from a v0.9 layout string.
   *
   * @param value The raw layout JSON string.
   * @returns Sanitized layout JSON string.
   */
  sanitizeLayout(value: string): string {
    return sanitizeLayout(value, block => this.sanitizeBlock(block));
  }

  /**
   * Sanitizes a single top-level v0.9 message envelope block.
   *
   * @param parsed The message block object to sanitize.
   * @returns Sanitized block object or `null` if the block should be stripped.
   */
  sanitizeBlock(parsed: Record<string, unknown>): Record<string, unknown> | null {
    if (parsed[REGISTER_MOCK_RULES] || parsed[MOCK_RULES_CONFIG]) {
      return null;
    }

    const cleanedBlock: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(parsed)) {
      if (isPollutingKey(key)) {
        continue;
      }
      cleanedBlock[key] = val;
    }

    if (
      cleanedBlock[UPDATE_COMPONENTS] &&
      typeof cleanedBlock[UPDATE_COMPONENTS] === 'object' &&
      cleanedBlock[UPDATE_COMPONENTS] !== null
    ) {
      const updateComponents = {...(cleanedBlock[UPDATE_COMPONENTS] as Record<string, unknown>)};
      if (Array.isArray(updateComponents[COMPONENTS])) {
        const filtered = updateComponents[COMPONENTS].filter((comp: unknown) => {
          if (comp !== null && typeof comp === 'object' && !Array.isArray(comp)) {
            const compObj = comp as Record<string, unknown>;
            return compObj[ID] !== MOCK_RULES_CONTAINER;
          }
          return true;
        });

        updateComponents[COMPONENTS] = filtered.map((component: unknown) => {
          if (component !== null && typeof component === 'object' && !Array.isArray(component)) {
            return sanitizeComponentObject(component as Record<string, unknown>);
          }
          return component;
        });
      }
      cleanedBlock[UPDATE_COMPONENTS] = updateComponents;
    }

    if (
      cleanedBlock[UPDATE_DATA_MODEL] &&
      typeof cleanedBlock[UPDATE_DATA_MODEL] === 'object' &&
      cleanedBlock[UPDATE_DATA_MODEL] !== null
    ) {
      cleanedBlock[UPDATE_DATA_MODEL] = sanitizeGenericObject(
        cleanedBlock[UPDATE_DATA_MODEL] as Record<string, unknown>,
      );
    }

    if (Object.keys(cleanedBlock).length === 0) {
      return null;
    }

    return cleanedBlock;
  }
}

/**
 * Checks whether an object property key is a dangerous prototype pollution target.
 */
export function isPollutingKey(key: string): boolean {
  return key === '__proto__' || key === 'constructor' || key === 'prototype';
}

/**
 * Recursively cleans a generic object, stripping prototype pollution keys.
 */
export function sanitizeGenericObject(
  obj: Record<string, unknown>,
  skipKeys: readonly string[] = [],
): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (skipKeys.includes(key) || isPollutingKey(key)) {
      continue;
    }
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      cleaned[key] = sanitizeGenericObject(val as Record<string, unknown>);
    } else if (Array.isArray(val)) {
      cleaned[key] = val.map(item => {
        if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
          return sanitizeGenericObject(item as Record<string, unknown>);
        }
        return item;
      });
    } else {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

/**
 * Recursively sanitizes component declarations mapping. Strips property
 * keys matching /rules/ or prefix /^mock/i dynamically.
 */
export function sanitizeComponentObject(obj: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(obj)) {
    if (isPollutingKey(key) || key === RULES || /^mock/i.test(key)) {
      continue;
    }

    if (key === CHILDREN && Array.isArray(val)) {
      cleaned[key] = val.filter(childId => childId !== MOCK_RULES_CONTAINER);
    } else if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      cleaned[key] = sanitizeComponentObject(val as Record<string, unknown>);
    } else if (Array.isArray(val)) {
      cleaned[key] = val.map(item => {
        if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
          return sanitizeComponentObject(item as Record<string, unknown>);
        }
        return item;
      });
    } else {
      cleaned[key] = val;
    }
  }

  return cleaned;
}

const defaultV09Strategy = new V09DraftStrategy();

/**
 * Sanitizes layout string by parsing array and cleaning blocks.
 */
export function sanitizeLayout(
  value: string,
  blockSanitizer?: (block: Record<string, unknown>) => Record<string, unknown> | null,
): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const parsed = tryParseJsonArray(trimmed);
  if (!parsed.success) {
    return '';
  }

  const sanitizer = blockSanitizer ?? (block => defaultV09Strategy.sanitizeBlock(block));

  const sanitized = parsed.data
    .map(block => {
      if (block && typeof block === 'object' && !Array.isArray(block)) {
        return sanitizer(block as Record<string, unknown>);
      }
      return block;
    })
    .filter((b): b is Record<string, unknown> => b !== null);

  return sanitized.length > 0 ? JSON.stringify(sanitized) : '';
}
