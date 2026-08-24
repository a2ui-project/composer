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

export class A2aInputAreaHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-input-area';

  private getTextarea = this.locatorFor('textarea.prompt-textarea');
  private getSendButton = this.locatorForOptional(
    MatButtonHarness.with({selector: '.send-circle-btn'}),
  );
  private getStopButton = this.locatorForOptional(
    MatButtonHarness.with({selector: '.stop-circle-btn'}),
  );
  private getAddButton = this.locatorFor(MatButtonHarness.with({selector: '.add-btn'}));
  private getImageChips = this.locatorForAll('.image-chip');

  async setInputValue(value: string): Promise<void> {
    const el = await this.getTextarea();
    await el.setInputValue(value);
    await el.dispatchEvent('input');
  }

  async getInputValue(): Promise<string> {
    const el = await this.getTextarea();
    return el.getProperty('value');
  }

  async sendEnter(): Promise<void> {
    const el = await this.getTextarea();
    await el.dispatchEvent('keydown', {key: 'Enter', shiftKey: false});
  }

  async sendShiftEnter(): Promise<void> {
    const el = await this.getTextarea();
    await el.dispatchEvent('keydown', {key: 'Enter', shiftKey: true});
  }

  async clickSend(): Promise<void> {
    const btn = await this.getSendButton();
    if (btn) {
      return btn.click();
    }
  }

  async clickStop(): Promise<void> {
    const btn = await this.getStopButton();
    if (btn) {
      return btn.click();
    }
  }

  async clickAttach(): Promise<void> {
    const btn = await this.getAddButton();
    return btn.click();
  }

  async isSendDisabled(): Promise<boolean> {
    const btn = await this.getSendButton();
    return btn ? btn.isDisabled() : true;
  }

  async getImageChipCount(): Promise<number> {
    const chips = await this.getImageChips();
    return chips.length;
  }
}
