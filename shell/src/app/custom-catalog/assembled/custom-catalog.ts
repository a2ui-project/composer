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
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatIconModule} from '@angular/material/icon';
import {A2uiRendererService, A2UI_RENDERER_CONFIG, SurfaceComponent} from '@a2ui/angular/v0_9';
import {MonacoEditor} from '../../shared/monaco-editor/monaco-editor';
import {buildDashboardCatalog} from '../catalog/dashboard-catalog';
import flightSchema from './examples/flight-schema.json';
import flightData from './examples/flight-data.json';
import salesSchema from './examples/sales-schema.json';
import salesData from './examples/sales-data.json';

const CATALOG_ID = 'copilotkit://app-dashboard-catalog';

/** One selectable state of a demo's data model (a right-pane tab). */
interface DataState {
  name: string;
  data: Record<string, unknown>;
}

/** A demo tree assembled from the custom catalog, with switchable data states. */
interface Example {
  id: string;
  label: string;
  icon: string;
  components: unknown[];
  states: DataState[];
}

const EXAMPLES: Example[] = [
  {
    id: 'flight',
    label: 'Flight Card',
    icon: 'flight',
    components: flightSchema as unknown[],
    states: flightData as DataState[],
  },
  {
    id: 'sales',
    label: 'Sales Dashboard',
    icon: 'insights',
    components: salesSchema as unknown[],
    states: salesData as DataState[],
  },
];

/**
 * Assembled Components page. Renders one of two example trees natively via
 * `@a2ui/angular` (no iframe) from a custom 11-component dashboard catalog, and
 * lets the user edit the bound data model live. Editing the Monaco JSON pushes
 * an `updateDataModel` so the surface re-renders through the library binder.
 */
@Component({
  selector: 'a2ui-composer-custom-catalog',
  standalone: true,
  imports: [MatButtonToggleModule, MatIconModule, SurfaceComponent, MonacoEditor],
  templateUrl: './custom-catalog.ng.html',
  styleUrl: './custom-catalog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    A2uiRendererService,
    {
      provide: A2UI_RENDERER_CONFIG,
      useFactory: () => ({
        catalogs: [buildDashboardCatalog()],
        actionHandler: (action: unknown) => console.info('[custom-catalog] action dispatched', action),
      }),
    },
  ],
})
export class CustomCatalog {
  private readonly renderer = inject(A2uiRendererService);
  /** Surface ids already created (tree sent), so data changes only push updateDataModel. */
  private readonly builtSurfaces = new Set<string>();

  protected readonly examples = EXAMPLES;
  protected readonly activeExampleId = signal<string>(EXAMPLES[0].id);
  protected readonly activeStateIndex = signal<number>(0);
  /** JSON text bound to the Monaco editor (reset on example/tab change). */
  protected readonly editorValue = signal<string>('');

  protected readonly activeExample = computed(
    () => this.examples.find(e => e.id === this.activeExampleId()) ?? this.examples[0],
  );
  protected readonly activeStates = computed(() => this.activeExample().states);

  constructor() {
    // Re-render the surface whenever the selected example or data state changes,
    // and reset the editor to that state's data model. Writes here don't feed
    // the effect (untracked), so this runs once per selection, not per keystroke.
    effect(() => {
      const example = this.activeExample();
      const index = this.activeStateIndex();
      const data = example.states[index]?.data ?? {};
      untracked(() => {
        this.editorValue.set(JSON.stringify(data, null, 2));
        this.applyData(example, data);
      });
    });
  }

  /**
   * Ensures the surface for this example is created + populated exactly once
   * (tree), then pushes the data model. Re-sending `createSurface` for an
   * already-built surface would leave the view bound to stale state, so data
   * changes (tab switch, live edit) go through `updateDataModel` alone.
   */
  private applyData(example: Example, data: Record<string, unknown>): void {
    if (!this.builtSurfaces.has(example.id)) {
      this.renderer.processMessages([
        {createSurface: {surfaceId: example.id, catalogId: CATALOG_ID}},
        {updateComponents: {surfaceId: example.id, components: example.components}},
      ] as never);
      this.builtSurfaces.add(example.id);
    }
    this.renderer.processMessages([
      {updateDataModel: {surfaceId: example.id, path: '/', op: 'replace', value: data}},
    ] as never);
  }

  /** Selects a demo tree, resetting to its first data state. */
  protected selectExample(id: string): void {
    if (id === this.activeExampleId()) return;
    this.activeStateIndex.set(0);
    this.activeExampleId.set(id);
  }

  /** Selects one of the active demo's preset data states. */
  protected selectState(index: number): void {
    this.activeStateIndex.set(index);
  }

  /** Live-updates the active surface's data model from edited JSON (ignores invalid JSON). */
  protected onEdit(text: string): void {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(text) as Record<string, unknown>;
    } catch {
      return;
    }
    this.renderer.processMessages([
      {updateDataModel: {surfaceId: this.activeExampleId(), path: '/', op: 'replace', value: parsed}},
    ] as never);
  }
}
