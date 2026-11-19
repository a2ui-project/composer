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

import {Component, computed, inject, linkedSignal, signal} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {MatTooltipModule} from '@angular/material/tooltip';
import {StateSync} from '../../chat/state-sync/state-sync';
import {ComposerPanelId, OpenPanelEvent} from '../../shell/composer-workspace/composer-panel-id';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {formatJson, tryParseJsonArray} from '../../utils/json';
import {
  ComponentTreeNode,
  SurfaceComponentTree,
  buildComponentTrees,
  getSurfaceComponent,
  updateSurfaceComponent,
} from './component-tree-builder';

/**
 * Identifies a selected or focused occurrence in a surface's component tree so both the specific
 * tree row (`key`) and its underlying component definition (`surfaceId`, `id`) can be tracked.
 */
export interface TreeNodeRef {
  readonly surfaceId: string;
  readonly key: string;
  readonly id: string;
}

/**
 * A workspace panel showing the component tree of the current A2UI document.
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
  private readonly parsedDraft = computed(() => tryParseJsonArray(this.stateSync.activeDraft()));

  private readonly _selected = linkedSignal<
    {trees: SurfaceComponentTree[] | null; resetNonce: number},
    TreeNodeRef | null
  >({
    source: () => ({
      trees: this.parsedDraft().success ? this.trees() : null,
      resetNonce: this.stateSync.sessionResetNonce(),
    }),
    computation: ({trees, resetNonce}, previous) => {
      if (!previous || resetNonce !== previous.source.resetNonce) return null;
      const current = previous.value;
      if (!current || !trees) return current;
      const tree = trees.find(tree => tree.surfaceId === current.surfaceId);
      if (!tree) return null;
      const roots = tree.root ? [tree.root, ...tree.unreachable] : tree.unreachable;
      const findNode = (
        nodes: readonly ComponentTreeNode[],
        match: (node: ComponentTreeNode) => boolean,
      ): ComponentTreeNode | null => {
        for (const node of nodes) {
          const found = match(node) ? node : findNode(node.children, match);
          if (found) return found;
        }
        return null;
      };
      if (findNode(roots, node => node.key === current.key)) return current;
      const fallback = findNode(roots, node => node.id === current.id);
      return fallback ? {surfaceId: tree.surfaceId, key: fallback.key, id: fallback.id} : null;
    },
  });

  /** Reference to the currently selected tree node, re-resolved when the tree changes. */
  readonly selected = this._selected.asReadonly();

  /** The component definition for the currently selected tree node, if defined. */
  readonly selectedComponent = computed<Record<string, unknown> | null>(() => {
    const selected = this.selected();
    if (!selected) return null;
    const result = this.parsedDraft();
    if (!result.success) return null;
    return getSurfaceComponent(result.data, selected.surfaceId, selected.id);
  });

  /** Keys of collapsed nodes (nodes are expanded by default). */
  protected readonly collapsed = signal<ReadonlySet<string>>(new Set());

  /** Reference to the currently focused tree node for roving tabindex. */
  protected readonly focused = signal<TreeNodeRef | null>(null);

  /** Parse error message when the active draft is not valid A2UI JSON, or null. */
  readonly parseError = computed(() => {
    const result = this.parsedDraft();
    return result.success ? null : result.error.message;
  });

  protected readonly trees = computed<SurfaceComponentTree[]>(() => {
    const result = this.parsedDraft();
    if (!result.success) return [];
    const catalog =
      this.catalogManagement.mergedActiveCatalog() ?? this.catalogManagement.activeCatalog();
    return buildComponentTrees(result.data, catalog);
  });

  protected isExpanded(node: ComponentTreeNode): boolean {
    return !this.collapsed().has(node.key);
  }

  protected isSelected(surfaceId: string, node: ComponentTreeNode): boolean {
    const selected = this.selected();
    return selected?.surfaceId === surfaceId && selected.key === node.key;
  }

  protected readonly tabStopKeys = computed<ReadonlySet<string>>(() => {
    const focused = this.focused();
    const hasNode = (node: ComponentTreeNode): boolean =>
      node.key === focused?.key || (this.isExpanded(node) && node.children.some(hasNode));
    const keys = new Set<string>();
    const addStop = (surfaceId: string, roots: readonly ComponentTreeNode[]) => {
      const key =
        focused?.surfaceId === surfaceId && roots.some(hasNode) ? focused.key : roots[0]?.key;
      if (key) keys.add(`${surfaceId}\0${key}`);
    };
    for (const tree of this.trees()) {
      if (tree.root) addStop(tree.surfaceId, [tree.root]);
      addStop(tree.surfaceId, tree.unreachable);
    }
    return keys;
  });

  protected tabIndexFor(surfaceId: string, node: ComponentTreeNode): number {
    return this.tabStopKeys().has(`${surfaceId}\0${node.key}`) ? 0 : -1;
  }

  protected onFocus(surfaceId: string, node: ComponentTreeNode): void {
    this.focused.set({surfaceId, key: node.key, id: node.id});
  }

  selectNode(surfaceId: string, node: ComponentTreeNode, event?: Event): void {
    event?.preventDefault();
    const ref: TreeNodeRef = {surfaceId, key: node.key, id: node.id};
    this.focused.set(ref);
    this._selected.set(ref);
    window.dispatchEvent(new OpenPanelEvent(ComposerPanelId.PropertyEditor));
  }

  updateSelectedComponent(updatedComponent: Record<string, unknown>): void {
    const selected = this.selected();
    if (!selected) return;
    const result = this.parsedDraft();
    if (!result.success) return;
    const updatedMessages = updateSurfaceComponent(
      result.data,
      selected.surfaceId,
      selected.id,
      updatedComponent,
    );
    this.stateSync.updateDraft(formatJson(updatedMessages));
  }

  protected focusNextNode(event: Event): void {
    this.stepFocus(event, 1);
  }

  protected focusPreviousNode(event: Event): void {
    this.stepFocus(event, -1);
  }

  private stepFocus(event: Event, delta: 1 | -1): void {
    event.preventDefault();
    const currentRow = event.currentTarget;
    if (!(currentRow instanceof HTMLElement)) return;
    const tree = currentRow.closest<HTMLElement>('[role="tree"]');
    if (!tree) return;
    const rows = Array.from(tree.querySelectorAll<HTMLElement>('.tree-row'));
    rows[rows.indexOf(currentRow) + delta]?.focus();
  }

  protected toggle(node: ComponentTreeNode, event?: Event): void {
    event?.stopPropagation();
    const next = new Set(this.collapsed());
    if (next.has(node.key)) {
      next.delete(node.key);
    } else {
      next.add(node.key);
    }
    this.collapsed.set(next);
  }

  protected expandNode(node: ComponentTreeNode, event: Event): void {
    event.preventDefault();
    if (node.children.length === 0) return;
    if (!this.isExpanded(node)) {
      this.toggle(node);
    } else {
      this.focusNextNode(event);
    }
  }

  protected collapseNode(
    node: ComponentTreeNode,
    parentRow: HTMLElement | undefined,
    event: Event,
  ): void {
    event.preventDefault();
    if (node.children.length > 0 && this.isExpanded(node)) {
      this.toggle(node);
    } else {
      parentRow?.focus();
    }
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
