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
import {
  ComponentContext,
  MessageProcessor,
  type A2uiClientAction,
  type A2uiMessage,
  type ComponentApi,
  type SurfaceModel,
} from '@a2ui/web_core/v0_9';
import {type KnownBlock} from '@slack/types';
import {
  dispatchCurrentEventAction,
  isCurrentActionEntry,
  type ActionDispatchEntry,
} from './action-dispatch';
import {slackCatalog, slackCatalogJson} from './catalog';
import {createBlobChartImageStore, type ChartImageStore} from './chart-image';
import {SLACK_COMPONENT_USAGES} from './examples';
import {readFormInputValue, updateFormInput, type InputDispatchEntry} from './form-input';
import {dispatchReadOnlyLocalFunctionAction} from './local-function-dispatch';
import {lowerSurface} from './lower-surface';
import {
  DiagnosticCode,
  DiagnosticLevel,
  PreviewStatus,
  createEmptySnapshot,
  type PreviewSnapshot,
} from './preview-snapshot';

/**
 * The Slack preview's model: it processes A2UI messages, lowers the newest
 * surface to Slack blocks, and runs the actions and input edits made in the
 * preview against that surface.
 */
export interface PreviewSession {
  /** Applies A2UI messages from Composer and renders the result. */
  processMessages(messages: A2uiMessage[]): void;
  /** The current render. The snapshot is frozen; each render replaces it. */
  getSnapshot(): PreviewSnapshot;
  /**
   * Calls `listener` after each new snapshot.
   *
   * @return A function that stops the calls.
   */
  subscribe(listener: () => void): () => void;
  /**
   * Calls `listener` with each surface a `createSurface` message creates.
   *
   * @return A function that stops the calls.
   */
  subscribeSurfaceCreated(listener: (surface: SurfaceModel) => void): () => void;
  /** Runs the A2UI action behind a Slack button's `action_id`. */
  dispatch(actionId: string): Promise<void>;
  /** Writes a value typed into a Slack input to the input's data binding. */
  updateInput(actionId: string, value: string): void;
  /** Deletes every surface and shows the empty preview. */
  clear(): void;
  /** Releases the session; later calls do nothing. */
  dispose(): void;
}

/** Settings for `createSlackPreviewBridgeConfig`. */
interface SlackPreviewBridgeOptions {
  /** Called when Composer's light or dark theme changes. */
  onThemeChange?: (theme: ThemePreference) => void;
}

/** Settings for `createSlackPreviewSession`. */
interface SlackPreviewSessionOptions {
  /** Serves drawn chart images; defaults to blob URLs. */
  readonly chartImages?: ChartImageStore;
}

/**
 * Creates the Slack preview's session.
 *
 * @param actionHandler Receives the A2UI event actions the preview dispatches.
 * @param options Where the session serves the images it draws for charts.
 */
export function createSlackPreviewSession(
  actionHandler?: (action: A2uiClientAction) => void | Promise<void>,
  options: SlackPreviewSessionOptions = {},
): PreviewSession {
  const chartImages = options.chartImages ?? createBlobChartImageStore();
  let processor = new MessageProcessor([slackCatalog], actionHandler);
  let inputResetKey = 0;
  let snapshot: PreviewSnapshot = freezeSnapshot({...createEmptySnapshot(0), inputResetKey});
  let actions = new Map<string, ActionDispatchEntry>();
  let inputs = new Map<string, InputDispatchEntry>();
  let revision = 0;
  let activeSurfaceSubscription: ActiveSurfaceSubscription | undefined;
  let lifecycleSubscriptions: SubscriptionLike[] = [];
  let processingBatch = false;
  let disposed = false;
  const listeners = new Set<() => void>();
  const surfaceCreatedListeners = new Set<(surface: SurfaceModel) => void>();

  const publish = (
    next: PreviewSnapshot,
    nextActions = new Map<string, ActionDispatchEntry>(),
    nextInputs = new Map<string, InputDispatchEntry>(),
  ) => {
    snapshot = freezeSnapshot({...next, inputResetKey});
    actions = nextActions;
    inputs = nextInputs;
    // Keep only the chart images this snapshot, or the one before it, shows.
    chartImages.release(shownImageUrls(snapshot.blocks));
    for (const listener of listeners) {
      listener();
    }
  };

  const clearActiveSurfaceSubscription = () => {
    activeSurfaceSubscription?.unsubscribe();
    activeSurfaceSubscription = undefined;
  };

  const subscribeToSurface = (surface: SurfaceModel) => {
    clearActiveSurfaceSubscription();
    const subscription = surface.dataModel.subscribe('/', () => {
      if (disposed || processingBatch) {
        return;
      }
      rerender();
    });
    activeSurfaceSubscription = {
      surfaceId: surface.id,
      unsubscribe: () => {
        subscription.unsubscribe();
      },
    };
  };

  const unsubscribeFromProcessorLifecycle = () => {
    for (const subscription of lifecycleSubscriptions) {
      subscription.unsubscribe();
    }
    lifecycleSubscriptions = [];
    clearActiveSurfaceSubscription();
  };

  const subscribeToProcessorLifecycle = () => {
    lifecycleSubscriptions = [
      processor.onSurfaceCreated(surface => {
        subscribeToSurface(surface);
        for (const listener of surfaceCreatedListeners) {
          listener(surface);
        }
      }),
      processor.onSurfaceDeleted(surfaceId => {
        if (activeSurfaceSubscription?.surfaceId !== surfaceId) {
          return;
        }
        clearActiveSurfaceSubscription();
        const surface = lastSurface(processor);
        if (surface) {
          subscribeToSurface(surface);
        }
      }),
    ];
  };

  const rerender = () => {
    revision += 1;
    const surface = lastSurface(processor);
    if (!surface) {
      publish(createEmptySnapshot(revision));
      return;
    }
    const lowered = lowerSurface(surface, revision, chartImages);
    publish(lowered.snapshot, lowered.actions, lowered.inputs);
  };

  subscribeToProcessorLifecycle();

  return {
    processMessages(messages) {
      if (disposed) {
        return;
      }
      inputResetKey += 1;
      processingBatch = true;
      try {
        processor.processMessages(
          withRecreateDeletes(messages, new Set(processor.model.surfacesMap.keys())),
        );
        processingBatch = false;
        rerender();
      } catch (error) {
        processingBatch = false;
        revision += 1;
        publish({
          revision,
          status: PreviewStatus.ERROR,
          blocks: [],
          diagnostics: [
            {
              level: DiagnosticLevel.ERROR,
              code: DiagnosticCode.A2UI_PROCESS_MESSAGE_ERROR,
              message: error instanceof Error ? error.message : String(error),
            },
          ],
        });
      }
    },

    getSnapshot() {
      return snapshot;
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    subscribeSurfaceCreated(listener) {
      surfaceCreatedListeners.add(listener);
      return () => {
        surfaceCreatedListeners.delete(listener);
      };
    },

    async dispatch(actionId) {
      const entry = actions.get(actionId);
      if (!entry) {
        return;
      }
      const surface = lastSurface(processor);
      if (!('functionCall' in entry.action)) {
        await dispatchCurrentEventAction(actionId, {surface, registry: actions});
        return;
      }
      if (!isCurrentActionEntry(entry, surface)) {
        return;
      }

      const context = new ComponentContext(surface, entry.sourceComponentId, entry.basePath);
      const result = dispatchReadOnlyLocalFunctionAction(
        context,
        entry.action,
        entry.sourceComponentId,
      );
      if (!result.diagnostics?.length) {
        return;
      }

      publish(
        {
          ...snapshot,
          diagnostics: [...snapshot.diagnostics, ...result.diagnostics],
        },
        actions,
        inputs,
      );
    },

    updateInput(actionId, value) {
      if (disposed) {
        return;
      }
      const entry = inputs.get(actionId);
      if (!entry || entry.revision !== revision || entry.surface !== lastSurface(processor)) {
        return;
      }
      try {
        const siblingValues = [...inputs.values()]
          .filter(sibling => sibling.actionId !== actionId)
          .map(sibling => ({entry: sibling, value: readFormInputValue(sibling)}));
        updateFormInput(entry, value);
        if (
          siblingValues.some(
            sibling => !Object.is(readFormInputValue(sibling.entry), sibling.value),
          )
        ) {
          inputResetKey += 1;
          publish(snapshot, actions, inputs);
        }
      } catch (error) {
        inputResetKey += 1;
        publish(
          {
            ...snapshot,
            diagnostics: [
              ...snapshot.diagnostics.filter(
                diagnostic => diagnostic.code !== DiagnosticCode.A2UI_INPUT_ERROR,
              ),
              {
                level: DiagnosticLevel.ERROR,
                code: DiagnosticCode.A2UI_INPUT_ERROR,
                componentId: entry.componentId,
                message: error instanceof Error ? error.message : String(error),
              },
            ],
          },
          actions,
          inputs,
        );
      }
    },

    clear() {
      if (disposed) {
        return;
      }
      inputResetKey += 1;
      unsubscribeFromProcessorLifecycle();
      processor.model.dispose();
      processor = new MessageProcessor([slackCatalog], actionHandler);
      subscribeToProcessorLifecycle();
      revision += 1;
      publish(createEmptySnapshot(revision));
    },

    dispose() {
      if (disposed) {
        return;
      }
      disposed = true;
      unsubscribeFromProcessorLifecycle();
      processor.model.dispose();
      listeners.clear();
      surfaceCreatedListeners.clear();
      actions.clear();
      inputs.clear();
      chartImages.dispose();
      snapshot = freezeSnapshot({...createEmptySnapshot(revision), inputResetKey});
    },
  };
}

/**
 * Connects a session to `a2uiBridge.attachRenderer`, which feeds it Composer's
 * messages and asks it for the Slack catalog and Gallery examples.
 */
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
    // Required by RendererConfig, which other renderers use to learn which surface to
    // draw. This session always draws the newest surface and publishes a snapshot
    // after every batch of messages, so it has nothing to do here.
    onSurfaceReady: () => {},
    onSurfaceCleared: () => {
      if (session.getSnapshot().status !== PreviewStatus.EMPTY) {
        session.clear();
      }
    },
  };
}

type SubscriptionLike = {unsubscribe(): void};

interface ActiveSurfaceSubscription {
  readonly surfaceId: string;
  readonly unsubscribe: () => void;
}

/** The surface the preview shows: the most recently created one. */
function lastSurface(processor: MessageProcessor<ComponentApi>): SurfaceModel | undefined {
  return [...processor.model.surfacesMap.values()].at(-1);
}

/** The `image_url` of every image block in `blocks`: the images a snapshot shows. */
function shownImageUrls(blocks: readonly KnownBlock[]): Set<string> {
  return new Set(
    blocks.flatMap(block =>
      block.type === 'image' && 'image_url' in block ? [block.image_url] : [],
    ),
  );
}

/**
 * Adds a "recreate delete" before each `createSurface` for a surface that
 * already exists: a `deleteSurface` for the same ID. Composer sends the whole
 * canvas, `createSurface` included, every time it changes, but
 * `MessageProcessor` rejects a `createSurface` for an ID it already has. Deleting
 * the old surface first turns the resend into a fresh render of the new canvas.
 *
 * @param activeSurfaceIds The surfaces the processor has before these messages.
 */
function withRecreateDeletes(
  messages: A2uiMessage[],
  activeSurfaceIds: ReadonlySet<string>,
): A2uiMessage[] {
  const nextActiveSurfaceIds = new Set(activeSurfaceIds);
  const processedMessages: A2uiMessage[] = [];

  for (const message of messages) {
    if ('createSurface' in message) {
      const {surfaceId} = message.createSurface;
      if (nextActiveSurfaceIds.has(surfaceId)) {
        processedMessages.push({version: 'v0.9', deleteSurface: {surfaceId}});
      }
      nextActiveSurfaceIds.add(surfaceId);
    } else if ('deleteSurface' in message) {
      nextActiveSurfaceIds.delete(message.deleteSurface.surfaceId);
    }
    processedMessages.push(message);
  }

  return processedMessages;
}

/**
 * Freezes a snapshot and everything in it. A snapshot is shared by reference
 * with React state, the Block Kit export and the third-party Slack renderer, and
 * React only re-renders for a new snapshot object. Freezing makes a consumer
 * that edits a published snapshot fail loudly, instead of silently changing
 * what the preview shows without a re-render.
 */
function freezeSnapshot(snapshot: PreviewSnapshot): PreviewSnapshot {
  deepFreeze(snapshot);
  return snapshot;
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
