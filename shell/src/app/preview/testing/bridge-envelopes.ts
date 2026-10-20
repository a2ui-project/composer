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

import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {MessageEnvelope} from '../../shell/host-communication/host-communication';

/** Optional envelope fields that a spec may need to control. */
export interface EnvelopeOptions {
  /** Host receipt time; defaults to `Date.now()`. */
  timestamp?: number;
  /** Window the message came from; omitted by default, like a single-frame host. */
  sourceWindow?: Window;
}

/** Builds a bridge envelope in the shape HostCommunication delivers. */
export function bridgeEnvelope(
  type: PreviewBridgeMessageType,
  payload: unknown = {},
  {timestamp = Date.now(), sourceWindow}: EnvelopeOptions = {},
): MessageEnvelope {
  return {
    type,
    payload,
    origin: 'http://localhost:3000',
    timestamp,
    ...(sourceWindow ? {sourceWindow} : {}),
  };
}

/** Builds a SURFACE_RESIZE envelope reporting `height` pixels. */
export function surfaceResizeEnvelope(
  height: number,
  options: EnvelopeOptions = {},
): MessageEnvelope {
  return bridgeEnvelope(PreviewBridgeMessageType.SURFACE_RESIZE, {height, width: 800}, options);
}
