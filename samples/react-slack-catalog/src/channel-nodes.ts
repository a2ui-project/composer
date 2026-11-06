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
import {isRecord, recordField} from './record-fields';

/** The child nodes of a `@copilotkit/channels-ui` node, from its `children` prop. */
export function channelChildNodes(node: ChannelNode): ChannelNode[] {
  const children = recordField(node.props, 'children');
  if (Array.isArray(children)) {
    return children.filter(isChannelNode);
  }
  return isChannelNode(children) ? [children] : [];
}

/** Whether `value` is a `@copilotkit/channels-ui` node: a `type` and `props`. */
export function isChannelNode(value: unknown): value is ChannelNode {
  return isRecord(value) && typeof value.type === 'string' && isRecord(value.props);
}

/** The text in some `@copilotkit/channels-ui` nodes and their children, joined by spaces. */
export function collectText(nodes: ChannelNode[]): string {
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
