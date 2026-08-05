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
 * Flight & Dashboard catalog — Angular assembly.
 *
 * Pairs each of the 11 `ComponentApi` contracts from `./apis` with its native
 * Angular renderer, plus the shared `BASIC_FUNCTIONS` from the basic catalog,
 * so this custom catalog inherits identical path-binding, template-children,
 * and action-dispatch semantics. The result is registered with the A2UI
 * renderer under `copilotkit://app-dashboard-catalog` and referenced by that
 * `catalogId` in `createSurface` messages.
 */
import {AngularCatalog, BASIC_FUNCTIONS} from '@a2ui/angular/v0_9';

import {
  BadgeApi,
  BarChartApi,
  ButtonApi,
  ColumnApi,
  DashboardCardApi,
  DataTableApi,
  FlightCardApi,
  MetricApi,
  PieChartApi,
  RowApi,
  TitleApi,
} from './apis';

import {CcBadge} from './components/badge/badge';
import {CcBarChart} from './components/bar-chart/bar-chart';
import {CcButton} from './components/button/button';
import {CcColumn} from './components/column/column';
import {CcDashboardCard} from './components/dashboard-card/dashboard-card';
import {CcDataTable} from './components/data-table/data-table';
import {CcFlightCard} from './components/flight-card/flight-card';
import {CcMetric} from './components/metric/metric';
import {CcPieChart} from './components/pie-chart/pie-chart';
import {CcRow} from './components/row/row';
import {CcTitle} from './components/title/title';

/** Public catalog id advertised in `createSurface` messages. */
export const DASHBOARD_CATALOG_ID = 'copilotkit://app-dashboard-catalog';

/**
 * Builds the Angular Flight & Dashboard catalog: 11 component definitions,
 * each `{ name, schema }` contract merged with its Angular `component` class.
 */
export function buildDashboardCatalog(): AngularCatalog {
  return new AngularCatalog(
    DASHBOARD_CATALOG_ID,
    [
      {...TitleApi, component: CcTitle},
      {...RowApi, component: CcRow},
      {...ColumnApi, component: CcColumn},
      {...DashboardCardApi, component: CcDashboardCard},
      {...MetricApi, component: CcMetric},
      {...PieChartApi, component: CcPieChart},
      {...BarChartApi, component: CcBarChart},
      {...BadgeApi, component: CcBadge},
      {...DataTableApi, component: CcDataTable},
      {...ButtonApi, component: CcButton},
      {...FlightCardApi, component: CcFlightCard},
    ],
    BASIC_FUNCTIONS,
  );
}
