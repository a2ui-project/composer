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
import {DataModelComponent} from './data-model.component';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {DataModelHarness} from './test/data-model.harness';
import {describe, it, expect, beforeEach} from 'vitest';

describe('DataModelComponent Placeholder', () => {
  let fixture: ComponentFixture<DataModelComponent>;
  let harness: DataModelHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataModelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DataModelComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, DataModelHarness);
  });

  it('creates the data model placeholder component via test harness', async () => {
    expect(harness).toBeTruthy();
  });
});
