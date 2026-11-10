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

import {
  Injectable,
  inject,
  signal,
  OnDestroy,
  Type,
  Provider,
  EnvironmentProviders,
  makeEnvironmentProviders,
  afterNextRender,
  Injector,
  AfterRenderRef,
} from '@angular/core';
import {
  A2uiRendererService,
  A2UI_RENDERER_CONFIG,
  MarkdownRenderer,
  provideMarkdownRenderer,
} from '@a2ui/angular/v0_9';
import {
  a2uiBridge,
  ThemePreference,
  RendererProcessor,
  SurfaceStateSubscription,
  type ComponentUsages,
  type Demo,
} from '../index.js';

export interface AngularSandboxOptions {
  /** Optional custom markdown rendering delegate callback hook */
  markdownRendererFn?: (markdown: string) => Promise<string>;
  /** Optional preloaded catalog JSON data, provided directly in memory. */
  catalogJson?: unknown;
  /** Optional callback to retrieve component usage samples. */
  getComponentUsages?: () => Promise<ComponentUsages>;
  /** Optional callback when theme changes. */
  onThemeChange?: (theme: ThemePreference) => void;
  /** Optional callback to retrieve the renderer's demos. */
  getDemos?: () => Promise<Demo[]>;
  /**
   * Optional flag to mount Web Component / Custom Element implementations when available.
   * Defaults to `true` when any registered catalog uses protocolVersion 1.0 or registers
   * Web-Component-only implementations (`UniversalOnlyComponent`), and `false` otherwise.
   */
  useUniversalComponents?: boolean;
}

/**
 * Detects whether a resolved catalog requires `useUniversalComponents: true` in `@a2ui/angular`
 * (e.g., v1.0 `BasicCatalog` whose entries mount Custom Elements with `UniversalOnlyComponent` placeholders).
 */
function catalogRequiresUniversalComponents(catalog: unknown): boolean {
  if (!catalog || typeof catalog !== 'object') return false;
  const record = catalog as {
    protocolVersion?: unknown;
    components?: unknown;
  };
  if (record.protocolVersion === '1.0' || record.protocolVersion === 'v1.0') {
    return true;
  }
  if (record.components instanceof Map) {
    for (const entry of record.components.values()) {
      if (entry && typeof entry === 'object' && 'tagName' in entry) {
        const comp = (entry as {component?: {name?: string}}).component;
        if (!comp || comp.name === 'UniversalOnlyComponent') {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Orchestrates mapping surface mount/unmount lifecycles, connection handshakes,
 * and reactive state tracking between the host dashboard shell and the local
 * sandbox view elements.
 */
@Injectable()
export class A2uiSandboxConnection implements OnDestroy {
  /**
   * The active surface canvas identifier mounted by the host container. Bind
   * this value to the HTML template.
   */
  readonly surfaceId = signal('');
  /** The parsing / processing error encountered validating layouts. */
  readonly error = signal<Error | null>(null);

  /** Resolves the central rendering service provider from the injector context. */
  private readonly rendererService: A2uiRendererService = inject(A2uiRendererService);

  /** Injected dynamic renderer configuration options block. */
  private readonly rendererConfig: {catalogs: unknown[]} = inject(A2UI_RENDERER_CONFIG);

  /** The dynamic teardown handle for the active framework renderer connection subscription. */
  private rendererConnection: SurfaceStateSubscription | null = null;
  private readonly injector = inject(Injector);
  private readonly markdownRenderer = inject(MarkdownRenderer, {optional: true});
  private pendingContentRender?: AfterRenderRef;
  private pendingContentResolve?: () => void;
  private contentRenderGeneration = 0;
  private destroyed = false;

  /**
   * Resolves once the markdown renderer can render. The default one loads markdown-it
   * lazily, and body text renders empty until it has; on a slow machine that takes
   * longer than the bridge waits for the content to stop changing, so content would
   * be reported ready without its text. Failing to load is the renderer's concern.
   */
  private async markdownLoaded(): Promise<void> {
    try {
      await this.markdownRenderer?.render('');
    } catch {
      // Text falls back to its raw markdown; there is nothing more to wait for.
    }
  }

  private cancelPendingContentRender(): void {
    ++this.contentRenderGeneration;
    const ref = this.pendingContentRender;
    const resolve = this.pendingContentResolve;
    this.pendingContentRender = undefined;
    this.pendingContentResolve = undefined;
    ref?.destroy();
    resolve?.();
  }

  private waitForNextRender(): Promise<void> {
    return new Promise<void>(resolve => {
      if (this.destroyed) {
        resolve();
        return;
      }
      this.pendingContentResolve = resolve;
      const ref = afterNextRender(
        () => {
          if (this.pendingContentRender === ref) {
            this.pendingContentRender = undefined;
            this.pendingContentResolve = undefined;
          }
          resolve();
        },
        {injector: this.injector},
      );
      this.pendingContentRender = ref;
    });
  }

  /**
   * Initializes a new instance of the sandbox connection, automatically establishing
   * the message transport pipeline.
   *
   * Subscribes to the global preview bridge singleton, mapping dynamic renderer callbacks
   * (onSurfaceReady and onSurfaceCleared) directly to local reactive state signals.
   *
   * @param options The sandbox options from `provideA2uiSandbox`: the preloaded catalog
   *     and the callbacks for component usages, theme changes, and demos.
   */
  constructor(options: AngularSandboxOptions = {}) {
    const processor: RendererProcessor = {
      processMessages: payload =>
        (this.rendererService as unknown as RendererProcessor).processMessages(payload),
      callAgentFunction: (surfaceId, call, opts) => {
        const service = this.rendererService as unknown as {
          callAgentFunction?: (
            surfaceId: string,
            call: Record<string, unknown>,
            opts?: {functionCallId?: string},
          ) => Promise<unknown>;
        };
        if (typeof service.callAgentFunction === 'function') {
          return service.callAgentFunction(surfaceId, call, opts);
        }
        return Promise.reject(
          new Error('callAgentFunction is not supported by this rendererService'),
        );
      },
    };
    this.rendererConnection = a2uiBridge.attachRenderer(processor, {
      surfaceGroup: this.rendererService.surfaceGroup,
      catalogs: this.rendererConfig?.catalogs,
      onCatalogResolved: (catalogId: string) => {
        a2uiBridge.aliasSingleCatalogId(catalogId, this.rendererConfig?.catalogs);
      },
      onSurfaceReady: (surfaceId: string) => {
        this.surfaceId.set(surfaceId);
      },
      onInitialRender: async () => {
        this.cancelPendingContentRender();
        const generation = this.contentRenderGeneration;
        await this.markdownLoaded();
        if (this.destroyed || generation !== this.contentRenderGeneration) return;
        await this.waitForNextRender();
        if (this.destroyed || generation !== this.contentRenderGeneration) return;
        await this.markdownLoaded();
        if (this.destroyed || generation !== this.contentRenderGeneration) return;
        await this.waitForNextRender();
      },
      onSurfaceCleared: () => {
        this.surfaceId.set('');
      },
      onError: (err: Error | null) => {
        this.error.set(err);
      },
      catalogJson: options.catalogJson,
      getComponentUsages: options.getComponentUsages,
      onThemeChange: options.onThemeChange,
      getDemos: options.getDemos,
    });
  }

  /**
   * Performs cleanups during sandbox destruction.
   * Disposes active bridge connections and releases event listener subscriptions
   * to prevent memory leaks and observer bloat in high-frequency test runs.
   */
  ngOnDestroy(): void {
    this.destroyed = true;
    this.cancelPendingContentRender();
    this.rendererConnection?.unsubscribe();
    this.rendererConnection = null;
  }
}

/**
 * Provides a unified array of Angular dependency injection providers configured for the A2UI sandbox.
 *
 * Exposes a standardized registration block that includes catalog component classes or instances,
 * the central rendering service, and the sandbox connection state to keep catalog bootstrap clean and modular.
 *
 * @param catalogs The array of catalog component provider classes (e.g. BasicCatalog) or instances to register and manage.
 * @param options Optional configuration adapter block holding `catalogJson` (preloaded catalog JSON),
 *   `markdownRendererFn` (custom markdown rendering delegate), `getComponentUsages` (component usage
 *   sample retrieval callback), `onThemeChange` (theme preference change callback), and `getDemos`
 *   (renderer demos retrieval callback) hook delegates.
 * @return Angular EnvironmentProviders ready for modern standalone bootstrapping application scopes.
 */
export function provideA2uiSandbox(
  catalogs: Array<Type<unknown> | unknown>,
  options?: AngularSandboxOptions,
): EnvironmentProviders {
  const classProviders = catalogs.filter(
    (c): c is Type<unknown> => typeof c === 'function',
  ) as Provider[];

  const providers: Provider[] = [
    A2uiRendererService,
    {
      provide: A2uiSandboxConnection,
      useFactory: () => new A2uiSandboxConnection(options),
    },
    ...classProviders,
    provideMarkdownRenderer(options?.markdownRendererFn),
    {
      provide: A2UI_RENDERER_CONFIG,
      useFactory: () => {
        const resolvedCatalogs = (catalogs ?? []).map(entry =>
          typeof entry === 'function' ? inject(entry as Type<unknown>) : entry,
        );
        const useUniversalComponents =
          options?.useUniversalComponents ??
          resolvedCatalogs.some(catalogRequiresUniversalComponents);
        return {
          catalogs: resolvedCatalogs,
          ...(useUniversalComponents ? {useUniversalComponents: true} : {}),
          actionHandler: (action: unknown) => {
            a2uiBridge.sendAction(action);
          },
          processorOptions: {
            outboundListener: (msg: unknown) => {
              a2uiBridge.sendOutboundMessage(msg);
            },
          },
        };
      },
    },
  ];
  return makeEnvironmentProviders(providers);
}
