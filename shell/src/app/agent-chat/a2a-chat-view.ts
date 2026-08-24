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
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {RenderA2uiItem} from 'a2ui-bridge';
import {A2A_TRANSPORT} from '../chat/a2a/a2a-transport.token';
import {A2aMessage, AgentCard, TaskStatusUpdateEvent} from '../chat/a2a/a2a-types';
import {RenderedFrame} from '../preview/rendered/rendered-frame';
import {
  AppConfigProvider,
  A2aBackendMode,
} from '../settings/app-config-provider/app-config-provider';
import {generateUuid as uuid} from '../utils/uuid';
import {AgentConfigPanel, AgentConfigSaveEvent} from './agent-config-panel/agent-config-panel';
import {A2aAgentHeader} from './agent-header/agent-header';
import {A2aChatHistory} from './chat-history/chat-history';
import {
  a2aCardToUiAgentInfo,
  createErrorEvent,
  createReceivedEvent,
  createSentMessageEvent,
  hasA2uiCanvasComponent,
  parseA2aStreamEvent,
} from './converters/a2a-ui-converter';
import {A2aInputArea, SendMessageEvent} from './input-area/input-area';
import {A2aMessageInspector} from './message-inspector/message-inspector';
import {InspectorEvent, UiAgentInfo, UiMessage} from './types';

/**
 * Top-level view container managing end-to-end Agent-to-Agent (A2A) testing,
 * interactive message exchanges, live A2UI surface rendering, and side drawer diagnostics.
 */
@Component({
  selector: 'a2ui-composer-a2a-chat-view',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    A2aAgentHeader,
    A2aChatHistory,
    A2aInputArea,
    A2aMessageInspector,
    AgentConfigPanel,
    RenderedFrame,
  ],
  templateUrl: './a2a-chat-view.ng.html',
  styleUrl: './a2a-chat-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class A2aChatView implements OnInit {
  protected readonly configProvider = inject(AppConfigProvider);
  private readonly a2aTransport = inject(A2A_TRANSPORT);
  private readonly destroyRef = inject(DestroyRef);

  /** Discovered A2A AgentCard metadata for the connected agent. */
  protected readonly agentCard = signal<AgentCard | null>(null);
  /** Normalized UI metadata and skills for display. */
  protected readonly agentInfo = signal<UiAgentInfo | null>(null);
  /** Message conversation history list. */
  protected readonly messages = signal<UiMessage[]>([]);
  /** Raw A2A protocol events recorded for inspection. */
  protected readonly inspectorEvents = signal<InspectorEvent[]>([]);
  /** Current active task ID from the agent server. */
  protected readonly activeTaskId = signal<string | null>(null);
  /** Current active conversation context / session ID. */
  protected readonly activeContextId = signal<string | null>(null);

  /** Whether a connection handshake is currently in progress. */
  protected readonly isConnecting = signal<boolean>(false);
  /** Connection error string if agent discovery or handshake failed. */
  protected readonly connectionError = signal<string | null>(null);
  /** Whether the message inspector side drawer is open. */
  protected readonly isInspectorOpen = signal<boolean>(false);
  /** Whether the agent configuration modal is open. */
  protected readonly isConfigPanelOpen = signal<boolean>(false);
  /** Whether the A2UI Canvas surface preview panel is open. */
  protected readonly isCanvasOpen = signal<boolean>(false);
  /** Active A2UI component items to render inside Canvas. */
  protected readonly activeCanvasPayload = signal<RenderA2uiItem[] | null>(null);
  /** Whether a response stream turn is currently executing. */
  protected readonly isStreaming = signal<boolean>(false);

  private activeAbortController?: AbortController;

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => {
      this.cancelActiveGeneration();
    });

    const storedUrl = this.configProvider.a2aAgentUrl();
    const storedTenant = this.configProvider.a2aTenantId();
    const backendMode = this.configProvider.a2aBackendMode();

    if (storedUrl) {
      this.connectToAgent(storedUrl, storedTenant, backendMode);
    } else {
      this.isConfigPanelOpen.set(true);
    }
  }

  async connectToAgent(
    url: string,
    tenantId?: string,
    backendMode?: A2aBackendMode,
  ): Promise<void> {
    const trimmedUrl = url?.trim();
    if (!trimmedUrl || this.isConnecting()) return;

    this.isConnecting.set(true);
    this.connectionError.set(null);

    try {
      const card = await this.a2aTransport.getAgentCard(trimmedUrl);

      this.configProvider.setA2aAgentUrl(trimmedUrl);
      if (tenantId !== undefined) {
        this.configProvider.setA2aTenantId(tenantId.trim());
      }
      if (backendMode) {
        this.configProvider.setA2aBackendMode(backendMode);
      }

      this.agentCard.set(card);
      const info = a2aCardToUiAgentInfo(card, trimmedUrl);
      this.agentInfo.set(info);
      this.isConfigPanelOpen.set(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect to agent endpoint.';
      this.connectionError.set(errorMsg);
      this.recordInspectorEvent(createErrorEvent(err));
    } finally {
      this.isConnecting.set(false);
    }
  }

  protected saveAgentConfiguration(event: AgentConfigSaveEvent): void {
    this.connectToAgent(event.endpoint, event.tenantId, event.backendMode);
  }

  protected clearAgentConfiguration(): void {
    this.cancelActiveGeneration();
    this.configProvider.setA2aAgentUrl('');
    this.configProvider.setA2aTenantId('');
    this.agentCard.set(null);
    this.agentInfo.set(null);
    this.messages.set([]);
    this.inspectorEvents.set([]);
    this.activeTaskId.set(null);
    this.activeContextId.set(null);
    this.activeCanvasPayload.set(null);
    this.isCanvasOpen.set(false);
  }

  protected sendUserMessage(event: SendMessageEvent): void {
    const userText = (event.text || '').trim();
    const images = event.images || [];

    if (!userText && images.length === 0) return;

    const userMessageId = uuid();
    const userUiMessage: UiMessage = {
      id: userMessageId,
      sender: 'user',
      text: userText,
      images,
      timestamp: Date.now(),
    };

    const parts: A2aMessage['parts'] = [];
    if (userText) {
      parts.push({text: userText});
    }
    for (const img of images) {
      parts.push({
        data: {
          mimeType: img.mimeType,
          data: img.data,
          name: img.name,
        },
      });
    }

    const contextId = this.activeContextId() || uuid();
    this.activeContextId.set(contextId);

    const a2aMsg: A2aMessage = {
      role: 'user',
      parts,
      contextId,
    };

    this.recordInspectorEvent(createSentMessageEvent(a2aMsg));

    const agentMessageId = uuid();
    const agentUiMessage: UiMessage = {
      id: agentMessageId,
      sender: 'agent',
      text: '',
      thinking: '',
      timestamp: Date.now(),
      isStreaming: true,
      a2uiPayload: [],
    };

    this.messages.update(msgs => [...msgs, userUiMessage, agentUiMessage]);
    this.executeStreamingTurn(a2aMsg, agentMessageId, undefined, contextId);
  }

  protected submitSamplePrompt(prompt: string): void {
    this.sendUserMessage({text: prompt, images: []});
  }

  private async executeStreamingTurn(
    a2aMsg: A2aMessage,
    agentMessageId: string,
    taskId?: string,
    contextId?: string,
  ): Promise<void> {
    this.isStreaming.set(true);
    if (this.activeAbortController) {
      this.activeAbortController.abort();
    }
    const controller = new AbortController();
    this.activeAbortController = controller;

    const url = this.configProvider.a2aAgentUrl();
    if (!url) {
      this.messages.update(msgs =>
        msgs.map(m =>
          m.id === agentMessageId
            ? {
                ...m,
                sender: 'error',
                text: 'Error: Agent URL is not configured.',
                isStreaming: false,
              }
            : m,
        ),
      );
      if (this.activeAbortController === controller) {
        this.isStreaming.set(false);
        this.activeAbortController = undefined;
      }
      return;
    }
    const tenantId = this.configProvider.a2aTenantId() || undefined;

    try {
      const stream = this.a2aTransport.sendMessageStream(url, a2aMsg, {
        tenantId,
        taskId,
        contextId,
        abortSignal: controller.signal,
      });

      for await (const chunk of stream) {
        if (controller.signal.aborted) break;
        this.recordInspectorEvent(createReceivedEvent(chunk));
        this.handleStreamEvent(chunk, agentMessageId);
      }
    } catch (err: unknown) {
      if (controller.signal.aborted) {
        return;
      }
      const errText = err instanceof Error ? err.message : 'Unknown communication error';
      this.recordInspectorEvent(createErrorEvent(errText));

      this.messages.update(msgs =>
        msgs.map(m =>
          m.id === agentMessageId
            ? {
                ...m,
                sender: 'error',
                text: m.text ? `${m.text}\n\n[Error: ${errText}]` : `Error: ${errText}`,
                isStreaming: false,
              }
            : m,
        ),
      );
    } finally {
      if (this.activeAbortController === controller) {
        this.isStreaming.set(false);
        this.activeAbortController = undefined;
      }

      this.messages.update(msgs =>
        msgs.map(m => {
          if (m.id !== agentMessageId) return m;
          if (controller.signal.aborted) {
            const currentText = m.text ? `${m.text}\n\n*(Turn cancelled)*` : '*(Turn cancelled)*';
            return {...m, text: currentText, isStreaming: false};
          }
          const hasContent = m.text || m.thinking || (m.a2uiPayload && m.a2uiPayload.length > 0);
          if (!hasContent && m.sender !== 'error') {
            return {
              ...m,
              text: '*(Agent finished without generating content. Check the agent server console logs or Message Inspector for details.)*',
              isStreaming: false,
            };
          }
          return {...m, isStreaming: false};
        }),
      );
    }
  }

  private handleStreamEvent(event: TaskStatusUpdateEvent, agentMessageId: string): void {
    const parsed = parseA2aStreamEvent(event);

    if (parsed.contextId) {
      this.activeContextId.set(parsed.contextId);
    }
    if (parsed.taskId) {
      this.activeTaskId.set(parsed.taskId);
    }

    this.messages.update(msgs =>
      msgs.map(m => {
        if (m.id !== agentMessageId) return m;

        const updatedText = parsed.textChunk ? m.text + parsed.textChunk : m.text;
        const updatedThinking = parsed.thoughtChunk
          ? (m.thinking || '') + parsed.thoughtChunk
          : m.thinking;
        const updatedPayload =
          parsed.a2uiItems.length > 0
            ? [...(m.a2uiPayload || []), ...parsed.a2uiItems]
            : m.a2uiPayload;

        return {
          ...m,
          text: updatedText,
          thinking: updatedThinking,
          a2uiPayload: updatedPayload,
          hasCanvas: hasA2uiCanvasComponent(updatedPayload || []),
          isStreaming: !parsed.isCompleted,
          rawA2aMessage: event.message || m.rawA2aMessage,
        };
      }),
    );

    if (this.isCanvasOpen() && parsed.a2uiItems.length > 0) {
      this.activeCanvasPayload.update(prev => [...(prev || []), ...parsed.a2uiItems]);
    }
  }

  protected cancelActiveGeneration(): void {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = undefined;
    }
    this.isStreaming.set(false);
    this.messages.update(msgs => msgs.map(m => (m.isStreaming ? {...m, isStreaming: false} : m)));
  }

  protected resetActiveSession(): void {
    this.cancelActiveGeneration();
    this.messages.set([]);
    this.activeTaskId.set(null);
    this.activeContextId.set(null);
    this.activeCanvasPayload.set(null);
    this.isCanvasOpen.set(false);
  }

  protected openCanvasSurface(payload: RenderA2uiItem[]): void {
    this.activeCanvasPayload.set(payload);
    this.isCanvasOpen.set(true);
  }

  protected closeCanvasSurface(): void {
    this.isCanvasOpen.set(false);
    this.activeCanvasPayload.set(null);
  }

  protected toggleInspectorDrawer(): void {
    this.isInspectorOpen.update(v => !v);
  }

  protected openConfigPanel(): void {
    this.isConfigPanelOpen.set(true);
  }

  protected clearInspectorEvents(): void {
    this.inspectorEvents.set([]);
  }

  private recordInspectorEvent(event: InspectorEvent): void {
    this.inspectorEvents.update(evts => [event, ...evts].slice(0, 500));
  }
}
