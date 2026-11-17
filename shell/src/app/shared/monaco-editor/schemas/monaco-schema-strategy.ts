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

import type * as monaco from 'monaco-editor';
import type {A2uiProtocolVersion} from 'a2ui-bridge';
import {Catalog, CatalogJson} from '../../../storage/models/catalog-storage.model';

/**
 * Options provided to a Monaco schema strategy to build diagnostic schemas.
 */
export interface MonacoSchemaStrategyOptions {
  /** The primary active catalog, or null if none established. */
  catalog: Catalog | null;
  /** All actively negotiated catalogs (e.g. basic catalog + MCP functions catalog). */
  catalogs: CatalogJson[];
}

/**
 * Strategy contract for synthesizing Monaco diagnostics schemas across protocol versions.
 */
export interface MonacoSchemaStrategy {
  /** Protocol version supported by this strategy. */
  readonly protocolVersion: A2uiProtocolVersion;

  /**
   * Constructs Monaco JSON diagnostic schemas for the current catalog configuration.
   *
   * @param options The catalog and catalogs options for schema compilation.
   * @returns Array of Monaco diagnostic schema configurations.
   */
  buildSchemas(
    options: MonacoSchemaStrategyOptions,
  ): NonNullable<monaco.json.DiagnosticsOptions['schemas']>;
}
