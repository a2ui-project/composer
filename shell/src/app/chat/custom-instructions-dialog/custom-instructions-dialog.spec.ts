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
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {CustomInstructionsDialog} from './custom-instructions-dialog';
import {CustomInstructionsDialogHarness} from './test/custom-instructions-dialog.harness';
import {CustomInstructionsState} from '../chat-prompt-factory/chat-prompt-factory.service';

describe('CustomInstructionsDialog', () => {
  let fixture: ComponentFixture<CustomInstructionsDialog>;
  let harness: CustomInstructionsDialogHarness;
  let mockDialogRef: {close: ReturnType<typeof vi.fn>};

  const createComponent = async (data: CustomInstructionsState | null) => {
    mockDialogRef = {close: vi.fn()};

    await TestBed.configureTestingModule({
      imports: [CustomInstructionsDialog, MatDialogModule],
      providers: [
        provideNoopAnimations(),
        {provide: MAT_DIALOG_DATA, useValue: data},
        {provide: MatDialogRef, useValue: mockDialogRef},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomInstructionsDialog);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      CustomInstructionsDialogHarness,
    );
  };

  describe('When no presets exist initially', () => {
    beforeEach(async () => {
      await createComponent({presets: [], activePresetId: null});
    });

    it('defaults to "+ New preset..." option with empty inputs and disabled save', async () => {
      expect(await harness.getSelectedPresetOptionText()).toBe('+ New preset...');
      expect(await harness.getPresetName()).toBe('');
      expect(await harness.getInstructions()).toBe('');
      expect(await harness.isSaveDisabled()).toBe(true);
      expect(await harness.hasDeleteButton()).toBe(false);
    });

    it('enables save button when valid name and instructions are entered, and saves new preset', async () => {
      await harness.setPresetName('Test Preset');
      await harness.setInstructions('Test instruction text');
      expect(await harness.isSaveDisabled()).toBe(false);

      await harness.clickSave();
      expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
      const savedData: CustomInstructionsState = mockDialogRef.close.mock.calls[0][0];
      expect(savedData.presets.length).toBe(1);
      expect(savedData.presets[0].name).toBe('Test Preset');
      expect(savedData.presets[0].content).toBe('Test instruction text');
      expect(savedData.presets[0].id).toBeTruthy();
      expect(savedData.activePresetId).toBe(savedData.presets[0].id);
    });

    it('keeps save disabled if name or instructions are only whitespace', async () => {
      await harness.setPresetName('   ');
      await harness.setInstructions('Some instructions');
      expect(await harness.isSaveDisabled()).toBe(true);

      await harness.setPresetName('Valid Name');
      await harness.setInstructions('   \n  ');
      expect(await harness.isSaveDisabled()).toBe(true);
    });

    it('closes dialog without data when cancel is clicked', async () => {
      await harness.clickCancel();
      expect(mockDialogRef.close).toHaveBeenCalledWith();
    });
  });

  describe('When presets exist with an active preset', () => {
    const existingState: CustomInstructionsState = {
      presets: [
        {id: 'p-1', name: 'Concise', content: 'Be concise and direct.'},
        {id: 'p-2', name: 'Verbose', content: 'Provide extensive explanations.'},
      ],
      activePresetId: 'p-1',
    };

    beforeEach(async () => {
      await createComponent(existingState);
    });

    it('defaults to the active preset and shows delete button', async () => {
      expect(await harness.getSelectedPresetOptionText()).toBe('Concise');
      expect(await harness.getPresetName()).toBe('Concise');
      expect(await harness.getInstructions()).toBe('Be concise and direct.');
      expect(await harness.hasDeleteButton()).toBe(true);
      expect(await harness.isSaveDisabled()).toBe(false);
    });

    it('overwrites the existing preset in-place when edited and saved', async () => {
      await harness.setPresetName('Concise v2');
      await harness.setInstructions('Updated concise rules.');
      await harness.clickSave();

      expect(mockDialogRef.close).toHaveBeenCalledWith({
        presets: [
          {id: 'p-1', name: 'Concise v2', content: 'Updated concise rules.'},
          {id: 'p-2', name: 'Verbose', content: 'Provide extensive explanations.'},
        ],
        activePresetId: 'p-1',
      });
    });

    it('switches between presets when dropdown selection changes', async () => {
      await harness.selectOption('Verbose');
      expect(await harness.getSelectedPresetOptionText()).toBe('Verbose');
      expect(await harness.getPresetName()).toBe('Verbose');
      expect(await harness.getInstructions()).toBe('Provide extensive explanations.');
      expect(await harness.hasDeleteButton()).toBe(true);
    });

    it('switches to "+ New preset..." and clears inputs', async () => {
      await harness.selectOption('+ New preset...');
      expect(await harness.getPresetName()).toBe('');
      expect(await harness.getInstructions()).toBe('');
      expect(await harness.hasDeleteButton()).toBe(false);
      expect(await harness.isSaveDisabled()).toBe(true);
    });

    it('deletes the selected preset and switches to None (Off)', async () => {
      await harness.clickDelete();
      expect(await harness.getSelectedPresetOptionText()).toBe('None (Off)');
      expect(await harness.hasDeleteButton()).toBe(false);
      expect(await harness.isSaveDisabled()).toBe(false);

      await harness.clickSave();
      expect(mockDialogRef.close).toHaveBeenCalledWith({
        presets: [{id: 'p-2', name: 'Verbose', content: 'Provide extensive explanations.'}],
        activePresetId: null,
      });
    });

    it('preserves edits to existing preset when switching between options before clicking save', async () => {
      await harness.setPresetName('Concise Updated');
      await harness.setInstructions('Updated concise rules.');

      // Switch away to another preset
      await harness.selectOption('Verbose');
      expect(await harness.getPresetName()).toBe('Verbose');
      expect(await harness.getInstructions()).toBe('Provide extensive explanations.');

      // Switch back to Concise Updated
      await harness.selectOption('Concise Updated');
      expect(await harness.getPresetName()).toBe('Concise Updated');
      expect(await harness.getInstructions()).toBe('Updated concise rules.');

      await harness.clickSave();
      expect(mockDialogRef.close).toHaveBeenCalledWith({
        presets: [
          {id: 'p-1', name: 'Concise Updated', content: 'Updated concise rules.'},
          {id: 'p-2', name: 'Verbose', content: 'Provide extensive explanations.'},
        ],
        activePresetId: 'p-1',
      });
    });

    it('preserves draft preset inputs when switching to an existing preset and back to "+ New preset..."', async () => {
      await harness.selectOption('+ New preset...');
      await harness.setPresetName('Draft Preset');
      await harness.setInstructions('Draft instruction body');

      // Switch to existing preset
      await harness.selectOption('Concise');
      expect(await harness.getPresetName()).toBe('Concise');

      // Switch back to "+ New preset..."
      await harness.selectOption('+ New preset...');
      expect(await harness.getPresetName()).toBe('Draft Preset');
      expect(await harness.getInstructions()).toBe('Draft instruction body');

      await harness.clickSave();
      expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
      const result: CustomInstructionsState = mockDialogRef.close.mock.calls[0][0];
      expect(result.presets.length).toBe(3);
      expect(result.presets[2].name).toBe('Draft Preset');
      expect(result.presets[2].content).toBe('Draft instruction body');
      expect(result.activePresetId).toBe(result.presets[2].id);
    });

    it('discards preset deletion when dialog is cancelled', async () => {
      await harness.clickDelete();
      expect(await harness.getSelectedPresetOptionText()).toBe('None (Off)');

      await harness.clickCancel();
      expect(mockDialogRef.close).toHaveBeenCalledWith();
    });
  });

  describe('When presets exist but activePresetId is null', () => {
    const existingState: CustomInstructionsState = {
      presets: [{id: 'p-1', name: 'Concise', content: 'Be concise.'}],
      activePresetId: null,
    };

    beforeEach(async () => {
      await createComponent(existingState);
    });

    it('defaults to "None (Off)" and enables save to persist disabled state', async () => {
      expect(await harness.getSelectedPresetOptionText()).toBe('None (Off)');
      expect(await harness.hasDeleteButton()).toBe(false);
      expect(await harness.isSaveDisabled()).toBe(false);

      await harness.clickSave();
      expect(mockDialogRef.close).toHaveBeenCalledWith({
        presets: [{id: 'p-1', name: 'Concise', content: 'Be concise.'}],
        activePresetId: null,
      });
    });
  });
});
