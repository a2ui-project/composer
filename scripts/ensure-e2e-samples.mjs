/*
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

import {execSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const rootDir = resolve(fileURLToPath(import.meta.url), '..', '..');

const targets = [
  {name: 'a2ui-bridge', distPath: resolve(rootDir, 'bridge/dist')},
  {name: 'ng-basic-catalog', distPath: resolve(rootDir, 'samples/ng-basic-catalog/dist')},
  {name: 'lit-basic-catalog', distPath: resolve(rootDir, 'samples/lit-basic-catalog/dist')},
  {name: 'react-basic-catalog', distPath: resolve(rootDir, 'samples/react-basic-catalog/dist')},
  {name: 'react-slack-catalog', distPath: resolve(rootDir, 'samples/react-slack-catalog/dist')},
];

for (const target of targets) {
  if (!existsSync(target.distPath)) {
    execSync(`corepack yarn workspace ${target.name} build`, {
      cwd: rootDir,
      stdio: 'inherit',
    });
  }
}
