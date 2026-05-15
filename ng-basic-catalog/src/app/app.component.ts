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
import {a2uiBridge} from 'a2ui-bridge';

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
          actionHandler: (action: any) => {
            a2uiBridge.sendMessage({
              type: 'SEND_TO_SERVER',
              payload: {version: 'v0.9', action},
            });
          },
        };
      },
    },
  ],
  template: `
    <main class="sandbox-shell">
      @if (isInitialized()) {
        <a2ui-v09-surface [surfaceId]="surfaceId"></a2ui-v09-surface>
      } @else {
        <p style="padding: 24px; color: #666;">
          A2UI Angular Basic Catalog Sandbox active. Waiting for RENDER_A2UI payloads...
        </p>
      }
    </main>
  `,
})
/**
 * Core catalog provider interface hosting and exposing basic Angular-based
 * component templates to the central Composer.
 */
export class AppComponent implements OnDestroy {
  public readonly surfaceId = 'sample-surface';
  public isInitialized = signal(false);
  private rendererService = inject(A2uiRendererService);
  private renderHandler = (payload: any) => {
    if (Array.isArray(payload)) {
      this.rendererService.processMessages(payload);
      this.isInitialized.set(true);
    } else {
      console.warn('Unexpected non-array RENDER_A2UI payload received:', payload);
    }
  };

  constructor() {
    a2uiBridge.registerMessageProcessor('RENDER_A2UI', this.renderHandler);
  }

  public ngOnDestroy(): void {
    a2uiBridge.unregisterMessageProcessor('RENDER_A2UI', this.renderHandler);
  }
}
