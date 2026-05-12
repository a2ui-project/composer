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
import {SettingsComponent} from './settings.component';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {StartupResolutionService} from '../shell/startup-resolution.service';
import {describe, it, expect, beforeEach, vi} from 'vitest';

describe('SettingsComponent Task 2.3', () => {
  let mockStartupResolutionService: {
    getResolvedRendererUrl: ReturnType<typeof vi.fn>;
    isThirdPartyEnvironment: ReturnType<typeof vi.fn>;
    isContextLocked: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    mockStartupResolutionService = {
      getResolvedRendererUrl: vi.fn().mockReturnValue('http://resolved-url.com'),
      isThirdPartyEnvironment: vi.fn().mockReturnValue(false),
      isContextLocked: vi.fn().mockReturnValue(false),
    };
  });

  async function setupComponent() {
    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [
        provideNoopAnimations(),
        {provide: StartupResolutionService, useValue: mockStartupResolutionService},
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SettingsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return {fixture, component};
  }

  it('initializes form controls cleanly in 1P mode without requiring apiKey', async () => {
    mockStartupResolutionService.isThirdPartyEnvironment.mockReturnValue(false);
    const {component} = await setupComponent();

    expect(component.isThirdParty()).toBe(false);
    expect(component.settingsForm.controls.rendererUrl.value).toBe('http://resolved-url.com');

    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
    vi.spyOn(component, 'reloadWindow').mockImplementation(() => {});

    component.settingsForm.patchValue({rendererUrl: 'http://new-url.com'});
    component.saveSettings();

    expect(removeItemSpy).toHaveBeenCalledWith('a2ui_composer_api_key');
  });

  it('enforces apiKey requirement in 3P mode and rejects empty whitespace keys', async () => {
    mockStartupResolutionService.isThirdPartyEnvironment.mockReturnValue(true);
    const {component} = await setupComponent();

    expect(component.isThirdParty()).toBe(true);
    expect(component.settingsForm.controls.apiKey.errors?.['required']).toBeTruthy();

    component.settingsForm.patchValue({
      rendererUrl: 'http://new-url.com',
      apiKey: '   ',
    });
    expect(component.settingsForm.controls.apiKey.errors?.['pattern']).toBeTruthy();
    expect(component.settingsForm.invalid).toBe(true);
  });

  it('persists valid configurations securely in 3P environments', async () => {
    mockStartupResolutionService.isThirdPartyEnvironment.mockReturnValue(true);
    const {component} = await setupComponent();

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const reloadSpy = vi.spyOn(component, 'reloadWindow').mockImplementation(() => {});

    component.settingsForm.patchValue({
      rendererUrl: 'http://new-url.com',
      apiKey: 'AIzaSyTestKey',
    });
    expect(component.settingsForm.valid).toBe(true);

    component.saveSettings();

    expect(setItemSpy).toHaveBeenCalledWith('a2ui_composer_renderer_url', 'http://new-url.com');
    expect(setItemSpy).toHaveBeenCalledWith('a2ui_composer_api_key', 'AIzaSyTestKey');
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('disables rendererUrl form control and displays lock warning when context is locked', async () => {
    mockStartupResolutionService.isContextLocked.mockReturnValue(true);
    const {fixture, component} = await setupComponent();

    expect(component.isLocked()).toBe(true);
    expect(component.settingsForm.controls.rendererUrl.disabled).toBe(true);

    const lockedNotice = fixture.nativeElement.querySelector('.locked-notice');
    expect(lockedNotice).toBeTruthy();
    expect(lockedNotice.textContent).toContain('locked by enterprise policy');
  });

  it('displays static connection status badges and overlay logs preview placeholders', async () => {
    const {fixture} = await setupComponent();
    const statusCard = fixture.nativeElement.querySelector('.status-card');
    expect(statusCard).toBeTruthy();

    const badges = statusCard.querySelectorAll('.status-badge');
    expect(badges.length).toBeGreaterThan(0);
    expect(statusCard.textContent).toContain('Bridge: Disconnected');
    expect(statusCard.textContent).toContain('Deferred to Phase 5');
  });
});
