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

import {BASIC_COMPONENTS} from '@a2ui/web_core/catalogs/basic/v1';

/** Map of standard v1.0 basic catalog component specifications keyed by component name. */
export const BASIC_COMPONENTS_MAP = new Map(BASIC_COMPONENTS.map(api => [api.name, api]));

export interface ValidateComponentsOptions {
  requireRoot?: boolean;
}

/**
 * Extracts accumulated surface components across a sequence of A2UI messages,
 * ensuring unique IDs per message and replacing updated components in the map.
 *
 * @param messages Array of A2UI messages (createSurface / updateComponents).
 * @param contextName Optional context description for error reporting.
 * @returns Array of unique components representing the final surface.
 */
export function extractSurfaceComponents(
  messages: Array<Record<string, unknown>>,
  contextName = 'surface',
): Array<Record<string, unknown>> {
  const compMap = new Map<string, Record<string, unknown>>();

  for (const message of messages) {
    const list =
      (message['createSurface'] as {components?: Array<Record<string, unknown>>} | undefined)
        ?.components ||
      (message['updateComponents'] as {components?: Array<Record<string, unknown>>} | undefined)
        ?.components ||
      [];

    const seenInMessage = new Set<string>();
    for (const comp of list) {
      const id = comp['id'] as string;
      if (seenInMessage.has(id)) {
        throw new Error(`${contextName}: duplicate component id "${id}" within message.`);
      }
      seenInMessage.add(id);
      compMap.set(id, comp);
    }
  }

  return Array.from(compMap.values());
}

/**
 * Collects all child component IDs referenced by a component's props.
 */
export function getChildReferences(props: Record<string, unknown>): string[] {
  const childRefs: string[] = [];

  if (typeof props['child'] === 'string') {
    childRefs.push(props['child']);
  }

  const children = props['children'];
  if (Array.isArray(children)) {
    for (const child of children) {
      if (typeof child === 'string') {
        childRefs.push(child);
      }
    }
  } else if (
    children &&
    typeof children === 'object' &&
    typeof (children as {componentId?: unknown}).componentId === 'string'
  ) {
    childRefs.push((children as {componentId: string}).componentId);
  }

  if (typeof props['trigger'] === 'string') {
    childRefs.push(props['trigger']);
  }

  if (typeof props['content'] === 'string') {
    childRefs.push(props['content']);
  }

  const tabs = props['tabs'];
  if (Array.isArray(tabs)) {
    for (const tab of tabs) {
      if (tab && typeof tab === 'object' && typeof (tab as {child?: unknown}).child === 'string') {
        childRefs.push((tab as {child: string}).child);
      }
    }
  }

  return childRefs;
}

/**
 * Validates that an array of A2UI v1.0 components has a root, unique IDs,
 * valid component schema according to BASIC_COMPONENTS, and valid child references.
 *
 * @param components Array of component definition objects.
 * @param contextName Descriptive name for error messages (e.g. filename or component name).
 * @param options Optional configuration flags (e.g. requireRoot).
 */
export function validateV10Components(
  components: ReadonlyArray<Record<string, unknown>>,
  contextName = 'components',
  options: ValidateComponentsOptions = {},
): void {
  const requireRoot = options.requireRoot ?? true;
  const ids = new Set(components.map(c => c['id'] as string));

  if (requireRoot && !ids.has('root')) {
    throw new Error(`${contextName}: needs a root and unique component ids.`);
  }

  if (ids.size !== components.length) {
    throw new Error(`${contextName}: needs a root and unique component ids.`);
  }

  for (const comp of components) {
    const {id, component, ...props} = comp;
    const compName = component as string;
    const compId = id as string;

    const api = BASIC_COMPONENTS_MAP.get(compName);
    if (!api) {
      throw new Error(`${contextName}: unknown basic component ${compName}.`);
    }

    try {
      const rawSchema = api.schema as unknown as {
        strict?: () => {parse: (v: unknown) => unknown};
        parse: (v: unknown) => unknown;
      };
      const schema =
        typeof rawSchema.strict === 'function' ? rawSchema.strict() : rawSchema;
      schema.parse(props);
    } catch (cause) {
      throw new Error(
        `${contextName}: component "${compName}" (id: "${compId}") failed schema validation: ${(cause as Error).message}`,
        {cause},
      );
    }

    const childRefs = getChildReferences(props);
    for (const child of childRefs) {
      if (!ids.has(child)) {
        throw new Error(`${contextName}: ${compId} references missing child ${child}.`);
      }
    }
  }
}
