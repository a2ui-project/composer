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

/**
 * Result of validating an A2UI payload against the active preview protocol version.
 */
export type ProtocolValidationResult =
  | {valid: true}
  | {
      valid: false;
      code: 'PROTOCOL_VERSION_MISMATCH';
      detectedVersion: A2uiProtocolVersion;
      expectedVersion: A2uiProtocolVersion;
      message: string;
    };

/**
 * Validates whether an array of A2UI messages conforms to the expected active protocol version.
 *
 * Examines explicit `version` fields as well as unambiguous structural markers (e.g. inline
 * `createSurface.components`/`dataModel`, `@path`/`@call`, `callRendererFunction`, `beginRendering`).
 */
export function validatePayloadProtocolVersion(
  messages: unknown[] | null | undefined,
  activeProtocolVersion: A2uiProtocolVersion,
): ProtocolValidationResult {
  if (!Array.isArray(messages) || messages.length === 0) {
    return {valid: true};
  }

  for (const item of messages) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      continue;
    }
    const detected = detectItemVersion(item as Record<string, unknown>);
    if (detected && detected !== activeProtocolVersion) {
      return {
        valid: false,
        code: 'PROTOCOL_VERSION_MISMATCH',
        detectedVersion: detected,
        expectedVersion: activeProtocolVersion,
        message: `Payload protocol version ${detected} does not match active renderer protocol version ${activeProtocolVersion}.`,
      };
    }
  }

  return {valid: true};
}

/**
 * Detects the protocol version from an array of A2UI messages by inspecting explicit
 * version fields or unambiguous structural markers. Returns 'v1.0', 'v0.9', or null if indeterminate.
 */
export function detectPayloadVersion(
  messages: unknown[] | null | undefined,
): A2uiProtocolVersion | null {
  if (!Array.isArray(messages) || messages.length === 0) {
    return null;
  }
  for (const item of messages) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      continue;
    }
    const detected = detectItemVersion(item as Record<string, unknown>);
    if (detected) {
      return detected;
    }
  }
  return null;
}

function detectItemVersion(obj: Record<string, unknown>): A2uiProtocolVersion | null {
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
