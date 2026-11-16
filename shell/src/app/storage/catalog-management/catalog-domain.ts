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

import {isV1ProtocolVersion, type A2uiProtocolVersion} from 'a2ui-bridge';
import {sanitizeHtml} from 'safevalues';
import {
  Catalog,
  CatalogComponentSchema,
  getCatalogFunctionEntries,
  getCatalogId,
} from '../models/catalog-storage.model';

/**
 * Orders `catalogs` so `primary` appears first without duplicating it by reference or ID.
 */
export function orderCatalogs(primary: Catalog | null, catalogs: readonly Catalog[]): Catalog[] {
  if (!primary) {
    return [...catalogs];
  }
  const primaryId = getCatalogId(primary);
  return [
    primary,
    ...catalogs.filter(
      c => c !== primary && (primaryId === undefined || getCatalogId(c) !== primaryId),
    ),
  ];
}

/**
 * Returns a copy of a catalog with its title and description sanitized, the
 * form in which Composer stores and displays a catalog a renderer sent.
 */
export function sanitizeCatalog(catalog: Catalog): Catalog {
  const sanitized = structuredClone(catalog);
  if (typeof sanitized.title === 'string') {
    sanitized.title = sanitizeHtml(sanitized.title).toString();
  }
  if (typeof sanitized.description === 'string') {
    sanitized.description = sanitizeHtml(sanitized.description).toString();
  }
  return sanitized;
}

/**
 * Merges components, functions, and `$defs` across `catalogs`, giving precedence
 * to `primary` when keys collide.
 */
export function mergeCatalogs(
  primary: Catalog | null,
  catalogs: readonly Catalog[],
): Catalog | null {
  if (!primary && catalogs.length === 0) {
    return null;
  }

  const ordered = orderCatalogs(primary, catalogs);
  const mergedComponents: Record<string, CatalogComponentSchema> = {};
  const mergedFunctions: Record<string, Record<string, unknown>> = {};
  const mergedDefs: Record<string, Record<string, unknown>> = {};
  let firstCatalogId: string | undefined;

  for (const cat of ordered) {
    if (!cat) continue;
    const catId = getCatalogId(cat);
    if (!firstCatalogId && catId) {
      firstCatalogId = catId;
    }
    if (cat.components) {
      for (const [key, schema] of Object.entries(cat.components)) {
        if (!Object.hasOwn(mergedComponents, key)) {
          mergedComponents[key] = schema;
        }
      }
    }
    for (const [key, schema] of getCatalogFunctionEntries(cat)) {
      if (!Object.hasOwn(mergedFunctions, key)) {
        mergedFunctions[key] = schema;
      }
    }
    const catDefs = (cat as Record<string, unknown>)['$defs'];
    if (catDefs && typeof catDefs === 'object' && !Array.isArray(catDefs)) {
      for (const [key, schema] of Object.entries(catDefs as Record<string, unknown>)) {
        if (
          !Object.hasOwn(mergedDefs, key) &&
          schema &&
          typeof schema === 'object' &&
          !Array.isArray(schema)
        ) {
          mergedDefs[key] = schema as Record<string, unknown>;
        }
      }
    }
  }

  const base = primary ?? ordered[0] ?? {};
  const primaryId = primary ? getCatalogId(primary) : undefined;
  return sanitizeCatalog({
    ...base,
    catalogId: primaryId ?? firstCatalogId,
    components: mergedComponents,
    functions: mergedFunctions,
    ...(Object.keys(mergedDefs).length > 0 ? {$defs: mergedDefs} : {}),
  });
}

/**
 * Resolves the active protocol version based on handshake state, active catalogs, and error state.
 *
 * @param hasReceived Whether a catalog handshake response has settled.
 * @param catalogs Active catalogs negotiated during the handshake.
 * @param hasCatalogError Whether the latest handshake attempt ended in an error.
 * @param primaryCatalog Fallback primary catalog when `catalogs` is empty.
 * @returns The resolved protocol version ('v0.9' or 'v1.0').
 */
export function resolveProtocolVersion(
  hasReceived: boolean,
  catalogs: readonly Catalog[],
  hasCatalogError: boolean,
  primaryCatalog: Catalog | null = null,
): A2uiProtocolVersion {
  if (!hasReceived) {
    return 'v0.9';
  }
  const allCatalogs = catalogs.length > 0 ? catalogs : primaryCatalog ? [primaryCatalog] : [];
  const nonEmptyCatalogs = allCatalogs.filter(c => !isCatalogEmpty(c));
  if (nonEmptyCatalogs.length === 0) {
    return hasCatalogError ? 'v0.9' : 'v1.0';
  }
  if (nonEmptyCatalogs.some(c => isV1ProtocolVersion(c.protocolVersion))) {
    return 'v1.0';
  }
  return 'v0.9';
}

/**
 * Returns true if `catalog` carries no components, functions, protocolVersion, or ID.
 */
export function isCatalogEmpty(catalog: Catalog): boolean {
  if (!catalog) return true;
  const hasComponents = catalog.components && Object.keys(catalog.components).length > 0;
  const hasFunctions = catalog.functions && Object.keys(catalog.functions).length > 0;
  const hasProtocol = !!catalog.protocolVersion;
  const hasId = !!getCatalogId(catalog);
  return !hasComponents && !hasFunctions && !hasProtocol && !hasId;
}

/**
 * Returns true if `rawPayload` represents an explicitly empty `A2UI_CATALOG` handshake payload.
 */
export function isEmptyCatalogPayload(rawPayload: unknown): boolean {
  if (rawPayload === null || rawPayload === undefined) {
    return false;
  }
  if (typeof rawPayload !== 'object' || Array.isArray(rawPayload)) {
    return false;
  }
  const obj = rawPayload as Record<string, unknown>;
  if (Object.keys(obj).length === 0) {
    return true;
  }
  if ('catalog' in obj) {
    const primary = obj['catalog'];
    const catalogs = obj['catalogs'];
    const hasCatalogs = Array.isArray(catalogs) && catalogs.length > 0;
    if (hasCatalogs) {
      return false;
    }
    if (primary === null || primary === undefined) {
      return true;
    }
    if (typeof primary === 'object' && !Array.isArray(primary)) {
      const pObj = primary as Record<string, unknown>;
      return Object.keys(pObj).length === 0;
    }
    return false;
  }
  if ('catalogs' in obj && Array.isArray(obj['catalogs']) && obj['catalogs'].length === 0) {
    return true;
  }
  return false;
}
