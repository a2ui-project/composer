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

import {Component, computed, effect, inject, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {CopilotChat, CopilotKit} from '@copilotkit/angular';
import {registerA2uiToolRenders} from '../register-tool-renders';
import {AppConfigProvider} from '../../settings/app-config-provider/app-config-provider';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';

/** Id of the single shared in-browser agent the sidebar chat is bound to. */
const DEFAULT_AGENT_ID = 'default';

/** Generic starter prompts shown before the catalog handshake resolves. */
const GENERIC_STARTERS: readonly string[] = [
  'Book a Car',
  'A sign-up form',
  'A pricing card',
  'A product dashboard header',
];

/** A single clickable starter chip: `title` labels the pill, `message` is the prompt submitted. */
interface StarterChip {
  readonly title: string;
  readonly message: string;
}

/**
 * Docked CopilotKit assistant sidebar. Hosts the `<copilot-chat>` thread bound
 * to the in-browser `default` agent inside a fixed-width, full-height rail with
 * its own vertical scroll. The panel is collapsible: when collapsed it shrinks
 * to a slim rail exposing only an expand affordance.
 */
@Component({
  selector: 'a2ui-composer-copilot-sidebar',
  standalone: true,
  imports: [CopilotChat, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './copilot-sidebar.ng.html',
  styleUrl: './copilot-sidebar.scss',
  host: {
    '[class.a2ui-composer-copilot-sidebar--collapsed]': 'collapsed()',
    '[style.width.px]': 'collapsed() ? railWidthPx : panelWidthPx',
  },
})
export class CopilotSidebar {
  /** Docked width of the expanded chat panel, in pixels. */
  protected readonly panelWidthPx = 380;

  /** Width of the collapsed rail, in pixels. */
  protected readonly railWidthPx = 48;

  /** Whether the sidebar is collapsed to its slim rail. */
  readonly collapsed = signal(false);

  private readonly configProvider = inject(AppConfigProvider);
  private readonly catalogManagement = inject(CatalogManagement);
  private readonly copilotKit = inject(CopilotKit);

  /**
   * Whether the user has supplied a usable Gemini API key. The assistant is
   * bring-your-own-key and runs client-side, so the chat must not mount until a
   * non-blank key exists.
   */
  readonly hasKey = computed(() => !!this.configProvider.geminiApiKey().trim());

  /**
   * Starter prompt chips offered on an empty thread. Tailored to the active
   * catalog's name when the preview handshake has resolved one, otherwise a
   * generic set. Each chip's `message` is the prompt submitted to the agent.
   */
  readonly starterSuggestions = computed<StarterChip[]>(() => {
    const catalogTitle = this.catalogManagement.activeCatalog()?.title?.trim();
    return GENERIC_STARTERS.map(title => ({
      title,
      message: catalogTitle ? `${title}, using the ${catalogTitle} catalog` : title,
    }));
  });

  constructor() {
    // Wire up the A2UI generation/repair tool-call renders exactly once, from
    // within this component's injection context (required by CopilotKit DI).
    registerA2uiToolRenders();

    // Publish the starter chips as a native CopilotKit suggestions config so the
    // shared `<copilot-chat>` renders them and routes a chosen chip's prompt
    // through the one `default` agent store. `before-first-message` scopes them
    // to an empty thread (CopilotKit clears them after the first run), and the
    // config is only registered while a key exists. The effect re-runs when the
    // key or the tailored starters change, and its cleanup withdraws the config
    // on re-run and on destroy.
    effect(onCleanup => {
      if (!this.hasKey()) {
        return;
      }
      const configId = this.copilotKit.addSuggestionsConfig({
        consumerAgentId: DEFAULT_AGENT_ID,
        available: 'before-first-message',
        suggestions: this.starterSuggestions(),
      });
      onCleanup(() => this.copilotKit.removeSuggestionsConfig(configId));
    });
  }

  /** Toggles the sidebar between the expanded panel and the collapsed rail. */
  toggleCollapsed(): void {
    this.collapsed.update(value => !value);
  }
}
