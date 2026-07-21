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
 * Hand-authored reference metadata for the 11-component dashboard catalog.
 *
 * Each entry pairs a component with its category, a prose description, a
 * readable prop table, and a self-contained A2UI `usage` tree that renders
 * standalone in the Catalog Reference preview. Prop `type` strings are
 * human-readable aliases of the zod contract in `../catalog/apis.ts`
 * (`DynamicString`, `ChildList`, `ComponentId`, `Action`, `DynamicValue`).
 *
 * Previews favour literal props over data bindings so each tree renders
 * without external context; `data` is supplied only where a component reads
 * the data model. Keep the set in sync with `buildDashboardCatalog()` — a
 * spec test asserts the two match.
 */

/** Reference grouping shown as sidebar section headers. */
export type CatalogCategory = 'Layout' | 'Content' | 'Data Display' | 'Interactive';

/** One documented prop of a catalog component. */
export interface PropDoc {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

/** Full reference entry for one catalog component. */
export interface ComponentDoc {
  /** Matches the `ComponentApi` name (e.g. 'FlightCard'). */
  name: string;
  category: CatalogCategory;
  description: string;
  props: PropDoc[];
  /** A complete, self-contained A2UI component tree (has a root). */
  usage: unknown[];
  /** Optional data model applied to the preview surface. */
  data?: Record<string, unknown>;
}

export const COMPONENT_DOCS: ComponentDoc[] = [
  {
    name: 'Row',
    category: 'Layout',
    description:
      'Horizontal layout container. Accepts a static child-id array or a v0.9 template ({ componentId, path }) that repeats one child per element of a bound array.',
    props: [
      {name: 'children', type: 'ChildList', required: true, description: 'Static child ids or a { componentId, path } template.'},
      {name: 'gap', type: 'number', required: false, description: 'Spacing between children, in pixels.'},
      {name: 'align', type: "'start' | 'center' | 'end' | 'stretch'", required: false, description: 'Cross-axis (vertical) alignment.'},
      {
        name: 'justify',
        type: "'start' | 'center' | 'end' | 'spaceBetween' | 'spaceAround' | 'spaceEvenly' | 'stretch'",
        required: false,
        description: 'Main-axis (horizontal) distribution.',
      },
    ],
    usage: [
      {id: 'root', component: 'Row', gap: 12, children: ['b1', 'b2', 'b3']},
      {id: 'b1', component: 'Badge', text: 'Paid', variant: 'success'},
      {id: 'b2', component: 'Badge', text: 'Pending', variant: 'warning'},
      {id: 'b3', component: 'Badge', text: 'Failed', variant: 'error'},
    ],
  },
  {
    name: 'Column',
    category: 'Layout',
    description: 'Vertical layout container. Same static-or-template child semantics as Row.',
    props: [
      {name: 'children', type: 'ChildList', required: true, description: 'Static child ids or a { componentId, path } template.'},
      {name: 'gap', type: 'number', required: false, description: 'Spacing between children, in pixels.'},
      {name: 'align', type: "'start' | 'center' | 'end' | 'stretch'", required: false, description: 'Cross-axis (horizontal) alignment.'},
    ],
    usage: [
      {id: 'root', component: 'Column', gap: 4, children: ['t1', 't2']},
      {id: 't1', component: 'Title', text: 'Revenue by region', level: 'h2'},
      {id: 't2', component: 'Title', text: 'Share of total this quarter', level: 'h3'},
    ],
  },
  {
    name: 'DashboardCard',
    category: 'Layout',
    description:
      'A titled card with a single child slot. `child` is the id of another component in the tree, letting a flat tree express nested layouts.',
    props: [
      {name: 'title', type: 'DynamicString', required: true, description: 'Card heading.'},
      {name: 'subtitle', type: 'DynamicString', required: false, description: 'Secondary line under the title.'},
      {name: 'child', type: 'ComponentId', required: false, description: 'Id of the component rendered as the card body.'},
    ],
    usage: [
      {id: 'root', component: 'DashboardCard', title: 'Revenue', subtitle: 'Quarter-to-date', child: 'm'},
      {id: 'm', component: 'Metric', label: 'Total revenue', value: '$1.24M', trend: 'up', trendValue: '+12.4%'},
    ],
  },
  {
    name: 'Title',
    category: 'Content',
    description: 'A plain heading. `text` is a DynamicString, so it can be a literal or a { path } binding into the data model.',
    props: [
      {name: 'text', type: 'DynamicString', required: true, description: 'Heading text (literal or path binding).'},
      {name: 'level', type: "'h1' | 'h2' | 'h3'", required: false, description: 'Heading level / visual size.'},
    ],
    usage: [{id: 'root', component: 'Title', text: 'Quarterly Business Review', level: 'h1'}],
  },
  {
    name: 'Badge',
    category: 'Content',
    description: 'A small pill label carrying a semantic status variant.',
    props: [
      {name: 'text', type: 'string', required: true, description: 'Pill label.'},
      {
        name: 'variant',
        type: "'success' | 'warning' | 'error' | 'info' | 'neutral'",
        required: false,
        description: 'Semantic colour (defaults to neutral).',
      },
    ],
    usage: [{id: 'root', component: 'Badge', text: 'On time', variant: 'success'}],
  },
  {
    name: 'Metric',
    category: 'Data Display',
    description: 'A KPI stat block: an uppercase label, a large value, and an optional coloured trend indicator.',
    props: [
      {name: 'label', type: 'DynamicString', required: true, description: 'Uppercase caption above the value.'},
      {name: 'value', type: 'DynamicString', required: true, description: 'The headline figure.'},
      {name: 'trend', type: "'up' | 'down' | 'neutral'", required: false, description: 'Direction of the trend indicator.'},
      {name: 'trendValue', type: 'DynamicString', required: false, description: 'Text shown beside the trend arrow.'},
    ],
    usage: [{id: 'root', component: 'Metric', label: 'New customers', value: '1,284', trend: 'up', trendValue: '+8.2%'}],
  },
  {
    name: 'PieChart',
    category: 'Data Display',
    description:
      'A hand-rolled SVG donut. `data` is a DynamicValue array of { label, value, color? }; slices fall back to a palette when no colour is given.',
    props: [
      {name: 'data', type: 'DynamicValue', required: true, description: 'Array of { label, value, color? } (literal or path binding).'},
      {name: 'innerRadius', type: 'number', required: false, description: 'Donut hole radius (viewBox is 200×200; defaults to 40).'},
    ],
    usage: [
      {
        id: 'root',
        component: 'PieChart',
        innerRadius: 55,
        data: [
          {label: 'NA', value: 54, color: '#4355b9'},
          {label: 'EU', value: 28, color: '#10b981'},
          {label: 'APAC', value: 18, color: '#f59e0b'},
        ],
      },
    ],
  },
  {
    name: 'BarChart',
    category: 'Data Display',
    description:
      'A hand-rolled SVG bar chart. Bars scale to the max value; valuePrefix/valueSuffix decorate each bar label (e.g. 305 → $305K).',
    props: [
      {name: 'data', type: 'DynamicValue', required: true, description: 'Array of { label, value } (literal or path binding).'},
      {name: 'color', type: 'string', required: false, description: 'Bar fill colour.'},
      {name: 'valuePrefix', type: 'string', required: false, description: 'Prepended to each value label.'},
      {name: 'valueSuffix', type: 'string', required: false, description: 'Appended to each value label.'},
    ],
    usage: [
      {
        id: 'root',
        component: 'BarChart',
        color: '#10b981',
        valuePrefix: '$',
        valueSuffix: 'K',
        data: [
          {label: 'Apr', value: 280},
          {label: 'May', value: 305},
          {label: 'Jun', value: 342},
        ],
      },
    ],
  },
  {
    name: 'DataTable',
    category: 'Data Display',
    description: 'A simple table. `columns` declares key/label pairs; `rows` are records keyed by those column keys.',
    props: [
      {name: 'columns', type: '{ key: string; label: string }[]', required: true, description: 'Column definitions in display order.'},
      {name: 'rows', type: 'Record<string, unknown>[]', required: true, description: 'Row records keyed by column key.'},
    ],
    usage: [
      {
        id: 'root',
        component: 'DataTable',
        columns: [
          {key: 'id', label: 'Order'},
          {key: 'customer', label: 'Customer'},
          {key: 'total', label: 'Total'},
          {key: 'status', label: 'Status'},
        ],
        rows: [
          {id: '#10482', customer: 'Acme Corp', total: '$12,480', status: 'Paid'},
          {id: '#10483', customer: 'Globex', total: '$8,320', status: 'Paid'},
          {id: '#10484', customer: 'Initech', total: '$6,150', status: 'Pending'},
        ],
      },
    ],
  },
  {
    name: 'FlightCard',
    category: 'Data Display',
    description:
      'A rich flight-result card — the showcase component. Every string prop is a DynamicString; `action` fires an event (typically book_flight) with a resolved context.',
    props: [
      {name: 'airline', type: 'DynamicString', required: true, description: 'Airline name.'},
      {name: 'airlineLogo', type: 'DynamicString', required: true, description: 'Logo image URL (a broken/empty logo is hidden).'},
      {name: 'flightNumber', type: 'DynamicString', required: true, description: 'Flight number.'},
      {name: 'origin', type: 'DynamicString', required: true, description: 'Origin airport code.'},
      {name: 'destination', type: 'DynamicString', required: true, description: 'Destination airport code.'},
      {name: 'date', type: 'DynamicString', required: true, description: 'Travel date.'},
      {name: 'departureTime', type: 'DynamicString', required: true, description: 'Departure time.'},
      {name: 'arrivalTime', type: 'DynamicString', required: true, description: 'Arrival time.'},
      {name: 'duration', type: 'DynamicString', required: true, description: 'Flight duration.'},
      {name: 'status', type: 'DynamicString', required: true, description: 'Status label (e.g. On time).'},
      {name: 'statusColor', type: 'DynamicString', required: false, description: 'Colour for the status text.'},
      {name: 'price', type: 'DynamicString', required: true, description: 'Fare.'},
      {name: 'action', type: 'Action', required: false, description: 'Event dispatched when the book button is pressed.'},
    ],
    usage: [
      {
        id: 'root',
        component: 'FlightCard',
        airline: 'United',
        airlineLogo: '',
        flightNumber: 'UA 482',
        origin: 'SFO',
        destination: 'JFK',
        date: 'Jul 24',
        departureTime: '08:15',
        arrivalTime: '16:42',
        duration: '5h 27m',
        status: 'On time',
        statusColor: '#10b981',
        price: '$318',
        action: {event: {name: 'book_flight', context: {flightNumber: 'UA 482'}}},
      },
    ],
  },
  {
    name: 'Button',
    category: 'Interactive',
    description:
      'An action button that renders its `child` component as the label. `action` is dispatched through the surface on press; the button shows a confirmed state afterwards.',
    props: [
      {name: 'child', type: 'ComponentId', required: true, description: 'Id of the component rendered as the button label.'},
      {name: 'variant', type: "'primary' | 'secondary' | 'ghost'", required: false, description: 'Visual style.'},
      {name: 'action', type: 'Action', required: false, description: 'Event dispatched when pressed.'},
    ],
    usage: [
      {id: 'root', component: 'Button', variant: 'primary', action: {event: {name: 'book_flight'}}, child: 'label'},
      {id: 'label', component: 'Title', text: 'Book flight', level: 'h3'},
    ],
  },
];
