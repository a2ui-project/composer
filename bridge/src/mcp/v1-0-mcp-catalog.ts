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

import {
  Catalog,
  createFunctionImplementation,
  type ComponentApi,
  type FunctionImplementation,
} from '@a2ui/web_core/catalog';
import {z} from 'zod/v3';

import {
  createCallMcpToolImplementation,
  type McpClientResolver,
  type McpMessageProcessor,
  type McpToolClient,
} from './functions/callMcpTool.js';
import {createJmespathImplementation} from './functions/jmespath.js';
import {RegexCaptureImplementation} from './functions/regexCapture.js';
import {RegexReplaceImplementation} from './functions/regexReplace.js';
import {SplitImplementation} from './functions/split.js';
import {createUpdateDataModelImplementation} from './functions/updateDataModel.js';
import {v10DynamicValueStrategy} from './v1-0-dynamic-value-strategy.js';

/** Identifier of the MCP and utility functions catalog for A2UI v1.0. */
export const MCP_FUNCTIONS_CATALOG_ID =
  'https://a2ui.org/composer/v1_0/catalogs/mcp-functions/catalog.json';

/** Dynamic string parameter schema for v1.0 function schemas using zod/v3. */
function dynamicStringParam(description: string) {
  return z
    .union([z.string(), z.null(), z.record(z.any())])
    .describe(`REF:#/$defs/DynamicString|${description}`);
}

/** Dynamic value parameter schema for v1.0 function schemas using zod/v3. */
function dynamicValueParam(description: string) {
  return z
    .union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.any()), z.record(z.any())])
    .describe(`REF:#/$defs/DynamicValue|${description}`);
}

/**
 * Creates an object schema requiring explicit presence of specified keys,
 * allowing null or undefined values to pass at runtime by mapping undefined to null via preprocess.
 */
function requireKeys<T extends z.ZodRawShape>(shape: T, requiredKeys: readonly (keyof T)[]) {
  const baseObject = z.object(shape);
  return z.preprocess(val => {
    if (typeof val === 'object' && val !== null) {
      const copy = {...val} as Record<string, unknown>;
      for (const key of requiredKeys) {
        if (key in copy && copy[key as string] === undefined) {
          copy[key as string] = null;
        }
      }
      return copy;
    }
    return val;
  }, baseObject);
}

/** Structural interface for accessing global preview bridge without static import. */
interface A2uiBridgeGlobal {
  getMcpClient?: () => McpToolClient | undefined | null;
  getActiveProcessor?: () => McpMessageProcessor | undefined | null;
}

/** Safely extracts window.a2uiBridge via structural interface to avoid cyclic bundle dependencies. */
function getGlobalBridge(): A2uiBridgeGlobal | undefined {
  if (
    typeof window !== 'undefined' &&
    (window as unknown as {a2uiBridge?: A2uiBridgeGlobal}).a2uiBridge
  ) {
    return (window as unknown as {a2uiBridge?: A2uiBridgeGlobal}).a2uiBridge;
  }
  if (
    typeof globalThis !== 'undefined' &&
    (globalThis as unknown as {a2uiBridge?: A2uiBridgeGlobal}).a2uiBridge
  ) {
    return (globalThis as unknown as {a2uiBridge?: A2uiBridgeGlobal}).a2uiBridge;
  }
  return undefined;
}

/** Options for configuring the v1.0 MCP functions catalog. */
export interface McpFunctionsCatalogOptions {
  /** Optional custom resolver for MCP clients. Defaults to window.a2uiBridge.getMcpClient(). */
  getMcpClientForTool?: McpClientResolver;
  /** Optional custom processor for A2UI messages. Defaults to window.a2uiBridge.getActiveProcessor(). */
  processor?: McpMessageProcessor;
}

/**
 * Creates an A2UI v1.0 Catalog containing the MCP tool caller and utility data functions
 * (`callMcpTool`, `jmespath`, `regexCapture`, `regexReplace`, `split`, `updateDataModel`).
 *
 * @param options Optional configuration for custom MCP client resolution and message dispatch.
 */
export function createMcpFunctionsCatalog(
  options: McpFunctionsCatalogOptions = {},
): Catalog<ComponentApi, FunctionImplementation> {
  const getMcpClientForTool: McpClientResolver =
    options.getMcpClientForTool ??
    (async () => {
      const bridge = getGlobalBridge();
      return bridge?.getMcpClient?.() ?? null;
    });

  const processor: McpMessageProcessor = options.processor ?? {
    processMessages(messages) {
      const bridge = getGlobalBridge();
      bridge?.getActiveProcessor?.()?.processMessages(messages);
    },
    get model() {
      const bridge = getGlobalBridge();
      return bridge?.getActiveProcessor?.()?.model;
    },
  };

  const baseCallMcpToolImpl = createCallMcpToolImplementation(
    getMcpClientForTool,
    processor,
    v10DynamicValueStrategy,
  );
  const callMcpToolImpl: FunctionImplementation = createFunctionImplementation(
    {
      name: 'callMcpTool',
      returnType: 'any',
      allowedCallers: 'rendererOnly',
      schema: requireKeys(
        {
          ['name']: dynamicStringParam('The name of the MCP tool to execute.'),
          ['arguments']: z
            .record(dynamicValueParam('The arguments to pass to the MCP tool.'))
            .optional()
            .default({})
            .describe('The arguments to pass to the MCP tool.'),
        },
        ['name'],
      ) as unknown as FunctionImplementation['schema'],
    },
    baseCallMcpToolImpl.execute,
  );

  const baseJmespathImpl = createJmespathImplementation(v10DynamicValueStrategy);
  const jmespathImpl: FunctionImplementation = createFunctionImplementation(
    {
      name: 'jmespath',
      returnType: 'any',
      allowedCallers: 'rendererOrAgent',
      schema: requireKeys(
        {
          ['expression']: dynamicStringParam(
            'A standard JMESPath expression evaluated against `data`.',
          ),
          ['data']: dynamicValueParam('The input data to evaluate the expression against.'),
        },
        ['expression', 'data'],
      ) as unknown as FunctionImplementation['schema'],
    },
    baseJmespathImpl.execute,
  );

  const regexCaptureImpl: FunctionImplementation = createFunctionImplementation(
    {
      name: 'regexCapture',
      returnType: 'any',
      allowedCallers: 'rendererOrAgent',
      schema: requireKeys(
        {
          ['value']: dynamicValueParam('The string or array of strings to match against.'),
          ['pattern']: dynamicStringParam(
            'An RE2 regular expression. Returns an array of capture groups from the first match, or null if there is no match. Unmatched optional groups return empty strings.',
          ),
        },
        ['value', 'pattern'],
      ) as unknown as FunctionImplementation['schema'],
    },
    RegexCaptureImplementation.execute,
  );

  const regexReplaceImpl: FunctionImplementation = createFunctionImplementation(
    {
      name: 'regexReplace',
      returnType: 'any',
      allowedCallers: 'rendererOrAgent',
      schema: requireKeys(
        {
          ['value']: dynamicValueParam(
            'The string or array of strings to perform replacements on.',
          ),
          ['pattern']: dynamicStringParam(
            'An RE2 regular expression matching substrings to replace.',
          ),
          ['replacement']: dynamicStringParam(
            'Literal replacement string. Capture group references like $1 are treated as literal text.',
          ),
        },
        ['value', 'pattern', 'replacement'],
      ) as unknown as FunctionImplementation['schema'],
    },
    RegexReplaceImplementation.execute,
  );

  const splitImpl: FunctionImplementation = createFunctionImplementation(
    {
      name: 'split',
      returnType: 'any',
      allowedCallers: 'rendererOrAgent',
      schema: requireKeys(
        {
          ['value']: dynamicValueParam('The string or array of strings to split.'),
          ['separator']: dynamicStringParam(
            'The delimiter string to split on. An empty string splits into individual characters.',
          ),
        },
        ['value', 'separator'],
      ) as unknown as FunctionImplementation['schema'],
    },
    SplitImplementation.execute,
  );

  const baseUpdateDataModelImpl = createUpdateDataModelImplementation(v10DynamicValueStrategy);
  const updateDataModelImpl: FunctionImplementation = createFunctionImplementation(
    {
      name: 'updateDataModel',
      returnType: 'any',
      allowedCallers: 'rendererOnly',
      schema: requireKeys(
        {
          ['updates']: dynamicValueParam(
            'An object mapping data model paths to the values to write (e.g., {"/entries": [...], "/title": "Home"}). Paths starting with "/" are absolute; relative paths resolve against the current data context.',
          ),
        },
        ['updates'],
      ) as unknown as FunctionImplementation['schema'],
    },
    baseUpdateDataModelImpl.execute,
  );

  return new Catalog<ComponentApi, FunctionImplementation>(
    MCP_FUNCTIONS_CATALOG_ID,
    '1.0',
    [],
    [
      callMcpToolImpl,
      jmespathImpl,
      regexCaptureImpl,
      regexReplaceImpl,
      splitImpl,
      updateDataModelImpl,
    ],
    {
      schemaId: MCP_FUNCTIONS_CATALOG_ID,
      schemaUri: 'https://a2ui.org/specification/v1_0/catalog_definition.json',
      title: 'MCP and Utility Functions Catalog',
    },
  );
}
