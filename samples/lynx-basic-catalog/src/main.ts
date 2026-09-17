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

import '@lynx-js/web-core/client';
import '@lynx-js/web-elements/all';
import './styles.css';

import {LynxComposerBridge} from './protocol.js';
import type {LynxViewElement} from './types.js';

function readAllowedParentOrigins(): ReadonlySet<string> {
  const origins = new URLSearchParams(window.location.search).getAll('origin').filter(origin => {
    try {
      const url = new URL(origin);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  });
  if (origins.length === 0) origins.push(window.location.origin);
  return new Set(origins);
}

const root = document.getElementById('app-root');
if (!root) throw new Error('Missing #app-root element.');

const lynxView = document.createElement('lynx-view') as LynxViewElement;
const bridge = new LynxComposerBridge(
  lynxView,
  window.parent,
  readAllowedParentOrigins(),
  document,
);
lynxView.className = 'lynx-preview';
lynxView.setAttribute('thread-strategy', 'multi-thread');
lynxView.setAttribute('transform-vh', 'true');
lynxView.setAttribute('transform-vw', 'true');
lynxView.setAttribute('url', new URL('./a2ui.web.js', window.location.href).toString());
root.append(lynxView);
const handleMessage = (event: MessageEvent<unknown>) => bridge.handleMessage(event);
window.addEventListener('message', handleMessage);

const resizeObserver = new ResizeObserver(() => bridge.reportSurfaceSize());
resizeObserver.observe(lynxView);

window.addEventListener('pagehide', () => {
  resizeObserver.disconnect();
  window.removeEventListener('message', handleMessage);
  bridge.destroy();
});
