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

import {Injectable, inject, computed} from '@angular/core';
import {CatalogManagementService} from '../storage/catalog-management.service';

@Injectable({
  providedIn: 'root',
})
/**
 * Dynamic chat panel coordinator managing system prompt generation using dynamic component configurations.
 */
export class ChatService {
  private readonly catalogManagement = inject(CatalogManagementService);

  /**
   * A dynamic, reactive, computed signal property constructing system prompt blocks
   * from registered custom components metadata schemas.
   */
  public readonly systemPromptSignal = computed<string>(() => {
    const catalog = this.catalogManagement.activeCatalogSignal();
    if (!catalog) {
      return (
        'SYSTEM INSTRUCTION SET\n' +
        '----------------------\n' +
        'You are an AI assistant designed to help model mock screens inside A2UI Composer shell.\n' +
        'Status: [Awaiting renderer dynamic handshake settlement...]'
      );
    }

    const title = catalog.title || 'Dynamic Catalog';
    const desc = catalog.description || 'Custom application elements layout catalog.';
    let prompt =
      'SYSTEM INSTRUCTION SET\n' +
      '----------------------\n' +
      `Catalog Metadata:\n` +
      `- Identifier: ${catalog.catalogId || 'Unknown ID'}\n` +
      `- Name: ${title}\n` +
      `- Description: ${desc}\n\n` +
      `You are an AI assistant authorized to author and return declarative UI component layout blocks in JSON arrays conforming natively to the following active custom schema specifications:\n\n`;

    const components = catalog.components;
    if (components && Object.keys(components).length > 0) {
      for (const [name, schema] of Object.entries(components)) {
        prompt += `### Component ID: "${name}"\n`;
        prompt += `JSON Schema Definition:\n`;
        prompt += `\`\`\`json\n`;
        prompt += `${JSON.stringify(schema, null, 2)}\n`;
        prompt += `\`\`\`\n\n`;
      }
    } else {
      prompt += `[Notice: The active catalog is empty and declares no custom dynamic widgets schemas.]\n`;
    }

    return prompt.trim();
  });
}
