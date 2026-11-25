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
// TODO: Replace import from 'a2ui-bridge' with '@a2ui/mcp-catalog/v0_9' once published to NPM.
import {a2uiBridge, createMcpCatalogFunctions} from 'a2ui-bridge';
import {attachCatalogSchema} from '../../../shared/attach-catalog-schema.js';
import {
  COMPOSER_V09_BASIC_CATALOG_ID,
  NPM_V09_BASIC_CATALOG_ID,
} from '../../../shared/v0-9/basic-catalog-id.js';

/**
 * Normalizes a catalog entry collection (ReadonlyMap or Record) into a flat array of values.
 */
function extractCatalogEntries<T>(collection?: ReadonlyMap<string, T> | Record<string, T>): T[] {
  if (!collection) return [];
  if (typeof (collection as ReadonlyMap<string, T>).values === 'function') {
    return Array.from((collection as ReadonlyMap<string, T>).values());
  }
  return Object.values(collection);
}

// TODO(upstream @a2ui/angular): Remove toNativeAngularEntries once @a2ui/angular scopes
// useUniversalComponents per catalog or protocol version.
/**
 * Strips `tagName` and `element` from each v0.9 `BasicCatalog` component entry so
 * `@a2ui/angular`'s `ComponentHostComponent` renders native Angular v0.9 components
 * even when `useUniversalComponents` is enabled for coexisting v1.0 custom elements.
 */
export function toNativeAngularEntries(
  collection?: ReadonlyMap<string, ComponentApi> | Record<string, ComponentApi>,
): ComponentApi[] {
  return extractCatalogEntries<ComponentApi>(collection).map(entry => {
    const copy = {...entry} as ComponentApi & {tagName?: unknown; element?: unknown};
    delete copy.tagName;
    delete copy.element;
    return copy;
  });
}

function buildBasicWithMcpParts(basicCatalog: BasicCatalog): {
  components: ComponentApi[];
  functions: FunctionImplementation[];
} {
  const baseComponents = toNativeAngularEntries(basicCatalog.components);
  const baseFunctions = extractCatalogEntries<FunctionImplementation>(basicCatalog.functions);
  const mcpFunctions = createMcpCatalogFunctions(
    {
      processMessages: msgs => {
        a2uiBridge.getActiveProcessor()?.processMessages(msgs);
      },
    },
    async () => a2uiBridge.getMcpClient(),
  );
  return {
    components: baseComponents,
    functions: [...baseFunctions, ...mcpFunctions],
  };
}

/**
 * Angular v0.9 catalog combining native Angular BasicCatalog components and
 * functions with MCP catalog functions under the legacy Composer catalog ID.
 */
@Injectable()
export class BasicWithMcpCatalog extends Catalog<ComponentApi> {
  constructor() {
    const basicCatalog = inject(BasicCatalog);
    const {components, functions} = buildBasicWithMcpParts(basicCatalog);
    super(COMPOSER_V09_BASIC_CATALOG_ID, '0.9', components, functions, basicCatalog.themeSchema);
    attachCatalogSchema(this, {title: 'Angular Basic Catalog (v0.9)'});
  }
}

/**
 * Angular v0.9 catalog combining native Angular BasicCatalog components and
 * functions with MCP catalog functions under the published NPM catalog ID,
 * reusing the already-built components and functions from `BasicWithMcpCatalog`.
 */
@Injectable()
export class BasicWithMcpNpmIdCatalog extends Catalog<ComponentApi> {
  private readonly baseCatalog: BasicWithMcpCatalog;
  private memoizedCatalogSchema: Record<string, unknown> | null = null;

  constructor() {
    const base = inject(BasicWithMcpCatalog);
    super(
      NPM_V09_BASIC_CATALOG_ID,
      '0.9',
      Array.from(base.components.values()),
      Array.from(base.functions.values()),
      base.themeSchema,
    );
    this.baseCatalog = base;
    attachCatalogSchema(this, {title: 'Angular Basic Catalog (v0.9)'});
  }

  /**
   * Reuses and memoizes `BasicWithMcpCatalog`'s schema instead of running Zod -> JSON Schema
   * generation a second time at startup or rebuilding on every read, cloning to keep mutable
   * schema objects isolated from the base catalog and callers.
   */
  override get catalogSchema(): Record<string, unknown> {
    if (!this.memoizedCatalogSchema) {
      this.memoizedCatalogSchema = {
        ...structuredClone(this.baseCatalog.catalogSchema),
        catalogId: NPM_V09_BASIC_CATALOG_ID,
      };
    }
    return structuredClone(this.memoizedCatalogSchema);
  }
}
