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
import {describe, it, expect, vi, beforeEach} from 'vitest';

import {TestBed} from '@angular/core/testing';
import {ChatPromptFactoryService} from './chat-prompt-factory.service';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';

describe('ChatPromptFactoryService', () => {
  let service: ChatPromptFactoryService;
  let catalogSpy: unknown;

  beforeEach(() => {
    catalogSpy = {activeCatalog: vi.fn(), activeCatalogSignal: vi.fn(() => null)};
    TestBed.configureTestingModule({
      providers: [ChatPromptFactoryService, {provide: CatalogManagement, useValue: catalogSpy}],
    });
    service = TestBed.inject(ChatPromptFactoryService);
  });

  it('generate default prompt when no active catalog', () => {
    catalogSpy.activeCatalog.mockReturnValue(null);
    expect(service.systemPrompt()).toContain('A2UI Generation Expert');
    expect(service.systemPrompt()).not.toContain('Active Catalog Schema');
  });

  it('generate catalog specific prompt', () => {
    catalogSpy.activeCatalog.mockReturnValue({components: {}});
    expect(service.systemPrompt()).toContain('Active Catalog Schema');
    expect(service.systemPrompt()).toContain('A2UI Generation Expert');
  });
});
