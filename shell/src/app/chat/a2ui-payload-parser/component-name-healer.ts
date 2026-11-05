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
import {extractErrorDetails, tryParseJsonArray} from '../../utils/json';

/**
 * The standardized output structure for JSON Lines payload parsing.
 * Supports disjoint outcomes between purely conversational text, strict structural updates,
 * and syntax failures.
 */
export declare interface SuccessConversationalParseResult {
  readonly success: true;
  readonly isConversational: true;
  readonly blocks: [];
  readonly count: 0;
}

export declare interface SuccessRenderParseResult {
  readonly success: true;
  readonly isConversational: false;
  readonly blocks: RenderA2uiItem[];
  readonly count: number;
}

export declare interface FailureParseResult {
  readonly success: false;
  readonly error: string;
  readonly line?: number;
  readonly column?: number;
  readonly snippet?: string;
}

export type ParseResult =
  SuccessConversationalParseResult | SuccessRenderParseResult | FailureParseResult;

/**
 * Determines whether raw LLM output contains valid A2UI JSON Lines format.
 * Applies heuristic layout-recovery algorithms (trailing bracket injection, comma stripping)
 * to heal interrupted streaming payloads or minor LLM formatting deviances.
 *
 * @param content - The raw, unformatted LLM generation text buffer.
 * @returns A structured classification of the payload's content intent and correctness.
 */
export function parseAndHealJsonLines(content?: string | null): ParseResult {
  if (content == null || content.trim().length === 0) {
    return {success: true, isConversational: true, blocks: [], count: 0};
  }

  const parsedArray = tryParseJsonArray(content);
  if (parsedArray.success) {
    return {
      success: true,
      isConversational: false,
      blocks: parsedArray.data as RenderA2uiItem[],
      count: resolveComponentCount(parsedArray.data as RenderA2uiItem[]),
    };
  }

  const trimmed = content.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    const healed = attemptSyntaxHealing(content);
    if (healed !== null && typeof healed === 'object') {
      const blocks = (Array.isArray(healed) ? healed : [healed]) as RenderA2uiItem[];
      return {
        success: true,
        isConversational: false,
        blocks,
        count: resolveComponentCount(blocks),
      };
    }
  }

  const rawLines = content.split('\n');
  const lines = rawLines
    .map((text, i) => ({text: (text || '').trim(), originalIndex: i}))
    .filter(l => l.text.length > 0);

  const parsedBlocks: unknown[] = [];
  let looksLikeA2ui = false;
  let firstError: FailureParseResult | null = null;

  for (const line of lines) {
    if (line.text.startsWith('```') || (!line.text.startsWith('{') && !line.text.startsWith('['))) {
      continue;
    }
    looksLikeA2ui = true;

    try {
      parsedBlocks.push(JSON.parse(line.text));
    } catch (err) {
      const healedObj = attemptSyntaxHealing(line.text);
      if (healedObj !== null) {
        parsedBlocks.push(healedObj);
      } else {
        if (!firstError) {
          const errDetails = extractErrorDetails(err as Error, line.text);
          firstError = {
            success: false,
            error: (err as Error)?.message ?? 'Syntax recovery failed',
            line: line.originalIndex + 1,
            column: errDetails.column,
            snippet: line.text,
          };
        }
      }
    }
  }

  if (parsedBlocks.length === 0) {
    if (firstError) {
      return firstError;
    }
    if (looksLikeA2ui) {
      const errDetails = parsedArray.error;
      return {
        success: false,
        error: errDetails?.message ?? 'Syntax recovery failed',
        line: errDetails?.line,
        column: errDetails?.column,
        snippet: errDetails?.snippet,
      };
    }
    return {success: true, isConversational: true, blocks: [], count: 0};
  }

  return {
    success: true,
    isConversational: false,
    blocks: parsedBlocks as RenderA2uiItem[],
    count: resolveComponentCount(parsedBlocks as RenderA2uiItem[]),
  };
}

/**
 * Attempts syntax healing on malformed or truncated JSON strings produced by LLMs.
 * Strips trailing commas and injects balanced closing brackets and braces.
 *
 * @param line - The raw string representation to heal.
 * @returns The parsed JSON object if healed successfully, or null if unrecoverable.
 */
export function attemptSyntaxHealing(line?: string | null): unknown | null {
  if (line == null || line.trim().length === 0) {
    return null;
  }
  let patched = line.trim();

  // Guard against excessive payloads to prevent combinatorial parsing overhead
  if (patched.length > 256 * 1024) {
    return null;
  }

  patched = patched.replace(/,\s*([\]}])/g, '$1');

  try {
    return JSON.parse(patched);
  } catch (e) {
    // 1. Try closing open objects (e.g. truncated inner properties)
    for (let i = 1; i <= 5; i++) {
      try {
        return JSON.parse(patched + '}'.repeat(i));
      } catch (_) {}
    }
    // 2. Try closing objects nested within arrays (curly braces followed by square brackets)
    for (let i = 1; i <= 3; i++) {
      for (let j = 1; j <= 3; j++) {
        try {
          return JSON.parse(patched + '}'.repeat(i) + ']'.repeat(j));
        } catch (_) {}
      }
    }
    // 3. Try closing arrays nested within objects (square brackets followed by curly braces)
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
 * Type guard verifying if an item is a valid RenderA2uiItem with updateComponents.
 *
 * @param block - The candidate payload to validate.
 * @returns True if the block matches RenderA2uiItem structure.
 */
export function isRenderA2uiItem(block: unknown): block is RenderA2uiItem {
  if (!block || typeof block !== 'object') return false;
  const b = block as Record<string, unknown>;
  if (!b['updateComponents'] || typeof b['updateComponents'] !== 'object') return false;
  const uc = b['updateComponents'] as Record<string, unknown>;
  return Array.isArray(uc['components']);
}

/**
 * Inspects parsed A2UI blocks against the catalog schema, healing casing and synonym deviations.
 *
 * @param parsedBlocks - The list of parsed A2UI command blocks.
 * @param componentsObj - Optional dictionary of recognized catalog components.
 * @returns True if any component type or property was healed in-place.
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

      if (componentsObj) {
        if (!componentsObj[compType]) {
          const normalized = compType.toLowerCase().replace(/[^a-z]/g, '');
          let healedType = componentHealMap[normalized];

          if (!healedType) {
            const synonymTarget = SYNONYM_MAP[normalized];
            if (synonymTarget) {
              healedType = componentHealMap[synonymTarget];
            }
          }

          if (healedType && componentsObj[healedType]) {
            healed = true;
            targetType = healedType;
          } else {
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
      cleanedComp.component = targetType;
      cleanedComponents.push(cleanedComp);
    }
    updateComponents.components = cleanedComponents as A2uiComponentInstance[];
  }
  return healed;
}

/**
 * Recursively strips potentially dangerous object prototype properties (__proto__, constructor, prototype).
 *
 * @param val - The raw object or value to sanitize.
 * @returns A safe clone of the value without prototype pollution keys.
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
 * Sanitizes an A2UI component instance by recursively removing prototype pollution keys.
 *
 * @param obj - The component instance to sanitize.
 * @returns A clean A2uiComponentInstance.
 */
export function sanitizeComponentObject(obj: A2uiComponentInstance): A2uiComponentInstance {
  return sanitizeValue(obj) as A2uiComponentInstance;
}

function resolveComponentCount(blocks: RenderA2uiItem[]): number {
  return blocks.reduce((acc, obj) => {
    if (!obj || typeof obj !== 'object') return acc;
    if (obj.updateComponents && Array.isArray(obj.updateComponents.components)) {
      return acc + obj.updateComponents.components.length;
    }
    if (obj.createSurface) return acc + 1;
    return acc;
  }, 0);
}
