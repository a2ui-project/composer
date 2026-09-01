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
 * Theater recordings — recorded A2UI v0.9 message streams for playback.
 *
 * Built programmatically from the same flight/sales example assets the
 * Assembled Components page uses, so recordings never drift from the catalog
 * and add no duplicate fixtures. Each recording is the sequence a real agent
 * would emit: `createSurface` → `updateComponents(tree)` → one
 * `updateDataModel` per data state, so replaying it shows the surface get
 * built and then evolve across states.
 *
 * Messages carry a canonical placeholder `surfaceId: 'session'`; the Theater
 * playback engine rewrites it to a live surface id at replay time.
 */
import {DASHBOARD_CATALOG_ID} from '../custom-catalog/catalog/dashboard-catalog';
import salesSchema from '../custom-catalog/assembled/examples/sales-schema.json';
import salesData from '../custom-catalog/assembled/examples/sales-data.json';
import flightSchema from '../custom-catalog/assembled/examples/flight-schema.json';
import flightData from '../custom-catalog/assembled/examples/flight-data.json';

/** Canonical surface id in recordings; rewritten to a live id at replay. */
export const RECORDING_SURFACE_ID = 'session';

/** One recorded A2UI v0.9 protocol message. */
export interface TheaterMessage {
  version: 'v0.9';
  [key: string]: unknown;
}

/** A named data state of a demo (`[{name, data}]` example files). */
interface DataState {
  name: string;
  data: Record<string, unknown>;
}

/** A recorded session: an ordered stream of A2UI messages plus metadata. */
export interface TheaterRecording {
  id: string;
  label: string;
  icon: string;
  description: string;
  messages: TheaterMessage[];
}

/**
 * Assembles a recording from a component tree and a list of data states:
 * createSurface, then updateComponents, then one updateDataModel per state.
 */
function buildRecording(
  id: string,
  label: string,
  icon: string,
  description: string,
  components: unknown[],
  states: DataState[],
): TheaterRecording {
  const surfaceId = RECORDING_SURFACE_ID;
  const messages: TheaterMessage[] = [
    {version: 'v0.9', createSurface: {surfaceId, catalogId: DASHBOARD_CATALOG_ID}},
    {version: 'v0.9', updateComponents: {surfaceId, components}},
    ...states.map(state => ({
      version: 'v0.9' as const,
      updateDataModel: {surfaceId, path: '/', op: 'replace', value: state.data},
    })),
  ];
  return {id, label, icon, description, messages};
}

export const RECORDINGS: TheaterRecording[] = [
  buildRecording(
    'sales',
    'Sales Dashboard',
    'insights',
    'A KPI dashboard built from one tree, then re-bound across four quarters of data.',
    salesSchema as unknown[],
    salesData as DataState[],
  ),
  buildRecording(
    'flight',
    'Flight Search',
    'flight',
    'A Row of FlightCards expanded from a bound array, re-bound as the results change.',
    flightSchema as unknown[],
    flightData as DataState[],
  ),
];
