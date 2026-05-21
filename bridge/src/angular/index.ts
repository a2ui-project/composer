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

import {Injectable, inject, signal, OnDestroy, Type, Provider} from '@angular/core';
import {
  A2uiRendererService,
  A2UI_RENDERER_CONFIG,
  provideMarkdownRenderer,
} from '@a2ui/angular/v0_9';
import {a2uiBridge, RendererProcessor, SurfaceStateSubscription} from '../preview-bridge.js';

/**
 * Orchestrates mapping surface mount/unmount lifecycles, connection handshakes,
 * and reactive state tracking between the host dashboard shell and the local
 * sandbox view elements.
 */
@Injectable()
export class A2uiSandboxManager implements OnDestroy {
  /**
   * The active surface canvas identifier mounted by the host container. Bind
   * this value the HTML template.
   */
  readonly surfaceId = signal('');

  /**
   * Maps the current sandbox initialization state. Resolves to `true` when a
   * valid surface ready payload is received and attached.
   */
  readonly isInitialized = signal(false);

  /** Resolves the central catalog service manager provider from the injector context. */
  private rendererService = inject(A2uiRendererService);

  /** The dynamic teardown handle for active telemetry stream observers and listeners. */
  private rendererConnection: SurfaceStateSubscription | null = null;

  /**
   * Initializes a new instance of the sandbox manager, automatically establishing
   * the message transport pipeline.
   *
   * Subscribes to the global preview bridge singleton, mapping dynamic renderer callbacks
   * (onSurfaceReady and onSurfaceCleared) directly to local reactive state signals.
   */
  constructor() {
    this.rendererConnection = a2uiBridge.attachRenderer(
      this.rendererService as unknown as RendererProcessor,
      {
        surfaceGroup: this.rendererService.surfaceGroup,
        onSurfaceReady: surfaceId => {
          this.surfaceId.set(surfaceId);
          this.isInitialized.set(true);
        },
        onSurfaceCleared: () => {
          this.isInitialized.set(false);
          this.surfaceId.set('');
        },
      },
    );
  }

  /**
   * Performs cleanups during sandbox destruction.
   * Disposes active bridge connections and releases event listener subscriptions
   * to prevent memory leaks and observer bloat in high-frequency test runs.
   */
  ngOnDestroy() {
    if (this.rendererConnection) {
      this.rendererConnection.unsubscribe();
      this.rendererConnection = null;
    }
  }
}

/**
 * Dynamic Angular dependency injection provider configuration mapping helper.
 *
 * Exposes a standardized provider registration block targeting the catalog, central rendering,
 * and sandbox service providers to keep catalog bootstraps highly clean and modular.
 *
 * @param catalogsClasses The array of catalog component provider classes (e.g. BasicCatalog) to register and manage.
 * @param markdownRendererFn Optional. A custom async rendering function mapping catalog Markdown formatting.
 * @returns A fully configured array of Angular Dependency Injection providers ready for bootstrapApplication.
 */
export function provideA2uiSandbox(
  catalogsClasses: Type<unknown>[],
  markdownRendererFn?: (markdown: string) => Promise<string>,
): Provider[] {
  return [
    A2uiRendererService,
    {
      provide: A2uiSandboxManager,
      useFactory: () => new A2uiSandboxManager(),
    },
    ...catalogsClasses,
    provideMarkdownRenderer(markdownRendererFn),
    {
      provide: A2UI_RENDERER_CONFIG,
      useFactory: () => {
        const resolvedCatalogs = catalogsClasses.map(cls => inject(cls));
        return {
          catalogs: resolvedCatalogs,
          actionHandler: (action: unknown) => {
            a2uiBridge.sendAction(action);
          },
        };
      },
    },
  ];
}
