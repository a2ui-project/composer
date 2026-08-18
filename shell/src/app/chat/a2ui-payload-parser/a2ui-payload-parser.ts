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

import {A2uiComponentInstance, RenderA2uiItem} from 'a2ui-bridge';
import {tryParseJsonArray} from '../../utils/json';

/**
 * Represents the result of parsing JSON Lines payload data.
 */
export declare interface ParseResult {
  blocks: unknown[];
  wasHealed: boolean;
}

/**
 * Parses and attempts to syntax-heal a string of suspected A2UI JSON Lines.
 *
 * @param content Pre-cleaned JSON or JSON Lines string (e.g., stripped of pulse indicators,
 *                thinking tags, and markdown code fences via ChatCleaner.cleanPayload).
 * @returns ParseResult containing parsed payload blocks and whether syntax healing occurred.
 * @throws Error if corrupted JSON Lines cannot be recovered or no valid blocks are parsed.
 */
export function parseAndHealJsonLines(content?: string | null): ParseResult {
  if (content == null || content.trim().length === 0) {
    return {blocks: [], wasHealed: false};
  }
  let wasHealed = false;

  // Attempt full JSON parsing before line-by-line processing
  const parsedArray = tryParseJsonArray(content);
  if (parsedArray) {
    return {blocks: parsedArray, wasHealed: false};
  }

  try {
    const parsedSingle = JSON.parse(content);
    if (Array.isArray(parsedSingle)) {
      return {blocks: parsedSingle, wasHealed};
    }
    if (parsedSingle && typeof parsedSingle === 'object') {
      return {blocks: [parsedSingle], wasHealed};
    }
  } catch {
    // Continue to line-by-line healing
  }

  const lines = content
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);
  const parsedBlocks: unknown[] = [];

  for (const line of lines) {
    // Skip Markdown code tags if they leaked, or general prompt filler
    // text lines
    if (line.startsWith('```') || (!line.startsWith('{') && !line.startsWith('['))) {
      continue;
    }

    // Syntax Healing Loop
    try {
      parsedBlocks.push(JSON.parse(line));
    } catch (err) {
      wasHealed = true;
      const healedObj = attemptSyntaxHealing(line);
      if (healedObj !== null) {
        parsedBlocks.push(healedObj);
      } else {
        // If it looks like A2UI JSON but couldn't be repaired, throw
        // validation error
        if (line.includes('"version"') || line.includes('"createSurface"')) {
          throw new Error(`Syntax recovery failed for corrupted JSON Line:\n"${line}"`);
        }
      }
    }
  }

  if (parsedBlocks.length === 0) {
    throw new Error('No valid A2UI JSON layout command block could be parsed or recovered.');
  }

  return {blocks: parsedBlocks, wasHealed};
}

/**
 * Attempts simple token-healing heuristics on a malformed JSON string.
 */
export function attemptSyntaxHealing(line?: string | null): unknown | null {
  if (line == null || line.trim().length === 0) {
    return null;
  }
  let patched = line.trim();

  // Repair 1: Strip trailing commas inside properties arrays
  patched = patched.replace(/,\s*([\]}])/g, '$1');

  // Repair 2: Auto-close braces
  try {
    return JSON.parse(patched);
  } catch (e) {
    // Loop to try appending up to 5 missing closing curly braces
    for (let i = 1; i <= 5; i++) {
      try {
        return JSON.parse(patched + '}'.repeat(i));
      } catch (_) {}
    }
    // Loop to try appending matching square brackets then curly braces
    for (let i = 1; i <= 3; i++) {
      for (let j = 1; j <= 3; j++) {
        try {
          return JSON.parse(patched + ']'.repeat(i) + '}'.repeat(j));
        } catch (_) {}
      }
    }
  }

  return null;
}

/**
 * Type guard to determine if a parsed object is a valid RenderA2uiItem.
 */
export function isRenderA2uiItem(block: unknown): block is RenderA2uiItem {
  if (!block || typeof block !== 'object') return false;
  const b = block as Record<string, unknown>;
  if (!b['updateComponents'] || typeof b['updateComponents'] !== 'object') return false;
  const uc = b['updateComponents'] as Record<string, unknown>;
  return Array.isArray(uc['components']);
}

/**
 * Validates and normalizes the parsed A2ui component payloads against the catalog schema.
 */
export function runCatalogComponentSchemaCheck(
  parsedBlocks: unknown[],
  componentsObj?: Record<string, unknown>,
): boolean {
  let healed = false;
  const componentHealMap: Record<string, string> = {};

  if (componentsObj) {
    for (const key of Object.keys(componentsObj)) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, '');
      componentHealMap[normalizedKey] = key;
    }
  }

  const SYNONYM_MAP: Record<string, string> = {
    textbox: 'textfield',
    textinput: 'textfield',
    rowlayout: 'row',
    columnlayout: 'column',
    choice: 'choicepicker',
    datepicker: 'datetimeinput',
    datetimepicker: 'datetimeinput',
  };

  for (const block of parsedBlocks) {
    if (!isRenderA2uiItem(block)) {
      continue;
    }

    const updateComponents = block.updateComponents!;
    const cleanedComponents: unknown[] = [];

    for (const comp of updateComponents.components) {
      if (!comp || typeof comp !== 'object' || Array.isArray(comp)) {
        cleanedComponents.push(comp);
        continue;
      }

      const compObj = comp as A2uiComponentInstance;
      let compType = compObj.component;

      // legacy property "name" fallback: heal to "component" key mapping
      if ((compObj['name'] as unknown) && !compObj.component) {
        healed = true;
        compType = compObj['name'] as string;
        compObj.component = compType;
        delete compObj['name'];
      }

      if (typeof compType !== 'string') {
        throw new Error('Component declaration is missing component type name string.');
      }

      let targetType = compType;

      // Schema validation (only if catalog is actively loaded with components)
      if (componentsObj) {
        if (!componentsObj[compType]) {
          // Unrecognized component type - check case-insensitive lookup!
          const normalized = compType.toLowerCase().replace(/[^a-z]/g, '');
          let healedType = componentHealMap[normalized];

          if (!healedType) {
            // If not found directly, check synonym translation dictionary
            const synonymTarget = SYNONYM_MAP[normalized];
            if (synonymTarget) {
              healedType = componentHealMap[synonymTarget];
            }
          }

          if (healedType && componentsObj[healedType]) {
            healed = true;
            targetType = healedType;
          } else {
            // Fuzzy search matches
            const fuzzyMatch = normalized
              ? Object.keys(componentsObj).find(
                  key =>
                    key.toLowerCase().includes(normalized) ||
                    normalized.includes(key.toLowerCase()),
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

      const cleanedComp = sanitizeComponentObject(compObj);
      // Restore corrected element name
      cleanedComp.component = targetType;
      cleanedComponents.push(cleanedComp);
    }

    // Commit sanitized array back in-place
    updateComponents.components = cleanedComponents as A2uiComponentInstance[];
  }
  return healed;
}

/**
 * Sanitizes data structures to produce a clean cloned copy.
 */
export function sanitizeValue(val: unknown): unknown {
  if (val === null || typeof val !== 'object') {
    return val;
  }

  if (Array.isArray(val)) {
    return val.map(item => sanitizeValue(item));
  }

  const obj = val as Record<string, unknown>;
  const cleaned: Record<string, unknown> = {};

  for (const [key, propVal] of Object.entries(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    cleaned[key] = sanitizeValue(propVal);
  }

  return cleaned;
}

/**
 * Wraps sanitizeValue to ensure the returned object operates strictly as an A2uiComponentInstance.
 */
export function sanitizeComponentObject(obj: A2uiComponentInstance): A2uiComponentInstance {
  return sanitizeValue(obj) as A2uiComponentInstance;
}
