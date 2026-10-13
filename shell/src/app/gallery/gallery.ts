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

import {TrackEventDirective} from '../usage-tracking/track-event.directive';
import {
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Clipboard} from '@angular/cdk/clipboard';
import {filter} from 'rxjs/operators';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {JsonPipe, NgTemplateOutlet} from '@angular/common';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatCardModule} from '@angular/material/card';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {GalleryCatalog} from './services/gallery-catalog';
import {CatalogManagement} from '../storage/catalog-management/catalog-management';
import {RenderedFrame} from '../preview/rendered/rendered-frame';
import {HostCommunication} from '../shell/host-communication/host-communication';
import {formatJson} from '../utils/json';
import {PreviewBridgeMessageType, ComponentUsage, RenderA2uiItem} from 'a2ui-bridge';
import {StartupResolution} from '../shell/startup-resolution/startup-resolution';
import {StartupConfigStateService} from '../shell/startup-resolution/state/startup-config-state.service';
import {stableStringify} from '../storage/stable-stringify/stable-stringify';
import {Catalog} from '../storage/models/catalog-storage.model';
import {CatalogSchemaResolver} from './schema/catalog-schema-resolver';
import {
  createDefaultGalleryValue,
  describeUneditableValue,
  galleryPropertyControl,
  GalleryPropertyControl,
  parseGalleryExample,
} from './gallery-example';
import {ErrorLogger} from '../debug/error-logger.service';
import {GalleryLauncher} from './gallery-launcher';
import {UsageTrackingService} from '../usage-tracking/usage-tracking.service';
import {MonacoEditor} from '../shared/monaco-editor/monaco-editor';

type PropertyPath = ReadonlyArray<string | number>;

interface ExampleDraft {
  text: string;
  preset: ComponentUsage | null;
  payload: RenderA2uiItem[] | null;
  error: string | null;
}

interface EditableProperty {
  name: string;
  required: boolean;
  control: GalleryPropertyControl;
  kind: GalleryPropertyControl['kind'];
  options: GalleryPropertyControl['options'];
  /** The current value, or undefined when the example omits the property. */
  value: unknown;
  /** Set when the value is a binding or call that only the JSON tab can edit. */
  note: string | null;
  /** True for properties every component in the catalog shares, such as accessibility. */
  common: boolean;
  /** True on the first common property, where the list starts its common section. */
  firstCommon: boolean;
}

/** An unparsed JSON property edit, kept so the field shows what was typed. */
interface JsonFieldError {
  text: string;
  message: string;
}

/**
 * Displays a split visual catalog gallery enabling search, interactive component selection,
 * schema properties introspection, live preview placeholders, and usage clipboard exports.
 */
@Component({
  selector: 'a2ui-composer-gallery',
  standalone: true,
  imports: [
    TrackEventDirective,
    JsonPipe,
    NgTemplateOutlet,
    FormsModule,
    MatInputModule,
    MatSidenavModule,
    MatListModule,
    MatCardModule,
    MatTableModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MonacoEditor,
    RenderedFrame,
  ],
  templateUrl: './gallery.ng.html',
  styleUrl: './gallery.scss',
})
export class Gallery implements OnInit, OnDestroy {
  private readonly catalogService = inject(GalleryCatalog);
  protected readonly catalogManagement = inject(CatalogManagement);
  private readonly hostCommunication = inject(HostCommunication);
  private readonly usageTrackingService = inject(UsageTrackingService);
  private readonly clipboard = inject(Clipboard);
  private readonly startupResolution = inject(StartupResolution);
  private readonly startupConfigState = inject(StartupConfigStateService);
  private readonly launcher = inject(GalleryLauncher);
  private readonly errorLogger = inject(ErrorLogger);
  private readonly logger = this.errorLogger.withTag('[Gallery]');
  protected readonly opening = signal(false);
  protected readonly actionMessage = signal('');
  protected readonly playgroundExpanded = signal(true);
  protected readonly rendererUrl = this.startupResolution.resolvedUrl;

  /** Memoized stringified catalog identity so switching components doesn't re-serialize the catalog. */
  private readonly catalogSignature = computed(() => {
    const catalog = this.catalogManagement.activeCatalog();
    return catalog ? stableStringify(catalog) : null;
  });

  /** Memoized schema resolver and shared property names, computed once per active catalog. */
  private readonly activeCatalogResolver = computed(() => {
    const catalog = this.catalogManagement.activeCatalog();
    if (!catalog) {
      return null;
    }
    const resolver = new CatalogSchemaResolver(catalog, this.errorLogger);
    return {
      resolver,
      common: this.commonPropertyNames(resolver, catalog),
    };
  });

  /** Memoized property schemas for the active component so keystrokes don't re-resolve schemas. */
  private readonly selectedComponentSchemas = computed(() => {
    const key = this.catalogService.selectedComponentKey();
    const resolved = this.activeCatalogResolver();
    return key && resolved ? resolved.resolver.resolveComponentPropertiesSchema(key) : {};
  });

  /**
   * linkedSignal owns the local draft without propagating component state through effects.
   * Once initialized, repeat usages/ready messages cannot overwrite an edit.
   *
   * draftSource: identifies all information of current component
   * (rendererURL, rendererId, catalog, componentKey)
   * and preset/example JSON for that component
   */
  private readonly draftSource = computed(() => {
    const catalog = this.catalogManagement.activeCatalog();
    return {
      identity: JSON.stringify([
        this.rendererUrl(),
        this.startupConfigState.selectedRendererId(),
        this.catalogSignature(),
        this.catalogService.selectedComponentKey(),
      ]),
      catalog,
      preset: this.catalogService.selectedComponentPreset(),
    };
  });

  /** draft: local draft without propagating component state through effects. */
  protected readonly draft = linkedSignal({
    source: this.draftSource,
    computation: (source, previous): ExampleDraft => {
      if (previous?.source.identity === source.identity && previous.value.preset) {
        return previous.value;
      }
      return this.createDraft(source.preset, source.catalog);
    },
  });
  /** Invalid per-property JSON edits by property name; cleared when the draft is replaced. */
  protected readonly jsonFieldErrors = linkedSignal({
    source: computed(() => this.draftSource().identity),
    computation: (): Partial<Record<string, JsonFieldError>> => ({}),
  });
  private readonly validPayload = computed(() => this.draft().payload);
  protected readonly validPayloadJson = computed(() => {
    const payload = this.validPayload();
    return payload ? formatJson(payload) : '';
  });
  /** Every catalog property of the selected component except its identity and constants. */
  protected readonly editableProperties = computed<EditableProperty[]>(() => {
    const target = this.editableComponent();
    const resolved = this.activeCatalogResolver();
    if (!target || !resolved) {
      return [];
    }
    const schemas = this.selectedComponentSchemas();
    const {common} = resolved;
    const properties = this.catalogService.selectedComponentProperties().flatMap(prop => {
      const schema = schemas[prop.name];
      if (prop.name === 'id' || prop.name === 'component' || schema?.['const'] !== undefined) {
        return [];
      }
      const value = target[prop.name];
      const control = galleryPropertyControl(schema, value);
      return [
        {
          name: prop.name,
          required: prop.required,
          control,
          kind: control.kind,
          options: control.options,
          value,
          json: value === undefined ? '' : formatJson(value),
          note: describeUneditableValue(value, control),
          common: !prop.required && common.has(prop.name),
          firstCommon: false,
        },
      ];
    });
    // Required properties first, then the component's own, then the shared ones.
    const rank = (prop: EditableProperty) => (prop.required ? 0 : prop.common ? 2 : 1);
    const sorted = properties
      .map((prop, index) => ({prop, index}))
      .sort((a, b) => rank(a.prop) - rank(b.prop) || a.index - b.index)
      .map(({prop}) => prop);
    const firstCommon = sorted.findIndex(prop => prop.common);
    return sorted.map((prop, index) =>
      index === firstCommon ? {...prop, firstCommon: true} : prop,
    );
  });

  /** Property names every component in the catalog declares. */
  private commonPropertyNames(resolver: CatalogSchemaResolver, catalog: Catalog): Set<string> {
    const names = Object.keys(catalog.components ?? {});
    if (names.length < 2) {
      return new Set();
    }
    const [first, ...rest] = names.map(
      name => new Set(Object.keys(resolver.resolveComponentPropertiesSchema(name))),
    );
    return new Set([...first].filter(prop => rest.every(set => set.has(prop))));
  }

  /** Property Editor form reads and writes to. Prioritize 'target'
   * or 'root' nodes when it matches the selected component type so
   * child nodes of the same type don't shadow it */
  private editableComponent(): Record<string, unknown> | undefined {
    const key = this.catalogService.selectedComponentKey();
    const usage = this.draft().preset?.usage;

    if (!usage || !key) {
      return undefined;
    }

    return (
      usage.find(
        component =>
          component['component'] === key &&
          (component['id'] === 'target' || component['id'] === 'root'),
      ) ?? usage.find(component => component['component'] === key)
    );
  }

  private createDraft(preset: ComponentUsage | null, catalog: Catalog | null): ExampleDraft {
    const id = catalog?.catalogId || catalog?.$id;
    if (!preset || !Array.isArray(preset.usage) || !catalog || !id) {
      return {text: '', preset: null, payload: null, error: null};
    }
    try {
      const copy = structuredClone(preset);
      return {
        text: formatJson({
          ['components']: copy.usage,
          ...(copy.data !== undefined ? {['data']: copy.data} : {}),
        }),
        preset: copy,
        payload: this.buildA2UIPayload(copy, id),
        error: null,
      };
    } catch (error) {
      this.logger.error('Failed to load component example:', error);
      return {
        text: '',
        preset: null,
        payload: null,
        error: 'Could not load this component example.',
      };
    }
  }

  /** Retains every edit; preview and actions keep the last valid example when parsing fails. */
  protected editDraft(text: string, propertyEdit = false): string | null {
    const catalog = this.catalogManagement.activeCatalog();
    const id = this.catalogId();
    if (!catalog || !id) {
      return null;
    }
    this.actionMessage.set('');
    try {
      const preset = parseGalleryExample(text, catalog, this.errorLogger);

      if (!propertyEdit) {
        this.jsonFieldErrors.set({});
      }

      this.draft.set({
        text,
        preset,
        payload: this.buildA2UIPayload(preset, id),
        error: null,
      });
      return null;
    } catch (error) {
      const reason =
        error instanceof SyntaxError
          ? 'Invalid JSON.'
          : error instanceof Error
            ? error.message
            : 'Invalid example.';
      if (propertyEdit) {
        this.actionMessage.set(`${reason} Preview keeps its previous value.`);
        return reason;
      }
      this.draft.update(draft => ({
        ...draft,
        text,
        error: `${reason} Preview and actions use the last valid example.`,
      }));
      return `${reason} Preview and actions use the last valid example.`;
    }
  }

  /** Sets one property on the selected component, or removes it when value is undefined. */
  protected editProperty(name: string, value: unknown): string | null {
    const preset = this.draft().preset;
    const target = this.editableComponent();
    if (!preset || !target || this.draft().error) {
      return null;
    }
    if (value === undefined) {
      this.jsonFieldErrors.update(errors =>
        Object.fromEntries(
          Object.entries(errors).filter(([key]) => key !== name && !key.startsWith(`${name}.`)),
        ),
      );
    }
    const components = preset.usage.map(component => {
      if (component !== target) {
        return component;
      }
      if (value !== undefined) {
        return {...component, [name]: value};
      }
      const {[name]: _removed, ...rest} = component;
      return rest;
    });
    return this.editDraft(
      formatJson({
        ['components']: components,
        ...(preset.data !== undefined ? {['data']: preset.data} : {}),
      }),
      true,
    );
  }

  protected describeUneditable(value: unknown, control: GalleryPropertyControl): string | null {
    return describeUneditableValue(value, control);
  }

  protected asArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
  }

  protected getObjectField(value: unknown, key: string): unknown {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)[key]
      : undefined;
  }

  protected appendPath(path: PropertyPath, segment: string | number): PropertyPath {
    return [...path, segment];
  }

  protected formatJsonValue(value: unknown): string {
    return value === undefined ? '' : formatJson(value);
  }

  /** Updates a top-level or nested property at `path`. */
  protected editAtPath(path: PropertyPath, value: unknown): string | null {
    if (path.length === 0) {
      return null;
    }
    const [rootName, ...rest] = path;
    if (typeof rootName !== 'string') {
      return null;
    }
    if (rest.length === 0) {
      return this.editProperty(rootName, value);
    }
    const currentRoot = this.editableComponent()?.[rootName];
    const topProp = this.editableProperties().find(prop => prop.name === rootName);
    const updatedRoot = this.setDeepValue(
      currentRoot,
      rest,
      value,
      topProp?.control,
      topProp?.required ?? false,
    );
    return this.editProperty(rootName, updatedRoot);
  }

  /** Empty optional text removes the property; required text may be empty. */
  protected editTextAtPath(path: PropertyPath, value: string, required: boolean): void {
    this.editAtPath(path, value === '' && !required ? undefined : value);
  }

  /** Empty optional numbers remove the property; a required number keeps its value. */
  protected editNumberAtPath(
    path: PropertyPath,
    value: number | null,
    required: boolean,
    label: string,
  ): void {
    if (value !== null && Number.isFinite(value)) {
      this.editAtPath(path, value);
    } else if (!required) {
      this.editAtPath(path, undefined);
    } else {
      this.actionMessage.set(`Enter a number for ${label}. Preview keeps its previous value.`);
    }
  }

  /** Parses a structured JSON property; invalid JSON stays in its field and leaves the draft alone. */
  protected editJsonAtPath(
    path: PropertyPath,
    pathKey: string,
    required: boolean,
    label: string,
    text: string,
  ): void {
    const setError = (message: string) => {
      this.jsonFieldErrors.update(errors => ({...errors, [pathKey]: {text, message}}));
    };
    let value: unknown;
    if (!text.trim()) {
      if (required) {
        setError(`${label} is required.`);
        return;
      }
      value = undefined;
    } else {
      try {
        value = JSON.parse(text);
      } catch {
        setError('Invalid JSON. The example keeps its previous value.');
        return;
      }
    }
    const error = this.editAtPath(path, value);
    if (error) {
      this.actionMessage.set('');
      setError(`${error} The example keeps its previous value.`);
      return;
    }
    this.jsonFieldErrors.update(({[pathKey]: _cleared, ...errors}) => errors);
  }

  /**
   * Adds an entry to an array property: duplicates the latest entry if non-empty, or creates
   * a brand-new item based on the array's item control type when empty.
   */
  protected addArrayItem(
    path: PropertyPath,
    itemControl: GalleryPropertyControl | undefined,
  ): void {
    const current = this.getValueAtPath(path);
    const items = Array.isArray(current) ? current : [];
    const nextItem =
      items.length > 0
        ? structuredClone(items[items.length - 1])
        : createDefaultGalleryValue(itemControl);
    this.editAtPath(path, [...items, nextItem]);
  }

  /** Deletes the item at `index` from the array at `path`. */
  protected removeArrayItem(path: PropertyPath, index: number): void {
    const current = this.getValueAtPath(path);
    if (!Array.isArray(current)) {
      return;
    }
    const prefix = `${path.map(String).join('.')}.`;
    this.jsonFieldErrors.update(errors =>
      Object.fromEntries(Object.entries(errors).filter(([key]) => !key.startsWith(prefix))),
    );
    this.editAtPath(
      path,
      current.filter((_, idx) => idx !== index),
    );
  }

  /** Deep-gets a value from the editable component by the property path. */
  private getValueAtPath(path: PropertyPath): unknown {
    let current: unknown = this.editableComponent();
    for (const segment of path) {
      if (typeof segment === 'number') {
        if (!Array.isArray(current)) {
          return undefined;
        }
        current = current[segment];
      } else {
        if (current === null || typeof current !== 'object' || Array.isArray(current)) {
          return undefined;
        }
        current = (current as Record<string, unknown>)[segment];
      }
    }
    return current;
  }

  /** Deep-sets a value into the editable component at `path`, pruning optional branches that become empty. */
  private setDeepValue(
    current: unknown,
    path: PropertyPath,
    value: unknown,
    control?: GalleryPropertyControl,
    required = false,
  ): unknown {
    if (path.length === 0) {
      return value;
    }
    const [head, ...tail] = path;
    if (typeof head === 'number') {
      const nextArray = Array.isArray(current) ? [...current] : [];
      nextArray[head] = this.setDeepValue(nextArray[head], tail, value, control?.itemControl, true);
      return nextArray;
    }
    const nextObject: Record<string, unknown> =
      current !== null && typeof current === 'object' && !Array.isArray(current)
        ? {...(current as Record<string, unknown>)}
        : {};
    const subProp = control?.properties?.find(prop => prop.name === head);
    const nextValue = this.setDeepValue(
      nextObject[head],
      tail,
      value,
      subProp?.control,
      subProp?.required ?? false,
    );
    if (nextValue === undefined) {
      delete nextObject[head];
    } else {
      nextObject[head] = nextValue;
    }
    if (!required && Object.keys(nextObject).length === 0) {
      return undefined;
    }
    return nextObject;
  }

  protected resetDraft(): void {
    this.actionMessage.set('');
    this.jsonFieldErrors.set({});
    this.draft.set(
      this.createDraft(
        this.catalogService.selectedComponentPreset(),
        this.catalogManagement.activeCatalog(),
      ),
    );
  }

  protected async openInComposer(): Promise<void> {
    const payload = this.validPayloadJson();
    const renderer = this.rendererUrl();
    if (!payload || !renderer || this.opening()) {
      return;
    }
    this.opening.set(true);
    this.actionMessage.set('');
    try {
      await this.launcher.open(payload, renderer, this.startupConfigState.selectedRendererId());
    } catch (error) {
      this.actionMessage.set(
        error instanceof Error ? error.message : 'Could not open this example.',
      );
    } finally {
      this.opening.set(false);
    }
  }

  constructor() {
    this.hostCommunication.messageStream$
      .pipe(
        filter(envelope => envelope?.type === PreviewBridgeMessageType.RENDERER_READY),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.dispatchSelectedComponentPayload();
      });

    effect(() => {
      this.dispatchSelectedComponentPayload();
    });
  }

  /**
   * Constructs the A2UI layout and data model command payload.
   *
   * Note: Properties explicitly declared in `declare interface` definitions (like `RenderA2uiItem`,
   * `CreateSurfaceDetails`, `UpdateComponentsDetails`, `UpdateDataModelDetails`) are emitted in externs
   * by tsickle, so JSCompiler (Closure Compiler) preserves their names without needing bracket notation.
   */
  private buildA2UIPayload(preset: ComponentUsage, catalogId: string): RenderA2uiItem[] {
    const payload: RenderA2uiItem[] = [
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'gallery-preview',
          catalogId: catalogId,
        },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'gallery-preview',
          components: this.getComponentsPayload(preset.usage),
        },
      },
    ];

    const dataObj = preset.data;
    if (dataObj !== undefined) {
      const cmd3: RenderA2uiItem = {
        version: 'v0.9',
        updateDataModel: {
          surfaceId: 'gallery-preview',
          value: dataObj,
        },
      };
      payload.push(cmd3);
    }

    return payload;
  }

  private dispatchSelectedComponentPayload(): void {
    const payload = this.validPayload();
    if (!payload) {
      return;
    }
    try {
      this.hostCommunication.sendRenderA2UI(payload);
    } catch (error) {
      this.actionMessage.set('Could not update the preview. Select the component again to retry.');
      this.logger.error('Failed to dispatch component example:', error);
    }
  }

  ngOnInit(): void {
    this.catalogService.setGalleryActive(true);
    this.usageTrackingService.trackGalleryView();
  }

  ngOnDestroy(): void {
    this.catalogService.setGalleryActive(false);
  }

  /** Whether usage samples are currently loading from the bridge. */
  protected readonly loadingUsages = this.catalogService.loadingUsages;

  /** The alphabetized component list categorized by Layout, Content, Input, Feedback, Other. */
  protected readonly componentsList = this.catalogService.componentsList;

  /** The key of the currently selected component. */
  protected readonly selectedComponentKey = this.catalogService.selectedComponentKey;

  /** The parsed property specifications for the selected component. */
  protected readonly selectedComponentProperties = this.catalogService.selectedComponentProperties;

  /** The formatted JSON usage snippet containing the component array. */
  protected readonly selectedComponentUsage = this.catalogService.selectedComponentUsage;

  protected readonly catalogId = computed<string | null>(() => {
    const catalog = this.catalogManagement.activeCatalog();
    if (!catalog) {
      return null;
    }
    return catalog.catalogId || catalog.$id || null;
  });

  /** The table column names mapped by MatTable. */
  protected readonly displayedColumns: string[] = [
    'name',
    'description',
    'type',
    'required',
    'defaultValue',
  ];

  /** The resolved schema description for the selected component. */
  protected readonly selectedComponentDescription = computed<string>(() => {
    const key = this.selectedComponentKey();
    const catalog = this.catalogManagement.activeCatalog();
    const comp =
      key && catalog && catalog.components
        ? (catalog.components as Record<string, Record<string, unknown>>)[key]
        : null;
    return comp && typeof comp['description'] === 'string' ? (comp['description'] as string) : '';
  });

  /**
   * Sets the selected component key.
   *
   * @param key The component key or null to deselect.
   */
  protected selectComponent(key: string | null): void {
    this.catalogService.selectComponent(key);
  }

  private getComponentsPayload(components: Record<string, unknown>[]): Record<string, unknown>[] {
    if (components.some(component => component['id'] === 'root')) {
      return components;
    }

    // Legacy usage examples name their root "target". Keep the authored tree and
    // properties intact; A2UI v0.9 only requires its root component to be named "root".
    // This allows 'target' as the id to work.
    return components.map(component =>
      component['id'] === 'target' ? {...component, id: 'root'} : component,
    );
  }

  /**
   * Copies formatted A2UI JSON payload commands to the user's clipboard.
   */
  protected copyToClipboard(): void {
    const payload = this.validPayloadJson();
    if (!payload) {
      return;
    }
    try {
      if (this.clipboard.copy(payload)) {
        this.actionMessage.set('Copied the last valid example JSON.');
        this.usageTrackingService.trackGalleryCopyUsage({
          componentKey: this.selectedComponentKey() || '',
        });
      } else {
        this.actionMessage.set('Could not copy JSON. Try again.');
        this.logger.error('Failed to copy A2UI component usage to clipboard.');
      }
    } catch (error) {
      this.actionMessage.set('Could not copy JSON. Try again.');
      this.logger.error('Failed to parse or format A2UI usage payload: ', error);
    }
  }
}
