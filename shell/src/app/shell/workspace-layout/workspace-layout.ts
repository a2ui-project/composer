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

import {computed, Injectable, signal} from '@angular/core';

/** Named workspace layout presets the single header toggle cycles through. */
export type WorkspacePreset = 'chat' | 'chat-preview' | 'full';

/** Icon + label shown on the cycle toggle for a preset. */
export interface WorkspacePresetMeta {
  readonly icon: string;
  readonly label: string;
}

/** Order the toggle steps through on each click, wrapping at the end. */
const PRESET_CYCLE: readonly WorkspacePreset[] = ['chat', 'chat-preview', 'full'];

/** Icon + label the cycle toggle shows for each preset. */
const PRESET_META: Record<WorkspacePreset, WorkspacePresetMeta> = {
  chat: {icon: 'forum', label: 'Chat'},
  'chat-preview': {icon: 'preview', label: 'Chat + Preview'},
  full: {icon: 'dashboard', label: 'Code & Engine'},
};

/** localStorage key remembering the last-applied preset (drives the toggle label). */
const WORKSPACE_PRESET_KEY = 'composer_workspace_preset';

/**
 * Bridges the layout toggle that lives in the header (ComposerShell) with the
 * Dockview workspace it controls (ComposerWorkspace). The two are siblings
 * across the router outlet, so the workspace registers a rebuild callback here
 * while it is mounted, and the header reads the active preset for the toggle's
 * icon/label and asks to cycle it.
 */
@Injectable({providedIn: 'root'})
export class WorkspaceLayout {
  /** The preset currently applied (drives the toggle's icon + label). */
  readonly activePreset = signal<WorkspacePreset>(this.readSavedPreset() ?? 'chat-preview');

  /** True while a workspace is mounted and can accept layout commands. */
  readonly isActive = signal(false);

  /** Icon + label for the applied preset (what the toggle displays). */
  readonly activePresetMeta = computed(() => PRESET_META[this.activePreset()]);

  /** The preset the next click will apply (drives the tooltip). */
  readonly nextPreset = computed<WorkspacePreset>(() => {
    const idx = PRESET_CYCLE.indexOf(this.activePreset());
    return PRESET_CYCLE[(idx + 1) % PRESET_CYCLE.length];
  });

  /** Icon + label for the upcoming preset in the cycle (drives the tooltip). */
  readonly nextPresetMeta = computed(() => PRESET_META[this.nextPreset()]);

  private rebuild?: (preset: WorkspacePreset) => void;

  /**
   * Registers the mounted workspace's rebuild callback, which clears and
   * reconstructs the Dockview layout for a given preset. Returns a disposer
   * the workspace calls on destroy so a stale callback is never invoked.
   */
  register(rebuild: (preset: WorkspacePreset) => void): () => void {
    this.rebuild = rebuild;
    this.isActive.set(true);
    return () => {
      if (this.rebuild === rebuild) {
        this.rebuild = undefined;
        this.isActive.set(false);
      }
    };
  }

  /** Rebuild the workspace to `preset`, update the toggle label, and persist it. */
  apply(preset: WorkspacePreset): void {
    this.rebuild?.(preset);
    this.activePreset.set(preset);
    localStorage.setItem(WORKSPACE_PRESET_KEY, preset);
  }

  /** Advance to the next preset (chat -> chat-preview -> full -> chat). */
  cycle(): void {
    this.apply(this.nextPreset());
  }

  private readSavedPreset(): WorkspacePreset | null {
    const saved = localStorage.getItem(WORKSPACE_PRESET_KEY);
    return saved === 'chat' || saved === 'chat-preview' || saved === 'full' ? saved : null;
  }
}
