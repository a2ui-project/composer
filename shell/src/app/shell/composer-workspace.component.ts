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

import {Component} from '@angular/core';
import {ChatPanelComponent} from '../chat/chat-panel/chat-panel.component';
import {RawFrameComponent} from '../preview/raw/raw-frame.component';
import {RenderedFrameComponent} from '../preview/rendered/rendered-frame.component';
import {DataModelComponent} from '../debug/data-model/data-model.component';
import {EventsComponent} from '../debug/events/events.component';
import {ErrorsComponent} from '../debug/errors/errors.component';
import {RawMessagesComponent} from '../debug/raw-messages/raw-messages.component';
import {MockRulesComponent} from '../debug/mock-rules/mock-rules.component';
import {MatTabsModule} from '@angular/material/tabs';

@Component({
  selector: 'a2ui-composer-workspace',
  standalone: true,
  imports: [
    ChatPanelComponent,
    RawFrameComponent,
    RenderedFrameComponent,
    DataModelComponent,
    EventsComponent,
    ErrorsComponent,
    RawMessagesComponent,
    MockRulesComponent,
    MatTabsModule,
  ],
  templateUrl: './composer-workspace.component.ng.html',
  styleUrl: './composer-workspace.component.scss',
})
/**
 * The central workspace hub coordinating split-pane views between
 * the layout editors, active preview frame, and debug consoles.
 */
export class ComposerWorkspaceComponent {}
