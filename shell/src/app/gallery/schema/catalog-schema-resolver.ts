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
    const resolved = this.resolveSchema(componentSchema, root, new Set());

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

  private resolveSchema(
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

    if (typeof obj['$ref'] === 'string') {
      const ref = obj['$ref'];
      if (!visitedRefs.has(ref)) {
        const resolved = this.resolveJsonPointer(rootSchema, ref);
        if (resolved) {
          const nextVisited = new Set(visitedRefs);
          nextVisited.add(ref);
          const inherited = this.resolveSchema(
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

    if (Array.isArray(obj['allOf'])) {
      for (const subSchema of obj['allOf']) {
        const inherited = this.resolveSchema(
          subSchema as CatalogComponentSchema,
          rootSchema,
          visitedRefs,
        );
        this.mergeResolvedSchemas(result, inherited);
      }
    }

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

  private resolvePropertySchema(
    propSchema: CatalogComponentSchema | null | undefined,
    rootSchema: Catalog,
    visitedRefs: Set<string>,
  ): CatalogComponentSchema {
    if (propSchema == null || typeof propSchema !== 'object') {
      return {};
    }

    const obj = propSchema;
    let merged: CatalogComponentSchema = {...obj};

    if (typeof obj['$ref'] === 'string') {
      const ref = obj['$ref'];
      if (!visitedRefs.has(ref)) {
        const resolved = this.resolveJsonPointer(rootSchema, ref);
        if (resolved) {
          const nextVisited = new Set(visitedRefs);
          nextVisited.add(ref);
          const resolvedProp = this.resolvePropertySchema(
            resolved as CatalogComponentSchema,
            rootSchema,
            nextVisited,
          );
          const {$ref: _$ref, ...rest} = merged;
          merged = {...resolvedProp, ...rest};
        } else {
          console.warn(`Failed to resolve property schema reference: "${ref}"`);
        }
      }
    }

    if (Array.isArray(obj['allOf'])) {
      let allOfMerged: CatalogComponentSchema = {};
      for (const sub of obj['allOf']) {
        const resolvedSub = this.resolvePropertySchema(
          sub as CatalogComponentSchema,
          rootSchema,
          visitedRefs,
        );
        allOfMerged = {...allOfMerged, ...resolvedSub};
      }
      const {allOf: _allOf, ...rest} = merged;
      merged = {...allOfMerged, ...rest};
    }

    if (Array.isArray(obj['oneOf'])) {
      merged['oneOf'] = (obj['oneOf'] as unknown[]).map(sub =>
        this.resolvePropertySchema(sub as CatalogComponentSchema, rootSchema, visitedRefs),
      );
    }
    if (Array.isArray(obj['anyOf'])) {
      merged['anyOf'] = (obj['anyOf'] as unknown[]).map(sub =>
        this.resolvePropertySchema(sub as CatalogComponentSchema, rootSchema, visitedRefs),
      );
    }

    return merged;
  }

  private resolveJsonPointer(schema: Catalog, pointer: string): unknown {
    let relativePointer = pointer;
    const hashIndex = pointer.indexOf('#');
    if (hashIndex !== -1) {
      relativePointer = pointer.slice(hashIndex);
    }
    if (!relativePointer.startsWith('#/')) {
      return undefined;
    }
    const parts = relativePointer.slice(2).split('/');
    let current: unknown = schema;
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
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return undefined;
      }
      current = (current as CatalogComponentSchema)[key];
    }
    return current;
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
