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

import {ComponentUsage} from 'a2ui-bridge';
import {ErrorLogger} from '../debug/error-logger.service';
import {matchesSimpleSchema} from '../shared/property-editor/property-editor-utils';
import {Catalog} from '../storage/models/catalog-storage.model';
import {CatalogSchemaResolver} from './schema/catalog-schema-resolver';

/**
 * Checks if a value is a non-null object and not an array.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Parses the editable part of an example, keeping surface/catalog identity under
 * the Gallery's control. Complex catalog rules remain the renderer's responsibility.
 */
export function parseGalleryExample(
  text: string,
  catalog: Catalog,
  errorLogger: ErrorLogger,
): ComponentUsage {
  const draft: unknown = JSON.parse(text);
  if (!isRecord(draft) || Object.keys(draft).some(key => key !== 'components' && key !== 'data')) {
    throw new Error('Use an object with "components" and optional "data".');
  }
  const components = draft['components'];
  if (!Array.isArray(components) || components.length === 0) {
    throw new Error('"components" must be a non-empty array.');
  }
  let data: Record<string, unknown> | undefined;
  if ('data' in draft) {
    const value = draft['data'];
    if (!isRecord(value)) {
      throw new Error('"data" must be a JSON object, or omit it.');
    }
    data = value;
  }
  const ids = new Set<string>();
  const resolver = new CatalogSchemaResolver(catalog, errorLogger);
  const usage: Record<string, unknown>[] = [];
  for (const component of components) {
    if (!isRecord(component) || typeof component['id'] !== 'string' || !component['id'].trim()) {
      throw new Error('Each component needs a non-empty string id.');
    }
    const name = component['component'];
    if (typeof name !== 'string' || !Object.hasOwn(catalog.components ?? {}, name)) {
      throw new Error(`Component "${String(name)}" is not in the selected catalog.`);
    }
    if (ids.has(component['id'])) {
      throw new Error(`Duplicate component id "${component['id']}".`);
    }
    ids.add(component['id']);
    const schemas = resolver.resolveComponentPropertiesSchema(name);
    for (const [key, value] of Object.entries(component)) {
      const schema = schemas[key];
      if (schema && !matchesSimpleSchema(value, schema)) {
        throw new Error(
          `"${key}" on "${component['id']}" does not match its catalog property type or choices.`,
        );
      }
    }
    usage.push(component);
  }
  if (!ids.has('target') && !ids.has('root')) {
    throw new Error('Keep a component with id "target" or "root" as the preview root.');
  }
  return {usage, ...(data !== undefined ? {data} : {})};
}
