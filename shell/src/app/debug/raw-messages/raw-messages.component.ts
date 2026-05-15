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

import {Component, inject, Signal} from '@angular/core';
import {HostCommunicationService, MessageEnvelope} from '../../shell/host-communication.service';
import {JsonPipe} from '@angular/common';

@Component({
  selector: 'a2ui-composer-raw-messages',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './raw-messages.component.ng.html',
  styleUrl: './raw-messages.component.scss',
})
/**
 * A debug drawer component presenting a scrolling diagnostic view
 * of raw postMessage traffic across the iframe boundary.
 */
export class RawMessagesComponent {
  private hostComm = inject(HostCommunicationService);
  public latestEnvelope: Signal<MessageEnvelope | null> = this.hostComm.latestEnvelope;
}
