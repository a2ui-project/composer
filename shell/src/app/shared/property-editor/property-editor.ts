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
  Signal,
  WritableSignal,
  computed,
  inject,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {Catalog, CatalogComponentSchema} from '../../storage/models/catalog-storage.model';
import {CatalogSchemaResolver, ParsedProperty} from '../../gallery/schema/catalog-schema-resolver';
import {
  createDefaultPropertyValue,
  describeUneditableValue,
  matchesSimpleSchema,
  PropertyControl,
  resolvePropertyControl,
} from './property-editor-utils';
import {ErrorLogger} from '../../debug/error-logger.service';
import {formatJson} from '../../utils/json';
import {stableStringify} from '../../storage/stable-stringify/stable-stringify';

type PropertyPath = ReadonlyArray<string | number>;

/**
 * Payload emitted when a top-level property on the target component is edited or removed.
 */
export interface PropertyChangeEvent {
  name: string;
  value: unknown;
}

/**
 * Metadata and control state for one editable catalog property of the selected component.
 */
export interface EditableProperty {
  name: string;
  required: boolean;
  control: PropertyControl;
  kind: PropertyControl['kind'];
  options: PropertyControl['options'];
  /** The current value, or undefined when the example omits the property. */
  value: unknown;
  /** Formatted JSON representation of the value, or empty string when undefined. */
  json: string;
  /** Set when the value is a binding or call that only the JSON tab can edit. */
  note: string | null;
  /** True for properties every component in the catalog shares, such as accessibility. */
  common: boolean;
  /** True on the first common property, where the list starts its common section. */
  firstCommon: boolean;
}

/**
 * An unparsed JSON property edit, kept so the field shows what was typed.
 */
interface JsonFieldError {
  text: string;
  message: string;
}

/**
 * Standalone property editor component that renders schema-driven form controls
 * for an A2UI component definition.
 */
@Component({
  selector: 'a2ui-composer-property-editor',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    FormsModule,
    MatInputModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './property-editor.ng.html',
  styleUrl: './property-editor.scss',
})
export class PropertyEditor {
  private readonly catalogManagement = inject(CatalogManagement);
  private readonly errorLogger = inject(ErrorLogger);

  /** The A2UI component object being inspected and edited. */
  readonly component = input<Record<string, unknown> | null | undefined>(null);

  /**
   * Optional override for the component type key; defaults to `component()['component']`.
   */
  readonly componentKey = input<string | null | undefined>(undefined);

  /**
   * Optional catalog override; defaults to `CatalogManagement.activeCatalog()`.
   */
  readonly catalog = input<Catalog | null | undefined>(undefined);

  /**
   * Optional pre-resolved property specifications; when omitted, resolved automatically
   * from the active catalog and `componentKey`.
   */
  readonly properties = input<ParsedProperty[] | null | undefined>(undefined);

  /** Whether all property controls and actions are disabled. */
  readonly disabled = input<boolean>(false);

  /**
   * Optional identity key from the host that resets inline JSON field errors when changed.
   */
  readonly resetKey = input<unknown>(null);

  /** Emits `{name, value}` when a top-level property is updated or removed (`undefined`). */
  readonly propertyChange = output<PropertyChangeEvent>();

  /** Emits the updated component record when a property is updated or removed. */
  readonly componentChange = output<Record<string, unknown>>();

  /** Emits a status or validation message when an edit requires user feedback. */
  readonly statusMessage = output<string>();

  protected readonly formatJson = formatJson;
  protected readonly describeUneditableValue = describeUneditableValue;

  private readonly activeCatalog: Signal<Catalog | null> = computed(() => {
    const explicitCatalog = this.catalog();
    return explicitCatalog !== undefined ? explicitCatalog : this.catalogManagement.activeCatalog();
  });

  private readonly catalogSignature: Signal<string | null> = computed(() => {
    const catalog = this.activeCatalog();
    return catalog ? stableStringify(catalog) : null;
  });

  private readonly resolvedComponentKey: Signal<string | null> = computed(() => {
    const explicitKey = this.componentKey();
    if (typeof explicitKey === 'string' && explicitKey) {
      return explicitKey;
    }
    const target = this.component();
    const typeName = target?.['component'];
    return typeof typeName === 'string' && typeName ? typeName : null;
  });

  /**
   * Memoized schema resolver and shared property names, computed once per active catalog.
   */
  private readonly activeCatalogResolver: Signal<{
    resolver: CatalogSchemaResolver;
    common: Set<string>;
  } | null> = computed(() => {
    const catalog = this.activeCatalog();
    if (!catalog) {
      return null;
    }
    const resolver = new CatalogSchemaResolver(catalog, this.errorLogger);
    return {
      resolver,
      common: this.commonPropertyNames(resolver, catalog),
    };
  });

  /**
   * Memoized property schemas for the active component so keystrokes don't re-resolve schemas.
   */
  private readonly selectedComponentSchemas: Signal<Record<string, CatalogComponentSchema>> =
    computed(() => {
      const key = this.resolvedComponentKey();
      const resolved = this.activeCatalogResolver();
      return key && resolved ? resolved.resolver.resolveComponentPropertiesSchema(key) : {};
    });

  private readonly resolvedProperties: Signal<ParsedProperty[]> = computed(() => {
    const explicitProperties = this.properties();
    if (explicitProperties) {
      return explicitProperties;
    }
    const key = this.resolvedComponentKey();
    const resolved = this.activeCatalogResolver();
    return key && resolved ? resolved.resolver.resolveComponentProperties(key) : [];
  });

  private readonly contextIdentity: Signal<string> = computed(() => {
    const target = this.component();
    return JSON.stringify([
      this.catalogSignature(),
      this.resolvedComponentKey(),
      target?.['id'] ?? null,
      this.resetKey(),
    ]);
  });

  /**
   * `jsonFieldErrors` tracks invalid per-property JSON edits keyed by property path,
   * automatically resetting to `{}` whenever the component context identity changes.
   */
  protected readonly jsonFieldErrors: WritableSignal<Partial<Record<string, JsonFieldError>>> =
    linkedSignal({
      source: this.contextIdentity,
      computation: (): Partial<Record<string, JsonFieldError>> => ({}),
    });

  /**
   * Every catalog property of the selected component except its identity and constants.
   */
  protected readonly editableProperties: Signal<EditableProperty[]> = computed(() => {
    const target = this.component();
    const resolved = this.activeCatalogResolver();
    if (!target || !resolved) {
      return [];
    }
    const schemas = this.selectedComponentSchemas();
    const {common} = resolved;
    const properties = this.resolvedProperties().flatMap(prop => {
      const schema = schemas[prop.name];
      if (prop.name === 'id' || prop.name === 'component' || schema?.['const'] !== undefined) {
        return [];
      }
      const value = target[prop.name];
      const control = resolvePropertyControl(schema, value);
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

  /**
   * Clears any pending inline JSON field validation errors.
   */
  clearErrors(): void {
    this.jsonFieldErrors.set({});
  }

  /**
   * Property names every component in the catalog declares.
   */
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

  /**
   * Returns the array's elements for `@for` if it is set in the sample, or an empty
   * list when an optional array property is unset (`undefined`).
   */
  protected ensureArray(value: unknown): unknown[] {
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

  /**
   * Sets one property on the target component, or removes it when value is undefined.
   */
  protected editProperty(name: string, value: unknown): string | null {
    const target = this.component();
    if (!target || this.disabled()) {
      return null;
    }
    if (value === undefined) {
      this.jsonFieldErrors.update(errors =>
        Object.fromEntries(
          Object.entries(errors).filter(([key]) => key !== name && !key.startsWith(`${name}.`)),
        ),
      );
    }
    this.statusMessage.emit('');
    const schema = this.selectedComponentSchemas()[name];
    if (value !== undefined && schema && !matchesSimpleSchema(value, schema)) {
      const componentId =
        typeof target['id'] === 'string' && target['id'].trim()
          ? target['id']
          : (this.resolvedComponentKey() ?? 'target');
      const reason = `"${name}" on "${componentId}" does not match its catalog property type or choices.`;
      this.statusMessage.emit(`${reason} Preview keeps its previous value.`);
      return reason;
    }
    let updatedComponent: Record<string, unknown>;
    if (value !== undefined) {
      updatedComponent = {...target, [name]: value};
    } else {
      const {[name]: _removed, ...rest} = target;
      updatedComponent = rest;
    }
    this.propertyChange.emit({name, value});
    this.componentChange.emit(updatedComponent);
    return null;
  }

  /**
   * Updates a top-level or nested property at `path`.
   */
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
    const currentRoot = this.component()?.[rootName];
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

  /**
   * Empty optional text removes the property; required text may be empty.
   */
  protected editTextAtPath(path: PropertyPath, value: string, required: boolean): void {
    this.editAtPath(path, value === '' && !required ? undefined : value);
  }

  /**
   * Empty optional numbers remove the property; a required number keeps its value.
   */
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
      this.statusMessage.emit(`Enter a number for ${label}. Preview keeps its previous value.`);
    }
  }

  /**
   * Parses a structured JSON property; invalid JSON stays in its field and leaves the draft alone.
   */
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
      this.statusMessage.emit('');
      setError(`${error} The example keeps its previous value.`);
      return;
    }
    this.jsonFieldErrors.update(({[pathKey]: _cleared, ...errors}) => errors);
  }

  /**
   * Adds an entry to an array property: duplicates the latest entry if non-empty, or creates
   * a brand-new item based on the array's item control type when empty.
   */
  protected addArrayItem(path: PropertyPath, itemControl: PropertyControl | undefined): void {
    const current = this.getValueAtPath(path);
    const items = Array.isArray(current) ? current : [];
    const nextItem =
      items.length > 0
        ? structuredClone(items[items.length - 1])
        : createDefaultPropertyValue(itemControl);
    this.editAtPath(path, [...items, nextItem]);
  }

  /**
   * Deletes the item at `index` from the array at `path`.
   */
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

  /**
   * Deep-gets a value from the editable component by the property path.
   */
  private getValueAtPath(path: PropertyPath): unknown {
    let current: unknown = this.component();
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

  /**
   * Deep-sets a value into the editable component at `path`,
   * pruning optional branches that become empty.
   */
  private setDeepValue(
    current: unknown,
    path: PropertyPath,
    value: unknown,
    control?: PropertyControl,
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
}
