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
import {AbstractControl} from '@angular/forms';
import {RendererSelectorComponent} from './renderer-selector';
import {RendererSelectorHarness, AddRendererDialogHarness} from './test/renderer-selector.harness';
import {urlValidator} from './add-renderer-dialog/add-renderer-dialog';
import {SettingsService, RendererOption} from '../settings-service/settings.service';
import {MatDialogHarness} from '@angular/material/dialog/testing';
import {MatButtonHarness} from '@angular/material/button/testing';
import {MatInputHarness} from '@angular/material/input/testing';
import {MatTooltipHarness} from '@angular/material/tooltip/testing';
import {describe, beforeEach, it, expect, vi} from 'vitest';

describe('RendererSelectorComponent & AddRendererDialogComponent', () => {
  let fixture: ComponentFixture<RendererSelectorComponent>;
  let component: RendererSelectorComponent;
  let harness: RendererSelectorHarness;
  let currentRenderers: RendererOption[];
  let mockSettingsService: {
    getRenderers: ReturnType<typeof vi.fn>;
    saveCustomRenderer: ReturnType<typeof vi.fn>;
    deleteCustomRenderer: ReturnType<typeof vi.fn>;
  };

  const sampleRenderers: RendererOption[] = [
    {
      id: 'default',
      name: 'Default Static Renderer',
      rendererUrl: 'http://default.example.com',
      readOnly: true,
    },
    {
      id: 'custom-1',
      name: 'Custom Local Renderer',
      rendererUrl: 'http://custom.example.com',
      readOnly: false,
    },
  ];

  beforeEach(async () => {
    currentRenderers = [...sampleRenderers];
    mockSettingsService = {
      getRenderers: vi.fn().mockImplementation(() => [...currentRenderers]),
      saveCustomRenderer: vi.fn(),
      deleteCustomRenderer: vi.fn().mockImplementation((id: string) => {
        currentRenderers = currentRenderers.filter(r => r.id !== id);
      }),
    };

    await TestBed.configureTestingModule({
      imports: [RendererSelectorComponent],
      providers: [
        provideNoopAnimations(),
        {provide: SettingsService, useValue: mockSettingsService},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RendererSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, RendererSelectorHarness);
  });

  it('renders a <mat-select> displaying all combined static and custom renderers from SettingsService.getRenderers()', async () => {
    const optionTexts = await harness.getOptionsText();
    expect(mockSettingsService.getRenderers).toHaveBeenCalled();
    expect(optionTexts).toEqual(['Default Static Renderer', 'Custom Local Renderer']);
  });

  it('renders an icon button with <mat-icon>add</mat-icon> next to <mat-select>', async () => {
    const addButton = await harness.getAddButton();
    expect(addButton).toBeTruthy();
    expect(await addButton.getText()).toBe('add_circle');
  });

  it('opens AddRendererDialogComponent when + button is clicked, and upon confirmation with valid name and rendererUrl, calls saveCustomRenderer and emits rendererSelected with new renderer ID', async () => {
    const emitSpy = vi.fn();
    component.rendererSelected.subscribe(emitSpy);

    await harness.clickAddButton();

    const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const dialogs = await rootLoader.getAllHarnesses(MatDialogHarness);
    expect(dialogs.length).toBe(1);

    const inputs = await rootLoader.getAllHarnesses(MatInputHarness);
    expect(inputs.length).toBe(2);

    await inputs[0].setValue('My New Custom Renderer');
    await inputs[1].setValue('http://localhost:9999');

    const confirmButton = await rootLoader.getHarness(MatButtonHarness.with({text: 'Add'}));
    await confirmButton.click();

    expect(mockSettingsService.saveCustomRenderer).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.stringMatching(/^custom-/),
        name: 'My New Custom Renderer',
        rendererUrl: 'http://localhost:9999',
      }),
    );
    expect(emitSpy).toHaveBeenCalledWith(expect.stringMatching(/^custom-/));

    const openDialogsAfter = await rootLoader.getAllHarnesses(MatDialogHarness);
    expect(openDialogsAfter.length).toBe(0);
  });

  it('does not save custom renderer or close dialog when confirmation is clicked with invalid fields', async () => {
    await harness.clickAddButton();

    const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const confirmButton = await rootLoader.getHarness(MatButtonHarness.with({text: 'Add'}));
    await confirmButton.click();

    expect(mockSettingsService.saveCustomRenderer).not.toHaveBeenCalled();
    const openDialogs = await rootLoader.getAllHarnesses(MatDialogHarness);
    expect(openDialogs.length).toBe(1);
  });

  it('rejects malformed or incomplete renderer URLs without a host in AddRendererDialogComponent', async () => {
    await harness.clickAddButton();

    const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const inputs = await rootLoader.getAllHarnesses(MatInputHarness);
    await inputs[0].setValue('Valid Name');
    await inputs[1].setValue('http://');

    const confirmButton = await rootLoader.getHarness(MatButtonHarness.with({text: 'Add'}));
    await confirmButton.click();

    expect(mockSettingsService.saveCustomRenderer).not.toHaveBeenCalled();
    const openDialogs = await rootLoader.getAllHarnesses(MatDialogHarness);
    expect(openDialogs.length).toBe(1);
  });

  it('displays error message in AddRendererDialogComponent when saveCustomRenderer throws an error', async () => {
    mockSettingsService.saveCustomRenderer.mockImplementation(() => {
      throw new Error('Collision with existing static renderer');
    });

    await harness.clickAddButton();
    const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const inputs = await rootLoader.getAllHarnesses(MatInputHarness);
    await inputs[0].setValue('Colliding Name');
    await inputs[1].setValue('http://localhost:3000');

    const confirmButton = await rootLoader.getHarness(MatButtonHarness.with({text: 'Add'}));
    await confirmButton.click();

    expect(mockSettingsService.saveCustomRenderer).toHaveBeenCalled();
    const openDialogs = await rootLoader.getAllHarnesses(MatDialogHarness);
    expect(openDialogs.length).toBe(1);

    const dialogHarness = await rootLoader.getHarness(AddRendererDialogHarness);
    expect(await dialogHarness.getErrorMessageText()).toBe(
      'Collision with existing static renderer',
    );
    expect(await dialogHarness.getErrorMessageRole()).toBe('alert');
  });

  it('renders a disabled delete button with tooltip for static renderers and an enabled delete button for custom renderers', async () => {
    const staticDeleteBtn = await harness.getDeleteButtonForOption('Default Static Renderer');
    expect(staticDeleteBtn).not.toBeNull();
    expect(await staticDeleteBtn!.isDisabled()).toBe(true);
    const staticHost = await staticDeleteBtn!.host();
    expect(await staticHost.getAttribute('aria-label')).toBe('Delete Default Static Renderer');

    const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const staticTooltip = await rootLoader.getHarness(
      MatTooltipHarness.with({
        selector: '.delete-renderer-button[aria-label="Delete Default Static Renderer"]',
      }),
    );
    await staticTooltip.show();
    expect(await staticTooltip.getTooltipText()).toBe(
      'Static configuration items cannot be deleted',
    );
    await staticTooltip.hide();

    const customDeleteBtn = await harness.getDeleteButtonForOption('Custom Local Renderer');
    expect(customDeleteBtn).not.toBeNull();
    expect(await customDeleteBtn!.isDisabled()).toBe(false);
    const customHost = await customDeleteBtn!.host();
    expect(await customHost.getAttribute('aria-label')).toBe('Delete Custom Local Renderer');

    const customTooltip = await rootLoader.getHarness(
      MatTooltipHarness.with({
        selector: '.delete-renderer-button[aria-label="Delete Custom Local Renderer"]',
      }),
    );
    await customTooltip.show();
    expect(await customTooltip.getTooltipText()).toBe('Delete renderer');
    await customTooltip.hide();
  });

  it('renders a disabled edit button with tooltip for static renderers and an enabled edit button for custom renderers', async () => {
    const staticEditBtn = await harness.getEditButtonForOption('Default Static Renderer');
    expect(staticEditBtn).not.toBeNull();
    expect(await staticEditBtn!.isDisabled()).toBe(true);
    const staticHost = await staticEditBtn!.host();
    expect(await staticHost.getAttribute('aria-label')).toBe('Edit Default Static Renderer');

    const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const staticTooltip = await rootLoader.getHarness(
      MatTooltipHarness.with({
        selector: '.edit-renderer-button[aria-label="Edit Default Static Renderer"]',
      }),
    );
    await staticTooltip.show();
    expect(await staticTooltip.getTooltipText()).toBe(
      'Static configuration items cannot be edited',
    );
    await staticTooltip.hide();

    const customEditBtn = await harness.getEditButtonForOption('Custom Local Renderer');
    expect(customEditBtn).not.toBeNull();
    expect(await customEditBtn!.isDisabled()).toBe(false);
    const customHost = await customEditBtn!.host();
    expect(await customHost.getAttribute('aria-label')).toBe('Edit Custom Local Renderer');

    const customTooltip = await rootLoader.getHarness(
      MatTooltipHarness.with({
        selector: '.edit-renderer-button[aria-label="Edit Custom Local Renderer"]',
      }),
    );
    await customTooltip.show();
    expect(await customTooltip.getTooltipText()).toBe('Edit renderer');
    await customTooltip.hide();
  });

  it('clicking inline edit opens AddRendererDialogComponent pre-populated with current values and updates custom renderer upon saving', async () => {
    fixture.componentRef.setInput('selectedRendererId', 'custom-1');
    fixture.detectChanges();

    const emitSpy = vi.fn();
    component.rendererSelected.subscribe(emitSpy);

    const customEditBtn = await harness.getEditButtonForOption('Custom Local Renderer');
    expect(customEditBtn).not.toBeNull();
    await customEditBtn!.click();

    const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const dialogs = await rootLoader.getAllHarnesses(MatDialogHarness);
    expect(dialogs.length).toBe(1);

    const inputs = await rootLoader.getAllHarnesses(MatInputHarness);
    expect(inputs.length).toBe(2);
    expect(await inputs[0].getValue()).toBe('Custom Local Renderer');
    expect(await inputs[1].getValue()).toBe('http://custom.example.com');

    await inputs[0].setValue('Updated Local Renderer');
    await inputs[1].setValue('http://updated.example.com');

    const saveButton = await rootLoader.getHarness(MatButtonHarness.with({text: 'Save'}));
    await saveButton.click();

    expect(mockSettingsService.saveCustomRenderer).toHaveBeenCalledWith({
      id: 'custom-1',
      name: 'Updated Local Renderer',
      rendererUrl: 'http://updated.example.com',
    });
    expect(emitSpy).toHaveBeenCalledWith('custom-1');
  });

  it('onEditRenderer stops event propagation and prevents default action', () => {
    const mockEvent = {
      stopPropagation: vi.fn(),
      preventDefault: vi.fn(),
    } as unknown as Event;

    component.onEditRenderer(mockEvent, sampleRenderers[1]);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  it('does not delete static renderer or emit selection when onDeleteRenderer is invoked for static renderer ID', () => {
    const emitSpy = vi.fn();
    component.rendererSelected.subscribe(emitSpy);

    const mockEvent = {
      stopPropagation: vi.fn(),
      preventDefault: vi.fn(),
    } as unknown as Event;

    component.onDeleteRenderer(mockEvent, 'default');

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(mockSettingsService.deleteCustomRenderer).not.toHaveBeenCalled();
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('clicking inline delete stops propagation, calls SettingsService.deleteCustomRenderer(id), and if the deleted item was currently selected, emits rendererSelected with fallback ID "default"', async () => {
    fixture.componentRef.setInput('selectedRendererId', 'custom-1');
    fixture.detectChanges();

    const emitSpy = vi.fn();
    component.rendererSelected.subscribe(emitSpy);

    const customDeleteBtn = await harness.getDeleteButtonForOption('Custom Local Renderer');
    expect(customDeleteBtn).not.toBeNull();

    await customDeleteBtn!.click();

    expect(mockSettingsService.deleteCustomRenderer).toHaveBeenCalledWith('custom-1');
    expect(emitSpy).toHaveBeenCalledWith('default');

    const optionsAfter = await harness.getOptionsText();
    expect(optionsAfter).toEqual(['Default Static Renderer']);
  });

  it('clicking inline delete stops propagation and calls deleteCustomRenderer(id) without emitting fallback ID when deleting a non-selected renderer', async () => {
    fixture.componentRef.setInput('selectedRendererId', 'default');
    fixture.detectChanges();

    const emitSpy = vi.fn();
    component.rendererSelected.subscribe(emitSpy);

    const customDeleteBtn = await harness.getDeleteButtonForOption('Custom Local Renderer');
    expect(customDeleteBtn).not.toBeNull();

    await customDeleteBtn!.click();

    expect(mockSettingsService.deleteCustomRenderer).toHaveBeenCalledWith('custom-1');
    expect(emitSpy).not.toHaveBeenCalled();

    const optionsAfter = await harness.getOptionsText();
    expect(optionsAfter).toEqual(['Default Static Renderer']);
  });

  it('onDeleteRenderer stops event propagation', () => {
    const mockEvent = {
      stopPropagation: vi.fn(),
      preventDefault: vi.fn(),
    } as unknown as Event;

    component.onDeleteRenderer(mockEvent, 'custom-1');

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(mockSettingsService.deleteCustomRenderer).toHaveBeenCalledWith('custom-1');
  });

  it('onAddRenderer stops event propagation and prevents default action', () => {
    const mockEvent = {
      stopPropagation: vi.fn(),
      preventDefault: vi.fn(),
    } as unknown as Event;

    component.onAddRenderer(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  it('emits rendererSelected when an option is selected from <mat-select>', async () => {
    const emitSpy = vi.fn();
    component.rendererSelected.subscribe(emitSpy);

    await harness.selectOptionByText('Custom Local Renderer');

    expect(emitSpy).toHaveBeenCalledWith('custom-1');
  });

  it('displays two-line layout with renderer URL subtext for each option in dropdown', async () => {
    const subtexts = await harness.getOptionSubtexts();
    expect(subtexts).toEqual(['http://default.example.com', 'http://custom.example.com']);
  });

  it('displays the name and renderer URL subtext of the selected renderer in the select trigger box', async () => {
    const triggerText = await harness.getValueText();
    expect(triggerText).toContain('Default Static Renderer');
    expect(triggerText).toContain('http://default.example.com');
  });

  it('displays a disabled empty-state option when renderers list is empty', async () => {
    mockSettingsService.getRenderers.mockReturnValue([]);
    component.refreshItems();
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

describe('urlValidator', () => {
  it('returns null for valid http/https URLs with a host', () => {
    expect(urlValidator({value: 'http://localhost:3000'} as AbstractControl<string>)).toBeNull();
    expect(urlValidator({value: 'https://example.com/path'} as AbstractControl<string>)).toBeNull();
  });

  it('trims leading and trailing whitespace when validating URLs', () => {
    expect(
      urlValidator({value: '  http://localhost:3000  '} as AbstractControl<string>),
    ).toBeNull();
  });

  it('returns invalidUrl error for malformed or incomplete URLs without a host', () => {
    expect(urlValidator({value: 'http://'} as AbstractControl<string>)).toEqual({
      invalidUrl: true,
    });
    expect(urlValidator({value: 'http:/'} as AbstractControl<string>)).toEqual({
      invalidUrl: true,
    });
    expect(urlValidator({value: 'ftp://localhost'} as AbstractControl<string>)).toEqual({
      invalidUrl: true,
    });
    expect(urlValidator({value: 'not-a-url'} as AbstractControl<string>)).toEqual({
      invalidUrl: true,
    });
  });

  it('returns null for empty string (handled by Validators.required)', () => {
    expect(urlValidator({value: ''} as AbstractControl<string>)).toBeNull();
  });
});
