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
}
