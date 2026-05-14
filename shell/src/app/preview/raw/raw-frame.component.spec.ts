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
import {RawFrameComponent} from './raw-frame.component';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {RawFrameHarness} from './test/raw-frame.harness';
import {describe, it, expect} from 'vitest';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {IS_EXTENSION_MODE} from '../../shell/environment-tokens';
import {signal} from '@angular/core';

describe('RawFrameComponent', () => {
  async function setup(isExtension: boolean) {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [RawFrameComponent],
      providers: [
        provideNoopAnimations(),
        {provide: IS_EXTENSION_MODE, useValue: signal(isExtension)},
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(RawFrameComponent);
    fixture.detectChanges();
    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, RawFrameHarness);
    return {fixture, harness};
  }

  it('renders the raw JSON layout inside an Angular Material form field', async () => {
    const {harness} = await setup(false);
    expect(await harness.getJsonText()).toContain('"createSurface"');
  });

  it('applies standard uncollapsed layout padding when extension mode signal is false', async () => {
    const {harness} = await setup(false);
    expect(await harness.isCollapsed()).toBe(false);
  });

  it('applies collapsed container styling when extension mode signal is true', async () => {
    const {harness} = await setup(true);
    expect(await harness.isCollapsed()).toBe(true);
  });

  it('updates backing signal when text is entered via test harness', async () => {
    const {fixture, harness} = await setup(false);
    await harness.setJsonText('{"updated": true}');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.layoutJson()).toBe('{"updated": true}');
  });
});
