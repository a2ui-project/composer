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

import {stripPrototypePollutionKeys} from '../../shell/cross-frame-validator/wire-version-validator';
import type {CatalogComponentSchema} from '../../storage/models/catalog-storage.model';

/**
 * Common typo and synonym mappings across A2UI catalogs.
 */
export const SYNONYM_MAP: Readonly<Record<string, string>> = {
  textbox: 'textfield',
  textinput: 'textfield',
  rowlayout: 'row',
  columnlayout: 'column',
  choice: 'choicepicker',
  datepicker: 'datetimeinput',
  datetimepicker: 'datetimeinput',
};

/**
 * Constructs a normalized lookup map (lowercase without non-alpha characters)
 * mapping normalized component names to canonical catalog component keys.
 *
 * @param componentsObj - The component dictionary to build index mappings from.
 * @returns Map of sanitized component names to canonical catalog component names.
 */
export function buildComponentHealMap(
  componentsObj?: Record<string, unknown> | {[key: string]: CatalogComponentSchema},
): Record<string, string> {
  const componentHealMap: Record<string, string> = {};
  if (componentsObj) {
    for (const key of Object.keys(componentsObj)) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, '');
      componentHealMap[normalizedKey] = key;
    }
  }
  return componentHealMap;
}

/**
 * Result returned when validating or healing an individual component instance.
 */
export declare interface HealComponentResult {
  /** Whether the component instance was modified during healing. */
  healed: boolean;
  /** The validated and sanitized component payload. */
  component: unknown;
}

/**
 * Validates and heals a single component instance against catalog components and synonyms.
 *
 * @param comp - The candidate component instance to heal.
 * @param componentsObj - Optional dictionary of recognized catalog components.
 * @param componentHealMap - Precomputed normalized name lookup index.
 * @returns Result object indicating whether modifications occurred and the healed component.
 */
export function healComponentInstance(
  comp: unknown,
  componentsObj?: Record<string, unknown> | {[key: string]: CatalogComponentSchema},
  componentHealMap?: Record<string, string>,
): HealComponentResult {
  if (!comp || typeof comp !== 'object' || Array.isArray(comp)) {
    return {healed: false, component: comp};
  }

  let healed = false;
  const compObj = stripPrototypePollutionKeys(comp) as Record<string, unknown>;
  let compType = compObj['component'];

  if (compObj['name'] && !compObj['component']) {
    healed = true;
    compType = compObj['name'];
    compObj['component'] = compType;
    delete compObj['name'];
  }

  if (typeof compType !== 'string') {
    throw new Error('Component declaration is missing component type name string.');
  }

  let targetType = compType;

  if (componentsObj) {
    if (!componentsObj[compType]) {
      const healMap = componentHealMap ?? buildComponentHealMap(componentsObj);
      const normalized = compType.toLowerCase().replace(/[^a-z]/g, '');
      let healedType = healMap[normalized];

      if (!healedType) {
        const synonymTarget = SYNONYM_MAP[normalized];
        if (synonymTarget) {
          healedType = healMap[synonymTarget];
        }
      }

      if (healedType && componentsObj[healedType]) {
        healed = true;
        targetType = healedType;
      } else {
        const fuzzyMatch = normalized
          ? Object.keys(componentsObj).find(
              key =>
                key.toLowerCase().includes(normalized) || normalized.includes(key.toLowerCase()),
            )
          : undefined;

        if (fuzzyMatch) {
          healed = true;
          targetType = fuzzyMatch;
        } else {
          throw new Error(
            `Validation failure: Component type "${compType}" is not registered in the active custom catalog.`,
          );
        }
      }
    }
  }

  compObj['component'] = targetType;
  return {healed, component: compObj};
}

/**
 * Result returned when validating or healing an array of components.
 */
export declare interface HealComponentListResult {
  /** Whether any component within the list was modified during healing. */
  healed: boolean;
  /** The collection of healed and sanitized component instances. */
  components: unknown[];
}

/**
 * Validates and heals an array of components against catalog schemas.
 *
 * @param components - Array of component instances to validate and heal.
 * @param componentsObj - Optional dictionary of recognized catalog components.
 * @param componentHealMap - Precomputed normalized name lookup index.
 * @returns Result object containing the list of components and any modification flag.
 */
export function healComponentList(
  components: unknown[],
  componentsObj?: Record<string, unknown> | {[key: string]: CatalogComponentSchema},
  componentHealMap?: Record<string, string>,
): HealComponentListResult {
  let anyHealed = false;
  const healMap = componentHealMap ?? buildComponentHealMap(componentsObj);
  const cleanedComponents: unknown[] = [];

  for (const comp of components) {
    const result = healComponentInstance(comp, componentsObj, healMap);
    if (result.healed) {
      anyHealed = true;
    }
    cleanedComponents.push(result.component);
  }

  return {healed: anyHealed, components: cleanedComponents};
}
