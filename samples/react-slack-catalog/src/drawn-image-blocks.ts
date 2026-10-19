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
 * sends as images rather than as native Slack blocks. In the preview, the block shows the
 * drawing from a local URL. In the Generated Block Kit export, it takes Slack's
 * uploaded-file form, `slack_file: {id}`, which the app that sends the message to Slack
 * sends after it uploads the image.
 */

import {Image as ChannelImage, type ChannelNode} from '@copilotkit/channels-ui';
import {type KnownBlock} from '@slack/types';
import {type LoweringState} from './lowering-context';
import {DiagnosticCode, DiagnosticLevel} from './preview-snapshot';

/**
 * Stands in for the Slack file ID that the app that sends the message gets back when it
 * uploads a drawn image.
 */
const RENDERED_AT_SEND_FILE_ID = 'RENDERED_AT_SEND';

/**
 * An image the preview drew for a component it sends as an image rather than as native
 * Slack blocks. The app that sends the message to Slack renders the same component to a
 * PNG and uploads it.
 */
export interface DrawnImage {
  /** The A2UI component type, such as `Chart`, which the diagnostic names. */
  readonly componentType: string;
  /** The ID of the A2UI component drawn, which the diagnostic names. */
  readonly componentId: string;
  /** The drawing, as standalone SVG markup. */
  readonly svg: string;
  /** The image block's alt text. */
  readonly alt: string;
}

/**
 * Serves a drawn image and returns the Channels UI `Image` that shows it. Records its URL,
 * so the Generated Block Kit export marks it as an uploaded file, and says so in an info
 * diagnostic.
 */
export function placeDrawnImage(state: LoweringState, image: DrawnImage): ChannelNode {
  const url = state.drawnImages.urlFor(image.svg);
  state.drawnImageUrls.add(url);
  state.diagnostics.push({
    level: DiagnosticLevel.INFO,
    code: DiagnosticCode.SLACK_IMAGE_RENDERED_AT_SEND,
    message: `${image.componentType} "${image.componentId}" is drawn as an image in this preview. The app that sends the message to Slack must render it to a PNG and upload it. The Generated Block Kit export marks it with the placeholder file ID ${RENDERED_AT_SEND_FILE_ID}, which that app replaces with the ID of the uploaded file.`,
    componentId: image.componentId,
  });
  return ChannelImage({url, alt: image.alt});
}

/**
 * The blocks the Generated Block Kit export shows: `blocks`, with each drawn image in
 * Slack's uploaded-file form instead of at its local URL.
 */
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
