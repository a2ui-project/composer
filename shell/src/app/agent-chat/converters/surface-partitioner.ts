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

import {RenderA2uiItem} from 'a2ui-bridge';
import {CanvasArtifact} from '../chat-message/types';

interface ExtractedCanvasInfo {
  isCanvas: boolean;
  cardTitle?: string;
  cardDescription?: string;
  cardIcon?: string;
  autoOpen?: boolean;
  childIds: string[];
}

function extractStringProp(val: unknown): string | undefined {
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, unknown>;
    if (typeof obj['literalString'] === 'string') return obj['literalString'];
    if (typeof obj['path'] === 'string') return obj['path'];
  }
  return undefined;
}

function extractBooleanProp(val: unknown, defaultVal: boolean): boolean {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    if (val.toLowerCase() === 'true') return true;
    if (val.toLowerCase() === 'false') return false;
  }
  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, unknown>;
    if (typeof obj['literalBoolean'] === 'boolean') return obj['literalBoolean'];
    if (typeof obj['literalBoolean'] === 'string') {
      return obj['literalBoolean'].toLowerCase() === 'true';
    }
  }
  return defaultVal;
}

function extractChildIds(childVal: unknown): string[] {
  if (Array.isArray(childVal)) {
    return childVal.map(item =>
      typeof item === 'string' ? item : String((item as Record<string, unknown>)?.['id'] || item),
    );
  }
  if (typeof childVal === 'string') {
    return [childVal];
  }
  return [];
}

interface ExtractedCardMetadata {
  cardTitle?: string;
  cardDescription?: string;
  cardIcon?: string;
  autoOpen?: boolean;
}

function extractCardMetadata(
  primary: Record<string, unknown>,
  fallback?: Record<string, unknown>,
): ExtractedCardMetadata {
  const cardTitle =
    extractStringProp(primary['cardTitle']) ||
    extractStringProp(primary['title']) ||
    extractStringProp(primary['label']) ||
    extractStringProp(primary['name']) ||
    (fallback &&
      (extractStringProp(fallback['cardTitle']) ||
        extractStringProp(fallback['title']) ||
        extractStringProp(fallback['label']) ||
        extractStringProp(fallback['name'])));

  const cardDescription =
    extractStringProp(primary['cardDescription']) ||
    extractStringProp(primary['description']) ||
    (fallback &&
      (extractStringProp(fallback['cardDescription']) ||
        extractStringProp(fallback['description'])));

  const cardIcon =
    extractStringProp(primary['cardIcon']) ||
    extractStringProp(primary['icon']) ||
    (fallback && (extractStringProp(fallback['cardIcon']) || extractStringProp(fallback['icon'])));

  const autoOpen =
    'autoOpen' in primary
      ? extractBooleanProp(primary['autoOpen'], true)
      : fallback && 'autoOpen' in fallback
        ? extractBooleanProp(fallback['autoOpen'], true)
        : undefined;

  return {cardTitle, cardDescription, cardIcon, autoOpen};
}

function extractFromFlatCanvas(obj: Record<string, unknown>): ExtractedCanvasInfo {
  const metadata = extractCardMetadata(obj);
  const childVal = obj['children'] || obj['child'] || obj['content'] || obj['items'];
  return {
    isCanvas: true,
    ...metadata,
    childIds: extractChildIds(childVal),
  };
}

function extractFromNestedCanvas(
  obj: Record<string, unknown>,
  compRecord: Record<string, unknown>,
): ExtractedCanvasInfo | null {
  for (const key of Object.keys(compRecord)) {
    if (key.toLowerCase() === 'canvas') {
      const canvasProps = (compRecord[key] as Record<string, unknown>) || {};
      const metadata = extractCardMetadata(canvasProps, obj);
      const childVal =
        canvasProps['children'] ||
        canvasProps['child'] ||
        canvasProps['content'] ||
        canvasProps['items'] ||
        obj['children'] ||
        obj['child'];
      return {
        isCanvas: true,
        ...metadata,
        childIds: extractChildIds(childVal),
      };
    }
  }
  return null;
}

function getCanvasInfo(c: unknown): ExtractedCanvasInfo {
  if (!c || typeof c !== 'object') {
    return {isCanvas: false, childIds: []};
  }
  const obj = c as Record<string, unknown>;
  const compVal = obj['component'];

  // Flat / legacy string format: { component: "Canvas", ... }
  if (typeof compVal === 'string' && compVal.toLowerCase() === 'canvas') {
    return extractFromFlatCanvas(obj);
  }

  // Standard v0.9 object mapping: { component: { Canvas: { ... } } }
  if (typeof compVal === 'object' && compVal !== null) {
    const nestedInfo = extractFromNestedCanvas(obj, compVal as Record<string, unknown>);
    if (nestedInfo) {
      return nestedInfo;
    }
  }

  return {isCanvas: false, childIds: []};
}

function extractChildReferences(comp: Record<string, unknown>): string[] {
  const refs: string[] = [];

  function collectFrom(val: unknown): void {
    if (!val) return;
    if (typeof val === 'string') {
      refs.push(val);
    } else if (Array.isArray(val)) {
      for (const item of val) {
        if (typeof item === 'string') {
          refs.push(item);
        } else if (typeof item === 'object' && item !== null) {
          collectFrom((item as Record<string, unknown>)['id'] || item);
        }
      }
    } else if (typeof val === 'object') {
      const obj = val as Record<string, unknown>;
      if ('child' in obj) collectFrom(obj['child']);
      if ('children' in obj) collectFrom(obj['children']);
      if ('items' in obj) collectFrom(obj['items']);
      if ('content' in obj) collectFrom(obj['content']);
    }
  }

  collectFrom(comp['child']);
  collectFrom(comp['children']);
  collectFrom(comp['items']);
  collectFrom(comp['content']);

  const compVal = comp['component'];
  if (typeof compVal === 'object' && compVal !== null) {
    for (const key of Object.keys(compVal as Record<string, unknown>)) {
      const props = (compVal as Record<string, unknown>)[key];
      if (typeof props === 'object' && props !== null) {
        collectFrom((props as Record<string, unknown>)['child']);
        collectFrom((props as Record<string, unknown>)['children']);
        collectFrom((props as Record<string, unknown>)['items']);
        collectFrom((props as Record<string, unknown>)['content']);
      }
    }
  }

  return refs;
}

function removeReferences(
  comp: Record<string, unknown>,
  idsToRemove: Set<string>,
): Record<string, unknown> {
  const cloned = structuredClone(comp);

  function sanitize(obj: Record<string, unknown>): void {
    if (Array.isArray(obj['children'])) {
      obj['children'] = obj['children'].filter((item: unknown) => {
        const id = typeof item === 'string' ? item : (item as Record<string, unknown>)?.['id'];
        return !idsToRemove.has(String(id));
      });
    }
    if (Array.isArray(obj['items'])) {
      obj['items'] = obj['items'].filter((item: unknown) => {
        const id = typeof item === 'string' ? item : (item as Record<string, unknown>)?.['id'];
        return !idsToRemove.has(String(id));
      });
    }
    if (typeof obj['child'] === 'string' && idsToRemove.has(obj['child'])) {
      delete obj['child'];
    }
  }

  sanitize(cloned);
  const compVal = cloned['component'];
  if (typeof compVal === 'object' && compVal !== null) {
    for (const key of Object.keys(compVal as Record<string, unknown>)) {
      const props = (compVal as Record<string, unknown>)[key];
      if (typeof props === 'object' && props !== null) {
        sanitize(props as Record<string, unknown>);
      }
    }
  }

  return cloned;
}

/**
 * Checks if a list of A2UI layout items explicitly contains a "Canvas" component node.
 */
export function hasA2uiCanvasComponent(items: RenderA2uiItem[]): boolean {
  if (!items || !Array.isArray(items) || items.length === 0) return false;
  return items.some(item => {
    if (item.updateComponents?.components && Array.isArray(item.updateComponents.components)) {
      return item.updateComponents.components.some(c => getCanvasInfo(c).isCanvas);
    }
    if (item.createSurface) {
      if (getCanvasInfo(item.createSurface).isCanvas) return true;
    }
    return getCanvasInfo(item).isCanvas;
  });
}

/**
 * Normalizes an array of raw layout updates into valid `RenderA2uiItem` specifications.
 */
export function normalizeA2uiItems(items: unknown[]): RenderA2uiItem[] {
  if (!items || !Array.isArray(items)) return [];

  return items
    .map(item => {
      if (typeof item === 'object' && item !== null) {
        const itemObj = item as Record<string, unknown>;
        return {
          version: 'v0.9',
          ...itemObj,
        } as RenderA2uiItem;
      }
      return null;
    })
    .filter((item): item is RenderA2uiItem => item !== null);
}

/**
 * Partitioned A2UI surface structure separating inline chat components and RHS canvas subtrees.
 */
export interface PartitionedA2uiSurface {
  /** The surface payload rendered inline in the chat bubble (e.g. List + non-Canvas cards). */
  inlinePayload: RenderA2uiItem[] | null;
  /** Array of isolated Canvas artifacts extracted from each Canvas component in the surface. */
  canvasArtifacts: CanvasArtifact[];
  /** Whether the surface contains at least one Canvas component. */
  hasCanvas: boolean;
}

interface CategorizedSurfaceItems {
  createSurfaceItems: RenderA2uiItem[];
  updateDataModelItems: RenderA2uiItem[];
  allComponents: Array<Record<string, unknown>>;
  otherItems: RenderA2uiItem[];
}

function categorizeSurfaceItems(items: RenderA2uiItem[]): CategorizedSurfaceItems {
  const allComponents: Array<Record<string, unknown>> = [];
  const createSurfaceItems: RenderA2uiItem[] = [];
  const updateDataModelItems: RenderA2uiItem[] = [];
  const otherItems: RenderA2uiItem[] = [];

  for (const item of items) {
    if (item.createSurface) {
      createSurfaceItems.push(item);
    }
    if (item.updateDataModel) {
      updateDataModelItems.push(item);
    }
    if (item.updateComponents?.components && Array.isArray(item.updateComponents.components)) {
      for (const comp of item.updateComponents.components) {
        if (typeof comp === 'object' && comp !== null) {
          allComponents.push(comp as Record<string, unknown>);
        }
      }
    } else if (!item.createSurface && !item.updateDataModel) {
      otherItems.push(item);
    }
  }

  return {createSurfaceItems, updateDataModelItems, allComponents, otherItems};
}

function buildComponentMap(
  components: Array<Record<string, unknown>>,
): Map<string, Record<string, unknown>> {
  const compMap = new Map<string, Record<string, unknown>>();
  for (const comp of components) {
    const id = String(comp['id'] || '');
    if (id) compMap.set(id, comp);
  }
  return compMap;
}

function collectDescendantIds(
  childRootIds: Set<string>,
  compMap: Map<string, Record<string, unknown>>,
): Set<string> {
  const descendantIds = new Set<string>(childRootIds);
  const queue = Array.from(childRootIds);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const childComp = compMap.get(currentId);
    if (!childComp) continue;

    const childRefs = extractChildReferences(childComp);
    for (const ref of childRefs) {
      if (!descendantIds.has(ref)) {
        descendantIds.add(ref);
        queue.push(ref);
      }
    }
  }

  return descendantIds;
}

function formatCanvasComponents(
  components: Array<Record<string, unknown>>,
  childRootIds: Set<string>,
): Array<Record<string, unknown>> {
  if (components.length === 0) return components;

  const hasRoot = components.some(c => c['id'] === 'root');
  if (hasRoot) return components;

  if (childRootIds.size === 1) {
    const rootId = Array.from(childRootIds)[0];
    return components.map(c => {
      if (c['id'] === rootId) {
        return {...c, id: 'root'};
      }
      return c;
    });
  }

  if (childRootIds.size > 1) {
    return [
      {
        id: 'root',
        component: 'Column',
        children: Array.from(childRootIds),
      },
      ...components,
    ];
  }

  return components;
}

interface ExtractedArtifactsResult {
  canvasArtifacts: CanvasArtifact[];
  canvasCompIds: Set<string>;
  allCanvasDescendantIds: Set<string>;
}

function extractCanvasArtifacts(
  allComponents: Array<Record<string, unknown>>,
  compMap: Map<string, Record<string, unknown>>,
  createSurfaceItems: RenderA2uiItem[],
  updateDataModelItems: RenderA2uiItem[],
  otherItems: RenderA2uiItem[],
): ExtractedArtifactsResult {
  const canvasArtifacts: CanvasArtifact[] = [];
  const canvasCompIds = new Set<string>();
  const allCanvasDescendantIds = new Set<string>();

  for (const comp of allComponents) {
    const info = getCanvasInfo(comp);
    if (!info.isCanvas) continue;

    const compId = String(comp['id'] || '');
    if (compId) canvasCompIds.add(compId);

    const childRootIds = new Set<string>(info.childIds);
    const canvasDescendantIds = collectDescendantIds(childRootIds, compMap);
    for (const id of canvasDescendantIds) {
      allCanvasDescendantIds.add(id);
    }

    let canvasComponents = allComponents.filter(c => {
      const id = String(c['id'] || '');
      return canvasDescendantIds.has(id);
    });

    if (canvasComponents.length > 0) {
      canvasComponents = formatCanvasComponents(canvasComponents, childRootIds);

      const surfaceId = createSurfaceItems[0]?.createSurface?.surfaceId || 'default';
      const individualPayload: RenderA2uiItem[] = [
        ...createSurfaceItems,
        ...updateDataModelItems,
        {
          version: 'v0.9',
          updateComponents: {
            surfaceId,
            components: canvasComponents,
          },
        } as RenderA2uiItem,
        ...otherItems,
      ];

      const cardTitle = info.cardTitle || 'Interactive content';
      const cardDescription = info.cardDescription;
      const cardIcon = info.cardIcon || 'apps';
      const autoOpen = info.autoOpen !== undefined ? info.autoOpen : true;

      canvasArtifacts.push({
        id: compId || `canvas-${canvasArtifacts.length}`,
        cardTitle,
        cardDescription,
        cardIcon,
        autoOpen,
        payload: individualPayload,
      });
    }
  }

  return {canvasArtifacts, canvasCompIds, allCanvasDescendantIds};
}

function buildInlineSurfacePayload(
  allComponents: Array<Record<string, unknown>>,
  canvasCompIds: Set<string>,
  allCanvasDescendantIds: Set<string>,
  createSurfaceItems: RenderA2uiItem[],
  updateDataModelItems: RenderA2uiItem[],
  otherItems: RenderA2uiItem[],
): RenderA2uiItem[] | null {
  const inlineComponents: Array<Record<string, unknown>> = [];
  for (const comp of allComponents) {
    const id = String(comp['id'] || '');
    if (canvasCompIds.has(id) || allCanvasDescendantIds.has(id)) {
      continue;
    }
    const sanitizedComp = removeReferences(comp, canvasCompIds);
    inlineComponents.push(sanitizedComp);
  }

  if (inlineComponents.length === 0) {
    return null;
  }

  const surfaceId = createSurfaceItems[0]?.createSurface?.surfaceId || 'default';
  return [
    ...createSurfaceItems,
    ...updateDataModelItems,
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId,
        components: inlineComponents,
      },
    } as RenderA2uiItem,
    ...otherItems,
  ];
}

/**
 * Partitions a surface's A2UI items into inline components and Canvas preview subtrees.
 *
 * Example:
 * If an A2UI surface contains a List with 9 non-Canvas cards and 1 Canvas component containing a form:
 * - `inlinePayload` contains the List with the 9 non-Canvas cards.
 * - `canvasArtifacts` contains individual isolated subtrees for each Canvas component with its metadata.
 * - `hasCanvas` is set to true.
 */
export function partitionA2uiSurfacePayload(items: RenderA2uiItem[]): PartitionedA2uiSurface {
  const normalized = normalizeA2uiItems(items);
  if (normalized.length === 0) {
    return {inlinePayload: null, canvasArtifacts: [], hasCanvas: false};
  }

  if (!hasA2uiCanvasComponent(normalized)) {
    return {
      inlinePayload: normalized,
      canvasArtifacts: [],
      hasCanvas: false,
    };
  }

  const {createSurfaceItems, updateDataModelItems, allComponents, otherItems} =
    categorizeSurfaceItems(normalized);
  const compMap = buildComponentMap(allComponents);

  const {canvasArtifacts, canvasCompIds, allCanvasDescendantIds} = extractCanvasArtifacts(
    allComponents,
    compMap,
    createSurfaceItems,
    updateDataModelItems,
    otherItems,
  );

  const inlinePayload = buildInlineSurfacePayload(
    allComponents,
    canvasCompIds,
    allCanvasDescendantIds,
    createSurfaceItems,
    updateDataModelItems,
    otherItems,
  );

  if (canvasArtifacts.length === 0 && hasA2uiCanvasComponent(normalized)) {
    canvasArtifacts.push({
      id: createSurfaceItems[0]?.createSurface?.surfaceId || 'canvas-0',
      cardTitle: 'Interactive content',
      cardIcon: 'apps',
      autoOpen: true,
      payload: normalized,
    });
  }

  const hasCanvas = canvasArtifacts.length > 0 || hasA2uiCanvasComponent(normalized);

  return {
    inlinePayload,
    canvasArtifacts,
    hasCanvas,
  };
}

/**
 * Unwraps or prepares layout items for the live canvas renderer iframe.
 */
export function unwrapCanvasForRenderer(items: RenderA2uiItem[]): RenderA2uiItem[] {
  const partitioned = partitionA2uiSurfacePayload(items);
  return partitioned.canvasArtifacts[0]?.payload || normalizeA2uiItems(items);
}
