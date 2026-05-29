/**
 * @license
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
import {MatInputHarness} from '@angular/material/input/testing';

/**
 * Harness for interacting with the raw-frame preview editor.
 * Exposes methods to view and modify layout drafts in a code view.
 */
export class RawFrameHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-raw-frame';

  protected getInputHarness = this.locatorFor(MatInputHarness);

  async isCollapsed(): Promise<boolean> {
    const container = await this.locatorFor('.raw-frame-container')();
    return container.hasClass('is-collapsed');
  }

  async getJsonText(): Promise<string> {
    const input = await this.getInputHarness();
    return input.getValue();
  }

  async setJsonText(value: string): Promise<void> {
    const input = await this.getInputHarness();
    return input.setValue(value);
  }

  async hasInvalidJsonBadge(): Promise<boolean> {
    const badge = await this.locatorForOptional('.invalid-json-badge')();
    return badge !== null;
  }

  async isReadOnly(): Promise<boolean> {
    const input = await this.getInputHarness();
    const host = await input.host();
    return !!(await host.getProperty<boolean>('readOnly'));
  }
}
