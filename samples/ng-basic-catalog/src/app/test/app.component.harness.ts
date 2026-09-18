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

/**
 * Test harness for testing the `AppComponent` sandbox component.
 */
export class AppComponentHarness extends ComponentHarness {
  static hostSelector = 'app-root';

  private getErrorOverlayEl = this.locatorForOptional('.error-overlay');
  private getErrorOverlayPre = this.locatorForOptional('.error-overlay pre');
  private getWaitingPlaceholderEl = this.locatorForOptional('.sandbox-shell p');
  private getSurfaceEl = this.locatorForOptional('a2ui-v09-surface');

  async hasErrorOverlay(): Promise<boolean> {
    const el = await this.getErrorOverlayEl();
    return el !== null;
  }

  async getErrorText(): Promise<string | null> {
    const pre = await this.getErrorOverlayPre();
    return pre ? pre.text() : null;
  }

  async hasWaitingPlaceholder(): Promise<boolean> {
    const el = await this.getWaitingPlaceholderEl();
    return el !== null;
  }

  async hasSurface(): Promise<boolean> {
    const el = await this.getSurfaceEl();
    return el !== null;
  }
}
