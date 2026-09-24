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
import {Catalog, CatalogComponentSchema} from '../storage/models/catalog-storage.model';
import {CatalogSchemaResolver} from './schema/catalog-schema-resolver';

type Literal = string | number | boolean;

/** The control the Gallery property editor renders for one catalog property. */
export interface GalleryPropertyControl {
  kind: 'enum' | 'boolean' | 'number' | 'string' | 'json';
  /** The allowed literals when `kind` is `'enum'`, otherwise empty. */
  options: Literal[];
}

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

/**
 * Picks the property editor control from the resolved schema rather than the current value.
 * Literal-or-binding unions such as DynamicString edit their single literal branch; lists,
 * objects and unions with several literal types are edited as JSON.
 */
export function galleryPropertyControl(
  schema: CatalogComponentSchema | undefined,
): GalleryPropertyControl {
  if (!schema) {
    return {kind: 'json', options: []};
  }
  const choices = schema['enum'];
  if (Array.isArray(choices) && choices.length > 0 && choices.every(isLiteral)) {
    return {kind: 'enum', options: choices};
  }
  const alternatives = schema['anyOf'] ?? schema['oneOf'];
  if (Array.isArray(alternatives)) {
    const literals = alternatives.filter(
      (option): option is CatalogComponentSchema => isRecord(option) && isLiteralSchema(option),
    );
    if (literals.length === 1) {
      return galleryPropertyControl(literals[0]);
    }
    if (literals.length > 1) {
      return {kind: 'json', options: []};
    }
  }
  switch (schema['type']) {
    case 'boolean':
      return {kind: 'boolean', options: []};
    case 'number':
    case 'integer':
      return {kind: 'number', options: []};
    case 'string':
      return {kind: 'string', options: []};
    default:
      return {kind: 'json', options: []};
  }
}

/**
 * Explains why a literal control cannot show a value, such as a data binding or function call,
 * so the editor never overwrites it. Returns null when the control can edit the value.
 */
export function describeUneditableValue(
  value: unknown,
  control: GalleryPropertyControl,
): string | null {
  if (value === undefined || control.kind === 'json') {
    return null;
  }
  if (control.kind === 'enum' && control.options.some(option => option === value)) {
    return null;
  }
  if (control.kind !== 'enum' && typeof value === control.kind) {
    return null;
  }
  if (isRecord(value) && typeof value['path'] === 'string') {
    return `Bound to ${value['path']} — edit in the JSON tab.`;
  }
  if (isRecord(value) && typeof value['call'] === 'string') {
    return `Computed by ${value['call']}() — edit in the JSON tab.`;
  }
  return 'This value can only be edited in the JSON tab.';
}

function isLiteral(value: unknown): value is Literal {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

function isLiteralSchema(schema: CatalogComponentSchema): boolean {
  const type = schema['type'];
  return (
    Array.isArray(schema['enum']) ||
    type === 'string' ||
    type === 'number' ||
    type === 'integer' ||
    type === 'boolean'
  );
}

function matchesSimpleSchema(value: unknown, schema: CatalogComponentSchema): boolean {
  const alternatives = schema['anyOf'] ?? schema['oneOf'];
  if (Array.isArray(alternatives)) {
    return alternatives.some(option => isRecord(option) && matchesSimpleSchema(value, option));
  }
  if (
    Array.isArray(schema['enum']) &&
    !schema['enum'].some(option => JSON.stringify(option) === JSON.stringify(value))
  ) {
    return false;
  }
  if ('const' in schema && JSON.stringify(schema['const']) !== JSON.stringify(value)) {
    return false;
  }
  switch (schema['type']) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'integer':
      return typeof value === 'number' && Number.isInteger(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'object':
      return isRecord(value);
    case 'array':
      return Array.isArray(value);
    case 'null':
      return value === null;
    default:
      return true;
  }
}
