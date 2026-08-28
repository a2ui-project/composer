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

import {Component, computed, input, output} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {AgentCard} from '../../chat/a2a/a2a-types';
import {DEFAULT_A2A_ICON_URL} from '../converters/a2a-ui-converter';
import {UiAgentInfo} from './types';

/**
 * Top header toolbar component for Agent Chat, displaying agent identity,
 * active task metadata, and drawer/session toggle controls.
 */
@Component({
  selector: 'a2ui-composer-agent-header',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './agent-header.ng.html',
  styleUrl: './agent-header.scss',
})
export class A2aAgentHeader {
  /** Presentational agent metadata and capabilities to display in the header. */
  readonly agentInfo = input<UiAgentInfo | null>(null);
  /** Raw A2A AgentCard discovery manifest. */
  readonly agentCard = input<AgentCard | null>(null);
  /** Configured endpoint URL string for the agent. */
  readonly agentUrl = input<string | null>(null);
  /** Active A2A task identifier returned by the server, if any. */
  readonly activeTaskId = input<string | null>(null);
  /** Active context or session conversation identifier. */
  readonly sessionId = input<string | null>(null);
  /** Whether the message inspector side drawer is currently open. */
  readonly isInspectorOpen = input<boolean>(false);

  /** Emitted when the user toggles the message inspector drawer open or closed. */
  readonly toggleInspector = output<void>();
  /** Emitted when the user clicks the reset conversation session button. */
  readonly resetSession = output<void>();
  /** Emitted when the user clicks the settings button to open the config panel. */
  readonly openSettings = output<void>();

  protected readonly displayTitle = computed(() => {
    return this.agentInfo()?.name || this.agentCard()?.name || 'Agent';
  });

  protected readonly displayVersion = computed(() => {
    return this.agentInfo()?.version || this.agentCard()?.version || '';
  });

  protected readonly displayEndpoint = computed(() => {
    return this.agentInfo()?.endpoint || this.agentUrl() || 'Endpoint not configured';
  });

  protected readonly displayIconUrl = computed(() => {
    return this.agentInfo()?.iconUrl || this.agentCard()?.iconUrl || DEFAULT_A2A_ICON_URL;
  });

  protected onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && img.src !== DEFAULT_A2A_ICON_URL) {
      img.src = DEFAULT_A2A_ICON_URL;
    }
  }
}
