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
    [a2uiComposerTrackEvent]="trackEventName"
    [a2uiComposerTrackParams]="trackParams"
  >
    Click Me
  </button>`,
  standalone: true,
  imports: [TrackEventDirective],
})
class TestComponent {
  trackEventName: keyof UsageTrackingService = 'trackThemeToggle';
  trackParams: unknown = {theme: 'dark'};
}

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

  it('calls tracking service on click', () => {
    vi.spyOn(trackingService, 'trackThemeToggle');
    const button = fixture.debugElement.query(By.css('button'));
    button.triggerEventHandler('click', null);

    expect(trackingService.trackThemeToggle).toHaveBeenCalledWith({theme: 'dark'});
  });

  it('safely ignores unknown method names without throwing', () => {
    fixture.componentInstance.trackEventName = 'unknownMethod' as keyof UsageTrackingService;
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(() => button.triggerEventHandler('click', null)).not.toThrow();
  });

  it('calls tracking method with undefined when params are omitted', () => {
    const fixture3 = TestBed.createComponent(TestComponent);
    fixture3.componentInstance.trackEventName = 'trackThemeToggle';
    fixture3.componentInstance.trackParams = undefined;
    fixture3.detectChanges();

    vi.spyOn(trackingService, 'trackThemeToggle');
    const button = fixture3.debugElement.query(By.css('button'));
    button.triggerEventHandler('click', null);

    expect(trackingService.trackThemeToggle).toHaveBeenCalledWith(undefined);
  });
});
