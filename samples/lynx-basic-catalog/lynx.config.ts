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

import {pluginLynxConfig} from '@lynx-js/config-rsbuild-plugin';
import {pluginReactLynx} from '@lynx-js/react-rsbuild-plugin';
import {defineConfig} from '@lynx-js/rspeedy';

export default defineConfig({
  plugins: [
    pluginReactLynx({defaultDisplayLinear: false}),
    pluginLynxConfig({enableCSSInlineVariables: true}),
  ],
  source: {
    entry: {
      a2ui: './lynx-src/index.tsx',
    },
  },
  environments: {
    web: {},
    lynx: {},
  },
  output: {
    distPath: {root: '.lynx-dist'},
    filename: '[name].[platform].js',
  },
});
