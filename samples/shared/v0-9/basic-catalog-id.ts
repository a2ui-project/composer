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

import type {Catalog, ComponentApi, FunctionApi} from '@a2ui/web_core/v0_9';

/**
 * Legacy Composer v0.9 basic catalog identifier referenced by existing drafts,
 * tutorials, and shared links.
 */
export const COMPOSER_V09_BASIC_CATALOG_ID =
  'https://a2ui.org/specification/v0_9/basic_catalog.json';

/**
 * Published NPM `@a2ui/*` v0.9 basic catalog identifier.
 */
export const NPM_V09_BASIC_CATALOG_ID =
  'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json';

/**
 * Returns `catalog` if it already uses `catalogId`, otherwise derives a new
 * `Catalog` instance preserving its `protocolVersion`, components, functions,
 * theme schema, and document options.
 */
export function withCatalogId<
  T extends ComponentApi = ComponentApi,
  F extends FunctionApi = FunctionApi,
>(catalog: Catalog<T, F>, catalogId: string): Catalog<T, F> {
  return catalog.id === catalogId ? catalog : catalog.derive({catalogId});
}

/**
 * Registers a v0.9 basic catalog under both the legacy Composer ID and the
 * published NPM catalog ID with shared schema metadata attached.
 */
export function createDualIdV09BasicCatalogs<
  T extends ComponentApi = ComponentApi,
  F extends FunctionApi = FunctionApi,
>(
  baseCatalog: Catalog<T, F>,
  attachSchema: <C extends Catalog<T, F>>(catalog: C, options: {title: string}) => C,
  title: string,
): Catalog<T, F>[] {
  return [COMPOSER_V09_BASIC_CATALOG_ID, NPM_V09_BASIC_CATALOG_ID].map(id =>
    attachSchema(withCatalogId(baseCatalog, id), {title}),
  );
}
