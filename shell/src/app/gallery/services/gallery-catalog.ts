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

import {Injectable, inject, signal, computed} from '@angular/core';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {CatalogSchemaResolver, ParsedProperty} from '../schema/catalog-schema-resolver';
import {DEFAULT_PRESETS} from './default-presets';

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

    for (const key of Object.keys(catalog['components'])) {
      const cat = getCategoryForComponent(key);
      grouped[cat].push(key);
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

  readonly selectedComponentPreset = computed<Record<string, unknown>[] | null>(() => {
    const key = this.selectedComponentKey();
    if (!key) {
      return null;
    }

    const {prefix, normalizedName} = this.parseComponentName(key);
    let preset = this.resolveStaticPreset(key, prefix, normalizedName);
    if (!preset) {
      preset = this.generateFallbackPreset(key, prefix);
    }

    return this.validateAndPrunePreset(preset);
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
    return JSON.stringify(preset, null, 2);
  });

  /**
   * Sets the actively selected component key.
   *
   * @param key The component name or null to deselect.
   */
  selectComponent(key: string | null): void {
    this._selectedComponentKey.set(key);
  }

  /**
   * Resolves a static preset from DEFAULT_PRESETS if it exists.
   *
   * @param key The selected component key (e.g. 'materialButton').
   * @param prefix The library prefix (e.g. 'material').
   * @param normalizedKey The normalized key without prefix (e.g. 'Button').
   * @returns The resolved static preset with prefix propagated to child components, or null if no preset exists.
   */
  private resolveStaticPreset(
    key: string,
    prefix: string,
    normalizedKey: string,
  ): Record<string, unknown>[] | null {
    if (!DEFAULT_PRESETS[normalizedKey]) {
      return null;
    }

    // We clone the preset to avoid mutating the shared DEFAULT_PRESETS object.
    const preset = structuredClone(DEFAULT_PRESETS[normalizedKey]) as Record<string, unknown>[];

    // Prefix propagation: static presets in DEFAULT_PRESETS use prefix-less component names
    // for children to remain library-agnostic. We must restore the active prefix here
    // so they resolve to correct library implementations (e.g., 'Text' -> 'materialText').
    for (const item of preset) {
      if (item['id'] === 'target') {
        item['component'] = key;
      } else if (typeof item['component'] === 'string') {
        item['component'] = `${prefix}${item['component']}`;
      }
    }
    return preset;
  }

  /**
   * Generates a fallback preset when no static preset is defined.
   *
   * @param key The selected component key.
   * @param prefix The library prefix.
   * @returns A generated preset with required properties populated and default children linked if supported.
   */
  private generateFallbackPreset(key: string, prefix: string): Record<string, unknown>[] {
    const props = this.selectedComponentProperties();
    const fallback: Record<string, unknown> = {
      id: 'target',
      component: key,
    };

    let hasChildren = false;
    let childrenPropType = '';

    // Inspect schema to find required properties and check if it accepts children.
    for (const prop of props) {
      if (prop.name === 'children') {
        hasChildren = true;
        childrenPropType = prop.type;
      }
      if (
        prop.required &&
        prop.name !== 'component' &&
        prop.name !== 'children' &&
        prop.name !== 'id'
      ) {
        fallback[prop.name] = this.getDefaultValueForType(prop.type);
      }
    }

    // If the component accepts a children array, we link a default child component.
    // This provides a better out-of-the-box visual representation in the gallery.
    if (hasChildren && childrenPropType.includes('array')) {
      const textComponent = `${prefix}Text`;
      const catalog = this.catalogManagement.activeCatalog();
      const textComponentExists = !!(
        catalog?.components &&
        Object.prototype.hasOwnProperty.call(catalog.components, textComponent)
      );

      if (textComponentExists) {
        const childId = 'target-child-0';
        const childFallback: Record<string, unknown> = {
          id: childId,
          component: textComponent,
          text: 'Child Element',
        };
        fallback['children'] = [childId];
        return [fallback, childFallback];
      }
    }

    return [fallback];
  }

  /**
   * Validates the preset against the catalog schema and prunes orphaned child components.
   *
   * Checking against valid properties in the catalog schema prevents guest rendering crashes
   * because passing invalid properties to components might cause them to throw errors during rendering.
   *
   * We prune orphaned child components to clean up the preset array when their parent reference is removed.
   *
   * @param preset The preset to validate and prune.
   * @returns The cleaned preset.
   */
  private validateAndPrunePreset(preset: Record<string, unknown>[]): Record<string, unknown>[] {
    const validProps = new Set(this.selectedComponentProperties().map(p => p.name));
    validProps.add('id');
    validProps.add('component');

    const targetItem = preset.find(item => item['id'] === 'target');
    if (!targetItem) {
      return preset;
    }

    const keysToDelete: string[] = [];
    for (const key of Object.keys(targetItem)) {
      if (!validProps.has(key)) {
        keysToDelete.push(key);
      }
    }

    const childIdsToPrune = new Set<string>();

    for (const key of keysToDelete) {
      if (key === 'children' && Array.isArray(targetItem['children'])) {
        for (const id of targetItem['children']) {
          if (typeof id === 'string') {
            childIdsToPrune.add(id);
          }
        }
      } else if (key === 'child' && typeof targetItem['child'] === 'string') {
        childIdsToPrune.add(targetItem['child']);
      } else if (key === 'tabs' && Array.isArray(targetItem['tabs'])) {
        for (const tab of targetItem['tabs']) {
          if (
            tab &&
            typeof tab === 'object' &&
            'child' in tab &&
            typeof (tab as Record<string, unknown>)['child'] === 'string'
          ) {
            childIdsToPrune.add((tab as Record<string, unknown>)['child'] as string);
          }
        }
      }
      delete targetItem[key];
    }

    if (childIdsToPrune.size > 0) {
      return preset.filter(item => !childIdsToPrune.has(item['id'] as string));
    }

    return preset;
  }

  private parseComponentName(name: string): {prefix: string; normalizedName: string} {
    const match = name.match(/^(material|ant|nz|mdc|ui|my)/i);
    const prefix = match ? match[0] : '';
    const normalizedName = name.slice(prefix.length);
    return {prefix, normalizedName};
  }

  /**
   * Resolves a default value for a given schema type string.
   * Handles union types by taking the first type in the union.
   *
   * @param type The schema type (e.g., 'string', 'number', 'string | number').
   * @returns A default value matching the type, or null if unsupported.
   */
  private getDefaultValueForType(type: string): unknown {
    const primaryType = type.split('|')[0].trim();
    switch (primaryType) {
      case 'string':
        return '';
      case 'number':
      case 'integer':
        return 0;
      case 'boolean':
        return false;
      case 'array':
        return [];
      case 'object':
        return {};
      default:
        return null;
    }
  }
}
