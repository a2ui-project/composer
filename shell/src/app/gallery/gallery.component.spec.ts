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
import {GalleryComponent} from './gallery.component';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {GalleryHarness} from './test/gallery.harness';
import {describe, it, expect, beforeEach} from 'vitest';

describe('GalleryComponent Placeholder', () => {
  let fixture: ComponentFixture<GalleryComponent>;
  let harness: GalleryHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GalleryComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, GalleryHarness);
  });

  it('creates the gallery placeholder component via test harness', async () => {
    expect(harness).toBeTruthy();
  });
});
