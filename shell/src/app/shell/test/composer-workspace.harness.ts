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
import {ChatPanelHarness} from '../../chat/chat-panel/test/chat-panel.harness';
import {RenderedFrameHarness} from '../../preview/rendered/test/rendered-frame.harness';
import {RawFrameHarness} from '../../preview/raw/test/raw-frame.harness';
import {DataModelHarness} from '../../debug/data-model/test/data-model.harness';

/**
 * Harness for interacting with the central workspace dashboard component.
 * Exposes methods to locate and interact with the child panel harnesses.
 */
export class ComposerWorkspaceHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-workspace';

  async getChatPanelHarness(): Promise<ChatPanelHarness> {
    return this.locatorFor(ChatPanelHarness)();
  }

  async getRenderedFrameHarness(): Promise<RenderedFrameHarness> {
    return this.locatorFor(RenderedFrameHarness)();
  }

  async getRawFrameHarness(): Promise<RawFrameHarness> {
    return this.locatorFor(RawFrameHarness)();
  }

  async getDataModelHarness(): Promise<DataModelHarness> {
    return this.locatorFor(DataModelHarness)();
  }

  /**
   * Asserts whether the drawer dashboard debug panels section is collapsed.
   */
  async isDebugSectionCollapsed(): Promise<boolean> {
    const section = await this.locatorFor('.debug-section')();
    return section.hasClass('collapsed');
  }
}
