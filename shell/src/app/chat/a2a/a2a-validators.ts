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

import {AgentCard, TaskStatusUpdateEvent} from './a2a-types';

/**
 * Known A2A v1.0 task states (from protobuf enum mapping).
 */
export const V1_TASK_STATES: ReadonlySet<string> = new Set([
  'TASK_STATE_UNSPECIFIED',
  'TASK_STATE_SUBMITTED',
  'TASK_STATE_WORKING',
  'TASK_STATE_COMPLETED',
  'TASK_STATE_FAILED',
  'TASK_STATE_CANCELED',
  'TASK_STATE_CANCELLED',
  'TASK_STATE_INPUT_REQUIRED',
  'TASK_STATE_REJECTED',
  'TASK_STATE_AUTH_REQUIRED',
]);

/**
 * Known A2A v0.3 task states.
 */
export const V03_TASK_STATES: ReadonlySet<string> = new Set([
  'unknown',
  'submitted',
  'working',
  'completed',
  'failed',
  'canceled',
  'cancelled',
  'input-required',
  'rejected',
  'auth-required',
]);

/**
 * Returns true if the state value is a recognized v0.3, v1.0, or protobuf integer task state.
 */
export function isValidTaskState(state: unknown): boolean {
  if (typeof state === 'number') {
    return Number.isInteger(state) && state >= 0 && state <= 8;
  }
  const str = String(state);
  return V1_TASK_STATES.has(str) || V03_TASK_STATES.has(str);
}

/**
 * Validates the structure and fields of an AgentCard according to the A2A Inspector implementation
 * (https://github.com/a2aproject/a2a-inspector).
 *
 * Accepts both v0.3 (top-level 'url') and v1.0 ('supportedInterfaces') formats.
 *
 * @param cardData Raw or parsed AgentCard object.
 * @returns Array of validation error messages (empty if compliant).
 */
export function validateAgentCard(cardData: Record<string, unknown> | AgentCard | null): string[] {
  const errors: string[] = [];
  if (!cardData || typeof cardData !== 'object') {
    return ['Agent card must be a non-null object.'];
  }

  const raw = cardData as Record<string, unknown>;

  // --- Required fields (common to both v0.3 and v1.0) ---
  const requiredAlways = ['name', 'description', 'version', 'skills'] as const;
  for (const field of requiredAlways) {
    if (!(field in raw) || raw[field] === undefined || raw[field] === null) {
      errors.push(`Required field is missing: '${field}'.`);
    }
  }

  // --- URL: v0.3 has top-level 'url', v1.0 uses 'supportedInterfaces' ---
  const hasUrl = 'url' in raw && typeof raw['url'] === 'string' && raw['url'].trim().length > 0;
  const supportedInterfaces = (raw['supportedInterfaces'] ?? raw['supported_interfaces']) as
    unknown[] | undefined;
  const hasSupportedInterfaces = Array.isArray(supportedInterfaces);

  if (!hasUrl && !hasSupportedInterfaces) {
    errors.push("Required field is missing: 'url' or 'supportedInterfaces'.");
  } else if (hasUrl) {
    const url = String(raw['url']).trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      errors.push("Field 'url' must be an absolute URL starting with http:// or https://.");
    }
  }

  // v1.0 supportedInterfaces validation
  if (hasSupportedInterfaces && supportedInterfaces) {
    if (supportedInterfaces.length === 0) {
      errors.push("Field 'supportedInterfaces' must be a non-empty array.");
    } else {
      supportedInterfaces.forEach((iface, i) => {
        if (!iface || typeof iface !== 'object') {
          errors.push(`supportedInterfaces[${i}] must be an object.`);
          return;
        }
        const ifaceObj = iface as Record<string, unknown>;
        if (!('url' in ifaceObj) || typeof ifaceObj['url'] !== 'string' || !ifaceObj['url']) {
          errors.push(`supportedInterfaces[${i}] is missing required field 'url'.`);
        }
        const hasBinding =
          'protocolBinding' in ifaceObj ||
          'protocol_binding' in ifaceObj ||
          'transport' in ifaceObj;
        if (!hasBinding) {
          errors.push(
            `supportedInterfaces[${i}] is missing required field 'protocolBinding' (or legacy 'transport').`,
          );
        }
      });
    }
  }

  // --- capabilities ---
  if ('capabilities' in raw && raw['capabilities'] !== undefined) {
    if (
      typeof raw['capabilities'] !== 'object' ||
      raw['capabilities'] === null ||
      Array.isArray(raw['capabilities'])
    ) {
      errors.push("Field 'capabilities' must be an object.");
    }
  }

  // --- defaultInputModes / defaultOutputModes ---
  const modeFields = [
    {camel: 'defaultInputModes', snake: 'default_input_modes'},
    {camel: 'defaultOutputModes', snake: 'default_output_modes'},
  ] as const;

  for (const {camel, snake} of modeFields) {
    const fieldName = camel in raw ? camel : snake in raw ? snake : null;
    if (fieldName) {
      const val = raw[fieldName];
      if (val !== undefined && val !== null) {
        if (!Array.isArray(val)) {
          errors.push(`Field '${fieldName}' must be an array of strings.`);
        } else if (!val.every(item => typeof item === 'string')) {
          errors.push(`All items in '${fieldName}' must be strings.`);
        }
      }
    }
  }

  // --- skills ---
  if ('skills' in raw && raw['skills'] !== undefined) {
    if (!Array.isArray(raw['skills'])) {
      errors.push("Field 'skills' must be an array of AgentSkill objects.");
    } else if (raw['skills'].length === 0) {
      errors.push(
        "Field 'skills' array is empty. Agent must have at least one skill if it performs actions.",
      );
    }
  }

  return errors;
}

function validateTask(data: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (!('id' in data) || !data['id']) {
    errors.push("Task object missing required field: 'id'.");
  }
  const status = (data['status'] || {}) as Record<string, unknown>;
  if (!('status' in data) || !status || typeof status !== 'object' || !('state' in status)) {
    errors.push("Task object missing required field: 'status.state'.");
  } else if (!isValidTaskState(status['state'])) {
    errors.push(
      `Task status.state '${String(status['state'])}' is not a recognized TaskState value.`,
    );
  }
  return errors;
}

function validateStatusUpdate(data: Record<string, unknown>): string[] {
  const errors: string[] = [];
  const status = (data['status'] || {}) as Record<string, unknown>;
  if (!('status' in data) || !status || typeof status !== 'object' || !('state' in status)) {
    errors.push("StatusUpdate object missing required field: 'status.state'.");
  } else if (!isValidTaskState(status['state'])) {
    errors.push(
      `StatusUpdate status.state '${String(status['state'])}' is not a recognized TaskState value.`,
    );
  }
  return errors;
}

function validateArtifactUpdate(data: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (!('artifact' in data) || !data['artifact'] || typeof data['artifact'] !== 'object') {
    errors.push("ArtifactUpdate object missing required field: 'artifact'.");
  } else {
    const artifact = data['artifact'] as Record<string, unknown>;
    const parts = artifact['parts'];
    if (!Array.isArray(parts) || parts.length === 0) {
      errors.push("Artifact object must have a non-empty 'parts' array.");
    }
  }
  return errors;
}

function validateMessagePayload(data: Record<string, unknown>): string[] {
  const errors: string[] = [];
  const parts = data['parts'];
  if (!Array.isArray(parts) || parts.length === 0) {
    errors.push("Message object must have a non-empty 'parts' array.");
  }
  const role = data['role'];
  if (role !== 'agent' && role !== 'ROLE_AGENT' && role !== 2 && role !== 'assistant') {
    errors.push("Message from agent must have 'role' set to 'agent'.");
  }
  return errors;
}

/**
 * Infers the A2A message/event kind if not explicitly defined.
 */
export function inferMessageKind(data: Record<string, unknown>): string | null {
  if (typeof data['kind'] === 'string' && data['kind']) {
    return data['kind'];
  }
  if ('artifacts' in data || ('status' in data && 'id' in data && !('role' in data))) {
    return 'task';
  }
  if ('statusUpdate' in data || 'status_update' in data) {
    return 'status-update';
  }
  if ('artifactUpdate' in data || 'artifact_update' in data) {
    return 'artifact-update';
  }
  if ('artifact' in data && !('status' in data) && !('parts' in data)) {
    return 'artifact-update';
  }
  if ('parts' in data || 'message' in data || 'role' in data) {
    return 'message';
  }
  if ('status' in data) {
    return 'status-update';
  }
  return null;
}

/**
 * Validates an incoming A2A message or event based on its kind according to the A2A Inspector implementation
 * (https://github.com/a2aproject/a2a-inspector).
 *
 * @param data Parsed A2A message, event, or response object.
 * @returns Array of validation error messages (empty if compliant).
 */
export function validateMessage(
  data: Record<string, unknown> | TaskStatusUpdateEvent | null,
): string[] {
  if (!data || typeof data !== 'object') {
    return ['Response from agent must be a non-null object.'];
  }

  const raw = data as Record<string, unknown>;
  const kind = inferMessageKind(raw);

  if (!kind) {
    return ["Response from agent is missing required 'kind' field."];
  }

  const kindValidators: Record<string, (d: Record<string, unknown>) => string[]> = {
    task: d => {
      const target =
        !('id' in d) && d['task'] && typeof d['task'] === 'object'
          ? (d['task'] as Record<string, unknown>)
          : d;
      return validateTask(target);
    },
    'status-update': d => {
      const target =
        !('status' in d) && d['statusUpdate'] && typeof d['statusUpdate'] === 'object'
          ? (d['statusUpdate'] as Record<string, unknown>)
          : !('status' in d) && d['status_update'] && typeof d['status_update'] === 'object'
            ? (d['status_update'] as Record<string, unknown>)
            : d;
      return validateStatusUpdate(target);
    },
    'artifact-update': d => {
      const target =
        !('artifact' in d) && d['artifactUpdate'] && typeof d['artifactUpdate'] === 'object'
          ? (d['artifactUpdate'] as Record<string, unknown>)
          : !('artifact' in d) && d['artifact_update'] && typeof d['artifact_update'] === 'object'
            ? (d['artifact_update'] as Record<string, unknown>)
            : d;
      return validateArtifactUpdate(target);
    },
    message: d => {
      const target =
        !('parts' in d) && d['message'] && typeof d['message'] === 'object'
          ? (d['message'] as Record<string, unknown>)
          : d;
      return validateMessagePayload(target);
    },
  };

  const validator = kindValidators[kind];
  if (validator) {
    return validator(raw);
  }

  return [`Unknown message kind received: '${kind}'.`];
}
