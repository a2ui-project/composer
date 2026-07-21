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

import {Component, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {CopilotChat} from '@copilotkit/angular';
import {registerA2uiToolRenders} from '../register-tool-renders';

/**
 * Docked CopilotKit assistant sidebar. Hosts the `<copilot-chat>` thread bound
 * to the in-browser `default` agent inside a fixed-width, full-height rail with
 * its own vertical scroll. The panel is collapsible: when collapsed it shrinks
 * to a slim rail exposing only an expand affordance.
 */
@Component({
  selector: 'a2ui-composer-copilot-sidebar',
  standalone: true,
  imports: [CopilotChat, MatButtonModule, MatIconModule],
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

  constructor() {
    // Wire up the A2UI generation/repair tool-call renders exactly once, from
    // within this component's injection context (required by CopilotKit DI).
    registerA2uiToolRenders();
  }

  /** Toggles the sidebar between the expanded panel and the collapsed rail. */
  toggleCollapsed(): void {
    this.collapsed.update(value => !value);
  }
}
