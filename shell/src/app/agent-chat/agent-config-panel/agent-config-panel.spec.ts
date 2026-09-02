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
import {A2aBackendMode} from '../../settings/app-config-provider/app-config-provider';
import {A2A_BACKEND_OPTIONS} from '../../chat/a2a/a2a-transport.token';
import {AgentConfigPanel} from './agent-config-panel';
import {AgentConfigPanelHarness} from './test/agent-config-panel.harness';

describe('AgentConfigPanel', () => {
  let fixture: ComponentFixture<AgentConfigPanel>;
  let harness: AgentConfigPanelHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentConfigPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(AgentConfigPanel);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, AgentConfigPanelHarness);
  });

  it('initializes form with inputs', async () => {
    fixture.componentRef.setInput('initialEndpoint', 'http://localhost:8000');
    fixture.componentRef.setInput('initialTenantId', 'tenant_123');
    fixture.componentRef.setInput('initialBackendMode', A2aBackendMode.HTTP_JSONRPC);
    fixture.componentInstance.ngOnInit();
    fixture.detectChanges();

    expect(await harness.getEndpoint()).toBe('http://localhost:8000');
    expect(await harness.getTenantId()).toBe('tenant_123');
  });

  it('validates required endpoint field', async () => {
    await harness.setEndpoint('');
    expect(await harness.isSaveDisabled()).toBe(true);

    await harness.setEndpoint('http://localhost:8080');
    expect(await harness.isSaveDisabled()).toBe(false);
  });

  it('emits saveAndConnect with form data', async () => {
    const spy = vi.spyOn(fixture.componentInstance.saveAndConnect, 'emit');
    await harness.setEndpoint('http://localhost:9000');
    await harness.setTenantId('beta');
    await harness.clickSave();

    expect(spy).toHaveBeenCalledWith({
      endpoint: 'http://localhost:9000',
      tenantId: 'beta',
      backendMode: A2aBackendMode.HTTP_JSONRPC,
    });
  });

  it('emits dismissPanel and clearConfig events', async () => {
    const cancelSpy = vi.spyOn(fixture.componentInstance.dismissPanel, 'emit');
    const clearSpy = vi.spyOn(fixture.componentInstance.clearConfig, 'emit');

    await harness.clickCancel();
    expect(cancelSpy).toHaveBeenCalled();

    await harness.clickClear();
    expect(clearSpy).toHaveBeenCalled();
    expect(await harness.getEndpoint()).toBe('');
  });

  it('renders connection error if provided', async () => {
    fixture.componentRef.setInput('connectionError', 'Unable to reach agent at URL');
    fixture.detectChanges();

    expect(await harness.getErrorMessage()).toContain('Unable to reach agent at URL');
  });

  it('marks controls as touched when save is triggered on invalid form', () => {
    const markAllSpy = vi.spyOn(fixture.componentInstance['form'], 'markAllAsTouched');
    fixture.componentInstance['form'].controls['endpoint'].setValue('');
    fixture.componentInstance['saveAndConnectAgent']();

    expect(markAllSpy).toHaveBeenCalled();
  });

  it('handles isConnecting state by showing spinner and disabling buttons', () => {
    fixture.componentRef.setInput('isConnecting', true);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.btn-spinner')).toBeTruthy();
    expect(el.querySelector('.save-btn')?.textContent).toContain('Connecting...');
    expect(el.querySelector('.clear-address-btn')?.hasAttribute('disabled')).toBe(true);
    expect(el.querySelector('.cancel-btn')?.hasAttribute('disabled')).toBe(true);
  });

  it('hides cancel button when canCancel is false', () => {
    fixture.componentRef.setInput('canCancel', false);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.cancel-btn')).toBeNull();
  });

  it('trims whitespace and handles null/undefined values on save', () => {
    const spy = vi.spyOn(fixture.componentInstance.saveAndConnect, 'emit');
    fixture.componentInstance['form'].setValue({
      endpoint: '  http://localhost:8088  ',
      tenantId: null,
      backendMode: A2aBackendMode.HTTP_JSONRPC,
    });
    fixture.componentInstance['saveAndConnectAgent']();

    expect(spy).toHaveBeenCalledWith({
      endpoint: 'http://localhost:8088',
      tenantId: '',
      backendMode: A2aBackendMode.HTTP_JSONRPC,
    });
  });

  it('normalizes raw host endpoint without protocol on save', () => {
    const spy = vi.spyOn(fixture.componentInstance.saveAndConnect, 'emit');
    fixture.componentInstance['form'].setValue({
      endpoint: '  localhost:8080  ',
      tenantId: 'tenant-1',
      backendMode: A2aBackendMode.HTTP_JSONRPC,
    });
    fixture.componentInstance['saveAndConnectAgent']();

    expect(spy).toHaveBeenCalledWith({
      endpoint: 'http://localhost:8080',
      tenantId: 'tenant-1',
      backendMode: A2aBackendMode.HTTP_JSONRPC,
    });
  });

  it('validates invalid non-HTTP URL schemes', async () => {
    await harness.setEndpoint('javascript:alert(1)');
    expect(await harness.isSaveDisabled()).toBe(true);

    await harness.setEndpoint('ftp://server.example/a2a');
    expect(await harness.isSaveDisabled()).toBe(true);

    await harness.setEndpoint('https://my-agent.example.com');
    expect(await harness.isSaveDisabled()).toBe(false);
  });

  it('dismisses panel on Escape key when canCancel is true', () => {
    const dismissSpy = vi.spyOn(fixture.componentInstance.dismissPanel, 'emit');
    fixture.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
    expect(dismissSpy).toHaveBeenCalled();
  });

  it('does not dismiss panel on Escape key when canCancel is false or isConnecting is true', () => {
    const dismissSpy = vi.spyOn(fixture.componentInstance.dismissPanel, 'emit');
    fixture.componentRef.setInput('canCancel', false);
    fixture.detectChanges();

    fixture.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
    expect(dismissSpy).not.toHaveBeenCalled();
  });

  it('renders backend select dropdown when multiple backend options are provided via DI', async () => {
    const mockOptions = [
      {id: A2aBackendMode.HTTP_JSONRPC, label: 'JSON-RPC (Port 8088)'},
      {id: A2aBackendMode.REST, label: 'REST SSE (Port 8080)'},
    ];

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [AgentConfigPanel],
      providers: [{provide: A2A_BACKEND_OPTIONS, useValue: mockOptions}],
    }).compileComponents();

    const diFixture = TestBed.createComponent(AgentConfigPanel);
    diFixture.detectChanges();

    const el = diFixture.nativeElement as HTMLElement;
    expect(el.querySelector('mat-select')).toBeTruthy();
    expect(diFixture.componentInstance['form'].value.backendMode).toBe(A2aBackendMode.HTTP_JSONRPC);

    // Test onClear resets backendMode to first option
    diFixture.componentInstance['clearConfiguration']();
    expect(diFixture.componentInstance['form'].value.backendMode).toBe(A2aBackendMode.HTTP_JSONRPC);
  });
});
