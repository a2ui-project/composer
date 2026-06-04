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

import {TestBed} from '@angular/core/testing';
import {RawFrameComponent} from './raw-frame';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {RawFrameHarness} from './test/raw-frame.harness';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {IS_EXTENSION_MODE} from '../../shell/environment-tokens';
import {signal, WritableSignal} from '@angular/core';
import {HostCommunicationService} from '../../shell/host-communication';
import {CatalogManagementService} from '../../storage/catalog-management';
import {Catalog} from '../../storage/catalog-storage.model';
import {StateSyncService} from '../../chat/state-sync/state-sync';
import {ChatStateService, LlmLogEntry, LlmLogType} from '../../chat/chat-state/chat-state';

class MockChatStateService {
  public readonly isProgrammaticStreamActive = signal<boolean>(false);
  public readonly latestLlmLog = signal<LlmLogEntry | null>(null);
  public readonly llmHistory = signal<LlmLogEntry[]>([]);
  public addRawLlmLog(type: LlmLogType, payload: unknown): void {
    const entry = {type, timestamp: Date.now(), payload};
    this.latestLlmLog.set(entry);
    this.llmHistory.update(h => [...h, entry].slice(-50));
  }
  public clearRawLlmHistory(): void {
    this.latestLlmLog.set(null);
    this.llmHistory.set([]);
  }
}

class MockStateSyncService {
  public readonly activeDraftSignal = signal(
    '{"version": "v0.9", "createSurface": {"surfaceId": "sample-surface", "catalogId": "https://a2ui.org/specification/v0_9/basic_catalog.json", "sendDataModel": true}}\n' +
      '{"version": "v0.9", "updateComponents": {"surfaceId": "sample-surface", "components": [{"id": "root", "component": "Column", "children": ["title", "location_input", "pickup_input", "dropoff_input", "book_button"], "justify": "start", "align": "stretch"}, {"id": "title", "component": "Text", "text": "Book a Car", "variant": "h1"}, {"id": "location_input", "component": "TextField", "label": "Pick-up Location", "value": {"path": "/booking/location"}, "variant": "shortText"}, {"id": "pickup_input", "component": "DateTimeInput", "label": "Pick-up Date", "value": {"path": "/booking/pickupDate"}, "enableDate": true, "enableTime": false}, {"id": "dropoff_input", "component": "DateTimeInput", "label": "Drop-off Date", "value": {"path": "/booking/dropoffDate"}, "enableDate": true, "enableTime": false}, {"id": "book_button", "component": "Button", "child": "book_button_text", "variant": "primary", "action": {"event": {"name": "searchCars", "context": {"location": {"path": "/booking/location"}, "pickupDate": {"path": "/booking/pickupDate"}, "dropoffDate": {"path": "/booking/dropoffDate"}}}}}, {"id": "book_button_text", "component": "Text", "text": "Search Cars", "variant": "body"}]}}\n' +
      '{"version": "v0.9", "updateDataModel": {"surfaceId": "sample-surface", "path": "/booking", "value": {"location": "", "pickupDate": "", "dropoffDate": ""}}}',
  );
  public readonly activeDraft = this.activeDraftSignal.asReadonly();
  public updateDraft = vi.fn((val: string) => {
    this.activeDraftSignal.set(val);
  });
  public hydrateActiveDraft = vi.fn(() => this.activeDraftSignal());
}

describe('RawFrameComponent JSON Source Editor View', () => {
  let sendRenderA2UIMock: ReturnType<typeof vi.fn>;
  let mockActiveCatalog: WritableSignal<Catalog | null>;
  let stateSyncMock: MockStateSyncService;
  let chatStateMock: MockChatStateService;

  beforeEach(() => {
    sendRenderA2UIMock = vi.fn();
    mockActiveCatalog = signal<Catalog | null>({title: 'Sample Catalog'});
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  async function setup(isExtension: boolean) {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [RawFrameComponent],
      providers: [
        provideNoopAnimations(),
        {provide: IS_EXTENSION_MODE, useValue: signal(isExtension)},
        {provide: HostCommunicationService, useValue: {sendRenderA2UI: sendRenderA2UIMock}},
        {
          provide: CatalogManagementService,
          useValue: {
            activeCatalog: mockActiveCatalog,
          },
        },
        {provide: StateSyncService, useClass: MockStateSyncService},
        {provide: ChatStateService, useClass: MockChatStateService},
      ],
    }).compileComponents();

    stateSyncMock = TestBed.inject(StateSyncService) as unknown as MockStateSyncService;
    chatStateMock = TestBed.inject(ChatStateService) as unknown as MockChatStateService;

    const fixture = TestBed.createComponent(RawFrameComponent);
    fixture.detectChanges();
    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, RawFrameHarness);
    const component = fixture.componentInstance;
    return {fixture, harness, component};
  }

  it('renders the raw JSON layout inside an Angular Material form field', async () => {
    const {harness} = await setup(false);
    expect(await harness.getJsonText()).toContain('"createSurface"');
  });

  it('applies standard uncollapsed layout padding when extension mode signal is false', async () => {
    const {harness} = await setup(false);
    expect(await harness.isCollapsed()).toBe(false);
  });

  it('applies collapsed container styling when extension mode signal is true', async () => {
    const {harness} = await setup(true);
    expect(await harness.isCollapsed()).toBe(true);
  });

  it('updates backing signal when text is entered via test harness', async () => {
    const {fixture, harness} = await setup(false);
    await harness.setJsonText('{"updated": true}');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.TEST_ONLY.layoutJson()()).toBe('{"updated": true}');
  });

  it('calls sendRenderA2UI immediately during component setup with the parsed CAR_BOOKING payload', async () => {
    await setup(false);
    expect(sendRenderA2UIMock).toHaveBeenCalledTimes(1);
    expect(sendRenderA2UIMock).toHaveBeenCalledWith([
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'sample-surface',
          catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
          sendDataModel: true,
        },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'sample-surface',
          components: [
            {
              id: 'root',
              component: 'Column',
              children: ['title', 'location_input', 'pickup_input', 'dropoff_input', 'book_button'],
              justify: 'start',
              align: 'stretch',
            },
            {id: 'title', component: 'Text', text: 'Book a Car', variant: 'h1'},
            {
              id: 'location_input',
              component: 'TextField',
              label: 'Pick-up Location',
              value: {path: '/booking/location'},
              variant: 'shortText',
            },
            {
              id: 'pickup_input',
              component: 'DateTimeInput',
              label: 'Pick-up Date',
              value: {path: '/booking/pickupDate'},
              enableDate: true,
              enableTime: false,
            },
            {
              id: 'dropoff_input',
              component: 'DateTimeInput',
              label: 'Drop-off Date',
              value: {path: '/booking/dropoffDate'},
              enableDate: true,
              enableTime: false,
            },
            {
              id: 'book_button',
              component: 'Button',
              child: 'book_button_text',
              variant: 'primary',
              action: {
                event: {
                  name: 'searchCars',
                  context: {
                    location: {path: '/booking/location'},
                    pickupDate: {path: '/booking/pickupDate'},
                    dropoffDate: {path: '/booking/dropoffDate'},
                  },
                },
              },
            },
            {
              id: 'book_button_text',
              component: 'Text',
              text: 'Search Cars',
              variant: 'body',
            },
          ],
        },
      },
      {
        version: 'v0.9',
        updateDataModel: {
          surfaceId: 'sample-surface',
          path: '/booking',
          value: {location: '', pickupDate: '', dropoffDate: ''},
        },
      },
    ]);
  });

  it('triggers sendRenderA2UI after 300ms debouncing when valid JSON Lines is typed, and badge remains hidden', async () => {
    const {fixture, harness} = await setup(false);
    vi.useFakeTimers();
    await harness.setJsonText(
      '{"version": "v0.9", "createSurface": {"surfaceId": "s1", "catalogId": "c1"}}',
    );
    fixture.detectChanges();

    // Before debounce passes
    vi.advanceTimersByTime(150);
    expect(sendRenderA2UIMock).toHaveBeenCalledTimes(1);

    // After debounce passes
    vi.advanceTimersByTime(150);
    expect(sendRenderA2UIMock).toHaveBeenCalledTimes(2);
    expect(sendRenderA2UIMock).toHaveBeenLastCalledWith([
      {version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: 'c1'}},
    ]);
    expect(fixture.componentInstance.TEST_ONLY.isJsonInvalid()()).toBe(false);
    expect(await harness.hasInvalidJsonBadge()).toBe(false);
  });

  it('sets isJsonInvalid to true, suppresses sendRenderA2UI, and displays the invalid JSON badge when malformed JSON is typed', async () => {
    const {fixture, harness} = await setup(false);
    vi.useFakeTimers();
    await harness.setJsonText('{"version": "v0.9", invalid_json...');
    fixture.detectChanges();

    vi.advanceTimersByTime(300);
    fixture.detectChanges();

    expect(sendRenderA2UIMock).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.TEST_ONLY.isJsonInvalid()()).toBe(true);
    expect(await harness.hasInvalidJsonBadge()).toBe(true);
  });

  it('sets isJsonInvalid to true, suppresses sendRenderA2UI, and displays the invalid JSON badge when a malformed JSON array is typed', async () => {
    const {fixture, harness} = await setup(false);
    vi.useFakeTimers();
    await harness.setJsonText('[{"version": "v0.9"}');
    fixture.detectChanges();

    vi.advanceTimersByTime(300);
    fixture.detectChanges();

    expect(sendRenderA2UIMock).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.TEST_ONLY.isJsonInvalid()()).toBe(true);
    expect(await harness.hasInvalidJsonBadge()).toBe(true);
  });

  it('dispatches initial layout dynamically when activeCatalog transitions from null to a valid catalog', async () => {
    mockActiveCatalog = signal(null);
    const {fixture} = await setup(false);
    expect(sendRenderA2UIMock).not.toHaveBeenCalled();

    mockActiveCatalog.set({title: 'Sample Catalog'});
    fixture.detectChanges();
    expect(sendRenderA2UIMock).toHaveBeenCalledTimes(1);
  });

  it('dispatches empty array when layout is an empty string on startup', async () => {
    mockActiveCatalog = signal(null);
    const {fixture, component} = await setup(false);
    expect(sendRenderA2UIMock).not.toHaveBeenCalled();

    component.TEST_ONLY.layoutJson().set('   ');
    mockActiveCatalog.set({title: 'Sample Catalog'});
    fixture.detectChanges();

    expect(sendRenderA2UIMock).toHaveBeenCalledWith([]);
  });

  it('propagates manual edits back to the state synchronization service to trigger history syncs', async () => {
    const {fixture, harness} = await setup(false);
    await harness.setJsonText('{"version": "v0.9"}');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(stateSyncMock.updateDraft).toHaveBeenCalledWith('{"version": "v0.9"}');
  });

  it('locks textarea inputs forcefully during active streams lockouts periods', async () => {
    const {fixture, harness} = await setup(false);
    expect(await harness.isReadOnly()).toBe(false);

    // Lock active stream
    chatStateMock.isProgrammaticStreamActive.set(true);
    fixture.detectChanges();
    expect(await harness.isReadOnly()).toBe(true);

    // Release active stream lock
    chatStateMock.isProgrammaticStreamActive.set(false);
    fixture.detectChanges();
    expect(await harness.isReadOnly()).toBe(false);
  });
});
