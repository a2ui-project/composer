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

import {Injectable, inject} from '@angular/core';
import {BasicCatalog} from '@a2ui/angular/v0_9';
import {Catalog, ComponentApi, FunctionImplementation} from '@a2ui/web_core/v0_9';
import {a2uiBridge, createMcpCatalogFunctions} from 'a2ui-bridge';

export const BASIC_WITH_MCP_CATALOG_ID =
  'https://a2ui.org/specification/v0_9/catalogs/basic_with_mcp/catalog.json';

function extractCatalogEntries<T>(collection?: ReadonlyMap<string, T> | Record<string, T>): T[] {
  if (!collection) return [];
  if (typeof (collection as ReadonlyMap<string, T>).values === 'function') {
    return Array.from((collection as ReadonlyMap<string, T>).values());
  }
  return Object.values(collection);
}

/**
 * Angular catalog combining the standard BasicCatalog components and functions
 * with the A2UI Model Context Protocol (MCP) catalog functions.
 */
@Injectable()
export class BasicWithMcpCatalog extends Catalog<ComponentApi> {
  constructor() {
    const basicCatalog = inject(BasicCatalog);
    const baseComponents = extractCatalogEntries<ComponentApi>(basicCatalog.components);
    const baseFunctions = extractCatalogEntries<FunctionImplementation>(basicCatalog.functions);
    const mcpFunctions = createMcpCatalogFunctions(
      {
        processMessages: msgs => {
          a2uiBridge.getActiveProcessor()?.processMessages(msgs);
        },
      },
      async () => a2uiBridge.getMcpClient(),
    );
    super(BASIC_WITH_MCP_CATALOG_ID, baseComponents, [...baseFunctions, ...mcpFunctions]);
  }
}
