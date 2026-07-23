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

import {Injectable, inject, signal, computed, effect, DestroyRef, untracked} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {CatalogSchemaResolver, ParsedProperty} from '../schema/catalog-schema-resolver';
import {HostCommunication} from '../../shell/host-communication/host-communication';
import {UsageGenerator} from './usage-generator';
import {PreviewBridgeMessageType, type ComponentUsage, type ComponentUsages} from 'a2ui-bridge';
import {formatJson} from '../../utils/json';

/**
 * Represents components grouped under a specific category name.
 */
export interface CategorizedComponents {
  /** The visual/functional category of the components. */
  category: string;
  /** Sorted list of component keys belonging to this category. */
  components: string[];
}

interface CategoryRule {
  category: string;
  keywords: string[];
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: 'Input',
    keywords: [
      'button',
      'btn',
      'input',
      'field',
      'check',
      'select',
      'pick',
      'slide',
      'date',
      'time',
      'switch',
      'toggle',
      'form',
      'search',
      'upload',
      'radio',
      'area',
    ],
  },
  {
    category: 'Feedback',
    keywords: [
      'progress',
      'spinner',
      'alert',
      'snackbar',
      'banner',
      'toast',
      'message',
      'loading',
      'loader',
    ],
  },
  {
    category: 'Layout',
    keywords: [
      'row',
      'column',
      'grid',
      'list',
      'card',
      'tab',
      'modal',
      'drawer',
      'sheet',
      'panel',
      'surface',
      'box',
      'flex',
      'container',
      'accordion',
      'expansion',
      'sidenav',
      'nav',
    ],
  },
  {
    category: 'Content',
    keywords: [
      'text',
      'image',
      'img',
      'icon',
      'video',
      'audio',
      'divider',
      'separator',
      'avatar',
      'chip',
      'badge',
      'link',
      'label',
      'header',
      'footer',
      'title',
      'paragraph',
      'heading',
    ],
  },
];

const CATEGORIES_ORDER = ['Layout', 'Content', 'Input', 'Feedback', 'Other'];

/**
 * Resolves the visual category for a component using rule-based keyword mapping.
 *
 * @param key The component key.
 * @returns The category string (e.g. 'Layout', 'Content', 'Input', 'Feedback', 'Other').
 */
function getCategoryForComponent(key: string): string {
  const lowerKey = key.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    for (const keyword of rule.keywords) {
      if (lowerKey.includes(keyword)) {
        return rule.category;
      }
    }
  }
  return 'Other';
}

/**
 * Coordinates visual gallery state including component categories, selections,
 * schema property resolutions, visual presets, and usage snippet generations.
 */
@Injectable({
  providedIn: 'root',
})
export class GalleryCatalog {
  private readonly catalogManagement = inject(CatalogManagement);
  private readonly hostCommunication = inject(HostCommunication);
  private readonly usageGenerator = inject(UsageGenerator);
  private readonly destroyRef = inject(DestroyRef);

  /**
   * Resolves schema for the active catalog.
   */
  readonly catalogSchemaResolver = computed(() => {
    const catalog = this.catalogManagement.activeCatalog();
    return catalog ? new CatalogSchemaResolver(catalog) : null;
  });

  private readonly _selectedComponentKey = signal<string | null>(null);
  /** The actively selected component key. */
  readonly selectedComponentKey = this._selectedComponentKey.asReadonly();

  /** Signals for caching and loading states */
  private readonly _cachedUsages = signal<ComponentUsages | null>(null);
  readonly cachedUsages = this._cachedUsages.asReadonly();

  private readonly _loadingUsages = signal<boolean>(false);
  readonly loadingUsages = this._loadingUsages.asReadonly();

  private readonly _galleryActive = signal<boolean>(false);
  readonly galleryActive = this._galleryActive.asReadonly();

  private usageTimeoutId?: ReturnType<typeof setTimeout>;

  /**
   * Sorts and groups all components in the active catalog into categories.
   */
  readonly componentsList = computed<CategorizedComponents[]>(() => {
    const catalog = this.catalogManagement.activeCatalog();
    if (catalog == null || catalog['components'] == null) {
      return [];
    }

    const grouped: Record<string, string[]> = {
      Layout: [],
      Content: [],
      Input: [],
      Feedback: [],
      Other: [],
    };

    for (const key of Object.keys(catalog['components'] || {})) {
      const cat = getCategoryForComponent(key);
      (grouped[cat] || grouped['Other']).push(key);
    }

    return CATEGORIES_ORDER.map(category => ({
      category,
      components: [...grouped[category]].sort(),
    })).filter(item => item.components.length > 0);
  });

  /**
   * Resolves and parses property specifications for the selected component.
   */
  readonly selectedComponentProperties = computed<ParsedProperty[]>(() => {
    const key = this.selectedComponentKey();
    const resolver = this.catalogSchemaResolver();
    if (!key || !resolver) {
      return [];
    }
    return resolver.resolveComponentProperties(key);
  });

  /**
   * The active visual preset representing the UI layout for the selected component.
   */
  readonly selectedComponentPreset = computed<ComponentUsage | null>(() => {
    const key = this.selectedComponentKey();
    if (!key) {
      return null;
    }

    if (this.cachedUsages() === null && this.loadingUsages()) {
      return null;
    }

    const resolver = this.catalogSchemaResolver();
    const properties = this.selectedComponentProperties();

    const {prefix, normalizedName} = this.parseComponentName(key);
    const retrievedUsage = this.cachedUsages()?.[key];

    return this.usageGenerator.getUsage(
      key,
      prefix,
      normalizedName,
      resolver,
      properties,
      retrievedUsage,
    );
  });

  /**
   * Returns a formatted JSON string of the preset array.
   */
  readonly selectedComponentUsage = computed<string>(() => {
    const key = this.selectedComponentKey();
    if (!key) {
      return '';
    }

    const preset = this.selectedComponentPreset();
    return preset && preset.usage ? formatJson(preset.usage) : '';
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.usageTimeoutId) {
        clearTimeout(this.usageTimeoutId);
      }
    });

    effect(() => {
      const activeCat = this.catalogManagement.activeCatalog();
      const isActive = this.galleryActive();

      if (isActive && activeCat) {
        untracked(() => {
          this._cachedUsages.set(null);
          this._loadingUsages.set(true);
        });

        if (this.usageTimeoutId) {
          clearTimeout(this.usageTimeoutId);
        }

        this.hostCommunication.sendMessage({
          type: PreviewBridgeMessageType.GET_COMPONENT_USAGES,
        });

        this.usageTimeoutId = setTimeout(() => {
          if (this.loadingUsages()) {
            untracked(() => {
              this._loadingUsages.set(false);
              this._cachedUsages.set({});
            });
          }
        }, 2000);
      } else {
        untracked(() => {
          this._cachedUsages.set(null);
          this._loadingUsages.set(false);
        });
        if (this.usageTimeoutId) {
          clearTimeout(this.usageTimeoutId);
        }
      }
    });

    this.hostCommunication.messageStream$.pipe(takeUntilDestroyed()).subscribe(envelope => {
      if (envelope.type === PreviewBridgeMessageType.COMPONENT_USAGES) {
        if (this.usageTimeoutId) {
          clearTimeout(this.usageTimeoutId);
          this.usageTimeoutId = undefined;
        }
        const usages = envelope.payload as ComponentUsages | null;
        this._cachedUsages.set(usages || {});
        this._loadingUsages.set(false);
      }
    });
  }

  /**
   * Sets the actively selected component key.
   *
   * @param key The component name or null to deselect.
   */
  selectComponent(key: string | null): void {
    this._selectedComponentKey.set(key);
  }

  setGalleryActive(active: boolean): void {
    this._galleryActive.set(active);
  }

  private parseComponentName(name: string): {prefix: string; normalizedName: string} {
    const match = name.match(/^(material|ant|nz|mdc|ui|my)/i);
    const prefix = match ? match[0] : '';
    const normalizedName = name.slice(prefix.length);
    return {prefix, normalizedName};
  }
}
