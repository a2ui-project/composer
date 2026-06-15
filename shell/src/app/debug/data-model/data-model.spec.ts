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

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {signal, WritableSignal} from '@angular/core';
import {describe, it, expect, beforeEach, vi, afterEach} from 'vitest';
import {DataModel} from './data-model';
import {DataModelHarness} from './test/data-model.harness';
import {MatInputHarness} from '@angular/material/input/testing';
import {
  HostCommunication,
  MessageEnvelope,
} from '../../shell/host-communication/host-communication';
import {PreviewBridgeMessageType} from 'a2ui-bridge';

describe('DataModel', () => {
  let fixture: ComponentFixture<DataModel>;
  let component: DataModel;
  let harness: DataModelHarness;
  let mockHostComm: {
    messageStream: WritableSignal<MessageEnvelope | null>;
    sendMessage: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    vi.useFakeTimers();

    mockHostComm = {
      messageStream: signal<MessageEnvelope | null>(null),
      sendMessage: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DataModel],
      providers: [provideNoopAnimations(), {provide: HostCommunication, useValue: mockHostComm}],
    }).compileComponents();

    fixture = TestBed.createComponent(DataModel);
    component = fixture.componentInstance;
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, DataModelHarness);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates the component via test harness', async () => {
    expect(harness).toBeTruthy();
  });

  it('syncs remote state changes into the editor component', async () => {
    const payload = {
      updateDataModel: {
        surfaceId: 'sample-surface',
        path: '/booking',
        value: {foo: 'bar'},
      },
    };
    mockHostComm.messageStream.set({
      type: PreviewBridgeMessageType.DATA_MODEL_CHANGE,
      payload,
      origin: 'http://localhost',
      timestamp: Date.now(),
    });

    TestBed.tick();
    fixture.detectChanges();

    const text = await harness.getModelText();
    expect(JSON.parse(text)).toEqual({foo: 'bar'});
  });

  it('validates and renders invalid JSON warning badge when syntax error is present', async () => {
    expect(await harness.hasInvalidJsonBadge()).toBe(false);

    await harness.setModelText('{ invalid json }');
    TestBed.tick();
    fixture.detectChanges();

    expect(await harness.hasInvalidJsonBadge()).toBe(true);
  });

  it('debounces and dispatches valid local JSON edits to host service', async () => {
    const localValue = {hello: 'world'};
    const jsonStr = JSON.stringify(localValue);

    await harness.setModelText(jsonStr);
    TestBed.tick();
    fixture.detectChanges();

    expect(mockHostComm.sendMessage).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(300);
    TestBed.tick();

    expect(mockHostComm.sendMessage).toHaveBeenCalledWith({
      type: PreviewBridgeMessageType.DATA_MODEL_CHANGE,
      payload: {
        updateDataModel: {
          surfaceId: 'sample-surface',
          path: undefined,
          value: localValue,
        },
      },
    });
  });

  it('does not dispatch invalid JSON edits to host service', async () => {
    await harness.setModelText('{ invalid-json');
    TestBed.tick();
    fixture.detectChanges();

    await vi.advanceTimersByTimeAsync(300);
    TestBed.tick();

    expect(mockHostComm.sendMessage).not.toHaveBeenCalled();
  });

  it('retains developer manual edits when irrelevant messages are received', async () => {
    await harness.setModelText('{"manual": true}');
    TestBed.tick();
    fixture.detectChanges();

    mockHostComm.messageStream.set({
      type: 'IRRELEVANT_MESSAGE_TYPE',
      payload: {foo: 'bar'},
      origin: 'http://localhost',
      timestamp: Date.now(),
    });

    TestBed.tick();
    fixture.detectChanges();

    const text = await harness.getModelText();
    expect(text).toBe('{"manual": true}');
  });

  it('resets the editor text to empty when remote state resets to null', async () => {
    mockHostComm.messageStream.set({
      type: PreviewBridgeMessageType.DATA_MODEL_CHANGE,
      payload: {
        updateDataModel: {
          surfaceId: 'sample-surface',
          value: {foo: 'bar'},
        },
      },
      origin: 'http://localhost',
      timestamp: Date.now(),
    });
    TestBed.tick();
    fixture.detectChanges();

    expect(JSON.parse(await harness.getModelText())).toEqual({foo: 'bar'});

    component.latestModelValue.set(null);
    TestBed.tick();
    fixture.detectChanges();

    expect(await harness.getModelText()).toBe('');
  });

  it('applies the accessible name "Data model JSON" to the data model textarea', async () => {
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const input = await loader.getHarness(MatInputHarness);
    const host = await input.host();
    expect(await host.getAttribute('aria-label')).toBe('Data model JSON');
  });
});
