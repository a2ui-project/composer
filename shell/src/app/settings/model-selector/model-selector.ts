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

import {Component, computed, inject, input} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {
  ModelSelectionService,
  THINKING_LEVEL_LABELS,
  ThinkingLevel,
} from '../model-selection/model-selection.service';

/**
 * Lets the user pick the LLM model (from the `config.json.models` allow-list)
 * and, when the model supports it, the thinking level.
 */
@Component({
  selector: 'a2ui-composer-model-selector',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule],
  templateUrl: './model-selector.ng.html',
  styleUrl: './model-selector.scss',
})
export class ModelSelectorComponent {
  readonly disabled = input<boolean>(false);

  protected readonly modelSelection = inject(ModelSelectionService);

  protected readonly thinkingLevelOptions = computed(() =>
    (this.modelSelection.selectedModel()?.thinkingLevels ?? []).map(level => ({
      value: level,
      label: THINKING_LEVEL_LABELS[level],
    })),
  );

  protected onModelChange(id: string | null): void {
    if (id) {
      this.modelSelection.selectModel(id);
    }
  }

  protected onThinkingLevelChange(level: ThinkingLevel | null): void {
    if (level) {
      this.modelSelection.selectThinkingLevel(level);
    }
  }
}
