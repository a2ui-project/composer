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
import {state} from 'lit/decorators.js';
import {MessageProcessor, Catalog, ComponentApi, SurfaceModel} from '@a2ui/web_core/v0_9';
import {a2uiBridge, SurfaceStateSubscription} from '../preview-bridge.js';

// Expose on the module scope for pristine, absolute compiler typings resolutions:
export interface LitSandboxOptions {
  /** The custom tag name of the custom HTML elements shell (Default: 'app-root') */
  elementTagName?: string;
  /** Optional preloaded catalog JSON data, provided directly in memory. */
  catalogJson?: unknown;
}

export class A2uiSandboxRoot extends LitElement {
  /** The static catalog list shared by all sandbox element instances */
  static catalogs: Catalog<ComponentApi>[] = [];
  /** Optional preloaded catalog JSON data shared statically */
  static catalogJson?: unknown = undefined;

  // Core dynamic processing engine mapping actions outbox proxies
  private processor = new MessageProcessor(A2uiSandboxRoot.catalogs, action => {
    a2uiBridge.sendAction(action);
  });

  @state()
  private surface?: SurfaceModel;

  private rendererConnection: SurfaceStateSubscription | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.rendererConnection?.unsubscribe();
    this.rendererConnection = a2uiBridge.attachRenderer(this.processor, {
      surfaceGroup: this.processor.model,
      catalogJson: A2uiSandboxRoot.catalogJson,
      onCatalogResolved: catalogId => {
        for (const catalog of A2uiSandboxRoot.catalogs) {
          if (catalog) {
            (catalog as {id: string}).id = catalogId;
          }
        }
      },
      onSurfaceReady: surfaceId => {
        this.surface = this.processor.model.getSurface(surfaceId);
        this.requestUpdate();
      },
      onSurfaceCleared: () => {
        this.surface = undefined;
        this.requestUpdate();
      },
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.rendererConnection) {
      this.rendererConnection.unsubscribe();
      this.rendererConnection = null;
    }
  }

  render(): TemplateResult {
    if (!this.surface) {
      return html`
        <p style="color: #666; padding: 24px; font-family: sans-serif; text-align: center;">
          A2UI Lit Sandbox active. Waiting for RENDER_A2UI...
        </p>
      `;
    }
    return html`<main><a2ui-surface .surface=${this.surface}></a2ui-surface></main>`;
  }
}

/**
 * Dynamic entry point that bootstraps the Lit Component Rendering Sandbox.
 * Registers element mappings inside browser-level CustomElement registries, binds
 * configuration schemas, and injects optional preloaded static catalog payloads.
 *
 * @param catalogs The array of component catalogs defining local layouts.
 * @param options Optional configuration options block holding the HTML tag name and preloaded catalog JSON data.
 * @returns The A2uiSandboxRoot custom element constructor value ready for nominal references.
 */
export function bootstrapLitSandbox<T extends ComponentApi>(
  catalogs: Catalog<T>[],
  options?: LitSandboxOptions,
): typeof A2uiSandboxRoot {
  const elementTagName = options?.elementTagName || 'app-root';

  // Sets dynamic, catalog-specific shared variables with standard safe base casting
  A2uiSandboxRoot.catalogs = catalogs as Catalog<ComponentApi>[];
  A2uiSandboxRoot.catalogJson = options?.catalogJson;

  if (!customElements.get(elementTagName)) {
    customElements.define(elementTagName, A2uiSandboxRoot);
  }

  return A2uiSandboxRoot;
}
