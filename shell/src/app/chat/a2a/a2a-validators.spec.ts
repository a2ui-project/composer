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

import {describe, it, expect} from 'vitest';
import {
  isValidTaskState,
  validateAgentCard,
  validateMessage,
  inferMessageKind,
} from './a2a-validators';

describe('a2a-validators', () => {
  describe('isValidTaskState', () => {
    it('accepts v1.0 SCREAMING_SNAKE_CASE states', () => {
      expect(isValidTaskState('TASK_STATE_WORKING')).toBe(true);
      expect(isValidTaskState('TASK_STATE_COMPLETED')).toBe(true);
      expect(isValidTaskState('TASK_STATE_FAILED')).toBe(true);
      expect(isValidTaskState('TASK_STATE_CANCELED')).toBe(true);
      expect(isValidTaskState('TASK_STATE_CANCELLED')).toBe(true);
      expect(isValidTaskState('TASK_STATE_INPUT_REQUIRED')).toBe(true);
      expect(isValidTaskState('TASK_STATE_SUBMITTED')).toBe(true);
      expect(isValidTaskState('TASK_STATE_UNSPECIFIED')).toBe(true);
      expect(isValidTaskState('TASK_STATE_REJECTED')).toBe(true);
      expect(isValidTaskState('TASK_STATE_AUTH_REQUIRED')).toBe(true);
    });

    it('accepts v0.3 lowercase states', () => {
      expect(isValidTaskState('working')).toBe(true);
      expect(isValidTaskState('completed')).toBe(true);
      expect(isValidTaskState('failed')).toBe(true);
      expect(isValidTaskState('canceled')).toBe(true);
      expect(isValidTaskState('cancelled')).toBe(true);
      expect(isValidTaskState('input-required')).toBe(true);
      expect(isValidTaskState('submitted')).toBe(true);
      expect(isValidTaskState('rejected')).toBe(true);
      expect(isValidTaskState('auth-required')).toBe(true);
      expect(isValidTaskState('unknown')).toBe(true);
    });

    it('accepts integer states 0 through 8', () => {
      for (let i = 0; i <= 8; i++) {
        expect(isValidTaskState(i)).toBe(true);
      }
      expect(isValidTaskState(-1)).toBe(false);
      expect(isValidTaskState(9)).toBe(false);
      expect(isValidTaskState(1.5)).toBe(false);
    });

    it('rejects invalid state strings', () => {
      expect(isValidTaskState('foobar')).toBe(false);
      expect(isValidTaskState('')).toBe(false);
      expect(isValidTaskState(null)).toBe(false);
      expect(isValidTaskState(undefined)).toBe(false);
    });
  });

  describe('validateAgentCard', () => {
    const validV03Card = {
      name: 'Test Agent',
      description: 'Test description',
      version: '1.0.0',
      url: 'https://agent.example.com',
      skills: [{id: 's1', name: 'Skill 1'}],
    };

    const validV10Card = {
      name: 'V1 Agent',
      description: 'V1 description',
      version: '1.0.0',
      supportedInterfaces: [
        {
          url: 'https://agent.example.com/a2a',
          protocolBinding: 'JSONRPC',
        },
      ],
      skills: [{id: 's1', name: 'Skill 1'}],
    };

    it('validates compliant v0.3 card without errors', () => {
      const errors = validateAgentCard(validV03Card);
      expect(errors).toEqual([]);
    });

    it('validates compliant v1.0 card with supportedInterfaces without errors', () => {
      const errors = validateAgentCard(validV10Card);
      expect(errors).toEqual([]);
    });

    it('validates v1.0 card with legacy transport in supportedInterfaces', () => {
      const card = {
        ...validV10Card,
        supportedInterfaces: [{url: 'https://agent.example.com', transport: 'JSONRPC'}],
      };
      expect(validateAgentCard(card)).toEqual([]);
    });

    it('flags null or non-object card', () => {
      expect(validateAgentCard(null)).toContain('Agent card must be a non-null object.');
    });

    it('flags missing required fields', () => {
      const card = {url: 'https://example.com'};
      const errors = validateAgentCard(card);
      expect(errors).toContain("Required field is missing: 'name'.");
      expect(errors).toContain("Required field is missing: 'description'.");
      expect(errors).toContain("Required field is missing: 'version'.");
      expect(errors).toContain("Required field is missing: 'skills'.");
    });

    it('flags missing url and supportedInterfaces', () => {
      const card = {
        name: 'Agent',
        description: 'Desc',
        version: '1.0',
        skills: [{id: '1', name: 'Skill'}],
      };
      const errors = validateAgentCard(card);
      expect(errors).toContain("Required field is missing: 'url' or 'supportedInterfaces'.");
    });

    it('flags invalid url format', () => {
      const card = {...validV03Card, url: 'ftp://example.com'};
      const errors = validateAgentCard(card);
      expect(errors).toContain(
        "Field 'url' must be an absolute URL starting with http:// or https://.",
      );
    });

    it('flags empty supportedInterfaces array', () => {
      const card = {...validV03Card, url: undefined, supportedInterfaces: []};
      const errors = validateAgentCard(card);
      expect(errors).toContain("Field 'supportedInterfaces' must be a non-empty array.");
    });

    it('flags supportedInterfaces with missing url or protocolBinding', () => {
      const card = {
        ...validV03Card,
        url: undefined,
        supportedInterfaces: [
          {protocolBinding: 'JSONRPC'},
          {url: 'https://example.com'},
          'invalid' as unknown as Record<string, unknown>,
        ],
      };
      const errors = validateAgentCard(card);
      expect(errors).toContain("supportedInterfaces[0] is missing required field 'url'.");
      expect(errors).toContain(
        "supportedInterfaces[1] is missing required field 'protocolBinding' (or legacy 'transport').",
      );
      expect(errors).toContain('supportedInterfaces[2] must be an object.');
    });

    it('flags invalid capabilities type', () => {
      const card = {...validV03Card, capabilities: 'invalid' as unknown as Record<string, unknown>};
      expect(validateAgentCard(card)).toContain("Field 'capabilities' must be an object.");
    });

    it('flags invalid input/output modes', () => {
      const card = {
        ...validV03Card,
        defaultInputModes: 'not-an-array' as unknown as string[],
        defaultOutputModes: [123] as unknown as string[],
      };
      const errors = validateAgentCard(card);
      expect(errors).toContain("Field 'defaultInputModes' must be an array of strings.");
      expect(errors).toContain("All items in 'defaultOutputModes' must be strings.");
    });

    it('flags empty skills array', () => {
      const card = {...validV03Card, skills: []};
      expect(validateAgentCard(card)).toContain(
        "Field 'skills' array is empty. Agent must have at least one skill if it performs actions.",
      );
    });

    it('flags non-array skills', () => {
      const card = {...validV03Card, skills: 'skill' as unknown as []};
      expect(validateAgentCard(card)).toContain(
        "Field 'skills' must be an array of AgentSkill objects.",
      );
    });
  });

  describe('inferMessageKind', () => {
    it('infers kind from explicit field', () => {
      expect(inferMessageKind({kind: 'custom'})).toBe('custom');
    });

    it('infers task from artifacts or id+status', () => {
      expect(inferMessageKind({artifacts: []})).toBe('task');
      expect(inferMessageKind({id: 't-1', status: {state: 'working'}})).toBe('task');
    });

    it('infers status-update from statusUpdate or status_update', () => {
      expect(inferMessageKind({statusUpdate: {}})).toBe('status-update');
      expect(inferMessageKind({status_update: {}})).toBe('status-update');
    });

    it('infers artifact-update from artifactUpdate or artifact', () => {
      expect(inferMessageKind({artifactUpdate: {}})).toBe('artifact-update');
      expect(inferMessageKind({artifact: {parts: []}})).toBe('artifact-update');
    });

    it('infers message from parts or role', () => {
      expect(inferMessageKind({parts: [{text: 'hi'}]})).toBe('message');
      expect(inferMessageKind({role: 'agent', parts: []})).toBe('message');
    });

    it('returns null when unrecognized', () => {
      expect(inferMessageKind({})).toBe(null);
    });
  });

  describe('validateMessage', () => {
    it('flags non-object message', () => {
      expect(validateMessage(null)).toContain('Response from agent must be a non-null object.');
    });

    it('flags missing kind when not inferrable', () => {
      expect(validateMessage({})).toContain(
        "Response from agent is missing required 'kind' field.",
      );
    });

    it('validates compliant task event', () => {
      const event = {
        kind: 'task',
        id: 'task-1',
        status: {state: 'TASK_STATE_WORKING'},
      };
      expect(validateMessage(event)).toEqual([]);
    });

    it('flags task event missing id or status.state', () => {
      const event = {kind: 'task'};
      const errors = validateMessage(event);
      expect(errors).toContain("Task object missing required field: 'id'.");
      expect(errors).toContain("Task object missing required field: 'status.state'.");
    });

    it('flags task event with invalid state', () => {
      const event = {kind: 'task', id: 't-1', status: {state: 'invalid-state'}};
      expect(validateMessage(event)).toContain(
        "Task status.state 'invalid-state' is not a recognized TaskState value.",
      );
    });

    it('validates compliant status-update event', () => {
      const event = {
        kind: 'status-update',
        status: {state: 'working'},
      };
      expect(validateMessage(event)).toEqual([]);
    });

    it('flags status-update missing state or invalid state', () => {
      expect(validateMessage({kind: 'status-update'})).toContain(
        "StatusUpdate object missing required field: 'status.state'.",
      );
      expect(validateMessage({kind: 'status-update', status: {state: 'bogus'}})).toContain(
        "StatusUpdate status.state 'bogus' is not a recognized TaskState value.",
      );
    });

    it('validates compliant artifact-update event', () => {
      const event = {
        kind: 'artifact-update',
        artifact: {parts: [{text: 'art text'}]},
      };
      expect(validateMessage(event)).toEqual([]);
    });

    it('flags artifact-update missing artifact or empty parts', () => {
      expect(validateMessage({kind: 'artifact-update'})).toContain(
        "ArtifactUpdate object missing required field: 'artifact'.",
      );
      expect(validateMessage({kind: 'artifact-update', artifact: {parts: []}})).toContain(
        "Artifact object must have a non-empty 'parts' array.",
      );
    });

    it('validates compliant message event', () => {
      const event = {
        kind: 'message',
        role: 'agent',
        parts: [{text: 'Hello'}],
      };
      expect(validateMessage(event)).toEqual([]);

      const v1Event = {
        kind: 'message',
        role: 'ROLE_AGENT',
        parts: [{text: 'Hello'}],
      };
      expect(validateMessage(v1Event)).toEqual([]);
    });

    it('flags message event with empty parts or non-agent role', () => {
      const event = {
        kind: 'message',
        role: 'user',
        parts: [],
      };
      const errors = validateMessage(event);
      expect(errors).toContain("Message object must have a non-empty 'parts' array.");
      expect(errors).toContain("Message from agent must have 'role' set to 'agent'.");
    });

    it('flags unknown kind', () => {
      expect(validateMessage({kind: 'unsupported-kind'})).toContain(
        "Unknown message kind received: 'unsupported-kind'.",
      );
    });
  });
});
