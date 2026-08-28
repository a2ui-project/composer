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
import {
  A2aMessage,
  AgentCard,
  TERMINAL_TASK_STATES,
  TaskStatusUpdateEvent,
} from '../../chat/a2a/a2a-types';
import {generateUuid as uuid} from '../../utils/uuid';
import {CanvasArtifact, InspectorEvent, UiAgentInfo} from '../types';

/**
 * Default fallback icon URL for A2A Agents.
 */
export const DEFAULT_A2A_ICON_URL =
  'https://fonts.gstatic.com/s/i/short-term/release/googlegsymbol/smart_toy/default/24px.svg';

/**
 * Brand asset icon URL for A2A Protocol representations.
 */
export const A2A_PROTOCOL_ICON_URL =
  'https://storage.googleapis.com/gweb-developer-goog-blog-assets/images/Untitled_design.original.png';

/**
 * Converts a raw A2A AgentCard and endpoint URL into a UI Agent Info model.
 */
export function a2aCardToUiAgentInfo(card: AgentCard | null, url: string | null): UiAgentInfo {
  const samplePrompts: string[] = [];

  if (card?.samplePrompts && Array.isArray(card.samplePrompts) && card.samplePrompts.length > 0) {
    samplePrompts.push(...card.samplePrompts);
  } else if (card?.skills) {
    for (const skill of card.skills) {
      if (skill.name) {
        samplePrompts.push(`Help me with ${skill.name}`);
      }
    }
  }

  if (samplePrompts.length === 0) {
    samplePrompts.push(
      'What capabilities do you offer?',
      'Show me a sample A2UI interactive dashboard.',
    );
  }

  return {
    name: card?.name || 'A2A Agent',
    description: card?.description || 'Connected autonomous Agent-to-Agent service endpoint.',
    version: card?.version || '',
    endpoint: url || '',
    iconUrl: card?.iconUrl || DEFAULT_A2A_ICON_URL,
    skills: card?.skills,
    capabilities: card?.capabilities,
    samplePrompts: samplePrompts.slice(0, 4),
  };
}

/**
 * Creates an InspectorEvent recording an outgoing message turn.
 */
export function createSentMessageEvent(msg: A2aMessage): InspectorEvent {
  const textSummary = msg.parts?.find(p => p.text)?.text?.slice(0, 40) || 'Message turn';
  return {
    id: uuid(),
    timestamp: Date.now(),
    direction: 'sent',
    summary: `Sent [${msg.role}]: ${textSummary}`,
    payload: msg,
  };
}

/**
 * Creates an InspectorEvent recording an outgoing user UI action.
 */
export function createSentActionEvent(taskId: string, action: unknown): InspectorEvent {
  return {
    id: uuid(),
    timestamp: Date.now(),
    direction: 'sent',
    summary: `Sent Action (Task ${taskId || 'active'})`,
    payload: {taskId, action},
  };
}

/**
 * Creates an InspectorEvent recording an incoming streaming event chunk.
 */
export function createReceivedEvent(event: TaskStatusUpdateEvent): InspectorEvent {
  const taskId = event.taskId || event.contextId || 'event';
  let summary = `Received Event (${taskId})`;
  if (event.status) {
    const st = typeof event.status === 'string' ? event.status : event.status.state || 'status';
    summary = `Received [${st}] (${taskId})`;
  } else if (event.message?.parts) {
    const hasText = event.message.parts.some(p => p.text);
    const hasData = event.message.parts.some(p => p.data || p.artifact);
    if (hasData) {
      summary = `Received A2UI Payload (${taskId})`;
    } else if (hasText) {
      summary = `Received Text Chunk (${taskId})`;
    }
  }

  return {
    id: uuid(),
    timestamp: Date.now(),
    direction: 'received',
    summary,
    payload: event,
  };
}

/**
 * Creates an InspectorEvent recording an error event.
 */
export function createErrorEvent(err: unknown): InspectorEvent {
  const msg = err instanceof Error ? err.message : String(err);
  return {
    id: uuid(),
    timestamp: Date.now(),
    direction: 'error',
    summary: `Transport Error: ${msg}`,
    payload: err instanceof Error ? {message: err.message, stack: err.stack, name: err.name} : err,
  };
}

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

  const allComponents: Array<Record<string, unknown>> = [];
  const createSurfaceItems: RenderA2uiItem[] = [];
  const updateDataModelItems: RenderA2uiItem[] = [];
  const otherItems: RenderA2uiItem[] = [];

  for (const item of normalized) {
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

  const compMap = new Map<string, Record<string, unknown>>();
  for (const comp of allComponents) {
    const id = String(comp['id'] || '');
    if (id) compMap.set(id, comp);
  }

  const canvasArtifacts: CanvasArtifact[] = [];
  const canvasCompIds = new Set<string>();
  const allCanvasDescendantIds = new Set<string>();

  // Extract each Canvas component into its own CanvasArtifact
  for (const comp of allComponents) {
    const info = getCanvasInfo(comp);
    if (!info.isCanvas) continue;

    const compId = String(comp['id'] || '');
    if (compId) canvasCompIds.add(compId);

    const childRootIds = new Set<string>(info.childIds);
    const canvasDescendantIds = new Set<string>(childRootIds);
    const queue = Array.from(childRootIds);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      allCanvasDescendantIds.add(currentId);
      const childComp = compMap.get(currentId);
      if (!childComp) continue;

      const childRefs = extractChildReferences(childComp);
      for (const ref of childRefs) {
        if (!canvasDescendantIds.has(ref)) {
          canvasDescendantIds.add(ref);
          allCanvasDescendantIds.add(ref);
          queue.push(ref);
        }
      }
    }

    let canvasComponents = allComponents.filter(c => {
      const id = String(c['id'] || '');
      return canvasDescendantIds.has(id);
    });

    if (canvasComponents.length > 0) {
      const hasRoot = canvasComponents.some(c => c['id'] === 'root');
      if (!hasRoot) {
        if (childRootIds.size === 1) {
          const rootId = Array.from(childRootIds)[0];
          canvasComponents = canvasComponents.map(c => {
            if (c['id'] === rootId) {
              return {...c, id: 'root'};
            }
            return c;
          });
        } else if (childRootIds.size > 1) {
          canvasComponents = [
            {
              id: 'root',
              component: 'Column',
              children: Array.from(childRootIds),
            },
            ...canvasComponents,
          ];
        }
      }

      const individualPayload: RenderA2uiItem[] = [
        ...createSurfaceItems,
        ...updateDataModelItems,
        {
          version: 'v0.9',
          updateComponents: {
            surfaceId: createSurfaceItems[0]?.createSurface?.surfaceId || 'default',
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

  // Build Inline Payload (Chat Bubble)
  const inlineComponents: Array<Record<string, unknown>> = [];
  for (const comp of allComponents) {
    const id = String(comp['id'] || '');
    if (canvasCompIds.has(id) || allCanvasDescendantIds.has(id)) {
      continue;
    }
    const sanitizedComp = removeReferences(comp, canvasCompIds);
    inlineComponents.push(sanitizedComp);
  }

  let inlinePayload: RenderA2uiItem[] | null = null;
  if (inlineComponents.length > 0) {
    inlinePayload = [
      ...createSurfaceItems,
      ...updateDataModelItems,
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: createSurfaceItems[0]?.createSurface?.surfaceId || 'default',
          components: inlineComponents,
        },
      } as RenderA2uiItem,
      ...otherItems,
    ];
  }

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

/**
 * Result structure returned by parseA2aStreamEvent.
 */
export interface ParsedA2aStreamEvent {
  contextId?: string;
  taskId?: string;
  textChunk?: string;
  thoughtChunk?: string;
  a2uiItems: RenderA2uiItem[];
  isCompleted: boolean;
}

/**
 * Parses an incoming TaskStatusUpdateEvent into textual chunks, thoughts, and layout items.
 */
export function parseA2aStreamEvent(
  event: TaskStatusUpdateEvent | Record<string, unknown>,
): ParsedA2aStreamEvent {
  const unwrapped = (event as Record<string, unknown>)?.['result']
    ? ((event as Record<string, unknown>)['result'] as TaskStatusUpdateEvent)
    : (event as TaskStatusUpdateEvent);

  const eventObj = unwrapped as Record<string, unknown>;
  const result: ParsedA2aStreamEvent = {
    contextId:
      unwrapped.contextId ||
      (eventObj['kind'] === 'task' ? undefined : (eventObj['contextId'] as string)),
    taskId:
      unwrapped.taskId ||
      (eventObj['kind'] === 'task' ? (eventObj['id'] as string) : (eventObj['taskId'] as string)),
    a2uiItems: [],
    isCompleted: !!unwrapped.final,
  };

  const msg =
    unwrapped.message ||
    (typeof unwrapped.status === 'object' && unwrapped.status !== null
      ? unwrapped.status.message
      : undefined) ||
    (eventObj['kind'] === 'message' ? (unwrapped as unknown as A2aMessage) : undefined);

  if (typeof msg === 'string') {
    result.textChunk = (result.textChunk || '') + msg;
  } else if (typeof msg === 'object' && msg !== null && Array.isArray(msg.parts)) {
    for (const part of msg.parts) {
      const partObj = part as Record<string, unknown>;
      const isThought =
        part.metadata?.['adk_thought'] === true ||
        part.metadata?.['adk_thought'] === 'true' ||
        part.metadata?.['thought'] === true ||
        part.metadata?.['thought'] === 'true' ||
        partObj['kind'] === 'thought' ||
        partObj['thought'] !== undefined;

      if (isThought) {
        const thoughtText =
          typeof partObj['thought'] === 'string' ? (partObj['thought'] as string) : part.text;
        if (thoughtText) {
          result.thoughtChunk = (result.thoughtChunk || '') + thoughtText;
        }
      } else if (part.text) {
        let textContent = part.text;
        const a2uiTagMatch = textContent.match(/<a2ui-json>([\s\S]*?)<\/a2ui-json>/);
        if (a2uiTagMatch) {
          try {
            const parsedJson = JSON.parse(a2uiTagMatch[1].trim());
            if (Array.isArray(parsedJson)) {
              result.a2uiItems.push(...normalizeA2uiItems(parsedJson));
            } else if (typeof parsedJson === 'object' && parsedJson !== null) {
              result.a2uiItems.push(...normalizeA2uiItems([parsedJson]));
            }
            textContent = textContent.replace(/<a2ui-json>[\s\S]*?<\/a2ui-json>/g, '').trim();
          } catch {}
        }
        if (textContent) {
          result.textChunk = (result.textChunk || '') + textContent;
        }
      }

      if (part.data) {
        let rawData: unknown = part.data;
        if (typeof rawData === 'object' && rawData !== null && 'data' in rawData) {
          const envelope = rawData as {mimeType?: string; data?: unknown};
          if (typeof envelope.data === 'string' && envelope.data.trim().startsWith('[')) {
            try {
              rawData = JSON.parse(envelope.data);
            } catch {}
          } else if (typeof envelope.data === 'string' && envelope.data.trim().startsWith('{')) {
            try {
              rawData = JSON.parse(envelope.data);
            } catch {}
          } else if (envelope.data) {
            rawData = envelope.data;
          }
        }

        if (Array.isArray(rawData)) {
          result.a2uiItems.push(...normalizeA2uiItems(rawData));
        } else if (typeof rawData === 'object' && rawData !== null) {
          result.a2uiItems.push(...normalizeA2uiItems([rawData]));
        }
      }

      if (part.artifact?.parts) {
        for (const artPart of part.artifact.parts) {
          if (artPart.data) {
            if (Array.isArray(artPart.data)) {
              result.a2uiItems.push(...normalizeA2uiItems(artPart.data));
            } else {
              result.a2uiItems.push(...normalizeA2uiItems([artPart.data]));
            }
          }
        }
      }
    }
  }

  if (unwrapped.artifact?.parts) {
    for (const artPart of unwrapped.artifact.parts) {
      if (artPart.data) {
        if (Array.isArray(artPart.data)) {
          result.a2uiItems.push(...normalizeA2uiItems(artPart.data));
        } else {
          result.a2uiItems.push(...normalizeA2uiItems([artPart.data]));
        }
      }
    }
  }

  const statusState =
    typeof unwrapped.status === 'object' && unwrapped.status !== null
      ? (unwrapped.status.state || '').toLowerCase()
      : typeof unwrapped.status === 'string'
        ? unwrapped.status.toLowerCase()
        : '';

  if (
    TERMINAL_TASK_STATES.has(statusState) ||
    unwrapped.final === true ||
    eventObj['final'] === true ||
    eventObj['isCompleted'] === true
  ) {
    result.isCompleted = true;
  }

  return result;
}
