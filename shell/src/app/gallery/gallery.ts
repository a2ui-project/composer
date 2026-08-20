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

import {TrackEventDirective} from '../usage-tracking/track-event.directive';
import {Component, computed, effect, inject, OnInit, OnDestroy} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Clipboard} from '@angular/cdk/clipboard';
import {filter} from 'rxjs/operators';
import {JsonPipe} from '@angular/common';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatCardModule} from '@angular/material/card';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {GalleryCatalog} from './services/gallery-catalog';
import {CatalogManagement} from '../storage/catalog-management/catalog-management';
import {RenderedFrame} from '../preview/rendered/rendered-frame';
import {HostCommunication} from '../shell/host-communication/host-communication';
import {formatJson} from '../utils/json';
import {PreviewBridgeMessageType, ComponentUsage, RenderA2uiItem} from 'a2ui-bridge';
import {UsageTrackingService} from '../usage-tracking/usage-tracking.service';

/**
 * Displays a split visual catalog gallery enabling search, interactive component selection,
 * schema properties introspection, live preview placeholders, and usage clipboard exports.
 */
@Component({
  selector: 'a2ui-composer-gallery',
  standalone: true,
  imports: [
    TrackEventDirective,
    JsonPipe,
    MatSidenavModule,
    MatListModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RenderedFrame,
  ],
  templateUrl: './gallery.ng.html',
  styleUrl: './gallery.scss',
})
export class Gallery implements OnInit, OnDestroy {
  private readonly catalogService = inject(GalleryCatalog);
  protected readonly catalogManagement = inject(CatalogManagement);
  private readonly hostCommunication = inject(HostCommunication);
  private readonly usageTrackingService = inject(UsageTrackingService);
  private readonly clipboard = inject(Clipboard);

  constructor() {
    this.hostCommunication.messageStream$
      .pipe(
        filter(envelope => envelope?.type === PreviewBridgeMessageType.RENDERER_READY),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.dispatchSelectedComponentPayload();
      });

    effect(() => {
      this.dispatchSelectedComponentPayload();
    });
  }

  /**
   * Constructs the A2UI layout and data model command payload.
   *
   * Note: Properties explicitly declared in `declare interface` definitions (like `RenderA2uiItem`,
   * `CreateSurfaceDetails`, `UpdateComponentsDetails`, `UpdateDataModelDetails`) are emitted in externs
   * by tsickle, so JSCompiler (Closure Compiler) preserves their names without needing bracket notation.
   */
  private buildA2UIPayload(preset: ComponentUsage, catalogId: string): RenderA2uiItem[] {
    const payload: RenderA2uiItem[] = [
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'gallery-preview',
          catalogId: catalogId,
        },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'gallery-preview',
          components: this.getComponentsPayload(preset.usage),
        },
      },
    ];

    const dataObj = preset.data;
    if (dataObj !== undefined) {
      const cmd3: RenderA2uiItem = {
        version: 'v0.9',
        updateDataModel: {
          surfaceId: 'gallery-preview',
          value: dataObj,
        },
      };
      payload.push(cmd3);
    }

    return payload;
  }

  private dispatchSelectedComponentPayload(): void {
    const preset = this.catalogService.selectedComponentPreset();
    if (!preset || !preset.usage || !Array.isArray(preset.usage)) return;

    try {
      const catalog = this.catalogManagement.activeCatalog();
      const catalogId = this.catalogId();
      if (!catalog || !catalogId) return;

      const payload = this.buildA2UIPayload(preset, catalogId);

      this.hostCommunication.sendRenderA2UI(payload);
    } catch (e) {
      console.error('Failed to parse component usage JSON:', e);
    }
  }

  ngOnInit(): void {
    this.catalogService.setGalleryActive(true);
    this.usageTrackingService.trackGalleryView();
  }

  ngOnDestroy(): void {
    this.catalogService.setGalleryActive(false);
  }

  /** Whether usage samples are currently loading from the bridge. */
  protected readonly loadingUsages = this.catalogService.loadingUsages;

  /** The alphabetized component list categorized by Layout, Content, Input, Feedback, Other. */
  protected readonly componentsList = this.catalogService.componentsList;

  /** The key of the currently selected component. */
  protected readonly selectedComponentKey = this.catalogService.selectedComponentKey;

  /** The parsed property specifications for the selected component. */
  protected readonly selectedComponentProperties = this.catalogService.selectedComponentProperties;

  /** The formatted JSON usage snippet containing the component array. */
  protected readonly selectedComponentUsage = this.catalogService.selectedComponentUsage;

  protected readonly catalogId = computed<string | null>(() => {
    const catalog = this.catalogManagement.activeCatalog();
    if (!catalog) return null;
    return catalog.catalogId || catalog.$id || null;
  });

  /** The table column names mapped by MatTable. */
  protected readonly displayedColumns: string[] = [
    'name',
    'description',
    'type',
    'required',
    'defaultValue',
  ];

  /** The resolved schema description for the selected component. */
  protected readonly selectedComponentDescription = computed<string>(() => {
    const key = this.selectedComponentKey();
    const catalog = this.catalogManagement.activeCatalog();
    const comp =
      key && catalog && catalog.components
        ? (catalog.components as Record<string, Record<string, unknown>>)[key]
        : null;
    return comp && typeof comp['description'] === 'string' ? (comp['description'] as string) : '';
  });

  /**
   * Sets the selected component key.
   *
   * @param key The component key or null to deselect.
   */
  protected selectComponent(key: string | null): void {
    this.catalogService.selectComponent(key);
  }

  private getComponentsPayload(
    componentsArray: Record<string, unknown>[],
  ): Record<string, unknown>[] {
    const catalog = this.catalogManagement.activeCatalog();
    if (!catalog) {
      return componentsArray;
    }

    const componentsObj = catalog.components;
    const componentKeys = Object.keys(componentsObj || {});
    // Support prefixed columns by checking if exactly 'column' or ends with 'column' (case-insensitive).
    // Prioritize exact match.
    let columnKey = componentKeys.find(k => k.toLowerCase() === 'column');
    if (!columnKey) {
      columnKey = componentKeys.find(k => k.toLowerCase().endsWith('column'));
    }

    if (columnKey) {
      const normalizedComponents = componentsArray.map(comp => {
        // Make sure we're not going to have a clash with the id.
        if (comp && typeof comp === 'object') {
          const obj = comp as Record<string, unknown>;
          if (obj['id'] === 'root' || obj['id'] === 'target') {
            return {...obj, id: 'target'};
          }
        }
        return comp;
      });

      return [
        {
          id: 'root',
          component: columnKey,
          // Custom/dynamic component schema properties not declared on externed interfaces
          // (such as A2uiComponentInstance) must use quoted keys to prevent Closure Compiler
          // from renaming them during optimization.
          ['align']: 'center',
          ['justify']: 'center',
          ['children']: ['target'],
        },
        ...normalizedComponents,
      ];
    }

    return componentsArray.map(comp => {
      if (comp && typeof comp === 'object') {
        const obj = comp as Record<string, unknown>;
        if (obj['id'] === 'target') {
          return {...obj, id: 'root'};
        }
      }
      return comp;
    });
  }

  /**
   * Copies formatted A2UI JSON payload commands to the user's clipboard.
   */
  protected copyToClipboard(): void {
    const preset = this.catalogService.selectedComponentPreset();
    if (!preset || !preset.usage || !Array.isArray(preset.usage)) {
      return;
    }

    try {
      const catalogId = this.catalogId();
      if (!catalogId) {
        return;
      }

      const commands = this.buildA2UIPayload(preset, catalogId);
      const payload = formatJson(commands);

      const successful = this.clipboard.copy(payload);
      if (successful) {
        this.usageTrackingService.trackGalleryCopyUsage({
          componentKey: this.selectedComponentKey() || '',
        });
      } else {
        console.error('Failed to copy A2UI component usage to clipboard.');
      }
    } catch (err) {
      console.error('Failed to parse or format A2UI usage payload: ', err);
    }
  }
}
