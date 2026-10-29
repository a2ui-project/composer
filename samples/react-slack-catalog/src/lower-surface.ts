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

import {ComponentContext, GenericBinder, type SurfaceModel} from '@a2ui/web_core/v0_9';
import {
  Actions,
  Button as ChannelButton,
  Cell,
  Context,
  Divider as ChannelDivider,
  Header,
  Row as ChannelRow,
  Section,
  Table,
  createNativeNode,
  renderToIR,
  type ChannelNode,
  type ClickHandler,
  type Renderable,
} from '@copilotkit/channels-ui';
import {renderBlockKit} from '@copilotkit/channels-slack/render';
import {type ActionDispatchEntry} from './action-dispatch';
import {collectActionIds, filterActionsForBlocks, registerAction} from './action-registry';
import {collectText} from './channel-nodes';
import {type MarketSnapshotProps} from './market-snapshot';
import {
  InputComponentType,
  createInputDispatchEntry,
  lowerFormInput,
  type InputDispatchEntry,
} from './form-input';
import {lowerImage} from './lower-image';
import {lowerTable} from './lower-table';
import {type LowerComponentContext, type LoweringState} from './lowering-context';
import {LoweringError} from './lowering-error';
import {collectOutputLimitDiagnostics, collectOutputLimitEvidence} from './output-limit-evidence';
import {
  DiagnosticCode,
  DiagnosticLevel,
  PreviewStatus,
  createEmptySnapshot,
  type PreviewDiagnostic,
  type PreviewSnapshot,
} from './preview-snapshot';
import {validateSlackOutput} from './slack-output-validation';

/**
 * The result of lowering one A2UI surface to Slack: the snapshot to show and,
 * when it rendered, the Slack actions and inputs it drew, by `action_id`.
 */
interface LoweredSurface {
  /** The render, without the session's `inputResetKey`. */
  readonly snapshot: PreviewSnapshot;
  /** The buttons in `snapshot.blocks` and the A2UI actions they run. */
  readonly actions: Map<string, ActionDispatchEntry>;
  /** The inputs in `snapshot.blocks` and the data they write. */
  readonly inputs: Map<string, InputDispatchEntry>;
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

/**
 * Lowers an A2UI surface, starting at its `root` component, to Slack Block Kit.
 * Problems don't throw: they come back as an `ERROR` or `WAITING` snapshot with
 * diagnostics, and no actions or inputs.
 *
 * @param revision The render number, used in the generated `action_id`s.
 */
export function lowerSurface(surface: SurfaceModel, revision: number): LoweredSurface {
  const noControls = {actions: new Map(), inputs: new Map()};
  if (surface.componentsModel.entries.next().done) {
    return {snapshot: {...createEmptySnapshot(revision), surfaceId: surface.id}, ...noControls};
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
    const actions = filterActionsForBlocks(state.actions, blocks, state.diagnostics);
    validateSlackOutput(blocks);
    collectOutputLimitDiagnostics(
      state.actions.size,
      actions.size,
      limitEvidence,
      state.diagnostics,
    );
    const renderedActionIds = collectActionIds(blocks);
    return {
      snapshot: {
        revision,
        surfaceId: surface.id,
        status: PreviewStatus.READY,
        blocks,
        diagnostics: state.diagnostics,
      },
      actions,
      inputs: new Map([...state.inputs].filter(([id]) => renderedActionIds.has(id))),
    };
  } catch (error) {
    if (error instanceof WaitingForComponentError) {
      return {
        snapshot: {
          revision,
          surfaceId: surface.id,
          status: PreviewStatus.WAITING,
          blocks: [],
          diagnostics: [
            {
              level: DiagnosticLevel.INFO,
              code: DiagnosticCode.A2UI_WAITING_FOR_COMPONENT,
              message: error.message,
              componentId: error.componentId,
            },
          ],
        },
        ...noControls,
      };
    }

    const diagnostic: PreviewDiagnostic =
      error instanceof LoweringError
        ? {
            level: DiagnosticLevel.ERROR,
            code: error.code,
            message: error.message,
            componentId: error.componentId,
          }
        : {
            level: DiagnosticLevel.ERROR,
            code: DiagnosticCode.A2UI_LOWERING_ERROR,
            message: error instanceof Error ? error.message : String(error),
          };
    return {
      snapshot: {
        revision,
        surfaceId: surface.id,
        status: PreviewStatus.ERROR,
        blocks: [],
        diagnostics: [diagnostic],
      },
      ...noControls,
    };
  }
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

function lowerComponent(
  surface: SurfaceModel,
  componentId: string,
  basePath: string,
  ancestors: ReadonlySet<string>,
  state: LoweringState,
): ChannelNode[] {
  if (ancestors.has(componentId)) {
    throw new LoweringError(
      DiagnosticCode.A2UI_COMPONENT_CYCLE,
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
      DiagnosticCode.A2UI_UNSUPPORTED_COMPONENT,
      `Unsupported A2UI component "${model.type}"`,
      componentId,
    );
  }

  // The message processor checked the props against this schema when the component
  // arrived, so they're valid here.
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
        level: DiagnosticLevel.WARNING,
        code: DiagnosticCode.SLACK_LAYOUT_FLATTENED,
        message: 'Slack does not render Card containers; its child was flattened.',
        componentId: context.componentId,
      });
      return props.child ? context.children(String(props.child)) : [];
    case 'Button':
      return lowerButton(props, context);
    case InputComponentType.TEXT_FIELD:
    case InputComponentType.DATE_TIME_INPUT:
      return lowerFormInput(context.input(type), props);
    case 'Table':
      return lowerTable(props, context);
    case 'MarketSnapshot':
      // `lowerComponent` validated these props against MarketSnapshotSchema.
      return lowerMarketSnapshot(props as MarketSnapshotProps, context);
    default:
      throw new LoweringError(
        DiagnosticCode.A2UI_UNSUPPORTED_COMPONENT,
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
        level: DiagnosticLevel.WARNING,
        code: DiagnosticCode.SLACK_TEXT_VARIANT_APPROXIMATED,
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

function lowerLayout(
  props: Readonly<Record<string, unknown>>,
  context: LowerComponentContext,
  type: 'Row' | 'Column',
): Renderable {
  // The children are lowered first to see whether they're all buttons, but this
  // component's warning goes before theirs, so diagnostics stay in document order.
  const diagnosticIndex = context.diagnostics.length;
  const nodes = renderChildren(props.children, context.children);
  const isButtonGroup = nodes.length > 0 && nodes.every(node => node.type === 'button');
  const hasAlignment = 'align' in context.rawProps || 'justify' in context.rawProps;
  // Buttons become one actions block, which Slack lays out in a row, so a Row of buttons
  // keeps its layout and only alignment is lost. Any other Row is stacked vertically.
  if ((type === 'Row' && !isButtonGroup) || hasAlignment) {
    context.diagnostics.splice(diagnosticIndex, 0, {
      level: DiagnosticLevel.WARNING,
      code: DiagnosticCode.SLACK_LAYOUT_FLATTENED,
      message: isButtonGroup
        ? `Slack shows these buttons in one row and ignores ${type} alignment.`
        : `Slack does not preserve ${type} layout hints; children were flattened.`,
      componentId: context.componentId,
    });
  }
  return isButtonGroup ? Actions({children: nodes}) : nodes;
}

function lowerButton(
  props: Readonly<Record<string, unknown>>,
  context: LowerComponentContext,
): Renderable {
  const label = collectText(renderToIR(context.children(String(props.child))));
  return ChannelButton({
    children: label || 'Action',
    style: props.variant === 'primary' ? 'primary' : undefined,
    onClick: slackActionHandler(context.dispatch(context.rawProps.action)),
  });
}

/**
 * Gives a Slack button the `action_id` of a registered A2UI action. In
 * `@copilotkit/channels-ui`, a handler is a function that `renderToIR` swaps
 * for an `{id}` object, and `renderBlockKit` reads only that `id`. This IR goes
 * straight to `renderBlockKit` and the handler is never called, so passing the
 * `{id}` object in the function's place is safe.
 */
function slackActionHandler(actionId: string): ClickHandler {
  return {id: actionId} as unknown as ClickHandler;
}

function lowerMarketSnapshot(
  props: MarketSnapshotProps,
  context: LowerComponentContext,
): Renderable {
  const onAcknowledge = slackActionHandler(
    context.dispatch({
      event: {
        name: 'acknowledge_search_result',
      },
    }),
  );

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
