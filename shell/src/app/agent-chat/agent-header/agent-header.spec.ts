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
import {A2aAgentHeader} from './agent-header';
import {A2aAgentHeaderHarness} from './test/agent-header.harness';

describe('A2aAgentHeader', () => {
  let fixture: ComponentFixture<A2aAgentHeader>;
  let harness: A2aAgentHeaderHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [A2aAgentHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(A2aAgentHeader);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, A2aAgentHeaderHarness);
  });

  it('renders default agent header info', async () => {
    expect(await harness.getTitleText()).toBe('Agent');
    expect(await harness.getEndpointText()).toBe('Endpoint not configured');
    expect(await harness.getVersionText()).toBeNull();
    expect(await harness.getSessionText()).toBeNull();
  });

  it('displays configured agent info and active session', async () => {
    fixture.componentRef.setInput('agentInfo', {
      name: 'Custom Agent',
      version: 'v2.1',
      endpoint: 'http://localhost:8080/agent',
      iconUrl: 'http://example.com/icon.svg',
    });
    fixture.componentRef.setInput('sessionId', 'session-12345');
    fixture.detectChanges();

    expect(await harness.getTitleText()).toBe('Custom Agent');
    expect(await harness.getVersionText()).toBe('v2.1');
    expect(await harness.getEndpointText()).toBe('http://localhost:8080/agent');
    expect(await harness.getSessionText()).toContain('Session: session-12345');
  });

  it('emits event when inspector toggle button is clicked', async () => {
    const spy = vi.spyOn(fixture.componentInstance.toggleInspector, 'emit');
    await harness.clickInspector();
    expect(spy).toHaveBeenCalled();
  });

  it('emits event when settings button is clicked', async () => {
    const spy = vi.spyOn(fixture.componentInstance.openSettings, 'emit');
    await harness.clickSettings();
    expect(spy).toHaveBeenCalled();
  });

  it('emits event when reset session button is clicked', async () => {
    const spy = vi.spyOn(fixture.componentInstance.resetSession, 'emit');
    await harness.clickReset();
    expect(spy).toHaveBeenCalled();
  });

  it('falls back to default icon url on image loading error', () => {
    const img = fixture.nativeElement.querySelector('.avatar-image') as HTMLImageElement;
    img.src = 'https://invalid-url.broken/avatar.png';
    img.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(img.src).toContain('fonts.gstatic.com');
  });
});
