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
import {MatNavListHarness} from '@angular/material/list/testing';
import {MatTableHarness} from '@angular/material/table/testing';
import {MatButtonHarness} from '@angular/material/button/testing';
import {RenderedFrameHarness} from '../../preview/rendered/test/rendered-frame.harness';

/**
 * Harness for interacting with the Gallery component in unit tests.
 */
export class GalleryHarness extends ComponentHarness {
  /** The CSS selector used to locate the host element. */
  static hostSelector = 'a2ui-composer-gallery';

  private readonly getCategoryHeaders = this.locatorForAll('.category-header');
  private readonly getNavList = this.locatorFor(MatNavListHarness);
  private readonly getTable = this.locatorForOptional(MatTableHarness);
  private readonly getTitle = this.locatorForOptional('.component-title');
  private readonly getDescription = this.locatorForOptional('.component-description');
  private readonly getUsageCode = this.locatorForOptional('.usage-code');
  private readonly getCopyButton = this.locatorForOptional(
    MatButtonHarness.with({selector: '.copy-button'}),
  );
  private readonly getEmptySubtitle = this.locatorForOptional('.empty-subtitle');
  private readonly getCardTitles = this.locatorForAll('mat-card-title');
  private readonly getRenderedFrame = this.locatorForOptional(RenderedFrameHarness);

  /**
   * Retrieves the text labels of all category subheaders.
   */
  async getCategoryHeadersText(): Promise<string[]> {
    const headers = await this.getCategoryHeaders();
    return Promise.all(headers.map(h => h.text()));
  }

  /**
   * Retrieves the text contents of all component navigation list items.
   */
  async getNavigationLinksText(): Promise<string[]> {
    const list = await this.getNavList();
    const items = await list.getItems();
    return Promise.all(items.map(item => item.getFullText()));
  }

  /**
   * Clicks a component list item by its text value.
   *
   * @param text The component link text to click.
   */
  async clickNavigationLink(text: string): Promise<void> {
    const list = await this.getNavList();
    const items = await list.getItems({text});
    if (items.length === 0) {
      throw new Error(`Could not find navigation link with text: "${text}"`);
    }
    await items[0].click();
  }

  /**
   * Retrieves the title of the active component details panel.
   */
  async getSelectedComponentTitle(): Promise<string | null> {
    const titleEl = await this.getTitle();
    return titleEl ? titleEl.text() : null;
  }

  /**
   * Retrieves the description of the active component details panel.
   */
  async getSelectedComponentDescription(): Promise<string | null> {
    const descEl = await this.getDescription();
    return descEl ? descEl.text() : null;
  }

  /**
   * Retrieves the current usage code block content.
   */
  async getUsageCodeText(): Promise<string | null> {
    const codeEl = await this.getUsageCode();
    return codeEl ? codeEl.text() : null;
  }

  /**
   * Clicks the clipboard copy button.
   */
  async clickCopyButton(): Promise<void> {
    const button = await this.getCopyButton();
    if (!button) {
      throw new Error('Clipboard copy button is not present');
    }
    await button.click();
  }

  /**
   * Retrieves the empty state description text if visible.
   */
  async getEmptyStateSubtitleText(): Promise<string | null> {
    const subtitleEl = await this.getEmptySubtitle();
    return subtitleEl ? subtitleEl.text() : null;
  }

  /**
   * Retrieves the card title texts of all detail panels.
   */
  async getCardTitlesText(): Promise<string[]> {
    const titles = await this.getCardTitles();
    return Promise.all(titles.map(t => t.text()));
  }

  /**
   * Checks if the sandboxed preview rendered frame is present.
   */
  async hasRenderedFrame(): Promise<boolean> {
    const frame = await this.getRenderedFrame();
    return !!frame;
  }

  /**
   * Retrieves the properties table data as parsed records.
   */
  async getPropertiesTableData(): Promise<Array<Record<string, string>>> {
    const table = await this.getTable();
    if (!table) {
      return [];
    }
    const rows = await table.getRows();
    const records: Array<Record<string, string>> = [];
    for (const row of rows) {
      const columnText = await row.getCellTextByColumnName();
      records.push({
        name: columnText['name'],
        description: columnText['description'],
        type: columnText['type'],
        required: columnText['required'],
        defaultValue: columnText['defaultValue'],
      });
    }
    return records;
  }
}
