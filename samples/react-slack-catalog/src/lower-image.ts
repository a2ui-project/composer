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

import {Image as ChannelImage, type Renderable} from '@copilotkit/channels-ui';
import {type LowerComponentContext} from './lowering-context';
import {LoweringError} from './lowering-error';
import {DiagnosticCode, DiagnosticLevel} from './preview-snapshot';

const RFC3986_PATH = /^(?:[A-Za-z0-9\-._~!$&'()*+,;=:@/]|%[0-9A-Fa-f]{2})*$/;
const RFC3986_QUERY_OR_FRAGMENT = /^(?:[A-Za-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*$/;

/** Lowers an A2UI `Image` to a Slack image block. */
export function lowerImage(
  props: Readonly<Record<string, unknown>>,
  context: LowerComponentContext,
): Renderable {
  const url = slackImageUrl(props.url, context.componentId);
  const alt = slackImageAltText(props.description, context.componentId);

  if (props.fit !== undefined || props.variant !== undefined) {
    context.diagnostics.push({
      level: DiagnosticLevel.WARNING,
      code: DiagnosticCode.SLACK_IMAGE_STYLE_APPROXIMATED,
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
      DiagnosticCode.A2UI_INVALID_IMAGE_URL,
      'Image requires a non-empty URL string for Slack image_url.',
      componentId,
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(value);
  } catch {
    throw new LoweringError(
      DiagnosticCode.A2UI_INVALID_IMAGE_URL,
      'Image requires an absolute URL string for Slack image_url.',
      componentId,
    );
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol) || parsedUrl.hostname.length === 0) {
    throw new LoweringError(
      DiagnosticCode.A2UI_INVALID_IMAGE_URL,
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
      DiagnosticCode.A2UI_INVALID_IMAGE_URL,
      'Image requires a valid URI string for Slack image_url.',
      componentId,
    );
  }

  return imageUrl;
}

function slackImageAltText(value: unknown, componentId: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new LoweringError(
      DiagnosticCode.A2UI_INVALID_IMAGE_ALT_TEXT,
      'Image requires non-empty description text for Slack alt_text.',
      componentId,
    );
  }

  return value;
}
