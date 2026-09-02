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

import {signal, WritableSignal} from '@angular/core';
import {TestBed, ComponentFixture} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Subject} from 'rxjs';
import {PreviewBridgeMessageType, RenderA2uiItem} from 'a2ui-bridge';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {StartupResolution} from '../shell/startup-resolution/startup-resolution';
import {HostCommunication, MessageEnvelope} from '../shell/host-communication/host-communication';
import {
  AppConfigProvider,
  A2aBackendMode,
  ThemePreference,
} from '../settings/app-config-provider/app-config-provider';
import {ChatState} from '../chat/chat-state/chat-state';
import {A2A_TRANSPORT, A2aTransport} from '../chat/a2a/a2a-transport.token';
import {A2aChatView} from './a2a-chat-view';
import {A2aChatViewHarness} from './test/a2a-chat-view.harness';

describe('A2aChatView', () => {
  let fixture: ComponentFixture<A2aChatView>;
  let harness: A2aChatViewHarness;
  let mockA2aTransport: Partial<A2aTransport>;
  let mockAgentUrlSignal: WritableSignal<string>;
  let mockConfigProvider: Partial<AppConfigProvider>;
  let mockMessageStream$: Subject<MessageEnvelope | null>;

  beforeEach(async () => {
    mockAgentUrlSignal = signal('http://localhost:8000');
    mockMessageStream$ = new Subject<MessageEnvelope | null>();
    mockA2aTransport = {
      getAgentCard: vi.fn().mockResolvedValue({
        name: 'Mock Test Agent',
        description: 'Agent for unit testing',
        version: '1.0.0',
        skills: [{id: 's1', name: 'Mock Skill'}],
      }),
      sendMessageStream: vi.fn().mockImplementation(async function* () {
        yield {
          taskId: 't-123',
          contextId: 'c-456',
          message: {
            role: 'agent',
            parts: [{text: 'Hello from mock streaming!'}],
          },
          final: true,
        };
      }),
    };

    mockConfigProvider = {
      a2aAgentUrl: mockAgentUrlSignal,
      a2aTenantId: signal(''),
      a2aBackendMode: signal(A2aBackendMode.HTTP_JSONRPC),
      themePreference: signal(ThemePreference.LIGHT),
      setA2aAgentUrl: vi.fn(),
      setA2aTenantId: vi.fn(),
      setA2aBackendMode: vi.fn(),
      flushConfig: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [A2aChatView],
      providers: [
        {provide: A2A_TRANSPORT, useValue: mockA2aTransport},
        {provide: AppConfigProvider, useValue: mockConfigProvider},
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
            messageStream$: mockMessageStream$.asObservable(),
          },
        },
        {
          provide: ChatState,
          useValue: {isProgrammaticStreamActive: signal(false)},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(A2aChatView);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, A2aChatViewHarness);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    fixture?.destroy();
  });

  it('auto-connects when stored URL is present', async () => {
    expect(mockA2aTransport.getAgentCard).toHaveBeenCalledWith('http://localhost:8000');
    expect(await harness.isConfigPanelOpen()).toBe(false);
    const header = await harness.getHeader();
    expect(await header.getTitleText()).toBe('Mock Test Agent');
  });

  it('opens config panel when no stored URL is configured', async () => {
    mockAgentUrlSignal.set('');
    const newFixture = TestBed.createComponent(A2aChatView);
    newFixture.detectChanges();
    const newHarness = await TestbedHarnessEnvironment.harnessForFixture(
      newFixture,
      A2aChatViewHarness,
    );

    expect(await newHarness.isConfigPanelOpen()).toBe(true);
  });

  it('handles user message streaming turn', async () => {
    const inputArea = await harness.getInputArea();
    await inputArea.setInputValue('Hello agent');
    await inputArea.sendEnter();

    expect(mockA2aTransport.sendMessageStream).toHaveBeenCalled();
    const history = await harness.getHistory();
    expect(await history.getMessageCount()).toBe(2);
  });

  it('toggles inspector side drawer', async () => {
    expect(await harness.isInspectorOpen()).toBe(false);

    const header = await harness.getHeader();
    await header.clickInspector();
    expect(await harness.isInspectorOpen()).toBe(true);

    await header.clickInspector();
    expect(await harness.isInspectorOpen()).toBe(false);
  });

  it('handles streaming errors gracefully', async () => {
    mockA2aTransport.sendMessageStream = vi.fn().mockImplementation(async function* () {
      throw new Error('Stream failed');
    });

    const inputArea = await harness.getInputArea();
    await inputArea.setInputValue('Trigger error');
    await inputArea.sendEnter();

    const history = await harness.getHistory();
    expect(await history.getMessageCount()).toBe(2);
    expect(fixture.componentInstance.messages()[1].sender).toBe('error');
  });

  it('manages canvas lifecycle', async () => {
    expect(await harness.hasSideCanvas()).toBe(false);

    fixture.componentInstance['openCanvasSurface']([
      {version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: 'c1'}},
    ]);
    fixture.detectChanges();

    expect(await harness.hasSideCanvas()).toBe(true);

    fixture.componentInstance['closeCanvasSurface']();
    fixture.detectChanges();

    expect(await harness.hasSideCanvas()).toBe(false);
  });

  it('resets session and clears messages', async () => {
    fixture.componentInstance['messages'].set([
      {id: '1', sender: 'user', text: 'hi', timestamp: Date.now()},
    ]);
    fixture.detectChanges();

    const header = await harness.getHeader();
    await header.clickReset();

    expect(fixture.componentInstance['messages']().length).toBe(0);
  });

  it('handles sample prompt click and sends message', () => {
    const sendSpy = vi.spyOn(
      fixture.componentInstance as unknown as {sendUserMessage: (msg: unknown) => void},
      'sendUserMessage',
    );
    fixture.componentInstance['submitSamplePrompt']('Try sample query');
    expect(sendSpy).toHaveBeenCalledWith({text: 'Try sample query', images: []});
  });

  it('saves config and clears config properly', async () => {
    fixture.componentInstance['saveAgentConfiguration']({
      endpoint: 'http://localhost:9999',
      tenantId: 't-new',
      backendMode: A2aBackendMode.HTTP_JSONRPC,
    });
    await fixture.whenStable();
    expect(mockConfigProvider.setA2aAgentUrl).toHaveBeenCalledWith('http://localhost:9999');
    expect(mockConfigProvider.setA2aTenantId).toHaveBeenCalledWith('t-new');
    expect(mockConfigProvider.setA2aBackendMode).toHaveBeenCalledWith(A2aBackendMode.HTTP_JSONRPC);

    fixture.componentInstance['clearAgentConfiguration']();
    expect(mockConfigProvider.flushConfig).not.toHaveBeenCalled();
    expect(mockConfigProvider.setA2aAgentUrl).toHaveBeenCalledWith('');
    expect(mockConfigProvider.setA2aTenantId).toHaveBeenCalledWith('');
    expect(fixture.componentInstance['agentCard']()).toBeNull();
  });

  it('clears inspector events and opens settings', () => {
    fixture.componentInstance['clearInspectorEvents']();
    expect(fixture.componentInstance['inspectorEvents']()).toEqual([]);

    fixture.componentInstance['openConfigPanel']();
    expect(fixture.componentInstance['isConfigPanelOpen']()).toBe(true);

    fixture.componentInstance['cancelActiveGeneration']();
    expect(fixture.componentInstance['isStreaming']()).toBe(false);
  });

  it('sends message with attached images and updates user message model', () => {
    fixture.componentInstance['sendUserMessage']({
      text: 'Analyze screenshot',
      images: [
        {
          name: 'screen.png',
          mimeType: 'image/png',
          data: 'base64imagedata',
          previewUrl: 'data:image/png;base64,base64imagedata',
        },
      ],
    });

    expect(mockA2aTransport.sendMessageStream).toHaveBeenCalled();
    const messages = fixture.componentInstance['messages']();
    expect(messages.length).toBe(2);
    expect(messages[0].images?.length).toBe(1);
    expect(messages[0].images?.[0].name).toBe('screen.png');
  });

  it('safely handles undefined or empty text when sending image-only messages or empty submissions', () => {
    const initialCount = fixture.componentInstance['messages']().length;
    // Empty submission should be a no-op
    fixture.componentInstance['sendUserMessage']({text: '   ', images: []});
    expect(fixture.componentInstance['messages']().length).toBe(initialCount);

    // Submission with undefined text but valid image
    fixture.componentInstance['sendUserMessage']({
      text: undefined as unknown as string,
      images: [
        {
          name: 'only-image.png',
          mimeType: 'image/png',
          data: 'base64data',
          previewUrl: 'data:image/png;base64,base64data',
        },
      ],
    });
    expect(fixture.componentInstance['messages']().length).toBe(initialCount + 2);
  });

  it('parses incoming A2UI payload into agent response message', async () => {
    mockA2aTransport.sendMessageStream = vi.fn().mockImplementation(async function* () {
      yield {
        taskId: 't-a2ui',
        contextId: 'c-a2ui',
        message: {
          role: 'agent',
          parts: [
            {text: 'Here is your UI:'},
            {
              data: {
                mimeType: 'application/json+a2ui',
                data: JSON.stringify([
                  {
                    version: 'v0.9',
                    createSurface: {surfaceId: 's1', catalogId: 'c1', component: 'Canvas'},
                  },
                ]),
              },
            },
          ],
        },
        final: true,
      };
    });

    fixture.componentInstance['sendUserMessage']({text: 'Show UI', images: []});
    await fixture.whenStable();

    const messages = fixture.componentInstance['messages']();
    const agentMsg = messages[1];
    expect(agentMsg.a2uiPayload?.length).toBe(1);
    expect(agentMsg.hasCanvas).toBe(true);
  });

  it('sets hasCanvas to false for standard inline component surfaces', async () => {
    mockA2aTransport.sendMessageStream = vi.fn().mockImplementation(async function* () {
      yield {
        taskId: 't-inline',
        contextId: 'c-inline',
        message: {
          role: 'agent',
          parts: [
            {
              data: {
                mimeType: 'application/json+a2ui',
                data: JSON.stringify([
                  {
                    version: 'v0.9',
                    updateComponents: {
                      surfaceId: 's1',
                      components: [{id: 'c1', component: 'Card'}],
                    },
                  },
                ]),
              },
            },
          ],
        },
        final: true,
      };
    });

    fixture.componentInstance['sendUserMessage']({text: 'Show inline card', images: []});
    await fixture.whenStable();

    const messages = fixture.componentInstance['messages']();
    const agentMsg = messages[1];
    expect(agentMsg.a2uiPayload?.length).toBe(1);
    expect(agentMsg.hasCanvas).toBe(false);
  });

  it('correctly partitions and renders mixed surface with List (9 non-Canvas cards) and 1 Canvas form', async () => {
    const mixedPayload = [
      {
        version: 'v0.9',
        createSurface: {surfaceId: 'surface-1', catalogId: 'cat-1'},
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'surface-1',
          components: [
            {
              id: 'root-list',
              component: {
                List: {
                  children: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'canvas-item'],
                },
              },
            },
            {id: 'c1', component: {Card: {title: 'Item 1'}}},
            {id: 'c2', component: {Card: {title: 'Item 2'}}},
            {id: 'c3', component: {Card: {title: 'Item 3'}}},
            {id: 'c4', component: {Card: {title: 'Item 4'}}},
            {id: 'c5', component: {Card: {title: 'Item 5'}}},
            {id: 'c6', component: {Card: {title: 'Item 6'}}},
            {id: 'c7', component: {Card: {title: 'Item 7'}}},
            {id: 'c8', component: {Card: {title: 'Item 8'}}},
            {id: 'c9', component: {Card: {title: 'Item 9'}}},
            {
              id: 'canvas-item',
              component: {
                Canvas: {
                  children: ['form-root'],
                  cardTitle: 'Reservation Form',
                  cardDescription: 'Complete your booking',
                  cardIcon: 'assignment',
                  autoOpen: false,
                },
              },
            },
            {
              id: 'form-root',
              component: {Form: {children: ['input-1']}},
            },
            {id: 'input-1', component: {TextField: {label: 'Passenger Name'}}},
          ],
        },
      },
    ];

    mockA2aTransport.sendMessageStream = vi.fn().mockImplementation(async function* () {
      yield {
        taskId: 't-mixed',
        contextId: 'c-mixed',
        message: {
          role: 'agent',
          parts: [
            {text: 'Here are the available items and your reservation form:'},
            {
              data: {
                mimeType: 'application/json+a2ui',
                data: JSON.stringify(mixedPayload),
              },
            },
          ],
        },
        final: true,
      };
    });

    fixture.componentInstance['sendUserMessage']({text: 'Book a trip', images: []});
    await fixture.whenStable();

    const messages = fixture.componentInstance['messages']();
    const agentMsg = messages[1];

    expect(agentMsg.hasCanvas).toBe(true);
    expect(agentMsg.canvasArtifacts?.length).toBe(1);
    expect(agentMsg.canvasArtifacts?.[0].cardTitle).toBe('Reservation Form');
    expect(agentMsg.canvasArtifacts?.[0].cardDescription).toBe('Complete your booking');
    expect(agentMsg.canvasArtifacts?.[0].cardIcon).toBe('assignment');
    expect(agentMsg.canvasArtifacts?.[0].autoOpen).toBe(false);

    // Inline payload has List + 9 cards
    expect(agentMsg.inlineA2uiPayload).toBeDefined();
    const inlineComps =
      (agentMsg.inlineA2uiPayload?.[1]?.updateComponents?.components as Array<
        Record<string, unknown>
      >) || [];
    expect(inlineComps.length).toBe(10);
    expect(inlineComps.some(c => c['id'] === 'canvas-item')).toBe(false);

    // Canvas payload has Form + TextField
    const canvasPayload = agentMsg.canvasArtifacts?.[0].payload;
    expect(canvasPayload).toBeDefined();
    const canvasComps =
      (canvasPayload?.[1]?.updateComponents?.components as Array<Record<string, unknown>>) || [];
    expect(canvasComps.length).toBe(2);
    expect(canvasComps.map(c => c['id'])).toEqual(['root', 'input-1']);

    // Opening canvas sets activeCanvasPayload to canvasPayload
    fixture.componentInstance['openCanvasSurface'](canvasPayload!);
    expect(fixture.componentInstance['isCanvasOpen']()).toBe(true);
    expect(fixture.componentInstance['activeCanvasPayload']()).toEqual(canvasPayload);
  });

  it('resizes inspector drawer using keyboard arrow keys', () => {
    fixture.componentInstance['inspectorWidth'].set(380);

    fixture.componentInstance['handleInspectorResizeKey'](
      new KeyboardEvent('keydown', {key: 'ArrowLeft'}),
    );
    expect(fixture.componentInstance['inspectorWidth']()).toBe(404);

    fixture.componentInstance['handleInspectorResizeKey'](
      new KeyboardEvent('keydown', {key: 'ArrowRight'}),
    );
    expect(fixture.componentInstance['inspectorWidth']()).toBe(380);
  });

  it('resizes inspector drawer on mouse drag', () => {
    fixture.componentInstance['inspectorWidth'].set(380);

    const mouseDownEvent = new MouseEvent('mousedown', {clientX: 800});
    fixture.componentInstance['startInspectorResize'](mouseDownEvent);

    expect(fixture.componentInstance['isResizingInspector']()).toBe(true);

    const mouseMoveEvent = new MouseEvent('mousemove', {clientX: 750});
    window.dispatchEvent(mouseMoveEvent);

    expect(fixture.componentInstance['inspectorWidth']()).toBe(430);

    const mouseUpEvent = new MouseEvent('mouseup');
    window.dispatchEvent(mouseUpEvent);

    expect(fixture.componentInstance['isResizingInspector']()).toBe(false);
  });

  it('aborts active generation when cancelActiveGeneration is called', () => {
    fixture.componentInstance['sendUserMessage']({text: 'Long prompt', images: []});
    expect(fixture.componentInstance['isStreaming']()).toBe(true);

    fixture.componentInstance['cancelActiveGeneration']();
    expect(fixture.componentInstance['isStreaming']()).toBe(false);
  });

  it('handles agent connection failure and sets connection error', async () => {
    mockA2aTransport.getAgentCard = vi.fn().mockRejectedValue(new Error('Connection refused'));
    fixture.componentInstance['openConfigPanel']();

    await fixture.componentInstance['connectToAgent']('http://localhost:9999');

    expect(fixture.componentInstance['connectionError']()).toBe('Connection refused');
    expect(fixture.componentInstance['isConfigPanelOpen']()).toBe(true);
  });

  it('handles non-Error rejection in agent connection', async () => {
    mockA2aTransport.getAgentCard = vi.fn().mockRejectedValue('String error');

    await fixture.componentInstance['connectToAgent']('http://localhost:9999');

    expect(fixture.componentInstance['connectionError']()).toBe(
      'Failed to connect to agent endpoint.',
    );
  });

  it('does not persist backendMode or agent URL if agent connection fails', async () => {
    vi.clearAllMocks();
    mockA2aTransport.getAgentCard = vi.fn().mockRejectedValue(new Error('Connection failed'));

    await fixture.componentInstance['connectToAgent'](
      'http://localhost:9999',
      'test-tenant',
      A2aBackendMode.HTTP_JSONRPC,
    );

    expect(mockConfigProvider.setA2aBackendMode).not.toHaveBeenCalled();
    expect(mockConfigProvider.setA2aAgentUrl).not.toHaveBeenCalled();
    expect(mockConfigProvider.setA2aTenantId).not.toHaveBeenCalled();
  });

  it('persists backendMode and configuration when agent connection succeeds', async () => {
    vi.clearAllMocks();
    mockA2aTransport.getAgentCard = vi.fn().mockResolvedValue({name: 'Test Agent'});

    await fixture.componentInstance['connectToAgent'](
      'http://localhost:9999',
      'test-tenant',
      A2aBackendMode.HTTP_JSONRPC,
    );

    expect(mockConfigProvider.setA2aAgentUrl).toHaveBeenCalledWith('http://localhost:9999');
    expect(mockConfigProvider.setA2aTenantId).toHaveBeenCalledWith('test-tenant');
    expect(mockConfigProvider.setA2aBackendMode).toHaveBeenCalledWith(A2aBackendMode.HTTP_JSONRPC);
  });

  it('displays fallback message when agent response generates no content', async () => {
    mockA2aTransport.sendMessageStream = vi.fn().mockImplementation(async function* () {
      yield {
        taskId: 't-empty',
        contextId: 'c-empty',
        message: {
          role: 'agent',
          parts: [],
        },
        final: true,
      };
    });

    fixture.componentInstance['sendUserMessage']({text: 'Empty result', images: []});
    await fixture.whenStable();

    const messages = fixture.componentInstance['messages']();
    expect(messages[1].text).toContain('Agent finished without generating content');
  });

  it('streams thought chunks into thinking state and updates active canvas payload when open', async () => {
    fixture.componentInstance['openCanvasSurface']([]);
    expect(fixture.componentInstance['isCanvasOpen']()).toBe(true);

    mockA2aTransport.sendMessageStream = vi.fn().mockImplementation(async function* () {
      yield {
        taskId: 't-thought',
        contextId: 'c-thought',
        message: {
          role: 'agent',
          parts: [
            {thought: 'Reasoning step 1... '},
            {
              data: {
                mimeType: 'application/json+a2ui',
                data: JSON.stringify([
                  {
                    version: 'v0.9',
                    createSurface: {
                      surfaceId: 'surf-live',
                      catalogId: 'cat-live',
                      component: 'Canvas',
                    },
                  },
                ]),
              },
            },
          ],
        },
        final: true,
      };
    });

    fixture.componentInstance['sendUserMessage']({text: 'Deep thinking query', images: []});
    await fixture.whenStable();

    const messages = fixture.componentInstance['messages']();
    expect(messages[1].thinking).toContain('Reasoning step 1...');
    expect(fixture.componentInstance['activeCanvasPayload']()?.length).toBe(1);
  });

  it('handles non-Error exception in sendMessageStream', async () => {
    mockA2aTransport.sendMessageStream = vi.fn().mockImplementation(async function* () {
      throw 'Raw string failure';
    });

    fixture.componentInstance['sendUserMessage']({text: 'Fail', images: []});
    await fixture.whenStable();

    const messages = fixture.componentInstance['messages']();
    expect(messages[1].sender).toBe('error');
    expect(messages[1].text).toContain('Unknown communication error');
  });

  it('sets error message when agent URL is empty / unconfigured during message sending', async () => {
    mockAgentUrlSignal.set('');
    fixture.componentInstance['sendUserMessage']({text: 'Send with no URL', images: []});
    await fixture.whenStable();

    const messages = fixture.componentInstance['messages']();
    expect(messages.length).toBe(2);
    expect(messages[1].sender).toBe('error');
    expect(messages[1].text).toBe('Error: Agent URL is not configured.');
    expect(fixture.componentInstance['isStreaming']()).toBe(false);
    expect(mockA2aTransport.sendMessageStream).not.toHaveBeenCalled();
  });

  it('triggers user action message and sends action to agent when SEND_TO_SERVER arrives from hostCommunication', async () => {
    const actionPayload = {
      name: 'select_demo',
      context: {demoId: 'material_gallery'},
    };

    mockMessageStream$.next({
      type: PreviewBridgeMessageType.SEND_TO_SERVER,
      payload: {
        version: 'v0.9',
        action: actionPayload,
      },
      origin: 'http://localhost:3000',
      timestamp: Date.now(),
    });

    await fixture.whenStable();

    const messages = fixture.componentInstance['messages']();
    expect(messages.length).toBe(2);

    // User turn
    const userMsg = messages[0];
    expect(userMsg.sender).toBe('user');
    expect(userMsg.text).toBe('Action: select_demo');

    // Transport call verification
    expect(mockA2aTransport.sendMessageStream).toHaveBeenCalledWith(
      'http://localhost:8000',
      expect.objectContaining({
        role: 'user',
        parts: expect.arrayContaining([
          {text: 'Action: select_demo'},
          expect.objectContaining({
            data: expect.objectContaining({
              action: actionPayload,
              userAction: actionPayload,
            }),
            metadata: {
              type: 'a2ui_action',
            },
          }),
        ]),
      }),
      expect.any(Object),
    );

    // Agent response streamed in
    const agentMsg = messages[1];
    expect(agentMsg.sender).toBe('agent');
    expect(agentMsg.text).toBe('Hello from mock streaming!');
  });

  it('handles falsy actions like boolean false or number 0 in handleSendToServerAction without dropping them', async () => {
    // null or undefined should be ignored
    const initialCount = fixture.componentInstance['messages']().length;
    fixture.componentInstance['handleSendToServerAction'](null);
    fixture.componentInstance['handleSendToServerAction'](undefined);
    expect(fixture.componentInstance['messages']().length).toBe(initialCount);

    // false should be dispatched
    fixture.componentInstance['handleSendToServerAction'](false);
    await fixture.whenStable();

    expect(mockA2aTransport.sendMessageStream).toHaveBeenCalledWith(
      'http://localhost:8000',
      expect.objectContaining({
        parts: expect.arrayContaining([
          expect.objectContaining({
            data: expect.objectContaining({action: false}),
          }),
        ]),
      }),
      expect.any(Object),
    );
  });

  it('cleans up resize event listeners on window mouseup or component destroy', () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    const mousedownEvent = new MouseEvent('mousedown', {clientX: 400});
    fixture.componentInstance['startInspectorResize'](mousedownEvent);

    expect(fixture.componentInstance['isResizingInspector']()).toBe(true);
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function),
      expect.any(Object),
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'mouseup',
      expect.any(Function),
      expect.any(Object),
    );

    // Trigger mouseup on window
    const mouseupEvent = new MouseEvent('mouseup');
    window.dispatchEvent(mouseupEvent);

    expect(fixture.componentInstance['isResizingInspector']()).toBe(false);
    expect(abortSpy).toHaveBeenCalled();
  });

  it('does not overwrite active canvas payload when a new turn contains an inline-only surface', async () => {
    const canvasPayload = [
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'canvas-demo',
          catalogId: 'cat-1',
          component: 'Canvas',
        },
      },
    ];

    // 1. User opens Canvas with an artifact from chat
    fixture.componentInstance['openCanvasSurface'](canvasPayload);
    expect(fixture.componentInstance['isCanvasOpen']()).toBe(true);
    expect(fixture.componentInstance['activeCanvasPayload']()).toEqual(canvasPayload);

    // 2. Subsequent turn arrives with an inline-only surface (e.g. flight card with no Canvas component)
    const inlineOnlyPayload = [
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'flight-card-surface',
          catalogId: 'cat-1',
        },
        updateComponents: {
          surfaceId: 'flight-card-surface',
          components: [{id: 'flight-card', component: {Card: {title: 'OS 87 · Vienna to NY'}}}],
        },
      },
    ];

    mockA2aTransport.sendMessageStream = vi.fn().mockImplementation(async function* () {
      yield {
        taskId: 't-inline-turn',
        contextId: 'c-inline-turn',
        message: {
          role: 'agent',
          parts: [
            {text: 'Here is the flight status card:'},
            {
              data: {
                mimeType: 'application/json+a2ui',
                data: JSON.stringify(inlineOnlyPayload),
              },
            },
          ],
        },
        final: true,
      };
    });

    fixture.componentInstance['sendUserMessage']({text: 'Show flight', images: []});
    await fixture.whenStable();

    const messages = fixture.componentInstance['messages']();
    const newAgentMsg = messages[1];
    expect(newAgentMsg.hasCanvas).toBe(false);
    expect(newAgentMsg.inlineA2uiPayload).toBeDefined();

    // Canvas remains open with the original canvas payload and was NOT overwritten by the flight card
    expect(fixture.componentInstance['isCanvasOpen']()).toBe(true);
    expect(fixture.componentInstance['activeCanvasPayload']()).toEqual(canvasPayload);
  });

  it('dispatches sendRenderA2UI when canvas surface is opened with payload', () => {
    const hostComm = TestBed.inject(HostCommunication);
    const payload: RenderA2uiItem[] = [
      {version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: 'c1'}},
    ];
    fixture.componentInstance['openCanvasSurface'](payload);
    fixture.detectChanges();

    expect(hostComm.sendRenderA2UI).toHaveBeenCalledWith(payload);
  });
});
