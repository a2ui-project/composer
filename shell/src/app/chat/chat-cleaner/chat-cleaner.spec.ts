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

import {TestBed} from '@angular/core/testing';
import {describe, it, expect, beforeEach} from 'vitest';
import {ChatCleaner} from './chat-cleaner';

describe('ChatCleaner', () => {
  let service: ChatCleaner;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChatCleaner],
    });
    service = TestBed.inject(ChatCleaner);
  });

  describe('PULSE_INDICATOR & appendPulse / stripPulse', () => {
    it('exposes readonly PULSE_INDICATOR constant', () => {
      expect(service.PULSE_INDICATOR).toBe('●●●');
    });

    it('appends pulse indicator to text', () => {
      expect(service.appendPulse('hello')).toBe('hello ●●●');
    });

    it('appends pulse indicator to empty string', () => {
      expect(service.appendPulse('')).toBe(' ●●●');
    });

    it('strips trailing pulse indicator and whitespace from text', () => {
      expect(service.stripPulse('hello world ●●●')).toBe('hello world');
    });

    it('returns text unchanged when no pulse indicator is present', () => {
      expect(service.stripPulse('hello world')).toBe('hello world');
    });

    it('strips pulse indicator when string contains only pulse indicator', () => {
      expect(service.stripPulse('●●●')).toBe('');
    });
  });

  describe('stripThinkingTags', () => {
    it('strips thought, thinking, and reasoning XML tags from text', () => {
      expect(service.stripThinkingTags('<thought>internal</thought>{"version": "v0.9"}')).toBe(
        '{"version": "v0.9"}',
      );
      expect(service.stripThinkingTags('<thinking>test</thinking>foo')).toBe('foo');
      expect(service.stripThinkingTags('<reasoning>why</reasoning>bar')).toBe('bar');
    });

    it('handles unclosed thinking tags', () => {
      expect(service.stripThinkingTags('<thought>unclosed')).toBe('');
    });

    it('returns text unchanged when no thinking tags are present', () => {
      expect(service.stripThinkingTags('normal text')).toBe('normal text');
    });
  });

  describe('extractCodeFences', () => {
    it('extracts content from markdown code fences and sets hasFences to true', () => {
      const result = service.extractCodeFences('```json\n{"version": "v0.9"}\n```');
      expect(result.hasFences).toBe(true);
      expect(result.extracted).toBe('{"version": "v0.9"}');
    });

    it('extracts and joins multiple markdown code fence blocks', () => {
      const result = service.extractCodeFences(
        '```json\n{"a": 1}\n```\nmiddle\n```json\n{"b": 2}\n```',
      );
      expect(result.hasFences).toBe(true);
      expect(result.extracted).toBe('{"a": 1}\n{"b": 2}');
    });

    it('returns original text and sets hasFences to false when no code fences are present', () => {
      const result = service.extractCodeFences('no fences here');
      expect(result.hasFences).toBe(false);
      expect(result.extracted).toBe('no fences here');
    });
  });

  describe('cleanPayload', () => {
    it('cleans payload by stripping pulse, thinking tags, and markdown code fences', () => {
      const input = '<thought>hmm</thought> ```json\n{"version": "v0.9"}\n``` ●●●';
      expect(service.cleanPayload(input)).toBe('{"version": "v0.9"}');
    });

    it('isolates opening curly brace of actual JSON content without truncating prose brackets', () => {
      const input =
        'Here is a list [with items] in prose, then layout:\n{"version": "v0.9", "createSurface": {}}';
      expect(service.cleanPayload(input)).toBe('{"version": "v0.9", "createSurface": {}}');
    });

    it('isolates JSON array start without truncating prose brackets', () => {
      const input = 'Prose [bracket] before array: [{"version": "v0.9"}]';
      expect(service.cleanPayload(input)).toBe('[{"version": "v0.9"}]');
    });

    it('isolates partial JSON array start with A2UI keys when prose contains brackets', () => {
      const input =
        'Prose [bracket] before streaming array: [\n  {\n    "createSurface": {"surfaceId": "s1"}';
      expect(service.cleanPayload(input)).toBe('[\n  {\n    "createSurface": {"surfaceId": "s1"}');
    });

    it('isolates JSON Lines layout stream without truncating prose brackets', () => {
      const input = 'Prose [bracket] before JSONL:\n{"version": "v0.9"}\n{"createSurface": {}}';
      expect(service.cleanPayload(input)).toBe('{"version": "v0.9"}\n{"createSurface": {}}');
    });

    it('does not isolate non-layout JSON array from prose', () => {
      const input = 'Prose before: [{"foo": "bar"}]';
      expect(service.cleanPayload(input)).toBe('Prose before: [{"foo": "bar"}]');
    });

    it('does not isolate non-layout JSON Lines stream from prose', () => {
      const input = 'Prose before:\n{"foo": "bar"}\n{"baz": "qux"}';
      expect(service.cleanPayload(input)).toBe('Prose before:\n{"foo": "bar"}\n{"baz": "qux"}');
    });

    it('returns cleaned text when content is not JSON', () => {
      expect(service.cleanPayload('hello world')).toBe('hello world');
    });
  });

  describe('isLayoutSnapshot', () => {
    it('returns true for object layout with version string', () => {
      expect(service.isLayoutSnapshot('{"version": "v0.9", "createSurface": {}}')).toBe(true);
    });

    it('returns true for layout with prose and version string', () => {
      expect(service.isLayoutSnapshot('Layout: {"version": "v0.9", "createSurface": {}}')).toBe(
        true,
      );
    });

    it('returns true for valid JSON array', () => {
      expect(service.isLayoutSnapshot('[{"version": "v0.9"}]')).toBe(true);
    });

    it('classifies streaming partial JSON arrays containing version or surface commands as layout snapshots', () => {
      expect(service.isLayoutSnapshot('[\n  {\n    "version": "v0.9"')).toBe(true);
      expect(service.isLayoutSnapshot('[\n  {\n    "createSurface": {"surfaceId": "s1"}')).toBe(
        true,
      );
      expect(service.isLayoutSnapshot('[\n  {\n    "updateComponents": {"surfaceId": "s1"}')).toBe(
        true,
      );
    });

    it('returns true for JSON Lines layout stream with version string', () => {
      expect(service.isLayoutSnapshot('{"version": "v0.9"}\n{"createSurface": {}}')).toBe(true);
    });

    it('returns true for JSON Lines layout stream without version but with layout commands', () => {
      expect(
        service.isLayoutSnapshot(
          '{"createSurface": {"surfaceId": "s1"}}\n{"updateComponents": {"surfaceId": "s1"}}',
        ),
      ).toBe(true);
    });

    it('returns false for non-layout JSON array', () => {
      expect(service.isLayoutSnapshot('[{"foo": "bar"}]')).toBe(false);
    });

    it('returns false for non-layout JSON Lines stream', () => {
      expect(service.isLayoutSnapshot('{"foo": "bar"}\n{"baz": "qux"}')).toBe(false);
    });

    it('returns false for arbitrary non-layout text', () => {
      expect(service.isLayoutSnapshot('hello world')).toBe(false);
    });

    it('returns false for object without version string', () => {
      expect(service.isLayoutSnapshot('{"foo": "bar"}')).toBe(false);
    });

    it('returns false when checking layout snapshot on empty or undefined input', () => {
      expect(service.isLayoutSnapshot('')).toBe(false);
      expect(service.isLayoutSnapshot(undefined)).toBe(false);
      expect(service.isLayoutSnapshot(null as unknown as string)).toBe(false);
    });
  });

  describe('Nullish and empty input resilience', () => {
    it('returns safe defaults when calling stripPulse on empty or nullish values', () => {
      expect(service.stripPulse('')).toBe('');
      expect(service.stripPulse(undefined as unknown as string)).toBe('');
      expect(service.stripPulse(null as unknown as string)).toBe('');
    });

    it('returns safe defaults when calling stripThinkingTags on empty or nullish values', () => {
      expect(service.stripThinkingTags('')).toBe('');
      expect(service.stripThinkingTags(undefined as unknown as string)).toBe('');
      expect(service.stripThinkingTags(null as unknown as string)).toBe('');
    });

    it('returns safe defaults when calling extractCodeFences on empty or nullish values', () => {
      expect(service.extractCodeFences('')).toEqual({extracted: '', hasFences: false});
      expect(service.extractCodeFences(undefined as unknown as string)).toEqual({
        extracted: '',
        hasFences: false,
      });
      expect(service.extractCodeFences(null as unknown as string)).toEqual({
        extracted: '',
        hasFences: false,
      });
    });

    it('returns safe defaults when calling cleanPayload on empty or nullish values', () => {
      expect(service.cleanPayload('')).toBe('');
      expect(service.cleanPayload(undefined as unknown as string)).toBe('');
      expect(service.cleanPayload(null as unknown as string)).toBe('');
    });
  });
});
