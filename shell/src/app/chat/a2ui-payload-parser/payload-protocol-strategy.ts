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
import type {CatalogJson} from '../../storage/models/catalog-storage.model';
import type {TaggedLogger} from '../../debug/error-logger.service';

/**
 * Common contract for protocol-specific A2UI payload parsing, healing,
 * component counting, schema validation, and prototype pollution sanitization.
 */
export declare interface PayloadProtocolStrategy {
  /** Internal protocol discriminator ('v0.9' | 'v1.0'). */
  readonly version: A2uiProtocolVersion;
  /** Canonical wire message version string ('v0.9' | '1.0'). */
  readonly canonicalWireVersion: string;

  /**
   * Resolves the component count across parsed command blocks according to protocol rules.
   *
   * @param blocks - The parsed JSON command blocks to inspect.
   * @returns Total number of declared UI components.
   */
  resolveComponentCount(blocks: unknown[]): number;

  /**
   * Normalizes and heals wire message envelopes:
   * - Enforces canonical wire version string on A2UI command envelopes.
   * - Strips prototype pollution recursively.
   *
   * @param blocks - Raw command blocks to normalize.
   * @returns Normalized array of sanitized command blocks.
   */
  normalizeBlocks(blocks: unknown[]): unknown[];

  /**
   * Inspects parsed A2UI blocks against the catalog component schema,
   * healing casing, synonym deviations, and property misnamings.
   *
   * @param parsedBlocks - Parsed command blocks to inspect and mutate in-place.
   * @param componentsOrCatalog - Active component registry or full catalog object.
   * @param catalogObj - Secondary catalog object for multi-catalog fallback resolution.
   * @returns True if any component was modified during schema verification.
   */
  runCatalogComponentSchemaCheck(
    parsedBlocks: unknown[],
    componentsOrCatalog?: Record<string, unknown> | CatalogJson,
    catalogObj?: Record<string, unknown> | CatalogJson,
  ): boolean;

  /**
   * Recursively strips prototype-pollution keys ('__proto__', 'constructor', 'prototype').
   *
   * @param payload - Value or object graph to sanitize.
   * @returns Sanitized clone free of forbidden prototype keys.
   */
  sanitizePayload<T>(payload: T): T;

  /**
   * Validates outgoing message envelope structures against protocol wire contracts.
   *
   * @param blocks - Array of message blocks to validate.
   * @param errors - Optional array to collect error descriptions.
   * @param logger - Optional tagged logger for error diagnostics.
   * @returns True if all blocks conform to the wire protocol.
   */
  validateOutgoingBlocks(
    blocks: unknown[],
    errors?: string[],
    logger?: Pick<TaggedLogger, 'error' | 'warn'>,
  ): boolean;
}
