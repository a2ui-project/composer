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

import {ChangeDetectionStrategy, Component, computed, effect, inject} from '@angular/core';
import {JsonPipe} from '@angular/common';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatCardModule} from '@angular/material/card';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {GalleryCatalog} from './services/gallery-catalog';
import {CatalogManagement} from '../storage/catalog-management/catalog-management';
import {RenderedFrame} from '../preview/rendered/rendered-frame';
import {HostCommunication} from '../shell/host-communication/host-communication';

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
    RenderedFrame,
  ],
  templateUrl: './gallery.ng.html',
  styleUrl: './gallery.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Gallery {
  private readonly catalogService = inject(GalleryCatalog);
  protected readonly catalogManagement = inject(CatalogManagement);
  private readonly hostCommunication = inject(HostCommunication);

  private static readonly A2UI_v09 = 'v0.9';
  private static readonly DEMO_SURFACE_ID = 'gallery-preview';

  constructor() {
    effect(() => {
      const usageString = this.selectedComponentUsage();
      if (!usageString) return;

      try {
        const parsed = JSON.parse(usageString) as unknown;
        if (!Array.isArray(parsed)) return;

        const componentsArray = parsed as unknown[];
        const catalog = this.catalogManagement.activeCatalog();
        const catalogId = this.catalogId();
        if (!catalog || !catalogId) return;

        // To visually anchor and center the selected component within the sandboxed preview frame,
        // we wrap it in a 'Column' container. This prevents individual components (like buttons)
        // from stretching to fill the entire screen, ensuring a more realistic preview.
        // We perform a case-insensitive lookup (e.g., matching 'Column' or 'column') to support
        // different naming conventions that different catalogs might use. If no such column layout
        // component is found in the catalog, we fall back to rendering the target component directly
        // as the root.
        const componentKeys = Object.keys(catalog['components'] || {});
        const columnKey = componentKeys.find(k => k.toLowerCase() === 'column');

        let componentsPayload: unknown[];
        if (columnKey) {
          componentsPayload = [
            {id: 'root', component: columnKey, children: ['target']},
            ...componentsArray,
          ];
        } else {
          componentsPayload = componentsArray;
        }

        /* prettier-ignore */
        const cmd1 = {
          'version': Gallery.A2UI_v09,
          'createSurface': {
            'surfaceId': Gallery.DEMO_SURFACE_ID,
            'catalogId': catalogId,
          },
        };

        /* prettier-ignore */
        const cmd2 = {
          'version': Gallery.A2UI_v09,
          'updateComponents': {
            'surfaceId': Gallery.DEMO_SURFACE_ID,
            'components': componentsPayload,
          },
        };

        const payload = [cmd1, cmd2];
        this.hostCommunication.sendRenderA2UI(payload);
      } catch (e) {
        console.error('Failed to parse component usage JSON:', e);
      }
    });
  }

  /** The alphabetized component list categorized by Layout, Content, Input, Feedback, Other. */
  protected readonly componentsList = this.catalogService.componentsList;

  /** The key of the currently selected component. */
  protected readonly selectedComponentKey = this.catalogService.selectedComponentKey;

  /** The parsed property specifications for the selected component. */
  protected readonly selectedComponentProperties = this.catalogService.selectedComponentProperties;

  /** The formatted JSON usage snippet wrapped in the A2UI spec envelope. */
  protected readonly selectedComponentUsage = this.catalogService.selectedComponentUsage;

  protected readonly catalogId = computed<string | null>(() => {
    const catalog = this.catalogManagement.activeCatalog();
    if (!catalog) return null;
    return (catalog['catalogId'] || catalog['$id']) ?? null;
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
    if (!key) return '';
    const catalog = this.catalogManagement.activeCatalog();
    const comp = catalog?.['components']?.[key];
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

  /**
   * Copies the usage JSON payload to the system clipboard.
   */
  protected copyToClipboard(): void {
    const usage = this.selectedComponentUsage();
    if (!usage) {
      return;
    }

    try {
      const components = JSON.parse(usage);
      if (!Array.isArray(components)) {
        throw new Error('Component usage is not an array');
      }

      const catalogId = this.catalogId();
      if (!catalogId) {
        return;
      }

      /* prettier-ignore */
      const createSurfaceLine = JSON.stringify({
        'version': 'v0.9',
        'createSurface': {
          'surfaceId': 'gallery-preview',
          'catalogId': catalogId,
        },
      });

      /* prettier-ignore */
      const updateComponentsLine = JSON.stringify({
        'version': 'v0.9',
        'updateComponents': {
          'surfaceId': 'gallery-preview',
          'components': components,
        },
      });

      const payload = `${createSurfaceLine}\n${updateComponentsLine}`;

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
