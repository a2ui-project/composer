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
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {RenderA2uiItem} from 'a2ui-bridge';
import {StartupResolution} from '../shell/startup-resolution/startup-resolution';
import {HostCommunication} from '../shell/host-communication/host-communication';
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

  beforeEach(async () => {
    mockAgentUrlSignal = signal('http://localhost:8000');
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
            sendTheme: vi.fn(),
            sendRenderA2UI: vi.fn(),
            messageStream: signal(null),
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
                    createSurface: {surfaceId: 's1', catalogId: 'c1'},
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
                    createSurface: {surfaceId: 'surf-live', catalogId: 'cat-live'},
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
