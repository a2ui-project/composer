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

import {CatalogComponentSchema} from '../../storage/models/catalog-storage.model';

type Literal = string | number | boolean;

/** A named property inside an object schema that declares explicit `properties`. */
export interface ObjectProperty {
  name: string;
  required: boolean;
  control: PropertyControl;
}

/** The control the property editor renders for one catalog property. */
export interface PropertyControl {
  kind: 'enum' | 'boolean' | 'number' | 'string' | 'array' | 'object' | 'json';
  /** The allowed literals when `kind` is `'enum'`, otherwise empty. */
  options: Literal[];
  /** The control rendered for each element when `kind` is `'array'`. */
  itemControl?: PropertyControl;
  /** The nested property controls when `kind` is `'object'`. */
  properties?: ObjectProperty[];
}

/**
 * Checks if a value is a non-null object and not an array.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Picks the property editor control from the resolved schema rather than the current value.
 * Literal-or-binding unions such as DynamicString edit their single literal branch; arrays
 * render dynamic item lists; objects with explicit `properties` recursively render nested
 * controls; objects without `properties` and multi-literal unions fall back to JSON textareas.
 */
export function resolvePropertyControl(
  schema: CatalogComponentSchema | undefined,
  value?: unknown,
  visited: Set<CatalogComponentSchema> = new Set(),
): PropertyControl {
  if (!schema) {
    return inferControlFromValue(value, visited);
  }
  if (visited.has(schema)) {
    return {kind: 'json', options: []};
  }
  const nextVisited = new Set(visited);
  nextVisited.add(schema);

  const choices = schema['enum'];
  if (Array.isArray(choices) && choices.length > 0 && choices.every(isLiteral)) {
    return {kind: 'enum', options: choices};
  }
  const alternatives = schema['anyOf'] ?? schema['oneOf'];
  if (Array.isArray(alternatives)) {
    const records = alternatives.filter((option): option is CatalogComponentSchema =>
      isRecord(option),
    );
    const literals = records.filter(isLiteralSchema);
    if (literals.length === 1) {
      return resolvePropertyControl(literals[0], value, nextVisited);
    }
    if (literals.length > 1) {
      return {kind: 'json', options: []};
    }
    const nonBindings = records.filter(option => !isBindingOrCallSchema(option));
    const arrays = nonBindings.filter(
      option => option['type'] === 'array' || isRecord(option['items']),
    );
    if (arrays.length === 1) {
      return resolvePropertyControl(arrays[0], value, nextVisited);
    }
    const objectsWithProps = nonBindings.filter(option =>
      hasEditableObjectProperties(option, nextVisited),
    );
    if (objectsWithProps.length === 1) {
      return resolvePropertyControl(objectsWithProps[0], value, nextVisited);
    }
    return {kind: 'json', options: []};
  }
  if (schema['type'] === 'array' || isRecord(schema['items'])) {
    const itemsSchema =
      isRecord(schema['items']) && Object.keys(schema['items']).length > 0
        ? (schema['items'] as CatalogComponentSchema)
        : undefined;
    const sample = Array.isArray(value) && value.length > 0 ? value[value.length - 1] : undefined;
    const itemControl: PropertyControl = itemsSchema
      ? resolvePropertyControl(itemsSchema, sample, nextVisited)
      : sample !== undefined
        ? inferControlFromValue(sample, nextVisited)
        : {kind: 'string', options: []};
    return {kind: 'array', options: [], itemControl};
  }
  if (schema['type'] === 'object' || isRecord(schema['properties'])) {
    const properties = resolveObjectProperties(schema, value, nextVisited);
    if (properties.length > 0) {
      return {kind: 'object', options: [], properties};
    }
    return {kind: 'json', options: []};
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
 * Creates a brand-new default value for a control when adding an entry to an empty array.
 */
export function createDefaultPropertyValue(control: PropertyControl | undefined): unknown {
  if (!control) {
    return '';
  }
  switch (control.kind) {
    case 'string':
      return '';
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'enum':
      return control.options[0] ?? '';
    case 'array':
      return [];
    case 'object': {
      const result: Record<string, unknown> = {};
      for (const prop of control.properties ?? []) {
        result[prop.name] = createDefaultPropertyValue(prop.control);
      }
      return result;
    }
    case 'json':
    default:
      return {};
  }
}

/**
 * Explains why a control cannot show a value, such as a data binding or function call,
 * so the editor never overwrites it. Returns null when the control can edit the value.
 */
export function describeUneditableValue(value: unknown, control: PropertyControl): string | null {
  // Unset values and raw JSON textareas are always editable.
  if (value === undefined || control.kind === 'json') {
    return null;
  }
  // Enum select controls can edit the value if it matches one of the allowed options.
  if (control.kind === 'enum' && control.options.some(option => option === value)) {
    return null;
  }
  // Array controls can edit the value if it is an actual array (not a binding or call).
  if (control.kind === 'array' && Array.isArray(value)) {
    return null;
  }
  // Object field controls can edit plain objects, excluding data bindings and function calls.
  if (control.kind === 'object' && isRecord(value) && !isBindingOrCallValue(value)) {
    return null;
  }
  // Primitive controls ('string', 'number', 'boolean') can edit values of the matching JS typeof.
  if (
    (control.kind === 'string' || control.kind === 'number' || control.kind === 'boolean') &&
    typeof value === control.kind
  ) {
    return null;
  }
  // Otherwise, the control cannot edit this value—explain why in a read-only note.
  if (isRecord(value) && isDataBindingValue(value)) {
    return `Bound to ${value['path']} — edit in the JSON editor.`;
  }
  if (isRecord(value) && isFunctionCallValue(value)) {
    return `Computed by ${value['call']}() — edit in the JSON editor.`;
  }
  return 'This value can only be edited in the JSON editor.';
}

/**
 * Falls back to inferring an editor control from the runtime values when no schema is provided.
 * This is usually for array types or for any value when the schema is missing.
 */
function inferControlFromValue(
  value: unknown,
  visited: Set<CatalogComponentSchema>,
): PropertyControl {
  if (Array.isArray(value)) {
    const sample = value[value.length - 1];
    return {
      kind: 'array',
      options: [],
      itemControl:
        sample !== undefined
          ? inferControlFromValue(sample, visited)
          : {kind: 'string', options: []},
    };
  }
  if (isRecord(value) && !isBindingOrCallValue(value) && Object.keys(value).length > 0) {
    return {
      kind: 'object',
      options: [],
      properties: Object.entries(value).map(([name, subValue]) => ({
        name,
        required: false,
        control: inferControlFromValue(subValue, visited),
      })),
    };
  }
  const type = typeof value;
  return type === 'string' || type === 'number' || type === 'boolean'
    ? {kind: type, options: []}
    : {kind: 'json', options: []};
}

/**
 * Extracts editable child property controls from an object schema, skips fixed `const` fields.
 * This is used for object types in order to render form inputs for each nested field in object types
 * instead of using single raw JSON textarea.
 */
function resolveObjectProperties(
  schema: CatalogComponentSchema,
  value: unknown,
  visited: Set<CatalogComponentSchema>,
): ObjectProperty[] {
  const rawProps = isRecord(schema['properties']) ? schema['properties'] : null;
  if (!rawProps) {
    return [];
  }
  const requiredSet = new Set(
    Array.isArray(schema['required'])
      ? schema['required'].filter((req): req is string => typeof req === 'string')
      : [],
  );
  const recordValue = isRecord(value) ? value : undefined;
  const properties: ObjectProperty[] = [];
  for (const [name, propSchema] of Object.entries(rawProps)) {
    if (isRecord(propSchema) && propSchema['const'] !== undefined) {
      continue;
    }
    properties.push({
      name,
      required: requiredSet.has(name),
      control: resolvePropertyControl(
        isRecord(propSchema) ? (propSchema as CatalogComponentSchema) : undefined,
        recordValue?.[name],
        visited,
      ),
    });
  }
  return properties;
}

/**
 * Returns true if schema has editable object properties, false otherwise.
 */
function hasEditableObjectProperties(
  schema: CatalogComponentSchema,
  visited: Set<CatalogComponentSchema>,
): boolean {
  return resolveObjectProperties(schema, undefined, visited).length > 0;
}

const FUNCTION_CALL_KEYS = new Set(['call', 'args', 'returnType']);

/**
 * Returns true if schema represents a data binding or function call schema, false otherwise.
 */
function isBindingOrCallSchema(schema: CatalogComponentSchema): boolean {
  const props = isRecord(schema['properties']) ? schema['properties'] : null;
  if (!props) {
    return false;
  }
  const keys = Object.keys(props);
  if (keys.length === 1 && keys[0] === 'path') {
    return true;
  }
  return 'call' in props && keys.every(key => FUNCTION_CALL_KEYS.has(key));
}

/**
 * Returns true if value represents a data binding value, false otherwise.
 */
function isDataBindingValue(value: Record<string, unknown>): boolean {
  const keys = Object.keys(value);
  return keys.length === 1 && keys[0] === 'path' && typeof value['path'] === 'string';
}

/**
 * Returns true if value represents a function call value, false otherwise.
 */
function isFunctionCallValue(value: Record<string, unknown>): boolean {
  const keys = Object.keys(value);
  return (
    typeof value['call'] === 'string' &&
    keys.every(key => FUNCTION_CALL_KEYS.has(key)) &&
    (value['args'] === undefined || isRecord(value['args'])) &&
    (value['returnType'] === undefined || typeof value['returnType'] === 'string')
  );
}

/**
 * Returns true if value represents a data binding or function call value, false otherwise.
 */
function isBindingOrCallValue(value: Record<string, unknown>): boolean {
  return isDataBindingValue(value) || isFunctionCallValue(value);
}

/**
 * Returns true if value is a literal, false otherwise.
 */
function isLiteral(value: unknown): value is Literal {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

/**
 * Returns true if schema represents a literal schema, false otherwise.
 */
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

/**
 * Returns true if value matches schema, false otherwise.
 */
export function matchesSimpleSchema(value: unknown, schema: CatalogComponentSchema): boolean {
  if (typeof schema === 'boolean') {
    return schema;
  }
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
  const type = schema['type'];
  if (Array.isArray(type)) {
    return type.some(option => matchesSimpleSchema(value, {...schema, ['type']: option}));
  }
  switch (type) {
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
