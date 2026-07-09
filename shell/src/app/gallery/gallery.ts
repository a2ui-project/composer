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
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
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

/**
 * Displays a split visual catalog gallery enabling search, interactive component selection,
 * schema properties introspection, live preview placeholders, and usage clipboard exports.
 */
@Component({
  selector: 'a2ui-composer-gallery',
  standalone: true,
  imports: [
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Gallery implements OnInit, OnDestroy {
  private readonly catalogService = inject(GalleryCatalog);
  protected readonly catalogManagement = inject(CatalogManagement);
  private readonly hostCommunication = inject(HostCommunication);

  constructor() {
    effect(() => {
      const preset = this.catalogService.selectedComponentPreset();
      if (!preset || !preset.usage || !Array.isArray(preset.usage)) return;

      try {
        const componentsArray = preset.usage;
        const dataObj = preset.data;

        const catalog = this.catalogManagement.activeCatalog();
        const catalogId = this.catalogId();
        if (!catalog || !catalogId) return;

        const componentsPayload = this.getComponentsPayload(componentsArray);

        const cmd1 = {
          version: 'v0.9',
          createSurface: {
            surfaceId: 'gallery-preview',
            catalogId: catalogId,
          },
        };

        const cmd2 = {
          version: 'v0.9',
          updateComponents: {
            surfaceId: 'gallery-preview',
            components: componentsPayload,
          },
        };

        const payload: unknown[] = [cmd1, cmd2];

        if (dataObj !== undefined) {
          const cmd3 = {
            version: 'v0.9',
            updateDataModel: {
              surfaceId: 'gallery-preview',
              value: dataObj,
            },
          };
          payload.push(cmd3);
        }

        this.hostCommunication.sendRenderA2UI(payload);
      } catch (e) {
        console.error('Failed to parse component usage JSON:', e);
      }
    });
  }

  ngOnInit(): void {
    this.catalogService.setGalleryActive(true);
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
    return (catalog.catalogId || catalog.$id) ?? null;
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
    const comp = key ? catalog?.components?.[key] : null;
    return comp && typeof comp['description'] === 'string' ? comp['description'] : '';
  });

  /**
   * Sets the selected component key.
   *
   * @param key The component key or null to deselect.
   */
  protected selectComponent(key: string | null): void {
    this.catalogService.selectComponent(key);
  }

  private getComponentsPayload(componentsArray: unknown[]): unknown[] {
    const catalog = this.catalogManagement.activeCatalog();
    if (!catalog) {
      return componentsArray;
    }

    const componentKeys = Object.keys(catalog.components || {});
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
          align: 'center',
          justify: 'center',
          children: ['target'],
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
   * Copies the usage JSON payload to the system clipboard.
   */
  protected copyToClipboard(): void {
    const preset = this.catalogService.selectedComponentPreset();
    if (!preset || !preset.usage || !Array.isArray(preset.usage)) {
      return;
    }

    try {
      const components = preset.usage;
      const dataObj = preset.data;

      const catalogId = this.catalogId();
      if (!catalogId) {
        return;
      }

      const createSurfaceCmd = {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'gallery-preview',
          catalogId,
        },
      };

      const componentsPayload = this.getComponentsPayload(components as unknown[]);

      const updateComponentsCmd = {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'gallery-preview',
          components: componentsPayload,
        },
      };

      const commands: unknown[] = [createSurfaceCmd, updateComponentsCmd];

      if (dataObj !== undefined) {
        commands.push({
          version: 'v0.9',
          updateDataModel: {
            surfaceId: 'gallery-preview',
            value: dataObj,
          },
        });
      }

      const payload = formatJson(commands);

      if (!navigator.clipboard) {
        console.error('Clipboard API is not available in this environment.');
        return;
      }

      navigator.clipboard.writeText(payload).catch(err => {
        console.error('Failed to copy A2UI component usage to clipboard: ', err);
      });
    } catch (err) {
      console.error('Failed to parse or format A2UI usage payload: ', err);
    }
  }
}
