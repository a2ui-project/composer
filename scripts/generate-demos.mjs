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
// Reads the showcase demos in `samples/shared/demos/*.json` and the A2UI
// specification's basic-catalog examples out of the pinned `@a2ui/web_core`
// dependency (resolved on disk, never fetched over the network), validates them,
// and writes them as one `Demo[]` array to `samples/shared/demos/demos.json`,
// which all three sample renderers import. Run with `yarn generate:demos`.
//
// Pass `--check` (`yarn generate:demos:check`) to verify that the committed file
// still matches those sources: nothing is written, and the process exits non-zero
// if it has drifted.

import {existsSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {A2uiMessageListSchema, BASIC_COMPONENTS} from '@a2ui/web_core/v0_9';
import {normalizeDemoHeadings} from './normalize-demo-headings.mjs';

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

const SHOWCASE_DIR = join(REPO_ROOT, 'samples/shared/demos');

// One generated file, shared by all three sample renderers through
// `samples/shared/demos/index.ts`. JSON carries no license header, so the
// generator never has to write one.
const OUTPUT_PATH = 'samples/shared/demos/demos.json';

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
      a2ui: normalizeDemoHeadings(example.messages),
    });
  }

  return demos;
}

/** Validates the hand-authored examples before they enter any renderer bundle. */
function readShowcaseDemos() {
  return (
    readdirSync(SHOWCASE_DIR)
      // Showcases are `NN_name.json`; the prefix orders them and keeps the generated
      // `demos.json`, which lives in the same directory, out of the input.
      .filter(filename => /^\d+_.+\.json$/.test(filename))
      .sort(compareFilenames)
      .map(filename => {
        const example = readJsonFile(join(SHOWCASE_DIR, filename));
        if (typeof example.name !== 'string' || typeof example.description !== 'string') {
          throw new Error(`${filename}: showcase name and description must be strings.`);
        }
        A2uiMessageListSchema.parse(example.messages);
        const components = example.messages.flatMap(
          message => message.updateComponents?.components ?? [],
        );
        const ids = new Set(components.map(component => component.id));
        if (!ids.has('root') || ids.size !== components.length) {
          throw new Error(`${filename}: showcase needs a root and unique component ids.`);
        }
        for (const {id, component, ...props} of components) {
          const api = BASIC_COMPONENTS.find(api => api.name === component);
          if (!api) throw new Error(`${filename}: unknown basic component ${component}.`);
          api.schema.strict().parse(props);
          const children = [props.child, ...(Array.isArray(props.children) ? props.children : [])];
          for (const child of children.filter(Boolean)) {
            if (!ids.has(child))
              throw new Error(`${filename}: ${id} references missing child ${child}.`);
          }
        }
        return {
          id: `showcase-${idFromFilename(filename)}`,
          name: example.name,
          description: example.description,
          a2ui: normalizeDemoHeadings(example.messages),
        };
      })
  );
}

/**
 * Serializes the demos as a JSON array with one demo per line, so a change to one
 * demo shows up as a one-line diff.
 */
function renderJson(demos) {
  return `[\n${demos.map(demo => `  ${JSON.stringify(demo)}`).join(',\n')}\n]\n`;
}

function writeOutput(json, demoCount) {
  writeFileSync(join(REPO_ROOT, OUTPUT_PATH), json);
  console.log(`wrote ${OUTPUT_PATH} (${demoCount} demos)`);
}

function checkOutput(json, demoCount, version) {
  // Compare on LF-normalized text. `json` is LF-only by construction and
  // `writeOutput` keeps writing it that way; only this comparison has to
  // tolerate a checkout that put CRLF on disk. See `toLf`.
  const absolutePath = join(REPO_ROOT, OUTPUT_PATH);
  if (!existsSync(absolutePath) || toLf(readFileSync(absolutePath, 'utf8')) !== toLf(json)) {
    console.error(
      `${OUTPUT_PATH} no longer matches the local showcases and @a2ui/web_core@${version}'s ` +
        `basic-catalog examples (${demoCount} demos).\nRun \`yarn generate:demos\` and commit the result.`,
    );
    process.exitCode = 1;
    return;
  }
  console.log(
    `up to date: ${OUTPUT_PATH} matches local showcases + @a2ui/web_core@${version} (${demoCount} demos)`,
  );
}

function main() {
  const version = readPackageVersion();
  const filenames = readExampleFiles();
  const demos = [...readShowcaseDemos(), ...buildDemos(filenames)];
  const json = renderJson(demos);

  if (CHECK_MODE) {
    checkOutput(json, demos.length, version);
    return;
  }

  writeOutput(json, demos.length);
}

main();
