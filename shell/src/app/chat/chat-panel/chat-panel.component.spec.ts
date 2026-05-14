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

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ChatPanelComponent} from './chat-panel.component';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ChatPanelHarness} from './test/chat-panel.harness';
import {describe, it, expect, beforeEach} from 'vitest';

describe('ChatPanelComponent Placeholder', () => {
  let fixture: ComponentFixture<ChatPanelComponent>;
  let harness: ChatPanelHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatPanelComponent);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, ChatPanelHarness);
  });

  it('creates the chat panel placeholder component via test harness', async () => {
    expect(harness).toBeTruthy();
  });
});
