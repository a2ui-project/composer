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

import {ComponentHarness} from '@angular/cdk/testing';
import {MatExpansionPanelHarness} from '@angular/material/expansion/testing';

export class RawMessagesHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-raw-messages';

  private getExpansionPanels = this.locatorForAll(MatExpansionPanelHarness);

  async getLoggedMessagesCount(): Promise<number> {
    const list = await this.locatorForAll('[data-testid="raw-message-envelope"]')();
    const panels = await this.getExpansionPanels();
    return list.length + panels.length;
  }

  async getLlmLogPanelsCount(): Promise<number> {
    const panels = await this.getExpansionPanels();
    return panels.length;
  }

  async getLlmLogPanelAt(index: number): Promise<MatExpansionPanelHarness> {
    const panels = await this.getExpansionPanels();
    if (index < 0 || index >= panels.length) {
      throw new Error(`Index ${index} out of bounds for LLM log panels!`);
    }
    return panels[index];
  }

  async getMessageTextAt(index: number): Promise<string> {
    const elements = await this.locatorForAll(
      '[data-testid="raw-message-envelope"], [data-testid="llm-log-panel"]',
    )();
    if (index < 0 || index >= elements.length) {
      throw new Error(`Index ${index} out of bounds for unified raw messages list!`);
    }
    return elements[index].text();
  }

  async getMessageTimestampAt(index: number): Promise<string> {
    const list = await this.locatorForAll('.raw-messages-container .timestamp')();
    if (index < 0 || index >= list.length) {
      throw new Error(`Index ${index} out of bounds for unified timestamp list!`);
    }
    return list[index].text();
  }

  async isMessageCollapsibleAt(index: number): Promise<boolean> {
    const elements = await this.locatorForAll(
      '[data-testid="raw-message-envelope"], [data-testid="llm-log-panel"]',
    )();
    if (index < 0 || index >= elements.length) {
      throw new Error(`Index ${index} out of bounds for raw messages list!`);
    }
    return await elements[index].hasClass('llm-log-panel');
  }

  async getAllEntries(): Promise<{type: 'postMessage' | 'llm'; text: string}[]> {
    const elements = await this.locatorForAll(
      '[data-testid="raw-message-envelope"], [data-testid="llm-log-panel"]',
    )();
    const entries: {type: 'postMessage' | 'llm'; text: string}[] = [];
    for (const el of elements) {
      const isLlm = await el.hasClass('llm-log-panel');
      const text = await el.text();
      entries.push({
        type: isLlm ? 'llm' : 'postMessage',
        text,
      });
    }
    return entries;
  }

  async hasPlaceholder(): Promise<boolean> {
    const placeholder = await this.locatorForOptional('.raw-messages-placeholder')();
    return placeholder !== null;
  }
}
