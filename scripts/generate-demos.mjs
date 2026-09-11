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
//
// Pass `--check` (`yarn generate:demos:check`) to verify that the committed
// modules still match what this script would generate right now: nothing is
// written, and the process exits non-zero naming every drifted output.

import {existsSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

// `fileURLToPath` (rather than `new URL(...).pathname`) is required here:
// the latter mangles paths containing spaces or other characters that need
// percent-decoding.
const SCRIPT_PATH = fileURLToPath(import.meta.url);
const SCRIPT_DIR = dirname(SCRIPT_PATH);
const REPO_ROOT = dirname(SCRIPT_DIR);

// Verify the committed output instead of rewriting it. See `main()`.
const CHECK_MODE = process.argv.slice(2).includes('--check');

// `require.resolve('@a2ui/web_core/package.json')` throws
// (`Package subpath './package.json' is not defined by "exports"`) because
// the package's `exports` map doesn't expose it, so the package directory is
// resolved by path instead. The root `package.json` does not depend on
// `@a2ui/web_core` at all: the single copy below `<repo>/node_modules` is
// there because Yarn hoists it out of the three sample workspaces, which do
// depend on it. Root `resolutions` only pins which *version* they all get; it
// never causes an install on its own. `.yarnrc.yml` sets
// `nodeLinker: node-modules`, so the hoisted location is deterministic.
const PKG_DIR = join(REPO_ROOT, 'node_modules/@a2ui/web_core');
const EXAMPLES_SUBPATH = 'src/v0_9/schemas/catalogs/basic/examples';
const EXAMPLES_DIR = join(PKG_DIR, EXAMPLES_SUBPATH);

const OUTPUT_PATHS = [
  'samples/ng-basic-catalog/src/demos.ts',
  'samples/lit-basic-catalog/src/demos.ts',
  'samples/react-basic-catalog/src/demos.ts',
];

// The number of leading lines of `bridge/src/bridge-message.ts` that make up
// its Apache-2.0 license header block.
const LICENSE_HEADER_LINE_COUNT = 15;

// Markers every generated file's license header must contain. Checking the
// text (not just the block's shape) is what stops an unrelated 15-line block
// comment from being copied into all three outputs: `addlicense` would not
// catch that, because it only adds headers to files that have none at all.
const LICENSE_HEADER_MARKERS = ['Copyright', 'Licensed under the Apache License, Version 2.0'];

const LICENSE_HEADER = readLicenseHeader();

/**
 * Collapses CRLF and lone-CR line endings to LF.
 *
 * Everything this script generates is LF-only, but what it reads back is
 * whatever the checkout produced: with `core.autocrlf=true` on Windows, and no
 * `.gitattributes` in this repo to say otherwise, git materializes these files
 * with CRLF. Comparisons therefore have to run on normalized text, or `--check`
 * reports permanent drift that `yarn generate:demos` cannot resolve -- it
 * rewrites the files with LF, git reports no change, and the next `--check`
 * fails again.
 */
function toLf(text) {
  return text.replace(/\r\n?/g, '\n');
}

/**
 * Parses a JSON file, attaching the file's path to any parse failure.
 *
 * A bare `SyntaxError` from `JSON.parse` points at this helper rather than at
 * the offending file, which turns a single malformed example into a manual
 * bisect of every example on disk.
 */
function readJsonFile(filePath) {
  const source = readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(source);
  } catch (cause) {
    throw new Error(`Failed to parse JSON in ${filePath}: ${cause.message}`, {cause});
  }
}

function readLicenseHeader() {
  const bridgeMessagePath = join(REPO_ROOT, 'bridge/src/bridge-message.ts');
  // Normalize line endings before slicing: on a CRLF checkout `split('\n')`
  // leaves a trailing `\r` on every header line (which `trimStart()` does not
  // remove), producing generated files with a CRLF header and an LF body.
  // These files are prettier-ignored, so nothing downstream normalizes them
  // and contributors on other platforms get spurious whole-file diffs.
  const bridgeMessageSource = toLf(readFileSync(bridgeMessagePath, 'utf8'));
  const lines = bridgeMessageSource.split('\n').slice(0, LICENSE_HEADER_LINE_COUNT);
  const lastLine = lines[lines.length - 1];
  if (!lastLine.trimStart().startsWith('*/')) {
    throw new Error(
      `Expected the first ${LICENSE_HEADER_LINE_COUNT} lines of ${bridgeMessagePath} to end the ` +
        `file's opening license comment block (a line starting with "*/"), but line ` +
        `${LICENSE_HEADER_LINE_COUNT} was ${JSON.stringify(lastLine)}. The license header in ` +
        'bridge-message.ts likely changed length; update the slice in readLicenseHeader() to match.',
    );
  }
  const header = lines.join('\n');
  for (const marker of LICENSE_HEADER_MARKERS) {
    if (!header.includes(marker)) {
      throw new Error(
        `The first ${LICENSE_HEADER_LINE_COUNT} lines of ${bridgeMessagePath} form a comment ` +
          `block that does not contain ${JSON.stringify(marker)}, so they are not the Apache-2.0 ` +
          'license header this script copies into every generated demo module. The header was ' +
          'likely moved, replaced, or preceded by another block comment; restore it (or point ' +
          'readLicenseHeader() at wherever it now lives) before regenerating.',
      );
    }
  }
  return header;
}

function readPackageVersion() {
  if (!existsSync(PKG_DIR)) {
    throw new Error(
      `Cannot find @a2ui/web_core at ${PKG_DIR}. That copy is expected to be hoisted there out ` +
        'of the sample workspaces; check that samples/*/package.json still list @a2ui/web_core ' +
        'as a dependency, then re-run `yarn install` at the repo root.',
    );
  }
  const packageJsonPath = join(PKG_DIR, 'package.json');
  const packageJson = readJsonFile(packageJsonPath);
  const version = packageJson.version;
  if (typeof version !== 'string' || version.length === 0) {
    throw new Error(
      `${packageJsonPath} has a missing or non-string "version" field (got ` +
        `${JSON.stringify(version)}). That version is baked into the provenance comment of every ` +
        'generated module, so generating without it would destroy the traceability the comment ' +
        'exists to provide. Re-run `yarn install` at the repo root to restore a complete package.',
    );
  }
  return version;
}

/**
 * Returns the numeric ordering prefix of an example filename, or `Infinity`
 * for a filename that has none (those sort last, by name).
 */
function orderPrefix(filename) {
  const match = /^(\d+)_/.exec(filename);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

function compareFilenames(a, b) {
  // The `NN_` prefix defines demo order, so compare it numerically: a plain
  // lexicographic `.sort()` would put `100_` before `10_` and `9_` last as
  // soon as upstream ships a three-digit or unpadded prefix.
  const prefixDelta = orderPrefix(a) - orderPrefix(b);
  if (prefixDelta) {
    return prefixDelta;
  }
  return a < b ? -1 : a > b ? 1 : 0;
}

function readExampleFiles() {
  if (!existsSync(EXAMPLES_DIR)) {
    throw new Error(
      `Cannot find the basic-catalog examples directory at ${EXAMPLES_DIR}. The pinned @a2ui/web_core dependency may have relocated its examples; update the EXAMPLES_SUBPATH constant in ${SCRIPT_PATH} to match.`,
    );
  }
  const filenames = readdirSync(EXAMPLES_DIR)
    .filter(filename => filename.endsWith('.json'))
    .sort(compareFilenames);
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
    const example = readJsonFile(filePath);

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
    if (!id) {
      throw new Error(
        `Example file ${filename} yields an empty demo id. Ids are the filename with its numeric ` +
          'ordering prefix and ".json" extension stripped, so the file needs a name after that ' +
          'prefix (for example "37_modal.json").',
      );
    }
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

function writeOutputs(moduleSource, demoCount) {
  // Validate every destination before writing any of them. The writes are
  // sequential, so a failure partway through (missing directory, permissions,
  // read-only filesystem) would leave the samples serving *different* demo
  // sets -- and because these files are prettier-ignored, that mismatch gets
  // little scrutiny in review.
  for (const outputPath of OUTPUT_PATHS) {
    const outputDir = dirname(join(REPO_ROOT, outputPath));
    if (!existsSync(outputDir)) {
      throw new Error(
        `Cannot write ${outputPath}: its directory ${outputDir} does not exist. The sample was ` +
          `likely renamed or removed; update the OUTPUT_PATHS constant in ${SCRIPT_PATH} to ` +
          'match. No files were written.',
      );
    }
  }

  for (const outputPath of OUTPUT_PATHS) {
    writeFileSync(join(REPO_ROOT, outputPath), moduleSource);
    console.log(`wrote ${outputPath} (${demoCount} demos)`);
  }
}

function checkOutputs(moduleSource, demoCount, version) {
  // Compare on LF-normalized text. `moduleSource` is LF-only by construction
  // and `writeOutputs` keeps writing it that way; only this comparison has to
  // tolerate a checkout that put CRLF on disk. See `toLf`.
  const expected = toLf(moduleSource);
  const drifted = OUTPUT_PATHS.filter(outputPath => {
    const absolutePath = join(REPO_ROOT, outputPath);
    return !existsSync(absolutePath) || toLf(readFileSync(absolutePath, 'utf8')) !== expected;
  });

  if (drifted.length > 0) {
    console.error(
      `The committed demo modules no longer match @a2ui/web_core@${version}'s basic-catalog ` +
        `examples (${demoCount} demos). Out of date:\n` +
        drifted.map(outputPath => `  - ${outputPath}`).join('\n') +
        '\nRun `yarn generate:demos` and commit the result.',
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `up to date: ${OUTPUT_PATHS.length} generated demo modules match ` +
      `@a2ui/web_core@${version} (${demoCount} demos)`,
  );
}

function main() {
  const version = readPackageVersion();
  const filenames = readExampleFiles();
  const demos = buildDemos(filenames);
  const moduleSource = renderModule(demos, version);

  if (CHECK_MODE) {
    checkOutputs(moduleSource, demos.length, version);
    return;
  }

  writeOutputs(moduleSource, demos.length);
}

main();
