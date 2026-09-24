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

import {Component, computed, inject, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {generateUuid} from '../../utils/uuid';
import {
  CustomInstructionPreset,
  CustomInstructionsState,
} from '../chat-prompt-factory/chat-prompt-factory.service';

const NONE_OPTION = '__none__';
const NEW_OPTION = '__new__';

/**
 * Dialog component allowing users to manage, select, edit, and create named Custom Instruction presets.
 */
@Component({
  selector: 'a2ui-composer-custom-instructions-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './custom-instructions-dialog.ng.html',
  styleUrl: './custom-instructions-dialog.scss',
})
export class CustomInstructionsDialog {
  protected readonly NONE_OPTION = NONE_OPTION;
  protected readonly NEW_OPTION = NEW_OPTION;

  private readonly dialogRef = inject(MatDialogRef<CustomInstructionsDialog>);
  protected readonly data = inject<CustomInstructionsState | null>(MAT_DIALOG_DATA, {
    optional: true,
  });

  protected readonly presets = signal<CustomInstructionPreset[]>(
    this.data?.presets ? [...this.data.presets] : [],
  );

  protected readonly selectedOption = signal<string>(this.computeInitialOption());
  protected readonly presetName = signal<string>(this.computeInitialName());
  protected readonly instructionsContent = signal<string>(this.computeInitialContent());
  protected readonly draftName = signal<string>('');
  protected readonly draftContent = signal<string>('');

  protected readonly isExistingPreset = computed(() => {
    const opt = this.selectedOption();
    return opt !== NONE_OPTION && opt !== NEW_OPTION;
  });

  protected readonly isNoneSelected = computed(() => this.selectedOption() === NONE_OPTION);

  protected readonly isSaveDisabled = computed(() => {
    const anyInvalidExistingPreset = this.presets().some(
      p => p.name.trim().length === 0 || p.content.trim().length === 0,
    );
    if (anyInvalidExistingPreset) {
      return true;
    }
    if (this.isNoneSelected()) {
      return false;
    }
    return this.presetName().trim().length === 0 || this.instructionsContent().trim().length === 0;
  });

  private computeInitialOption(): string {
    const list = this.presets();
    if (list.length === 0) {
      return NEW_OPTION;
    }
    const activeId = this.data?.activePresetId;
    if (activeId && list.some(p => p.id === activeId)) {
      return activeId;
    }
    return NONE_OPTION;
  }

  private computeInitialName(): string {
    const initialOpt = this.computeInitialOption();
    if (initialOpt === NONE_OPTION || initialOpt === NEW_OPTION) {
      return '';
    }
    const preset = this.presets().find(p => p.id === initialOpt);
    return preset?.name ?? '';
  }

  private computeInitialContent(): string {
    const initialOpt = this.computeInitialOption();
    if (initialOpt === NONE_OPTION || initialOpt === NEW_OPTION) {
      return '';
    }
    const preset = this.presets().find(p => p.id === initialOpt);
    return preset?.content ?? '';
  }

  protected onOptionChange(option: string): void {
    this.selectedOption.set(option);
    if (option === NEW_OPTION) {
      this.presetName.set(this.draftName());
      this.instructionsContent.set(this.draftContent());
    } else if (option === NONE_OPTION) {
      this.presetName.set('');
      this.instructionsContent.set('');
    } else {
      const preset = this.presets().find(p => p.id === option);
      this.presetName.set(preset?.name ?? '');
      this.instructionsContent.set(preset?.content ?? '');
    }
  }

  protected onNameChange(value: string): void {
    this.presetName.set(value);
    if (this.selectedOption() === NEW_OPTION) {
      this.draftName.set(value);
    } else if (this.isExistingPreset()) {
      const currentId = this.selectedOption();
      this.presets.update(list => list.map(p => (p.id === currentId ? {...p, name: value} : p)));
    }
  }

  protected onContentChange(value: string): void {
    this.instructionsContent.set(value);
    if (this.selectedOption() === NEW_OPTION) {
      this.draftContent.set(value);
    } else if (this.isExistingPreset()) {
      const currentId = this.selectedOption();
      this.presets.update(list => list.map(p => (p.id === currentId ? {...p, content: value} : p)));
    }
  }

  protected deletePreset(): void {
    const idToDelete = this.selectedOption();
    this.presets.update(list => list.filter(p => p.id !== idToDelete));
    this.selectedOption.set(NONE_OPTION);
    this.presetName.set('');
    this.instructionsContent.set('');
  }

  protected cancel(): void {
    this.dialogRef.close();
  }

  protected save(): void {
    const opt = this.selectedOption();
    if (opt === NONE_OPTION) {
      this.dialogRef.close({
        presets: this.presets(),
        activePresetId: null,
      });
      return;
    }

    const name = this.presetName().trim();
    const content = this.instructionsContent().trim();

    if (opt === NEW_OPTION) {
      const newPreset: CustomInstructionPreset = {
        id: generateUuid(),
        name,
        content,
      };
      this.dialogRef.close({
        presets: [...this.presets(), newPreset],
        activePresetId: newPreset.id,
      });
      return;
    }

    // Existing preset: overwrite in place
    const updatedPresets = this.presets().map(p => (p.id === opt ? {...p, name, content} : p));
    this.dialogRef.close({
      presets: updatedPresets,
      activePresetId: opt,
    });
  }
}
