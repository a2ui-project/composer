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
  A2aMessageRole,
  A2aProtoTaskState,
  A2aV03TaskState,
  A2aV1TaskState,
  isTerminalTaskState,
  normalizeMessageRole,
  normalizeTaskState,
  TERMINAL_PROTO_TASK_STATES,
} from './a2a-types';

describe('a2a-types', () => {
  describe('normalizeMessageRole', () => {
    it('maps user spellings across protocol revisions', () => {
      expect(normalizeMessageRole('user')).toBe(A2aMessageRole.USER);
      expect(normalizeMessageRole('ROLE_USER')).toBe(A2aMessageRole.USER);
      expect(normalizeMessageRole('  User  ')).toBe(A2aMessageRole.USER);
    });

    it('maps agent spellings including assistant and model aliases', () => {
      expect(normalizeMessageRole('agent')).toBe(A2aMessageRole.AGENT);
      expect(normalizeMessageRole('ROLE_AGENT')).toBe(A2aMessageRole.AGENT);
      expect(normalizeMessageRole('assistant')).toBe(A2aMessageRole.AGENT);
      expect(normalizeMessageRole('model')).toBe(A2aMessageRole.AGENT);
    });

    it('returns undefined for absent, unrecognized, or non-string roles', () => {
      expect(normalizeMessageRole(undefined)).toBeUndefined();
      expect(normalizeMessageRole(null)).toBeUndefined();
      expect(normalizeMessageRole('')).toBeUndefined();
      expect(normalizeMessageRole('system')).toBeUndefined();
      expect(normalizeMessageRole(42)).toBeUndefined();
    });
  });

  describe('normalizeTaskState', () => {
    it('returns unknown for null, undefined, or empty string', () => {
      expect(normalizeTaskState(null)).toBe('unknown');
      expect(normalizeTaskState(undefined)).toBe('unknown');
      expect(normalizeTaskState('')).toBe('unknown');
      expect(normalizeTaskState('   ')).toBe('unknown');
    });

    it('normalizes protobuf integer enum values', () => {
      expect(normalizeTaskState(A2aProtoTaskState.UNSPECIFIED)).toBe('unknown');
      expect(normalizeTaskState(A2aProtoTaskState.SUBMITTED)).toBe('submitted');
      expect(normalizeTaskState(A2aProtoTaskState.WORKING)).toBe('working');
      expect(normalizeTaskState(A2aProtoTaskState.COMPLETED)).toBe('completed');
      expect(normalizeTaskState(A2aProtoTaskState.FAILED)).toBe('failed');
      expect(normalizeTaskState(A2aProtoTaskState.CANCELED)).toBe('canceled');
      expect(normalizeTaskState(A2aProtoTaskState.INPUT_REQUIRED)).toBe('input-required');
      expect(normalizeTaskState(A2aProtoTaskState.REJECTED)).toBe('rejected');
      expect(normalizeTaskState(A2aProtoTaskState.AUTH_REQUIRED)).toBe('auth-required');
    });

    it('normalizes numeric strings representing protobuf integers', () => {
      expect(normalizeTaskState('3')).toBe('completed');
      expect(normalizeTaskState('4')).toBe('failed');
      expect(normalizeTaskState('5')).toBe('canceled');
      expect(normalizeTaskState('7')).toBe('rejected');
      expect(normalizeTaskState('2')).toBe('working');
    });

    it('falls back to string representation for unknown integers', () => {
      expect(normalizeTaskState(99)).toBe('99');
      expect(normalizeTaskState(-1)).toBe('-1');
    });

    it('normalizes v1.0 enum strings', () => {
      expect(normalizeTaskState(A2aV1TaskState.COMPLETED)).toBe('completed');
      expect(normalizeTaskState(A2aV1TaskState.WORKING)).toBe('working');
      expect(normalizeTaskState(A2aV1TaskState.FAILED)).toBe('failed');
      expect(normalizeTaskState(A2aV1TaskState.CANCELED)).toBe('canceled');
      expect(normalizeTaskState(A2aV1TaskState.CANCELLED)).toBe('canceled');
      expect(normalizeTaskState(A2aV1TaskState.REJECTED)).toBe('rejected');
    });

    it('normalizes v0.3 lowercase strings and handles mixed casing', () => {
      expect(normalizeTaskState(A2aV03TaskState.COMPLETED)).toBe('completed');
      expect(normalizeTaskState('Completed')).toBe('completed');
      expect(normalizeTaskState('WORKING')).toBe('working');
      expect(normalizeTaskState('custom-state')).toBe('custom-state');
    });
  });

  describe('isTerminalTaskState', () => {
    it('returns false for non-terminal primitives and nil values', () => {
      expect(isTerminalTaskState(null)).toBe(false);
      expect(isTerminalTaskState(undefined)).toBe(false);
      expect(isTerminalTaskState('')).toBe(false);
      expect(isTerminalTaskState('working')).toBe(false);
      expect(isTerminalTaskState('submitted')).toBe(false);
      expect(isTerminalTaskState('unknown')).toBe(false);
      expect(isTerminalTaskState(A2aProtoTaskState.WORKING)).toBe(false);
      expect(isTerminalTaskState(A2aProtoTaskState.SUBMITTED)).toBe(false);
      expect(isTerminalTaskState(A2aProtoTaskState.INPUT_REQUIRED)).toBe(false);
      expect(isTerminalTaskState(A2aProtoTaskState.AUTH_REQUIRED)).toBe(false);
      expect(isTerminalTaskState(A2aProtoTaskState.UNSPECIFIED)).toBe(false);
      expect(isTerminalTaskState(99)).toBe(false);
    });

    it('returns true for protobuf integer terminal states without magic numbers', () => {
      expect(isTerminalTaskState(A2aProtoTaskState.COMPLETED)).toBe(true);
      expect(isTerminalTaskState(A2aProtoTaskState.FAILED)).toBe(true);
      expect(isTerminalTaskState(A2aProtoTaskState.CANCELED)).toBe(true);
      expect(isTerminalTaskState(A2aProtoTaskState.REJECTED)).toBe(true);

      // Raw integer values
      expect(isTerminalTaskState(3)).toBe(true);
      expect(isTerminalTaskState(4)).toBe(true);
      expect(isTerminalTaskState(5)).toBe(true);
      expect(isTerminalTaskState(7)).toBe(true);

      // Numeric strings
      expect(isTerminalTaskState('3')).toBe(true);
      expect(isTerminalTaskState('4')).toBe(true);
      expect(isTerminalTaskState('5')).toBe(true);
      expect(isTerminalTaskState('7')).toBe(true);
    });

    it('returns true for v1.0 and v0.3 terminal string states', () => {
      expect(isTerminalTaskState(A2aV1TaskState.COMPLETED)).toBe(true);
      expect(isTerminalTaskState(A2aV1TaskState.FAILED)).toBe(true);
      expect(isTerminalTaskState(A2aV1TaskState.CANCELED)).toBe(true);
      expect(isTerminalTaskState(A2aV1TaskState.CANCELLED)).toBe(true);
      expect(isTerminalTaskState(A2aV1TaskState.REJECTED)).toBe(true);

      expect(isTerminalTaskState(A2aV03TaskState.COMPLETED)).toBe(true);
      expect(isTerminalTaskState(A2aV03TaskState.FAILED)).toBe(true);
      expect(isTerminalTaskState(A2aV03TaskState.CANCELED)).toBe(true);
      expect(isTerminalTaskState(A2aV03TaskState.CANCELLED)).toBe(true);
      expect(isTerminalTaskState(A2aV03TaskState.REJECTED)).toBe(true);
      expect(isTerminalTaskState('done')).toBe(true);
      expect(isTerminalTaskState('success')).toBe(true);
    });

    it('inspects event objects for final, isCompleted, and status payloads', () => {
      expect(isTerminalTaskState({final: true})).toBe(true);
      expect(isTerminalTaskState({isCompleted: true})).toBe(true);
      expect(isTerminalTaskState({final: false, isCompleted: false})).toBe(false);

      expect(isTerminalTaskState({status: {state: A2aProtoTaskState.COMPLETED}})).toBe(true);
      expect(isTerminalTaskState({status: {state: 4}})).toBe(true);
      expect(isTerminalTaskState({status: {state: 'completed'}})).toBe(true);
      expect(isTerminalTaskState({status: {state: 'TASK_STATE_FAILED'}})).toBe(true);
      expect(isTerminalTaskState({status: 3})).toBe(true);
      expect(isTerminalTaskState({status: 'completed'})).toBe(true);

      expect(isTerminalTaskState({status: {state: 'working'}})).toBe(false);
      expect(isTerminalTaskState({status: {state: 2}})).toBe(false);
      expect(isTerminalTaskState({status: 'working'})).toBe(false);
      expect(isTerminalTaskState({})).toBe(false);
      expect(isTerminalTaskState({foo: 'bar'})).toBe(false);
    });
  });

  describe('TERMINAL_PROTO_TASK_STATES', () => {
    it('contains all expected terminal states in protobuf enum form', () => {
      expect(TERMINAL_PROTO_TASK_STATES.has(A2aProtoTaskState.COMPLETED)).toBe(true);
      expect(TERMINAL_PROTO_TASK_STATES.has(A2aProtoTaskState.FAILED)).toBe(true);
      expect(TERMINAL_PROTO_TASK_STATES.has(A2aProtoTaskState.CANCELED)).toBe(true);
      expect(TERMINAL_PROTO_TASK_STATES.has(A2aProtoTaskState.REJECTED)).toBe(true);

      expect(TERMINAL_PROTO_TASK_STATES.has(A2aProtoTaskState.WORKING)).toBe(false);
      expect(TERMINAL_PROTO_TASK_STATES.has(A2aProtoTaskState.SUBMITTED)).toBe(false);
      expect(TERMINAL_PROTO_TASK_STATES.has(A2aProtoTaskState.UNSPECIFIED)).toBe(false);
    });
  });
});
