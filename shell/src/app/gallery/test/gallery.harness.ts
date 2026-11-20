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

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {MatNavListHarness} from '@angular/material/list/testing';
import {MatTableHarness} from '@angular/material/table/testing';
import {MatButtonHarness} from '@angular/material/button/testing';
import {RenderedFrameHarness} from '../../preview/rendered/test/rendered-frame.harness';
import {PropertyEditorHarness} from '../../shared/property-editor/test/property-editor.harness';

/**
 * Harness for interacting with the Gallery component in unit tests.
 */
export class GalleryHarness extends ComponentHarness {
  /**
   * The CSS selector used to locate the host element.
   */
  static hostSelector = 'a2ui-composer-gallery';

  private readonly getCategoryHeaders = this.locatorForAll('.category-header');
  private readonly getNavList = this.locatorFor(MatNavListHarness);
  private readonly getTable = this.locatorForOptional(MatTableHarness);
  private readonly getTitle = this.locatorForOptional('.component-title');
  private readonly getDescription = this.locatorForOptional('.component-description');
  private readonly getCopyButton = this.locatorForOptional(
    MatButtonHarness.with({
      selector:
        '.playground-wrapper:not(.hidden-frame) .preview-slot > mat-card:not(.hidden-frame) .copy-button',
    }),
  );
  private readonly getEmptySubtitle = this.locatorForOptional('.empty-subtitle');
  private readonly getCardTitles = this.locatorForAll('mat-card-title');

  /**
   * The Preview card's frame. While no component is selected it is hidden and
   * acts as the page's default message target. Null if it is not mounted.
   */
  readonly getPreviewFrame = this.locatorForOptional(
    new HarnessPredicate(RenderedFrameHarness, {ancestor: '.preview-card'}),
  );

  private readonly getPropertyEditor = this.locatorFor(PropertyEditorHarness);

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
   * Retrieves the labels of all playground view tabs.
   * It should be 'Preview' or 'Edit JSON'.
   */
  async getPlaygroundTabsText(): Promise<string[]> {
    const tabs = await this.locatorForAll(
      '.preview-slot > mat-card:not(.hidden-frame) .playground-tab',
    )();
    return Promise.all(tabs.map(async tab => (await tab.text()).trim()));
  }

  /**
   * Retrieves the label of the currently selected playground view tab.
   * It should be 'Preview' or 'Edit JSON'.
   */
  async getActivePlaygroundTabText(): Promise<string | null> {
    const activeTab = await this.locatorForOptional(
      '.playground-wrapper:not(.hidden-frame) .preview-slot > mat-card:not(.hidden-frame) .playground-tab[aria-selected="true"]',
    )();
    return activeTab ? (await activeTab.text()).trim() : null;
  }

  /**
   * Clicks a playground view tab by its label. Either 'Preview' or 'Edit JSON'.
   *
   * @param label The playground tab label to click. It should be 'Preview' or 'Edit JSON'.
   */
  async selectPlaygroundTab(label: string): Promise<void> {
    const tabs = await this.locatorForAll('.playground-tab')();
    for (const tab of tabs) {
      if ((await tab.text()).trim() === label) {
        await tab.click();
        return;
      }
    }
    throw new Error(`Could not find playground tab with text: "${label}"`);
  }

  /**
   * Checks whether the 'Preview' card is currently hidden.
   */
  async isPreviewCardHidden(): Promise<boolean> {
    const card = await this.locatorFor('.preview-card')();
    return card.hasClass('hidden-frame');
  }

  /**
   * Checks whether the 'Edit JSON' card is currently hidden.
   */
  async isJsonCardHidden(): Promise<boolean> {
    const card = await this.locatorFor('.json-card')();
    return card.hasClass('hidden-frame');
  }

  /**
   * Whether the editable example JSON is shown in the 'Edit JSON' card.
   */
  async hasDraftEditor(): Promise<boolean> {
    return !!(await this.locatorForOptional('a2ui-composer-monaco-editor.draft-json')());
  }

  /**
   * Whether any collapsible group or read-only component JSON block is rendered.
   */
  async hasCollapsibleJson(): Promise<boolean> {
    return (await this.locatorForAll('details, .usage-code')()).length > 0;
  }

  /**
   * Clicks the clipboard copy button.
   */
  async clickCopyButton(): Promise<void> {
    const activeTab = await this.getActivePlaygroundTabText();
    if (activeTab !== 'Edit JSON' && activeTab !== null) {
      await this.selectPlaygroundTab('Edit JSON');
    }
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
    const frame = await this.getPreviewFrame();
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

  /**
   * Replaces the editable example JSON through the Edit JSON card.
   */
  async editDraft(text: string): Promise<void> {
    const input = await this.locatorFor('.draft-json textarea.mock-monaco-textarea')();
    await input.setInputValue(text);
    await input.dispatchEvent('input');
  }

  /**
   * Reads the retained text, including an invalid edit.
   */
  async getDraftText(): Promise<string> {
    return (
      await this.locatorFor('.draft-json textarea.mock-monaco-textarea')()
    ).getProperty<string>('value');
  }

  /**
   * Edits a supported literal property using its visible control.
   */
  async editProperty(name: string, value: string): Promise<void> {
    return (await this.getPropertyEditor()).editProperty(name, value);
  }

  /**
   * Reads an input error without depending on component internals.
   */
  async getDraftError(): Promise<string | null> {
    const error = await this.locatorForOptional('.draft-error')();
    return error ? error.text() : null;
  }

  /**
   * Launches the current last valid example in Composer.
   */
  async openInComposer(): Promise<void> {
    await (
      await this.locatorFor(
        MatButtonHarness.with({
          selector: '.preview-slot > mat-card:not(.hidden-frame) button',
          text: /Open in Composer/,
        }),
      )()
    ).click();
  }

  /**
   * Resets the edited example back to its initial preset.
   */
  async resetDraft(): Promise<void> {
    await (await this.locatorFor(MatButtonHarness.with({text: 'Reset example'}))()).click();
  }

  /**
   * Reads the status messages displayed in the gallery.
   */
  async getStatusMessages(): Promise<string[]> {
    const messages = await this.locatorForAll('[role="status"]')();
    return Promise.all(messages.map(async message => (await message.text()).trim()));
  }
  /**
   * Selects a literal enum option using the native form control.
   */
  async selectPropertyOption(name: string, index: number): Promise<void> {
    return (await this.getPropertyEditor()).selectPropertyOption(name, index);
  }

  /**
   * Reads the option labels of an enum property, including "(not set)" when optional.
   */
  async getPropertyOptions(name: string): Promise<string[]> {
    return (await this.getPropertyEditor()).getPropertyOptions(name);
  }

  /**
   * Toggles a boolean property through its slide toggle.
   */
  async toggleProperty(name: string): Promise<void> {
    return (await this.getPropertyEditor()).toggleProperty(name);
  }

  /**
   * Lists the property section headings in display order.
   */
  async getPropertySectionHeadings(): Promise<string[]> {
    return (await this.getPropertyEditor()).getPropertySectionHeadings();
  }

  /**
   * Lists the editable property names in display order.
   */
  async getPropertyNames(): Promise<string[]> {
    return (await this.getPropertyEditor()).getPropertyNames();
  }

  /**
   * Reads which kind of control a property renders: array, object, select, checkbox, number, text or json.
   */
  async getPropertyControlKind(name: string): Promise<string | null> {
    return (await this.getPropertyEditor()).getPropertyControlKind(name);
  }

  /**
   * Returns the number of rendered rows in an array property control.
   */
  async getArrayItemCount(name: string): Promise<number> {
    return (await this.getPropertyEditor()).getArrayItemCount(name);
  }

  /**
   * Clicks the Add Entry button for an array property control.
   */
  async addArrayItem(name: string): Promise<void> {
    return (await this.getPropertyEditor()).addArrayItem(name);
  }

  /**
   * Clicks the Delete button for an item at `index` in an array property control.
   */
  async deleteArrayItem(name: string, index: number): Promise<void> {
    return (await this.getPropertyEditor()).deleteArrayItem(name, index);
  }

  /**
   * Lists the nested sub-property names rendered inside an object control.
   */
  async getObjectPropertyNames(name: string): Promise<string[]> {
    return (await this.getPropertyEditor()).getObjectPropertyNames(name);
  }

  /**
   * Whether a property shows the "required" marker.
   */
  async isPropertyRequired(name: string): Promise<boolean> {
    return (await this.getPropertyEditor()).isPropertyRequired(name);
  }

  /**
   * Whether a property offers a remove action.
   */
  async canRemoveProperty(name: string): Promise<boolean> {
    return (await this.getPropertyEditor()).canRemoveProperty(name);
  }

  /**
   * Removes an optional property through its remove action.
   */
  async removeProperty(name: string): Promise<void> {
    return (await this.getPropertyEditor()).removeProperty(name);
  }

  /**
   * Replaces a structured property's JSON and commits it like a blur would.
   */
  async editJsonProperty(name: string, text: string): Promise<void> {
    return (await this.getPropertyEditor()).editJsonProperty(name, text);
  }

  /**
   * Reads the text shown in a structured property's JSON field.
   */
  async getJsonPropertyText(name: string): Promise<string> {
    return (await this.getPropertyEditor()).getJsonPropertyText(name);
  }

  /**
   * Reads the inline error under a property, if any.
   */
  async getPropertyError(name: string): Promise<string | null> {
    return (await this.getPropertyEditor()).getPropertyError(name);
  }

  /**
   * Reads the read-only note shown for a bound or computed value, if any.
   */
  async getPropertyNote(name: string): Promise<string | null> {
    return (await this.getPropertyEditor()).getPropertyNote(name);
  }

  /**
   * Reads the `for` attribute of a top-level or nested object property's label.
   */
  async getPropertyLabelFor(name: string): Promise<string | null> {
    return (await this.getPropertyEditor()).getPropertyLabelFor(name);
  }

  /**
   * Whether a required property is flagged as missing from the example.
   */
  async isPropertyMissing(name: string): Promise<boolean> {
    return (await this.getPropertyEditor()).isPropertyMissing(name);
  }

  /**
   * Whether a property uses a single-line control rather than a JSON field or note.
   */
  async isPropertyInline(name: string): Promise<boolean> {
    return (await this.getPropertyEditor()).isPropertyInline(name);
  }
}
