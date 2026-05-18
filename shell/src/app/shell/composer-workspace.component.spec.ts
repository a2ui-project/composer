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
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {provideNoopAnimations} from '@angular/platform-browser/animations';

describe('ComposerWorkspaceComponent Dashboard', () => {
  let fixture: ComponentFixture<ComposerWorkspaceComponent>;
  let harness: ComposerWorkspaceHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComposerWorkspaceComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(ComposerWorkspaceComponent);
    fixture.detectChanges();
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

  it('renders debugging components inside a mat-tab-group with appropriate labels', () => {
    const textContent = fixture.nativeElement.textContent;
    expect(textContent).toContain('Data Model');
    expect(textContent).toContain('Events');
    expect(textContent).toContain('Errors');
    expect(textContent).toContain('Raw Messages');
    expect(textContent).toContain('Mock Rules');
  });

  it('toggles collapse signal and updates the .debug-section.collapsed layout class', () => {
    const component = fixture.componentInstance;
    const debugSection = fixture.nativeElement.querySelector('.debug-section');

    expect(component.isDebugCollapsed()).toBe(false);
    expect(debugSection.classList.contains('collapsed')).toBe(false);

    // Call toggleDebugCollapse()
    component.toggleDebugCollapse();
    fixture.detectChanges();

    expect(component.isDebugCollapsed()).toBe(true);
    expect(debugSection.classList.contains('collapsed')).toBe(true);

    // Toggle back
    component.toggleDebugCollapse();
    fixture.detectChanges();

    expect(component.isDebugCollapsed()).toBe(false);
    expect(debugSection.classList.contains('collapsed')).toBe(false);
  });

  it('delegates clearLogs to all queried child components when clearAllLogs is called', () => {
    const component = fixture.componentInstance;

    const rawMsgSpy = vi.spyOn(component.rawMessagesComponent()!, 'clearLogs');
    const eventsSpy = vi.spyOn(component.eventsComponent()!, 'clearLogs');
    const errorsSpy = vi.spyOn(component.errorsComponent()!, 'clearLogs');

    component.clearAllLogs();

    expect(rawMsgSpy).toHaveBeenCalled();
    expect(eventsSpy).toHaveBeenCalled();
    expect(errorsSpy).toHaveBeenCalled();
  });
});
