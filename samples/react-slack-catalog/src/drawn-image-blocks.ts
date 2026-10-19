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

/**
 * @fileoverview The Slack image blocks of the images the preview draws for components it
 * sends as images rather than as native Slack blocks: in the preview, an image block with
 * a local URL; in the export, the uploaded-file form your Channels app sends.
 */

import {Image as ChannelImage, type ChannelNode} from '@copilotkit/channels-ui';
import {type KnownBlock} from '@slack/types';
import {type LoweringState} from './lowering-context';
import {DiagnosticCode, DiagnosticLevel} from './preview-snapshot';

/** Stands in for the Slack file id that your Channels app gets back when it uploads a drawn image. */
const RENDERED_AT_SEND_FILE_ID = 'RENDERED_AT_SEND';

/**
 * An image the preview drew for a component it sends as an image rather than as native
 * Slack blocks. Your Channels app renders the same component to a PNG and uploads it
 * when it sends the message.
 */
export interface DrawnImage {
  /** The A2UI component type, such as `Chart`, which the diagnostic names. */
  readonly componentType: string;
  readonly componentId: string;
  /** The drawing, as standalone SVG markup. */
  readonly svg: string;
  /** The image block's alt text. */
  readonly alt: string;
}

/**
 * Serves a drawn image and returns the Channels UI `Image` that shows it. Records its URL,
 * so the export marks it as an uploaded file, and says so in an info diagnostic.
 */
export function placeDrawnImage(state: LoweringState, image: DrawnImage): ChannelNode {
  const url = state.drawnImages.urlFor(image.svg);
  state.drawnImageUrls.add(url);
  state.diagnostics.push({
    level: DiagnosticLevel.INFO,
    code: DiagnosticCode.SLACK_IMAGE_RENDERED_AT_SEND,
    message: `${image.componentType} "${image.componentId}" is drawn in this preview. In Slack, your Channels app renders it to a PNG and uploads it when sending. The export marks it with a placeholder file.`,
    componentId: image.componentId,
  });
  return ChannelImage({url, alt: image.alt});
}

/** Swaps the preview's drawn images for Slack's uploaded-file form. */
export function exportDrawnImages(
  blocks: readonly KnownBlock[],
  drawnImageUrls: ReadonlySet<string>,
): KnownBlock[] {
  return blocks.map(block => {
    if (block.type !== 'image' || !('image_url' in block) || !drawnImageUrls.has(block.image_url)) {
      return block;
    }
    return {
      type: 'image',
      slack_file: {id: RENDERED_AT_SEND_FILE_ID},
      alt_text: block.alt_text,
    };
  });
}
