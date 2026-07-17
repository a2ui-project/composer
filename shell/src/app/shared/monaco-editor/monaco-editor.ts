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
  ViewChild,
  AfterViewInit,
  OnDestroy,
  input,
  Output,
  EventEmitter,
  inject,
  effect,
  signal,
  untracked,
  computed,
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
export class MonacoEditor implements AfterViewInit, OnDestroy {
  @ViewChild('editorContainer') editorContainer!: ElementRef<HTMLDivElement>;

  readonly value = input<string>('');
  readonly readOnly = input<boolean>(false);

  @Output() valueChange = new EventEmitter<string>();

  private editor?: monaco.editor.IStandaloneCodeEditor;
  private readonly monacoInstance = signal<typeof monaco | null>(null);
  private destroyed = false;

  private readonly catalogManagement = inject(CatalogManagement);
  private readonly configProvider = inject(AppConfigProvider);

  protected readonly isDarkTheme = computed(() => this.configProvider.themePreference() === 'dark');

  constructor() {
    effect(() => {
      const val = this.value();
      untracked(() => {
        if (this.editor && this.editor.getValue() !== val) {
          this.updateEditorContent(val);
        }
      });
    });

    effect(() => {
      const val = this.readOnly();
      untracked(() => {
        if (this.editor) {
          this.editor.updateOptions({readOnly: val});
        }
      });
    });

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

    effect(() => {
      const isDark = this.isDarkTheme();
      untracked(() => {
        if (this.editor) {
          this.editor.updateOptions({theme: isDark ? 'vs-dark' : 'vs-light'});
        }
      });
    });
  }

  ngAfterViewInit() {
    loader.config({paths: {vs: 'assets/monaco/vs'}});

    loader.init().then(monacoInstance => {
      if (this.destroyed) {
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

      const editor = monacoInstance.editor.create(this.editorContainer.nativeElement, {
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
  }

  ngOnDestroy() {
    this.destroyed = true;
    if (this.editor) {
      this.editor.dispose();
    }
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
