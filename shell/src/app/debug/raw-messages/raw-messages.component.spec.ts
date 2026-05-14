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
import {RawMessagesComponent} from './raw-messages.component';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {RawMessagesHarness} from './test/raw-messages.harness';
import {describe, it, expect, beforeEach} from 'vitest';

describe('RawMessagesComponent Placeholder', () => {
  let fixture: ComponentFixture<RawMessagesComponent>;
  let harness: RawMessagesHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RawMessagesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RawMessagesComponent);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, RawMessagesHarness);
  });

  it('creates the raw messages placeholder component via test harness', async () => {
    expect(harness).toBeTruthy();
  });
});
