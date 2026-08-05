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
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatIconModule} from '@angular/material/icon';
import {A2uiRendererService, A2UI_RENDERER_CONFIG, SurfaceComponent} from '@a2ui/angular/v0_9';
import {buildDashboardCatalog} from '../custom-catalog/catalog/dashboard-catalog';
import {RECORDINGS, type TheaterMessage, type TheaterRecording} from './recordings';
import {formatJson} from '../utils/json';

/** Which inspector face is showing. */
type InspectorTab = 'events' | 'data' | 'config';

/** Recognised A2UI message kinds for timeline labelling. */
type MessageType = 'createSurface' | 'updateComponents' | 'updateDataModel' | 'message';

/** One row of the message timeline. */
interface TimelineEvent {
  index: number;
  type: MessageType;
  summary: string;
}

/** Autoplay cadence — one message applied per tick. */
const PLAYBACK_INTERVAL_MS = 900;

/**
 * Theater route. Replays a recorded A2UI v0.9 message stream into a live native
 * surface, message by message, with transport controls, a clickable timeline,
 * and an Events/Data/Config inspector.
 *
 * Playback is generation-based to avoid the stale-`createSurface` trap: forward
 * stepping applies the next message incrementally; rewinding starts a fresh
 * surface generation (`theater-<gen>`) and replays from the start. Each
 * message's `surfaceId` is rewritten to the live generation at replay.
 */
@Component({
  selector: 'a2ui-composer-theater',
  standalone: true,
  imports: [MatButtonModule, MatButtonToggleModule, MatIconModule, SurfaceComponent],
  templateUrl: './theater.ng.html',
  styleUrl: './theater.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    A2uiRendererService,
    {
      provide: A2UI_RENDERER_CONFIG,
      useFactory: () => ({
        catalogs: [buildDashboardCatalog()],
        actionHandler: (action: unknown) => console.info('[theater] action dispatched', action),
      }),
    },
  ],
})
export class Theater {
  private readonly renderer = inject(A2uiRendererService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly recordings = RECORDINGS;
  protected readonly activeRecordingId = signal<string>(RECORDINGS[0].id);
  protected readonly activeRecording = computed<TheaterRecording>(
    () => this.recordings.find(r => r.id === this.activeRecordingId()) ?? this.recordings[0],
  );
  protected readonly totalSteps = computed(() => this.activeRecording().messages.length);

  /** Number of messages applied so far (0..totalSteps). */
  protected readonly step = signal<number>(0);
  private gen = 0;
  protected readonly playbackSurfaceId = signal<string>('theater-0');

  protected readonly isPlaying = signal<boolean>(false);
  private timer: ReturnType<typeof setInterval> | null = null;

  protected readonly inspectorTab = signal<InspectorTab>('events');

  constructor() {
    this.destroyRef.onDestroy(() => this.stopTimer());
  }

  // ---------------------------------------------------------------- transport

  protected reset(): void {
    this.pause();
    this.seek(0);
  }

  protected stepBack(): void {
    this.pause();
    this.seek(this.step() - 1);
  }

  protected stepForward(): void {
    this.seek(this.step() + 1);
  }

  protected togglePlay(): void {
    if (this.isPlaying()) {
      this.pause();
      return;
    }
    // Restart from the beginning if we're parked at the end.
    if (this.step() >= this.totalSteps()) this.seek(0);
    this.isPlaying.set(true);
    this.timer = setInterval(() => {
      if (this.step() >= this.totalSteps()) {
        this.pause();
        return;
      }
      this.seek(this.step() + 1);
    }, PLAYBACK_INTERVAL_MS);
  }

  private pause(): void {
    this.isPlaying.set(false);
    this.stopTimer();
  }

  private stopTimer(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Moves the playhead to `target` (clamped). Always replays the prefix
   * `[0, target)` as a single batch onto a fresh surface generation: this
   * keeps `createSurface` + `updateComponents` (+ data) in one
   * `processMessages` call — the form the native renderer renders correctly —
   * and creates the surface in the same synchronous tick the template switches
   * to its id, so there is no mount-before-create gap. Old generations linger
   * harmlessly in the service.
   */
  protected seek(target: number): void {
    const clamped = Math.max(0, Math.min(target, this.totalSteps()));
    this.gen += 1;
    const surfaceId = `theater-${this.gen}`;
    this.playbackSurfaceId.set(surfaceId);
    const batch = this.activeRecording()
      .messages.slice(0, clamped)
      .map(message => this.toNativeMessage(message, surfaceId));
    if (batch.length > 0) {
      this.renderer.processMessages(batch as never);
    }
    this.step.set(clamped);
  }

  /**
   * Converts a recorded v0.9 envelope into the unwrapped message the native
   * renderer expects: drops the top-level `version` field (the native
   * `processMessages` takes bare `{createSurface|updateComponents|
   * updateDataModel: {...}}`, as the Assembled/Reference pages send) and
   * rewrites the sub-message `surfaceId` to the live generation.
   */
  private toNativeMessage(msg: TheaterMessage, surfaceId: string): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const key of ['createSurface', 'updateComponents', 'updateDataModel'] as const) {
      const sub = msg[key];
      if (sub && typeof sub === 'object') {
        out[key] = {...(sub as Record<string, unknown>), surfaceId};
      }
    }
    return out;
  }

  protected selectRecording(id: string): void {
    if (id === this.activeRecordingId()) return;
    this.pause();
    this.activeRecordingId.set(id);
    this.seek(0); // fresh generation, blank surface
  }

  protected setInspectorTab(tab: InspectorTab): void {
    this.inspectorTab.set(tab);
  }

  // ---------------------------------------------------------------- inspector

  /** Index of the currently-applied message (`step - 1`), or -1 if none. */
  protected readonly currentIndex = computed(() => this.step() - 1);

  protected readonly progress = computed(() => {
    const total = this.totalSteps();
    return total > 0 ? (this.step() / total) * 100 : 0;
  });

  protected readonly events = computed<TimelineEvent[]>(() =>
    this.activeRecording().messages.map((message, index) => ({
      index,
      type: this.messageType(message),
      summary: this.messageSummary(message),
    })),
  );

  /** The effective data model at the playhead (last applied `updateDataModel`). */
  protected readonly currentData = computed<string>(() => {
    const messages = this.activeRecording().messages;
    let value: unknown = {};
    for (let i = 0; i < this.step(); i++) {
      const update = messages[i]['updateDataModel'] as {value?: unknown} | undefined;
      if (update && 'value' in update) value = update.value;
    }
    return formatJson(value);
  });

  protected readonly config = computed(() => {
    const recording = this.activeRecording();
    const create = recording.messages[0]?.['createSurface'] as {catalogId?: string} | undefined;
    return {
      surfaceId: this.playbackSurfaceId(),
      catalogId: create?.catalogId ?? '—',
      label: recording.label,
      totalSteps: recording.messages.length,
    };
  });

  private messageType(msg: TheaterMessage): MessageType {
    if (msg['createSurface']) return 'createSurface';
    if (msg['updateComponents']) return 'updateComponents';
    if (msg['updateDataModel']) return 'updateDataModel';
    return 'message';
  }

  private messageSummary(msg: TheaterMessage): string {
    if (msg['createSurface']) return 'Create surface';
    const update = msg['updateComponents'] as {components?: unknown[]} | undefined;
    if (update) return `Update components (${update.components?.length ?? 0})`;
    if (msg['updateDataModel']) return 'Update data model';
    return 'Message';
  }
}
