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
import {signal, WritableSignal} from '@angular/core';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {ChatService} from './chat.service';
import {CatalogManagementService} from '../../storage/catalog-management.service';
import {Catalog} from '../../storage/catalog-storage.model';

class MockCatalogManagementService {
  public readonly activeCatalogSignal: WritableSignal<Catalog | null> = signal<Catalog | null>(
    null,
  );
}

describe('ChatService System Prompt and Schema Injection', () => {
  let service: ChatService;
  let catalogManagementMock: MockCatalogManagementService;

  beforeEach(() => {
    catalogManagementMock = new MockCatalogManagementService();

    TestBed.configureTestingModule({
      providers: [
        ChatService,
        {provide: CatalogManagementService, useValue: catalogManagementMock},
      ],
    });

    service = TestBed.inject(ChatService);
  });

  it('initializes successfully with dynamic computed signal properties', () => {
    expect(service).toBeTruthy();
    expect(service.systemPromptSignal).toBeDefined();
  });

  it('returns default instructions fallback prompt when catalog signal resolves to empty context', () => {
    catalogManagementMock.activeCatalogSignal.set(null);
    const prompt = service.systemPromptSignal();

    expect(prompt).toContain('SYSTEM INSTRUCTION SET');
    expect(prompt).toContain('You are an AI assistant designed to help model mock screens');
    expect(prompt).toContain('Status: [Awaiting renderer dynamic handshake settlement...]');
  });

  it('injects dynamic catalog title, description, and registered custom component schemas upon non-empty transitions', () => {
    const customCatalog: Catalog = {
      catalogId: 'test-catalog-123',
      title: 'Mock Catalog Custom',
      description: 'Provides mock interface components.',
      components: {
        CustomButton: {
          properties: {
            label: {type: 'string'},
          },
        },
      },
    };

    catalogManagementMock.activeCatalogSignal.set(customCatalog);
    const prompt = service.systemPromptSignal();

    expect(prompt).toContain('Mock Catalog Custom');
    expect(prompt).toContain('Provides mock interface components.');
    expect(prompt).toContain('test-catalog-123');
    expect(prompt).toContain('### Component ID: "CustomButton"');
    expect(prompt).toContain('"label": {');
    expect(prompt).toContain('"type": "string"');
  });

  it('notifies catalog empty status inside instructions block when components list declarations are empty', () => {
    const emptyCatalog: Catalog = {
      catalogId: 'empty-catalog',
      title: 'Empty Catalog',
      description: 'Zero custom elements.',
      components: {},
    };

    catalogManagementMock.activeCatalogSignal.set(emptyCatalog);
    const prompt = service.systemPromptSignal();

    expect(prompt).toContain('Empty Catalog');
    expect(prompt).toContain(
      '[Notice: The active catalog is empty and declares no custom dynamic widgets schemas.]',
    );
  });
});
