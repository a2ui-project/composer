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

import type {A2uiProtocolVersion} from 'a2ui-bridge';

/** Result of scanning every message in a payload for protocol version signals. */
export type PayloadVersionInspection =
  | {
      readonly status: 'detected';
      readonly version: A2uiProtocolVersion;
      readonly anchor: string | null;
    }
  | {
      readonly status: 'mixed';
      readonly anchor: string | null;
    }
  | {
      readonly status: 'indeterminate';
    };

function extractExplicitVersionString(obj: Record<string, unknown>): string | null {
  if (typeof obj['version'] !== 'string') {
    return null;
  }
  const trimmed = obj['version'].trim();
  return trimmed.length > 0 ? trimmed : null;
}

function scanPayloadVersion(
  messages: readonly unknown[] | null | undefined,
  stopOnFirst: boolean,
): PayloadVersionInspection {
  if (!Array.isArray(messages) || messages.length === 0) {
    return {status: 'indeterminate'};
  }

  let detectedVersion: A2uiProtocolVersion | null = null;
  let versionAnchor: string | null = null;

  for (const item of messages) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      continue;
    }
    const obj = item as Record<string, unknown>;
    const itemVersion = detectMessageVersion(obj);
    if (!itemVersion) {
      continue;
    }
    const explicitAnchor = extractExplicitVersionString(obj);
    if (stopOnFirst) {
      return {
        status: 'detected',
        version: itemVersion,
        anchor: explicitAnchor,
      };
    }
    if (detectedVersion === null) {
      detectedVersion = itemVersion;
      versionAnchor = explicitAnchor;
    } else if (itemVersion !== detectedVersion) {
      return {
        status: 'mixed',
        anchor: explicitAnchor ?? versionAnchor,
      };
    }
  }

  if (detectedVersion === null) {
    return {status: 'indeterminate'};
  }
  return {
    status: 'detected',
    version: detectedVersion,
    anchor: versionAnchor,
  };
}

/**
 * Inspects all messages in `messages` to determine whether the payload uses a
 * single protocol version, mixes v0.9 and v1.0, or is indeterminate.
 */
export function inspectPayloadVersion(
  messages: readonly unknown[] | null | undefined,
): PayloadVersionInspection {
  return scanPayloadVersion(messages, false);
}

/**
 * Detects the protocol version from an array of A2UI messages by inspecting explicit
 * version fields or unambiguous structural markers. Returns 'v1.0', 'v0.9', or null if indeterminate.
 */
export function detectPayloadVersion(
  messages: unknown[] | null | undefined,
): A2uiProtocolVersion | null {
  const result = scanPayloadVersion(messages, true);
  return result.status === 'detected' ? result.version : null;
}

/**
 * Detects the protocol version of a single A2UI message object by inspecting explicit
 * `version` fields or unambiguous structural markers, or null if indeterminate.
 */
export function detectMessageVersion(obj: Record<string, unknown>): A2uiProtocolVersion | null {
  // Explicit version field check
  if (typeof obj['version'] === 'string') {
    const v = obj['version'].trim();
    if (v === 'v1.0' || v === '1.0') {
      return 'v1.0';
    }
    if (v === 'v0.9' || v === '0.9') {
      return 'v0.9';
    }
  }

  // Structural v1.0 message-level markers
  if (
    obj['callRendererFunction'] !== undefined ||
    obj['agentFunctionResponse'] !== undefined ||
    obj['callAgentFunctionResponse'] !== undefined
  ) {
    return 'v1.0';
  }

  if (
    obj['createSurface'] &&
    typeof obj['createSurface'] === 'object' &&
    !Array.isArray(obj['createSurface'])
  ) {
    const cs = obj['createSurface'] as Record<string, unknown>;
    // Pre-branch v1.0 catalog URI check preserved for versionless A2A/chat payloads.
    if (
      typeof cs['catalogId'] === 'string' &&
      (cs['catalogId'].includes('v1_0') || cs['catalogId'].includes('v1.0'))
    ) {
      return 'v1.0';
    }
    if (Array.isArray(cs['components']) && cs['components'].length > 0) {
      return 'v1.0';
    }
    if (
      cs['dataModel'] &&
      typeof cs['dataModel'] === 'object' &&
      !Array.isArray(cs['dataModel']) &&
      Object.keys(cs['dataModel']).length > 0
    ) {
      return 'v1.0';
    }
    if (cs['theme'] !== undefined) {
      return 'v0.9';
    }
  }

  // Recursive scan for dynamic bindings and expressions (@path/@call vs {path}/{call, returnType})
  const nested = scanNestedMarkers(obj);
  if (nested) {
    return nested;
  }

  // Structural v0.9 message-level markers
  if (obj['beginRendering'] !== undefined) {
    return 'v0.9';
  }

  return null;
}

function scanNestedMarkers(val: unknown): A2uiProtocolVersion | null {
  if (!val || typeof val !== 'object') {
    return null;
  }
  if (Array.isArray(val)) {
    for (const child of val) {
      const res = scanNestedMarkers(child);
      if (res) return res;
    }
    return null;
  }

  const obj = val as Record<string, unknown>;
  if ('@path' in obj || '@call' in obj) {
    return 'v1.0';
  }

  // In A2UI v0.9, a binding object is strictly { path: string } as the sole key
  if (typeof obj['path'] === 'string' && Object.keys(obj).length === 1) {
    return 'v0.9';
  }
  if (typeof obj['call'] === 'string' && 'returnType' in obj) {
    return 'v0.9';
  }

  for (const [k, v] of Object.entries(obj)) {
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') {
      continue;
    }
    // Skip recursing into user data models where arbitrary keys might resemble directives
    if (k === 'dataModel') {
      continue;
    }
    if (k === 'updateDataModel' && v && typeof v === 'object' && !Array.isArray(v)) {
      const udm = v as Record<string, unknown>;
      for (const [subK, subV] of Object.entries(udm)) {
        if (subK !== 'value') {
          const res = scanNestedMarkers(subV);
          if (res) return res;
        }
      }
      continue;
    }
    const res = scanNestedMarkers(v);
    if (res) return res;
  }

  return null;
}
