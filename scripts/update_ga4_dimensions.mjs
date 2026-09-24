#!/usr/bin/env node
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

/**
 * @fileoverview Scans GA4 usage-tracking source code and synchronizes
 * custom dimensions and custom metrics definitions in scripts/create_ga4_dimensions.sh.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const DEFAULT_SCRIPT_PATH = path.resolve(__dirname, 'create_ga4_dimensions.sh');
const DEFAULT_SOURCE_PATH = path.resolve(
  REPO_ROOT,
  'shell/src/app/usage-tracking/ga4-usage-tracking.service.ts',
);

/**
 * Standard GA4 event parameters and config options to exclude from custom dimensions/metrics.
 */
export const EXCLUDED_PARAMS = new Set([
  'send_to',
  'page_path',
  'event_category',
  'event_label',
  'send_page_view',
  'cookie_prefix',
  'cookie_domain',
  'client_id',
]);

/**
 * Curated descriptions for known parameters discovered during source scans.
 */
export const KNOWN_DESCRIPTIONS = {
  error_type: 'Functional error type classification',
};

/**
 * Sentinel marker constants separating auto-generated definitions from handwritten script logic.
 */
export const DIMENSIONS_START = '#### BEGIN DIMENSIONS -- DO NOT EDIT';
export const DIMENSIONS_END = '#### END DIMENSIONS';
export const METRICS_START = '#### BEGIN METRICS -- DO NOT EDIT';
export const METRICS_END = '#### END METRICS';

/**
 * @typedef {Object} DimensionDefinition
 * @property {string} paramName
 * @property {string} displayName
 * @property {string} description
 *
 * Creates a DimensionDefinition object.
 *
 * @param {string} paramName
 * @param {string} displayName
 * @param {string} description
 * @returns {DimensionDefinition}
 */
export function createDimensionDefinition(paramName, displayName, description) {
  return {paramName, displayName, description};
}

/**
 * @typedef {Object} MetricDefinition
 * @property {string} paramName
 * @property {string} displayName
 * @property {'STANDARD' | 'SECONDS'} measurementUnit
 * @property {string} description
 *
 * Creates a MetricDefinition object.
 *
 * @param {string} paramName
 * @param {string} displayName
 * @param {'STANDARD' | 'SECONDS'} measurementUnit
 * @param {string} description
 * @returns {MetricDefinition}
 */
export function createMetricDefinition(paramName, displayName, measurementUnit, description) {
  return {paramName, displayName, measurementUnit, description};
}

/**
 * @typedef {Object} ParameterClassification
 * @property {'METRIC' | 'DIMENSION'} type
 * @property {'STANDARD' | 'SECONDS'} [measurementUnit]
 * @property {'EVENT'} scope
 *
 * Creates a ParameterClassification object.
 *
 * @param {'METRIC' | 'DIMENSION'} type
 * @param {'STANDARD' | 'SECONDS'} [measurementUnit]
 * @param {'EVENT'} [scope]
 * @returns {ParameterClassification}
 */
export function createParameterClassification(type, measurementUnit, scope = 'EVENT') {
  const result = {type, scope};
  if (measurementUnit) {
    result.measurementUnit = measurementUnit;
  }
  return result;
}

/**
 * @typedef {Object} ParsedScriptResult
 * @property {Map<string, DimensionDefinition>} dimensions
 * @property {Map<string, MetricDefinition>} metrics
 *
 * Creates a ParsedScriptResult object.
 *
 * @param {Map<string, DimensionDefinition>} [dimensions]
 * @param {Map<string, MetricDefinition>} [metrics]
 * @returns {ParsedScriptResult}
 */
export function createParsedScriptResult(dimensions = new Map(), metrics = new Map()) {
  return {dimensions, metrics};
}

/**
 * @typedef {Object} MergedDefinitionsResult
 * @property {DimensionDefinition[]} dimensions
 * @property {MetricDefinition[]} metrics
 * @property {string[]} addedDimensions
 * @property {string[]} addedMetrics
 *
 * Creates a MergedDefinitionsResult object.
 *
 * @param {DimensionDefinition[]} [dimensions]
 * @param {MetricDefinition[]} [metrics]
 * @param {string[]} [addedDimensions]
 * @param {string[]} [addedMetrics]
 * @returns {MergedDefinitionsResult}
 */
export function createMergedDefinitionsResult(
  dimensions = [],
  metrics = [],
  addedDimensions = [],
  addedMetrics = [],
) {
  return {dimensions, metrics, addedDimensions, addedMetrics};
}

/**
 * Parses existing custom dimensions and custom metrics from create_ga4_dimensions.sh.
 *
 * When sentinel comments are present, extracts only within DIMENSIONS_START..DIMENSIONS_END
 * and METRICS_START..METRICS_END. Falls back to full-file scanning if sentinels are not present.
 *
 * @param {string} scriptContent
 * @returns {ParsedScriptResult}
 */
export function parseExistingScript(scriptContent) {
  const dimensions = new Map();
  const metrics = new Map();

  let dimSection = scriptContent;
  const dimStartIdx = scriptContent.indexOf(DIMENSIONS_START);
  const dimEndIdx = scriptContent.indexOf(DIMENSIONS_END);
  if (dimStartIdx !== -1 && dimEndIdx !== -1 && dimEndIdx > dimStartIdx) {
    dimSection = scriptContent.slice(dimStartIdx + DIMENSIONS_START.length, dimEndIdx);
  }

  const dimensionRegex = /create_dimension\s+"([^"]+)"\s+"([^"]*)"\s+"([^"]*)"/g;
  let dimMatch;
  while ((dimMatch = dimensionRegex.exec(dimSection)) !== null) {
    const [, paramName, displayName, description] = dimMatch;
    dimensions.set(paramName, createDimensionDefinition(paramName, displayName, description));
  }

  let metSection = scriptContent;
  const metStartIdx = scriptContent.indexOf(METRICS_START);
  const metEndIdx = scriptContent.indexOf(METRICS_END);
  if (metStartIdx !== -1 && metEndIdx !== -1 && metEndIdx > metStartIdx) {
    metSection = scriptContent.slice(metStartIdx + METRICS_START.length, metEndIdx);
  }

  const metricRegex = /create_metric\s+"([^"]+)"\s+"([^"]*)"\s+"([^"]*)"\s+"([^"]*)"/g;
  let metMatch;
  while ((metMatch = metricRegex.exec(metSection)) !== null) {
    const [, paramName, displayName, measurementUnit, description] = metMatch;
    metrics.set(
      paramName,
      createMetricDefinition(paramName, displayName, measurementUnit, description),
    );
  }

  return createParsedScriptResult(dimensions, metrics);
}

/**
 * Extracts telemetry parameter names from usage-tracking source code.
 *
 * Supports bracketed keys (`['param_name']:`), quoted keys (`'param_name':`),
 * and unquoted snake_case property keys (`param_name:`, `line:`, `column:`) inside
 * `getBaselineDimensions`, `dispatchGtagEvent`, and `customParams` object payloads.
 *
 * @param {string} sourceContent
 * @returns {Set<string>}
 */
export function extractParametersFromSource(sourceContent) {
  const params = new Set();

  // 1. Match bracketed object keys like ['composer_session_id']: ... across the file
  const bracketKeyRegex = /\[['"]([a-zA-Z0-9_]+)['"]\]\s*:/g;
  let match;
  while ((match = bracketKeyRegex.exec(sourceContent)) !== null) {
    const param = match[1];
    if (!EXCLUDED_PARAMS.has(param)) {
      params.add(param);
    }
  }

  // 2. Identify target payload regions: getBaselineDimensions, dispatchGtagEvent, customParams
  const payloadRegions = [];

  // getBaselineDimensions block
  const baselineRegex = /getBaselineDimensions\s*\([^)]*\)[^{]*\{([\s\S]*?)\n\s*\}/g;
  while ((match = baselineRegex.exec(sourceContent)) !== null) {
    payloadRegions.push(match[1]);
  }

  // dispatchGtagEvent call blocks
  const dispatchRegex = /dispatchGtagEvent\s*\([\s\S]*?\);/g;
  while ((match = dispatchRegex.exec(sourceContent)) !== null) {
    payloadRegions.push(match[0]);
  }

  // customParams object declarations
  const customParamsRegex = /(?:const|let|var)\s+customParams\s*=\s*\{([\s\S]*?)\};/g;
  while ((match = customParamsRegex.exec(sourceContent)) !== null) {
    payloadRegions.push(match[1]);
  }

  const IGNORED_IDENTIFIERS = new Set([
    'params',
    'private',
    'protected',
    'public',
    'return',
    'const',
    'let',
    'var',
    'this',
    'true',
    'false',
    'null',
    'undefined',
  ]);

  // 3. Scan payload regions for quoted or unquoted snake_case property keys
  for (const region of payloadRegions) {
    // Quoted keys: 'param_name': or "param_name":
    const quotedRegex = /(?:['"])([a-zA-Z0-9_]+)(?:['"])\s*:/g;
    while ((match = quotedRegex.exec(region)) !== null) {
      const param = match[1];
      if (!EXCLUDED_PARAMS.has(param) && !IGNORED_IDENTIFIERS.has(param)) {
        params.add(param);
      }
    }

    // Unquoted property keys: snake_case (with underscore) or standard line/column
    const unquotedRegex = /(?:^|[{,\n\s])([a-z][a-z0-9]*(?:_[a-z0-9]+)+|line|column)\s*:/gm;
    while ((match = unquotedRegex.exec(region)) !== null) {
      const param = match[1];
      if (!EXCLUDED_PARAMS.has(param) && !IGNORED_IDENTIFIERS.has(param)) {
        params.add(param);
      }
    }
  }

  return params;
}

/**
 * Classifies a parameter name into either Custom Metric or Custom Dimension.
 *
 * Suffixes '_seconds', '_count', '_chars', '_turns', '_index', '_number', or 'line', 'column'
 * are classified as Custom Metrics. Parameters ending in '_seconds' receive SECONDS unit,
 * while others receive STANDARD. All other parameters are Custom Dimensions (EVENT scope).
 *
 * @param {string} paramName
 * @returns {ParameterClassification}
 */
export function classifyParameter(paramName) {
  const isMetric =
    paramName.endsWith('_seconds') ||
    paramName.endsWith('_count') ||
    paramName.endsWith('_chars') ||
    paramName.endsWith('_turns') ||
    paramName.endsWith('_index') ||
    paramName.endsWith('_number') ||
    paramName === 'line' ||
    paramName === 'column';

  if (isMetric) {
    return createParameterClassification(
      'METRIC',
      paramName.endsWith('_seconds') ? 'SECONDS' : 'STANDARD',
      'EVENT',
    );
  }

  return createParameterClassification('DIMENSION', undefined, 'EVENT');
}

/**
 * Converts snake_case parameter name to Title Case display name.
 *
 * @param {string} paramName
 * @returns {string}
 */
export function formatDisplayName(paramName) {
  return paramName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Resolves a description for a parameter, using curated definitions or a formatted fallback.
 *
 * @param {string} paramName
 * @param {string} displayName
 * @returns {string}
 */
export function formatDescription(paramName, displayName) {
  if (KNOWN_DESCRIPTIONS[paramName]) {
    return KNOWN_DESCRIPTIONS[paramName];
  }
  return `${displayName} parameter`;
}

/**
 * Merges existing definitions with extracted parameters, preserving existing metadata
 * and ordering while appending newly discovered parameters.
 *
 * @param {ParsedScriptResult} existing
 * @param {Set<string>} extractedParams
 * @returns {MergedDefinitionsResult}
 */
export function mergeDefinitions(existing, extractedParams) {
  const dimensions = Array.from(existing.dimensions.values());
  const metrics = Array.from(existing.metrics.values());
  const addedDimensions = [];
  const addedMetrics = [];

  const knownParams = new Set([
    ...dimensions.map(d => d.paramName),
    ...metrics.map(m => m.paramName),
  ]);

  for (const param of extractedParams) {
    if (knownParams.has(param)) {
      continue;
    }

    const classification = classifyParameter(param);
    const displayName = formatDisplayName(param);
    const description = formatDescription(param, displayName);

    if (classification.type === 'METRIC') {
      const metricDef = createMetricDefinition(
        param,
        displayName,
        classification.measurementUnit || 'STANDARD',
        description,
      );
      metrics.push(metricDef);
      addedMetrics.push(param);
    } else {
      const dimensionDef = createDimensionDefinition(param, displayName, description);
      dimensions.push(dimensionDef);
      addedDimensions.push(param);
    }
    knownParams.add(param);
  }

  return createMergedDefinitionsResult(dimensions, metrics, addedDimensions, addedMetrics);
}

/**
 * Formats the CLI help text.
 *
 * @returns {string}
 */
export function formatHelpText() {
  return `Usage: node scripts/update_ga4_dimensions.mjs [options]

Synchronizes GA4 custom dimensions and metrics between usage-tracking source code
and scripts/create_ga4_dimensions.sh.

Options:
  --check       Verify if scripts/create_ga4_dimensions.sh is up to date without modifying it (exits with code 1 if changes needed)
  --dry-run     Preview planned changes without writing to disk
  -h, --help    Display this help message
`;
}

/**
 * Generates the updated bash script content for create_ga4_dimensions.sh.
 *
 * When sentinel comments are present, surgically replaces only the lines between
 * DIMENSIONS_START..DIMENSIONS_END and METRICS_START..METRICS_END, preserving all surrounding
 * code untouched.
 *
 * @param {string} originalScriptContent
 * @param {MergedDefinitionsResult | {dimensions: Array<DimensionDefinition>, metrics: Array<MetricDefinition>}} definitions
 * @returns {string}
 */
export function generateScriptContent(originalScriptContent, definitions) {
  const dimensionLines = definitions.dimensions
    .map(d => `create_dimension "${d.paramName}" "${d.displayName}" "${d.description}"`)
    .join('\n');

  const metricLines = definitions.metrics
    .map(
      m =>
        `create_metric "${m.paramName}" "${m.displayName}" "${m.measurementUnit}" "${m.description}"`,
    )
    .join('\n');

  const dimStartIdx = originalScriptContent.indexOf(DIMENSIONS_START);
  const dimEndIdx = originalScriptContent.indexOf(DIMENSIONS_END);
  const metStartIdx = originalScriptContent.indexOf(METRICS_START);
  const metEndIdx = originalScriptContent.indexOf(METRICS_END);

  if (
    dimStartIdx !== -1 &&
    dimEndIdx !== -1 &&
    dimEndIdx > dimStartIdx &&
    metStartIdx !== -1 &&
    metEndIdx !== -1 &&
    metEndIdx > metStartIdx
  ) {
    const beforeDims = originalScriptContent.slice(0, dimStartIdx + DIMENSIONS_START.length);
    const intermediate = originalScriptContent.slice(dimEndIdx, metStartIdx + METRICS_START.length);
    const footer = originalScriptContent.slice(metEndIdx);

    return `${beforeDims}\n${dimensionLines}\n${intermediate}\n${metricLines}\n${footer}`;
  }

  const marker = 'echo "--- Provisioning Custom Dimensions ---"';
  const markerIndex = originalScriptContent.indexOf(marker);

  if (markerIndex === -1) {
    throw new Error(`Could not find provisioning marker in script: "${marker}"`);
  }

  const header = originalScriptContent.slice(0, markerIndex + marker.length);

  return `${header}
${DIMENSIONS_START}
${dimensionLines}
${DIMENSIONS_END}

echo ""
echo "--- Provisioning Custom Metrics ---"
${METRICS_START}
${metricLines}
${METRICS_END}

echo ""
echo "=== Provisioning Complete ==="
`;
}

/**
 * Synchronizes definitions between usage tracking source code and create_ga4_dimensions.sh.
 *
 * @typedef {Object} SyncDimensionsOptions
 * @property {string} [scriptPath]
 * @property {string} [sourcePath]
 * @property {boolean} [dryRun]
 * @property {boolean} [check]
 *
 * @typedef {Object} SyncDimensionsResult
 * @property {boolean} isUpToDate
 * @property {boolean} hasChanges
 * @property {MergedDefinitionsResult} [newDefinitions]
 * @property {string} [content]
 *
 * @param {SyncDimensionsOptions} [options]
 * @returns {SyncDimensionsResult}
 */
export function syncDimensions({
  scriptPath = DEFAULT_SCRIPT_PATH,
  sourcePath = DEFAULT_SOURCE_PATH,
  dryRun = false,
  check = false,
} = {}) {
  const scriptContent = fs.readFileSync(scriptPath, 'utf-8');
  const sourceContent = fs.readFileSync(sourcePath, 'utf-8');

  const existing = parseExistingScript(scriptContent);
  const extractedParams = extractParametersFromSource(sourceContent);
  const merged = mergeDefinitions(existing, extractedParams);
  const generatedContent = generateScriptContent(scriptContent, merged);

  const isUpToDate = scriptContent === generatedContent;
  const hasChanges = !isUpToDate;

  if (hasChanges && !dryRun && !check) {
    fs.writeFileSync(scriptPath, generatedContent, 'utf-8');
  }

  return {
    isUpToDate,
    hasChanges,
    newDefinitions: merged,
    content: generatedContent,
  };
}

// CLI execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const isHelp = args.includes('--help') || args.includes('-h');
  const isCheck = args.includes('--check');
  const isDryRun = args.includes('--dry-run');

  if (isHelp) {
    console.log(formatHelpText());
    process.exit(0);
  }

  try {
    const result = syncDimensions({
      check: isCheck,
      dryRun: isDryRun,
    });

    if (isCheck) {
      if (result.isUpToDate) {
        console.log('OK: scripts/create_ga4_dimensions.sh is up to date with codebase.');
        process.exit(0);
      } else {
        console.error(
          'Error: scripts/create_ga4_dimensions.sh is out of date. Run `node scripts/update_ga4_dimensions.mjs` to update.',
        );
        process.exit(1);
      }
    }

    if (isDryRun) {
      console.log('Dry-run completed.');
      if (result.hasChanges) {
        console.log('Changes detected that would be applied to scripts/create_ga4_dimensions.sh.');
      } else {
        console.log('scripts/create_ga4_dimensions.sh is already up to date.');
      }
      process.exit(0);
    }

    if (result.hasChanges) {
      console.log('Successfully updated scripts/create_ga4_dimensions.sh with latest parameters.');
    } else {
      console.log('scripts/create_ga4_dimensions.sh is already up to date.');
    }
    process.exit(0);
  } catch (error) {
    console.error('Failed to synchronize GA4 dimensions:', error);
    process.exit(1);
  }
}
