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
  ElementRef,
  input,
  Output,
  EventEmitter,
  inject,
  effect,
  signal,
  untracked,
  computed,
  viewChild,
  afterNextRender,
  DestroyRef,
} from '@angular/core';
import loader from '@monaco-editor/loader';
import type * as monaco from 'monaco-editor';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {AppConfigProvider} from '../../settings/app-config-provider/app-config-provider';

const LAYOUT_MODEL_URI = 'a2ui://layout.json';

@Component({
  selector: 'a2ui-composer-monaco-editor',
  standalone: true,
  templateUrl: './monaco-editor.ng.html',
  styleUrl: './monaco-editor.scss',
})
export class MonacoEditor {
  readonly editorContainer = viewChild.required<ElementRef<HTMLDivElement>>('editorContainer');

  readonly value = input<string>('');
  readonly readOnly = input<boolean>(false);

  @Output() valueChange = new EventEmitter<string>();

  private editor?: monaco.editor.IStandaloneCodeEditor;
  private readonly monacoInstance = signal<typeof monaco | null>(null);

  private readonly catalogManagement = inject(CatalogManagement);
  private readonly configProvider = inject(AppConfigProvider);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isDarkTheme = computed(() => this.configProvider.themePreference() === 'dark');

  constructor() {
    // Synchronize external value changes into the Monaco editor instance
    // when the value signal is updated from outside.
    effect(() => {
      const val = this.value();
      untracked(() => {
        if (this.editor && this.editor.getValue() !== val) {
          this.updateEditorContent(val);
        }
      });
    });

    // Toggle the editor's read-only state when the corresponding input signal changes.
    effect(() => {
      const val = this.readOnly();
      untracked(() => {
        if (this.editor) {
          this.editor.updateOptions({readOnly: val});
        }
      });
    });

    // Dynamically register and update the JSON schema validation for Monaco
    // based on the currently active A2UI catalog to provide real-time linting.
    effect(() => {
      const catalog = this.catalogManagement.activeCatalog();
      const monacoInstance = this.monacoInstance();

      if (!catalog || !monacoInstance) {
        return;
      }

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

    // Update the editor's theme (dark vs. light mode) in response to
    // application-level theme preference changes.
    effect(() => {
      const isDark = this.isDarkTheme();
      untracked(() => {
        if (this.editor) {
          this.editor.updateOptions({theme: isDark ? 'vs-dark' : 'vs-light'});
        }
      });
    });

    let destroyed = false;
    this.destroyRef.onDestroy(() => {
      destroyed = true;
      if (this.editor) {
        this.editor.dispose();
      }
    });

    afterNextRender(() => {
      loader.config({paths: {vs: 'assets/monaco/vs'}});

      loader.init().then(monacoInstance => {
        if (destroyed) {
          return;
        }
        this.monacoInstance.set(monacoInstance);

        const modelUri = monacoInstance.Uri.parse(LAYOUT_MODEL_URI);
        let model = monacoInstance.editor.getModel(modelUri);
        if (model) {
          model.setValue(this.value());
        } else {
          model = monacoInstance.editor.createModel(this.value(), 'json', modelUri);
        }

        const editor = monacoInstance.editor.create(this.editorContainer().nativeElement, {
          model: model,
          theme: this.isDarkTheme() ? 'vs-dark' : 'vs-light',
          automaticLayout: true,
          minimap: {enabled: false},
          readOnly: this.readOnly(),
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          folding: true,
          wordWrap: 'on',
          ariaLabel: 'Raw layout JSON',
        });
        this.editor = editor;

        editor.onDidChangeModelContent(() => {
          const val = editor.getValue();
          if (val !== this.value()) {
            this.valueChange.emit(val);
          }
        });
      });
    });
  }

  private updateEditorContent(value: string): void {
    if (!this.editor || this.editor.getValue() === value) {
      return;
    }
    const model = this.editor.getModel();
    if (model) {
      const isLocked = this.readOnly();
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
}
