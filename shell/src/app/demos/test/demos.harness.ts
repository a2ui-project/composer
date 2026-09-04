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
 * Harness for interacting with the Demos route component in unit tests.
 */
export class DemosHarness extends ComponentHarness {
  /** The CSS selector used to locate the host element. */
  static hostSelector = 'a2ui-composer-demos';

  private readonly getCoordinatorWrapper = this.locatorForOptional('.coordinator-frame');
  private readonly getCoordinatorFrame = this.locatorForOptional(
    '.coordinator-frame a2ui-composer-rendered-frame',
  );
  private readonly getCards = this.locatorForAll('a2ui-composer-demo-card');
  private readonly getEmptySubtitle = this.locatorForOptional('.empty-subtitle');
  private readonly getLoading = this.locatorForOptional('.demos-loading');
  private readonly getMountedFrames = this.locatorForAll(
    'a2ui-composer-demo-card iframe.demo-card-frame',
  );

  /**
   * Checks whether the hidden coordinator frame is mounted inside its wrapper.
   */
  async hasCoordinatorFrame(): Promise<boolean> {
    const wrapper = await this.getCoordinatorWrapper();
    const frame = await this.getCoordinatorFrame();
    return !!wrapper && !!frame;
  }

  /**
   * Returns the number of demo cards currently rendered in the wall.
   */
  async getCardCount(): Promise<number> {
    const cards = await this.getCards();
    return cards.length;
  }

  /**
   * Returns the number of demo cards that currently hold a live renderer frame.
   */
  async getMountedCardCount(): Promise<number> {
    const frames = await this.getMountedFrames();
    return frames.length;
  }

  /**
   * Retrieves the empty state description text if visible.
   */
  async getEmptyStateSubtitleText(): Promise<string | null> {
    const subtitle = await this.getEmptySubtitle();
    return subtitle ? subtitle.text() : null;
  }

  /**
   * Checks whether the demos loading indicator is visible.
   */
  async isLoading(): Promise<boolean> {
    const loading = await this.getLoading();
    return !!loading;
  }
}
