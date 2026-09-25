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
import {ErrorLogger} from '../../debug/error-logger.service';
import {DockviewComponent} from 'dockview-core';
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

/**
 * Default container width in pixels used when the host container width is unmeasured
 * (e.g., prior to DOM layout calculation or in headless test environments).
 * Chosen as 1280px to represent a realistic, standard non-square 16:10 / 16:9 desktop viewport width.
 */
export const DEFAULT_CONTAINER_WIDTH = 1280;

/**
 * Default container height in pixels used when the host container height is unmeasured
 * (e.g., prior to DOM layout calculation or in headless test environments).
 * Chosen as 800px to represent a realistic desktop browser viewport height.
 */
export const DEFAULT_CONTAINER_HEIGHT = 800;

/**
 * Initial target ratio of the debug drawer height relative to total container height (~28%).
 * Keeps the debug drawer compact at the bottom while preserving the majority of vertical
 * screen real estate for the primary interactive A2UI preview and canvas.
 */
const DEBUG_DRAWER_HEIGHT_RATIO = 0.28;

/**
 * Maximum proportion of workspace width initially allocated to the Gemini Assistant panel (1/3).
 * Ensures the chat assistant stays comfortably readable without crowding or dominating the
 * central canvas and preview workspace.
 */
const CHAT_PANEL_MAX_WIDTH_FRACTION = 1 / 3;

/**
 * Minimum width constraints for primary panels in pixels.
 */
const CHAT_PANEL_MIN_WIDTH = 200;
const PREVIEW_PANEL_MIN_WIDTH = 300;

/**
 * Minimum height constraints for panels in pixels.
 */
const PREVIEW_PANEL_MIN_HEIGHT = 150;
const DEBUG_DRAWER_MIN_HEIGHT = 100;

/**
 * Debounce delay in milliseconds before persisting updated Dockview layout to localStorage.
 */
const LAYOUT_SAVE_DEBOUNCE_MS = 1000;

/**
 * Initialization options for ComposerDockview.
 */
export interface DockviewManagerInitOptions {
  /** The root DOM container element hosting the Dockview component instance. */
  rootEl: HTMLElement;
  /** Whether the dark theme CSS class should be initially applied. */
  isDarkTheme: boolean;
  /** Callback invoked whenever the actively focused panel ID changes. */
  onActivePanelChange?: (panelId: string | undefined) => void;
}

/**
 * Service encapsulating Dockview initialization, dynamic component instantiation,
 * layout persistence, DOM resize/tab-overflow handling, and tab event delegation.
 *
 * Layout Architecture:
 * - **Gemini Assistant (Chat)**: Left vertical panel, constrained initially to <= 1/3 viewport width.
 * - **Rendered A2UI Preview & A2UI JSON Editor**: Central workspace area split to the right of Chat.
 *   Both panels share the same tab group (`direction: 'within'`), with "Rendered A2UI Preview"
 *   active by default and "A2UI JSON Editor" tabbed behind it (`inactive: true`).
 * - **Debug Drawer**: Bottom drawer positioned below the Preview (`direction: 'below'`), occupying ~28%
 *   of container height. Combines "Data Model" (initially active), "Events", "Errors", and "Raw Messages"
 *   in a single tabbed group (`direction: 'within'`, `inactive: true`).
 */
@Injectable()
export class ComposerDockview {
  private readonly logger = inject(ErrorLogger).withTag('[Shell]');
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
   *
   * @param options Configuration options including root element, theme, and callbacks.
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
      if (!this.isInitialized) return;
      onActivePanelChange?.(event.panel?.id);
      this.checkTabOverflow();
      this.cdr.markForCheck();
    });

    // Compute realistic initial viewport dimensions, falling back to desktop defaults if unmeasured
    const width = rootEl.clientWidth || DEFAULT_CONTAINER_WIDTH;
    const height = rootEl.clientHeight || DEFAULT_CONTAINER_HEIGHT;

    const layoutRestored = this.buildDockviewLayout(width, height);

    // Debounced layout persistence to localStorage
    this.dockviewApi.onDidLayoutChange(() => {
      if (!this.isInitialized) return;
      this.checkTabOverflow();
      if (this.saveTimeout !== undefined) {
        clearTimeout(this.saveTimeout);
      }
      this.saveTimeout = setTimeout(() => {
        this.storage.setItem(
          LocalStorageKey.DOCKVIEW_LAYOUT,
          JSON.stringify(this.dockviewApi.toJSON()),
        );
      }, LAYOUT_SAVE_DEBOUNCE_MS);
    });

    this.dockviewApi.onDidAddPanel(() => this.checkTabOverflow());
    this.dockviewApi.onDidRemovePanel(() => this.checkTabOverflow());

    this.resizeObserver = new ResizeObserver(() => this.checkTabOverflow());
    this.resizeObserver.observe(rootEl);

    // Initial layout pass
    this.dockviewApi.layout(width, height);
    if (!layoutRestored) {
      this.enforceInitialProportions(width, height);
    }
    this.isInitialized = true;
    this.checkTabOverflow();

    // Register capture-phase pointerdown and click event delegation for robust tab clicks
    const handleTabInteraction = (event: Event) => this.handleTabInteraction(event);
    rootEl.addEventListener('pointerdown', handleTabInteraction, true);
    rootEl.addEventListener('click', handleTabInteraction, true);

    // Teardown observers, timers, listeners, and dynamic components on destroy
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

  /**
   * Checks whether a given panel is currently visible in the active layout.
   *
   * @param panelId Panel identifier to query.
   * @returns `true` if the panel is currently visible.
   */
  isPanelVisible(panelId: ComposerPanelId): boolean {
    return !!this.dockviewApi?.getGroupPanel(panelId)?.api.isVisible;
  }

  /**
   * Programmatically opens and activates the specified panel tab.
   *
   * @param panelId Panel identifier to activate.
   */
  openPanel(panelId: ComposerPanelId): void {
    const panel = this.dockviewApi?.getGroupPanel(panelId);
    if (panel && !panel.api.isActive) {
      panel.api.setActive();
    }
  }

  /**
   * Sets the tab title of a panel.
   *
   * @param panelId Panel identifier whose title will be updated.
   * @param title New title string.
   */
  setPanelTitle(panelId: ComposerPanelId, title: string): void {
    const panel = this.dockviewApi?.getGroupPanel(panelId);
    if (panel) {
      panel.api.setTitle(title);
    }
  }

  /**
   * Updates the theme stylesheet class attached to the Dockview container.
   *
   * @param isDark `true` for dark theme, `false` for light theme.
   */
  updateTheme(isDark: boolean): void {
    this.dockviewApi?.updateOptions({
      className: isDark ? 'dockview-theme-dark' : 'dockview-theme-light',
    });
  }

  /**
   * Clears accumulated diagnostic logs in the debug child component instances.
   */
  clearAllLogs(): void {
    this.rawMessagesInstance?.clearLogs();
    this.eventsInstance?.clearLogs();
    this.errorsInstance?.clearLogs();
  }

  /**
   * Inspects all tab containers to detect horizontal overflow, toggling the
   * `.has-tab-overflow` class on the container element for scrolling affordance.
   *
   * @param element Optional root element to inspect (defaults to `this.rootEl`).
   */
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

  /**
   * Instantiates an Angular component dynamically within a Dockview panel container.
   *
   * @param panelId Identifier of the composer panel to create.
   * @returns Dockview panel content renderer interface.
   */
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

  /**
   * Constructs the default Dockview layout hierarchy or restores a valid stored layout from localStorage.
   *
   * Layout Design:
   * 1. **Chat Panel (Gemini Assistant)**: Anchored left. Width <= 1/3 viewport (`chatWidth`).
   * 2. **Rendered A2UI Preview & A2UI JSON Editor**: Placed right of Chat. Both are tabbed together
   *    (`direction: 'within'`), with Rendered active and JSON Editor `inactive: true`.
   * 3. **Debug Drawer Group**: Placed below Rendered Preview (`direction: 'below'`), sized to ~28%
   *    container height. Houses Data Model (active), Events, Errors, and Raw Messages (`inactive: true`).
   *
   * @param width Viewport width in pixels.
   * @param height Viewport height in pixels.
   * @returns `true` if saved layout was restored; `false` if initial default layout was constructed.
   */
  private buildDockviewLayout(width: number, height: number): boolean {
    this.storage.removeItem(LocalStorageKey.ACTIVE_DRAFT);

    const savedLayout = this.storage.getItem(LocalStorageKey.DOCKVIEW_LAYOUT);
    let layoutRestored = false;

    if (savedLayout) {
      try {
        const parsedLayout = JSON.parse(savedLayout);

        if (parsedLayout && typeof parsedLayout === 'object' && parsedLayout.panels) {
          const validIds = Object.values(ComposerPanelId) as string[];
          for (const key of Object.keys(parsedLayout.panels)) {
            const panel = parsedLayout.panels[key];
            if (
              !panel ||
              key !== panel.id ||
              !validIds.includes(panel.id) ||
              !validIds.includes(panel.contentComponent)
            ) {
              // Grid groups reference these records, so reject the whole layout rather than
              // leaving dangling references by removing retired or invalid panels.
              throw new Error(`Unsupported saved dockview panel: ${key}`);
            }
          }
        }

        this.dockviewApi.fromJSON(parsedLayout);
        layoutRestored = true;
      } catch (e) {
        // Keep layoutRestored false so the default panels below replace the invalid
        // saved arrangement. This error never escapes workspace initialization.
        this.logger.error('Failed to restore dockview layout');
      }
    }

    if (!layoutRestored) {
      const chatWidth = Math.floor(width * CHAT_PANEL_MAX_WIDTH_FRACTION);
      const debugHeight = Math.round(height * DEBUG_DRAWER_HEIGHT_RATIO);
      const previewHeight = height - debugHeight;

      // 1. Chat panel (Gemini Assistant) on the left
      this.dockviewApi.addPanel({
        id: ComposerPanelId.Chat,
        component: ComposerPanelId.Chat,
        title: 'Gemini Assistant',
        initialWidth: chatWidth,
        minimumWidth: CHAT_PANEL_MIN_WIDTH,
      });

      // 2. Rendered preview split to the right of Chat
      this.dockviewApi.addPanel({
        id: ComposerPanelId.Rendered,
        component: ComposerPanelId.Rendered,
        title: 'Rendered A2UI Preview',
        position: {direction: 'right', referencePanel: ComposerPanelId.Chat},
        initialWidth: width - chatWidth,
        initialHeight: previewHeight,
        minimumWidth: PREVIEW_PANEL_MIN_WIDTH,
        minimumHeight: PREVIEW_PANEL_MIN_HEIGHT,
      });

      // 3. Raw JSON editor tabbed within Rendered preview group (inactive initially)
      this.dockviewApi.addPanel({
        id: ComposerPanelId.Raw,
        component: ComposerPanelId.Raw,
        title: 'A2UI JSON Editor',
        position: {
          direction: 'within',
          referencePanel: ComposerPanelId.Rendered,
        },
        inactive: true,
      });

      // 4. Debug drawer split below Rendered preview
      this.dockviewApi.addPanel({
        id: ComposerPanelId.DataModel,
        component: ComposerPanelId.DataModel,
        title: 'Data Model',
        position: {
          direction: 'below',
          referencePanel: ComposerPanelId.Rendered,
        },
        initialHeight: debugHeight,
        minimumHeight: DEBUG_DRAWER_MIN_HEIGHT,
      });

      // 5. Secondary debug tabs placed within Data Model group (inactive initially)
      this.dockviewApi.addPanel({
        id: ComposerPanelId.Events,
        component: ComposerPanelId.Events,
        title: 'Events',
        position: {
          direction: 'within',
          referencePanel: ComposerPanelId.DataModel,
        },
        inactive: true,
      });
      this.dockviewApi.addPanel({
        id: ComposerPanelId.Errors,
        component: ComposerPanelId.Errors,
        title: 'Errors',
        position: {
          direction: 'within',
          referencePanel: ComposerPanelId.DataModel,
        },
        inactive: true,
      });
      this.dockviewApi.addPanel({
        id: ComposerPanelId.RawMessages,
        component: ComposerPanelId.RawMessages,
        title: 'Raw Messages',
        position: {
          direction: 'within',
          referencePanel: ComposerPanelId.DataModel,
        },
        inactive: true,
      });

      // Explicitly activate default primary tabs
      const chatPanel = this.dockviewApi.getGroupPanel(ComposerPanelId.Chat);
      chatPanel?.api.setActive();
    }

    return layoutRestored;
  }

  /**
   * Enforces target width and height splitview proportions on initial layout panels.
   *
   * @param width Total container width in pixels.
   * @param height Total container height in pixels.
   */
  private enforceInitialProportions(width: number, height: number): void {
    const chatWidth = Math.floor(width * CHAT_PANEL_MAX_WIDTH_FRACTION);
    const debugHeight = Math.round(height * DEBUG_DRAWER_HEIGHT_RATIO);

    const chatPanel = this.dockviewApi?.getGroupPanel(ComposerPanelId.Chat);
    chatPanel?.api.setSize({width: chatWidth});

    const dataModelPanel = this.dockviewApi?.getGroupPanel(ComposerPanelId.DataModel);
    dataModelPanel?.api.setSize({height: debugHeight});
  }

  /**
   * Handles click and pointerdown events on tab elements to ensure active tab selection.
   *
   * @param event The DOM event triggered on tab click.
   */
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
