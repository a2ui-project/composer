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

import {Component, computed, ViewEncapsulation} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
  CopilotChatView,
  CopilotChatMessageView,
  CopilotChatUserMessage,
  CopilotChatAssistantMessage,
  CopilotChatUserMessageCopyButton,
  CopilotChatAssistantMessageCopyButton,
  provideCopilotChatLabels,
} from '@copilotkit/angular';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {RouterLink} from '@angular/router';
import {AutoScroll, ChatPanelBase} from '../chat-panel/chat-panel-base';
import {MessageRole} from '../llm-client/llm-client';

/**
 * Controlled CopilotKit presentation of Composer's conversation and generation
 * actions. All CopilotKit usage in Composer lives in this folder; applications
 * that can't depend on CopilotKit keep the default plain chat panel.
 */
@Component({
  selector: 'a2ui-composer-chat-panel',
  standalone: true,
  imports: [
    MatInputModule,
    MatMenuModule,
    MatButtonModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDialogModule,
    RouterLink,
    AutoScroll,
    CopilotChatView,
    CopilotChatMessageView,
    CopilotChatUserMessage,
    CopilotChatAssistantMessage,
    CopilotChatUserMessageCopyButton,
    CopilotChatAssistantMessageCopyButton,
  ],
  providers: [provideCopilotChatLabels({welcomeMessageText: 'Build on your canvas'})],
  templateUrl: './copilotkit-chat-panel.ng.html',
  // CopilotKit renders its own child components, so its stylesheet and theme
  // are loaded unencapsulated when this panel mounts and scoped by selector.
  styleUrls: ['./copilotkit-chat-panel.scss', './copilotkit-theme.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CopilotKitChatPanel extends ChatPanelBase {
  // These are read-only projections. Composer owns history, retries, and the active stream.
  protected readonly chatMessages = computed<ReturnType<CopilotChatView['messages']>>(() =>
    this.visibleChatHistory().map(turn => ({
      id: turn.id,
      role: turn.role === MessageRole.USER ? 'user' : 'assistant',
      content: turn.displayContent,
    })),
  );
  protected readonly turnsById = computed(
    () => new Map(this.visibleChatHistory().map(turn => [turn.id, turn])),
  );
}
