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
import {MatSidenavHarness} from '@angular/material/sidenav/testing';

export class ComposerShellHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-shell';

  private getHeaderTitle = this.locatorFor('.composer-header > span');
  private getThemeToggleButton = this.locatorFor('button[aria-label*="theme"]');
  private getHamburgerButton = this.locatorFor('button.hamburger-button');
  private getSidenav = this.locatorFor(MatSidenavHarness);
  private getResetButton = this.locatorFor('button.reset-session-button');

  async getHeaderTitleText(): Promise<string> {
    const title = await this.getHeaderTitle();
    return title.text();
  }

  async clickResetButton(): Promise<void> {
    const button = await this.getResetButton();
    await button.click();
  }

  async clickThemeToggleButton(): Promise<void> {
    const button = await this.getThemeToggleButton();
    await button.click();
  }

  async clickHamburgerButton(): Promise<void> {
    const button = await this.getHamburgerButton();
    await button.click();
  }

  async isSidenavOpened(): Promise<boolean> {
    const sidenav = await this.getSidenav();
    return sidenav.isOpen();
  }
}
