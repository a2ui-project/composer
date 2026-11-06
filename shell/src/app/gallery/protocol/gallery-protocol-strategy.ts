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

import type {A2uiProtocolVersion, ComponentUsage} from 'a2ui-bridge';
import type {
  Catalog,
  CatalogComponentSchema,
  CatalogJson,
} from '../../storage/models/catalog-storage.model';
import {V09GalleryStrategy} from './v0-9-gallery-strategy';
import {V10GalleryStrategy} from './v1-0-gallery-strategy';

/**
 * Tracks the origin catalog and component metadata for a component in the gallery.
 */
export interface ComponentProvenance {
  componentKey: string;
  componentSchema: CatalogComponentSchema;
  catalogId: string;
  catalogTitle: string;
  catalog: Catalog;
}

/**
 * Strategy interface abstracting protocol-specific Gallery behaviors between
 * A2UI v0.9 and v1.0.
 */
export interface GalleryProtocolStrategy {
  readonly version: A2uiProtocolVersion;

  /**
   * Constructs the A2UI preview command payload array for rendering.
   */
  buildPreviewPayload(preset: ComponentUsage, catalogId: string, surfaceId?: string): unknown[];

  /**
   * Extracts components across one or more catalogs, mapping component keys
   * to their provenance and definition.
   */
  extractComponents(
    catalogs: CatalogJson[] | CatalogJson | null | undefined,
  ): Map<string, ComponentProvenance>;

  /**
   * Checks whether a value represents a protocol-specific dynamic binding.
   */
  isDynamicBinding(value: unknown): boolean;

  /**
   * Checks whether a value represents a protocol-specific dynamic call expression.
   */
  isDynamicCall(value: unknown): boolean;

  /**
   * Returns a user-facing explanation of an uneditable dynamic binding or expression,
   * or null if the value is not a dynamic binding or expression.
   */
  describeDynamicValue(value: unknown): string | null;
}

let v09GalleryStrategy: V09GalleryStrategy | null = null;
let v10GalleryStrategy: V10GalleryStrategy | null = null;

function getV09GalleryStrategy(): V09GalleryStrategy {
  return (v09GalleryStrategy ??= new V09GalleryStrategy());
}

function getV10GalleryStrategy(): V10GalleryStrategy {
  return (v10GalleryStrategy ??= new V10GalleryStrategy());
}

/**
 * Checks whether a value represents a dynamic binding in either v0.9 (`{path}`)
 * or v1.0 (`{'@path'}`).
 *
 * @param value The value to inspect.
 * @returns `true` if value is a dynamic binding, `false` otherwise.
 */
export function isAnyDynamicBinding(value: unknown): boolean {
  return (
    getV09GalleryStrategy().isDynamicBinding(value) ||
    getV10GalleryStrategy().isDynamicBinding(value)
  );
}

/**
 * Checks whether a value represents a dynamic call expression in either v0.9 (`{call}`)
 * or v1.0 (`{'@call'}`).
 *
 * @param value The value to inspect.
 * @returns `true` if value is a dynamic call expression, `false` otherwise.
 */
export function isAnyDynamicCall(value: unknown): boolean {
  return (
    getV09GalleryStrategy().isDynamicCall(value) || getV10GalleryStrategy().isDynamicCall(value)
  );
}

/**
 * Returns true if a value represents a dynamic binding or call expression across
 * any supported protocol version.
 *
 * @param value The value to inspect.
 * @returns `true` if value is any dynamic value, `false` otherwise.
 */
export function isAnyDynamicValue(value: unknown): boolean {
  return isAnyDynamicBinding(value) || isAnyDynamicCall(value);
}

/**
 * Describes an uneditable dynamic binding or expression across protocol versions,
 * or returns null if the value is not a dynamic binding or expression.
 *
 * @param value The value to describe.
 * @returns Human-readable description of the dynamic value, or `null`.
 */
export function describeAnyDynamicValue(value: unknown): string | null {
  return (
    getV10GalleryStrategy().describeDynamicValue(value) ??
    getV09GalleryStrategy().describeDynamicValue(value)
  );
}

/**
 * Normalizes component payload arrays so that the root component uses id 'root'
 * if an example used 'target'.
 *
 * @param components Array of component records to normalize.
 * @returns Normalized array of component records.
 */
export function getComponentsPayload(
  components: Record<string, unknown>[],
): Record<string, unknown>[] {
  if (components.some(component => component['id'] === 'root')) {
    return components;
  }
  return components.map(component =>
    component['id'] === 'target' ? {...component, ['id']: 'root'} : component,
  );
}
