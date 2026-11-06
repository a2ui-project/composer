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
import {A2uiComponentInstance, RenderA2uiItem, type A2uiProtocolVersion} from 'a2ui-bridge';
import {extractErrorDetails, tryParseJsonArray} from '../../utils/json';
import {stripPrototypePollutionKeys} from '../../shell/cross-frame-validator/wire-version-validator';
import type {CatalogJson} from '../../storage/models/catalog-storage.model';
import type {PayloadProtocolStrategy} from './payload-protocol-strategy';
import {V09PayloadStrategy} from './v0-9-payload-strategy';
import {V10PayloadStrategy} from './v1-0-payload-strategy';
import {attemptSyntaxHealing} from './json-stream-healer';

/**
 * Resolves a protocol strategy instance from an existing strategy or version string.
 *
 * @param strategyOrVersion - Existing strategy instance or protocol version string.
 * @returns An initialized PayloadProtocolStrategy.
 */
export function getPayloadStrategy(
  strategyOrVersion?: PayloadProtocolStrategy | A2uiProtocolVersion | string,
): PayloadProtocolStrategy {
  if (
    strategyOrVersion &&
    typeof strategyOrVersion === 'object' &&
    'version' in strategyOrVersion
  ) {
    return strategyOrVersion;
  }
  if (strategyOrVersion === 'v1.0' || strategyOrVersion === '1.0') {
    return new V10PayloadStrategy();
  }
  return new V09PayloadStrategy();
}

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
 * @param strategyOrVersion - Optional protocol strategy or version discriminator.
 * @returns A structured classification of the payload's content intent and correctness.
 */
export function parseAndHealJsonLines(
  content?: string | null,
  strategyOrVersion?: PayloadProtocolStrategy | A2uiProtocolVersion | string,
): ParseResult {
  if (content == null || content.trim().length === 0) {
    return {success: true, isConversational: true, blocks: [], count: 0};
  }

  const strategy = strategyOrVersion
    ? getPayloadStrategy(strategyOrVersion)
    : /"version"\s*:\s*["'](?:1\.0|v1\.0)["']/i.test(content) ||
        /specification\/v1_0/i.test(content)
      ? getPayloadStrategy('v1.0')
      : getPayloadStrategy('v0.9');

  const parsedArray = tryParseJsonArray(content);
  if (parsedArray.success) {
    const blocks = strategy.normalizeBlocks(parsedArray.data as RenderA2uiItem[]);
    return {
      success: true,
      isConversational: false,
      blocks: blocks as RenderA2uiItem[],
      count: strategy.resolveComponentCount(blocks),
    };
  }

  const trimmed = content.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    const healed = attemptSyntaxHealing(content);
    if (healed !== null && typeof healed === 'object') {
      const rawBlocks = (Array.isArray(healed) ? healed : [healed]) as RenderA2uiItem[];
      const blocks = strategy.normalizeBlocks(rawBlocks) as RenderA2uiItem[];
      return {
        success: true,
        isConversational: false,
        blocks: blocks as RenderA2uiItem[],
        count: strategy.resolveComponentCount(blocks),
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

  const blocks = strategy.normalizeBlocks(parsedBlocks) as RenderA2uiItem[];
  return {
    success: true,
    isConversational: false,
    blocks: blocks as RenderA2uiItem[],
    count: strategy.resolveComponentCount(blocks),
  };
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
 * @param componentsOrCatalog - Optional dictionary of recognized catalog components or full catalog.
 * @param strategyOrVersion - Optional protocol strategy or version discriminator.
 * @param catalogObj - Optional secondary catalog object.
 * @returns True if any component type or property was healed in-place.
 */
export function runCatalogComponentSchemaCheck(
  parsedBlocks: unknown[],
  componentsOrCatalog?: Record<string, unknown> | CatalogJson,
  strategyOrVersion: PayloadProtocolStrategy | A2uiProtocolVersion | string = 'v0.9',
  catalogObj?: Record<string, unknown> | CatalogJson,
): boolean {
  const strategy = getPayloadStrategy(strategyOrVersion);
  return strategy.runCatalogComponentSchemaCheck(parsedBlocks, componentsOrCatalog, catalogObj);
}

/**
 * Recursively strips potentially dangerous object prototype properties (__proto__, constructor, prototype).
 *
 * @param val - The raw object or value to sanitize.
 * @returns A safe clone of the value without prototype pollution keys.
 */
export function sanitizeValue(val: unknown): unknown {
  return stripPrototypePollutionKeys(val);
}

/**
 * Sanitizes an A2UI component instance by recursively removing prototype pollution keys.
 *
 * @param obj - The component instance to sanitize.
 * @returns A clean A2uiComponentInstance.
 */
export function sanitizeComponentObject(obj: A2uiComponentInstance): A2uiComponentInstance {
  return stripPrototypePollutionKeys(obj) as A2uiComponentInstance;
}

/**
 * Namespace class providing unified access to payload strategies and parsers.
 */
export class A2uiPayloadParser {
  static getStrategy(
    strategyOrVersion?: PayloadProtocolStrategy | A2uiProtocolVersion | string,
  ): PayloadProtocolStrategy {
    return getPayloadStrategy(strategyOrVersion);
  }

  static parseAndHealJsonLines = parseAndHealJsonLines;
  static runCatalogComponentSchemaCheck = runCatalogComponentSchemaCheck;
  static attemptSyntaxHealing = attemptSyntaxHealing;
  static isRenderA2uiItem = isRenderA2uiItem;
  static sanitizeValue = sanitizeValue;
  static sanitizeComponentObject = sanitizeComponentObject;
}
