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

import {TestBed} from '@angular/core/testing';
import {WorkspaceLayout, WorkspacePreset} from './workspace-layout';
import {describe, it, expect, beforeEach, vi} from 'vitest';

describe('WorkspaceLayout', () => {
  let layout: WorkspaceLayout;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    layout = TestBed.inject(WorkspaceLayout);
  });

  it('defaults to chat-preview when no preset is saved', () => {
    expect(layout.activePreset()).toBe('chat-preview');
    expect(layout.isActive()).toBe(false);
  });

  it('cycle steps chat -> chat-preview -> full -> chat', () => {
    layout.apply('chat');

    layout.cycle();
    expect(layout.activePreset()).toBe('chat-preview');

    layout.cycle();
    expect(layout.activePreset()).toBe('full');

    layout.cycle();
    expect(layout.activePreset()).toBe('chat');
  });

  it('exposes icon + label metadata for the active and next presets', () => {
    layout.apply('full');
    expect(layout.activePresetMeta()).toEqual({icon: 'dashboard', label: 'Code & Engine'});
    expect(layout.nextPreset()).toBe('chat');
    expect(layout.nextPresetMeta()).toEqual({icon: 'forum', label: 'Chat'});
  });

  it('invokes the registered rebuild callback on apply', () => {
    const rebuilt: WorkspacePreset[] = [];
    layout.register(preset => rebuilt.push(preset));

    layout.apply('full');
    layout.cycle();

    expect(rebuilt).toEqual(['full', 'chat']);
    expect(layout.isActive()).toBe(true);
  });

  it('stops invoking the callback and clears isActive after the disposer runs', () => {
    const rebuild = vi.fn();
    const dispose = layout.register(rebuild);

    dispose();
    expect(layout.isActive()).toBe(false);

    layout.apply('full');
    expect(rebuild).not.toHaveBeenCalled();
  });

  it('persists the applied preset to localStorage', () => {
    layout.apply('chat');
    expect(localStorage.getItem('composer_workspace_preset')).toBe('chat');
  });

  it('restores the saved preset for a freshly-created instance', () => {
    localStorage.setItem('composer_workspace_preset', 'full');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const restored = TestBed.inject(WorkspaceLayout);
    expect(restored.activePreset()).toBe('full');
  });
});
