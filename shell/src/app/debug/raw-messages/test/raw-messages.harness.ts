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

export class RawMessagesHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-raw-messages';

  async getLoggedMessagesCount(): Promise<number> {
    const list = await this.locatorForAll('[data-testid="raw-message-envelope"]')();
    return list.length;
  }

  async getMessageTextAt(index: number): Promise<string> {
    const list = await this.locatorForAll('[data-testid="raw-message-envelope"]')();
    if (index < 0 || index >= list.length) {
      throw new Error(`Index ${index} out of bounds for raw messages list!`);
    }
    return list[index].text();
  }

  async getMessageTimestampAt(index: number): Promise<string> {
    const list = await this.locatorForAll(
      '[data-testid="raw-message-envelope"] .envelope-header .timestamp',
    )();
    if (index < 0 || index >= list.length) {
      throw new Error(`Index ${index} out of bounds for raw messages list!`);
    }
    return list[index].text();
  }

  async hasPlaceholder(): Promise<boolean> {
    const placeholder = await this.locatorForOptional('.raw-messages-placeholder')();
    return placeholder !== null;
  }
}
