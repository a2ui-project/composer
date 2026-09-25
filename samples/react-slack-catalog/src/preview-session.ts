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

import {type RendererConfig, type ThemePreference} from 'a2ui-bridge';
import {type A2uiClientAction, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {slackCatalogJson} from './catalog';
import {SLACK_COMPONENT_USAGES} from './examples';
import {
  createSlackPreviewSession as createLoweringPreviewSession,
  type PreviewDiagnostic,
  type PreviewSession,
  type PreviewSnapshot,
  type SlackLoweringPreviewSession,
} from './lower-surface';

export type {PreviewDiagnostic, PreviewSession, PreviewSnapshot};

export interface SlackPreviewBridgeOptions {
  onThemeChange?: (theme: ThemePreference) => void;
}

export function createSlackPreviewSession(
  actionHandler?: (action: A2uiClientAction) => void | Promise<void>,
): PreviewSession {
  const session = createLoweringPreviewSession(actionHandler);
  const activeSurfaceIds = new Set<string>();
  const listeners = new Set<() => void>();
  let processingMessages: A2uiMessage[] | undefined;
  const unsubscribeFromLowerSession = session.subscribe(() => {
    const snapshot = session.getSnapshot();
    freezeSnapshot(snapshot);
    if (processingMessages) {
      syncActiveSurfaceIds(session, activeSurfaceIds);
    }
    for (const listener of listeners) {
      listener();
    }
  });
  freezeSnapshot(session.getSnapshot());

  return {
    processMessages(messages) {
      const processedMessages = addRecreateDeletes(messages, activeSurfaceIds);

      processingMessages = processedMessages;
      try {
        session.processMessages(processedMessages);
      } finally {
        processingMessages = undefined;
      }
    },

    getSnapshot() {
      return session.getSnapshot();
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    subscribeSurfaceCreated(listener) {
      return session.subscribeSurfaceCreated(listener);
    },

    dispatch(actionId) {
      return session.dispatch(actionId);
    },

    updateInput(actionId, value) {
      session.updateInput(actionId, value);
    },

    clear() {
      activeSurfaceIds.clear();
      session.clear();
      freezeSnapshot(session.getSnapshot());
    },

    dispose() {
      activeSurfaceIds.clear();
      listeners.clear();
      unsubscribeFromLowerSession();
      session.dispose();
      freezeSnapshot(session.getSnapshot());
    },
  };
}

export function createSlackPreviewBridgeConfig(
  session: PreviewSession,
  options: SlackPreviewBridgeOptions = {},
): RendererConfig {
  return {
    surfaceGroup: {
      onSurfaceCreated: {
        subscribe: listener => ({unsubscribe: session.subscribeSurfaceCreated(listener)}),
      },
    },
    catalogJson: slackCatalogJson,
    getComponentUsages: async () => SLACK_COMPONENT_USAGES,
    onThemeChange: options.onThemeChange,
    onSurfaceReady: () => {},
    onSurfaceCleared: () => {
      if (session.getSnapshot().status !== 'empty') {
        session.clear();
      }
    },
  };
}

function addRecreateDeletes(
  messages: A2uiMessage[],
  activeSurfaceIds: ReadonlySet<string>,
): A2uiMessage[] {
  const nextActiveSurfaceIds = new Set(activeSurfaceIds);
  const processedMessages: A2uiMessage[] = [];

  for (const message of messages) {
    const surfaceId = createSurfaceId(message);

    if (surfaceId && nextActiveSurfaceIds.has(surfaceId)) {
      processedMessages.push({
        version: 'v0.9',
        deleteSurface: {
          surfaceId,
        },
      });
      nextActiveSurfaceIds.delete(surfaceId);
    }

    processedMessages.push(message);
    if (surfaceId) {
      nextActiveSurfaceIds.add(surfaceId);
    }

    const deletedSurfaceId = deleteSurfaceId(message);
    if (deletedSurfaceId) {
      nextActiveSurfaceIds.delete(deletedSurfaceId);
    }
  }

  return processedMessages;
}

function syncActiveSurfaceIds(
  session: SlackLoweringPreviewSession,
  activeSurfaceIds: Set<string>,
): void {
  activeSurfaceIds.clear();
  for (const surfaceId of session.getActiveSurfaceIds()) {
    activeSurfaceIds.add(surfaceId);
  }
}

function createSurfaceId(message: A2uiMessage): string | undefined {
  return 'createSurface' in message ? message.createSurface.surfaceId : undefined;
}

function deleteSurfaceId(message: A2uiMessage): string | undefined {
  return 'deleteSurface' in message ? message.deleteSurface.surfaceId : undefined;
}

function freezeSnapshot(snapshot: PreviewSnapshot): void {
  deepFreeze(snapshot.diagnostics);
  deepFreeze(snapshot.blocks);
  Object.freeze(snapshot);
}

function deepFreeze(value: unknown): void {
  if (typeof value !== 'object' || value === null || Object.isFrozen(value)) {
    return;
  }

  Object.freeze(value);

  for (const child of Object.values(value)) {
    deepFreeze(child);
  }
}
