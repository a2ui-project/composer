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

import {Injectable, inject} from '@angular/core';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {CatalogSchemaResolver} from '../schema/catalog-schema-resolver';
import {CatalogComponentSchema} from '../../storage/models/catalog-storage.model';

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

interface FallbackPresetContext {
  readonly componentKey: string;
  readonly prefix: string;
  readonly additionalItems: Record<string, unknown>[];
  childCounter: number;
}

/**
 * Service responsible for dynamically generating fallback component usage presets
 * based on the catalog schema when no static preset is defined.
 */
@Injectable({
  providedIn: 'root',
})
export class DynamicUsageGenerator {
  private readonly catalogManagement = inject(CatalogManagement);

  /**
   * Generates a fallback preset with required properties populated and default children linked.
   */
  generateFallbackPreset(
    key: string,
    prefix: string,
    resolver: CatalogSchemaResolver | null,
  ): Record<string, unknown>[] {
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

  private generateNumberValue(): number {
    return 0;
  }

  private generateBooleanValue(): boolean {
    return false;
  }

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
}
