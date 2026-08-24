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
import {A2aChatMessageHarness} from '../../chat-message/test/chat-message.harness';

export class A2aChatHistoryHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-chat-history';

  private getMessages = this.locatorForAll(A2aChatMessageHarness);
  private getWelcomeTitle = this.locatorForOptional('.welcome-title');
  private getConnectingTitle = this.locatorForOptional('.connecting-title');
  private getPromptChips = this.locatorForAll('.prompt-chip');
  private getCapabilityChips = this.locatorForAll('.cap-chip');

  async getMessageCount(): Promise<number> {
    const msgs = await this.getMessages();
    return msgs.length;
  }

  async hasWelcomeShowcase(): Promise<boolean> {
    const title = await this.getWelcomeTitle();
    return title !== null;
  }

  async getShowcaseTitleText(): Promise<string | null> {
    const title = await this.getWelcomeTitle();
    return title ? title.text() : null;
  }

  async isConnecting(): Promise<boolean> {
    const title = await this.getConnectingTitle();
    return title !== null;
  }

  async getPromptChipCount(): Promise<number> {
    const chips = await this.getPromptChips();
    return chips.length;
  }

  async clickPromptChip(index: number): Promise<void> {
    const chips = await this.getPromptChips();
    if (chips[index]) {
      return chips[index].click();
    }
  }

  async getCapabilityCount(): Promise<number> {
    const chips = await this.getCapabilityChips();
    return chips.length;
  }
}
