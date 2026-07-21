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

/**
 * Flight & Dashboard catalog — `ComponentApi` definitions.
 *
 * This catalog assembles two different example trees from the same 11
 * definitions below:
 *
 *   • **Flight Card** — `Row` template-children expand one `FlightCard` per
 *     element of `/flights`, with each instance's `{ path: … }` bindings
 *     scoped to its flight. Exercises repeater + action dispatch.
 *   • **Sales Dashboard** — `DashboardCard`s wrap `Metric`s and charts into
 *     a KPI grid. Scalar props (titles, KPI labels/values) bind to
 *     `/period` + `/kpis`; chart data and table rows are inline literals.
 *
 * ── What is A2UI? ──────────────────────────────────────────────────────────
 * A2UI ("Agent-to-UI") is a protocol that lets an LLM agent drive a real UI
 * by emitting a tree of typed components instead of raw HTML or a single text
 * blob. The frontend ships a **catalog** of components the agent is allowed
 * to use; the agent emits JSON describing which components to render, how
 * they nest, and how they bind to data. The frontend renders them.
 *
 * ── What is a ComponentApi? ────────────────────────────────────────────────
 * It's the contract between the agent and the frontend for a single
 * component: a `name` the agent writes in the JSON tree, and a zod `schema`
 * that describes the legal props. At runtime the renderer's `GenericBinder`
 * uses this schema to resolve path bindings → strings and action unions →
 * callables before handing `props` to your React code.
 *
 * The shared helpers `DynamicStringSchema`, `ChildListSchema`, `ActionSchema`,
 * and `ComponentIdSchema` come straight from the basic catalog so this custom
 * catalog inherits identical binding semantics — path bindings, template
 * children, and action dispatch all Just Work.
 */
import {z} from 'zod';
import type {ComponentApi} from '@a2ui/web_core/v0_9';
import {
  // `{ event: { name, context? } } | null` — at runtime the binder resolves
  // `context` path bindings and hands the renderer a `() => void` callable.
  ActionSchema,
  // Either `string[]` (static child IDs) or `{ componentId, path }` template
  // that repeats one child per element of the bound data-model array.
  ChildListSchema,
  // A plain string that must match a sibling component's `id`.
  ComponentIdSchema,
  // Either a literal string or `{ path }` | `{ call, args, returnType }`.
  // The binder resolves these to plain strings before render.
  DynamicStringSchema,
  // Either a literal (string/number/boolean/array) or `{ path }` | `{ call }`.
  // The binder flags any union containing `{ path }` as DYNAMIC and resolves
  // it to the raw value at render — which is how chart `data` props can bind
  // to an array in the data model.
  DynamicValueSchema,
} from '@a2ui/web_core/v0_9';

/** Shorthand for any prop that should accept an agent's `{ path }` binding. */
const DynString = DynamicStringSchema;

/**
 * A plain heading. `text` is a `DynString` so the agent can pass either a
 * literal or a `{ path }` binding — this is what lets the Sales Dashboard's
 * hero title read from `/period/title` in the data model, for example.
 */
export const TitleApi = {
  name: 'Title',
  schema: z
    .object({
      text: DynString,
      level: z.enum(['h1', 'h2', 'h3']).optional(),
    })
    .strict(),
} as const satisfies ComponentApi;

/**
 * Horizontal layout container.
 *
 * `children: ChildListSchema` is the key to v0.9 **template children**:
 * the agent can pass either a static `["card-1", "card-2"]` array OR a
 * template like `{ componentId: "flight-card", path: "/flights" }`. In the
 * template case, the binder expands the single child component into one
 * instance per element of the bound array, automatically scoping each
 * instance's path bindings to `/flights[i]`.
 */
export const RowApi = {
  name: 'Row',
  schema: z
    .object({
      children: ChildListSchema,
      gap: z.number().optional(),
      align: z.enum(['start', 'center', 'end', 'stretch']).optional(),
      justify: z
        .enum(['start', 'center', 'end', 'spaceBetween', 'spaceAround', 'spaceEvenly', 'stretch'])
        .optional(),
    })
    .strict(),
} as const satisfies ComponentApi;

/** Vertical layout container. Same template-children semantics as Row. */
export const ColumnApi = {
  name: 'Column',
  schema: z
    .object({
      children: ChildListSchema,
      gap: z.number().optional(),
      align: z.enum(['start', 'center', 'end', 'stretch']).optional(),
    })
    .strict(),
} as const satisfies ComponentApi;

/**
 * A titled card with a single `child` slot. `child: ComponentIdSchema` means
 * the agent sends the *ID* of another component in the tree — the renderer
 * resolves it via `buildChild(props.child)`. This is how you keep the tree
 * flat (every component is a top-level entry with a stable `id`) while
 * still expressing nested layouts.
 */
export const DashboardCardApi = {
  name: 'DashboardCard',
  schema: z
    .object({
      title: DynString,
      subtitle: DynString.optional(),
      child: ComponentIdSchema.optional(),
    })
    .strict(),
} as const satisfies ComponentApi;

/**
 * A KPI stat block. `value` / `trendValue` are `DynString` so the Sales
 * Dashboard can drive each metric from `/kpis/*` in the data model while
 * still letting the agent pass plain strings for the fixed bits.
 */
export const MetricApi = {
  name: 'Metric',
  schema: z
    .object({
      label: DynString,
      value: DynString,
      trend: z.enum(['up', 'down', 'neutral']).optional(),
      trendValue: DynString.optional(),
    })
    .strict(),
} as const satisfies ComponentApi;

/**
 * Chart data props use `DynamicValueSchema` so the agent can either pass an
 * inline literal array or a `{ path }` binding into the data model. Per-item
 * shape (label/value, optional color) is the renderer's contract; we document
 * it in the renderer rather than encoding it in the schema so the binding
 * stays transparent.
 */
export const PieChartApi = {
  name: 'PieChart',
  schema: z
    .object({
      data: DynamicValueSchema,
      innerRadius: z.number().optional(),
    })
    .strict(),
} as const satisfies ComponentApi;

/**
 * `valuePrefix` / `valueSuffix` are optional formatters applied to the Y
 * axis and tooltip numbers — e.g. the Sales Dashboard's monthly revenue
 * chart uses `{ valuePrefix: "$", valueSuffix: "K" }` to render a bar value
 * of `305` as `"$305K"` without having to change the underlying data shape.
 */
export const BarChartApi = {
  name: 'BarChart',
  schema: z
    .object({
      data: DynamicValueSchema,
      color: z.string().optional(),
      valuePrefix: z.string().optional(),
      valueSuffix: z.string().optional(),
    })
    .strict(),
} as const satisfies ComponentApi;

export const BadgeApi = {
  name: 'Badge',
  schema: z
    .object({
      text: z.string(),
      variant: z.enum(['success', 'warning', 'error', 'info', 'neutral']).optional(),
    })
    .strict(),
} as const satisfies ComponentApi;

export const DataTableApi = {
  name: 'DataTable',
  schema: z
    .object({
      columns: z.array(z.object({key: z.string(), label: z.string()}).strict()),
      rows: z.array(z.record(z.string(), z.any())),
    })
    .strict(),
} as const satisfies ComponentApi;

/**
 * Interactive button. `action: ActionSchema` is how v0.9 wires user events
 * back to the agent: the agent emits `{ event: { name, context } }`, and at
 * render time the binder hands the React component `props.action` as a
 * **pre-wired `() => void` callable**. Calling it dispatches the event
 * (along with the resolved context values) back to the host.
 */
export const ButtonApi = {
  name: 'Button',
  schema: z
    .object({
      child: ComponentIdSchema,
      variant: z.enum(['primary', 'secondary', 'ghost']).optional(),
      action: ActionSchema.optional(),
    })
    .strict(),
} as const satisfies ComponentApi;

/**
 * A rich flight-result card — the showcase component for the Flight Card
 * example.
 *
 * Every string prop is `DynString`, so the agent can either pass literals
 * ("SFO") or path bindings (`{ path: "origin" }`) that the binder resolves
 * at render time against the data model. When the FlightCard is a template
 * child of a Row bound to `/flights`, each instance's bindings are scoped to
 * `/flights[i]` and pull that flight's airline, origin, destination, price.
 *
 * `action` fires `book_flight` with a context object that itself contains
 * path bindings — the runtime resolves them to the current flight's values
 * at click time, so the agent receives the concrete flight the user chose.
 */
export const FlightCardApi = {
  name: 'FlightCard',
  schema: z
    .object({
      airline: DynString,
      airlineLogo: DynString,
      flightNumber: DynString,
      origin: DynString,
      destination: DynString,
      date: DynString,
      departureTime: DynString,
      arrivalTime: DynString,
      duration: DynString,
      status: DynString,
      statusColor: DynString.optional(),
      price: DynString,
      action: ActionSchema.optional(),
    })
    .strict(),
} as const satisfies ComponentApi;
