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

export class A2aAgentHeaderHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-agent-header';

  private getTitleElement = this.locatorFor('.agent-title');
  private getVersionElement = this.locatorForOptional('.agent-version-chip');
  private getEndpointElement = this.locatorFor('.endpoint-text');
  private getSessionElement = this.locatorForOptional('.session-chip');
  private getInspectorButton = this.locatorFor(
    MatButtonHarness.with({selector: '.inspector-toggle-btn'}),
  );
  private getSettingsButton = this.locatorFor(MatButtonHarness.with({selector: '.settings-btn'}));
  private getNewSessionButton = this.locatorFor(
    MatButtonHarness.with({selector: '.new-session-btn'}),
  );

  async getTitleText(): Promise<string> {
    const el = await this.getTitleElement();
    return el.text();
  }

  async getVersionText(): Promise<string | null> {
    const el = await this.getVersionElement();
    return el ? el.text() : null;
  }

  async getEndpointText(): Promise<string> {
    const el = await this.getEndpointElement();
    return el.text();
  }

  async getSessionText(): Promise<string | null> {
    const el = await this.getSessionElement();
    return el ? el.text() : null;
  }

  async clickInspector(): Promise<void> {
    const btn = await this.getInspectorButton();
    return btn.click();
  }

  async clickSettings(): Promise<void> {
    const btn = await this.getSettingsButton();
    return btn.click();
  }

  async clickReset(): Promise<void> {
    const btn = await this.getNewSessionButton();
    return btn.click();
  }
}
