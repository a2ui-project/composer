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

import {LYNX_CATALOG} from './catalog.js';
import type {LynxViewElement} from './types.js';

/** Composer preview bridge message names understood by the Lynx renderer. */
export const BRIDGE_MESSAGE_TYPE = {
  A2UI_CATALOG: 'A2UI_CATALOG',
  COMPONENT_USAGES: 'COMPONENT_USAGES',
  DATA_MODEL_CHANGE: 'DATA_MODEL_CHANGE',
  GET_CATALOG: 'GET_CATALOG',
  GET_COMPONENT_USAGES: 'GET_COMPONENT_USAGES',
  RENDER_A2UI: 'RENDER_A2UI',
  RENDERER_READY: 'RENDERER_READY',
  SEND_TO_SERVER: 'SEND_TO_SERVER',
  SET_BLOCKING_STATE: 'SET_BLOCKING_STATE',
  SET_THEME: 'SET_THEME',
  SURFACE_RESIZE: 'SURFACE_RESIZE',
} as const;

interface BridgeMessage {
  type: string;
  payload?: unknown;
}

interface NativeModuleCall {
  name: string;
  data: unknown;
  moduleName: string;
}

function isBridgeMessage(value: unknown): value is BridgeMessage {
  return (
    !!value && typeof value === 'object' && typeof (value as {type?: unknown}).type === 'string'
  );
}

function hasCreateSurface(payload: unknown): boolean {
  return (
    Array.isArray(payload) &&
    payload.some(item => !!item && typeof item === 'object' && 'createSurface' in item)
  );
}

/** Adapts Composer's iframe protocol to Lynx global events and native module calls. */
export class LynxComposerBridge {
  private readonly pendingMessages: Array<{eventName: string; payload: unknown}> = [];
  private runtimeReady = false;
  private overlay: HTMLDivElement | null = null;
  private readonly parentOrigin: string;

  constructor(
    private readonly lynxView: LynxViewElement,
    private readonly parentWindow: Window,
    private readonly allowedParentOrigins: ReadonlySet<string>,
    private readonly documentRef: Document,
  ) {
    this.parentOrigin = allowedParentOrigins.values().next().value ?? window.location.origin;
    this.lynxView.onNativeModulesCall = (name, data, moduleName) =>
      this.handleNativeModuleCall({name, data, moduleName});
  }

  /** Accepts a message event after verifying its source and origin. */
  handleMessage(event: MessageEvent<unknown>): void {
    if (event.source !== this.parentWindow || !this.allowedParentOrigins.has(event.origin)) {
      return;
    }
    if (!isBridgeMessage(event.data)) return;

    const {type, payload} = event.data;
    switch (type) {
      case BRIDGE_MESSAGE_TYPE.RENDER_A2UI:
        this.forwardRenderPayload(payload);
        break;
      case BRIDGE_MESSAGE_TYPE.DATA_MODEL_CHANGE:
        this.forwardDataModelChange(payload);
        break;
      case BRIDGE_MESSAGE_TYPE.GET_CATALOG:
        this.postToParent({type: BRIDGE_MESSAGE_TYPE.A2UI_CATALOG, payload: LYNX_CATALOG});
        break;
      case BRIDGE_MESSAGE_TYPE.GET_COMPONENT_USAGES:
        this.postToParent({type: BRIDGE_MESSAGE_TYPE.COMPONENT_USAGES, payload: {}});
        break;
      case BRIDGE_MESSAGE_TYPE.SET_THEME:
        this.forwardTheme(payload);
        break;
      case BRIDGE_MESSAGE_TYPE.SET_BLOCKING_STATE:
        this.setBlockingState(payload);
        break;
    }
  }

  /** Reports the current host element dimensions to Composer. */
  reportSurfaceSize(): void {
    const rect = this.lynxView.getBoundingClientRect();
    const height = Math.max(this.documentRef.body.scrollHeight, Math.ceil(rect.height));
    const width = Math.max(this.documentRef.body.scrollWidth, Math.ceil(rect.width));
    this.postToParent({
      type: BRIDGE_MESSAGE_TYPE.SURFACE_RESIZE,
      payload: {height, width},
    });
  }

  /** Removes runtime callbacks and transient UI. */
  destroy(): void {
    this.lynxView.onNativeModulesCall = undefined;
    this.overlay?.remove();
    this.overlay = null;
  }

  private handleNativeModuleCall(call: NativeModuleCall): unknown {
    if (call.moduleName !== 'bridge') return undefined;
    if (call.name === 'A2UI_RUNTIME_READY') {
      this.runtimeReady = true;
      this.flushPendingMessages();
      this.postToParent({type: BRIDGE_MESSAGE_TYPE.RENDERER_READY});
      this.reportSurfaceSize();
    } else if (call.name === 'A2UI_USER_ACTION') {
      this.postToParent({
        type: BRIDGE_MESSAGE_TYPE.SEND_TO_SERVER,
        payload: {version: 'v0.9', action: call.data},
      });
    } else if (call.name === 'A2UI_SURFACE_RESIZE') {
      this.reportSurfaceSize();
    }
    return undefined;
  }

  private forwardRenderPayload(payload: unknown): void {
    if (!Array.isArray(payload)) return;
    const eventName = hasCreateSurface(payload)
      ? 'COMPOSER_REPLAY_MESSAGES'
      : 'COMPOSER_LIVE_MESSAGES';
    this.sendOrQueue(eventName, payload);
  }

  private forwardDataModelChange(payload: unknown): void {
    if (!payload || typeof payload !== 'object') return;
    const updateDataModel = (payload as {updateDataModel?: unknown}).updateDataModel;
    if (!updateDataModel) return;
    this.sendOrQueue('COMPOSER_LIVE_MESSAGES', [{version: 'v0.9', updateDataModel}]);
  }

  private forwardTheme(payload: unknown): void {
    if (!payload || typeof payload !== 'object') return;
    const theme = (payload as {theme?: unknown}).theme;
    if (theme !== 'light' && theme !== 'dark') return;
    this.documentRef.documentElement.classList.toggle('dark-theme', theme === 'dark');
    this.sendOrQueue('COMPOSER_THEME', theme);
  }

  private setBlockingState(payload: unknown): void {
    if (!payload || typeof payload !== 'object') return;
    const state = payload as {blocked?: unknown; message?: unknown};
    if (state.blocked !== true) {
      this.overlay?.remove();
      this.overlay = null;
      return;
    }
    this.overlay ??= this.documentRef.createElement('div');
    this.overlay.className = 'bridge-overlay';
    this.overlay.textContent =
      typeof state.message === 'string' ? state.message : 'Processing layouts...';
    if (!this.overlay.isConnected) this.documentRef.body.append(this.overlay);
  }

  private sendOrQueue(eventName: string, payload: unknown): void {
    if (!this.runtimeReady || !this.lynxView.sendGlobalEvent) {
      this.pendingMessages.push({eventName, payload});
      return;
    }
    this.lynxView.sendGlobalEvent(eventName, [payload]);
  }

  private flushPendingMessages(): void {
    if (!this.lynxView.sendGlobalEvent) return;
    for (const message of this.pendingMessages.splice(0)) {
      this.lynxView.sendGlobalEvent(message.eventName, [message.payload]);
    }
  }

  private postToParent(message: BridgeMessage): void {
    this.parentWindow.postMessage(message, this.parentOrigin);
  }
}
