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

import {Catalog} from '../../storage/models/catalog-storage.model';
import {asRecord} from '../../utils/json';

/**
 * Builds the component tree of A2UI surfaces from their messages.
 *
 * A2UI v0.9 describes a surface as a flat list of components (an adjacency
 * list) in which components reference other components by id, via properties
 * typed `ComponentId` (a single child) or `ChildList` (a list of ids or a
 * data-bound template). The tree is the expansion of these references from
 * the `root` component. The protocol does not guarantee that the references
 * form a tree, so the builder also reports:
 * - references to undefined components (`missing`),
 * - references to an ancestor (`cycle`, not expanded further),
 * - components referenced more than once (`shared`; expanded at each use),
 * - components not reachable from `root` (`unreachable`).
 *
 * Reference properties are discovered from the catalog's JSON schema
 * (`$ref`s to `ComponentId` / `ChildList`, at any depth, e.g. `tabs[].child`),
 * falling back to the conventional `child` / `children` properties for
 * components whose schema is unknown.
 */

/** Reference status of a tree node. */
export type ComponentTreeNodeStatus = 'ok' | 'missing' | 'cycle';

/** A component occurrence in the expanded tree. */
export interface ComponentTreeNode {
  /** Unique key of this occurrence (its reference path from the root). */
  readonly key: string;
  /** The referenced component id. */
  readonly id: string;
  /** The component type, or null if the component is not defined. */
  readonly type: string | null;
  /** The referencing property, e.g. `children`, `tabs[1].child`. */
  readonly via: string | null;
  readonly status: ComponentTreeNodeStatus;
  /** True if the component is referenced from more than one place. */
  readonly shared: boolean;
  /**
   * For template children, the data model path whose items each render one
   * instance of this component.
   */
  readonly template: string | null;
  readonly children: readonly ComponentTreeNode[];
}

/** The component tree of one surface. */
export interface SurfaceComponentTree {
  readonly surfaceId: string;
  /** The tree from the `root` component, or null if there is none yet. */
  readonly root: ComponentTreeNode | null;
  /** Subtrees of components that are not reachable from `root`. */
  readonly unreachable: readonly ComponentTreeNode[];
  /** Number of defined components. */
  readonly componentCount: number;
  /** True if expansion stopped early because the tree was too large. */
  readonly truncated: boolean;
}

/** Root component id mandated by the A2UI protocol. */
export const ROOT_COMPONENT_ID = 'root';

/** Upper bound on expanded nodes (shared references can multiply nodes). */
const MAX_NODES = 5000;

const COMPONENT_ID_DEF = 'ComponentId';
const CHILD_LIST_DEF = 'ChildList';
const LOCAL_DEFS_PREFIX = '#/$defs/';
const ANY_INDEX = '*';

type ReferenceKind = 'single' | 'list';

/**
 * Returns the kind of component reference a `$ref` points to, if any. Matches
 * both separate common-types schemas (`common_types.json#/$defs/ChildList`)
 * and bundled catalogs with namespaced definitions
 * (`#/$defs/common_types_ChildList`).
 */
function referenceKindOf(ref: string): ReferenceKind | null {
  const name = ref.slice(ref.lastIndexOf('/') + 1);
  const is = (def: string) => name === def || name.endsWith(`_${def}`);
  if (is(COMPONENT_ID_DEF)) return 'single';
  if (is(CHILD_LIST_DEF)) return 'list';
  return null;
}

/** A property path (within a component) holding component references. */
interface ReferenceSlot {
  /** Property names, with `*` for "every array item". */
  readonly path: readonly string[];
  readonly kind: ReferenceKind;
}

/** A concrete reference found in a component instance. */
interface Reference {
  readonly id: string;
  readonly via: string;
  readonly template: string | null;
}

type ComponentRecord = Record<string, unknown>;

interface SurfaceState {
  readonly components: Map<string, ComponentRecord>;
}

const FALLBACK_SLOTS: readonly ReferenceSlot[] = [
  {path: ['child'], kind: 'single'},
  {path: ['children'], kind: 'list'},
];

/** Collects the surfaces described by a list of A2UI messages, in order. */
function collectSurfaces(messages: readonly unknown[]): Map<string, SurfaceState> {
  const surfaces = new Map<string, SurfaceState>();
  const surfaceFor = (id: string) => {
    let state = surfaces.get(id);
    if (!state) {
      state = {components: new Map()};
      surfaces.set(id, state);
    }
    return state;
  };
  for (const message of messages) {
    const record = asRecord(message);
    if (!record) continue;
    const create = asRecord(record['createSurface']);
    if (create && typeof create['surfaceId'] === 'string') {
      const state = surfaceFor(create['surfaceId']);
      state.components.clear();
    }
    const update = asRecord(record['updateComponents']);
    if (update && typeof update['surfaceId'] === 'string' && Array.isArray(update['components'])) {
      const state = surfaceFor(update['surfaceId']);
      for (const component of update['components']) {
        const c = asRecord(component);
        if (c && typeof c['id'] === 'string') state.components.set(c['id'], c);
      }
    }
    const del = asRecord(record['deleteSurface']);
    if (del && typeof del['surfaceId'] === 'string') {
      surfaces.delete(del['surfaceId']);
    }
  }
  return surfaces;
}

/** Discovers the reference slots of each component type from the catalog. */
class ReferenceSchema {
  private readonly cache = new Map<string, readonly ReferenceSlot[] | null>();

  constructor(private readonly catalog: Catalog | null) {}

  slotsFor(type: string): readonly ReferenceSlot[] {
    if (!this.cache.has(type)) {
      const schema = this.catalog?.components?.[type];
      let slots: ReferenceSlot[] | null = null;
      if (schema) {
        slots = [];
        this.walk(schema, [], slots, new Set());
        slots = slots.filter(s => !(s.path.length === 1 && s.path[0] === 'id'));
      }
      this.cache.set(type, slots);
    }
    return this.cache.get(type) ?? FALLBACK_SLOTS;
  }

  private walk(
    schema: unknown,
    path: readonly string[],
    out: ReferenceSlot[],
    visitingDefs: Set<string>,
  ): void {
    const s = asRecord(schema);
    if (!s) return;
    const ref = s['$ref'];
    if (typeof ref === 'string') {
      const kind = referenceKindOf(ref);
      if (kind) {
        out.push({path, kind});
        return;
      }
      if (ref.startsWith(LOCAL_DEFS_PREFIX)) {
        const name = ref.slice(LOCAL_DEFS_PREFIX.length);
        if (!visitingDefs.has(name)) {
          visitingDefs.add(name);
          this.walk(this.catalog?.$defs?.[name], path, out, visitingDefs);
          visitingDefs.delete(name);
        }
      }
    }
    for (const key of ['allOf', 'anyOf', 'oneOf']) {
      const variants = s[key];
      if (Array.isArray(variants)) {
        for (const variant of variants) this.walk(variant, path, out, visitingDefs);
      }
    }
    const properties = asRecord(s['properties']);
    if (properties) {
      for (const [name, propertySchema] of Object.entries(properties)) {
        this.walk(propertySchema, [...path, name], out, visitingDefs);
      }
    }
    if (s['items'] !== undefined) {
      this.walk(s['items'], [...path, ANY_INDEX], out, visitingDefs);
    }
  }
}

/** Returns the references held by [component], in property order. */
function referencesOf(component: ComponentRecord, schema: ReferenceSchema): Reference[] {
  const type = typeof component['component'] === 'string' ? component['component'] : '';
  const refs: Reference[] = [];
  const seenSlots = new Set<string>();
  for (const slot of schema.slotsFor(type)) {
    const slotKey = `${slot.kind}:${slot.path.join('.')}`;
    if (seenSlots.has(slotKey)) continue;
    seenSlots.add(slotKey);
    collect(component, slot.path, 0, '', slot.kind, refs);
  }
  return refs;
}

function collect(
  value: unknown,
  path: readonly string[],
  index: number,
  label: string,
  kind: ReferenceKind,
  out: Reference[],
): void {
  if (index === path.length) {
    if (kind === 'single') {
      if (typeof value === 'string') out.push({id: value, via: label, template: null});
      return;
    }
    if (Array.isArray(value)) {
      for (const id of value) {
        if (typeof id === 'string') out.push({id, via: label, template: null});
      }
      return;
    }
    const template = asRecord(value);
    if (template && typeof template['componentId'] === 'string') {
      out.push({
        id: template['componentId'],
        via: label,
        template: typeof template['path'] === 'string' ? template['path'] : '',
      });
    }
    return;
  }
  const segment = path[index];
  if (segment === ANY_INDEX) {
    if (!Array.isArray(value)) return;
    value.forEach((item, i) => {
      collect(item, path, index + 1, `${label}[${i}]`, kind, out);
    });
    return;
  }
  const record = asRecord(value);
  if (!record || !(segment in record)) return;
  collect(record[segment], path, index + 1, label ? `${label}.${segment}` : segment, kind, out);
}

/**
 * Builds the component trees of all surfaces described by [messages] (a list
 * of A2UI v0.9 server-to-client messages), using [catalog] to find reference
 * properties.
 */
export function buildComponentTrees(
  messages: readonly unknown[],
  catalog: Catalog | null,
): SurfaceComponentTree[] {
  const schema = new ReferenceSchema(catalog);
  const trees: SurfaceComponentTree[] = [];
  for (const [surfaceId, state] of collectSurfaces(messages)) {
    trees.push(buildSurfaceTree(surfaceId, state, schema));
  }
  return trees;
}

function buildSurfaceTree(
  surfaceId: string,
  state: SurfaceState,
  schema: ReferenceSchema,
): SurfaceComponentTree {
  const {components} = state;
  const references = new Map<string, Reference[]>();
  const referenceCounts = new Map<string, number>();
  for (const [id, component] of components) {
    const refs = referencesOf(component, schema);
    references.set(id, refs);
    for (const ref of refs) {
      referenceCounts.set(ref.id, (referenceCounts.get(ref.id) ?? 0) + 1);
    }
  }

  const visited = new Set<string>();
  let nodeCount = 0;
  let truncated = false;

  const expand = (
    id: string,
    via: string | null,
    template: string | null,
    key: string,
    ancestors: ReadonlySet<string>,
  ): ComponentTreeNode => {
    nodeCount++;
    const component = components.get(id);
    const type =
      component && typeof component['component'] === 'string' ? component['component'] : null;
    const shared = (referenceCounts.get(id) ?? 0) > 1;
    const base = {key, id, type, via, shared, template};
    if (!component) {
      return {...base, status: 'missing', children: []};
    }
    if (ancestors.has(id)) {
      return {...base, status: 'cycle', children: []};
    }
    visited.add(id);
    const nextAncestors = new Set(ancestors).add(id);
    const children: ComponentTreeNode[] = [];
    for (const [i, ref] of (references.get(id) ?? []).entries()) {
      if (nodeCount >= MAX_NODES) {
        truncated = true;
        break;
      }
      children.push(expand(ref.id, ref.via, ref.template, `${key}/${i}:${ref.id}`, nextAncestors));
    }
    return {...base, status: 'ok', children};
  };

  const root = components.has(ROOT_COMPONENT_ID)
    ? expand(ROOT_COMPONENT_ID, null, null, ROOT_COMPONENT_ID, new Set())
    : null;

  // Unreachable components: start from those no other unreachable component
  // references, then pick up any remaining (cyclic) ones.
  const unreachable: ComponentTreeNode[] = [];
  const pending = [...components.keys()].filter(id => !visited.has(id));
  const referencedByPending = new Set<string>();
  for (const id of pending) {
    for (const ref of references.get(id) ?? []) referencedByPending.add(ref.id);
  }
  const orderedStarts = [
    ...pending.filter(id => !referencedByPending.has(id)),
    ...pending.filter(id => referencedByPending.has(id)),
  ];
  for (const id of orderedStarts) {
    if (visited.has(id)) continue;
    if (nodeCount >= MAX_NODES) {
      truncated = true;
      break;
    }
    unreachable.push(expand(id, null, null, `~${id}`, new Set()));
  }

  return {
    surfaceId,
    root,
    unreachable,
    componentCount: components.size,
    truncated,
  };
}
