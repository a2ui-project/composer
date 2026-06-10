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
import {ContextProvider} from '@lit/context';
import {Context} from '@a2ui/lit/v0_9';
import {MessageProcessor, Catalog, ComponentApi, SurfaceModel} from '@a2ui/web_core/v0_9';
import type {MarkdownRenderer} from '@a2ui/web_core/types/types';
import {a2uiBridge, SurfaceStateSubscription} from '../preview-bridge.js';

/**
 * Options block configuring custom element generation and static payload injection
 * for the Lit component rendering sandbox.
 */
export interface LitSandboxOptions {
  /** The custom tag name of the custom HTML elements shell (Default: 'app-root') */
  elementTagName?: string;
  /** Optional custom markdown rendering delegate callback hook */
  markdownRenderer?: MarkdownRenderer;
  /** Optional preloaded catalog JSON data, provided directly in memory. */
  catalogJson?: unknown;
}

/**
 * Event payload interface representing an incoming context-request event
 * used to intercept and resolve dynamic provider contexts.
 */
export interface ContextRequestEventPayload extends Event {
  /** Target context identifier or metadata structure */
  context?: {id?: string; __context__?: string} | string;
  /** Resolution callback function invoked with the satisfied provider value */
  callback?: (renderer: unknown) => void;
}

/**
 * Root rendering sandbox container element hosting A2UI dynamic surface layouts.
 * Integrates contextual providers, manages active surface subscriptions, and
 * delegates remote message processing.
 */
export class A2uiSandboxRoot extends LitElement {
  /** The static catalog list shared by all sandbox element instances */
  static catalogs: Catalog<ComponentApi>[] = [];
  /** Optional preloaded catalog JSON data shared statically */
  static catalogJson?: unknown = undefined;
  /** Optional custom markdown renderer callback shared statically */
  static markdownRenderer?: MarkdownRenderer = undefined;

  // Core dynamic processing engine mapping actions outbox proxies
  private processor = new MessageProcessor(A2uiSandboxRoot.catalogs, action => {
    a2uiBridge.sendAction(action);
  });

  private markdownProvider = new ContextProvider(this, {
    context: Context.markdown,
    initialValue: A2uiSandboxRoot.markdownRenderer,
  });

  get markdownRenderer(): MarkdownRenderer | undefined {
    return this.markdownProvider.value;
  }
  set markdownRenderer(value: MarkdownRenderer | undefined) {
    this.markdownProvider.setValue(value);
  }

  @state()
  private surface?: SurfaceModel;

  private rendererConnection: SurfaceStateSubscription | null = null;

  private contextRequestListener = (ev: Event) => {
    const requestEv = ev as ContextRequestEventPayload;
    const ctx = requestEv.context;
    const contextStr = String(
      (typeof ctx === 'object' && ctx !== null ? ctx.id || ctx.__context__ : ctx) || '',
    );
    if (this.markdownRenderer && contextStr.includes('A2UIMarkdown')) {
      requestEv.stopPropagation();
      requestEv.callback?.(this.markdownRenderer);
    }
  };

  connectedCallback(): void {
    super.connectedCallback();
    this.markdownRenderer =
      (this.constructor as typeof A2uiSandboxRoot).markdownRenderer ||
      A2uiSandboxRoot.markdownRenderer;
    this.addEventListener('context-request', this.contextRequestListener);

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

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('context-request', this.contextRequestListener);
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
  A2uiSandboxRoot.markdownRenderer = options?.markdownRenderer;

  if (!customElements.get(elementTagName)) {
    try {
      customElements.define(elementTagName, A2uiSandboxRoot);
    } catch (err) {
      customElements.define(elementTagName, class extends A2uiSandboxRoot {});
    }
  }

  return A2uiSandboxRoot;
}
