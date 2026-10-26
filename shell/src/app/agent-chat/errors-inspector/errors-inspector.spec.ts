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

import {TestBed, ComponentFixture} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {ErrorLogger} from '../../debug/error-logger.service';
import {A2aErrorsInspector} from './errors-inspector';
import {A2aErrorsInspectorHarness} from './test/errors-inspector.harness';

describe('A2aErrorsInspector', () => {
  let fixture: ComponentFixture<A2aErrorsInspector>;
  let harness: A2aErrorsInspectorHarness;
  let errorLogger: ErrorLogger;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [A2aErrorsInspector],
    }).compileComponents();

    errorLogger = TestBed.inject(ErrorLogger);
    errorLogger.clear();

    fixture = TestBed.createComponent(A2aErrorsInspector);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, A2aErrorsInspectorHarness);
  });

  it('renders errors table when ErrorLogger emits', async () => {
    const errorsHarness = await harness.getErrors();
    expect(await errorsHarness.hasPlaceholder()).toBe(true);

    errorLogger.error({message: 'Test error', sourceTag: '[Test]'});
    fixture.detectChanges();

    expect(await errorsHarness.hasPlaceholder()).toBe(false);
    expect(await errorsHarness.getRowsCount()).toBe(1);
  });

  it('emits closeDrawer when close button is clicked', async () => {
    const spy = vi.spyOn(fixture.componentInstance.closeDrawer, 'emit');
    await harness.clickClose();
    expect(spy).toHaveBeenCalled();
  });
});
