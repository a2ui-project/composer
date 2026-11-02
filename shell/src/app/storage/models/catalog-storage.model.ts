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

/**
 * Database record schema representing a cached component catalog
 * stored inside the IndexedDB object store.
 */
export declare interface CachedCatalogRecord {
  rendererUrl: string;
  catalogString: string;
  checksumHash: string;
  lastAccessed: number;
}

/**
 * Schema defining metadata and structure for a single component definition
 * registered within a catalog.
 */
export declare interface CatalogComponentSchema {
  [key: string]: unknown;
}

/**
 * One function a catalog declares when it lists its `functions` rather than
 * keying them by name, as an A2UI v0.9 inline catalog does: the function's
 * name, description, parameter schema and return type.
 */
export declare interface CatalogFunctionSchema {
  /** The name a function call uses to call the function. */
  name: string;
  [key: string]: unknown;
}

/**
 * Represents a complete validated catalog package containing components,
 * identifiers, versions, and origin URLs.
 */
export declare interface Catalog {
  $schema?: string;
  $id?: string;
  title?: string;
  description?: string;
  catalogId?: string;
  components?: {[key: string]: CatalogComponentSchema};
  /**
   * The functions the catalog declares, either keyed by name or as a list of
   * named functions. Read it with {@link catalogDeclaresFunction}.
   */
  functions?: {[key: string]: Record<string, unknown>} | CatalogFunctionSchema[];
  $defs?: {[key: string]: Record<string, unknown>};
}

/**
 * The ID a catalog is known by: its `catalogId`, or its JSON Schema `$id` if
 * it doesn't set one.
 */
export function getCatalogId(catalog: Catalog): string | undefined {
  return catalog.catalogId || catalog.$id;
}

/**
 * Whether a catalog declares a function with the given name, in either form
 * {@link Catalog.functions} takes.
 */
export function catalogDeclaresFunction(catalog: Catalog, name: string): boolean {
  const functions = catalog.functions;
  if (!functions) {
    return false;
  }
  if (Array.isArray(functions)) {
    return functions.some(declared => declared.name === name);
  }
  return Object.hasOwn(functions, name);
}
