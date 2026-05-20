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

import {Component, inject, signal, OnDestroy} from '@angular/core';
import {
  A2uiRendererService,
  A2UI_RENDERER_CONFIG,
  BasicCatalog,
  SurfaceComponent,
  provideMarkdownRenderer,
} from '@a2ui/angular/v0_9';
import {a2uiBridge, RendererProcessor, SurfaceStateSubscription} from 'a2ui-bridge';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SurfaceComponent],
  providers: [
    A2uiRendererService,
    BasicCatalog,
    provideMarkdownRenderer(),
    {
      provide: A2UI_RENDERER_CONFIG,
      useFactory: () => {
        const basicCatalog = inject(BasicCatalog);
        return {
          catalogs: [basicCatalog],
          actionHandler: (action: unknown) => {
            a2uiBridge.sendAction(action);
          },
        };
      },
    },
  ],
  template: `
    <main class="sandbox-shell">
      @if (isInitialized()) {
        <!-- Dynamically injected surfaceId -->
        <a2ui-v09-surface [surfaceId]="surfaceId()"></a2ui-v09-surface>
      } @else {
        <p style="padding: 24px; color: #666;">
          A2UI Angular Basic Catalog Sandbox active. Waiting for RENDER_A2UI payloads...
        </p>
      }
    </main>
  `,
})
export class AppComponent implements OnDestroy {
  /** The dynamic target surface layout identifier rendered within this sandbox element. */
  protected surfaceId = signal('');
  /** The Angular reactive Signal tracking whether initial RENDER_A2UI payloads have been processed. */
  protected isInitialized = signal(false);

  /** The injected core Angular A2uiRendererService handling message state. */
  private rendererService = inject(A2uiRendererService);
  /** The active Preview Bridge connection handle managing surface data synchronization. */
  private rendererConnection: SurfaceStateSubscription | null = null;
  /** The collection of scheduled simulated diagnostic timers running in the background. */
  private diagnosticTimers: Array<ReturnType<typeof setTimeout>> = [];

  /**
   * Initializes the AppComponent sandbox. Wires global message handlers via the Bridge,
   * connects the core surface group, and schedules active simulated diagnostic log telemetry.
   */
  constructor() {
    this.rendererConnection = a2uiBridge.attachRenderer(
      this.rendererService as unknown as RendererProcessor,
      {
        surfaceGroup: this.rendererService.surfaceGroup,
        onSurfaceReady: (surfaceId: string) => {
          this.surfaceId.set(surfaceId);
          this.isInitialized.set(true);
        },
        onSurfaceCleared: () => {
          this.isInitialized.set(false);
          this.surfaceId.set('');
        },
      },
    );

    this.diagnosticTimers.push(
      setTimeout(() => {
        console.log('Basic Catalog Angular Sandbox initialized successfully.');
      }, 500),
    );
    this.diagnosticTimers.push(
      setTimeout(() => {
        console.warn('Basic Catalog warning: Simulated database synchronization latency spike.');
      }, 2000),
    );
    this.diagnosticTimers.push(
      setTimeout(() => {
        console.error(
          'Basic Catalog error: Simulated telemetry diagnostic sync crash (status: 503 Service Unavailable).',
        );
      }, 4000),
    );
  }

  /**
   * Angular lifecycle teardown hook. Cleans up the active bridge connection and
   * pre-emptively clears all background diagnostic timers to prevent test log pollution.
   */
  public ngOnDestroy(): void {
    if (this.rendererConnection) {
      this.rendererConnection.unsubscribe();
      this.rendererConnection = null;
    }
    this.diagnosticTimers.forEach(timer => clearTimeout(timer));
    this.diagnosticTimers = [];
  }
}
