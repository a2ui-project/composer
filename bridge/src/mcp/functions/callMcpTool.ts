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

import {
  A2uiExpressionError,
  DynamicStringSchema,
  DynamicValueSchema,
  createFunctionImplementation,
  type A2uiMessage,
  type CreateSurfaceMessage,
  type FunctionImplementation,
  type SurfaceModel,
} from '@a2ui/web_core/v0_9';
import type {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {CallToolResultSchema} from '@modelcontextprotocol/sdk/types.js';
import type {CallToolResult, ReadResourceResult} from '@modelcontextprotocol/sdk/types.js';
import {z} from 'zod/v3';

import {resolveDynamicRecord} from '../dynamic-values.js';
import type {FunctionApiDefinition} from './common.js';

/** MIME type identifying an A2UI payload in an MCP resource. */
export const A2UI_MIME_TYPE = 'application/a2ui+json';

/** Maximum number of decoded UI resources to cache per implementation. */
const MAX_CACHED_RESOURCES = 100;

/** Subset of the MCP `Client` or `IframeMcpClient` interface used by this catalog. */
export interface McpToolClient {
  callTool?: (params: {name: string; arguments?: Record<string, unknown>}) => Promise<unknown>;
  request?: Client['request'];
  readResource?: Client['readResource'];
  listTools?: Client['listTools'];
}

/** Processor interface capable of processing A2UI messages and optionally looking up surfaces. */
export interface McpMessageProcessor {
  processMessages(messages: A2uiMessage[]): void;
  model?: {
    getSurface?(surfaceId: string): SurfaceModel | undefined;
  };
}

/**
 * Resolves the connected MCP client for a given tool name.
 *
 * May return `null` or `undefined` if no client is currently available,
 * which causes the tool call to fail with an error.
 */
export type McpClientResolver = (
  toolName: string,
) => McpToolClient | undefined | null | Promise<McpToolClient | undefined | null>;

/**
 * Function API definition for `callMcpTool`.
 *
 * Payloads reference tools by name; the host application is responsible for
 * routing each tool name to the appropriate MCP server client.
 */
export const CallMcpToolApi: FunctionApiDefinition = {
  name: 'callMcpTool',
  returnType: 'any',
  schema: z.object({
    name: (DynamicStringSchema as unknown as z.ZodTypeAny).describe(
      'The name of the MCP tool to execute.',
    ),
    arguments: z
      .record(DynamicValueSchema as unknown as z.ZodTypeAny)
      .optional()
      .default({})
      .describe('The arguments to pass to the MCP tool.'),
  }) as unknown as FunctionApiDefinition['schema'],
};

/**
 * Creates the `callMcpTool` function implementation.
 *
 * Invokes the named MCP tool, processes any referenced or inline `application/a2ui+json`
 * resources through `processor`, and returns the raw `CallToolResult`.
 *
 * @param getMcpClientForTool Callback that resolves the MCP client for a tool name.
 * @param processor Message processor that receives A2UI messages decoded from tool results.
 */
export function createCallMcpToolImplementation(
  getMcpClientForTool: McpClientResolver,
  processor: McpMessageProcessor,
): FunctionImplementation {
  const declaredUiResourceUris = new WeakMap<McpToolClient, Promise<Map<string, string[]>>>();
  const cachedA2uiResources = new Map<string, A2uiMessage[]>();

  async function readA2uiResource(client: McpToolClient, uri: string): Promise<A2uiMessage[]> {
    const cached = cachedA2uiResources.get(uri);
    if (cached !== undefined) {
      cachedA2uiResources.delete(uri);
      cachedA2uiResources.set(uri, cached);
      return cached;
    }

    if (!client.readResource) {
      return [];
    }
    const resource = await client.readResource({uri});
    const messages = parseA2uiMessages(resource, uri);
    if (cachedA2uiResources.size >= MAX_CACHED_RESOURCES) {
      const oldestKey = cachedA2uiResources.keys().next().value;
      if (oldestKey !== undefined) {
        cachedA2uiResources.delete(oldestKey);
      }
    }
    cachedA2uiResources.set(uri, messages);
    return messages;
  }

  function getDeclaredUiResourceUris(client: McpToolClient): Promise<Map<string, string[]>> {
    const cached = declaredUiResourceUris.get(client);
    if (cached) {
      return cached;
    }
    const discovery = (async () => {
      const uris = new Map<string, string[]>();
      if (!client.listTools) {
        return uris;
      }
      try {
        const res = await client.listTools();
        const tools = res?.tools ?? [];
        for (const tool of tools) {
          const toolUris = readUiResourceUris(tool);
          if (toolUris.length > 0) {
            uris.set(tool.name, toolUris);
          }
        }
      } catch (err) {
        console.warn('Could not query MCP tool UI resources:', err);
      }
      return uris;
    })();
    declaredUiResourceUris.set(client, discovery);
    return discovery;
  }

  return createFunctionImplementation(
    CallMcpToolApi as Parameters<typeof createFunctionImplementation>[0],
    async (args, context) => {
      const toolName = context.resolveDynamicValue<string>(args['name']);

      try {
        const resolvedArguments = resolveDynamicRecord(
          (args['arguments'] as Record<string, unknown> | undefined) ?? {},
          context,
        );

        const client = await getMcpClientForTool(toolName);
        if (!client) {
          throw new Error(`MCP client for tool '${toolName}' could not be resolved.`);
        }
        let result: CallToolResult;
        if (typeof client.callTool === 'function') {
          result = (await client.callTool({
            name: toolName,
            arguments: resolvedArguments,
          })) as CallToolResult;
        } else if (typeof client.request === 'function') {
          result = await client.request(
            {method: 'tools/call', params: {name: toolName, arguments: resolvedArguments}},
            CallToolResultSchema,
            {onprogress: () => {}, resetTimeoutOnProgress: true},
          );
        } else {
          throw new Error(`MCP client for tool '${toolName}' does not support tool calls.`);
        }

        if (!result) {
          throw new Error(`MCP tool '${toolName}' did not return a result.`);
        }
        if (result.isError) {
          throw new Error(`MCP tool '${toolName}' execution failed: ${JSON.stringify(result)}`);
        }

        // Prefer resource URIs from the tool result, falling back to tool-declared URIs.
        const named = readUiResourceUris(result);
        const uris =
          named.length > 0
            ? named
            : ((await getDeclaredUiResourceUris(client)).get(toolName) ?? []);
        for (const uri of uris) {
          const resourceMessages = await readA2uiResource(client, uri);
          if (!createsExistingSurface(resourceMessages, processor)) {
            processor.processMessages(resourceMessages);
          }
        }

        const messages = extractA2uiMessages(result.content);
        if (messages.length > 0) {
          processor.processMessages(messages);
        }

        return result;
      } catch (error: unknown) {
        if (error instanceof A2uiExpressionError) {
          throw error;
        }
        const message = error instanceof Error ? error.message : String(error);
        throw new A2uiExpressionError(
          `Failed to execute MCP tool '${toolName}': ${message}`,
          'callMcpTool',
          error,
        );
      }
    },
  );
}

/**
 * Extracts unique string URIs from `_meta.ui.resourceUri` on a tool descriptor or result.
 * Accepts either a single URI string or an array of URI strings.
 */
export function readUiResourceUris(source: {_meta?: unknown} | undefined): string[] {
  const meta = source?._meta as {ui?: {resourceUri?: unknown}} | undefined;
  const declared = meta?.ui?.resourceUri;
  const uris = Array.isArray(declared) ? declared : [declared];
  return [...new Set(uris.filter((uri): uri is string => typeof uri === 'string' && uri !== ''))];
}

/**
 * Extracts inline A2UI messages from `CallToolResult.content` blocks.
 *
 * Only embedded resource blocks with `mimeType: "application/a2ui+json"` are
 * parsed; plain text blocks are ignored.
 *
 * @throws Error if an A2UI resource block contains invalid JSON.
 */
export function extractA2uiMessages(content: CallToolResult['content'] | undefined): A2uiMessage[] {
  const messages: A2uiMessage[] = [];
  for (const item of content ?? []) {
    const block = item as {
      type?: string;
      resource?: {uri?: string; mimeType?: string; text?: unknown};
    };
    if (block?.type !== 'resource' || block.resource?.mimeType !== A2UI_MIME_TYPE) {
      continue;
    }

    const {text, uri} = block.resource;
    if (typeof text !== 'string') {
      continue;
    }

    let parsed: A2uiMessage | A2uiMessage[];
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(`Resource ${uri} declares ${A2UI_MIME_TYPE} but does not hold valid JSON.`);
    }
    messages.push(...(Array.isArray(parsed) ? parsed : [parsed]));
  }
  return messages;
}

/**
 * Parses A2UI messages from a `resources/read` response for all content blocks
 * matching `application/a2ui+json`.
 *
 * @throws Error if an A2UI content block contains invalid JSON.
 */
export function parseA2uiMessages(
  resource: ReadResourceResult | undefined,
  uri: string,
): A2uiMessage[] {
  const texts = (resource?.contents ?? [])
    .filter(content => content.mimeType === A2UI_MIME_TYPE)
    .map(content => (content as {text?: unknown}).text)
    .filter((text): text is string => typeof text === 'string');
  return texts.flatMap(text => {
    let parsed: A2uiMessage | A2uiMessage[];
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(`Resource ${uri} declares ${A2UI_MIME_TYPE} but does not hold valid JSON.`);
    }
    return Array.isArray(parsed) ? parsed : [parsed];
  });
}

/** Checks whether any message attempts to create a surface that already exists in `processor`. */
function createsExistingSurface(messages: A2uiMessage[], processor: McpMessageProcessor): boolean {
  return messages.some(message => {
    if (!message || typeof message !== 'object' || !('createSurface' in message)) {
      return false;
    }
    const surfaceId = (message as CreateSurfaceMessage).createSurface?.surfaceId;
    return !!surfaceId && !!processor.model?.getSurface?.(surfaceId);
  });
}
