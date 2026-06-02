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

import {
  Component,
  inject,
  signal,
  DestroyRef,
  effect,
  untracked,
  WritableSignal,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {Subject} from 'rxjs';
import {debounceTime, filter, map} from 'rxjs/operators';
import {IS_EXTENSION_MODE} from '../../shell/environment-tokens';
import {HostCommunicationService} from '../../shell/host-communication.service';
import {CatalogManagementService} from '../../storage/catalog-management.service';
import {StateSyncService} from '../../chat/state-sync/state-sync.service';
import {ChatStateService} from '../../chat/chat-state/chat-state.service';

@Component({
  selector: 'a2ui-composer-raw-frame',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './raw-frame.component.ng.html',
  styleUrl: './raw-frame.component.scss',
})
/**
 * Hosts the raw JSON view of active surface models, allowing direct source editing
 * and displaying real-time parsing error indicators.
 */
export class RawFrameComponent {
  protected readonly isExtensionMode = inject(IS_EXTENSION_MODE);
  protected readonly layoutJson: WritableSignal<string>;
  protected readonly isJsonInvalid: WritableSignal<boolean> = signal(false);

  public readonly TEST_ONLY = {
    layoutJson: () => this.layoutJson,
    isJsonInvalid: () => this.isJsonInvalid,
  };

  private readonly hostCommunicationService = inject(HostCommunicationService);
  private readonly catalogManagementService = inject(CatalogManagementService);
  private readonly stateSyncService = inject(StateSyncService);
  private readonly chatStateService = inject(ChatStateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly layoutInput$ = new Subject<string>();

  /** Public lock indicator preventing typing deadlocks during generative LLM stream turns. */
  protected readonly isLocked = this.chatStateService.isProgrammaticStreamActive;

  constructor() {
    // Initialize backing editor layout state Signal dynamically from the volatile session cache
    this.layoutJson = signal(this.stateSyncService.hydrateActiveDraft());
    effect(() => {
      const catalog = this.catalogManagementService.activeCatalog();
      if (catalog) {
        const currentLayout = untracked(() => this.layoutJson());
        try {
          const payload = this.parseLayoutString(currentLayout);
          if (payload !== null) {
            this.hostCommunicationService.sendRenderA2UI(payload);
          }
        } catch (err) {
          // Ignore initial parse errors
        }
      }
    });

    // Sync back changes in StateSyncService activeDraft to editor layoutJson (e.g. from LLM stream completed updates)
    effect(() => {
      const activeDraftVal = this.stateSyncService.activeDraft();
      untracked(() => {
        if (this.layoutJson() !== activeDraftVal) {
          queueMicrotask(() => {
            this.layoutJson.set(activeDraftVal);

            // Run live render updating matching activeDraft commits
            try {
              const payload = this.parseLayoutString(activeDraftVal);
              if (payload !== null) {
                this.isJsonInvalid.set(false);
                this.hostCommunicationService.sendRenderA2UI(payload);
              } else {
                this.isJsonInvalid.set(true);
              }
            } catch (err) {
              this.isJsonInvalid.set(true);
            }
          });
        }
      });
    });

    this.layoutInput$
      .pipe(
        debounceTime(300),
        map((value: string): unknown[] | null => {
          try {
            const payload = this.parseLayoutString(value);
            if (payload !== null) {
              this.isJsonInvalid.set(false);
              return payload;
            }
            this.isJsonInvalid.set(true);
            return null;
          } catch (err) {
            this.isJsonInvalid.set(true);
            return null;
          }
        }),
        filter((payload): payload is unknown[] => payload !== null),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((payload: unknown[]) => {
        this.hostCommunicationService.sendRenderA2UI(payload);
      });
  }

  protected onLayoutChange(value: string): void {
    this.layoutJson.set(value);
    this.layoutInput$.next(value);
    this.stateSyncService.updateDraft(value);
  }

  /**
   * Parses the raw layout configuration string into an array of message objects.
   *
   * It supports two input formats:
   * 1. A standard JSON array (e.g. `[ { "createSurface": ... }, ... ]`),
   *    detected if it starts with `[`.
   * 2. JSON Lines (JSONL) format, where each non-empty line represents a
   *    standalone JSON object.
   *
   * If parsing fails, it throws a SyntaxError (which callers are expected to catch).
   *
   * @param value The raw layout string to parse.
   * @returns An array of parsed JSON objects (or empty array if input is empty).
   */
  private parseLayoutString(value: string): unknown[] | null {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }
    // Format 1: Standard JSON Array format
    if (trimmed.startsWith('[')) {
      return JSON.parse(trimmed);
    }
    // Format 2: JSON Lines (JSONL) format. Parse each line independently.
    const lines = trimmed
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);
    return lines.map(line => JSON.parse(line));
  }
}
