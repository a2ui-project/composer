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
import {ComposerWorkspaceComponent} from './composer-workspace.component';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComposerWorkspaceHarness} from './test/composer-workspace.harness';
import {describe, it, expect, beforeEach} from 'vitest';

describe('ComposerWorkspaceComponent Dashboard', () => {
  let fixture: ComponentFixture<ComposerWorkspaceComponent>;
  let harness: ComposerWorkspaceHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComposerWorkspaceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ComposerWorkspaceComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, ComposerWorkspaceHarness);
  });

  it('creates the central workspace dashboard component via test harness', async () => {
    expect(harness).toBeTruthy();
  });

  it('mounts all primary feature drawer placeholder components via child test harnesses', async () => {
    expect(await harness.getChatPanelHarness()).toBeTruthy();
    expect(await harness.getRenderedFrameHarness()).toBeTruthy();
    expect(await harness.getRawFrameHarness()).toBeTruthy();
    expect(await harness.getDataModelHarness()).toBeTruthy();
  });
});
