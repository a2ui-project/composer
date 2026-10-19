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

import {type ChannelNode} from '@copilotkit/channels-ui';
import {SLACK_LIMITS, markdownToMrkdwn} from '@copilotkit/channels-slack/render';
import {channelChildNodes, collectText} from './channel-nodes';
import {DiagnosticCode, DiagnosticLevel, type PreviewDiagnostic} from './preview-snapshot';
import {arrayField, recordField, stringField} from './record-fields';

/**
 * What `@copilotkit/channels-ui` nodes show, before `renderBlockKit` renders
 * them, about the Slack limits it meets by trimming or truncating instead of
 * failing: whether it will drop blocks or actions elements, and which kinds of
 * text it will truncate, by their `*_TRUNCATED` diagnostic code.
 */
export interface OutputLimitEvidence {
  readonly blocksTrimmed: boolean;
  readonly actionsElementsTrimmed: boolean;
  readonly truncatedCodes: ReadonlySet<DiagnosticCode>;
}

/** Adds a warning to `diagnostics` for each limit `evidence` shows was met by trimming. */
export function collectOutputLimitDiagnostics(
  registeredActionCount: number,
  survivingActionCount: number,
  evidence: OutputLimitEvidence,
  diagnostics: PreviewDiagnostic[],
): void {
  if (evidence.blocksTrimmed) {
    pushDiagnostic(diagnostics, {
      level: DiagnosticLevel.WARNING,
      code: DiagnosticCode.SLACK_BLOCKS_TRIMMED,
      message: `Slack output was trimmed to the ${SLACK_LIMITS.blocksPerMessage} block message limit.`,
    });
  }

  if (registeredActionCount > survivingActionCount && evidence.actionsElementsTrimmed) {
    pushDiagnostic(diagnostics, {
      level: DiagnosticLevel.WARNING,
      code: DiagnosticCode.SLACK_ACTIONS_ELEMENTS_TRIMMED,
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

function pushTruncationDiagnostic(diagnostics: PreviewDiagnostic[], code: DiagnosticCode): void {
  const messages: Partial<Record<DiagnosticCode, string>> = {
    [DiagnosticCode.SLACK_HEADER_TEXT_TRUNCATED]: `Slack header text was truncated to ${SLACK_LIMITS.headerText} characters.`,
    [DiagnosticCode.SLACK_SECTION_TEXT_TRUNCATED]: `Slack section text was truncated to ${SLACK_LIMITS.sectionText} characters.`,
    [DiagnosticCode.SLACK_BUTTON_TEXT_TRUNCATED]: `Slack button text was truncated to ${SLACK_LIMITS.buttonText} characters.`,
    [DiagnosticCode.SLACK_TABLE_CELL_TEXT_TRUNCATED]: `Slack table cell text was truncated to ${SLACK_LIMITS.cellText} characters.`,
  };
  const message = messages[code];
  if (!message) {
    return;
  }
  pushDiagnostic(diagnostics, {
    level: DiagnosticLevel.WARNING,
    code,
    message,
  });
}

/** Reads the `OutputLimitEvidence` in the nodes `renderBlockKit` is about to render. */
export function collectOutputLimitEvidence(nodes: readonly ChannelNode[]): OutputLimitEvidence {
  const truncatedCodes = new Set<DiagnosticCode>();
  const visit = (node: ChannelNode): boolean => {
    let actionsElementsTrimmed = false;
    const nodeType = String(node.type);

    if (nodeType === 'header') {
      addTruncationEvidence(
        truncatedCodes,
        collectText([node]),
        SLACK_LIMITS.headerText,
        DiagnosticCode.SLACK_HEADER_TEXT_TRUNCATED,
      );
    }
    if (nodeType === 'section' || nodeType === 'markdown') {
      addTruncationEvidence(
        truncatedCodes,
        markdownToMrkdwn(collectText([node])),
        SLACK_LIMITS.sectionText,
        DiagnosticCode.SLACK_SECTION_TEXT_TRUNCATED,
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
        DiagnosticCode.SLACK_BUTTON_TEXT_TRUNCATED,
      );
    } else if (nodeType === 'table') {
      for (const text of tableSourceCellTexts(node)) {
        addTruncationEvidence(
          truncatedCodes,
          text,
          SLACK_LIMITS.cellText,
          DiagnosticCode.SLACK_TABLE_CELL_TEXT_TRUNCATED,
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
  truncatedCodes: Set<DiagnosticCode>,
  text: string,
  limit: number,
  code: DiagnosticCode,
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
