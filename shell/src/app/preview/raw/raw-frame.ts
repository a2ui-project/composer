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
  computed,
  untracked,
  WritableSignal,
  ElementRef,
  viewChild,
  AfterViewInit,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Subject} from 'rxjs';
import {debounceTime, filter, map} from 'rxjs/operators';
import {MatSnackBar} from '@angular/material/snack-bar';
import loader from '@monaco-editor/loader';
import type * as monaco from 'monaco-editor';
import {IS_EXTENSION_MODE} from '../../shell/environment-tokens/environment-tokens';
import {HostCommunication} from '../../shell/host-communication/host-communication';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {StateSync} from '../../chat/state-sync/state-sync';
import {ChatState} from '../../chat/chat-state/chat-state';
import {AppConfigProvider} from '../../settings/app-config-provider/app-config-provider';

/**
 * Hosts the raw JSON view of active surface models, allowing direct source editing
 * and displaying real-time parsing error indicators.
 */
const LAYOUT_MODEL_URI = 'a2ui://layout.json';

@Component({
  selector: 'a2ui-composer-raw-frame',
  standalone: true,
  imports: [],
  templateUrl: './raw-frame.ng.html',
  styleUrl: './raw-frame.scss',
})
export class RawFrame implements AfterViewInit {
  protected readonly isExtensionMode = inject(IS_EXTENSION_MODE);
  protected readonly layoutJson: WritableSignal<string>;

  readonly editorContainer = viewChild.required<ElementRef<HTMLDivElement>>('editorContainer');
  private editor?: monaco.editor.IStandaloneCodeEditor;
  private readonly monacoInstance = signal<typeof monaco | null>(null);
  private destroyed = false;

  readonly TEST_ONLY = {
    layoutJson: () => this.layoutJson,
  };

  private readonly hostCommunication = inject(HostCommunication);
  private readonly catalogManagement = inject(CatalogManagement);
  private readonly stateSync = inject(StateSync);
  private readonly chatState = inject(ChatState);
  private readonly configProvider = inject(AppConfigProvider);
  private readonly destroyRef = inject(DestroyRef);
  private readonly snackBar = inject(MatSnackBar);
  private readonly layoutInput$ = new Subject<string>();

  /** Public lock indicator preventing typing deadlocks during generative LLM stream turns. */
  protected readonly isLocked = this.chatState.isProgrammaticStreamActive;
  protected readonly isDarkTheme = computed(() => this.configProvider.themePreference() === 'dark');

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      if (this.editor) {
        this.editor.dispose();
      }
    });

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

    effect(() => {
      const catalog = this.catalogManagement.activeCatalog();
      const monacoInstance = this.monacoInstance();

      if (!catalog || !monacoInstance) {
        return;
      }

      // The active catalog provides schemas for individual UI components (e.g. Text, Button).
      // However, the JSON payload in the editor is an array of A2UI messages (e.g. createSurface,
      // updateComponents). We dynamically synthesize a root schema here that describes this payload
      // structure, injecting the catalog's component schemas into the `updateComponents` block
      // so Monaco can fully validate the entire JSON tree structure and its component properties.
      const layoutSchema = {
        ...catalog,
        type: 'array',
        items: {
          type: 'object',
          properties: {
            version: {type: 'string'},
            createSurface: {
              type: 'object',
              properties: {
                surfaceId: {type: 'string'},
                catalogId: {type: 'string'},
                sendDataModel: {type: 'boolean'},
              },
              required: ['surfaceId', 'catalogId'],
            },
            updateComponents: {
              type: 'object',
              properties: {
                surfaceId: {type: 'string'},
                components: {
                  type: 'array',
                  items: {
                    anyOf: Object.values(catalog.components || {}),
                  },
                },
              },
              required: ['surfaceId', 'components'],
            },
            updateDataModel: {
              type: 'object',
              properties: {
                surfaceId: {type: 'string'},
                path: {type: 'string'},
                value: {},
              },
              required: ['surfaceId'],
            },
          },
          additionalProperties: false,
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (monacoInstance.languages as any).json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
          {
            uri: 'a2ui-catalog-schema',
            fileMatch: [LAYOUT_MODEL_URI],
            schema: layoutSchema,
          },
        ],
      });
    });

    // Sync back changes in StateSync activeDraft to editor layoutJson (e.g. from LLM stream completed updates)
    effect(() => {
      const activeDraftVal = this.stateSync.activeDraft();
      untracked(() => {
        if (this.layoutJson() !== activeDraftVal) {
          queueMicrotask(() => {
            this.layoutJson.set(activeDraftVal);
            this.updateEditorContent(activeDraftVal);

            // Run live render updating matching activeDraft commits
            try {
              const payload = this.parseLayoutString(activeDraftVal);
              if (payload !== null) {
                this.hostCommunication.sendRenderA2UI(payload);
              } else {
                this.showJsonSyntaxError();
              }
            } catch (err) {
              this.showJsonSyntaxError();
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

    effect(() => {
      const isDark = this.isDarkTheme();
      untracked(() => {
        if (this.editor) {
          this.editor.updateOptions({theme: isDark ? 'vs-dark' : 'vs-light'});
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
              return payload;
            }
            this.showJsonSyntaxError();
            return null;
          } catch (err) {
            this.showJsonSyntaxError();
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
      this.monacoInstance.set(monacoInstance);

      const modelUri = monacoInstance.Uri.parse(LAYOUT_MODEL_URI);
      let model = monacoInstance.editor.getModel(modelUri);
      if (model) {
        model.setValue(this.layoutJson());
      } else {
        model = monacoInstance.editor.createModel(this.layoutJson(), 'json', modelUri);
      }

      const editor = monacoInstance.editor.create(this.editorContainer().nativeElement, {
        model: model,
        theme: this.isDarkTheme() ? 'vs-dark' : 'vs-light',
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

  protected onLayoutChange(value: string): void {
    this.layoutJson.set(value);
    this.layoutInput$.next(value);
    this.stateSync.updateDraft(value);
  }

  /**
   * Updates the Monaco editor's content while preserving its undo/redo history stack.
   * If a model exists on the editor, it executes an edit operation; otherwise it falls back to setValue.
   *
   * @param value The new text content to set in the editor.
   */
  private updateEditorContent(value: string): void {
    if (!this.editor || this.editor.getValue() === value) {
      return;
    }
    const model = this.editor.getModel();
    if (model) {
      const isLocked = this.isLocked();
      if (isLocked) {
        this.editor.updateOptions({readOnly: false});
      }
      this.editor.pushUndoStop();
      this.editor.executeEdits('state-sync', [
        {
          range: model.getFullModelRange(),
          text: value,
          forceMoveMarkers: true,
        },
      ]);
      this.editor.pushUndoStop();
      if (isLocked) {
        this.editor.updateOptions({readOnly: true});
      }
    } else {
      this.editor.setValue(value);
    }
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

  private showJsonSyntaxError(): void {
    this.snackBar.open('Invalid JSON syntax detected.', undefined, {
      duration: 3000,
    });
  }
}
