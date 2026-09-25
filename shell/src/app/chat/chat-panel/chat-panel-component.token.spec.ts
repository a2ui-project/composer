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
import {TestBed} from '@angular/core/testing';
import {describe, expect, it} from 'vitest';
import {ChatPanel} from './chat-panel';
import {ChatPanelBase} from './chat-panel-base';
import {CHAT_PANEL_COMPONENT} from './chat-panel-component.token';

@Component({selector: 'a2ui-composer-test-chat-panel', template: ''})
class TestChatPanel extends ChatPanelBase {}

describe('CHAT_PANEL_COMPONENT', () => {
  it('defaults to the dependency-free chat panel', () => {
    TestBed.configureTestingModule({});

    expect(TestBed.inject(CHAT_PANEL_COMPONENT)).toBe(ChatPanel);
  });

  it('uses the chat panel an application provides', () => {
    TestBed.configureTestingModule({
      providers: [{provide: CHAT_PANEL_COMPONENT, useValue: TestChatPanel}],
    });

    expect(TestBed.inject(CHAT_PANEL_COMPONENT)).toBe(TestChatPanel);
  });
});
