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
import {CatalogComponentSchema} from '../../storage/models/catalog-storage.model';
import {DEFAULT_PRESETS} from './default-presets';

const HIGH_VALUE_FIELDS = new Set([
  'label',
  'text',
  'title',
  'header',
  'tooltip',
  'placeholder',
  'children',
  'child',
]);

const DEFAULT_TEXT_FOR_FIELD: Record<string, string> = {
  label: 'Sample Label',
  text: 'Sample Text',
  title: 'Sample Title',
  header: 'Sample Header',
  tooltip: 'Sample Tooltip',
  placeholder: 'Enter text...',
  icon: 'search',
  name: 'action',
  value: 'option',
};

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

interface FallbackPresetContext {
  readonly componentKey: string;
  readonly prefix: string;
  readonly additionalItems: Record<string, unknown>[];
  childCounter: number;
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

  /**
   * The active visual preset representing the UI layout for the selected component.
   *
   * Why: Visual presets define how components are structured, styled, and populated with children
   * to showcase them in the gallery. This computed property fetches a predefined static preset,
   * falls back to dynamic generation, adapts structural slots like children/tabs, and validates
   * properties against the schema so the preview remains consistent.
   */
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

    const adaptedPreset = this.adaptPreset(preset, key);
    return this.validateAndPrunePreset(adaptedPreset);
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
    const presetKey = Object.prototype.hasOwnProperty.call(DEFAULT_PRESETS, key)
      ? key
      : Object.prototype.hasOwnProperty.call(DEFAULT_PRESETS, normalizedKey)
        ? normalizedKey
        : null;
    if (!presetKey) {
      return null;
    }

    // We clone the preset to avoid mutating the shared DEFAULT_PRESETS object.
    const preset = structuredClone(DEFAULT_PRESETS[presetKey]) as Record<string, unknown>[];

    // Prefix propagation: static presets in DEFAULT_PRESETS use prefix-less component names
    // for children to remain library-agnostic. We must restore the active prefix here
    // so they resolve to correct library implementations (e.g., 'Text' -> 'materialText').
    for (const item of preset) {
      if (item['id'] === 'target') {
        item['component'] = key;
      } else if (typeof item['component'] === 'string') {
        if (presetKey === normalizedKey) {
          item['component'] = `${prefix}${item['component']}`;
        }
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
  /**
   * Generates a fallback preset when no static preset is defined.
   *
   * Why: If a component has no predefined presets, we dynamically generate
   * a minimal working configuration so the user can still see and interact
   * with it in the gallery.
   *
   * @param key The selected component key.
   * @param prefix The library prefix.
   * @returns A generated preset with required properties populated and default children linked if supported.
   */
  private generateFallbackPreset(key: string, prefix: string): Record<string, unknown>[] {
    const resolver = this.catalogSchemaResolver();
    if (!resolver) {
      return [{id: 'target', component: key}];
    }

    const propSchemas = resolver.resolveComponentPropertiesSchema(key);
    const targetItem: Record<string, unknown> = {
      id: 'target',
      component: key,
    };

    const ctx: FallbackPresetContext = {
      componentKey: key,
      prefix,
      additionalItems: [],
      childCounter: 0,
    };

    const requiredProps = new Set(
      resolver
        .resolveComponentProperties(key)
        .filter(p => p.required)
        .map(p => p.name),
    );
    for (const [propName, propSchema] of Object.entries(propSchemas)) {
      if (propName === 'component' || propName === 'id') {
        continue;
      }
      const isRequired = requiredProps.has(propName);

      const val = this.generatePropertyValue(propName, propSchema, isRequired, 1, ctx);
      if (val !== undefined) {
        targetItem[propName] = val;
      }
    }

    return [targetItem, ...ctx.additionalItems];
  }

  /**
   * Main entry point to generate a fallback value for a specific property schema.
   *
   * Why: Coordinates fallback value generation per property, mapping types to specialized helpers.
   *
   * @param propName The name of the property.
   * @param schema The schema definition of the property.
   * @param isRequired True if the property is required.
   * @param depth The current recursion depth (capped at 5).
   * @param ctx The execution context holding generator state.
   * @returns The generated value, or undefined if the value should not be populated.
   */
  private generatePropertyValue(
    propName: string,
    schema: CatalogComponentSchema,
    isRequired: boolean,
    depth: number,
    ctx: FallbackPresetContext,
    itemIndex?: number,
  ): unknown {
    if (depth > 5) {
      return null;
    }

    if (!schema || typeof schema !== 'object') {
      return undefined;
    }

    // Special case: fallback placeholder image for Image component url/src fields.
    const isImageComponent = ctx.componentKey.toLowerCase().includes('image');
    const isUrlField = propName === 'url' || propName === 'src';
    if (isImageComponent && isUrlField) {
      return 'https://gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_74x24px.svg';
    }

    const activeSchema = this.resolveActiveSchema(schema);
    let typeString = '';
    if (typeof activeSchema['type'] === 'string') {
      typeString = activeSchema['type'];
    } else if (Array.isArray(activeSchema['type'])) {
      typeString = activeSchema['type'].find(t => typeof t === 'string') || '';
    }
    const primaryType = typeString.split('|')[0].trim();

    // High-value fields should have a default text even if not required, to make mock visually pleasing.
    if (!isRequired && HIGH_VALUE_FIELDS.has(propName)) {
      if (primaryType === 'string' || !primaryType) {
        return this.generateStringValue(propName, ctx, itemIndex, 'Sample');
      }
    }

    if (!isRequired && !HIGH_VALUE_FIELDS.has(propName)) {
      return undefined;
    }

    switch (primaryType) {
      case 'string':
        return this.generateStringValue(propName, ctx, itemIndex);
      case 'number':
      case 'integer':
        return this.generateNumberValue();
      case 'boolean':
        return this.generateBooleanValue();
      case 'array':
        return this.generateArrayValue(propName, activeSchema, depth, ctx);
      case 'object':
        return this.generateObjectValue(activeSchema, depth, ctx, itemIndex);
      default:
        return null;
    }
  }

  /**
   * Selects the active schema from a union schema, defaulting to the first option.
   *
   * Why: Union types (oneOf/anyOf) specify multiple possible shapes. We pick the first one
   * as a representative to generate a fallback preset.
   */
  private resolveActiveSchema(schema: CatalogComponentSchema): CatalogComponentSchema {
    if (!schema || typeof schema !== 'object') {
      return {} as CatalogComponentSchema;
    }
    if (Array.isArray(schema['oneOf']) && schema['oneOf'].length > 0) {
      const first = schema['oneOf'][0];
      return (first && typeof first === 'object' ? first : {}) as CatalogComponentSchema;
    }
    if (Array.isArray(schema['anyOf']) && schema['anyOf'].length > 0) {
      const first = schema['anyOf'][0];
      return (first && typeof first === 'object' ? first : {}) as CatalogComponentSchema;
    }
    return schema;
  }

  /**
   * Generates a fallback string value. Handles special mapping of 'child' property to a Text component.
   *
   * Why: Generates default strings or links sub-components if the field represents a child slot.
   */
  private generateStringValue(
    propName: string,
    ctx: FallbackPresetContext,
    itemIndex?: number,
    fallback = '',
  ): unknown {
    if (propName === 'child') {
      return this.generateChildTextComponent(ctx);
    }
    const baseText = DEFAULT_TEXT_FOR_FIELD[propName] || fallback;
    if (itemIndex !== undefined) {
      return `${baseText} ${itemIndex + 1}`;
    }
    return baseText;
  }

  /**
   * Generates a fallback number/integer value.
   *
   * Why: Default fallback for numeric properties.
   */
  private generateNumberValue(): number {
    return 0;
  }

  /**
   * Generates a fallback boolean value.
   *
   * Why: Default fallback for boolean properties.
   */
  private generateBooleanValue(): boolean {
    return false;
  }

  /**
   * Generates a fallback array value. Handles special mapping of 'children'/'child' properties to Text components.
   *
   * Why: Populates array slots, linking child text items for layout slots or resolving item schemas recursively.
   */
  private generateArrayValue(
    propName: string,
    activeSchema: CatalogComponentSchema,
    depth: number,
    ctx: FallbackPresetContext,
  ): unknown {
    if (propName === 'children' || propName === 'child') {
      const childId = this.generateChildTextComponent(ctx);
      if (childId !== undefined) {
        return propName === 'children' ? [childId] : childId;
      }
      return undefined;
    }

    const itemsSchema = activeSchema['items'] as CatalogComponentSchema | undefined;
    if (itemsSchema && typeof itemsSchema === 'object') {
      const isOptions = propName.toLowerCase().includes('options');
      const count = isOptions ? 3 : 1;
      const items: unknown[] = [];
      for (let i = 0; i < count; i++) {
        const item = this.generatePropertyValue(
          propName + 'Item',
          itemsSchema,
          true,
          depth + 1,
          ctx,
          isOptions ? i : undefined,
        );
        if (item !== undefined) {
          items.push(item);
        }
      }
      return items;
    }
    return [];
  }

  /**
   * Generates a fallback object value by recursively generating values for its required sub-properties.
   *
   * Why: Recursively generates nested object structures up to the maximum depth.
   */
  private generateObjectValue(
    activeSchema: CatalogComponentSchema,
    depth: number,
    ctx: FallbackPresetContext,
    itemIndex?: number,
  ): Record<string, unknown> {
    const properties = activeSchema['properties'] as Record<string, unknown> | undefined;
    if (properties && typeof properties === 'object') {
      const objVal: Record<string, unknown> = {};
      const requiredProps = new Set<string>(
        Array.isArray(activeSchema['required']) ? (activeSchema['required'] as string[]) : [],
      );
      for (const [subPropName, subPropSchema] of Object.entries(properties)) {
        const subIsRequired = requiredProps.has(subPropName);
        const val = this.generatePropertyValue(
          subPropName,
          subPropSchema as CatalogComponentSchema,
          subIsRequired,
          depth + 1,
          ctx,
          itemIndex,
        );
        if (val !== undefined) {
          objVal[subPropName] = val;
        }
      }
      return objVal;
    }
    return {};
  }

  /**
   * Generates a fallback Text child component and adds it to the additional items list.
   *
   * Why: Common utility to link standard Text child elements when components support children.
   *
   * @returns The generated child element ID, or undefined if the Text component doesn't exist in the catalog.
   */
  private generateChildTextComponent(ctx: FallbackPresetContext): string | undefined {
    const textComponent = `${ctx.prefix}Text`;
    const catalog = this.catalogManagement.activeCatalog();
    const textComponentExists = !!(
      catalog?.components && Object.prototype.hasOwnProperty.call(catalog.components, textComponent)
    );

    if (textComponentExists) {
      const childId = `target-child-${ctx.childCounter++}`;
      const childItem = {
        id: childId,
        component: textComponent,
        text: 'Child Element',
      };
      ctx.additionalItems.push(childItem);
      return childId;
    }
    return undefined;
  }

  private adaptPreset(preset: Record<string, unknown>[], key: string): Record<string, unknown>[] {
    const targetItem = preset.find(item => item['id'] === 'target');
    if (!targetItem) {
      return preset;
    }

    const validProps = new Set(this.selectedComponentProperties().map(p => p.name));

    // 1. Map 'child' to 'children' if 'children' is valid but 'child' is not.
    if ('child' in targetItem && !validProps.has('child') && validProps.has('children')) {
      targetItem['children'] = [targetItem['child']];
      delete targetItem['child'];
    }

    // 2. Map 'child' to 'label' if 'label' is valid but 'child' is not.
    if ('child' in targetItem && !validProps.has('child') && validProps.has('label')) {
      const childId = targetItem['child'];
      if (typeof childId === 'string') {
        const childItem = preset.find(item => item['id'] === childId);
        if (childItem && typeof childItem['text'] === 'string') {
          targetItem['label'] = childItem['text'];
        }
      }
    }

    // 3. Map 'tabs' array items (title -> label, child -> content) if target is not basic 'Tabs' and component expects 'tabs'.
    if (
      key !== 'Tabs' &&
      'tabs' in targetItem &&
      Array.isArray(targetItem['tabs']) &&
      validProps.has('tabs')
    ) {
      targetItem['tabs'] = targetItem['tabs'].map(tab => {
        if (tab && typeof tab === 'object') {
          const adaptedTab = {...tab} as Record<string, unknown>;
          if ('title' in adaptedTab) {
            adaptedTab['label'] = adaptedTab['title'];
            delete adaptedTab['title'];
          }
          if ('child' in adaptedTab) {
            adaptedTab['content'] = adaptedTab['child'];
            delete adaptedTab['child'];
          }
          return adaptedTab;
        }
        return tab;
      });
    }

    return preset;
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
          if (tab && typeof tab === 'object') {
            const tabRecord = tab as Record<string, unknown>;
            if (typeof tabRecord['child'] === 'string') {
              childIdsToPrune.add(tabRecord['child']);
            }
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
}
