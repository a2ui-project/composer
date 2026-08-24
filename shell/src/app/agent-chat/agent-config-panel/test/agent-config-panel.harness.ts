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
import {MatInputHarness} from '@angular/material/input/testing';

export class AgentConfigPanelHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-agent-config-panel';

  private getInputs = this.locatorForAll(MatInputHarness);
  private getSaveButton = this.locatorFor(MatButtonHarness.with({selector: '.save-btn'}));
  private getCancelButton = this.locatorForOptional(MatButtonHarness.with({text: 'Cancel'}));
  private getClearButton = this.locatorFor(MatButtonHarness.with({selector: '.clear-address-btn'}));
  private getErrorBox = this.locatorForOptional('.connection-error-box');

  async setEndpoint(value: string): Promise<void> {
    const inputs = await this.getInputs();
    if (inputs.length > 0) {
      await inputs[0].setValue(value);
    }
  }

  async getEndpoint(): Promise<string> {
    const inputs = await this.getInputs();
    return inputs.length > 0 ? inputs[0].getValue() : '';
  }

  async setTenantId(value: string): Promise<void> {
    const inputs = await this.getInputs();
    if (inputs.length > 1) {
      await inputs[1].setValue(value);
    }
  }

  async getTenantId(): Promise<string | null> {
    const inputs = await this.getInputs();
    return inputs.length > 1 ? inputs[1].getValue() : null;
  }

  async clickSave(): Promise<void> {
    const btn = await this.getSaveButton();
    return btn.click();
  }

  async clickCancel(): Promise<void> {
    const btn = await this.getCancelButton();
    if (btn) {
      return btn.click();
    }
  }

  async clickClear(): Promise<void> {
    const btn = await this.getClearButton();
    return btn.click();
  }

  async isSaveDisabled(): Promise<boolean> {
    const btn = await this.getSaveButton();
    return btn.isDisabled();
  }

  async getErrorMessage(): Promise<string | null> {
    const err = await this.getErrorBox();
    return err ? err.text() : null;
  }
}
