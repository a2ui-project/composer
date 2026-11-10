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

import type {ComponentUsages} from 'a2ui-bridge';

const baseSchemaResolvers = new WeakMap<object, (this: unknown) => unknown>();

/**
 * Attaches component usage examples and enriched metadata to an A2UI catalog's
 * runtime components and `catalogSchema` for Composer and Gallery inspection.
 *
 * @param catalog The catalog instance whose components and schema will be enriched.
 * @param usages Component usage definitions keyed by component name.
 * @returns The enriched catalog instance.
 */
export function attachCatalogSchema<
  T extends {
    components?: ReadonlyMap<string, unknown> | Map<string, unknown>;
    catalogSchema?: unknown;
  },
>(catalog: T, usages: ComponentUsages): T {
  const ownDesc = Object.getOwnPropertyDescriptor(catalog, 'catalogSchema');
  if ((ownDesc && !ownDesc.configurable) || !Object.isExtensible(catalog)) {
    return catalog;
  }

  if (catalog.components && typeof catalog.components.entries === 'function') {
    for (const [name, comp] of catalog.components.entries()) {
      if (usages[name] && comp && typeof comp === 'object' && Object.isExtensible(comp)) {
        try {
          (comp as Record<string, unknown>)['examples'] = [usages[name]];
          (comp as Record<string, unknown>)['example'] = usages[name];
        } catch {
          // Degrade gracefully if component object cannot be mutated.
        }
      }
    }
  }

  let resolveBaseSchema = baseSchemaResolvers.get(catalog);
  if (!resolveBaseSchema) {
    const baseGetter = findPropertyGetter(catalog, 'catalogSchema');
    const initialSchema = baseGetter ? undefined : catalog.catalogSchema;
    resolveBaseSchema = function (this: unknown) {
      return baseGetter ? baseGetter.call(this) : initialSchema || {};
    };
    baseSchemaResolvers.set(catalog, resolveBaseSchema);
  }

  Object.defineProperty(catalog, 'catalogSchema', {
    get() {
      const base = (resolveBaseSchema!.call(this) ?? {}) as Record<string, unknown>;
      const schema: Record<string, unknown> = {
        title: 'Basic Catalog',
        description: 'Unified catalog of basic A2UI components and functions.',
        ...base,
        examples: usages,
      };
      if (schema['components'] && typeof schema['components'] === 'object') {
        const components = {
          ...(schema['components'] as Record<string, Record<string, unknown>>),
        };
        for (const [key, compUsage] of Object.entries(usages)) {
          if (components[key]) {
            components[key] = {
              ...components[key],
              examples: [compUsage],
              example: compUsage,
            };
          }
        }
        schema['components'] = components;
      }
      return schema;
    },
    configurable: true,
    enumerable: true,
  });

  return catalog;
}

/**
 * Traverses an object and its prototype chain to find a property getter descriptor.
 *
 * @param obj The object (and its prototype chain) to inspect.
 * @param prop The name of the property.
 * @returns The getter function if found on the object or any prototype, otherwise undefined.
 */
function findPropertyGetter(obj: unknown, prop: string): (() => unknown) | undefined {
  let curr: object | null =
    (typeof obj === 'object' && obj !== null) || typeof obj === 'function' ? (obj as object) : null;
  while (curr) {
    const desc = Object.getOwnPropertyDescriptor(curr, prop);
    if (desc) {
      return desc.get;
    }
    curr = Object.getPrototypeOf(curr);
  }
  return undefined;
}
