/*
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * TODO: Replace this module with `@a2ui/mcp-catalog/v0_9` once published to NPM.
 * See README.md in this directory for details and the migration plan.
 */

import type {FunctionImplementation} from '@a2ui/web_core/v0_9';
import {
  createCallMcpToolImplementation,
  type McpClientResolver,
  type McpMessageProcessor,
} from './functions/callMcpTool.js';
import type {FunctionApiDefinition} from './functions/common.js';
import {JmespathApi, JmespathImplementation} from './functions/jmespath.js';
import {RegexCaptureApi, RegexCaptureImplementation} from './functions/regexCapture.js';
import {RegexReplaceApi, RegexReplaceImplementation} from './functions/regexReplace.js';
import {SplitApi, SplitImplementation} from './functions/split.js';
import {UpdateDataModelApi, UpdateDataModelImplementation} from './functions/updateDataModel.js';

/** Identifier of the catalog these functions implement. */
export const MCP_CATALOG_ID = 'https://a2ui.org/specification/v0_9/catalogs/mcp/mcp_catalog.json';

/**
 * API definitions and schemas for the catalog's data transformation functions.
 */
export const DATA_FUNCTION_APIS: readonly FunctionApiDefinition[] = [
  JmespathApi,
  SplitApi,
  RegexCaptureApi,
  RegexReplaceApi,
  UpdateDataModelApi,
];

/** Function implementations for the catalog's data transformation functions. */
export const DATA_FUNCTIONS: FunctionImplementation[] = [
  JmespathImplementation,
  SplitImplementation,
  RegexCaptureImplementation,
  RegexReplaceImplementation,
  UpdateDataModelImplementation,
];

/**
 * Creates all functions defined in the MCP catalog, including `callMcpTool`
 * and the data transformation functions.
 * Supports both `(processor, getMcpClientForTool)` and `(getMcpClientForTool, processor)` parameter orders.
 */
export function createMcpCatalogFunctions(
  processor: McpMessageProcessor,
  getMcpClientForTool: McpClientResolver,
): FunctionImplementation[];
export function createMcpCatalogFunctions(
  getMcpClientForTool: McpClientResolver,
  processor: McpMessageProcessor,
): FunctionImplementation[];
export function createMcpCatalogFunctions(
  first: McpClientResolver | McpMessageProcessor,
  second: McpClientResolver | McpMessageProcessor,
): FunctionImplementation[] {
  if (typeof first === 'function') {
    return [
      createCallMcpToolImplementation(first as McpClientResolver, second as McpMessageProcessor),
      ...DATA_FUNCTIONS,
    ];
  }
  return [
    createCallMcpToolImplementation(second as McpClientResolver, first as McpMessageProcessor),
    ...DATA_FUNCTIONS,
  ];
}

export {
  A2UI_MIME_TYPE,
  CallMcpToolApi,
  createCallMcpToolImplementation,
  extractA2uiMessages,
  parseA2uiMessages,
  readUiResourceUris,
  type McpClientResolver,
  type McpMessageProcessor,
  type McpToolClient,
} from './functions/callMcpTool.js';

export {JmespathApi, JmespathImplementation} from './functions/jmespath.js';
export {RegexCaptureApi, RegexCaptureImplementation} from './functions/regexCapture.js';
export {RegexReplaceApi, RegexReplaceImplementation} from './functions/regexReplace.js';
export {SplitApi, SplitImplementation} from './functions/split.js';
export {UpdateDataModelApi, UpdateDataModelImplementation} from './functions/updateDataModel.js';
export {isThenable} from './functions/common.js';
