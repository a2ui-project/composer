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

const baseSchemaResolvers = new WeakMap<object, (this: unknown) => unknown>();

/**
 * Attaches title and description defaults to an A2UI catalog's `catalogSchema`
 * for Composer and Gallery inspection without serializing component usage examples.
 *
 * @param catalog The catalog instance whose schema will be enriched with title and description.
 * @returns The enriched catalog instance.
 */
export function attachCatalogSchema<
  T extends {
    catalogSchema?: unknown;
  },
>(catalog: T): T {
  const ownDesc = Object.getOwnPropertyDescriptor(catalog, 'catalogSchema');
  if ((ownDesc && !ownDesc.configurable) || !Object.isExtensible(catalog)) {
    return catalog;
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
      return {
        title: 'Basic Catalog',
        description: 'Unified catalog of basic A2UI components and functions.',
        ...base,
      };
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
