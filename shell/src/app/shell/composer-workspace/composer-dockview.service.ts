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
  Injectable,
  DestroyRef,
  ViewContainerRef,
  ComponentRef,
  Type,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import {DockviewComponent} from 'dockview';
import {LocalStorageInteractions} from '../../storage/local-storage-interactions/local-storage-interactions';
import {LocalStorageKey} from '../../storage/models/local-storage-keys';

import {ChatPanel} from '../../chat/chat-panel/chat-panel';
import {RawFrame} from '../../preview/raw/raw-frame';
import {RenderedFrame} from '../../preview/rendered/rendered-frame';
import {DataModel} from '../../debug/data-model/data-model';
import {Events} from '../../debug/events/events';
import {Errors} from '../../debug/errors/errors';
import {RawMessages} from '../../debug/raw-messages/raw-messages';
import {ComposerPanelId} from './composer-panel-id';

export interface DockviewManagerInitOptions {
  rootEl: HTMLElement;
  isDarkTheme: boolean;
  onActivePanelChange?: (panelId: string | undefined) => void;
}

/**
 * Service encapsulating Dockview initialization, dynamic component instantiation,
 * layout persistence, DOM resize/tab-overflow handling, and tab event delegation.
 */
@Injectable()
export class ComposerDockview {
  private readonly storage = inject(LocalStorageInteractions);
  private readonly destroyRef = inject(DestroyRef);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly cdr = inject(ChangeDetectorRef);

  private rootEl?: HTMLElement;
  private dockviewApi!: DockviewComponent;
  private componentRefs: ComponentRef<unknown>[] = [];

  private rawMessagesInstance?: RawMessages;
  private eventsInstance?: Events;
  private errorsInstance?: Errors;

  private resizeObserver?: ResizeObserver;
  private animationFrameId?: number;
  private saveTimeout?: ReturnType<typeof setTimeout>;
  private isInitialized = false;

  /**
   * Returns the underlying DockviewComponent instance.
   */
  get api(): DockviewComponent {
    return this.dockviewApi;
  }

  /**
   * Gets the dynamic Angular component refs created inside Dockview panels.
   */
  get dynamicComponentRefs(): readonly ComponentRef<unknown>[] {
    return this.componentRefs;
  }

  /**
   * Initializes Dockview, builds layout, and sets up event listeners.
   */
  initialize(options: DockviewManagerInitOptions): void {
    const {rootEl, isDarkTheme, onActivePanelChange} = options;
    this.rootEl = rootEl;

    this.dockviewApi = new DockviewComponent(rootEl, {
      className: isDarkTheme ? 'dockview-theme-dark' : 'dockview-theme-light',
      defaultRenderer: 'always',
      createComponent: panelOptions =>
        this.createPanelComponent(panelOptions.name as ComposerPanelId),
    });

    this.dockviewApi.onDidActivePanelChange(event => {
      onActivePanelChange?.(event.panel?.id);
      this.checkTabOverflow();
      this.cdr.markForCheck();
    });

    this.buildDockviewLayout();

    this.dockviewApi.onDidLayoutChange(() => {
      this.checkTabOverflow();
      if (this.saveTimeout !== undefined) {
        clearTimeout(this.saveTimeout);
      }
      this.saveTimeout = setTimeout(() => {
        this.storage.setItem(
          LocalStorageKey.DOCKVIEW_LAYOUT,
          JSON.stringify(this.dockviewApi.toJSON()),
        );
      }, 1000);
    });

    this.dockviewApi.onDidAddPanel(() => this.checkTabOverflow());
    this.dockviewApi.onDidRemovePanel(() => this.checkTabOverflow());

    this.resizeObserver = new ResizeObserver(() => this.checkTabOverflow());
    this.resizeObserver.observe(rootEl);

    // Initial layout pass
    const width = rootEl.clientWidth || 1000;
    const height = rootEl.clientHeight || 1000;
    this.dockviewApi.layout(width, height);
    this.isInitialized = true;
    this.checkTabOverflow();

    // Register capture-phase pointerdown and click event delegation
    const handleTabInteraction = (event: Event) => this.handleTabInteraction(event);
    rootEl.addEventListener('pointerdown', handleTabInteraction, true);
    rootEl.addEventListener('click', handleTabInteraction, true);

    this.destroyRef.onDestroy(() => {
      if (this.animationFrameId !== undefined) {
        cancelAnimationFrame(this.animationFrameId);
      }
      if (this.saveTimeout !== undefined) {
        clearTimeout(this.saveTimeout);
      }
      this.resizeObserver?.disconnect();
      rootEl.removeEventListener('pointerdown', handleTabInteraction, true);
      rootEl.removeEventListener('click', handleTabInteraction, true);
      this.dockviewApi?.dispose();
      this.componentRefs.forEach(ref => ref.destroy());
    });
  }

  isPanelVisible(panelId: ComposerPanelId): boolean {
    return !!this.dockviewApi?.getGroupPanel(panelId)?.api.isVisible;
  }

  setPanelTitle(panelId: ComposerPanelId, title: string): void {
    const panel = this.dockviewApi?.getGroupPanel(panelId);
    if (panel) {
      panel.api.setTitle(title);
    }
  }

  updateTheme(isDark: boolean): void {
    this.dockviewApi?.updateOptions({
      className: isDark ? 'dockview-theme-dark' : 'dockview-theme-light',
    });
  }

  clearAllLogs(): void {
    this.rawMessagesInstance?.clearLogs();
    this.eventsInstance?.clearLogs();
    this.errorsInstance?.clearLogs();
  }

  checkTabOverflow(element?: HTMLElement): void {
    const targetEl = element ?? this.rootEl;
    if (!targetEl) return;

    if (this.animationFrameId !== undefined) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.animationFrameId = requestAnimationFrame(() => {
      this.animationFrameId = undefined;
      const tabContainers = targetEl.querySelectorAll<HTMLElement>('.dv-tabs-container');
      let hasOverflow = false;
      tabContainers.forEach(container => {
        if (container.scrollWidth > container.clientWidth + 2) {
          hasOverflow = true;
        }
      });
      targetEl.classList.toggle('has-tab-overflow', hasOverflow);
    });
  }

  private createPanelComponent(panelId: ComposerPanelId) {
    let type: Type<unknown> | undefined;
    switch (panelId) {
      case ComposerPanelId.Chat:
        type = ChatPanel;
        break;
      case ComposerPanelId.Rendered:
        type = RenderedFrame;
        break;
      case ComposerPanelId.Raw:
        type = RawFrame;
        break;
      case ComposerPanelId.DataModel:
        type = DataModel;
        break;
      case ComposerPanelId.Events:
        type = Events;
        break;
      case ComposerPanelId.Errors:
        type = Errors;
        break;
      case ComposerPanelId.RawMessages:
        type = RawMessages;
        break;
    }

    if (!type) {
      return {
        element: document.createElement('div'),
        init: () => {},
        dispose: () => {},
      };
    }

    const componentRef = this.viewContainerRef.createComponent(type);
    this.componentRefs.push(componentRef);

    if (type === RawMessages) this.rawMessagesInstance = componentRef.instance as RawMessages;
    if (type === Events) this.eventsInstance = componentRef.instance as Events;
    if (type === Errors) this.errorsInstance = componentRef.instance as Errors;

    return {
      element: componentRef.location.nativeElement,
      init: () => {
        componentRef.changeDetectorRef.detectChanges();
      },
      dispose: () => {
        if (componentRef.instance === this.rawMessagesInstance) {
          this.rawMessagesInstance = undefined;
        }
        if (componentRef.instance === this.eventsInstance) {
          this.eventsInstance = undefined;
        }
        if (componentRef.instance === this.errorsInstance) {
          this.errorsInstance = undefined;
        }
        componentRef.destroy();
        this.componentRefs = this.componentRefs.filter(r => r !== componentRef);
      },
    };
  }

  private buildDockviewLayout(): void {
    localStorage.removeItem('a2ui_composer_active_draft');

    const savedLayout = this.storage.getItem(LocalStorageKey.DOCKVIEW_LAYOUT);
    let layoutRestored = false;

    if (savedLayout) {
      try {
        const parsedLayout = JSON.parse(savedLayout);

        if (parsedLayout && typeof parsedLayout === 'object' && parsedLayout.panels) {
          const validIds = Object.values(ComposerPanelId) as string[];
          for (const key of Object.keys(parsedLayout.panels)) {
            const panel = parsedLayout.panels[key];
            if (panel && (!validIds.includes(panel.id) || !validIds.includes(panel.component))) {
              delete parsedLayout.panels[key];
            }
          }
        }

        this.dockviewApi.fromJSON(parsedLayout);
        layoutRestored = true;
      } catch (e) {
        console.error('Failed to restore dockview layout');
      }
    }

    if (!layoutRestored) {
      this.dockviewApi.addPanel({
        id: ComposerPanelId.Chat,
        component: ComposerPanelId.Chat,
        title: 'Gemini Assistant',
      });
      this.dockviewApi.addPanel({
        id: ComposerPanelId.Rendered,
        component: ComposerPanelId.Rendered,
        title: 'Rendered A2UI Preview',
        position: {direction: 'right', referencePanel: ComposerPanelId.Chat},
      });
      this.dockviewApi.addPanel({
        id: ComposerPanelId.Raw,
        component: ComposerPanelId.Raw,
        title: 'A2UI JSON Editor',
        position: {
          direction: 'right',
          referencePanel: ComposerPanelId.Rendered,
        },
      });

      this.dockviewApi.addPanel({
        id: ComposerPanelId.DataModel,
        component: ComposerPanelId.DataModel,
        title: 'Data Model',
        position: {
          direction: 'below',
          referencePanel: ComposerPanelId.Rendered,
        },
      });
      this.dockviewApi.addPanel({
        id: ComposerPanelId.Events,
        component: ComposerPanelId.Events,
        title: 'Events',
        position: {
          direction: 'within',
          referencePanel: ComposerPanelId.DataModel,
        },
      });
      this.dockviewApi.addPanel({
        id: ComposerPanelId.Errors,
        component: ComposerPanelId.Errors,
        title: 'Errors',
        position: {
          direction: 'within',
          referencePanel: ComposerPanelId.DataModel,
        },
      });
      this.dockviewApi.addPanel({
        id: ComposerPanelId.RawMessages,
        component: ComposerPanelId.RawMessages,
        title: 'Raw Messages',
        position: {
          direction: 'within',
          referencePanel: ComposerPanelId.DataModel,
        },
      });
    }
  }

  private handleTabInteraction(event: Event): void {
    const tabEl = event
      .composedPath()
      .find(
        (node): node is HTMLElement =>
          node instanceof HTMLElement && node.classList.contains('dv-tab'),
      );
    if (!tabEl) return;

    const panels = this.dockviewApi?.panels ?? [];
    for (const panel of panels) {
      const panelTabEl = panel.view?.tab?.element;
      if (panelTabEl && (panelTabEl === tabEl || panelTabEl.contains(tabEl))) {
        if (panel.api && !panel.api.isActive) {
          panel.api.setActive();
        }
        break;
      }
    }
  }
}
