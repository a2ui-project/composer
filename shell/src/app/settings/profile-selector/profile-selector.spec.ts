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
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {ProfileSelector} from './profile-selector';
import {ProfileSelectorHarness} from './test/profile-selector.harness';
import {ProfileConfig} from '../../shell/startup-resolution/startup-resolution';
import {describe, beforeEach, it, expect, vi} from 'vitest';

describe('ProfileSelector', () => {
  let fixture: ComponentFixture<ProfileSelector>;
  let component: ProfileSelector;
  let harness: ProfileSelectorHarness;

  const mockProfiles: Record<string, ProfileConfig> = {
    dev: {
      displayName: 'Development Environment',
      rendererUrl: 'http://localhost:3000',
    },
    prod: {
      rendererUrl: 'https://prod.example.com',
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileSelector],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, ProfileSelectorHarness);
  });

  it('renders options with displayName fallback when displayName is missing', async () => {
    fixture.componentRef.setInput('profiles', mockProfiles);
    fixture.detectChanges();

    const options = await harness.getOptionsText();
    expect(options).toEqual(['Custom', 'Development Environment', 'prod']);
  });

  it('emits profileSelected with selected profile ID when option is selected', async () => {
    fixture.componentRef.setInput('profiles', mockProfiles);
    fixture.detectChanges();

    const spy = vi.fn();
    component.profileSelected.subscribe(spy);

    await harness.selectOptionByText('Development Environment');

    expect(spy).toHaveBeenCalledWith('dev');
  });

  it('emits profileSelected with null when Custom option is selected', async () => {
    fixture.componentRef.setInput('profiles', mockProfiles);
    fixture.componentRef.setInput('selectedProfileId', 'dev');
    fixture.detectChanges();

    const spy = vi.fn();
    component.profileSelected.subscribe(spy);

    await harness.selectOptionByText('Custom');

    expect(spy).toHaveBeenCalledWith(null);
  });

  it('disables selector and presents tooltip when profiles map is empty', async () => {
    fixture.componentRef.setInput('profiles', {});
    fixture.detectChanges();

    expect(await harness.isDisabled()).toBe(true);
    expect(component.isEmpty()).toBe(true);
    expect(component.isDisabled()).toBe(true);
    expect(component.tooltipMessage()).toBe('No profiles available');
  });

  it('computes profileOptions correctly based on input profiles', () => {
    fixture.componentRef.setInput('profiles', mockProfiles);
    fixture.detectChanges();

    expect(component.profileOptions()).toEqual([
      {id: 'dev', displayName: 'Development Environment'},
      {id: 'prod', displayName: 'prod'},
    ]);
  });

  it('computes tooltipMessage correctly when empty vs profiles present', () => {
    fixture.componentRef.setInput('profiles', {});
    fixture.detectChanges();
    expect(component.tooltipMessage()).toBe('No profiles available');

    fixture.componentRef.setInput('profiles', mockProfiles);
    fixture.detectChanges();
    expect(component.tooltipMessage()).toBe('');
  });

  it('sets tabindex and aria-label accessibility attributes on wrapper div when disabled due to empty profiles', () => {
    fixture.componentRef.setInput('profiles', {});
    fixture.detectChanges();

    const containerEl = fixture.nativeElement.querySelector('.profile-selector-container');
    expect(containerEl.getAttribute('tabindex')).toBe('0');
    expect(containerEl.getAttribute('aria-label')).toBe('No profiles available');
  });

  it('returns empty profileOptions array when profiles input is an array', () => {
    fixture.componentRef.setInput('profiles', ['invalid', 'array'] as unknown as Record<
      string,
      ProfileConfig
    >);
    fixture.detectChanges();

    expect(component.profileOptions()).toEqual([]);
  });

  it('computes isEmpty as true and disables component when profiles input is an array', () => {
    fixture.componentRef.setInput('profiles', ['invalid', 'array'] as unknown as Record<
      string,
      ProfileConfig
    >);
    fixture.detectChanges();

    expect(component.isEmpty()).toBe(true);
    expect(component.isDisabled()).toBe(true);
  });
});
