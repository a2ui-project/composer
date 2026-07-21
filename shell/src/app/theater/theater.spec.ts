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

import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {A2uiRendererService} from '@a2ui/angular/v0_9';
import {Theater} from './theater';
import {RECORDINGS} from './recordings';

interface TheaterInternals {
  activeRecordingId: () => string;
  activeRecording: () => {id: string; label: string; messages: unknown[]};
  totalSteps: () => number;
  step: () => number;
  playbackSurfaceId: () => string;
  isPlaying: () => boolean;
  inspectorTab: () => string;
  currentIndex: () => number;
  events: () => Array<{index: number; type: string; summary: string}>;
  currentData: () => string;
  config: () => {surfaceId: string; catalogId: string; label: string; totalSteps: number};
  reset: () => void;
  stepBack: () => void;
  stepForward: () => void;
  togglePlay: () => void;
  seek: (n: number) => void;
  selectRecording: (id: string) => void;
  setInspectorTab: (t: string) => void;
}

describe('Theater', () => {
  let fixture: ComponentFixture<Theater>;
  let component: TheaterInternals;
  let renderer: A2uiRendererService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Theater],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Theater);
    component = fixture.componentInstance as unknown as TheaterInternals;
    renderer = fixture.debugElement.injector.get(A2uiRendererService);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('opens on the first recording, parked at step 0', () => {
    expect(component.activeRecordingId()).toBe(RECORDINGS[0].id);
    expect(component.step()).toBe(0);
    expect(component.currentIndex()).toBe(-1);
  });

  it('lists every message on the timeline with the right types', () => {
    const events = component.events();
    expect(events).toHaveLength(component.totalSteps());
    expect(events[0].type).toBe('createSurface');
    expect(events[1].type).toBe('updateComponents');
    expect(events[2].type).toBe('updateDataModel');
  });

  it('stepping forward applies createSurface and builds the playback surface', () => {
    component.stepForward();
    expect(component.step()).toBe(1);
    expect(renderer.surfaceGroup.getSurface(component.playbackSurfaceId())).toBeTruthy();
  });

  it('rewinding starts a fresh surface generation', () => {
    component.seek(3);
    const beforeId = component.playbackSurfaceId();
    component.seek(1);
    expect(component.playbackSurfaceId()).not.toBe(beforeId);
    expect(component.step()).toBe(1);
  });

  it('surfaces the effective data model at the playhead', () => {
    expect(component.currentData()).toBe('{}');
    component.seek(component.totalSteps());
    expect(component.currentData()).toContain('kpis');
  });

  it('reset returns to a blank step 0', () => {
    component.seek(component.totalSteps());
    component.reset();
    expect(component.step()).toBe(0);
    expect(component.isPlaying()).toBe(false);
  });

  it('switching recordings resets to step 0', () => {
    component.seek(2);
    const other = RECORDINGS.find(r => r.id !== component.activeRecordingId())!;
    component.selectRecording(other.id);
    expect(component.activeRecordingId()).toBe(other.id);
    expect(component.step()).toBe(0);
  });

  it('config reports the recording surface + catalog ids', () => {
    const cfg = component.config();
    expect(cfg.catalogId).toBe('copilotkit://app-dashboard-catalog');
    expect(cfg.totalSteps).toBe(component.totalSteps());
    expect(cfg.surfaceId).toBe(component.playbackSurfaceId());
  });

  it('plays through to the end and stops', () => {
    vi.useFakeTimers();
    const total = component.totalSteps();
    component.togglePlay();
    expect(component.isPlaying()).toBe(true);

    vi.advanceTimersByTime(900 * (total + 1));

    expect(component.step()).toBe(total);
    expect(component.isPlaying()).toBe(false);
    vi.useRealTimers();
  });

  it('toggles inspector tabs', () => {
    expect(component.inspectorTab()).toBe('events');
    component.setInspectorTab('data');
    expect(component.inspectorTab()).toBe('data');
  });
});
