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

import {LitElement, html, TemplateResult} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {MessageProcessor, SurfaceModel} from '@a2ui/web_core/v0_9';
import {basicCatalog} from '@a2ui/lit/v0_9';
import {a2uiBridge} from 'a2ui-bridge';

/**
 * Core catalog provider interface hosting and exposing Lit-based
 * component templates to the central Composer.
 */
@customElement('app-root')
export class AppRoot extends LitElement {
  /**
   * Constructs the message processor consuming official basic catalog renderers.
   * Note: Casting basicCatalog as any is structurally required to suppress static compiler private
   * property mapping validations across nested monorepo dependency checkouts, allowing Vite runtime
   * compilation to execute securely against deduplicated package graphs.
   */
  private processor = new MessageProcessor([basicCatalog as any], actionPayload => {
    a2uiBridge.sendMessage({type: 'SEND_TO_SERVER', payload: actionPayload});
  });

  @state()
  private surface: SurfaceModel<any> | undefined;

  private renderHandler = (payload: any) => {
    if (Array.isArray(payload)) {
      this.processor.processMessages(payload);
      this.surface = this.processor.model.getSurface('sample-surface');
    } else {
      console.warn('Unexpected non-array RENDER_A2UI payload received:', payload);
    }
  };

  constructor() {
    super();
  }

  public connectedCallback(): void {
    super.connectedCallback();
    a2uiBridge.registerMessageProcessor('RENDER_A2UI', this.renderHandler);
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    a2uiBridge.unregisterMessageProcessor('RENDER_A2UI', this.renderHandler);
  }

  protected render(): TemplateResult {
    if (!this.surface) {
      return html`<p style="color: #666;">
        A2UI Lit Basic Catalog Sandbox active. Waiting for RENDER_A2UI payloads...
      </p>`;
    }
    return html`
      <main>
        <a2ui-surface .surface=${this.surface}></a2ui-surface>
      </main>
    `;
  }
}
