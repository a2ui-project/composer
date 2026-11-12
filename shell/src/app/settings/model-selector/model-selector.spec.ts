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

import {signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatOptionHarness} from '@angular/material/core/testing';
import {MatSelectHarness} from '@angular/material/select/testing';
import {ThinkingLevel} from '@google/genai';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {LlmModelOption, ModelSelectionService} from '../model-selection/model-selection.service';
import {ModelSelectorComponent} from './model-selector';

describe('ModelSelectorComponent', () => {
  let fixture: ComponentFixture<ModelSelectorComponent>;
  const models = signal<LlmModelOption[]>([]);
  const selectedModel = signal<LlmModelOption | null>(null);
  const thinkingLevel = signal<ThinkingLevel | undefined>(undefined);
  const selectModel = vi.fn();
  const selectThinkingLevel = vi.fn();

  const flash: LlmModelOption = {
    id: 'flash',
    name: 'Gemini Flash',
    model: 'gemini-flash-latest',
    thinkingLevels: [ThinkingLevel.LOW, ThinkingLevel.HIGH],
  };
  const plain: LlmModelOption = {id: 'plain', name: 'Plain', model: 'plain', thinkingLevels: []};

  beforeEach(async () => {
    selectModel.mockReset();
    selectThinkingLevel.mockReset();
    models.set([flash, plain]);
    selectedModel.set(flash);
    thinkingLevel.set(ThinkingLevel.LOW);

    await TestBed.configureTestingModule({
      imports: [ModelSelectorComponent],
      providers: [
        {
          provide: ModelSelectionService,
          useValue: {
            models,
            selectedModel,
            selectedModelId: () => selectedModel()?.id ?? null,
            thinkingLevel,
            selectModel,
            selectThinkingLevel,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModelSelectorComponent);
    fixture.detectChanges();
  });

  it('lists the configured models and the active thinking levels', async () => {
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const selectHarnesses = await loader.getAllHarnesses(MatSelectHarness);
    expect(selectHarnesses.length).toBe(2);
    const [modelSelect, levelSelect] = selectHarnesses;

    await modelSelect.open();
    const modelOptions = await rootLoader.getAllHarnesses(MatOptionHarness);
    const modelLabels = await Promise.all(modelOptions.map(o => o.getText()));
    expect(modelLabels).toEqual(['Gemini Flash', 'Plain']);
    await modelSelect.close();

    await levelSelect.open();
    const options = await rootLoader.getAllHarnesses(MatOptionHarness);
    const levels = await Promise.all(options.map(o => o.getText()));
    expect(levels).toEqual(['Low', 'High']);
  });

  it('forwards selections to the service', async () => {
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const selectHarnesses = await loader.getAllHarnesses(MatSelectHarness);
    expect(selectHarnesses.length).toBe(2);
    const [modelSelect, levelSelect] = selectHarnesses;

    await levelSelect.open();
    for (const option of await rootLoader.getAllHarnesses(MatOptionHarness)) {
      if ((await option.getText()).trim() === 'High') {
        await option.click();
        break;
      }
    }
    expect(selectThinkingLevel).toHaveBeenCalledWith(ThinkingLevel.HIGH);
    await levelSelect.close();

    await modelSelect.open();
    for (const option of await rootLoader.getAllHarnesses(MatOptionHarness)) {
      if ((await option.getText()).includes('Plain')) {
        await option.click();
        break;
      }
    }
    expect(selectModel).toHaveBeenCalledWith('plain');
  });

  it('hides the thinking level selector for models without levels', async () => {
    selectedModel.set(plain);
    thinkingLevel.set(undefined);
    fixture.detectChanges();

    const loader = TestbedHarnessEnvironment.loader(fixture);
    expect((await loader.getAllHarnesses(MatSelectHarness)).length).toBe(1);
  });

  it('only displays options for thinking levels present in THINKING_LEVEL_LABELS and filters out unmapped levels', async () => {
    const customLevel = 'ULTRA' as ThinkingLevel;
    const modelWithCustom: LlmModelOption = {
      id: 'custom',
      name: 'Custom',
      model: 'custom',
      thinkingLevels: [
        ThinkingLevel.LOW,
        customLevel,
        ThinkingLevel.THINKING_LEVEL_UNSPECIFIED,
        ThinkingLevel.HIGH,
      ],
    };
    models.set([modelWithCustom]);
    selectedModel.set(modelWithCustom);
    thinkingLevel.set(ThinkingLevel.LOW);
    fixture.detectChanges();

    const loader = TestbedHarnessEnvironment.loader(fixture);
    const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const selectHarnesses = await loader.getAllHarnesses(MatSelectHarness);
    expect(selectHarnesses.length).toBe(2);
    const [, levelSelect] = selectHarnesses;

    await levelSelect.open();
    const options = await rootLoader.getAllHarnesses(MatOptionHarness);
    const levels = await Promise.all(options.map(o => o.getText()));
    expect(levels).toEqual(['Low', 'High']);
  });

  it('hides the thinking level selector when a model only has unmapped thinking levels', async () => {
    const customLevel = 'ULTRA' as ThinkingLevel;
    const modelWithOnlyUnmapped: LlmModelOption = {
      id: 'custom-only',
      name: 'Custom Only',
      model: 'custom-only',
      thinkingLevels: [customLevel, ThinkingLevel.THINKING_LEVEL_UNSPECIFIED],
    };
    models.set([modelWithOnlyUnmapped]);
    selectedModel.set(modelWithOnlyUnmapped);
    thinkingLevel.set(undefined);
    fixture.detectChanges();

    const loader = TestbedHarnessEnvironment.loader(fixture);
    const selectHarnesses = await loader.getAllHarnesses(MatSelectHarness);
    expect(selectHarnesses.length).toBe(1);
  });
});
