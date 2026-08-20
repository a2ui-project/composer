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
import {
  StartupConfigStateService,
  RendererConfig,
  ApiKeyConfig,
} from './startup-config-state.service';

describe('StartupConfigStateService', () => {
  let service: StartupConfigStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StartupConfigStateService],
    });
    service = TestBed.inject(StartupConfigStateService);
  });

  it('creates the service', () => {
    expect(service).toBeTruthy();
  });

  it('sets and gets resolvedUrl', () => {
    service.setResolvedUrl('http://test.com');
    expect(service.resolvedUrl()).toBe('http://test.com');
  });

  it('sets and gets renderers', () => {
    const renderers: Record<string, RendererConfig> = {r1: {id: 'r1', name: 'Test'}};
    service.setRenderers(renderers);
    expect(service.renderers()).toEqual(renderers);
  });

  it('sets and gets selectedRendererId', () => {
    service.setSelectedRendererId('renderer-123');
    expect(service.selectedRendererId()).toBe('renderer-123');
  });

  it('sets and gets apiKeys', () => {
    const keys: Record<string, ApiKeyConfig> = {k1: {apiKey: 'abc'}};
    service.setApiKeys(keys);
    expect(service.apiKeys()).toEqual(keys);
  });

  it('sets and gets sharedA2uiPayload', () => {
    service.setSharedA2uiPayload('{"test": true}');
    expect(service.sharedA2uiPayload()).toBe('{"test": true}');
  });

  it('sets and gets sharedA2uiError', () => {
    service.setSharedA2uiError('Parsing failed');
    expect(service.sharedA2uiError()).toBe('Parsing failed');
  });

  describe('activeRenderer', () => {
    it('returns null when selectedRendererId is null', () => {
      service.setSelectedRendererId(null);
      expect(service.activeRenderer()).toBeNull();
    });

    it('resolves renderer by dictionary key', () => {
      const renderers: Record<string, RendererConfig> = {
        key1: {id: 'key1', name: 'Alpha'},
      };
      service.setRenderers(renderers);
      service.setSelectedRendererId('key1');
      expect(service.activeRenderer()).toEqual(renderers['key1']);
    });

    it('resolves renderer by fallback name match', () => {
      const renderers: Record<string, RendererConfig> = {
        key1: {id: 'key1', name: 'Alpha'},
      };
      service.setRenderers(renderers);
      service.setSelectedRendererId('Alpha');
      expect(service.activeRenderer()).toEqual(renderers['key1']);
    });

    it('returns null when neither key nor name match exists', () => {
      const renderers: Record<string, RendererConfig> = {
        key1: {id: 'key1', name: 'Alpha'},
      };
      service.setRenderers(renderers);
      service.setSelectedRendererId('Beta');
      expect(service.activeRenderer()).toBeNull();
    });
  });
});
