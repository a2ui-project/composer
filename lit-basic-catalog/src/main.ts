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
import {MessageProcessor, SurfaceModel, Catalog, ComponentApi} from '@a2ui/web_core/v0_9';
import {basicCatalog} from '@a2ui/lit/v0_9';
import {a2uiBridge, SurfaceStateSubscription} from 'a2ui-bridge';

/**
 * Core catalog provider interface hosting and exposing Lit-based
 * component templates to the central Composer.
 */
@customElement('app-root')
export class AppRoot extends LitElement {
  /** The core basic catalog message processor consuming postMessage instructions. */
  private processor = new MessageProcessor(
    [basicCatalog as unknown as Catalog<ComponentApi>],
    action => {
      a2uiBridge.sendAction(action);
    },
  );

  /** The active reactive Surface Model mapped for template rendering. */
  @state()
  private surface: SurfaceModel<ComponentApi> | undefined;

  /** The active Preview Bridge connection handle managing surface data synchronization. */
  private rendererConnection: SurfaceStateSubscription | null = null;

  /**
   * Custom element lifecycle hook called when the catalog sandbox is attached to the DOM.
   * Wires the global Preview Bridge connection and dynamically resolves surface IDs.
   */
  public connectedCallback(): void {
    super.connectedCallback();

    this.rendererConnection?.unsubscribe();
    this.rendererConnection = a2uiBridge.attachRenderer(this.processor, {
      surfaceGroup: this.processor.model,
      onSurfaceReady: (surfaceId: string) => {
        this.surface = this.processor.model.getSurface(surfaceId);
        this.requestUpdate();
      },
      onSurfaceCleared: () => {
        this.surface = undefined;
      },
    });
  }

  /**
   * Custom element lifecycle hook called when the catalog sandbox is detached from the DOM.
   * Cleans up the bridge connection to prevent leaks.
   */
  public disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.rendererConnection) {
      this.rendererConnection.unsubscribe();
      this.rendererConnection = null;
    }
  }

  /** Renders the reactive sandbox catalog layout template or loading active state indicators. */
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
