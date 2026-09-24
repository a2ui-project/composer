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
import {MatTabGroupHarness} from '@angular/material/tabs/testing';
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
  private readonly getExampleTabs = this.locatorFor(
    MatTabGroupHarness.with({selector: '.example-tabs'}),
  );
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

  /** Retrieves the labels of the Preview card tabs. */
  async getExampleTabLabels(): Promise<string[]> {
    const tabs = await (await this.getExampleTabs()).getTabs();
    return Promise.all(tabs.map(tab => tab.getLabel()));
  }

  /** Switches the Preview card to one of its tabs. */
  async selectExampleTab(label: string): Promise<void> {
    await (await this.getExampleTabs()).selectTab({label});
  }

  /** Whether the editable example JSON is shown in the Edit JSON tab. */
  async hasDraftEditor(): Promise<boolean> {
    await this.selectExampleTab('Edit JSON');
    return !!(await this.locatorForOptional('.draft-json')());
  }

  /** Whether any collapsible group or read-only component JSON block is rendered. */
  async hasCollapsibleJson(): Promise<boolean> {
    return (await this.locatorForAll('details, .usage-code')()).length > 0;
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
  /** Replaces the editable example JSON through the Edit JSON tab. */
  async editDraft(text: string): Promise<void> {
    await this.selectExampleTab('Edit JSON');
    const input = await this.locatorFor('.draft-json')();
    await input.setInputValue(text);
    await input.dispatchEvent('input');
  }

  /** Reads the retained text, including an invalid edit. */
  async getDraftText(): Promise<string> {
    await this.selectExampleTab('Edit JSON');
    return (await this.locatorFor('.draft-json')()).getProperty<string>('value');
  }

  /** Edits a supported literal property using its visible control. */
  async editProperty(name: string, value: string): Promise<void> {
    const input = await this.locatorFor(`[data-property="${name}"]`)();
    await input.setInputValue(value);
    await input.dispatchEvent('input');
  }

  /** Reads an input error without depending on component internals. */
  async getDraftError(): Promise<string | null> {
    const error = await this.locatorForOptional('.draft-error')();
    return error ? error.text() : null;
  }

  /** Launches the current last valid example in Composer. */
  async openInComposer(): Promise<void> {
    await (await this.locatorFor(MatButtonHarness.with({text: 'Open in Composer'}))()).click();
  }
  /** Selects a literal enum option using the native form control. */
  async selectPropertyOption(name: string, index: number): Promise<void> {
    const select = await this.locatorFor(`[data-property="${name}"]`)();
    await select.selectOptions(index);
    await select.dispatchEvent('change');
  }

  /** Reads the option labels of an enum property, including "(not set)" when optional. */
  async getPropertyOptions(name: string): Promise<string[]> {
    const options = await this.locatorForAll(`select[data-property="${name}"] option`)();
    return Promise.all(options.map(option => option.text()));
  }

  /** Toggles a boolean property through its native checkbox. */
  async toggleProperty(name: string): Promise<void> {
    await (await this.locatorFor(`[data-property="${name}"]`)()).click();
  }

  /** Lists the editable property names in display order. */
  async getPropertySectionHeadings(): Promise<string[]> {
    const headings = await this.locatorForAll('.property-section-heading')();
    return Promise.all(headings.map(async heading => (await heading.text()).trim()));
  }

  async getPropertyNames(): Promise<string[]> {
    const names = await this.locatorForAll('.property-name > span:first-child')();
    return Promise.all(names.map(name => name.text()));
  }

  /** Reads which kind of control a property renders: select, checkbox, number, text or json. */
  async getPropertyControlKind(name: string): Promise<string | null> {
    const control = await this.locatorForOptional(`[data-property="${name}"]`)();
    if (!control) {
      return null;
    }
    const tagName = await control.getProperty<string>('tagName');
    if (tagName === 'TEXTAREA') {
      return 'json';
    }
    if (tagName === 'SELECT') {
      return 'select';
    }
    return control.getAttribute('type');
  }

  /** Whether a property shows the "required" marker. */
  async isPropertyRequired(name: string): Promise<boolean> {
    return !!(await this.locatorForOptional(`[data-property-row="${name}"] .required-marker`)());
  }

  /** Whether a property offers a remove action. */
  async canRemoveProperty(name: string): Promise<boolean> {
    return !!(await this.locatorForOptional(`[data-remove-property="${name}"]`)());
  }

  /** Removes an optional property through its remove action. */
  async removeProperty(name: string): Promise<void> {
    await (await this.locatorFor(`[data-remove-property="${name}"]`)()).click();
  }

  /** Replaces a structured property's JSON and commits it like a blur would. */
  async editJsonProperty(name: string, text: string): Promise<void> {
    const field = await this.locatorFor(`textarea[data-property="${name}"]`)();
    await field.setInputValue(text);
    await field.dispatchEvent('change');
  }

  /** Reads the text shown in a structured property's JSON field. */
  async getJsonPropertyText(name: string): Promise<string> {
    return (await this.locatorFor(`textarea[data-property="${name}"]`)()).getProperty<string>(
      'value',
    );
  }

  /** Reads the inline error under a property, if any. */
  async getPropertyError(name: string): Promise<string | null> {
    const error = await this.locatorForOptional(`[data-property-row="${name}"] .property-error`)();
    return error ? error.text() : null;
  }

  /** Reads the read-only note shown for a bound or computed value, if any. */
  async getPropertyNote(name: string): Promise<string | null> {
    const note = await this.locatorForOptional(`[data-property-note="${name}"]`)();
    return note ? note.text() : null;
  }

  /** Whether a property keeps its name and control on one row rather than stacking them. */
  async isPropertyInline(name: string): Promise<boolean> {
    const row = await this.locatorFor(`[data-property-row="${name}"]`)();
    return !(await row.hasClass('property-row-stacked'));
  }
}
