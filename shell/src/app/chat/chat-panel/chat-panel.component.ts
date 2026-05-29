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

import {Component, inject} from '@angular/core';
import {ChatService} from '../chat-service/chat.service';

@Component({
  selector: 'a2ui-composer-chat-panel',
  standalone: true,
  imports: [],
  templateUrl: './chat-panel.component.ng.html',
  styleUrl: './chat-panel.component.scss',
})
/**
 * Displays the interactive chat panel within the Composer shell,
 * visualizing the reactively constructed AI system prompt blocks.
 */
export class ChatPanelComponent {
  private readonly chatService = inject(ChatService);

  /**
   * The reactively computed dynamic system prompt instructions block
   * reflecting Custom Component registrations.
   */
  protected readonly systemPrompt = this.chatService.systemPromptSignal;
}
