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

import {InjectionToken, Type} from '@angular/core';
import {ChatPanel} from './chat-panel';
import {ChatPanelBase} from './chat-panel-base';

/**
 * The chat panel component the workspace mounts in its chat slot.
 *
 * Defaults to the dependency-free {@link ChatPanel}. An application can provide
 * another {@link ChatPanelBase} subclass, as the open-source app does with the
 * CopilotKit panel in `app.config.ts`.
 */
export const CHAT_PANEL_COMPONENT = new InjectionToken<Type<ChatPanelBase>>(
  'CHAT_PANEL_COMPONENT',
  {
    providedIn: 'root',
    factory: () => ChatPanel,
  },
);
