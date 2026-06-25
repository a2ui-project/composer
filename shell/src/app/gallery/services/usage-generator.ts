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
import {DynamicUsageGenerator} from './dynamic-usage-generator';
import {DEFAULT_PRESETS} from './default-presets';
import {CatalogSchemaResolver, ParsedProperty} from '../schema/catalog-schema-resolver';
import {type ComponentUsage} from 'a2ui-bridge';

/**
 * Service that coordinates resolving component usage presets, prioritizing
 * retrieved samples from the bridge, then static presets, and finally falling
 * back to dynamic generation. It also handles adaptation and validation.
 */
@Injectable({
  providedIn: 'root',
})
export class UsageGenerator {
  private readonly dynamicUsageGenerator = inject(DynamicUsageGenerator);

  /**
   * Resolves, adapts, and validates the usage preset for a component.
   */
  getUsage(
    key: string,
    prefix: string,
    normalizedName: string,
    resolver: CatalogSchemaResolver | null,
    properties: ParsedProperty[],
    retrievedUsage?: ComponentUsage,
  ): ComponentUsage | null {
    let preset: ComponentUsage | null = null;

    if (retrievedUsage) {
      // We clone to avoid mutating cached usages if they are mutated during adaptation
      preset = structuredClone(retrievedUsage);
    } else {
      preset = this.resolveStaticPreset(key, prefix, normalizedName);
      if (!preset) {
        preset = {
          usage: this.dynamicUsageGenerator.generateFallbackPreset(key, prefix, resolver),
        };
      }
    }

    if (!preset || !preset.usage || !Array.isArray(preset.usage)) {
      return null;
    }

    const adaptedPreset = this.adaptPreset(preset.usage, key, properties);
    const prunedUsage = this.validateAndPrunePreset(adaptedPreset, properties);
    return {
      usage: prunedUsage,
      ...(preset.data ? {data: preset.data} : {}),
    };
  }

  private resolveStaticPreset(
    key: string,
    prefix: string,
    normalizedKey: string,
  ): ComponentUsage | null {
    const presetKey = Object.prototype.hasOwnProperty.call(DEFAULT_PRESETS, key)
      ? key
      : Object.prototype.hasOwnProperty.call(DEFAULT_PRESETS, normalizedKey)
        ? normalizedKey
        : null;
    if (!presetKey) {
      return null;
    }

    const presetObj = structuredClone(DEFAULT_PRESETS[presetKey]) as ComponentUsage;
    if (!presetObj || !presetObj.usage || !Array.isArray(presetObj.usage)) {
      return null;
    }

    for (const item of presetObj.usage) {
      if (item && item['id'] === 'target') {
        item['component'] = key;
      } else if (item && typeof item['component'] === 'string') {
        if (presetKey === normalizedKey) {
          item['component'] = `${prefix}${item['component']}`;
        }
      }
    }
    return presetObj;
  }

  private adaptPreset(
    preset: Record<string, unknown>[],
    key: string,
    properties: ParsedProperty[],
  ): Record<string, unknown>[] {
    const targetItem = preset.find(item => item && item['id'] === 'target');
    if (!targetItem) {
      return preset;
    }

    const validProps = new Set(properties.map(p => p.name));

    if ('child' in targetItem && !validProps.has('child') && validProps.has('children')) {
      targetItem['children'] = [targetItem['child']];
      delete targetItem['child'];
    }

    if ('child' in targetItem && !validProps.has('child') && validProps.has('label')) {
      const childId = targetItem['child'];
      if (typeof childId === 'string') {
        const childItem = preset.find(item => item && item['id'] === childId);
        if (childItem && typeof childItem['text'] === 'string') {
          targetItem['label'] = childItem['text'];
        }
      }
    }

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

  private validateAndPrunePreset(
    preset: Record<string, unknown>[],
    properties: ParsedProperty[],
  ): Record<string, unknown>[] {
    const validProps = new Set(properties.map(p => p.name));
    validProps.add('id');
    validProps.add('component');

    const targetItem = preset.find(item => item && item['id'] === 'target');
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
      return preset.filter(item => item && !childIdsToPrune.has(item['id'] as string));
    }

    return preset;
  }
}
