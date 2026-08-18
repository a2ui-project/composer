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
import {describe, it, expect, beforeEach} from 'vitest';

import {TestBed} from '@angular/core/testing';
import {ChatErrorFormatterService} from './chat-error-formatter.service';

describe('ChatErrorFormatterService', () => {
  let service: ChatErrorFormatterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChatErrorFormatterService],
    });
    service = TestBed.inject(ChatErrorFormatterService);
  });

  describe('isConnectivityError', () => {
    it('returns false for null input', () => {
      expect(service.isConnectivityError(null)).toBe(false);
    });

    it('returns false for undefined input', () => {
      expect(service.isConnectivityError(undefined)).toBe(false);
    });

    it('returns false for empty string input', () => {
      expect(service.isConnectivityError('')).toBe(false);
    });

    it('returns true for timeout errors', () => {
      expect(service.isConnectivityError('network timeout passed')).toBe(true);
      expect(service.isConnectivityError('http 504 gateway timeout')).toBe(true);
    });

    it('returns true for network and fetch errors', () => {
      expect(service.isConnectivityError('failed to fetch data')).toBe(true);
      expect(service.isConnectivityError('fetch error')).toBe(true);
      expect(service.isConnectivityError('networkerror detected')).toBe(true);
      expect(service.isConnectivityError('proxy connection reset')).toBe(true);
    });

    it('returns true for auth and credential errors', () => {
      expect(service.isConnectivityError('error 401 unauthorized')).toBe(true);
      expect(service.isConnectivityError('error 403 forbidden')).toBe(true);
      expect(service.isConnectivityError('invalid credential')).toBe(true);
      expect(service.isConnectivityError('api key missing')).toBe(true);
      expect(service.isConnectivityError('invalid apikey')).toBe(true);
    });

    it('returns true for quota and service errors', () => {
      expect(service.isConnectivityError('quota exceeded')).toBe(true);
      expect(service.isConnectivityError('request blocked')).toBe(true);
      expect(service.isConnectivityError('service 503 error')).toBe(true);
      expect(service.isConnectivityError('service unavailable')).toBe(true);
    });

    it('returns false for generic errors', () => {
      expect(service.isConnectivityError('syntax error something else')).toBe(false);
    });
  });

  describe('parseError', () => {
    it('resolves API key error', () => {
      const parsed = service.parseError('missing api key', 'Missing API key provided', true);
      expect(parsed.errorTitle).toBe('Invalid API Key');
      expect(parsed.errorMessage).toBe('The provided Gemini API key is invalid or missing.');
      expect(parsed.showDetails).toBe(true);
      expect(parsed.isRetryable).toBe(true);
      expect(parsed.isConnectivityFailure).toBe(true);
    });

    it('resolves unavailable errors to generic form without details', () => {
      const parsed = service.parseError('503 unavailable', 'Unavailable', false);
      expect(parsed.errorTitle).toBe('Service Unavailable');
      expect(parsed.errorMessage).toBe(
        'The generative service is temporarily unavailable. Please try again later.',
      );
      expect(parsed.showDetails).toBe(false);
      expect(parsed.isRetryable).toBe(true);
      expect(parsed.isConnectivityFailure).toBe(true);
    });

    it('resolves validation errors', () => {
      const parsed = service.parseError('validation failed on structure', 'failed', true);
      expect(parsed.errorTitle).toBe('Validation Failure');
      expect(parsed.errorMessage).toBe(
        'The generated layout contains invalid components or structure.',
      );
      expect(parsed.showDetails).toBe(true);
      expect(parsed.errorDetails).toBe('Details: failed');
    });

    it('resolves model high demand errors', () => {
      const parsed = service.parseError('high demand', 'High demand on model', true);
      expect(parsed.errorTitle).toBe('Model High Demand');
      expect(parsed.errorMessage).toContain('currently experiencing high demand');
      expect(parsed.showDetails).toBe(false);
      expect(parsed.isRetryable).toBe(true);
    });

    it('resolves REST gateway timeout errors', () => {
      const parsed = service.parseError('gateway timeout 504', 'Gateway Timeout', true);
      expect(parsed.errorTitle).toBe('REST Gateway Timeout');
      expect(parsed.errorMessage).toBe('Remote generation service did not respond.');
      expect(parsed.showDetails).toBe(true);
      expect(parsed.errorDetails).toBe('Details: Gateway Timeout');
      expect(parsed.isRetryable).toBe(true);
    });

    it('resolves authentication refused errors', () => {
      const parsed = service.parseError('auth 401 error', 'Unauthorized', true);
      expect(parsed.errorTitle).toBe('Authentication Refused');
      expect(parsed.errorMessage).toBe(
        'Authentication failed. Please verify your credentials in Settings.',
      );
      expect(parsed.showDetails).toBe(true);
      expect(parsed.errorDetails).toBe('Details: Unauthorized');
      expect(parsed.isRetryable).toBe(true);
    });

    it('resolves GenAI service blocked errors', () => {
      const parsed = service.parseError('quota 429 blocked', 'Resource exhausted', true);
      expect(parsed.errorTitle).toBe('GenAI Service Blocked');
      expect(parsed.errorMessage).toBe(
        'Resource quota depleted or content safety limits triggered.',
      );
      expect(parsed.showDetails).toBe(true);
      expect(parsed.errorDetails).toBe('Details: Resource exhausted');
      expect(parsed.isRetryable).toBe(true);
    });

    it('handles null and undefined messages gracefully', () => {
      const parsedNull = service.parseError(null, null);
      expect(parsedNull.errorTitle).toBe('Connectivity Failure');
      expect(parsedNull.errorMessage).toBe('');
      expect(parsedNull.errorDetails).toBeUndefined();
      expect(parsedNull.isRetryable).toBe(false);
      expect(parsedNull.isConnectivityFailure).toBe(false);

      const parsedUndefined = service.parseError(undefined, undefined, true);
      expect(parsedUndefined.errorTitle).toBe('Connectivity Failure');
      expect(parsedUndefined.errorMessage).toBe('');
      expect(parsedUndefined.errorDetails).toBeUndefined();
      expect(parsedUndefined.isRetryable).toBe(true);
      expect(parsedUndefined.isConnectivityFailure).toBe(false);
    });

    it('formats JSON error messages with generic message and details', () => {
      const jsonError = '{"error": {"code": 500, "message": "Internal error"}}';
      const parsed = service.parseError('generic error', jsonError, false);
      expect(parsed.errorTitle).toBe('Connectivity Failure');
      expect(parsed.errorMessage).toBe('A connectivity error occurred.');
      expect(parsed.errorDetails).toBe('Details: ' + jsonError);
    });

    it('formats plain error messages for default connectivity failure', () => {
      const parsed = service.parseError('generic error', 'Plain error message', true);
      expect(parsed.errorTitle).toBe('Connectivity Failure');
      expect(parsed.errorMessage).toBe('Plain error message');
      expect(parsed.errorDetails).toBeUndefined();
    });

    it('sets isRetryable to false when hasOriginalPrompt is omitted', () => {
      const parsed = service.parseError('generic error', 'Some error');
      expect(parsed.isRetryable).toBe(false);
    });
  });
});
