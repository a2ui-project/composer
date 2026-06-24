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

import {Catalog, CatalogComponentSchema} from '../../storage/models/catalog-storage.model';
import {COMMON_TYPES_SCHEMA} from './common-types-schema';

/**
 * Represents a parsed property definition extracted from the catalog schema.
 */
export interface ParsedProperty {
  /** The name of the property. */
  name: string;
  /** The description of the property. */
  description: string;
  /** The type representation of the property (e.g., "string", "number", "boolean", "string | number"). */
  type: string;
  /** Whether the property is required by the component. */
  required: boolean;
  /** The default value of the property, if specified in the schema. */
  defaultValue?: unknown;
}

interface ResolvedSchema {
  properties: Record<string, unknown>;
  required: Set<string>;
}

/**
 * Resolves component property definitions and metadata from the catalog schema,
 * handling references, inheritance, and validation rules.
 */
export class CatalogSchemaResolver {
  constructor(private readonly schema: Catalog | null) {}

  /**
   * Resolves and parses all properties for the specified component from the catalog schema.
   *
   * @param componentName The name of the component to resolve.
   * @returns An array of parsed property definitions.
   */
  resolveComponentProperties(componentName: string): ParsedProperty[] {
    if (this.schema == null || typeof this.schema !== 'object') {
      return [];
    }
    const root = this.schema;
    const components = root['components'];
    if (components == null || typeof components !== 'object' || Array.isArray(components)) {
      return [];
    }
    const componentsDict = components;
    if (!Object.prototype.hasOwnProperty.call(componentsDict, componentName)) {
      return [];
    }

    const componentSchema = componentsDict[componentName];
    const resolved = this.resolveInheritedDefinitions(componentSchema, root, new Set());

    const parsedProperties: ParsedProperty[] = [];
    for (const [name, propRawSchema] of Object.entries(resolved.properties)) {
      const resolvedProp = this.resolvePropertySchema(
        propRawSchema as CatalogComponentSchema,
        root,
        new Set(),
      );

      const type = this.getPropertyType(resolvedProp);
      const description =
        typeof resolvedProp['description'] === 'string' ? resolvedProp['description'] : '';
      const required = resolved.required.has(name);

      const parsed: ParsedProperty = {
        name,
        description,
        type,
        required,
      };

      if (resolvedProp['default'] !== undefined) {
        parsed.defaultValue = resolvedProp['default'];
      }

      parsedProperties.push(parsed);
    }

    return parsedProperties;
  }

  /**
   * Resolves and returns the fully resolved schemas for all properties of the specified component.
   *
   * @param componentName The name of the component.
   * @returns A dictionary of property name to resolved schema.
   */
  resolveComponentPropertiesSchema(componentName: string): Record<string, CatalogComponentSchema> {
    if (this.schema == null || typeof this.schema !== 'object') {
      return {};
    }
    const root = this.schema;
    const components = root['components'];
    if (components == null || typeof components !== 'object' || Array.isArray(components)) {
      return {};
    }
    const componentsDict = components;
    if (!Object.prototype.hasOwnProperty.call(componentsDict, componentName)) {
      return {};
    }

    const componentSchema = componentsDict[componentName];
    const resolved = this.resolveInheritedDefinitions(componentSchema, root, new Set());

    const result: Record<string, CatalogComponentSchema> = {};
    for (const [name, propRawSchema] of Object.entries(resolved.properties)) {
      const resolvedProp = this.resolvePropertySchema(
        propRawSchema as CatalogComponentSchema,
        root,
        new Set(),
      );
      result[name] = resolvedProp;
    }
    return result;
  }

  /**
   * Recursively resolving inherited definitions.
   *
   * Why: JSON Schemas often use `$ref` inheritance or `allOf` compositions to share
   * fields. This method resolves those paths recursively to merge inherited properties into
   * a single flattened representation containing all available fields for the component.
   *
   * @param schemaObj The schema object to resolve.
   * @param rootSchema The root catalog schema.
   * @param visitedRefs Tracked references to prevent infinite loops.
   */
  private resolveInheritedDefinitions(
    schemaObj: CatalogComponentSchema | null | undefined,
    rootSchema: Catalog,
    visitedRefs: Set<string>,
  ): ResolvedSchema {
    const result: ResolvedSchema = {
      properties: {},
      required: new Set<string>(),
    };

    if (schemaObj == null || typeof schemaObj !== 'object') {
      return result;
    }

    const obj = schemaObj;
    this.resolveRef(obj, visitedRefs, rootSchema, result);
    this.resolveAllOf(obj, rootSchema, visitedRefs, result);

    if (
      obj['properties'] &&
      typeof obj['properties'] === 'object' &&
      !Array.isArray(obj['properties'])
    ) {
      const props = obj['properties'] as Record<string, unknown>;
      for (const [name, propSchema] of Object.entries(props)) {
        if (Object.prototype.hasOwnProperty.call(result.properties, name)) {
          result.properties[name] = this.mergePropertySchemas(result.properties[name], propSchema);
        } else {
          result.properties[name] = propSchema;
        }
      }
    }

    if (Array.isArray(obj['required'])) {
      for (const req of obj['required']) {
        if (typeof req === 'string') {
          result.required.add(req);
        }
      }
    }

    return result;
  }

  private resolveRef(
    obj: CatalogComponentSchema,
    visitedRefs: Set<string>,
    rootSchema: Catalog,
    result: ResolvedSchema,
  ) {
    if (typeof obj['$ref'] === 'string') {
      const ref = obj['$ref'];
      if (!visitedRefs.has(ref)) {
        const resolved = this.resolveJsonPointer(rootSchema, ref);
        if (resolved) {
          const nextVisited = new Set(visitedRefs);
          nextVisited.add(ref);
          const inherited = this.resolveInheritedDefinitions(
            resolved as CatalogComponentSchema,
            rootSchema,
            nextVisited,
          );
          this.mergeResolvedSchemas(result, inherited);
        } else {
          console.warn(`Failed to resolve schema reference: "${ref}"`);
        }
      }
    }
  }

  private resolveAllOf(
    obj: CatalogComponentSchema,
    rootSchema: Catalog,
    visitedRefs: Set<string>,
    result: ResolvedSchema,
  ) {
    if (Array.isArray(obj['allOf'])) {
      for (const subSchema of obj['allOf']) {
        const inherited = this.resolveInheritedDefinitions(
          subSchema as CatalogComponentSchema,
          rootSchema,
          visitedRefs,
        );
        this.mergeResolvedSchemas(result, inherited);
      }
    }
  }

  /**
   * Recursively resolves references and nested structure of a property schema.
   *
   * Why: This is the central coordinator for resolving property schemas. It delegates
   * specific keywords like reference, array items, and object properties to helper methods,
   * making the resolution process easier to understand and maintain.
   *
   * @param propSchema The schema definition of the property to resolve.
   * @param rootSchema The root catalog schema containing definitions for references.
   * @param visitedRefs Set of references visited in the current path to detect and prevent circular resolution loops.
   * @returns A fully resolved component schema with references inline and sub-schemas normalized.
   */
  private resolvePropertySchema(
    propSchema: CatalogComponentSchema | null | undefined,
    rootSchema: Catalog,
    visitedRefs: Set<string>,
  ): CatalogComponentSchema {
    if (propSchema == null || typeof propSchema !== 'object') {
      return {};
    }

    const original = propSchema;
    let merged: CatalogComponentSchema = {...original};

    merged = this.resolveReferenceSchema(merged, original, rootSchema, visitedRefs);
    merged = this.resolveAllOfSchema(merged, original, rootSchema, visitedRefs);
    merged = this.resolveUnionSchemas(merged, original, rootSchema, visitedRefs);
    merged = this.resolveArrayItemsSchema(merged, original, rootSchema, visitedRefs);
    merged = this.resolveObjectPropertiesSchema(merged, original, rootSchema, visitedRefs);

    return merged;
  }

  /**
   * Resolves `$ref` references in a schema, preventing circular loops using visitedRefs.
   *
   * Why: JSON Schema references ($ref) must be resolved to merge the referenced
   * definition properties into the current property's schema.
   */
  private resolveReferenceSchema(
    merged: CatalogComponentSchema,
    original: CatalogComponentSchema,
    rootSchema: Catalog,
    visitedRefs: Set<string>,
  ): CatalogComponentSchema {
    if (typeof original['$ref'] !== 'string') {
      return merged;
    }

    const ref = original['$ref'];
    // Avoid re-entering reference resolution if it's already in our visited path.
    if (visitedRefs.has(ref)) {
      return merged;
    }

    const resolved = this.resolveJsonPointer(rootSchema, ref);
    if (!resolved) {
      console.warn(`Failed to resolve property schema reference: "${ref}"`);
      return merged;
    }

    // Capture reference in visited path for downstream recursion.
    const nextVisited = new Set(visitedRefs);
    nextVisited.add(ref);
    const resolvedProp = this.resolvePropertySchema(
      resolved as CatalogComponentSchema,
      rootSchema,
      nextVisited,
    );

    // Strip the $ref tag to prevent infinite attempts to re-resolve it.
    const {$ref: _$ref, ...rest} = merged;
    return {...resolvedProp, ...rest};
  }

  /**
   * Merges multiple sub-schemas from an `allOf` array into a single schema.
   *
   * Why: 'allOf' represents an intersection of schemas. We flatten them by merging their properties
   * to provide a simplified view of the final object fields.
   */
  private resolveAllOfSchema(
    merged: CatalogComponentSchema,
    original: CatalogComponentSchema,
    rootSchema: Catalog,
    visitedRefs: Set<string>,
  ): CatalogComponentSchema {
    if (!Array.isArray(original['allOf'])) {
      return merged;
    }

    let allOfMerged: CatalogComponentSchema = {};
    for (const sub of original['allOf']) {
      const resolvedSub = this.resolvePropertySchema(
        sub as CatalogComponentSchema,
        rootSchema,
        visitedRefs,
      );
      allOfMerged = {...allOfMerged, ...resolvedSub};
    }

    // Strip allOf list so we don't try to process it again.
    const {allOf: _allOf, ...rest} = merged;
    return {...allOfMerged, ...rest};
  }

  /**
   * Resolves schemas within union types (`oneOf` and `anyOf`).
   *
   * Why: Union types specify alternative schemas for a property. We recursively resolve
   * each alternative so the UI generator can inspect the full options.
   */
  private resolveUnionSchemas(
    merged: CatalogComponentSchema,
    original: CatalogComponentSchema,
    rootSchema: Catalog,
    visitedRefs: Set<string>,
  ): CatalogComponentSchema {
    const result = {...merged};
    if (Array.isArray(original['oneOf'])) {
      result['oneOf'] = (original['oneOf'] as unknown[]).map(sub =>
        this.resolvePropertySchema(sub as CatalogComponentSchema, rootSchema, visitedRefs),
      );
    }
    if (Array.isArray(original['anyOf'])) {
      result['anyOf'] = (original['anyOf'] as unknown[]).map(sub =>
        this.resolvePropertySchema(sub as CatalogComponentSchema, rootSchema, visitedRefs),
      );
    }
    return result;
  }

  /**
   * Resolves the schema of items within an array property.
   *
   * Why: Array schemas define the structure of their items. We recursively resolve
   * the 'items' schema to handle nested lists or objects inside arrays.
   */
  private resolveArrayItemsSchema(
    merged: CatalogComponentSchema,
    original: CatalogComponentSchema,
    rootSchema: Catalog,
    visitedRefs: Set<string>,
  ): CatalogComponentSchema {
    if (!original['items'] || typeof original['items'] !== 'object') {
      return merged;
    }
    const result = {...merged};
    result['items'] = this.resolvePropertySchema(
      original['items'] as CatalogComponentSchema,
      rootSchema,
      visitedRefs,
    );
    return result;
  }

  /**
   * Resolves schemas for nested properties of an object schema.
   *
   * Why: Object schemas contain definitions for their properties. We recursively resolve
   * each property schema to build a fully resolved nested object tree.
   */
  private resolveObjectPropertiesSchema(
    merged: CatalogComponentSchema,
    original: CatalogComponentSchema,
    rootSchema: Catalog,
    visitedRefs: Set<string>,
  ): CatalogComponentSchema {
    if (
      !original['properties'] ||
      typeof original['properties'] !== 'object' ||
      Array.isArray(original['properties'])
    ) {
      return merged;
    }

    const result = {...merged};
    const resolvedProps = {...((result['properties'] as Record<string, unknown>) || {})};
    for (const [name, prop] of Object.entries(original['properties'] as Record<string, unknown>)) {
      resolvedProps[name] = this.resolvePropertySchema(
        prop as CatalogComponentSchema,
        rootSchema,
        visitedRefs,
      );
    }
    result['properties'] = resolvedProps;
    return result;
  }

  private resolveJsonPointerBase(targetSchema: unknown, relativePointer: string): unknown {
    if (!relativePointer.startsWith('#/')) {
      return undefined;
    }
    const parts = relativePointer.slice(2).split('/');
    let current: unknown = targetSchema;
    for (const part of parts) {
      if (current == null || typeof current !== 'object') {
        return undefined;
      }
      let key = part.replace(/~1/g, '/').replace(/~0/g, '~');
      try {
        key = decodeURIComponent(key);
      } catch {
        // Fallback to undecoded key if URI decoding fails.
      }
      // Security check: Block __proto__, constructor, and prototype to prevent prototype pollution attacks.
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return undefined;
      }
      current = (current as CatalogComponentSchema)[key];
    }
    return current;
  }

  /**
   * Resolves a JSON pointer against the root schema, fallback to embedded schemas if needed.
   *
   * Why: Schema references ($ref) point to internal definitions (e.g. '#/$defs/Icon')
   * or common schemas (e.g. 'common_types.json#/$defs/Color'). This method resolves the path
   * against the catalog or our embedded common types schema to retrieve the referenced definition.
   *
   * @param schema The root catalog schema.
   * @param pointer The JSON pointer to resolve.
   */
  private resolveJsonPointer(schema: Catalog, pointer: string): unknown {
    let relativePointer = pointer;
    const hashIndex = pointer.indexOf('#');
    if (hashIndex !== -1) {
      relativePointer = pointer.slice(hashIndex);
    }

    if (pointer.includes('common_types.json')) {
      const localResolved = this.resolveJsonPointerBase(schema, relativePointer);
      if (localResolved !== undefined) {
        return localResolved;
      }
      return this.resolveJsonPointerBase(COMMON_TYPES_SCHEMA, relativePointer);
    }

    const resolved = this.resolveJsonPointerBase(schema, relativePointer);
    if (resolved !== undefined) {
      return resolved;
    }

    if (relativePointer.startsWith('#/$defs/')) {
      return this.resolveJsonPointerBase(COMMON_TYPES_SCHEMA, relativePointer);
    }

    return undefined;
  }

  private mergeResolvedSchemas(target: ResolvedSchema, source: ResolvedSchema): void {
    for (const [name, prop] of Object.entries(source.properties)) {
      if (Object.prototype.hasOwnProperty.call(target.properties, name)) {
        target.properties[name] = this.mergePropertySchemas(target.properties[name], prop);
      } else {
        target.properties[name] = prop;
      }
    }
    for (const req of source.required) {
      target.required.add(req);
    }
  }

  private mergePropertySchemas(a: unknown, b: unknown): unknown {
    if (b == null) return a;
    if (a == null) return b;
    if (typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
      const merged: Record<string, unknown> = {...a} as Record<string, unknown>;
      const bObj = b as Record<string, unknown>;
      for (const [key, val] of Object.entries(bObj)) {
        if (Object.prototype.hasOwnProperty.call(merged, key)) {
          merged[key] = this.mergePropertySchemas(merged[key], val);
        } else {
          merged[key] = val;
        }
      }
      return merged;
    }
    return b;
  }

  private getPropertyType(schema: CatalogComponentSchema): string {
    if (typeof schema['type'] === 'string') {
      return schema['type'];
    }
    if (Array.isArray(schema['type'])) {
      return (schema['type'] as unknown[]).filter(t => typeof t === 'string').join(' | ');
    }
    if (schema['const'] !== undefined) {
      return schema['const'] === null ? 'null' : typeof schema['const'];
    }
    if (Array.isArray(schema['enum']) && schema['enum'].length > 0) {
      const types = new Set<string>();
      for (const val of schema['enum'] as unknown[]) {
        types.add(val === null ? 'null' : typeof val);
      }
      return Array.from(types).join(' | ');
    }
    if (Array.isArray(schema['oneOf'])) {
      const types = this.getTypesFromSubSchemas(schema['oneOf'] as unknown[]);
      if (types.length > 0) {
        return types.join(' | ');
      }
    }
    if (Array.isArray(schema['anyOf'])) {
      const types = this.getTypesFromSubSchemas(schema['anyOf'] as unknown[]);
      if (types.length > 0) {
        return types.join(' | ');
      }
    }
    if (
      schema['properties'] &&
      typeof schema['properties'] === 'object' &&
      !Array.isArray(schema['properties'])
    ) {
      return 'object';
    }
    return 'unknown';
  }

  private getTypesFromSubSchemas(subSchemas: unknown[]): string[] {
    const types = new Set<string>();
    for (const sub of subSchemas) {
      const subType = this.getPropertyType(sub as CatalogComponentSchema);
      if (subType && subType !== 'unknown') {
        types.add(subType);
      }
    }
    return Array.from(types);
  }
}
