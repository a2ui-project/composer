/**
 * SPDX-License-Identifier: MIT
 * Copyright (c) Atai Barkai
 *
 * Adapted from CopilotKit commit 00904af842b2f8c015f1e405a0c590a86d7842f8:
 * - examples/channels-a2ui-playground/src/poc/lower-surface.ts
 */

import {
  ActionSchema,
  ComponentContext,
  GenericBinder,
  MessageProcessor,
  type A2uiClientAction,
  type A2uiMessage,
  type Action,
  type ComponentApi,
  type SurfaceModel,
} from '@a2ui/web_core/v0_9';
import {
  Actions,
  Button as ChannelButton,
  Cell,
  Context,
  Divider as ChannelDivider,
  Header,
  Image as ChannelImage,
  Row as ChannelRow,
  Section,
  Table,
  createNativeNode,
  renderToIR,
  type ChannelNode,
  type ClickHandler,
  type Renderable,
  type TableColumn,
} from '@copilotkit/channels-ui';
import {SLACK_LIMITS, markdownToMrkdwn, renderBlockKit} from '@copilotkit/channels-slack/render';
import {type KnownBlock} from '@slack/types';
import {
  createEventActionDispatchEntry,
  dispatchCurrentEventAction,
  type EventActionDispatchEntry,
} from './action-dispatch';
import {slackCatalog} from './catalog';
import {dispatchReadOnlyLocalFunctionAction} from './local-function-dispatch';
import {type MarketSnapshotProps} from './market-snapshot';
import {
  createInputDispatchEntry,
  lowerFormInput,
  readFormInputValue,
  updateFormInput,
  type InputDispatchEntry,
} from './form-input';

const SLACK_TABLE_CELL_TEXT_AGGREGATE_LIMIT = 10_000;
const SLACK_TEXT_OBJECT_TEXT_LIMIT = SLACK_LIMITS.sectionText;
const SLACK_IMAGE_URL_LIMIT = 3_000;
const SLACK_IMAGE_ALT_TEXT_LIMIT = 2_000;
const SLACK_IMAGE_TITLE_TEXT_LIMIT = SLACK_IMAGE_ALT_TEXT_LIMIT;
const RFC3986_PATH = /^(?:[A-Za-z0-9\-._~!$&'()*+,;=:@/]|%[0-9A-Fa-f]{2})*$/;
const RFC3986_QUERY_OR_FRAGMENT = /^(?:[A-Za-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*$/;

export interface PreviewDiagnostic {
  level: 'info' | 'warning' | 'error';
  code: string;
  message: string;
  componentId?: string;
}

export interface PreviewSnapshot {
  revision: number;
  /** Resets controls for external updates or rejected edits; valid local edits preserve focus. */
  inputResetKey?: number;
  surfaceId?: string;
  status: 'empty' | 'waiting' | 'ready' | 'error';
  blocks: KnownBlock[];
  diagnostics: PreviewDiagnostic[];
}

export interface PreviewSession {
  processMessages(messages: A2uiMessage[]): void;
  getSnapshot(): PreviewSnapshot;
  subscribe(listener: () => void): () => void;
  subscribeSurfaceCreated(listener: (surface: SurfaceModel) => void): () => void;
  dispatch(actionId: string): Promise<void>;
  updateInput(actionId: string, value: string): void;
  clear(): void;
  dispose(): void;
}

export interface SlackLoweringPreviewSession extends PreviewSession {
  getActiveSurfaceIds(): readonly string[];
}

interface ChildRef {
  id: string;
  basePath?: string;
}

interface SurfaceError {
  code: string;
  message: string;
  expression?: string;
  surfaceId?: string;
}

class WaitingForComponentError extends Error {
  constructor(readonly componentId: string) {
    super(`A2UI surface is waiting for component "${componentId}"`);
    this.name = 'WaitingForComponentError';
  }
}

class LoweringError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly componentId?: string,
  ) {
    super(message);
    this.name = 'LoweringError';
  }
}

type ActionDispatchEntry = EventActionDispatchEntry | LocalFunctionActionDispatchEntry;

interface LocalFunctionActionDispatchEntry {
  readonly actionId: string;
  readonly revision: number;
  readonly surface: SurfaceModel;
  readonly surfaceId: string;
  readonly sourceComponentId: string;
  readonly basePath: string;
  readonly action: Action;
}

interface LoweringState {
  readonly revision: number;
  readonly diagnostics: PreviewDiagnostic[];
  readonly actions: Map<string, ActionDispatchEntry>;
  readonly inputs: Map<string, InputDispatchEntry>;
  nextActionOrdinal: number;
}

interface OutputLimitEvidence {
  readonly blocksTrimmed: boolean;
  readonly actionsElementsTrimmed: boolean;
  readonly truncatedCodes: ReadonlySet<string>;
}

type SubscriptionLike = {unsubscribe(): void};

interface ActiveSurfaceSubscription {
  readonly surfaceId: string;
  readonly unsubscribe: () => void;
}

export function createSlackPreviewSession(
  actionHandler?: (action: A2uiClientAction) => void | Promise<void>,
): SlackLoweringPreviewSession {
  let processor = new MessageProcessor([slackCatalog], actionHandler);
  let inputResetKey = 0;
  let snapshot: PreviewSnapshot = {...emptySnapshot(0), inputResetKey};
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
    snapshot = {...next, inputResetKey};
    actions = nextActions;
    inputs = nextInputs;
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
      publish(emptySnapshot(revision));
      return;
    }
    if (surface.componentsModel.entries.next().done) {
      publish({...emptySnapshot(revision), surfaceId: surface.id});
      return;
    }

    const state: LoweringState = {
      revision,
      diagnostics: [],
      actions: new Map(),
      inputs: new Map(),
      nextActionOrdinal: 1,
    };

    try {
      const ir = wrapTopLevelButtons(lowerComponent(surface, 'root', '/', new Set(), state));
      const limitEvidence = collectOutputLimitEvidence(ir);
      const blocks = renderBlockKit(ir);
      const nextActions = filterActionsForBlocks(state.actions, blocks, state.diagnostics);
      validateSlackOutput(blocks);
      collectOutputLimitDiagnostics(
        state.actions.size,
        nextActions.size,
        limitEvidence,
        state.diagnostics,
      );
      publish(
        {
          revision,
          surfaceId: surface.id,
          status: 'ready',
          blocks,
          diagnostics: state.diagnostics,
        },
        nextActions,
        new Map([...state.inputs].filter(([id]) => collectActionIds(blocks).has(id))),
      );
    } catch (error) {
      if (error instanceof WaitingForComponentError) {
        publish({
          revision,
          surfaceId: surface.id,
          status: 'waiting',
          blocks: [],
          diagnostics: [
            {
              level: 'info',
              code: 'A2UI_WAITING_FOR_COMPONENT',
              message: error.message,
              componentId: error.componentId,
            },
          ],
        });
        return;
      }

      const diagnostic =
        error instanceof LoweringError
          ? {
              level: 'error' as const,
              code: error.code,
              message: error.message,
              componentId: error.componentId,
            }
          : {
              level: 'error' as const,
              code: 'A2UI_LOWERING_ERROR',
              message: error instanceof Error ? error.message : String(error),
            };

      publish({
        revision,
        surfaceId: surface.id,
        status: 'error',
        blocks: [],
        diagnostics: [diagnostic],
      });
    }
  };

  subscribeToProcessorLifecycle();

  const session: SlackLoweringPreviewSession = {
    processMessages(messages) {
      if (disposed) {
        return;
      }
      inputResetKey += 1;
      processingBatch = true;
      try {
        processor.processMessages(messages);
        processingBatch = false;
        rerender();
      } catch (error) {
        processingBatch = false;
        revision += 1;
        actions.clear();
        publish({
          revision,
          status: 'error',
          blocks: [],
          diagnostics: [
            {
              level: 'error',
              code: 'A2UI_PROCESS_MESSAGE_ERROR',
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
      if (!isCurrentActionEntry(entry, surface)) {
        return;
      }

      if (!('functionCall' in entry.action)) {
        await dispatchCurrentEventAction(actionId, {
          surface,
          registry: new Map([[actionId, entry]]),
        });
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
              ...snapshot.diagnostics.filter(diagnostic => diagnostic.code !== 'A2UI_INPUT_ERROR'),
              {
                level: 'error',
                code: 'A2UI_INPUT_ERROR',
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
      publish(emptySnapshot(revision));
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
      snapshot = {...emptySnapshot(revision), inputResetKey};
    },
    getActiveSurfaceIds() {
      return Array.from(processor.model.surfacesMap.keys());
    },
  };

  return session;
}

function emptySnapshot(revision: number): PreviewSnapshot {
  return {
    revision,
    status: 'empty',
    blocks: [],
    diagnostics: [],
  };
}

function wrapTopLevelButtons(nodes: ChannelNode[]): ChannelNode[] {
  const wrapped: ChannelNode[] = [];
  let buttons: ChannelNode[] = [];

  const flushButtons = () => {
    if (buttons.length === 0) {
      return;
    }
    wrapped.push(Actions({children: buttons}));
    buttons = [];
  };

  for (const node of nodes) {
    if (node.type === 'button') {
      buttons.push(node);
    } else {
      flushButtons();
      wrapped.push(node);
    }
  }
  flushButtons();

  return wrapped;
}

function filterActionsForBlocks(
  registeredActions: ReadonlyMap<string, ActionDispatchEntry>,
  blocks: readonly KnownBlock[],
  diagnostics: PreviewDiagnostic[],
): Map<string, ActionDispatchEntry> {
  const survivingActionIds = collectActionIds(blocks);
  const nextActions = new Map(
    [...registeredActions].filter(([actionId]) => survivingActionIds.has(actionId)),
  );
  const filteredCount = registeredActions.size - nextActions.size;
  if (filteredCount > 0) {
    diagnostics.push({
      level: 'warning',
      code: 'SLACK_ACTION_REGISTRY_FILTERED',
      message: `${filteredCount} action ${
        filteredCount === 1 ? 'ID was' : 'IDs were'
      } omitted because it is not present in the final Slack output.`,
    });
  }
  return nextActions;
}

function collectActionIds(value: unknown, actionIds = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectActionIds(item, actionIds);
    }
    return actionIds;
  }
  if (!isRecord(value)) {
    return actionIds;
  }

  if (typeof value.action_id === 'string') {
    actionIds.add(value.action_id);
  }
  for (const child of Object.values(value)) {
    collectActionIds(child, actionIds);
  }
  return actionIds;
}

function validateSlackOutput(blocks: readonly KnownBlock[]): void {
  if (blocks.length > SLACK_LIMITS.blocksPerMessage) {
    throw new LoweringError(
      'SLACK_BLOCK_LIMIT_EXCEEDED',
      `Slack output rendered ${blocks.length} blocks; the message limit is ${SLACK_LIMITS.blocksPerMessage}.`,
    );
  }

  let aggregateTableLength = 0;
  for (const block of blocks) {
    const blockType = stringField(block, 'type');
    if (blockType === 'header') {
      assertTextLimit(
        blockText(block),
        SLACK_LIMITS.headerText,
        'SLACK_HEADER_TEXT_LIMIT_EXCEEDED',
      );
    }
    if (blockType === 'section') {
      assertTextLimit(
        blockText(block),
        SLACK_LIMITS.sectionText,
        'SLACK_SECTION_TEXT_LIMIT_EXCEEDED',
      );
      const fields = arrayField(block, 'fields');
      if (fields.length > SLACK_LIMITS.fieldsPerSection) {
        throw new LoweringError(
          'SLACK_SECTION_FIELDS_LIMIT_EXCEEDED',
          `Slack output rendered ${fields.length} section fields; the limit is ${SLACK_LIMITS.fieldsPerSection}.`,
        );
      }
      for (const field of fields) {
        assertTextLimit(
          textObjectText(field),
          SLACK_LIMITS.fieldText,
          'SLACK_SECTION_FIELD_TEXT_LIMIT_EXCEEDED',
        );
      }
    }
    if (blockType === 'actions') {
      const elements = arrayField(block, 'elements');
      if (elements.length > SLACK_LIMITS.actionsElements) {
        throw new LoweringError(
          'SLACK_ACTIONS_ELEMENTS_LIMIT_EXCEEDED',
          `Slack output rendered ${elements.length} action elements; the limit is ${SLACK_LIMITS.actionsElements}.`,
        );
      }
      for (const element of elements) {
        validateActionElement(element);
      }
    }
    if (blockType === 'context') {
      validateContextBlock(block);
    }
    if (blockType === 'image') {
      validateImageBlock(block);
    }
    if (blockType === 'table') {
      const cellTexts = tableCellTexts(block);
      aggregateTableLength += cellTexts.reduce((sum, text) => sum + text.length, 0);
      if (aggregateTableLength > SLACK_TABLE_CELL_TEXT_AGGREGATE_LIMIT) {
        throw new LoweringError(
          'SLACK_TABLE_CELL_TEXT_AGGREGATE_LIMIT_EXCEEDED',
          `Slack output rendered ${aggregateTableLength} aggregate table cell characters; the table and message limit is ${SLACK_TABLE_CELL_TEXT_AGGREGATE_LIMIT}.`,
        );
      }
      for (const cellText of cellTexts) {
        assertTextLimit(cellText, SLACK_LIMITS.cellText, 'SLACK_TABLE_CELL_TEXT_LIMIT_EXCEEDED');
      }
    }
  }
}

function validateActionElement(element: unknown): void {
  if (stringField(element, 'type') !== 'button') {
    return;
  }
  assertTextLimit(blockText(element), SLACK_LIMITS.buttonText, 'SLACK_BUTTON_TEXT_LIMIT_EXCEEDED');
}

function validateContextBlock(block: unknown): void {
  const elements = arrayField(block, 'elements');
  if (elements.length > SLACK_LIMITS.contextElements) {
    throw new LoweringError(
      'SLACK_CONTEXT_ELEMENTS_LIMIT_EXCEEDED',
      `Slack output rendered ${elements.length} context elements; the limit is ${SLACK_LIMITS.contextElements}.`,
    );
  }

  for (const element of elements) {
    const elementType = stringField(element, 'type');
    if (elementType === 'mrkdwn' || elementType === 'plain_text') {
      assertTextLimit(
        textObjectText(element),
        SLACK_TEXT_OBJECT_TEXT_LIMIT,
        'SLACK_CONTEXT_TEXT_LIMIT_EXCEEDED',
      );
    }
    if (elementType === 'image') {
      assertTextLimit(
        stringField(element, 'image_url'),
        SLACK_IMAGE_URL_LIMIT,
        'SLACK_CONTEXT_IMAGE_URL_LIMIT_EXCEEDED',
      );
    }
  }
}

function validateImageBlock(block: unknown): void {
  assertTextLimit(
    stringField(block, 'image_url'),
    SLACK_IMAGE_URL_LIMIT,
    'SLACK_IMAGE_URL_LIMIT_EXCEEDED',
  );
  assertTextLimit(
    stringField(block, 'alt_text'),
    SLACK_IMAGE_ALT_TEXT_LIMIT,
    'SLACK_IMAGE_ALT_TEXT_LIMIT_EXCEEDED',
  );
  assertTextLimit(
    textObjectText(recordField(block, 'title')),
    SLACK_IMAGE_TITLE_TEXT_LIMIT,
    'SLACK_IMAGE_TITLE_TEXT_LIMIT_EXCEEDED',
  );
}

function assertTextLimit(text: string | undefined, limit: number, code: string): void {
  if (text === undefined || text.length <= limit) {
    return;
  }
  throw new LoweringError(
    code,
    `Slack output rendered ${text.length} characters; the limit is ${limit}.`,
  );
}

function collectOutputLimitDiagnostics(
  registeredActionCount: number,
  survivingActionCount: number,
  evidence: OutputLimitEvidence,
  diagnostics: PreviewDiagnostic[],
): void {
  if (evidence.blocksTrimmed) {
    pushDiagnostic(diagnostics, {
      level: 'warning',
      code: 'SLACK_BLOCKS_TRIMMED',
      message: `Slack output was trimmed to the ${SLACK_LIMITS.blocksPerMessage} block message limit.`,
    });
  }

  if (registeredActionCount > survivingActionCount && evidence.actionsElementsTrimmed) {
    pushDiagnostic(diagnostics, {
      level: 'warning',
      code: 'SLACK_ACTIONS_ELEMENTS_TRIMMED',
      message: `Slack output was trimmed to the ${SLACK_LIMITS.actionsElements} element actions block limit.`,
    });
  }

  for (const code of evidence.truncatedCodes) {
    pushTruncationDiagnostic(diagnostics, code);
  }
}

function pushDiagnostic(diagnostics: PreviewDiagnostic[], diagnostic: PreviewDiagnostic): void {
  if (diagnostics.some(({code}) => code === diagnostic.code)) {
    return;
  }
  diagnostics.push(diagnostic);
}

function pushTruncationDiagnostic(diagnostics: PreviewDiagnostic[], code: string): void {
  const messages: Record<string, string> = {
    SLACK_HEADER_TEXT_TRUNCATED: `Slack header text was truncated to ${SLACK_LIMITS.headerText} characters.`,
    SLACK_SECTION_TEXT_TRUNCATED: `Slack section text was truncated to ${SLACK_LIMITS.sectionText} characters.`,
    SLACK_BUTTON_TEXT_TRUNCATED: `Slack button text was truncated to ${SLACK_LIMITS.buttonText} characters.`,
    SLACK_TABLE_CELL_TEXT_TRUNCATED: `Slack table cell text was truncated to ${SLACK_LIMITS.cellText} characters.`,
  };
  const message = messages[code];
  if (!message) {
    return;
  }
  pushDiagnostic(diagnostics, {
    level: 'warning',
    code,
    message,
  });
}

function blockText(value: unknown): string | undefined {
  return textObjectText(recordField(value, 'text'));
}

function tableCellTexts(block: unknown): string[] {
  return arrayField(block, 'rows').flatMap(row =>
    Array.isArray(row) ? row.flatMap(tableCellTextValues) : [],
  );
}

function tableCellTextValues(cell: unknown): string[] {
  const cellType = stringField(cell, 'type');
  if (cellType === 'raw_text' || cellType === 'raw_number') {
    const text = stringField(cell, 'text');
    return text === undefined ? [] : [text];
  }
  if (cellType !== 'rich_text') {
    return [];
  }
  return richTextValues(arrayField(cell, 'elements'));
}

function richTextValues(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(richTextValues);
  }
  if (!isRecord(value)) {
    return [];
  }

  const ownText = typeof value.text === 'string' ? [value.text] : [];
  return [...ownText, ...richTextValues(value.elements)];
}

function textObjectText(value: unknown): string | undefined {
  return isRecord(value) && typeof value.text === 'string' ? value.text : undefined;
}

function arrayField(value: unknown, field: string): unknown[] {
  const fieldValue = recordField(value, field);
  return Array.isArray(fieldValue) ? fieldValue : [];
}

function stringField(value: unknown, field: string): string | undefined {
  const fieldValue = recordField(value, field);
  return typeof fieldValue === 'string' ? fieldValue : undefined;
}

function recordField(value: unknown, field: string): unknown {
  return isRecord(value) ? value[field] : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function collectOutputLimitEvidence(nodes: readonly ChannelNode[]): OutputLimitEvidence {
  const truncatedCodes = new Set<string>();
  const visit = (node: ChannelNode): boolean => {
    let actionsElementsTrimmed = false;
    const nodeType = String(node.type);

    if (nodeType === 'header') {
      addTruncationEvidence(
        truncatedCodes,
        collectText([node]),
        SLACK_LIMITS.headerText,
        'SLACK_HEADER_TEXT_TRUNCATED',
      );
    }
    if (nodeType === 'section' || nodeType === 'markdown') {
      addTruncationEvidence(
        truncatedCodes,
        markdownToMrkdwn(collectText([node])),
        SLACK_LIMITS.sectionText,
        'SLACK_SECTION_TEXT_TRUNCATED',
      );
    }
    if (nodeType === 'actions') {
      const children = channelChildNodes(node);
      if (children.length > SLACK_LIMITS.actionsElements) {
        actionsElementsTrimmed = true;
      }
      for (const child of children) {
        actionsElementsTrimmed = visit(child) || actionsElementsTrimmed;
      }
    } else if (nodeType === 'button') {
      addTruncationEvidence(
        truncatedCodes,
        collectText([node]),
        SLACK_LIMITS.buttonText,
        'SLACK_BUTTON_TEXT_TRUNCATED',
      );
    } else if (nodeType === 'table') {
      for (const text of tableSourceCellTexts(node)) {
        addTruncationEvidence(
          truncatedCodes,
          text,
          SLACK_LIMITS.cellText,
          'SLACK_TABLE_CELL_TEXT_TRUNCATED',
        );
      }
    } else {
      for (const child of channelChildNodes(node)) {
        actionsElementsTrimmed = visit(child) || actionsElementsTrimmed;
      }
    }

    return actionsElementsTrimmed;
  };

  let actionsElementsTrimmed = false;
  for (const node of nodes) {
    actionsElementsTrimmed = visit(node) || actionsElementsTrimmed;
  }
  return {
    blocksTrimmed: renderedBlockCount(nodes) > SLACK_LIMITS.blocksPerMessage,
    actionsElementsTrimmed,
    truncatedCodes,
  };
}

function addTruncationEvidence(
  truncatedCodes: Set<string>,
  text: string,
  limit: number,
  code: string,
): void {
  if (text.length > limit) {
    truncatedCodes.add(code);
  }
}

function renderedBlockCount(nodes: readonly ChannelNode[]): number {
  return nodes.reduce((count, node) => count + renderedBlockCountForNode(node), 0);
}

function renderedBlockCountForNode(node: ChannelNode): number {
  switch (String(node.type)) {
    case 'message':
      return renderedBlockCount(channelChildNodes(node));
    case 'actions':
      return channelChildNodes(node).some(child => actionElementRenders(child)) ? 1 : 0;
    case 'raw': {
      const value = recordField(node.props, 'value');
      return Array.isArray(value)
        ? value.filter(item => item != null).length
        : value == null
          ? 0
          : 1;
    }
    case 'divider':
    case 'header':
    case 'section':
    case 'markdown':
    case 'fields':
    case 'field':
    case 'context':
    case 'image':
    case 'input':
    case 'table':
      return 1;
    default:
      return 0;
  }
}

function actionElementRenders(node: ChannelNode): boolean {
  return ['button', 'select'].includes(String(node.type));
}

function tableSourceCellTexts(node: ChannelNode): string[] {
  return [...tableSourceHeaderTexts(node), ...tableSourceBodyTexts(node)];
}

function tableSourceHeaderTexts(node: ChannelNode): string[] {
  return arrayField(node.props, 'columns').flatMap(column => {
    const header = stringField(column, 'header');
    return header === undefined ? [] : [header];
  });
}

function tableSourceBodyTexts(node: ChannelNode): string[] {
  return channelChildNodes(node)
    .filter(child => String(child.type) === 'row')
    .flatMap(row =>
      channelChildNodes(row)
        .filter(child => String(child.type) === 'cell')
        .map(cell => collectText([cell])),
    );
}

function channelChildNodes(node: ChannelNode): ChannelNode[] {
  const children = recordField(node.props, 'children');
  if (Array.isArray(children)) {
    return children.filter(isChannelNode);
  }
  return isChannelNode(children) ? [children] : [];
}

function isChannelNode(value: unknown): value is ChannelNode {
  return isRecord(value) && typeof value.type === 'string' && isRecord(value.props);
}

function lastSurface(processor: MessageProcessor<ComponentApi>): SurfaceModel | undefined {
  return [...processor.model.surfacesMap.values()].at(-1);
}

function lowerComponent(
  surface: SurfaceModel,
  componentId: string,
  basePath: string,
  ancestors: ReadonlySet<string>,
  state: LoweringState,
): ChannelNode[] {
  if (ancestors.has(componentId)) {
    throw new LoweringError(
      'A2UI_COMPONENT_CYCLE',
      `Cyclic A2UI component reference at "${componentId}"`,
      componentId,
    );
  }

  const model = surface.componentsModel.get(componentId);
  if (!model) {
    throw new WaitingForComponentError(componentId);
  }

  const api = surface.catalog.components.get(model.type);
  if (!api) {
    throw new LoweringError(
      'A2UI_UNSUPPORTED_COMPONENT',
      `Unsupported A2UI component "${model.type}"`,
      componentId,
    );
  }

  const validation = api.schema.safeParse(model.properties);
  if (!validation.success) {
    throw new LoweringError(
      'A2UI_INVALID_PROPS',
      `Invalid props for A2UI component "${componentId}": ${validation.error.message}`,
      componentId,
    );
  }

  const context = new ComponentContext(surface, componentId, basePath);
  const bindingErrors: SurfaceError[] = [];
  const errorSubscription = surface.onError.subscribe(error => {
    bindingErrors.push(error as SurfaceError);
  });
  let binder: GenericBinder<Record<string, unknown>> | undefined;
  const nextAncestors = new Set(ancestors);
  nextAncestors.add(componentId);
  const children = (id: string, specificPath?: string): Renderable =>
    lowerComponent(surface, id, specificPath ?? context.dataContext.path, nextAncestors, state);

  try {
    binder = new GenericBinder<Record<string, unknown>>(context, api.schema);
    throwBindingError(bindingErrors, componentId);
    return renderToIR(
      lowerSupportedComponent(model.type, binder.snapshot ?? {}, {
        componentId,
        surfaceId: surface.id,
        rawProps: model.properties,
        children,
        dispatch: action => registerAction(state, surface, componentId, basePath, action),
        input: type => {
          const actionId = `a2ui-input-${state.revision}-${state.nextActionOrdinal++}`;
          const entry = createInputDispatchEntry(
            actionId,
            state.revision,
            surface,
            componentId,
            basePath,
            type,
            model.properties,
          );
          state.inputs.set(actionId, entry);
          return entry;
        },
        diagnostics: state.diagnostics,
      }),
    );
  } finally {
    errorSubscription.unsubscribe();
    binder?.dispose();
  }
}

function throwBindingError(errors: readonly SurfaceError[], componentId: string): void {
  const error = errors.find(({code}) => code === 'EXPRESSION_ERROR') ?? errors[0];
  if (!error) {
    return;
  }

  const expression = error.expression ? ` (${error.expression})` : '';
  throw new LoweringError(
    error.code,
    `Failed to bind A2UI component "${componentId}"${expression}: ${error.message}`,
    componentId,
  );
}

interface LowerComponentContext {
  readonly componentId: string;
  readonly surfaceId: string;
  readonly rawProps: Readonly<Record<string, unknown>>;
  readonly children: (id: string, basePath?: string) => Renderable;
  readonly dispatch: (action: unknown) => string;
  readonly input: (type: 'TextField' | 'DateTimeInput') => InputDispatchEntry;
  readonly diagnostics: PreviewDiagnostic[];
}

function lowerSupportedComponent(
  type: string,
  props: Readonly<Record<string, unknown>>,
  context: LowerComponentContext,
): Renderable {
  switch (type) {
    case 'Text':
      return lowerText(props, context);
    case 'Image':
      return lowerImage(props, context);
    case 'Divider':
      return ChannelDivider({});
    case 'Row':
      return lowerLayout(props, context, 'Row');
    case 'Column':
      return lowerLayout(props, context, 'Column');
    case 'Card':
      context.diagnostics.push({
        level: 'warning',
        code: 'SLACK_LAYOUT_FLATTENED',
        message: 'Slack does not render Card containers; its child was flattened.',
        componentId: context.componentId,
      });
      return props.child ? context.children(String(props.child)) : [];
    case 'Button':
      return lowerButton(props, context);
    case 'TextField':
    case 'DateTimeInput':
      return lowerFormInput(context.input(type), props);
    case 'Table':
      return lowerTable(props, context);
    case 'MarketSnapshot':
      return lowerMarketSnapshot(props as unknown as MarketSnapshotProps, context);
    default:
      throw new LoweringError(
        'A2UI_UNSUPPORTED_COMPONENT',
        `Unsupported A2UI component "${type}"`,
        context.componentId,
      );
  }
}

function lowerText(
  props: Readonly<Record<string, unknown>>,
  context: LowerComponentContext,
): Renderable {
  const text = String(props.text ?? '');
  const variant = String(props.variant ?? 'body');
  if (['h1', 'h2', 'h3', 'h4', 'h5'].includes(variant)) {
    if (variant !== 'h1') {
      context.diagnostics.push({
        level: 'warning',
        code: 'SLACK_TEXT_VARIANT_APPROXIMATED',
        message: `Slack renders ${variant} text as a header block.`,
        componentId: context.componentId,
      });
    }
    return Header({children: text});
  }
  if (variant === 'caption') {
    return Context({children: text});
  }
  return Section({children: text});
}

function lowerImage(
  props: Readonly<Record<string, unknown>>,
  context: LowerComponentContext,
): Renderable {
  const url = slackImageUrl(props.url, context.componentId);
  const alt = slackImageAltText(props.description, context.componentId);

  if (props.fit !== undefined || props.variant !== undefined) {
    context.diagnostics.push({
      level: 'warning',
      code: 'SLACK_IMAGE_STYLE_APPROXIMATED',
      message: 'Slack image blocks do not preserve fit or variant style hints.',
      componentId: context.componentId,
    });
  }
  return ChannelImage({
    url,
    alt,
  });
}

function slackImageUrl(value: unknown, componentId: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new LoweringError(
      'A2UI_INVALID_IMAGE_URL',
      'Image requires a non-empty URL string for Slack image_url.',
      componentId,
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(value);
  } catch {
    throw new LoweringError(
      'A2UI_INVALID_IMAGE_URL',
      'Image requires an absolute URL string for Slack image_url.',
      componentId,
    );
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol) || parsedUrl.hostname.length === 0) {
    throw new LoweringError(
      'A2UI_INVALID_IMAGE_URL',
      'Image requires an HTTP(S) URL with a host for Slack image_url.',
      componentId,
    );
  }

  const imageUrl = parsedUrl.href;
  if (
    !RFC3986_QUERY_OR_FRAGMENT.test(parsedUrl.username) ||
    !RFC3986_QUERY_OR_FRAGMENT.test(parsedUrl.password) ||
    !RFC3986_PATH.test(parsedUrl.pathname) ||
    !RFC3986_QUERY_OR_FRAGMENT.test(parsedUrl.search.slice(1)) ||
    !RFC3986_QUERY_OR_FRAGMENT.test(parsedUrl.hash.slice(1))
  ) {
    throw new LoweringError(
      'A2UI_INVALID_IMAGE_URL',
      'Image requires a valid URI string for Slack image_url.',
      componentId,
    );
  }

  return imageUrl;
}

function slackImageAltText(value: unknown, componentId: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new LoweringError(
      'A2UI_INVALID_IMAGE_ALT_TEXT',
      'Image requires non-empty description text for Slack alt_text.',
      componentId,
    );
  }

  return value;
}

function lowerLayout(
  props: Readonly<Record<string, unknown>>,
  context: LowerComponentContext,
  type: 'Row' | 'Column',
): Renderable {
  if (type === 'Row' || 'align' in context.rawProps || 'justify' in context.rawProps) {
    context.diagnostics.push({
      level: 'warning',
      code: 'SLACK_LAYOUT_FLATTENED',
      message: `Slack does not preserve ${type} layout hints; children were flattened.`,
      componentId: context.componentId,
    });
  }
  const nodes = renderChildren(props.children, context.children);
  return nodes.length > 0 && nodes.every(node => node.type === 'button')
    ? Actions({children: nodes})
    : nodes;
}

function lowerButton(
  props: Readonly<Record<string, unknown>>,
  context: LowerComponentContext,
): Renderable {
  const label = collectText(renderToIR(context.children(String(props.child))));
  const actionId = context.dispatch(context.rawProps.action);
  const onClick = {id: actionId} as unknown as ClickHandler;
  return ChannelButton({
    children: label || 'Action',
    style: props.variant === 'primary' ? 'primary' : undefined,
    onClick,
  });
}

function lowerTable(
  props: Readonly<Record<string, unknown>>,
  context: LowerComponentContext,
): Renderable {
  const columns = arrayField(props, 'columns').map((column): TableColumn => {
    const header = recordField(column, 'header');
    const align = recordField(column, 'align');
    if (
      typeof header !== 'string' ||
      (align !== undefined && align !== 'left' && align !== 'center' && align !== 'right')
    ) {
      throw new LoweringError(
        'A2UI_INVALID_TABLE_HEADER',
        'Table headers must resolve to text with a supported alignment.',
        context.componentId,
      );
    }
    return {header, align};
  });
  const rows = arrayField(props, 'rows').map((row, index) => {
    if (!Array.isArray(row) || row.length !== columns.length) {
      throw new LoweringError(
        'A2UI_INVALID_TABLE_ROW',
        `Table row ${index + 1} must have exactly ${columns.length} cells, one per column.`,
        context.componentId,
      );
    }
    return ChannelRow({
      children: row.map(value => {
        if (typeof value !== 'string') {
          throw new LoweringError(
            'A2UI_INVALID_TABLE_CELL',
            `Table row ${index + 1} contains a cell that did not resolve to text.`,
            context.componentId,
          );
        }
        return Cell({children: value});
      }),
    });
  });
  return Table({columns, children: rows});
}

function lowerMarketSnapshot(
  props: MarketSnapshotProps,
  context: LowerComponentContext,
): Renderable {
  const actionId = context.dispatch({
    event: {
      name: 'acknowledge_search_result',
    },
  });
  const onAcknowledge = {id: actionId} as unknown as ClickHandler;

  return [
    Header({children: props.headline}),
    Section({children: props.summary}),
    Table({
      columns: [
        {header: 'Market'},
        {header: 'Price', align: 'right'},
        {header: 'Move', align: 'right'},
        {header: 'Source'},
      ],
      children: props.markets.map(market =>
        ChannelRow({
          children: [
            Cell({children: market.name}),
            Cell({children: market.price}),
            Cell({children: market.change}),
            Cell({children: `[${market.sourceName}](${market.sourceUrl})`}),
          ],
        }),
      ),
    }),
    ChannelDivider({}),
    Section({children: `**Why it matters**\n${props.whyItMatters}`}),
    createNativeNode('slack', 'raw', 'raw', {
      value: {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Searched ${props.searchedAt}`,
            verbatim: true,
          },
        ],
      },
    }),
    Actions({
      children: [
        ChannelButton({
          children: 'Acknowledge',
          style: 'primary',
          onClick: onAcknowledge,
        }),
      ],
    }),
  ];
}

function renderChildren(
  value: unknown,
  render: (id: string, basePath?: string) => Renderable,
): ChannelNode[] {
  return childRefs(value).flatMap(child => renderToIR(render(child.id, child.basePath)));
}

function childRefs(value: unknown): ChildRef[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap(child => {
    if (typeof child === 'string') {
      return [{id: child}];
    }
    if (
      typeof child === 'object' &&
      child !== null &&
      'id' in child &&
      typeof child.id === 'string'
    ) {
      return [
        {
          id: child.id,
          basePath:
            'basePath' in child && typeof child.basePath === 'string' ? child.basePath : undefined,
        },
      ];
    }
    return [];
  });
}

function collectText(nodes: ChannelNode[]): string {
  return nodes
    .flatMap(node => {
      if (!isChannelNode(node)) {
        return [];
      }
      if (node.type === 'text' && typeof node.props.value === 'string') {
        return [node.props.value];
      }
      if (typeof node.props.children === 'string' || typeof node.props.children === 'number') {
        return [String(node.props.children)];
      }
      return Array.isArray(node.props.children)
        ? [collectText(node.props.children as ChannelNode[])]
        : [];
    })
    .filter(Boolean)
    .join(' ');
}

function registerAction(
  state: LoweringState,
  surface: SurfaceModel,
  componentId: string,
  basePath: string,
  rawAction: unknown,
): string {
  const parsed = ActionSchema.safeParse(rawAction);
  if (!parsed.success) {
    throw new LoweringError(
      'A2UI_INVALID_ACTION',
      `Component requires a valid A2UI action definition: ${parsed.error.issues
        .map(issue => `${issue.path.join('.') || 'action'} ${issue.message}`)
        .join('; ')}`,
      componentId,
    );
  }
  const parsedAction = parsed.data as Action;
  const actionId = `a2ui-${state.revision}-${state.nextActionOrdinal}`;
  state.nextActionOrdinal += 1;

  const eventEntry = createEventActionDispatchEntry({
    actionId,
    revision: state.revision,
    surface,
    sourceComponentId: componentId,
    basePath,
    action: parsedAction,
  });

  state.actions.set(
    actionId,
    eventEntry ?? {
      actionId,
      revision: state.revision,
      surface,
      surfaceId: surface.id,
      sourceComponentId: componentId,
      basePath,
      action: parsedAction,
    },
  );
  return actionId;
}

function isCurrentActionEntry(
  entry: ActionDispatchEntry,
  surface: SurfaceModel | undefined,
): surface is SurfaceModel {
  return Boolean(surface && entry.surface === surface && entry.surfaceId === surface.id);
}
