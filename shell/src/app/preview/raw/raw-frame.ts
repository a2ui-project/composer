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
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Subject} from 'rxjs';
import {debounceTime, filter, map} from 'rxjs/operators';
import loader from '@monaco-editor/loader';
import type * as monaco from 'monaco-editor';
import {IS_EXTENSION_MODE} from '../../shell/environment-tokens/environment-tokens';
import {HostCommunication} from '../../shell/host-communication/host-communication';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {StateSync} from '../../chat/state-sync/state-sync';
import {ChatState} from '../../chat/chat-state/chat-state';

/**
 * Hosts the raw JSON view of active surface models, allowing direct source editing
 * and displaying real-time parsing error indicators.
 */
@Component({
  selector: 'a2ui-composer-raw-frame',
  standalone: true,
  imports: [],
  templateUrl: './raw-frame.ng.html',
  styleUrl: './raw-frame.scss',
})
export class RawFrame implements AfterViewInit, OnDestroy {
  protected readonly isExtensionMode = inject(IS_EXTENSION_MODE);
  protected readonly layoutJson: WritableSignal<string>;
  protected readonly isJsonInvalid: WritableSignal<boolean> = signal(false);

  @ViewChild('editorContainer') editorContainer!: ElementRef<HTMLDivElement>;
  private editor?: monaco.editor.IStandaloneCodeEditor;
  private destroyed = false;

  readonly TEST_ONLY = {
    layoutJson: () => this.layoutJson,
    isJsonInvalid: () => this.isJsonInvalid,
  };

  private readonly hostCommunication = inject(HostCommunication);
  private readonly catalogManagement = inject(CatalogManagement);
  private readonly stateSync = inject(StateSync);
  private readonly chatState = inject(ChatState);
  private readonly destroyRef = inject(DestroyRef);
  private readonly layoutInput$ = new Subject<string>();

  /** Public lock indicator preventing typing deadlocks during generative LLM stream turns. */
  protected readonly isLocked = this.chatState.isProgrammaticStreamActive;

  constructor() {
    // Initialize backing editor layout state Signal dynamically from the volatile session cache
    this.layoutJson = signal(this.stateSync.hydrateActiveDraft());
    effect(() => {
      const catalog = this.catalogManagement.activeCatalog();
      if (catalog) {
        const currentLayout = untracked(() => this.layoutJson());
        try {
          const payload = this.parseLayoutString(currentLayout);
          if (payload !== null) {
            this.hostCommunication.sendRenderA2UI(payload);
          }
        } catch (err) {
          // Ignore initial parse errors
        }
      }
    });

    // Sync back changes in StateSync activeDraft to editor layoutJson (e.g. from LLM stream completed updates)
    effect(() => {
      const activeDraftVal = this.stateSync.activeDraft();
      untracked(() => {
        if (this.layoutJson() !== activeDraftVal) {
          queueMicrotask(() => {
            this.layoutJson.set(activeDraftVal);
            if (this.editor && this.editor.getValue() !== activeDraftVal) {
              this.editor.setValue(activeDraftVal);
            }

            // Run live render updating matching activeDraft commits
            try {
              const payload = this.parseLayoutString(activeDraftVal);
              if (payload !== null) {
                this.isJsonInvalid.set(false);
                this.hostCommunication.sendRenderA2UI(payload);
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

    effect(() => {
      const locked = this.isLocked();
      untracked(() => {
        if (this.editor) {
          this.editor.updateOptions({readOnly: locked});
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
        this.hostCommunication.sendRenderA2UI(payload);
      });
  }

  ngAfterViewInit() {
    // Configure Monaco loader to use the local assets copy
    loader.config({paths: {vs: 'assets/monaco/vs'}});

    loader.init().then(monacoInstance => {
      if (this.destroyed) {
        return;
      }
      const editor = monacoInstance.editor.create(this.editorContainer.nativeElement, {
        value: this.layoutJson(),
        language: 'json',
        theme: 'vs-light',
        automaticLayout: true,
        minimap: {enabled: false},
        readOnly: this.isLocked(),
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        folding: true,
        wordWrap: 'on',
        ariaLabel: 'Raw layout JSON',
      });
      this.editor = editor;

      editor.onDidChangeModelContent(() => {
        const val = editor.getValue();
        if (val !== this.layoutJson()) {
          this.onLayoutChange(val);
        }
      });
    });
  }

  ngOnDestroy() {
    this.destroyed = true;
    if (this.editor) {
      this.editor.dispose();
    }
  }

  protected onLayoutChange(value: string): void {
    this.layoutJson.set(value);
    this.layoutInput$.next(value);
    this.stateSync.updateDraft(value);
  }

  /**
   * Parses the raw layout configuration string into an array of message objects.
   *
   * It expects a standard JSON structure (either an array of message objects or a
   * single message object). If it's a single message object, it wraps it in an array.
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
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (err) {
      throw new SyntaxError('Invalid JSON');
    }
  }
}
