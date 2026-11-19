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
import {MatTooltipHarness} from '@angular/material/tooltip/testing';

/**
 * Snapshot of a rendered row in the ComponentTree panel.
 */
export interface ComponentTreeRowSummary {
  readonly via: string | null;
  readonly type: string;
  readonly id: string;
  readonly badges: readonly string[];
  readonly missing: boolean;
  readonly cycle: boolean;
  readonly expanded: boolean | null;
}

/**
 * Test harness for the standalone ComponentTree panel.
 */
export class ComponentTreeHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-component-tree';

  private readonly getMessageElements = this.locatorForAll('.tree-message');
  private readonly getErrorMessageElement = this.locatorForOptional('.tree-message.error');
  private readonly getTruncatedBadgeElement = this.locatorForOptional(
    '.surface-header .badge.warn',
  );
  private readonly getUnreachableHeaderElement = this.locatorForOptional('.unreachable-header');
  private readonly getRowHarnesses = this.locatorForAll(ComponentTreeRowHarness);
  private readonly getRowTooltips = this.locatorForAll(
    MatTooltipHarness.with({selector: '.tree-row'}),
  );

  /**
   * Returns the text of all informational or empty-state messages in display order.
   */
  async getMessages(): Promise<string[]> {
    const elements = await this.getMessageElements();
    return Promise.all(elements.map(async element => (await element.text()).trim()));
  }

  /**
   * Returns the invalid-JSON error banner text, or null when the draft parses cleanly.
   */
  async getErrorMessage(): Promise<string | null> {
    const element = await this.getErrorMessageElement();
    return element ? (await element.text()).trim() : null;
  }

  /**
   * Checks whether the surface header displays the truncation warning badge.
   */
  async hasTruncatedBadge(): Promise<boolean> {
    return (await this.getTruncatedBadgeElement()) !== null;
  }

  /**
   * Checks whether the "Not reachable from root" section header is rendered.
   */
  async hasUnreachableHeader(): Promise<boolean> {
    return (await this.getUnreachableHeaderElement()) !== null;
  }

  /**
   * Returns structured summaries of all rendered tree rows in pre-order display sequence.
   */
  async getRows(): Promise<ComponentTreeRowSummary[]> {
    const rows = await this.getRowHarnesses();
    return Promise.all(rows.map(row => row.getSummary()));
  }

  /**
   * Returns the `#id` labels of all visible tree rows in display order.
   */
  async getRowIds(): Promise<string[]> {
    const rows = await this.getRowHarnesses();
    return Promise.all(rows.map(row => row.getId()));
  }

  /**
   * Clicks the expand/collapse toggle button on the matching `#id` row (at the given occurrence).
   */
  async toggleRow(id: string, occurrence = 0): Promise<void> {
    const index = await this.findRowIndex(id, occurrence);
    const rows = await this.getRowHarnesses();
    await rows[index].toggle();
  }

  /**
   * Shows, reads, and hides the tooltip text for the matching `#id` row (at the given occurrence).
   */
  async getTooltipText(id: string, occurrence = 0): Promise<string> {
    const index = await this.findRowIndex(id, occurrence);
    const tooltips = await this.getRowTooltips();
    const tooltip = tooltips[index];
    if (await tooltip.isDisabled()) {
      return '';
    }
    await tooltip.show();
    const text = await tooltip.getTooltipText();
    await tooltip.hide();
    return text;
  }

  private async findRowIndex(id: string, occurrence: number): Promise<number> {
    const ids = await this.getRowIds();
    let seen = 0;
    for (let index = 0; index < ids.length; index++) {
      if (ids[index] === id) {
        if (seen === occurrence) {
          return index;
        }
        seen++;
      }
    }
    throw new Error(`Row "${id}" (occurrence ${occurrence}) not found in [${ids.join(', ')}].`);
  }
}

class ComponentTreeRowHarness extends ComponentHarness {
  static hostSelector = '.tree-row';

  private readonly getViaElement = this.locatorForOptional('.via');
  private readonly getTypeElement = this.locatorFor('.type');
  private readonly getIdElement = this.locatorFor('.id');
  private readonly getBadgeElements = this.locatorForAll('.badge');
  private readonly getToggleButton = this.locatorForOptional('button.toggle');

  async getSummary(): Promise<ComponentTreeRowSummary> {
    const host = await this.host();
    const viaElement = await this.getViaElement();
    const typeElement = await this.getTypeElement();
    const idElement = await this.getIdElement();
    const badgeElements = await this.getBadgeElements();
    const toggleButton = await this.getToggleButton();

    const expandedAttr = toggleButton ? await toggleButton.getAttribute('aria-expanded') : null;

    return {
      via: viaElement ? await viaElement.text() : null,
      type: await typeElement.text(),
      id: await idElement.text(),
      badges: await Promise.all(badgeElements.map(badge => badge.text())),
      missing: await host.hasClass('missing'),
      cycle: await host.hasClass('cycle'),
      expanded: expandedAttr === null ? null : expandedAttr === 'true',
    };
  }

  async getId(): Promise<string> {
    return (await this.getIdElement()).text();
  }

  async toggle(): Promise<void> {
    const button = await this.getToggleButton();
    if (!button) {
      throw new Error(`Row ${await this.getId()} does not have an expand/collapse toggle button.`);
    }
    await button.click();
  }
}
