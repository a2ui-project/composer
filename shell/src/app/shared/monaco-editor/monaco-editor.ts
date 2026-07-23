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
  output,
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
import {
  AppConfigProvider,
  ThemePreference,
} from '../../settings/app-config-provider/app-config-provider';
import {COMMON_TYPES_SCHEMA} from '../../gallery/schema/common-types-schema';
import {BASIC_CATALOG_SCHEMA} from '../../gallery/schema/basic-catalog-schema';

const LAYOUT_MODEL_URI = 'a2ui://layout.json';

/**
 * A standalone Angular component that wraps the Monaco Editor.
 *
 * This component provides an embedded code editor specifically configured for
 * editing A2UI layout JSON. It automatically synchronizes theme preferences
 * (dark/light mode) and integrates with the active A2UI catalog to provide
 * real-time schema validation and autocompletion for component properties.
 */
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
  readonly valueChange = output<string>();

  private editor?: monaco.editor.IStandaloneCodeEditor;
  private readonly monacoInstance = signal<typeof monaco | null>(null);

  private readonly catalogManagement = inject(CatalogManagement);
  private readonly configProvider = inject(AppConfigProvider);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isDarkTheme = computed(
    () => this.configProvider.themePreference() === ThemePreference.DARK,
  );
  protected readonly monacoTheme = computed(() => (this.isDarkTheme() ? 'vs-dark' : 'vs-light'));

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

      // @types/monaco-editor deprecates `monaco.languages.json` in favor of `monaco.json`,
      // but our AMD loader still attaches the JSON API to `monaco.languages.json`.
      // We safely cast through `unknown` to the modern ESM type, as the runtime structures
      // match and no alternative AMD interfaces exist for `jsonDefaults`.
      const jsonContrib = (monacoInstance.languages as unknown as {json: typeof monaco.json}).json;
      jsonContrib.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: this.buildValidationSchemas(layoutSchema),
      });
    });

    // Update the editor's theme (dark vs. light mode) in response to
    // application-level theme preference changes.
    effect(() => {
      const theme = this.monacoTheme();
      untracked(() => {
        if (this.editor) {
          this.editor.updateOptions({theme});
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
          model,
          theme: this.monacoTheme(),
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

  /**
   * Constructs the array of JSON schemas provided to the Monaco Editor's JSON worker
   * for real-time validation and autocompletion.
   *
   * @param layoutSchema The dynamically generated schema representing the full A2UI layout
   *        structure, including the active catalog's components.
   * @returns An array of schemas configured with URIs that match `$ref` references
   *          within the component schemas. We map local constants (like COMMON_TYPES_SCHEMA)
   *          to both `file:///` and HTTP URIs so the Monaco JSON worker can resolve them
   *          synchronously without needing an external schema request service.
   */
  private buildValidationSchemas(layoutSchema: unknown): monaco.json.DiagnosticsOptions['schemas'] {
    return [
      {
        uri: 'a2ui-catalog-schema',
        fileMatch: [LAYOUT_MODEL_URI],
        schema: layoutSchema,
      },
      {
        uri: 'file:///common_types.json',
        schema: COMMON_TYPES_SCHEMA,
      },
      {
        uri: 'file:///catalog.json',
        schema: BASIC_CATALOG_SCHEMA,
      },
      {
        uri: 'https://a2ui.org/specification/v0_9/common_types.json',
        schema: COMMON_TYPES_SCHEMA,
      },
      {
        uri: 'https://a2ui.org/specification/v0_9/catalog.json',
        schema: BASIC_CATALOG_SCHEMA,
      },
      {
        uri: 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json',
        schema: BASIC_CATALOG_SCHEMA,
      },
    ];
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
