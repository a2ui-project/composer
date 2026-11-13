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

import {Component, computed, inject, signal} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {MatTooltipModule} from '@angular/material/tooltip';
import {StateSync} from '../../chat/state-sync/state-sync';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {tryParseJsonArray} from '../../utils/json';
import {
  ComponentTreeNode,
  SurfaceComponentTree,
  buildComponentTrees,
} from './component-tree-builder';

/**
 * A debug drawer panel showing the component tree of the current A2UI
 * document.
 *
 * The tree is derived from the document itself (the active draft) and the
 * catalog schema; see {@link buildComponentTrees}.
 */
@Component({
  selector: 'a2ui-composer-component-tree',
  standalone: true,
  imports: [NgTemplateOutlet, MatTooltipModule],
  templateUrl: './component-tree.ng.html',
  styleUrl: './component-tree.scss',
})
export class ComponentTree {
  private readonly stateSync = inject(StateSync);
  private readonly catalogManagement = inject(CatalogManagement);

  /** Keys of collapsed nodes (nodes are expanded by default). */
  protected readonly collapsed = signal<ReadonlySet<string>>(new Set());

  protected readonly parseError = computed(() => {
    const result = tryParseJsonArray(this.stateSync.activeDraft());
    return result.success ? null : result.error.message;
  });

  protected readonly trees = computed<SurfaceComponentTree[]>(() => {
    const result = tryParseJsonArray(this.stateSync.activeDraft());
    if (!result.success) return [];
    return buildComponentTrees(result.data, this.catalogManagement.activeCatalog());
  });

  protected isExpanded(node: ComponentTreeNode): boolean {
    return !this.collapsed().has(node.key);
  }

  protected toggle(node: ComponentTreeNode, event: Event): void {
    event.stopPropagation();
    const next = new Set(this.collapsed());
    if (next.has(node.key)) {
      next.delete(node.key);
    } else {
      next.add(node.key);
    }
    this.collapsed.set(next);
  }

  protected tooltipFor(node: ComponentTreeNode): string {
    if (node.status === 'missing') {
      return `Component "${node.id}" is not defined in this surface.`;
    }
    if (node.status === 'cycle') {
      return `Reference cycle: "${node.id}" is one of its own ancestors, so it is not expanded again.`;
    }
    const lines: string[] = [];
    if (node.template !== null) {
      lines.push(`Rendered once per item of ${node.template || 'the data list'}.`);
    }
    if (node.shared) {
      lines.push(`"${node.id}" is referenced from more than one place.`);
    }
    return lines.join('\n');
  }
}
