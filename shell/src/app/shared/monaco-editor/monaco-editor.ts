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
import {ErrorLogger, ErrorLogItem} from '../../debug/error-logger.service';

/**
 * A standalone Angular component that wraps the Monaco Editor.
 *
 * This component provides an embedded code editor specifically configured for
 * editing A2UI layout JSON. It automatically synchronizes theme preferences
 * (dark/light mode) and integrates with the active A2UI catalog to provide
 * real-time schema validation and autocompletion for component properties.
 */
const MODEL_URI = 'inmemory://model/layout.json';

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
  readonly markersChange = output<monaco.editor.IMarker[]>();

  private editor?: monaco.editor.IStandaloneCodeEditor;
  private readonly monacoInstance = signal<typeof monaco | null>(null);

  private readonly catalogManagement = inject(CatalogManagement);
  private readonly configProvider = inject(AppConfigProvider);
  private readonly destroyRef = inject(DestroyRef);
  private readonly errorLogger = inject(ErrorLogger);

  protected readonly isDarkTheme = computed(
    () => this.configProvider.themePreference() === ThemePreference.DARK,
  );
  protected readonly monacoTheme = computed(() => (this.isDarkTheme() ? 'vs-dark' : 'vs-light'));

  /**
   * Resolves a JSON Pointer RFC 6901 compliant path against an object payload.
   *
   * @param obj - The base JSON object to traverse.
   * @param pointer - The JSON pointer URI / path string.
   * @returns The resolved inner object payload or undefined if invalid.
   */
  static resolveJsonPointer(obj: unknown, pointer: string): unknown {
    if (!pointer || pointer === '' || pointer === '#') {
      return obj;
    }
    let p = pointer.startsWith('#') ? pointer.substring(1) : pointer;
    if (p.startsWith('/')) {
      p = p.substring(1);
    }
    const parts = p.split('/');
    let current: unknown = obj;

    for (const part of parts) {
      if (current === null || typeof current !== 'object') {
        return undefined;
      }

      // RFC 6901 compliant segment unescaping and URL decoding before prototype
      // guards to preserve exact segment logic and strictly avoid JS prototype
      // pollution injections / URI decoding bugs
      let unescaped = part.replace(/~1/g, '/').replace(/~0/g, '~');
      try {
        unescaped = decodeURIComponent(unescaped);
      } catch {
        // Fall back to unescaped if invalid URI encoding
      }

      if (unescaped === '__proto__' || unescaped === 'constructor' || unescaped === 'prototype') {
        return undefined;
      }

      current = Object.prototype.hasOwnProperty.call(current, unescaped)
        ? (current as Record<string, unknown>)[unescaped]
        : undefined;
    }

    return current;
  }

  /**
   * Evaluates Draft-07 JSON Schema inputs and synthesizes deep structure.
   * Aggressively flattens in-memory `allOf` constructs and links `$ref` dependencies.
   *
   * @param rawSchema - The current node of the JSON schema.
   * @param externalSchemas - Available root nodes to satisfy `$ref` queries.
   * @param rootDefinitions - Storage accumulator for synthesized definitions.
   * @param visited - Tracks cycle breaking refs.
   * @param isRoot - Signals if the node is at the apex context.
   * @param depth - Traverses execution tree structure (limit prevents cyclic halting).
   * @returns Synthesized, flatter JSON structure representation without inline `allOf`.
   */
  static resolveAndFlattenSchemaForDraft07(
    rawSchema: Record<string, unknown>,
    externalSchemas: Record<string, Record<string, unknown>> = {},
    rootDefinitions: Record<string, unknown> = {},
    visited = new Set<string>(),
    isRoot = true,
    depth = 0,
  ): Record<string, unknown> {
    // Thread safety recursion bounding prevents catastrophic backtracking
    // loops or halting when attempting to flatten deeply nested cyclic refs.
    if (depth > 50) {
      return {error: 'Max schema recursion depth exceeded'};
    }

    const result: Record<string, unknown> = {...rawSchema};
    if (isRoot) {
      result['definitions'] = rootDefinitions;
    }

    const refResult = MonacoEditor.mergeSchemaRef(
      result,
      externalSchemas,
      rootDefinitions,
      visited,
      depth,
    );
    if (refResult) {
      return refResult;
    }

    if (Array.isArray(result['allOf'])) {
      // allOf dependencies are eagerly evaluated inline synchronously
      // because Draft-07 tooling often expects composed primitives instead of references.
      MonacoEditor.resolveAllOf(result, externalSchemas, rootDefinitions, visited, depth);
    }

    return result;
  }

  private static mergeSchemaRef(
    result: Record<string, unknown>,
    externalSchemas: Record<string, Record<string, unknown>>,
    rootDefinitions: Record<string, unknown>,
    visited: Set<string>,
    depth: number,
  ): Record<string, unknown> | null {
    if (typeof result['$ref'] === 'string') {
      const ref = result['$ref'];
      if (ref.includes('#')) {
        const [uri, pointer] = ref.split('#');
        if (uri && externalSchemas[uri]) {
          const defKey = `${uri.replace(/[^a-zA-Z0-9]/g, '_')}_${pointer.replace(/[^a-zA-Z0-9]/g, '_')}`;
          if (visited.has(ref)) {
            return {$ref: `#/definitions/${defKey}`};
          }
          visited.add(ref);
          const resolved = MonacoEditor.resolveJsonPointer(externalSchemas[uri], '#' + pointer);
          if (resolved && typeof resolved === 'object') {
            rootDefinitions[defKey] = MonacoEditor.resolveAndFlattenSchemaForDraft07(
              resolved as Record<string, unknown>,
              externalSchemas,
              rootDefinitions,
              visited,
              false,
              depth + 1,
            );
            return {$ref: `#/definitions/${defKey}`};
          }
        }
      }
    }
    return null;
  }

  private static resolveAllOf(
    result: Record<string, unknown>,
    externalSchemas: Record<string, Record<string, unknown>>,
    rootDefinitions: Record<string, unknown>,
    visited: Set<string>,
    depth: number,
  ): void {
    const properties: Record<string, unknown> = {
      ...((result['properties'] as Record<string, unknown>) || {}),
    };
    const required = new Set<string>((result['required'] as string[]) || []);

    const allOf = result['allOf'] as unknown[];
    for (const sub of allOf) {
      if (sub && typeof sub === 'object') {
        const flattenedSub = MonacoEditor.resolveAndFlattenSchemaForDraft07(
          sub as Record<string, unknown>,
          externalSchemas,
          rootDefinitions,
          visited,
          false,
          depth + 1,
        );
        if (flattenedSub['properties'] && typeof flattenedSub['properties'] === 'object') {
          Object.assign(properties, flattenedSub['properties']);
        }
        if (Array.isArray(flattenedSub['required'])) {
          flattenedSub['required'].forEach(r => required.add(r));
        }
      }
    }
    result['properties'] = properties;
    if (required.size > 0) {
      result['required'] = Array.from(required);
    }
    result['additionalProperties'] = false;
    delete result['allOf'];
    delete result['unevaluatedProperties'];
  }

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
            deleteSurface: {
              type: 'object',
              properties: {
                surfaceId: {type: 'string'},
              },
              required: ['surfaceId'],
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
    const overflowWidgetsDomNode =
      typeof document !== 'undefined' ? document.createElement('div') : undefined;
    if (overflowWidgetsDomNode) {
      overflowWidgetsDomNode.className = 'monaco-editor monaco-overflow-widgets';
      document.body.appendChild(overflowWidgetsDomNode);
    }

    this.destroyRef.onDestroy(() => {
      destroyed = true;
      if (this.editor) {
        const model = this.editor.getModel();
        if (model) {
          model.dispose();
        }
        this.editor.dispose();
      }
      overflowWidgetsDomNode?.remove();
    });

    afterNextRender(() => {
      loader.config({paths: {vs: 'assets/monaco/vs'}});

      loader.init().then((monacoInstance: typeof monaco) => {
        if (destroyed) {
          return;
        }
        this.monacoInstance.set(monacoInstance);

        const modelUri = monacoInstance.Uri.parse(MODEL_URI);
        let model = monacoInstance.editor.getModel(modelUri);
        if (model) {
          model.setValue(this.value());
        } else {
          model = monacoInstance.editor.createModel(this.value(), 'json', modelUri);
        }

        const editor = monacoInstance.editor.create(this.editorContainer().nativeElement, {
          model,
          fixedOverflowWidgets: true,
          overflowWidgetsDomNode,
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

        const markersDisposable = monacoInstance.editor.onDidChangeMarkers(
          ([uri]: readonly monaco.Uri[]) => {
            if (uri.toString() === modelUri.toString()) {
              const markers = monacoInstance.editor.getModelMarkers({resource: uri});

              this.markersChange.emit(markers);

              const timestamp = Date.now();
              markers.forEach((marker: monaco.editor.IMarker) => {
                const item: Partial<ErrorLogItem> = {
                  id: `${timestamp}-${Math.random().toString(36).substring(2, 9)}`,
                  timestamp,
                  level:
                    marker.severity === 8
                      ? 'error'
                      : marker.severity === 4
                        ? 'warn'
                        : marker.severity === 2
                          ? 'info'
                          : 'log',
                  message: marker.message,
                  sourceTag: '[Editor]',
                  line: marker.startLineNumber,
                  column: marker.startColumn,
                };
                if (item.level === 'error') this.errorLogger.error(item);
                else if (item.level === 'warn') this.errorLogger.warn(item);
                else if (item.level === 'info') this.errorLogger.info(item);
                else this.errorLogger.log(item);
              });
            }
          },
        );

        this.destroyRef.onDestroy(() => {
          markersDisposable.dispose();
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
   * @return An array of schemas configured with URIs that match `$ref` references
   *          within the component schemas. We map local constants (like COMMON_TYPES_SCHEMA)
   *          to both `file:///` and HTTP URIs so the Monaco JSON worker can resolve them
   *          synchronously without needing an external schema request service.
   */
  private buildValidationSchemas(layoutSchema: unknown): monaco.json.DiagnosticsOptions['schemas'] {
    return [
      {
        uri: 'a2ui-catalog-schema',
        fileMatch: [MODEL_URI],
        schema: structuredClone(layoutSchema),
      },
      {
        uri: 'file:///common_types.json',
        schema: structuredClone(COMMON_TYPES_SCHEMA),
      },
      {
        uri: 'file:///catalog.json',
        schema: structuredClone(BASIC_CATALOG_SCHEMA),
      },
      {
        uri: 'https://a2ui.org/specification/v0_9/common_types.json',
        schema: structuredClone(COMMON_TYPES_SCHEMA),
      },
      {
        uri: 'https://a2ui.org/specification/v0_9/catalog.json',
        schema: structuredClone(BASIC_CATALOG_SCHEMA),
      },
      {
        uri: 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json',
        schema: structuredClone(BASIC_CATALOG_SCHEMA),
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
