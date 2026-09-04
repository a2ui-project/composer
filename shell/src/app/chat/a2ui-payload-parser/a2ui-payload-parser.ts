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
    return {
      success: false,
      error: 'No valid A2UI JSON layout command block could be parsed or recovered.',
    };
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

  const lines = content
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const parsedBlocks: unknown[] = [];
  let looksLikeA2ui = false;

  for (const line of lines) {
    if (line.startsWith('```') || (!line.startsWith('{') && !line.startsWith('['))) {
      continue;
    }
    looksLikeA2ui = true;

    try {
      parsedBlocks.push(JSON.parse(line));
    } catch (err) {
      const healedObj = attemptSyntaxHealing(line);
      if (healedObj !== null) {
        parsedBlocks.push(healedObj);
      } else {
        const errDetails = parsedArray.error;
        return {
          success: false,
          error: errDetails?.message ?? 'Syntax recovery failed',
          line: errDetails?.line,
          column: errDetails?.column,
          snippet: errDetails?.snippet,
        };
      }
    }
  }

  if (parsedBlocks.length === 0) {
    if (looksLikeA2ui || content.includes('"version"') || content.includes('"createSurface"')) {
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

export function attemptSyntaxHealing(line?: string | null): unknown | null {
  if (line == null || line.trim().length === 0) {
    return null;
  }
  let patched = line.trim();

  patched = patched.replace(/,\s*([\]}])/g, '$1');

  try {
    return JSON.parse(patched);
  } catch (e) {
    for (let i = 1; i <= 5; i++) {
      try {
        return JSON.parse(patched + '}'.repeat(i));
      } catch (_) {}
    }
    for (let i = 1; i <= 3; i++) {
      for (let j = 1; j <= 3; j++) {
        try {
          return JSON.parse(patched + '}'.repeat(i) + ']'.repeat(j));
        } catch (_) {}
      }
    }
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

export function isRenderA2uiItem(block: unknown): block is RenderA2uiItem {
  if (!block || typeof block !== 'object') return false;
  const b = block as Record<string, unknown>;
  if (!b['updateComponents'] || typeof b['updateComponents'] !== 'object') return false;
  const uc = b['updateComponents'] as Record<string, unknown>;
  return Array.isArray(uc['components']);
}

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
