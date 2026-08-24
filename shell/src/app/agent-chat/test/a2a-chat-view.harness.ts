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
import {AgentConfigPanelHarness} from '../agent-config-panel/test/agent-config-panel.harness';
import {A2aAgentHeaderHarness} from '../agent-header/test/agent-header.harness';
import {A2aChatHistoryHarness} from '../chat-history/test/chat-history.harness';
import {A2aInputAreaHarness} from '../input-area/test/input-area.harness';
import {A2aMessageInspectorHarness} from '../message-inspector/test/message-inspector.harness';

export class A2aChatViewHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-a2a-chat-view';

  readonly getHeader = this.locatorFor(A2aAgentHeaderHarness);
  readonly getHistory = this.locatorFor(A2aChatHistoryHarness);
  readonly getInputArea = this.locatorFor(A2aInputAreaHarness);
  readonly getInspector = this.locatorForOptional(A2aMessageInspectorHarness);
  readonly getConfigPanel = this.locatorForOptional(AgentConfigPanelHarness);
  readonly getSideCanvas = this.locatorForOptional('.side-canvas-column');

  async isInspectorOpen(): Promise<boolean> {
    const inspector = await this.getInspector();
    return inspector !== null;
  }

  async isConfigPanelOpen(): Promise<boolean> {
    const panel = await this.getConfigPanel();
    return panel !== null;
  }

  async hasSideCanvas(): Promise<boolean> {
    const canvas = await this.getSideCanvas();
    return canvas !== null;
  }
}
