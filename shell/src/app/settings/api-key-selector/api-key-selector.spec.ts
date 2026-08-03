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
import {ApiKeySelectorComponent} from './api-key-selector';
import {ApiKeySelectorHarness, AddApiKeyDialogHarness} from './test/api-key-selector.harness';
import {SettingsService, ApiKeyOption} from '../settings-service/settings.service';
import {MatDialogHarness} from '@angular/material/dialog/testing';
import {MatButtonHarness} from '@angular/material/button/testing';
import {MatInputHarness} from '@angular/material/input/testing';
import {MatTooltipHarness} from '@angular/material/tooltip/testing';
import {describe, beforeEach, it, expect, vi} from 'vitest';

describe('ApiKeySelectorComponent & AddApiKeyDialogComponent', () => {
  let fixture: ComponentFixture<ApiKeySelectorComponent>;
  let component: ApiKeySelectorComponent;
  let harness: ApiKeySelectorHarness;
  let currentApiKeys: ApiKeyOption[];
  let mockSettingsService: {
    getAvailableApiKeys: ReturnType<typeof vi.fn>;
    saveCustomApiKey: ReturnType<typeof vi.fn>;
    deleteCustomApiKey: ReturnType<typeof vi.fn>;
  };

  const sampleApiKeys: ApiKeyOption[] = [
    {
      id: 'default',
      name: 'Default Static Key',
      key: 'static-secret-1234',
      readOnly: true,
    },
    {
      id: 'custom-1',
      name: 'Custom Local Key',
      key: 'custom-secret-5678',
      readOnly: false,
    },
  ];

  beforeEach(async () => {
    currentApiKeys = [...sampleApiKeys];
    mockSettingsService = {
      getAvailableApiKeys: vi.fn().mockImplementation(async () => [...currentApiKeys]),
      saveCustomApiKey: vi.fn().mockResolvedValue(undefined),
      deleteCustomApiKey: vi.fn().mockImplementation(async (id: string) => {
        currentApiKeys = currentApiKeys.filter(k => k.id !== id);
      }),
    };

    await TestBed.configureTestingModule({
      imports: [ApiKeySelectorComponent],
      providers: [
        provideNoopAnimations(),
        {provide: SettingsService, useValue: mockSettingsService},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ApiKeySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, ApiKeySelectorHarness);
  });

  it('renders a <mat-select> displaying all static API keys and custom keys from SettingsService.getAvailableApiKeys()', async () => {
    const optionTexts = await harness.getOptionsText();
    expect(mockSettingsService.getAvailableApiKeys).toHaveBeenCalled();
    expect(optionTexts).toEqual(['Default Static Key', 'Custom Local Key']);
  });

  it('renders an icon button with <mat-icon>add</mat-icon> next to <mat-select>', async () => {
    const addButton = await harness.getAddButton();
    expect(addButton).toBeTruthy();
    expect(await addButton.getText()).toBe('add_circle');
  });

  it('opens AddApiKeyDialogComponent when + button is clicked, and upon confirmation with valid name and apiKey, calls saveCustomApiKey and emits apiKeySelected with new key ID', async () => {
    const emitSpy = vi.fn();
    component.apiKeySelected.subscribe(emitSpy);

    await harness.clickAddButton();

    const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const dialogs = await rootLoader.getAllHarnesses(MatDialogHarness);
    expect(dialogs.length).toBe(1);

    const inputs = await rootLoader.getAllHarnesses(MatInputHarness);
    expect(inputs.length).toBe(2);

    await inputs[0].setValue('My New Custom Key');
    await inputs[1].setValue('AIzaSyNewCustomKey');

    const confirmButton = await rootLoader.getHarness(MatButtonHarness.with({text: 'Add'}));
    await confirmButton.click();
    await fixture.whenStable();

    expect(mockSettingsService.saveCustomApiKey).toHaveBeenCalledWith(
      expect.stringMatching(/^custom-/),
      'My New Custom Key',
      'AIzaSyNewCustomKey',
    );
    expect(emitSpy).toHaveBeenCalledWith(expect.stringMatching(/^custom-/));

    const openDialogsAfter = await rootLoader.getAllHarnesses(MatDialogHarness);
    expect(openDialogsAfter.length).toBe(0);
  });

  it('does not save custom API key or close dialog when confirmation is clicked with invalid fields', async () => {
    await harness.clickAddButton();

    const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const confirmButton = await rootLoader.getHarness(MatButtonHarness.with({text: 'Add'}));
    await confirmButton.click();
    await fixture.whenStable();

    expect(mockSettingsService.saveCustomApiKey).not.toHaveBeenCalled();
    const openDialogs = await rootLoader.getAllHarnesses(MatDialogHarness);
    expect(openDialogs.length).toBe(1);
  });

  it('displays error message in AddApiKeyDialogComponent when saveCustomApiKey throws an error', async () => {
    mockSettingsService.saveCustomApiKey.mockRejectedValue(
      new Error('Collision with existing static API key'),
    );

    await harness.clickAddButton();
    const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const inputs = await rootLoader.getAllHarnesses(MatInputHarness);
    await inputs[0].setValue('Colliding Name');
    await inputs[1].setValue('AIzaSy1234');

    const confirmButton = await rootLoader.getHarness(MatButtonHarness.with({text: 'Add'}));
    await confirmButton.click();
    await fixture.whenStable();

    expect(mockSettingsService.saveCustomApiKey).toHaveBeenCalled();
    const openDialogs = await rootLoader.getAllHarnesses(MatDialogHarness);
    expect(openDialogs.length).toBe(1);

    const dialogHarness = await rootLoader.getHarness(AddApiKeyDialogHarness);
    expect(await dialogHarness.getErrorMessageText()).toBe(
      'Collision with existing static API key',
    );
    expect(await dialogHarness.getErrorMessageRole()).toBe('alert');
  });

  it('renders a disabled delete button with tooltip for static API keys and an enabled delete button for custom API keys', async () => {
    const staticDeleteBtn = await harness.getDeleteButtonForOption('Default Static Key');
    expect(staticDeleteBtn).not.toBeNull();
    expect(await staticDeleteBtn!.isDisabled()).toBe(true);
    const staticHost = await staticDeleteBtn!.host();
    expect(await staticHost.getAttribute('aria-label')).toBe('Delete Default Static Key');

    const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const staticTooltip = await rootLoader.getHarness(
      MatTooltipHarness.with({
        selector: '.delete-api-key-button[aria-label="Delete Default Static Key"]',
      }),
    );
    await staticTooltip.show();
    expect(await staticTooltip.getTooltipText()).toBe(
      'Static configuration items cannot be deleted',
    );
    await staticTooltip.hide();

    const customDeleteBtn = await harness.getDeleteButtonForOption('Custom Local Key');
    expect(customDeleteBtn).not.toBeNull();
    expect(await customDeleteBtn!.isDisabled()).toBe(false);
    const customHost = await customDeleteBtn!.host();
    expect(await customHost.getAttribute('aria-label')).toBe('Delete Custom Local Key');

    const customTooltip = await rootLoader.getHarness(
      MatTooltipHarness.with({
        selector: '.delete-api-key-button[aria-label="Delete Custom Local Key"]',
      }),
    );
    await customTooltip.show();
    expect(await customTooltip.getTooltipText()).toBe('Delete API key');
    await customTooltip.hide();
  });

  it('renders a disabled edit button with tooltip for static API keys and an enabled edit button for custom API keys', async () => {
    const staticEditBtn = await harness.getEditButtonForOption('Default Static Key');
    expect(staticEditBtn).not.toBeNull();
    expect(await staticEditBtn!.isDisabled()).toBe(true);
    const staticHost = await staticEditBtn!.host();
    expect(await staticHost.getAttribute('aria-label')).toBe('Edit Default Static Key');

    const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const staticTooltip = await rootLoader.getHarness(
      MatTooltipHarness.with({
        selector: '.edit-api-key-button[aria-label="Edit Default Static Key"]',
      }),
    );
    await staticTooltip.show();
    expect(await staticTooltip.getTooltipText()).toBe(
      'Static configuration items cannot be edited',
    );
    await staticTooltip.hide();

    const customEditBtn = await harness.getEditButtonForOption('Custom Local Key');
    expect(customEditBtn).not.toBeNull();
    expect(await customEditBtn!.isDisabled()).toBe(false);
    const customHost = await customEditBtn!.host();
    expect(await customHost.getAttribute('aria-label')).toBe('Edit Custom Local Key');

    const customTooltip = await rootLoader.getHarness(
      MatTooltipHarness.with({
        selector: '.edit-api-key-button[aria-label="Edit Custom Local Key"]',
      }),
    );
    await customTooltip.show();
    expect(await customTooltip.getTooltipText()).toBe('Edit API key');
    await customTooltip.hide();
  });

  it('clicking inline edit opens AddApiKeyDialogComponent pre-populated with current values and updates custom API key upon saving', async () => {
    fixture.componentRef.setInput('selectedApiKeyId', 'custom-1');
    fixture.detectChanges();

    const emitSpy = vi.fn();
    component.apiKeySelected.subscribe(emitSpy);

    const customEditBtn = await harness.getEditButtonForOption('Custom Local Key');
    expect(customEditBtn).not.toBeNull();
    await customEditBtn!.click();

    const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const dialogs = await rootLoader.getAllHarnesses(MatDialogHarness);
    expect(dialogs.length).toBe(1);

    const inputs = await rootLoader.getAllHarnesses(MatInputHarness);
    expect(inputs.length).toBe(2);
    expect(await inputs[0].getValue()).toBe('Custom Local Key');
    expect(await inputs[1].getValue()).toBe('custom-secret-5678');

    await inputs[0].setValue('Updated Local Key');
    await inputs[1].setValue('updated-secret-9999');

    const saveButton = await rootLoader.getHarness(MatButtonHarness.with({text: 'Save'}));
    await saveButton.click();
    await fixture.whenStable();

    expect(mockSettingsService.saveCustomApiKey).toHaveBeenCalledWith(
      'custom-1',
      'Updated Local Key',
      'updated-secret-9999',
    );
    expect(emitSpy).toHaveBeenCalledWith('custom-1');
  });

  it('onEditApiKey stops event propagation and prevents default action', () => {
    const mockEvent = {
      stopPropagation: vi.fn(),
      preventDefault: vi.fn(),
    } as unknown as Event;

    component.onEditApiKey(mockEvent, sampleApiKeys[1]);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  it('does not delete static API key or emit selection when onDeleteApiKey is invoked for static key ID', async () => {
    const emitSpy = vi.fn();
    component.apiKeySelected.subscribe(emitSpy);

    const mockEvent = {
      stopPropagation: vi.fn(),
      preventDefault: vi.fn(),
    } as unknown as Event;

    await component.onDeleteApiKey(mockEvent, 'default');

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(mockSettingsService.deleteCustomApiKey).not.toHaveBeenCalled();
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('clicking inline delete stops propagation, calls SettingsService.deleteCustomApiKey(id), and if the deleted item was currently selected, emits apiKeySelected with fallback ID null', async () => {
    fixture.componentRef.setInput('selectedApiKeyId', 'custom-1');
    fixture.detectChanges();

    const emitSpy = vi.fn();
    component.apiKeySelected.subscribe(emitSpy);

    const customDeleteBtn = await harness.getDeleteButtonForOption('Custom Local Key');
    expect(customDeleteBtn).not.toBeNull();

    await customDeleteBtn!.click();
    await fixture.whenStable();

    expect(mockSettingsService.deleteCustomApiKey).toHaveBeenCalledWith('custom-1');
    expect(emitSpy).toHaveBeenCalledWith(null);

    const optionsAfter = await harness.getOptionsText();
    expect(optionsAfter).toEqual(['Default Static Key']);
  });

  it('clicking inline delete stops propagation and calls deleteCustomApiKey(id) without emitting fallback ID when deleting a non-selected API key', async () => {
    fixture.componentRef.setInput('selectedApiKeyId', 'default');
    fixture.detectChanges();

    const emitSpy = vi.fn();
    component.apiKeySelected.subscribe(emitSpy);

    const customDeleteBtn = await harness.getDeleteButtonForOption('Custom Local Key');
    expect(customDeleteBtn).not.toBeNull();

    await customDeleteBtn!.click();
    await fixture.whenStable();

    expect(mockSettingsService.deleteCustomApiKey).toHaveBeenCalledWith('custom-1');
    expect(emitSpy).not.toHaveBeenCalled();

    const optionsAfter = await harness.getOptionsText();
    expect(optionsAfter).toEqual(['Default Static Key']);
  });

  it('onDeleteApiKey stops event propagation', async () => {
    const mockEvent = {
      stopPropagation: vi.fn(),
      preventDefault: vi.fn(),
    } as unknown as Event;

    await component.onDeleteApiKey(mockEvent, 'custom-1');

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockSettingsService.deleteCustomApiKey).toHaveBeenCalledWith('custom-1');
  });

  it('onAddApiKey stops event propagation and prevents default action', () => {
    const mockEvent = {
      stopPropagation: vi.fn(),
      preventDefault: vi.fn(),
    } as unknown as Event;

    component.onAddApiKey(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  it('emits apiKeySelected when an option is selected from <mat-select>', async () => {
    const emitSpy = vi.fn();
    component.apiKeySelected.subscribe(emitSpy);

    await harness.selectOptionByText('Custom Local Key');

    expect(emitSpy).toHaveBeenCalledWith('custom-1');
  });

  it('toggles hide/show API key visibility in AddApiKeyDialogComponent', async () => {
    await harness.clickAddButton();

    const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const toggleButton = await rootLoader.getHarness(
      MatButtonHarness.with({selector: '.api-key-toggle-btn'}),
    );
    expect(toggleButton).toBeTruthy();

    await toggleButton.click();
    await fixture.whenStable();

    const dialogs = await rootLoader.getAllHarnesses(MatDialogHarness);
    expect(dialogs.length).toBe(1);
  });

  it('displays placeholder "Paste your API key here" on the API key input in AddApiKeyDialogComponent', async () => {
    await harness.clickAddButton();

    const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const inputs = await rootLoader.getAllHarnesses(MatInputHarness);
    expect(inputs.length).toBe(2);
    expect(await (await inputs[1].host()).getAttribute('placeholder')).toBe(
      'Paste your API key here',
    );
  });

  it('displays only the name of the selected API key in the select trigger box', async () => {
    fixture.componentRef.setInput('selectedApiKeyId', 'default');
    fixture.detectChanges();

    const triggerText = await harness.getValueText();
    expect(triggerText).toBe('Default Static Key');
  });

  it('displays a disabled empty-state option when apiKeys list is empty', async () => {
    mockSettingsService.getAvailableApiKeys.mockResolvedValue([]);
    await component.refreshApiKeys();
    fixture.detectChanges();

    const optionTexts = await harness.getOptionsText();
    expect(optionTexts).toEqual(['No items available — click + to add']);
  });

  it('disables the select dropdown and add button when disabled input is true', async () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect(await harness.isDisabled()).toBe(true);
    const addBtn = await harness.getAddButton();
    expect(await addBtn.isDisabled()).toBe(true);
  });
});
