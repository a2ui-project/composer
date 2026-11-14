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
import {MatSlideToggleHarness} from '@angular/material/slide-toggle/testing';

/**
 * Test harness for the standalone PropertyEditor component.
 */
export class PropertyEditorHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-property-editor';

  /**
   * Edits a supported literal property using its visible control.
   */
  async editProperty(name: string, value: string): Promise<void> {
    const input = await this.locatorFor(`[data-property="${name}"]`)();
    await input.setInputValue(value);
    await input.dispatchEvent('input');
  }

  /**
   * Selects a literal enum option using the native form control.
   */
  async selectPropertyOption(name: string, index: number): Promise<void> {
    const select = await this.locatorFor(`[data-property="${name}"]`)();
    await select.selectOptions(index);
    await select.dispatchEvent('change');
  }

  /**
   * Reads the option labels of an enum property, including "(not set)" when optional.
   */
  async getPropertyOptions(name: string): Promise<string[]> {
    const options = await this.locatorForAll(`select[data-property="${name}"] option`)();
    return Promise.all(options.map(option => option.text()));
  }

  /**
   * Toggles a boolean property through its slide toggle.
   */
  async toggleProperty(name: string): Promise<void> {
    const toggle = await this.locatorFor(
      MatSlideToggleHarness.with({selector: `[data-property="${name}"]`}),
    )();
    await toggle.toggle();
  }

  /**
   * Lists the property section headings in display order.
   */
  async getPropertySectionHeadings(): Promise<string[]> {
    const headings = await this.locatorForAll('.property-section-heading')();
    return Promise.all(headings.map(async heading => (await heading.text()).trim()));
  }

  /**
   * Lists the editable property names in display order.
   */
  async getPropertyNames(): Promise<string[]> {
    const names = await this.locatorForAll('.property-name > span:first-child')();
    return Promise.all(names.map(name => name.text()));
  }

  /**
   * Reads which kind of control a property renders: array, object, select, checkbox, number, text or json.
   */
  async getPropertyControlKind(name: string): Promise<string | null> {
    if (await this.locatorForOptional(`[data-property-array="${name}"]`)()) {
      return 'array';
    }
    if (await this.locatorForOptional(`[data-property-object="${name}"]`)()) {
      return 'object';
    }
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
    if (tagName === 'MAT-SLIDE-TOGGLE') {
      return 'checkbox';
    }
    return control.getAttribute('type');
  }

  /**
   * Returns the number of rendered rows in an array property control.
   */
  async getArrayItemCount(name: string): Promise<number> {
    const items = await this.locatorForAll(`[data-property-array="${name}"] > .array-item-row`)();
    return items.length;
  }

  /**
   * Clicks the Add Entry button for an array property control.
   */
  async addArrayItem(name: string): Promise<void> {
    await (await this.locatorFor(`[data-add-array-item="${name}"]`)()).click();
  }

  /**
   * Clicks the Delete button for an item at `index` in an array property control.
   */
  async deleteArrayItem(name: string, index: number): Promise<void> {
    await (await this.locatorFor(`[data-delete-array-item="${name}.${index}"]`)()).click();
  }

  /**
   * Lists the nested sub-property names rendered inside an object control.
   */
  async getObjectPropertyNames(name: string): Promise<string[]> {
    const labels = await this.locatorForAll(
      `[data-property-object="${name}"] > .object-property-field > .object-property-label > span:first-child`,
    )();
    return Promise.all(labels.map(label => label.text()));
  }

  /**
   * Whether a property shows the "required" marker.
   */
  async isPropertyRequired(name: string): Promise<boolean> {
    return !!(await this.locatorForOptional(
      `[data-property-row="${name}"] > .property-name .required-marker`,
    )());
  }

  /**
   * Whether a property offers a remove action.
   */
  async canRemoveProperty(name: string): Promise<boolean> {
    return !!(await this.locatorForOptional(`[data-remove-property="${name}"]`)());
  }

  /**
   * Removes an optional property through its remove action.
   */
  async removeProperty(name: string): Promise<void> {
    await (await this.locatorFor(`[data-remove-property="${name}"]`)()).click();
  }

  /**
   * Replaces a structured property's JSON and commits it like a blur would.
   */
  async editJsonProperty(name: string, text: string): Promise<void> {
    const field = await this.locatorFor(`textarea[data-property="${name}"]`)();
    await field.setInputValue(text);
    await field.dispatchEvent('change');
  }

  /**
   * Reads the text shown in a structured property's JSON field.
   */
  async getJsonPropertyText(name: string): Promise<string> {
    return (await this.locatorFor(`textarea[data-property="${name}"]`)()).getProperty<string>(
      'value',
    );
  }

  /**
   * Reads the inline error under a property, if any.
   */
  async getPropertyError(name: string): Promise<string | null> {
    const byId = await this.locatorForOptional(`[id="gallery-property-error-${name}"]`)();
    if (byId) {
      return byId.text();
    }
    const error = await this.locatorForOptional(`[data-property-row="${name}"] .property-error`)();
    return error ? error.text() : null;
  }

  /**
   * Reads the read-only note shown for a bound or computed value, if any.
   */
  async getPropertyNote(name: string): Promise<string | null> {
    const note = await this.locatorForOptional(`[data-property-note="${name}"]`)();
    return note ? note.text() : null;
  }

  /**
   * Reads the `for` attribute of a top-level or nested object property's label.
   */
  async getPropertyLabelFor(name: string): Promise<string | null> {
    const label = await this.locatorFor(
      `[data-property-row="${name}"] > .property-name, [data-object-property="${name}"] > .object-property-label`,
    )();
    return label.getAttribute('for');
  }

  /**
   * Whether a required property is flagged as missing from the example.
   */
  async isPropertyMissing(name: string): Promise<boolean> {
    return (await this.locatorForOptional(`[data-property-missing="${name}"]`)()) !== null;
  }

  /**
   * Whether a property uses a single-line control rather than a JSON field or note.
   */
  async isPropertyInline(name: string): Promise<boolean> {
    const row = await this.locatorFor(`[data-property-row="${name}"]`)();
    return !(await row.hasClass('property-row-multiline'));
  }
}
