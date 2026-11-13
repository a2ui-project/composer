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

import {ComponentHarness, HarnessPredicate, BaseHarnessFilters} from '@angular/cdk/testing';

/**
 * CDK Test harness for interacting with and asserting on A2UI Composer RPC Reply Forms.
 */
export class RpcReplyFormHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-rpc-reply-form';

  static with(options: BaseHarnessFilters = {}): HarnessPredicate<RpcReplyFormHarness> {
    return new HarnessPredicate(RpcReplyFormHarness, options);
  }

  private readonly getValueTextarea = this.locatorForOptional('textarea.rpc-value-input');
  private readonly getErrorCodeInput = this.locatorForOptional('input.rpc-error-code-input');
  private readonly getErrorMessageInput = this.locatorForOptional('input.rpc-error-message-input');
  private readonly getReplyValueBtn = this.locatorForOptional('button.rpc-reply-value-btn');
  private readonly getReplyErrorBtn = this.locatorForOptional('button.rpc-reply-error-btn');
  private readonly getValidationErrorEl = this.locatorForOptional('.rpc-validation-error');
  private readonly getStatusBadgeEl = this.locatorForOptional('.rpc-status-badge');
  private readonly getRemainingTimeEl = this.locatorForOptional('.rpc-remaining-time');

  async getValueInput(): Promise<string> {
    const el = await this.getValueTextarea();
    return el ? el.getProperty('value') : '';
  }

  async setValueInput(val: string): Promise<void> {
    const el = await this.getValueTextarea();
    if (!el) {
      throw new Error('Cannot set value: value textarea not present');
    }
    await el.clear();
    await el.sendKeys(val);
  }

  async getErrorCode(): Promise<string> {
    const el = await this.getErrorCodeInput();
    return el ? el.getProperty('value') : '';
  }

  async setErrorCode(code: string): Promise<void> {
    const el = await this.getErrorCodeInput();
    if (!el) {
      throw new Error('Cannot set error code: input not present');
    }
    await el.clear();
    await el.sendKeys(code);
  }

  async getErrorMessage(): Promise<string> {
    const el = await this.getErrorMessageInput();
    return el ? el.getProperty('value') : '';
  }

  async setErrorMessage(msg: string): Promise<void> {
    const el = await this.getErrorMessageInput();
    if (!el) {
      throw new Error('Cannot set error message: input not present');
    }
    await el.clear();
    await el.sendKeys(msg);
  }

  async clickReplyValue(): Promise<void> {
    const btn = await this.getReplyValueBtn();
    if (!btn) {
      throw new Error('Cannot click Reply Value button: button not present');
    }
    await btn.click();
  }

  async clickReplyError(): Promise<void> {
    const btn = await this.getReplyErrorBtn();
    if (!btn) {
      throw new Error('Cannot click Reply Error button: button not present');
    }
    await btn.click();
  }

  async getValidationError(): Promise<string | null> {
    const el = await this.getValidationErrorEl();
    return el ? (await el.text()).trim() : null;
  }

  async getStatusBadge(): Promise<string | null> {
    const el = await this.getStatusBadgeEl();
    return el ? (await el.text()).trim() : null;
  }

  async getRemainingTime(): Promise<string | null> {
    const el = await this.getRemainingTimeEl();
    return el ? (await el.text()).trim() : null;
  }

  async isPending(): Promise<boolean> {
    const textarea = await this.getValueTextarea();
    return textarea !== null;
  }
}
