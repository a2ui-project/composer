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
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {By} from '@angular/platform-browser';
import {TrackEventDirective} from './track-event.directive';
import {UsageTrackingService} from './usage-tracking.service';
import {NoopUsageTrackingService} from './noop-usage-tracking.service';

@Component({
  template: `<button
    [a2uiComposerTrackEvent]="'trackThemeToggle'"
    [a2uiComposerTrackParams]="{theme: 'dark'}"
  >
    Click Me
  </button>`,
  standalone: true,
  imports: [TrackEventDirective],
})
class TestComponent {}

describe('TrackEventDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let trackingService: UsageTrackingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [{provide: UsageTrackingService, useClass: NoopUsageTrackingService}],
    });
    fixture = TestBed.createComponent(TestComponent);
    trackingService = TestBed.inject(UsageTrackingService);
    fixture.detectChanges();
  });

  it('should call tracking service on click', () => {
    vi.spyOn(trackingService, 'trackThemeToggle');
    const button = fixture.debugElement.query(By.css('button'));
    button.triggerEventHandler('click', null);

    expect(trackingService.trackThemeToggle).toHaveBeenCalledWith({theme: 'dark'});
  });
});
