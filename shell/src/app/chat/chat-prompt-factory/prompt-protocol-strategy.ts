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
import {Catalog, CatalogJson} from '../../storage/models/catalog-storage.model';
import {McpServerConfig} from '../../mcp/mcp-client-manager.service';

/**
 * Configuration options provided to prompt strategies when constructing system prompts.
 */
export declare interface PromptStrategyOptions {
  /** The primary active catalog schema, if available. */
  activeCatalog?: Catalog | CatalogJson | null;
  /** Active catalogs when multi-catalog support is enabled. */
  activeCatalogs?: readonly (Catalog | CatalogJson)[];
  /** Currently connected MCP servers with their available tools. */
  activeServers?: readonly McpServerConfig[];
  /** Optional custom system prompt instructions defined by the user. */
  customInstructions?: string;
  /** Whether to append multimodal image-to-UI guidelines to the prompt. */
  includeMultimodalGuidelines?: boolean;
}

/**
 * Strategy interface encapsulating protocol-specific prompt generation for Copilot and LLM interactions.
 */
export declare interface PromptProtocolStrategy {
  /** Protocol version supported by this strategy (e.g. 'v0.9' or 'v1.0'). */
  readonly protocolVersion: A2uiProtocolVersion;

  /**
   * Constructs the full system prompt tailored to the protocol version, active catalog schemas,
   * available MCP tools, and optional multimodal guidelines.
   *
   * @param options Configuration options including catalogs, MCP servers, and custom rules.
   * @returns Complete system prompt string ready for LLM consumption.
   */
  buildSystemPrompt(options: PromptStrategyOptions): string;
}

const FORBIDDEN_PROPERTIES = new Set(['returnType', '__proto__', 'constructor', 'prototype']);

/**
 * Recursively strips prototype-pollution keys (`__proto__`, `constructor`, `prototype`)
 * and v0.9-specific metadata fields like `returnType` from schemas and nested objects.
 *
 * @param value The value, object, or array to sanitize recursively.
 * @returns The sanitized copy of the value without forbidden properties.
 */
export function stripReturnTypeDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(stripReturnTypeDeep) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const key of Object.getOwnPropertyNames(value)) {
      if (FORBIDDEN_PROPERTIES.has(key)) {
        continue;
      }
      result[key] = stripReturnTypeDeep((value as Record<string, unknown>)[key]);
    }
    return result as unknown as T;
  }
  return value;
}
