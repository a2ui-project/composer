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

import {bootstrapApplication} from '@angular/platform-browser';
import {App} from './app/app';
import {appConfig} from './app/app.config';

// Setup lightweight Closure handlers to support dynamic imports (lazy routes)
// when running under google3's local development server (web_dev_server) in
// concatjs mode. In this mode, all files are bundled into a single file, so
// dynamic imports (which transpile to goog.requireDynamic) must be resolved
// locally rather than trying to fetch separate chunks from a backend server.
declare const goog: {
  setUncompiledChunkIdHandlerInternalDoNotCallOrElse: (fn: (moduleName: string) => string) => void;
  setImportHandlerInternalDoNotCallOrElse: (fn: (chunkId: string) => Promise<void>) => void;
};
if (typeof goog !== 'undefined') {
  goog.setUncompiledChunkIdHandlerInternalDoNotCallOrElse((m: string) => m);
  goog.setImportHandlerInternalDoNotCallOrElse((c: string) => Promise.resolve());
}

bootstrapApplication(App, appConfig).catch(err => console.error(err));
