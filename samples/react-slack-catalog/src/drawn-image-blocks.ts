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
 * sends as images rather than as native Slack blocks, and the note that names those
 * components. In the preview, the block shows the drawing from a local URL. In the
 * Generated Block Kit export, it takes Slack's uploaded-file form, `slack_file: {id}`,
 * which the app that sends the message to Slack sends after it uploads the image.
 */

import {Image as ChannelImage, type ChannelNode} from '@copilotkit/channels-ui';
import {type ImageBlock, type KnownBlock} from '@slack/types';
import {type DrawnImageStore} from './drawn-image-store';
import {type LoweringState} from './lowering-context';
import {DiagnosticCode, DiagnosticLevel, type PreviewDiagnostic} from './preview-snapshot';

/**
 * Stands in for the Slack file ID that the app that sends the message gets back when it
 * uploads a drawn image.
 */
const RENDERED_AT_SEND_FILE_ID = 'RENDERED_AT_SEND';

/** Joins the names of drawn components into one English list, such as "A, B, and C". */
const COMPONENT_LIST_FORMAT = new Intl.ListFormat('en', {type: 'conjunction'});

/**
 * An image the preview drew for a component it sends as an image rather than as native
 * Slack blocks. The app that sends the message to Slack renders the same component to a
 * PNG and uploads it.
 */
export interface DrawnImage {
  /** The drawing, as standalone SVG markup. */
  readonly svg: string;
  /** The image block's alt text. */
  readonly alt: string;
}

/** A component drawn as an image, which the note about uploading drawn images names. */
export interface DrawnComponent {
  /** The A2UI component type, such as `Chart`. */
  readonly componentType: string;
  /** The ID of the A2UI component. */
  readonly componentId: string;
}

/** An image block that shows its picture from a URL rather than from an uploaded file. */
type UrlImageBlock = ImageBlock & {image_url: string};

/**
 * Serves the image drawn for `component` and returns the Channels UI `Image` that shows
 * it. Records the component, so that `noteDrawnImages` names it.
 */
export function placeDrawnImage(
  state: LoweringState,
  component: DrawnComponent,
  image: DrawnImage,
): ChannelNode {
  state.drawnComponents.push(component);
  return ChannelImage({url: state.drawnImages.urlFor(image.svg), alt: image.alt});
}

/**
 * Adds one info diagnostic that names every component drawn as an image in this render,
 * and says that the app that sends the message must upload their images. Adds nothing
 * when nothing was drawn.
 */
export function noteDrawnImages(state: LoweringState): void {
  if (state.drawnComponents.length === 0) {
    return;
  }
  state.diagnostics.push(renderedAtSendNote(state.drawnComponents));
}

/** The note that names `components` and says their images must be uploaded. */
function renderedAtSendNote(components: readonly DrawnComponent[]): PreviewDiagnostic {
  const names = COMPONENT_LIST_FORMAT.format(
    components.map(({componentType, componentId}) => `${componentType} "${componentId}"`),
  );
  const one = components.length === 1;
  return {
    level: DiagnosticLevel.INFO,
    code: DiagnosticCode.SLACK_IMAGE_RENDERED_AT_SEND,
    message: `${names} ${one ? 'is drawn as an image' : 'are drawn as images'} in this preview. The app that sends the message to Slack must render ${one ? 'it' : 'each'} to a PNG and upload it. The Generated Block Kit export marks ${one ? 'it' : 'each'} with the placeholder file ID ${RENDERED_AT_SEND_FILE_ID}, which that app replaces with the ID of the uploaded file.`,
  };
}

/** The `image_url` of every image block in `blocks` that shows its picture from a URL. */
export function imageUrls(blocks: readonly KnownBlock[]): Set<string> {
  return new Set(blocks.filter(isUrlImageBlock).map(block => block.image_url));
}

/**
 * The blocks the Generated Block Kit export shows: `blocks`, with each image that
 * `drawnImages` serves in Slack's uploaded-file form instead of at its local URL.
 */
export function exportDrawnImages(
  blocks: readonly KnownBlock[],
  drawnImages: DrawnImageStore,
): KnownBlock[] {
  return blocks.map(block =>
    isUrlImageBlock(block) && drawnImages.has(block.image_url)
      ? {type: 'image', slack_file: {id: RENDERED_AT_SEND_FILE_ID}, alt_text: block.alt_text}
      : block,
  );
}

function isUrlImageBlock(block: KnownBlock): block is UrlImageBlock {
  return block.type === 'image' && 'image_url' in block;
}
