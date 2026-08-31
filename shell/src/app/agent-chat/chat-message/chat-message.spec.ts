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

import {signal} from '@angular/core';
import {TestBed, ComponentFixture} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {StartupResolution} from '../../shell/startup-resolution/startup-resolution';
import {HostCommunication} from '../../shell/host-communication/host-communication';
import {
  AppConfigProvider,
  ThemePreference,
} from '../../settings/app-config-provider/app-config-provider';
import {ChatState} from '../../chat/chat-state/chat-state';
import {A2aChatMessage} from './chat-message';
import {A2aChatMessageHarness} from './test/chat-message.harness';

describe('A2aChatMessage', () => {
  let fixture: ComponentFixture<A2aChatMessage>;
  let harness: A2aChatMessageHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [A2aChatMessage],
      providers: [
        {
          provide: StartupResolution,
          useValue: {resolvedUrl: signal('http://localhost:3000/renderer')},
        },
        {
          provide: HostCommunication,
          useValue: {
            registerIframe: vi.fn(),
            unregisterIframe: vi.fn(),
            sendTheme: vi.fn(),
            sendRenderA2UI: vi.fn(),
            messageStream: signal(null),
          },
        },
        {
          provide: AppConfigProvider,
          useValue: {themePreference: signal(ThemePreference.LIGHT)},
        },
        {
          provide: ChatState,
          useValue: {isProgrammaticStreamActive: signal(false)},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(A2aChatMessage);
    fixture.componentRef.setInput('message', {
      id: 'msg-1',
      sender: 'agent',
      text: 'Hello, **user**!',
      timestamp: Date.now(),
    });
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, A2aChatMessageHarness);
  });

  it('renders agent message with markdown text', async () => {
    expect(await harness.getMessageContent()).toContain('Hello, user!');
  });

  it('renders user message', async () => {
    fixture.componentRef.setInput('message', {
      id: 'msg-2',
      sender: 'user',
      text: 'My prompt',
      timestamp: Date.now(),
    });
    fixture.detectChanges();

    expect(await harness.getMessageContent()).toBe('My prompt');
  });

  it('toggles thinking accordion', async () => {
    fixture.componentRef.setInput('message', {
      id: 'msg-3',
      sender: 'agent',
      text: 'Response text',
      thinking: 'Thinking steps *here*...',
      timestamp: Date.now(),
    });
    fixture.detectChanges();

    expect(await harness.hasThinking()).toBe(true);
    expect(await harness.isThinkingExpanded()).toBe(false);

    await harness.clickThinking();
    expect(await harness.isThinkingExpanded()).toBe(true);
  });

  it('renders attached images', async () => {
    fixture.componentRef.setInput('message', {
      id: 'msg-4',
      sender: 'agent',
      text: 'Done',
      timestamp: Date.now(),
      images: [{name: 'photo.jpg', mimeType: 'image/jpeg', data: 'abc'}],
    });
    fixture.detectChanges();

    expect(await harness.getImageCount()).toBe(1);
  });

  it('emits openCanvas and closeCanvas when canvas button is clicked on A2UI payload with hasCanvas', async () => {
    const openSpy = vi.spyOn(fixture.componentInstance.openCanvas, 'emit');
    const a2uiPayload = [
      {version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: 'c1', component: 'Canvas'}},
    ];

    fixture.componentRef.setInput('isCanvasOpen', false);
    fixture.componentRef.setInput('message', {
      id: 'msg-5',
      sender: 'agent',
      text: 'Here is your UI:',
      a2uiPayload,
      hasCanvas: true,
      timestamp: Date.now(),
    });
    fixture.detectChanges();

    expect(await harness.hasCanvasButton()).toBe(true);
    expect(await harness.hasInlineSurface()).toBe(false);

    await harness.clickOpenCanvas();
    expect(openSpy).toHaveBeenCalledWith(a2uiPayload);

    const closeSpy = vi.spyOn(fixture.componentInstance.closeCanvas, 'emit');
    fixture.componentRef.setInput('isCanvasOpen', true);
    fixture.detectChanges();

    await harness.clickCloseCanvas();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('renders both inline surface and Canvas toggle card for mixed surfaces', async () => {
    const openSpy = vi.spyOn(fixture.componentInstance.openCanvas, 'emit');
    const inlinePayload = [
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 's1',
          components: [{id: 'root-list', component: {List: {children: ['c1', 'c2']}}}],
        },
      },
    ];
    const canvasPayload = [
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 's1',
          components: [{id: 'form-1', component: {Form: {}}}],
        },
      },
    ];

    fixture.componentRef.setInput('isCanvasOpen', false);
    fixture.componentRef.setInput('message', {
      id: 'msg-mixed',
      sender: 'agent',
      text: 'Here are your options and reservation form:',
      inlineA2uiPayload: inlinePayload,
      canvasArtifacts: [
        {
          id: 'flight-res',
          cardTitle: 'Flight Reservation',
          cardDescription: 'Booking flow ready on Canvas',
          cardIcon: 'flight',
          autoOpen: true,
          payload: canvasPayload,
        },
      ],
      hasCanvas: true,
      timestamp: Date.now(),
    });
    fixture.detectChanges();

    expect(await harness.hasInlineSurface()).toBe(true);
    expect(await harness.hasCanvasButton()).toBe(true);
    const btnText = await harness.getCanvasButtonText();
    expect(btnText).toContain('Flight Reservation');
    expect(btnText).toContain('Booking flow ready on Canvas');

    await harness.clickOpenCanvas();
    expect(openSpy).toHaveBeenCalledWith(canvasPayload);
  });

  it('renders separate toggle cards for each Canvas artifact in canvasArtifacts', async () => {
    const openSpy = vi.spyOn(fixture.componentInstance.openCanvas, 'emit');
    const flightPayload = [{version: 'v0.9', createSurface: {surfaceId: 'flight'}}];
    const cruisePayload = [{version: 'v0.9', createSurface: {surfaceId: 'cruise'}}];

    fixture.componentRef.setInput('isCanvasOpen', true);
    fixture.componentRef.setInput('activeCanvasPayload', flightPayload);
    fixture.componentRef.setInput('message', {
      id: 'msg-multi-canvas',
      sender: 'agent',
      text: 'Options available:',
      canvasArtifacts: [
        {
          id: 'flight-art',
          cardTitle: 'Flight Itinerary',
          cardDescription: 'Select your seat',
          cardIcon: 'flight',
          autoOpen: false,
          payload: flightPayload,
        },
        {
          id: 'cruise-art',
          cardTitle: 'Cruise Itinerary',
          cardDescription: 'Choose cabin',
          cardIcon: 'directions_boat',
          autoOpen: true,
          payload: cruisePayload,
        },
      ],
      timestamp: Date.now(),
    });
    fixture.detectChanges();

    const cardElements = fixture.nativeElement.querySelectorAll('.canvas-artifact-card');
    expect(cardElements.length).toBe(2);
    expect(fixture.nativeElement.querySelector('.has-canvas-artifacts')).not.toBeNull();

    expect(cardElements[0].textContent).toContain('Flight Itinerary');
    expect(cardElements[0].textContent).toContain('Select your seat');
    expect(cardElements[0].querySelector('.close-canvas-btn')).not.toBeNull();

    expect(cardElements[1].textContent).toContain('Cruise Itinerary');
    expect(cardElements[1].textContent).toContain('Choose cabin');
    expect(cardElements[1].querySelector('.close-canvas-btn')).toBeNull();

    const cruiseBtn = cardElements[1].querySelector('.view-canvas-btn') as HTMLButtonElement;
    cruiseBtn.click();
    expect(openSpy).toHaveBeenCalledWith(cruisePayload);
  });

  it('renders inline surface when payload has no Canvas component', async () => {
    const a2uiPayload = [
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 's1',
          components: [{id: 'card-1', component: 'Card'}],
        },
      },
    ];

    fixture.componentRef.setInput('message', {
      id: 'msg-inline',
      sender: 'agent',
      text: 'Here is your inline card:',
      a2uiPayload,
      hasCanvas: false,
      timestamp: Date.now(),
    });
    fixture.detectChanges();

    expect(await harness.hasCanvasButton()).toBe(false);
    expect(await harness.hasInlineSurface()).toBe(true);
  });

  it('displays pending indicator when agent is streaming before first token arrives', async () => {
    fixture.componentRef.setInput('message', {
      id: 'msg-pending',
      sender: 'agent',
      text: '',
      thinking: '',
      isStreaming: true,
      timestamp: Date.now(),
    });
    fixture.detectChanges();

    expect(await harness.hasPendingIndicator()).toBe(true);
  });

  it('displays streaming cursor while text is streaming', async () => {
    fixture.componentRef.setInput('message', {
      id: 'msg-streaming',
      sender: 'agent',
      text: 'Streaming answer in progress',
      isStreaming: true,
      timestamp: Date.now(),
    });
    fixture.detectChanges();

    expect(await harness.hasStreamingCursor()).toBe(true);
    expect(await harness.hasPendingIndicator()).toBe(false);
  });
});
