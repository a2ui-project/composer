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
import {MatButtonHarness} from '@angular/material/button/testing';
import {MatExpansionPanelHarness} from '@angular/material/expansion/testing';

export class A2aMessageInspectorHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-message-inspector';

  private getPanels = this.locatorForAll(MatExpansionPanelHarness);
  private getCloseButton = this.locatorFor(
    MatButtonHarness.with({selector: 'button[aria-label="Close Inspector"]'}),
  );
  private getClearButton = this.locatorForOptional(
    MatButtonHarness.with({selector: '.clear-all-btn'}),
  );
  private getCounterBadge = this.locatorForOptional('.event-counter-badge');

  async getPanelCount(): Promise<number> {
    const panels = await this.getPanels();
    return panels.length;
  }

  async getCounterText(): Promise<string | null> {
    const badge = await this.getCounterBadge();
    return badge ? badge.text() : null;
  }

  async clickClose(): Promise<void> {
    const btn = await this.getCloseButton();
    return btn.click();
  }

  async clickClear(): Promise<void> {
    const btn = await this.getClearButton();
    if (btn) {
      return btn.click();
    }
  }
}
