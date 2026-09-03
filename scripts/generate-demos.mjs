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

// About this script:
//
// Reads the A2UI specification's basic-catalog examples out of the pinned
// `@a2ui/web_core` dependency (resolved on disk, never fetched over the
// network) and generates one `Demo[]` TypeScript module per sample
// renderer. Run with `yarn generate:demos`.

import {existsSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

// `fileURLToPath` (rather than `new URL(...).pathname`) is required here:
// the latter mangles paths containing spaces or other characters that need
// percent-decoding.
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = dirname(SCRIPT_DIR);

// `require.resolve('@a2ui/web_core/package.json')` throws
// (`Package subpath './package.json' is not defined by "exports"`) because
// the package's `exports` map doesn't expose it. Root `package.json` pins
// `@a2ui/web_core` in `resolutions` and `.yarnrc.yml` sets
// `nodeLinker: node-modules`, so resolving the package directory by path
// is deterministic and correct.
const PKG_DIR = join(REPO_ROOT, 'node_modules/@a2ui/web_core');
const EXAMPLES_SUBPATH = 'src/v0_9/schemas/catalogs/basic/examples';
const EXAMPLES_DIR = join(PKG_DIR, EXAMPLES_SUBPATH);

const OUTPUT_PATHS = [
  'samples/ng-basic-catalog/src/demos.ts',
  'samples/lit-basic-catalog/src/demos.ts',
  'samples/react-basic-catalog/src/demos.ts',
];

const LICENSE_HEADER = readLicenseHeader();

function readLicenseHeader() {
  const bridgeMessageSource = readFileSync(join(REPO_ROOT, 'bridge/src/bridge-message.ts'), 'utf8');
  const lines = bridgeMessageSource.split('\n').slice(0, 15);
  return lines.join('\n');
}

function readPackageVersion() {
  if (!existsSync(PKG_DIR)) {
    throw new Error(
      `Cannot find @a2ui/web_core at ${PKG_DIR}. Run \`yarn install\` to install the pinned dependency before running this script.`,
    );
  }
  const packageJson = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'));
  return packageJson.version;
}

function readExampleFiles() {
  if (!existsSync(EXAMPLES_DIR)) {
    throw new Error(
      `Cannot find the basic-catalog examples directory at ${EXAMPLES_DIR}. The pinned @a2ui/web_core dependency may have relocated its examples; update the EXAMPLES_SUBPATH constant in ${fileURLToPath(import.meta.url)} to match.`,
    );
  }
  const filenames = readdirSync(EXAMPLES_DIR)
    .filter(filename => filename.endsWith('.json'))
    .sort();
  if (filenames.length === 0) {
    throw new Error(`Found zero .json example files in ${EXAMPLES_DIR}.`);
  }
  return filenames;
}

function idFromFilename(filename) {
  return filename.replace(/^\d+_/, '').replace(/\.json$/, '');
}

function buildDemos(filenames) {
  const demos = [];
  const seenIds = new Map();

  for (const filename of filenames) {
    const filePath = join(EXAMPLES_DIR, filename);
    const example = JSON.parse(readFileSync(filePath, 'utf8'));

    if (!example.name) {
      throw new Error(`Example file ${filename} is missing a "name" field.`);
    }
    if (!example.description) {
      throw new Error(`Example file ${filename} is missing a "description" field.`);
    }
    if (!Array.isArray(example.messages) || example.messages.length === 0) {
      throw new Error(`Example file ${filename} has a missing or empty "messages" array.`);
    }

    const id = idFromFilename(filename);
    if (seenIds.has(id)) {
      throw new Error(
        `Duplicate demo id "${id}" derived from both ${seenIds.get(id)} and ${filename}.`,
      );
    }
    seenIds.set(id, filename);

    demos.push({
      id,
      name: example.name,
      description: example.description,
      a2ui: example.messages,
    });
  }

  return demos;
}

function renderModule(demos, version) {
  const provenance = [
    '/**',
    ` * Auto-generated from @a2ui/web_core@${version}'s basic-catalog examples`,
    ` * (${EXAMPLES_SUBPATH}).`,
    ' *',
    ' * Regenerate with: yarn generate:demos',
    ' */',
  ].join('\n');

  const entries = demos.map(demo => `  ${JSON.stringify(demo)},`).join('\n');

  return (
    `${LICENSE_HEADER}\n` +
    '\n' +
    `${provenance}\n` +
    '\n' +
    "import {type Demo} from 'a2ui-bridge';\n" +
    '\n' +
    'export const DEMOS: Demo[] = [\n' +
    `${entries}\n` +
    '];\n'
  );
}

function main() {
  const version = readPackageVersion();
  const filenames = readExampleFiles();
  const demos = buildDemos(filenames);
  const moduleSource = renderModule(demos, version);

  for (const outputPath of OUTPUT_PATHS) {
    writeFileSync(join(REPO_ROOT, outputPath), moduleSource);
    console.log(`wrote ${outputPath} (${demos.length} demos)`);
  }
}

main();
