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

export class RenderedFrameHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-rendered-frame';

  protected getIframeElement = this.locatorForOptional('iframe');

  async hasIframe(): Promise<boolean> {
    const iframe = await this.getIframeElement();
    return !!iframe;
  }

  async getIframeSrc(): Promise<string | null> {
    const iframe = await this.getIframeElement();
    if (!iframe) return null;
    return iframe.getAttribute('src');
  }
}
