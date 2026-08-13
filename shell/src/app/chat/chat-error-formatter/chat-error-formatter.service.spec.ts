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
    it('detects timeout', () => {
      expect(service.isConnectivityError('network timeout passed')).toBe(true);
    });

    it('returns false for generic errors', () => {
      expect(service.isConnectivityError('syntax error something else')).toBe(false);
    });
  });

  describe('parseError', () => {
    it('resolves API key error', () => {
      const parsed = service.parseError('missing api key', 'Missing API key provided', true);
      expect(parsed.errorTitle).toBe('Invalid API Key');
      expect(parsed.showDetails).toBe(true);
      expect(parsed.isRetryable).toBe(true);
    });

    it('resolves unavailable errors to generic form without details', () => {
      const parsed = service.parseError('503 unavailable', 'Unavailable', false);
      expect(parsed.errorTitle).toBe('Service Unavailable');
      expect(parsed.showDetails).toBe(false);
    });

    it('resolves validation errors', () => {
      const parsed = service.parseError('validation failed on structure', 'failed', true);
      expect(parsed.errorTitle).toBe('Validation Failure');
    });
  });
});
