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
import {SafeUrlValidatorService} from './safe-url-validator.service';

describe('SafeUrlValidatorService', () => {
  let service: SafeUrlValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SafeUrlValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isValidHttpUrl', () => {
    it('returns true for an http protocol', () => {
      expect(service.isValidHttpUrl('http://localhost:4200/')).toBe(true);
    });

    it('returns true for an https protocol', () => {
      expect(service.isValidHttpUrl('https://example.com/some/path')).toBe(true);
    });

    it('returns false for a javascript protocol', () => {
      expect(service.isValidHttpUrl('javascript:alert(1)')).toBe(false);
    });

    it('returns false for a data protocol', () => {
      expect(service.isValidHttpUrl('data:text/html,<html></html>')).toBe(false);
    });

    it('returns false for invalid urls', () => {
      expect(service.isValidHttpUrl('not a url')).toBe(false);
    });

    it('returns false for null or undefined', () => {
      expect(service.isValidHttpUrl(null)).toBe(false);
      expect(service.isValidHttpUrl(undefined)).toBe(false);
      expect(service.isValidHttpUrl('')).toBe(false);
    });
  });
});
