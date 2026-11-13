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
import {TestBed} from '@angular/core/testing';
import {ThinkingLevel} from '@google/genai';
import {beforeEach, describe, expect, it} from 'vitest';
import {StartupConfigStateService} from '../../shell/startup-resolution/state/startup-config-state.service';
import {LocalStorageInteractions} from '../../storage/local-storage-interactions/local-storage-interactions';
import {LocalStorageKey} from '../../storage/models/local-storage-keys';
import {ErrorLogger} from '../../debug/error-logger.service';
import {AppConfigProvider, AuthType} from '../app-config-provider/app-config-provider';
import {
  ModelSelectionService,
  isSupportedThinkingLevel,
  parseThinkingLevel,
} from './model-selection.service';

class FakeLocalStorage {
  readonly items = new Map<string, string>();
  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.items.set(key, value);
  }
  removeItem(key: string): void {
    this.items.delete(key);
  }
}

describe('ModelSelectionService', () => {
  let storage: FakeLocalStorage;
  let configState: StartupConfigStateService;
  const authType = signal<AuthType>(AuthType.THIRD_PARTY);

  function setup(): ModelSelectionService {
    TestBed.configureTestingModule({
      providers: [
        {provide: LocalStorageInteractions, useValue: storage},
        {provide: AppConfigProvider, useValue: {authType}},
      ],
    });
    configState = TestBed.inject(StartupConfigStateService);
    return TestBed.inject(ModelSelectionService);
  }

  beforeEach(() => {
    storage = new FakeLocalStorage();
    authType.set(AuthType.THIRD_PARTY);
  });

  it('exposes no models and no selection when config declares none', () => {
    const service = setup();
    expect(service.hasModels()).toBe(false);
    expect(service.selectedModel()).toBeNull();
    expect(service.thinkingLevel()).toBeUndefined();
  });

  it('parses config entries and ignores malformed ones', () => {
    const service = setup();
    configState.setModels([
      {
        model: 'gemini-flash-latest',
        displayName: 'Flash',
        thinkingLevels: ['low', 'HIGH', 'bogus', 'low'],
        defaultThinkingLevel: 'high',
      },
      {model: '   '} as never,
      'nope' as never,
    ]);

    expect(service.models()).toEqual([
      {
        id: 'gemini-flash-latest',
        name: 'Flash',
        model: 'gemini-flash-latest',
        thinkingLevels: [ThinkingLevel.LOW, ThinkingLevel.HIGH],
        defaultThinkingLevel: ThinkingLevel.HIGH,
        authType: undefined,
      },
    ]);
  });

  it('defaults to the first entry in the list when nothing is stored', () => {
    const service = setup();
    configState.setModels([{model: 'gemini-flash-latest'}, {model: 'gemini-pro-latest'}]);
    expect(service.selectedModelId()).toBe('gemini-flash-latest');

    configState.setModels([{model: 'gemini-pro-latest'}, {model: 'lite'}]);
    expect(service.selectedModelId()).toBe('gemini-pro-latest');
  });

  it('persists a valid model selection and ignores unknown ids', () => {
    const service = setup();
    configState.setModels([{model: 'gemini-flash-latest'}, {model: 'gemini-pro-latest'}]);

    service.selectModel('gemini-pro-latest');
    expect(service.selectedModel()?.model).toBe('gemini-pro-latest');
    expect(storage.getItem(LocalStorageKey.SELECTED_MODEL)).toBe('gemini-pro-latest');

    service.selectModel('not-in-allow-list');
    expect(service.selectedModelId()).toBe('gemini-pro-latest');
  });

  it('falls back when the stored model is no longer in the config', () => {
    storage.setItem(LocalStorageKey.SELECTED_MODEL, 'removed');
    const service = setup();
    configState.setModels([{model: 'gemini-flash-latest'}]);
    expect(service.selectedModelId()).toBe('gemini-flash-latest');
  });

  it('resolves the thinking level from storage, then model default, then first level', () => {
    storage.setItem(LocalStorageKey.SELECTED_THINKING_LEVEL, 'high');
    const service = setup();
    configState.setModels([
      {
        model: 'gemini-flash-latest',
        thinkingLevels: ['low', 'medium', 'high'],
        defaultThinkingLevel: 'medium',
      },
      {model: 'narrow', thinkingLevels: ['low', 'medium'], defaultThinkingLevel: 'medium'},
      {model: 'nodefault', thinkingLevels: ['minimal', 'low']},
      {model: 'none'},
    ]);

    expect(service.thinkingLevel()).toBe(ThinkingLevel.HIGH);
    service.selectModel('narrow');
    expect(service.thinkingLevel()).toBe(ThinkingLevel.MEDIUM);
    service.selectModel('nodefault');
    expect(service.thinkingLevel()).toBe(ThinkingLevel.MINIMAL);
    service.selectModel('none');
    expect(service.thinkingLevel()).toBeUndefined();
  });

  it('persists the thinking level choice and ignores unspecified or arbitrary levels', () => {
    const service = setup();
    configState.setModels([{model: 'gemini-flash-latest', thinkingLevels: ['low', 'high']}]);
    service.selectThinkingLevel(ThinkingLevel.HIGH);
    expect(service.thinkingLevel()).toBe(ThinkingLevel.HIGH);
    expect(storage.getItem(LocalStorageKey.SELECTED_THINKING_LEVEL)).toBe(ThinkingLevel.HIGH);

    service.selectThinkingLevel(ThinkingLevel.THINKING_LEVEL_UNSPECIFIED);
    expect(service.thinkingLevel()).toBe(ThinkingLevel.HIGH);

    service.selectThinkingLevel('ULTRA' as ThinkingLevel);
    expect(service.thinkingLevel()).toBe(ThinkingLevel.HIGH);
  });

  it('sanitizes unmapped or arbitrary levels in storage and ignores unmapped model levels', () => {
    storage.setItem(LocalStorageKey.SELECTED_THINKING_LEVEL, 'ULTRA');
    const service = setup();
    configState.setModels([
      {
        model: 'gemini-flash-latest',
        thinkingLevels: ['ultra', 'low', 'high'],
        defaultThinkingLevel: 'ultra',
      },
    ]);
    expect(service.selectedModel()?.thinkingLevels).toEqual([
      ThinkingLevel.LOW,
      ThinkingLevel.HIGH,
    ]);
    expect(service.selectedModel()?.defaultThinkingLevel).toBeUndefined();
    expect(service.thinkingLevel()).toBe(ThinkingLevel.LOW);
  });

  it('logs a warning via ErrorLogger when unmapped thinking levels are configured in model options', () => {
    const service = setup();
    const errorLogger = TestBed.inject(ErrorLogger);
    const streamCalls = signal(0);
    const sub = errorLogger.errorStream$.subscribe(() => {
      streamCalls.update(n => n + 1);
    });

    configState.setModels([
      {
        model: 'gemini-test',
        thinkingLevels: ['xhigh', 'low'],
        defaultThinkingLevel: 'xhigh',
      },
    ]);
    TestBed.flushEffects();

    expect(service.models()[0].thinkingLevels).toEqual([ThinkingLevel.LOW]);
    const history = errorLogger.getHistory();
    expect(history.map(h => h.message)).toEqual([
      'Unrecognized thinking level "xhigh" for model "gemini-test"',
      'Unrecognized default thinking level "xhigh" for model "gemini-test"',
    ]);
    expect(streamCalls()).toBe(2);

    // Changing authType must not re-emit warnings or re-run warning logging
    authType.set(AuthType.FIRST_PARTY);
    TestBed.flushEffects();
    expect(errorLogger.getHistory().length).toBe(2);

    sub.unsubscribe();
  });

  it('only offers models matching the active auth type', () => {
    const service = setup();
    configState.setModels([
      {model: 'models/internal', authType: '1p'},
      {model: 'shared'},
      {model: 'gemini-flash-latest', authType: '3p'},
    ]);

    expect(service.models().map(m => m.id)).toEqual(['shared', 'gemini-flash-latest']);
    authType.set(AuthType.FIRST_PARTY);
    expect(service.models().map(m => m.id)).toEqual(['models/internal', 'shared']);
  });

  it('parses thinking levels case-insensitively and rejects unmapped or arbitrary levels', () => {
    expect(parseThinkingLevel('minimaL')).toBe(ThinkingLevel.MINIMAL);
    expect(parseThinkingLevel('low')).toBe(ThinkingLevel.LOW);
    expect(parseThinkingLevel(' Medium ')).toBe(ThinkingLevel.MEDIUM);
    expect(parseThinkingLevel('HIGH')).toBe(ThinkingLevel.HIGH);
    expect(parseThinkingLevel(ThinkingLevel.THINKING_LEVEL_UNSPECIFIED)).toBeUndefined();
    expect(parseThinkingLevel('ultra')).toBeUndefined();
    expect(parseThinkingLevel(42)).toBeUndefined();
  });

  it('validates supported thinking levels using isSupportedThinkingLevel', () => {
    expect(isSupportedThinkingLevel(ThinkingLevel.MINIMAL)).toBe(true);
    expect(isSupportedThinkingLevel(ThinkingLevel.LOW)).toBe(true);
    expect(isSupportedThinkingLevel(ThinkingLevel.MEDIUM)).toBe(true);
    expect(isSupportedThinkingLevel(ThinkingLevel.HIGH)).toBe(true);
    expect(isSupportedThinkingLevel(ThinkingLevel.THINKING_LEVEL_UNSPECIFIED)).toBe(false);
    expect(isSupportedThinkingLevel('ULTRA')).toBe(false);
    expect(isSupportedThinkingLevel('toString')).toBe(false);
    expect(isSupportedThinkingLevel(123)).toBe(false);
    expect(isSupportedThinkingLevel(null)).toBe(false);
    expect(isSupportedThinkingLevel(undefined)).toBe(false);
  });
});
