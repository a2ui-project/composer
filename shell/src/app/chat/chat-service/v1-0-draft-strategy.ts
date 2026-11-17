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
import {
  isPollutingKey,
  sanitizeGenericObject,
  sanitizeComponentObject,
  sanitizeLayout,
} from './v0-9-draft-strategy';
import {CAR_BOOKING_V1_0, BASIC_CATALOG_ID_V1_0} from './initial-draft';
import {tryParseJsonArray, formatJson} from '../../utils/json';

const REGISTER_MOCK_RULES = 'registerMockRules';
const MOCK_RULES_CONFIG = 'mockRulesConfig';
const CREATE_SURFACE = 'createSurface';
const UPDATE_COMPONENTS = 'updateComponents';
const UPDATE_DATA_MODEL = 'updateDataModel';
const COMPONENTS = 'components';
const DATA_MODEL = 'dataModel';
const ID = 'id';
const MOCK_RULES_CONTAINER = 'mock_rules_container';

/**
 * Draft protocol strategy implementation for A2UI v1.0 protocol specifications.
 */
@Injectable({
  providedIn: 'root',
})
export class V10DraftStrategy implements DraftProtocolStrategy {
  readonly version = 'v1.0' as const;

  /**
   * Returns the starter showcase draft for A2UI v1.0.
   *
   * @param _catalogId Unused catalog identifier.
   * @returns The raw v1.0 CAR_BOOKING_V1_0 JSON string.
   */
  getStarterDraft(_catalogId?: string): string {
    return CAR_BOOKING_V1_0;
  }

  /**
   * Returns a blank v1.0 surface draft template.
   *
   * @param catalogId Optional catalog identifier, defaulting to the basic catalog.
   * @param surfaceId Surface identifier for createSurface, defaulting to 'sample-surface'.
   * @returns Formatted JSON array containing a blank v1.0 createSurface message.
   */
  getBlankDraft(catalogId?: string, surfaceId = 'sample-surface'): string {
    const draftObj = [
      {
        version: '1.0',
        createSurface: {
          surfaceId,
          catalogId: catalogId || BASIC_CATALOG_ID_V1_0,
        },
      },
    ];
    return formatJson(draftObj);
  }

  /**
   * Checks whether the given string represents an untouched v1.0 starter draft.
   *
   * @param content The layout JSON string to evaluate.
   * @returns `true` if identical to CAR_BOOKING_V1_0 (modulo version normalization), `false` otherwise.
   */
  isStarterDraft(content: string): boolean {
    const trimmed = content.trim();
    if (!trimmed) {
      return false;
    }
    if (trimmed === CAR_BOOKING_V1_0.trim()) {
      return true;
    }
    const parsed = tryParseJsonArray(trimmed);
    if (!parsed.success) {
      return false;
    }
    const starterParsed = tryParseJsonArray(CAR_BOOKING_V1_0);
    if (!starterParsed.success) {
      return false;
    }
    const normalizeVersion = (arr: unknown[]) =>
      arr.map(item => {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          const rec = {...(item as Record<string, unknown>)};
          if (rec['version'] === 'v1.0' || rec['version'] === '1.0') {
            rec['version'] = '1.0';
          }
          return rec;
        }
        return item;
      });
    return (
      JSON.stringify(normalizeVersion(parsed.data)) ===
      JSON.stringify(normalizeVersion(starterParsed.data))
    );
  }

  /**
   * Checks whether the given string represents an untouched blank v1.0 draft.
   *
   * @param content The layout JSON string to evaluate.
   * @returns `true` if content is a blank v1.0 draft, `false` otherwise.
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
    if (record['version'] !== 'v1.0' && record['version'] !== '1.0') {
      return false;
    }
    const cs = record[CREATE_SURFACE];
    if (!cs || typeof cs !== 'object' || Array.isArray(cs)) {
      return false;
    }
    const csRecord = cs as Record<string, unknown>;
    if (typeof csRecord['surfaceId'] !== 'string') {
      return false;
    }
    if (Array.isArray(csRecord[COMPONENTS]) && csRecord[COMPONENTS].length > 0) {
      return false;
    }
    if (
      csRecord[DATA_MODEL] &&
      typeof csRecord[DATA_MODEL] === 'object' &&
      Object.keys(csRecord[DATA_MODEL]).length > 0
    ) {
      return false;
    }
    return true;
  }

  /**
   * Sanitizes, normalizes, and strips dangerous properties from a v1.0 layout string.
   *
   * @param value The raw layout JSON string.
   * @returns Sanitized layout JSON string.
   */
  sanitizeLayout(value: string): string {
    return sanitizeLayout(value, block => this.sanitizeBlock(block));
  }

  private sanitizeBlock(parsed: Record<string, unknown>): Record<string, unknown> | null {
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
      cleanedBlock[CREATE_SURFACE] &&
      typeof cleanedBlock[CREATE_SURFACE] === 'object' &&
      cleanedBlock[CREATE_SURFACE] !== null
    ) {
      const createSurface = {...(cleanedBlock[CREATE_SURFACE] as Record<string, unknown>)};
      const components = Array.isArray(createSurface[COMPONENTS])
        ? this.sanitizeComponentsList(createSurface[COMPONENTS])
        : undefined;
      const dataModel =
        createSurface[DATA_MODEL] &&
        typeof createSurface[DATA_MODEL] === 'object' &&
        createSurface[DATA_MODEL] !== null
          ? sanitizeGenericObject(createSurface[DATA_MODEL] as Record<string, unknown>)
          : undefined;

      const sanitizedSurface = sanitizeGenericObject(createSurface, [COMPONENTS, DATA_MODEL]);
      if (components !== undefined) {
        sanitizedSurface[COMPONENTS] = components;
      }
      if (dataModel !== undefined) {
        sanitizedSurface[DATA_MODEL] = dataModel;
      }
      cleanedBlock[CREATE_SURFACE] = sanitizedSurface;
    }

    if (
      cleanedBlock[UPDATE_COMPONENTS] &&
      typeof cleanedBlock[UPDATE_COMPONENTS] === 'object' &&
      cleanedBlock[UPDATE_COMPONENTS] !== null
    ) {
      const updateComponents = {...(cleanedBlock[UPDATE_COMPONENTS] as Record<string, unknown>)};
      const components = Array.isArray(updateComponents[COMPONENTS])
        ? this.sanitizeComponentsList(updateComponents[COMPONENTS])
        : undefined;
      const sanitizedUpdate = sanitizeGenericObject(updateComponents, [COMPONENTS]);
      if (components !== undefined) {
        sanitizedUpdate[COMPONENTS] = components;
      }
      cleanedBlock[UPDATE_COMPONENTS] = sanitizedUpdate;
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

  private sanitizeComponentsList(components: unknown[]): unknown[] {
    const filtered = components.filter((comp: unknown) => {
      if (comp !== null && typeof comp === 'object' && !Array.isArray(comp)) {
        const compObj = comp as Record<string, unknown>;
        return compObj[ID] !== MOCK_RULES_CONTAINER;
      }
      return true;
    });

    return filtered.map((component: unknown) => {
      if (component !== null && typeof component === 'object' && !Array.isArray(component)) {
        return sanitizeComponentObject(component as Record<string, unknown>);
      }
      return component;
    });
  }
}
