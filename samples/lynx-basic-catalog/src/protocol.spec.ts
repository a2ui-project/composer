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

import {beforeEach, describe, expect, it, vi} from 'vitest';
import {BRIDGE_MESSAGE_TYPE, LynxComposerBridge} from './protocol.js';
import type {LynxViewElement} from './types.js';

describe('LynxComposerBridge', () => {
  let lynxView: LynxViewElement;
  let parentWindow: Window;
  let postMessage: ReturnType<typeof vi.fn>;
  let bridge: LynxComposerBridge;

  beforeEach(() => {
    lynxView = document.createElement('div') as LynxViewElement;
    lynxView.sendGlobalEvent = vi.fn();
    postMessage = vi.fn();
    parentWindow = {postMessage} as unknown as Window;
    bridge = new LynxComposerBridge(
      lynxView,
      parentWindow,
      new Set(['https://composer.example']),
      document,
    );
  });

  function messageEvent(data: unknown, origin = 'https://composer.example'): MessageEvent<unknown> {
    return new MessageEvent('message', {data, origin, source: parentWindow});
  }

  function signalRuntimeReady(): void {
    lynxView.onNativeModulesCall?.('A2UI_RUNTIME_READY', {}, 'bridge');
  }

  it('ignores untrusted origins', () => {
    bridge.handleMessage(
      messageEvent({type: BRIDGE_MESSAGE_TYPE.GET_CATALOG}, 'https://attacker.example'),
    );

    expect(postMessage).not.toHaveBeenCalled();
  });

  it('replies to catalog requests after validating the source', () => {
    bridge.handleMessage(messageEvent({type: BRIDGE_MESSAGE_TYPE.GET_CATALOG}));

    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: BRIDGE_MESSAGE_TYPE.A2UI_CATALOG,
        payload: expect.objectContaining({components: expect.any(Object)}),
      }),
      'https://composer.example',
    );
  });

  it('queues a full surface replay until the Lynx runtime is ready', () => {
    const payload = [
      {
        version: 'v0.9',
        createSurface: {surfaceId: 'surface', catalogId: 'catalog'},
      },
    ];

    bridge.handleMessage(messageEvent({type: BRIDGE_MESSAGE_TYPE.RENDER_A2UI, payload}));
    expect(lynxView.sendGlobalEvent).not.toHaveBeenCalled();

    signalRuntimeReady();
    expect(lynxView.sendGlobalEvent).toHaveBeenCalledWith('COMPOSER_REPLAY_MESSAGES', [payload]);
    expect(postMessage).toHaveBeenCalledWith(
      {type: BRIDGE_MESSAGE_TYPE.RENDERER_READY},
      'https://composer.example',
    );
  });

  it('forwards incremental data model changes without resetting the session', () => {
    signalRuntimeReady();
    const updateDataModel = {surfaceId: 'surface', path: '/name', value: 'Lynx'};

    bridge.handleMessage(
      messageEvent({
        type: BRIDGE_MESSAGE_TYPE.DATA_MODEL_CHANGE,
        payload: {updateDataModel},
      }),
    );

    expect(lynxView.sendGlobalEvent).toHaveBeenCalledWith('COMPOSER_LIVE_MESSAGES', [
      [{version: 'v0.9', updateDataModel}],
    ]);
  });

  it('wraps ReactLynx actions in the Composer SEND_TO_SERVER envelope', () => {
    const action = {name: 'submit', sourceComponentId: 'button'};

    lynxView.onNativeModulesCall?.('A2UI_USER_ACTION', action, 'bridge');

    expect(postMessage).toHaveBeenCalledWith(
      {
        type: BRIDGE_MESSAGE_TYPE.SEND_TO_SERVER,
        payload: {version: 'v0.9', action},
      },
      'https://composer.example',
    );
  });
});
