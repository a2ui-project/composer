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

import {expect} from 'vitest';
import {CreateSurfaceMessageSchema} from '@a2ui/web_core/v1_0';
import {BASIC_COMPONENTS} from '@a2ui/web_core/catalogs/basic/v1';
import type {ComponentUsages} from 'a2ui-bridge';

/**
 * Asserts that all component usage examples in a component usages dictionary
 * (or array of component specifications) conform to the A2UI v1.0
 * CreateSurfaceMessageSchema and their corresponding BASIC_COMPONENTS schemas.
 *
 * @param usages The component usages dictionary or array to validate.
 */
export function assertValidV10ComponentUsages(
  usages: ComponentUsages | ReadonlyArray<Record<string, unknown>>,
): void {
  const basicComponentsMap = new Map(BASIC_COMPONENTS.map(c => [c.name, c]));

  if (Array.isArray(usages)) {
    for (const compDef of usages) {
      const compName = (compDef as Record<string, unknown>)['component'] as string;
      const compId = (compDef as Record<string, unknown>)['id'] as string;
      const compApi = basicComponentsMap.get(compName);
      expect(compApi, `Component "${compName}" is not a valid v1.0 Basic component`).toBeDefined();

      const {id: _id, component: _component, ...props} = compDef as Record<string, unknown>;
      const compResult = compApi!.schema.safeParse(props);
      expect(
        compResult.success,
        `Component "${compName}" (id: "${compId}") failed schema validation: ${compResult.error?.message}`,
      ).toBe(true);
    }
    return;
  }

  const entries = Object.entries(usages);
  expect(entries.length).toBeGreaterThan(0);

  for (const [componentName, usageEntry] of entries) {
    const message = {
      version: '1.0',
      createSurface: {
        surfaceId: `test-${componentName}`,
        catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
        components: usageEntry.usage,
        ...(usageEntry.data ? {dataModel: usageEntry.data} : {}),
      },
    };

    const messageResult = CreateSurfaceMessageSchema.safeParse(message);
    expect(
      messageResult.success,
      `Usage envelope failed CreateSurfaceMessageSchema for ${componentName}: ${messageResult.error?.message}`,
    ).toBe(true);

    for (const compDef of usageEntry.usage) {
      const compName = (compDef as Record<string, unknown>)['component'] as string;
      const compId = (compDef as Record<string, unknown>)['id'] as string;
      const compApi = basicComponentsMap.get(compName);
      expect(
        compApi,
        `Component "${compName}" in ${componentName} is not a valid v1.0 Basic component`,
      ).toBeDefined();

      const {id: _id, component: _component, ...props} = compDef as Record<string, unknown>;
      const compResult = compApi!.schema.safeParse(props);
      expect(
        compResult.success,
        `Component "${compName}" (id: "${compId}") in ${componentName} failed schema validation: ${compResult.error?.message}`,
      ).toBe(true);
    }
  }
}
