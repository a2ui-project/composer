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

import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  parseExistingScript,
  extractParametersFromSource,
  classifyParameter,
  mergeDefinitions,
  generateScriptContent,
  generateBashScript,
  syncDimensions,
  escapeBashString,
  unescapeBashString,
  formatHelpText,
  DIMENSIONS_START,
  DIMENSIONS_END,
  METRICS_START,
  METRICS_END,
} from './update_ga4_dimensions.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const SCRIPT_PATH = path.resolve(__dirname, 'create_ga4_dimensions.sh');
const SERVICE_PATH = path.resolve(
  REPO_ROOT,
  'shell/src/app/usage-tracking/ga4-usage-tracking.service.ts',
);

describe('update_ga4_dimensions', () => {
  describe('a) Extraction of existing definitions from create_ga4_dimensions.sh', () => {
    it('extracts existing custom dimensions with exact display names and descriptions', () => {
      const scriptContent = fs.readFileSync(SCRIPT_PATH, 'utf-8');
      const {dimensions} = parseExistingScript(scriptContent);

      assert.ok(dimensions.has('env_mode'), 'Expected env_mode to be present');
      assert.deepEqual(dimensions.get('env_mode'), {
        paramName: 'env_mode',
        displayName: 'Environment Mode',
        description: 'Distinguishes standalone, plugin, or extension mode',
      });

      assert.ok(dimensions.has('composer_session_id'));
      assert.equal(dimensions.get('composer_session_id').displayName, 'Composer Session ID');

      assert.ok(dimensions.has('invalid_property'));
      assert.deepEqual(dimensions.get('invalid_property'), {
        paramName: 'invalid_property',
        displayName: 'Error Invalid Property',
        description: 'Schema property failing validation',
      });
    });

    it('extracts existing custom metrics with measurement units and descriptions', () => {
      const scriptContent = fs.readFileSync(SCRIPT_PATH, 'utf-8');
      const {metrics} = parseExistingScript(scriptContent);

      assert.ok(metrics.has('duration_seconds'));
      assert.deepEqual(metrics.get('duration_seconds'), {
        paramName: 'duration_seconds',
        displayName: 'Conversation Duration',
        measurementUnit: 'SECONDS',
        description: 'Active engagement time in seconds',
      });

      assert.ok(metrics.has('interface_count'));
      assert.deepEqual(metrics.get('interface_count'), {
        paramName: 'interface_count',
        displayName: 'Interface Count',
        measurementUnit: 'STANDARD',
        description: 'Number of A2UI interfaces rendered',
      });

      assert.ok(metrics.has('line'));
      assert.equal(metrics.get('line').measurementUnit, 'STANDARD');
      assert.ok(metrics.has('column'));
      assert.equal(metrics.get('column').measurementUnit, 'STANDARD');
    });
  });

  describe('b) Source code extraction of telemetry parameters', () => {
    it('extracts baseline dimensions and event parameters while excluding standard GA4 parameters', () => {
      const sourceContent = fs.readFileSync(SERVICE_PATH, 'utf-8');
      const params = extractParametersFromSource(sourceContent);

      // Baseline dimensions
      assert.ok(params.has('composer_session_id'), 'Expected composer_session_id');
      assert.ok(params.has('usage_type'), 'Expected usage_type');
      assert.ok(params.has('env_mode'), 'Expected env_mode');
      assert.ok(params.has('active_renderer_id'), 'Expected active_renderer_id');
      assert.ok(params.has('catalog_id'), 'Expected catalog_id');

      // Event parameters
      assert.ok(params.has('prompt_id'), 'Expected prompt_id');
      assert.ok(params.has('duration_seconds'), 'Expected duration_seconds');
      assert.ok(params.has('turn_index'), 'Expected turn_index');
      assert.ok(params.has('is_valid_json'), 'Expected is_valid_json');

      // Error telemetry customParams
      assert.ok(params.has('error_type'), 'Expected error_type from customParams');
      assert.ok(params.has('error_category'), 'Expected error_category');
      assert.ok(params.has('source_tag'), 'Expected source_tag');
      assert.ok(params.has('line'), 'Expected line');
      assert.ok(params.has('column'), 'Expected column');
      assert.ok(params.has('invalid_property'), 'Expected invalid_property');

      // Excluded standard GA4 parameters
      assert.ok(!params.has('send_to'), 'send_to should be excluded');
      assert.ok(!params.has('page_path'), 'page_path should be excluded');
      assert.ok(!params.has('event_category'), 'event_category should be excluded');
      assert.ok(!params.has('event_label'), 'event_label should be excluded');

      // Excluded gtag config options
      assert.ok(!params.has('send_page_view'), 'send_page_view should be excluded');
      assert.ok(!params.has('cookie_prefix'), 'cookie_prefix should be excluded');
      assert.ok(!params.has('cookie_domain'), 'cookie_domain should be excluded');
      assert.ok(!params.has('client_id'), 'client_id should be excluded');
    });

    it('extracts bracketed, quoted, and unquoted snake_case keys from dispatchGtagEvent payloads without capturing TypeScript parameter annotations', () => {
      const mockSource = `
        trackCustomAction(params: { actionName: string; duration_seconds: number }): void {
          const customParams = {
            unquoted_param: 'foo',
            'quoted_param': 'bar',
            ['bracketed_param']: 'baz',
            line: 42,
          };
          this.dispatchGtagEvent('custom_event', {
            ['new_dim']: 'val1',
            new_unquoted_dim: 'val2',
            'another_dim': 'val3',
            column: 12,
            ...customParams,
          });
        }
      `;
      const extracted = extractParametersFromSource(mockSource);

      assert.ok(extracted.has('new_dim'), 'Expected bracketed new_dim to be extracted');
      assert.ok(
        extracted.has('new_unquoted_dim'),
        'Expected unquoted new_unquoted_dim to be extracted',
      );
      assert.ok(extracted.has('another_dim'), 'Expected quoted another_dim to be extracted');
      assert.ok(
        extracted.has('unquoted_param'),
        'Expected customParams unquoted_param to be extracted',
      );
      assert.ok(
        extracted.has('quoted_param'),
        'Expected customParams quoted_param to be extracted',
      );
      assert.ok(
        extracted.has('bracketed_param'),
        'Expected customParams bracketed_param to be extracted',
      );
      assert.ok(extracted.has('line'), 'Expected line metric to be extracted');
      assert.ok(extracted.has('column'), 'Expected column metric to be extracted');

      // Make sure TypeScript parameter annotation like 'params:' or type name is not extracted
      assert.ok(
        !extracted.has('params'),
        'TypeScript parameter annotation "params" should not be extracted',
      );
      assert.ok(
        !extracted.has('actionName'),
        'CamelCase parameter should not be extracted as snake_case parameter',
      );
    });

    it('extracts parameters from customParams declared with TypeScript type annotations', () => {
      const mockSource = `
        trackTypedError(params: ComposerErrorTelemetryParams): void {
          const customParams: Record<string, unknown> = {
            ['typed_error_category']: params.errorCategory,
            typed_error_source: params.sourceTag,
            'typed_error_code': 'ERR_404',
          };
          this.dispatchGtagEvent('composer_error', customParams);
        }
      `;
      const extracted = extractParametersFromSource(mockSource);
      assert.ok(
        extracted.has('typed_error_category'),
        'Expected typed_error_category from typed customParams',
      );
      assert.ok(
        extracted.has('typed_error_source'),
        'Expected typed_error_source from typed customParams',
      );
      assert.ok(
        extracted.has('typed_error_code'),
        'Expected typed_error_code from typed customParams',
      );
    });

    it('never extracts config options from non-telemetry methods like getConfigOptions', () => {
      const mockSource = `
        protected getConfigOptions(): Record<string, unknown> {
          const hostname = this.document.defaultView?.location?.hostname;
          return {
            ['send_page_view']: false,
            ['cookie_prefix']: 'a2ui_composer',
            ['cookie_domain']: hostname || 'auto',
            ['client_id']: this.getOrCreatePersistentClientId(),
            ['non_excluded_config_option']: 'value',
          };
        }
      `;
      const extracted = extractParametersFromSource(mockSource);
      assert.equal(extracted.size, 0, 'No parameters should be extracted from getConfigOptions');
      assert.ok(!extracted.has('non_excluded_config_option'));
    });

    it('does not let JSDoc comments mentioning getBaselineDimensions break extraction of the real method', () => {
      const mockSource = `
        /**
         * Comments describing getBaselineDimensions() with dummy ['commented_param']: 123
         */
        protected getBaselineDimensions(): Record<string, unknown> {
          return {
            ['actual_baseline_param']: 'test',
          };
        }
      `;
      const extracted = extractParametersFromSource(mockSource);
      assert.ok(extracted.has('actual_baseline_param'));
      assert.ok(!extracted.has('commented_param'));
    });
  });

  describe('c) Parameter classification', () => {
    it('classifies seconds duration parameters as Custom Metrics with SECONDS unit', () => {
      const result = classifyParameter('duration_seconds');
      assert.deepEqual(result, {
        type: 'METRIC',
        measurementUnit: 'SECONDS',
        scope: 'EVENT',
      });
    });

    it('classifies numeric suffixes as Custom Metrics with STANDARD unit', () => {
      const numericParams = [
        'interface_count',
        'attachment_count',
        'compressed_length_chars',
        'total_prompt_turns',
        'turn_index',
        'attempt_number',
        'line',
        'column',
      ];

      for (const param of numericParams) {
        const result = classifyParameter(param);
        assert.deepEqual(
          result,
          {
            type: 'METRIC',
            measurementUnit: 'STANDARD',
            scope: 'EVENT',
          },
          `Expected ${param} to be classified as STANDARD METRIC`,
        );
      }
    });

    it('classifies categorical / string parameters as Custom Dimensions with EVENT scope', () => {
      const dimensionParams = [
        'env_mode',
        'usage_type',
        'active_renderer_id',
        'catalog_id',
        'composer_session_id',
        'turn_type',
        'has_screenshot',
        'prompt_id',
        'retry_of_prompt_id',
        'pipeline_status_at_cancel',
        'status',
        'theme',
        'component_key',
        'category',
        'from_renderer_id',
        'to_renderer_id',
        'renderer_id',
        'is_valid_json',
        'tab_id',
        'message_type',
        'action',
        'error_category',
        'error_type',
        'source_tag',
        'invalid_property',
      ];

      for (const param of dimensionParams) {
        const result = classifyParameter(param);
        assert.deepEqual(
          result,
          {
            type: 'DIMENSION',
            scope: 'EVENT',
          },
          `Expected ${param} to be classified as EVENT DIMENSION`,
        );
      }
    });
  });

  describe('d) Idempotent regeneration and --check / --dry-run support', () => {
    it('merges definitions preserving existing metadata and discovering new parameters', () => {
      const scriptContent = fs.readFileSync(SCRIPT_PATH, 'utf-8');
      const existing = parseExistingScript(scriptContent);
      const extractedParams = new Set(['env_mode', 'duration_seconds', 'error_type']);

      const merged = mergeDefinitions(existing, extractedParams);

      // Existing metadata preserved
      assert.equal(
        merged.dimensions.find(d => d.paramName === 'env_mode')?.displayName,
        'Environment Mode',
      );
      assert.equal(
        merged.metrics.find(m => m.paramName === 'duration_seconds')?.measurementUnit,
        'SECONDS',
      );

      // New parameter error_type discovered and added to dimensions
      const errorTypeDef = merged.dimensions.find(d => d.paramName === 'error_type');
      assert.ok(errorTypeDef, 'error_type should be added to dimensions');
      assert.equal(errorTypeDef.displayName, 'Error Type');
    });

    it('generates bash script content idempotently', () => {
      const scriptContent = fs.readFileSync(SCRIPT_PATH, 'utf-8');
      const existing = parseExistingScript(scriptContent);
      const merged = mergeDefinitions(existing, new Set(existing.dimensions.keys()));

      const generated1 = generateScriptContent(scriptContent, merged);
      const existingAgain = parseExistingScript(generated1);
      const mergedAgain = mergeDefinitions(existingAgain, new Set(existingAgain.dimensions.keys()));
      const generated2 = generateScriptContent(generated1, mergedAgain);

      assert.equal(generated1, generated2, 'Regeneration should be strictly idempotent');
    });

    it('supports dry-run mode without modifying file on disk', () => {
      const initialContent = fs.readFileSync(SCRIPT_PATH, 'utf-8');
      const result = syncDimensions({
        scriptPath: SCRIPT_PATH,
        sourcePath: SERVICE_PATH,
        dryRun: true,
      });

      assert.ok(result.hasChanges !== undefined);
      const afterContent = fs.readFileSync(SCRIPT_PATH, 'utf-8');
      assert.equal(afterContent, initialContent, 'dry-run must not modify file');
    });

    it('supports check mode returning difference status', () => {
      const result = syncDimensions({
        scriptPath: SCRIPT_PATH,
        sourcePath: SERVICE_PATH,
        check: true,
      });

      assert.ok(typeof result.isUpToDate === 'boolean');
    });

    it('prunes obsolete dimensions and metrics from existing definitions when no longer in extractedParams', () => {
      const existing = {
        dimensions: new Map([
          [
            'active_dim',
            {
              paramName: 'active_dim',
              displayName: 'Curated Active Dim',
              description: 'Custom curated description',
            },
          ],
          [
            'stale_dim',
            {
              paramName: 'stale_dim',
              displayName: 'Stale Dim',
              description: 'Should be removed',
            },
          ],
        ]),
        metrics: new Map([
          [
            'active_metric',
            {
              paramName: 'active_metric',
              displayName: 'Curated Active Metric',
              measurementUnit: 'STANDARD',
              description: 'Custom metric description',
            },
          ],
          [
            'stale_metric',
            {
              paramName: 'stale_metric',
              displayName: 'Stale Metric',
              measurementUnit: 'SECONDS',
              description: 'Should be removed',
            },
          ],
        ]),
      };

      const extractedParams = new Set(['active_dim', 'active_metric', 'brand_new_dim']);
      const merged = mergeDefinitions(existing, extractedParams);

      // Pruning verification
      assert.equal(merged.dimensions.length, 2);
      assert.equal(merged.metrics.length, 1);
      assert.ok(!merged.dimensions.some(d => d.paramName === 'stale_dim'));
      assert.ok(!merged.metrics.some(m => m.paramName === 'stale_metric'));

      // Preserved curated metadata
      const activeDim = merged.dimensions.find(d => d.paramName === 'active_dim');
      assert.equal(activeDim?.displayName, 'Curated Active Dim');
      assert.equal(activeDim?.description, 'Custom curated description');

      const activeMetric = merged.metrics.find(m => m.paramName === 'active_metric');
      assert.equal(activeMetric?.displayName, 'Curated Active Metric');

      // Newly discovered param
      const brandNewDim = merged.dimensions.find(d => d.paramName === 'brand_new_dim');
      assert.ok(brandNewDim);
      assert.deepEqual(merged.addedDimensions, ['brand_new_dim']);
      assert.deepEqual(merged.addedMetrics, []);
    });

    it('returns isUpToDate false when a stale parameter exists in the script', () => {
      const scriptWithStale = `#!/usr/bin/env bash
${DIMENSIONS_START}
create_dimension "stale_parameter_that_does_not_exist" "Stale" "Desc"
${DIMENSIONS_END}
${METRICS_START}
${METRICS_END}
`;
      const tempScript = path.resolve(__dirname, 'temp_stale_test.sh');
      fs.writeFileSync(tempScript, scriptWithStale, 'utf-8');
      try {
        const result = syncDimensions({
          scriptPath: tempScript,
          sourcePath: SERVICE_PATH,
          check: true,
        });
        assert.equal(result.isUpToDate, false);
        assert.equal(result.hasChanges, true);
      } finally {
        if (fs.existsSync(tempScript)) {
          fs.unlinkSync(tempScript);
        }
      }
    });

    it('mergeDefinitions tracks added parameters explicitly', () => {
      const scriptContent = fs.readFileSync(SCRIPT_PATH, 'utf-8');
      const existing = parseExistingScript(scriptContent);
      const extractedParams = new Set([
        ...existing.dimensions.keys(),
        ...existing.metrics.keys(),
        'new_test_param',
      ]);

      const merged = mergeDefinitions(existing, extractedParams);

      assert.ok(Array.isArray(merged.dimensions));
      assert.ok(Array.isArray(merged.metrics));
      assert.ok(Array.isArray(merged.addedDimensions));
      assert.ok(Array.isArray(merged.addedMetrics));
      assert.deepEqual(merged.addedDimensions, ['new_test_param']);
      assert.deepEqual(merged.addedMetrics, []);
    });
  });

  describe('e) Generated Bash script structure, error handling, and parameters', () => {
    it('generates bash script with correct scopes, pageSize, failure tracking, and error routing', () => {
      const script = generateBashScript();

      // Scopes hint
      assert.ok(
        script.includes('gcloud auth login --scopes=${REQUIRED_SCOPE}'),
        'Must recommend gcloud auth login with explicit REQUIRED_SCOPE',
      );
      assert.ok(
        !script.includes('--enable-gdrive-access'),
        'Must not contain outdated --enable-gdrive-access flag',
      );

      // Page size
      assert.ok(
        script.includes('${API_BASE}/customDimensions?pageSize=200'),
        'Must fetch custom dimensions with pageSize=200',
      );
      assert.ok(
        script.includes('${API_BASE}/customMetrics?pageSize=200'),
        'Must fetch custom metrics with pageSize=200',
      );

      // Error handling and failure tracking
      assert.ok(script.includes('FAILURES=0'), 'Must initialize FAILURES counter');
      assert.ok(
        script.includes('FAILURES=$((FAILURES + 1))'),
        'Must increment FAILURES on HTTP failure',
      );
      assert.ok(
        script.includes('echo "FAILED (${http_code}): ${body}" >&2'),
        'Must route HTTP failure output to stderr',
      );
      assert.ok(
        script.includes('if [[ ${FAILURES} -gt 0 ]]; then'),
        'Must check for failures before completion',
      );
      assert.ok(script.includes('exit 1'), 'Must exit with code 1 if failures occurred');
    });
  });

  describe('f) Sentinel-scoped parsing and surgical replacement', () => {
    it('parses only calls inside sentinel blocks and ignores calls outside sentinels', () => {
      const scriptWithSentinels = `
        create_dimension "ignored_outer_dim" "Ignored" "Outside sentinels"
        ${DIMENSIONS_START}
        create_dimension "valid_dim" "Valid Dimension" "Inside sentinels"
        ${DIMENSIONS_END}
        create_metric "ignored_outer_metric" "Ignored" "STANDARD" "Outside sentinels"
        ${METRICS_START}
        create_metric "valid_metric" "Valid Metric" "SECONDS" "Inside sentinels"
        ${METRICS_END}
      `;

      const parsed = parseExistingScript(scriptWithSentinels);
      assert.ok(parsed.dimensions.has('valid_dim'));
      assert.ok(!parsed.dimensions.has('ignored_outer_dim'));
      assert.ok(parsed.metrics.has('valid_metric'));
      assert.ok(!parsed.metrics.has('ignored_outer_metric'));
    });

    it('surgically replaces lines between sentinels while preserving all external code', () => {
      const originalScript = `#!/usr/bin/env bash
# Header comment that must be preserved
PRE_VAR="untouched"

${DIMENSIONS_START}
create_dimension "old_dim" "Old Dim" "Desc"
${DIMENSIONS_END}

# Intermediate code that must be preserved
INTERMEDIATE="untouched"

${METRICS_START}
create_metric "old_metric" "Old Metric" "STANDARD" "Desc"
${METRICS_END}

# Footer comment that must be preserved
POST_VAR="untouched"
`;

      const newDefinitions = {
        dimensions: [{paramName: 'new_dim', displayName: 'New Dim', description: 'New Dim Desc'}],
        metrics: [
          {
            paramName: 'new_metric',
            displayName: 'New Metric',
            measurementUnit: 'SECONDS',
            description: 'New Met Desc',
          },
        ],
      };

      const updated = generateScriptContent(originalScript, newDefinitions);

      assert.ok(updated.includes('PRE_VAR="untouched"'));
      assert.ok(updated.includes('INTERMEDIATE="untouched"'));
      assert.ok(updated.includes('POST_VAR="untouched"'));
      assert.ok(updated.includes('create_dimension "new_dim" "New Dim" "New Dim Desc"'));
      assert.ok(
        updated.includes('create_metric "new_metric" "New Metric" "SECONDS" "New Met Desc"'),
      );
      assert.ok(!updated.includes('old_dim'));
      assert.ok(!updated.includes('old_metric'));
    });

    it('defensively escapes double quotes and preserves round-trip idempotency across parse and generate', () => {
      assert.equal(escapeBashString('Hello "World"'), 'Hello \\"World\\"');
      assert.equal(escapeBashString('Hello \\"World\\"'), 'Hello \\"World\\"');
      assert.equal(unescapeBashString('Hello \\"World\\"'), 'Hello "World"');

      const scriptWithQuotes = `#!/usr/bin/env bash
${DIMENSIONS_START}
create_dimension "quote_param" "Display \\"Name\\"" "Description with \\"quotes\\" inside"
${DIMENSIONS_END}

${METRICS_START}
create_metric "quote_metric" "Metric \\"Duration\\"" "SECONDS" "Time in \\"seconds\\""
${METRICS_END}
`;

      const parsed = parseExistingScript(scriptWithQuotes);
      const dim = parsed.dimensions.get('quote_param');
      assert.equal(dim?.displayName, 'Display "Name"');
      assert.equal(dim?.description, 'Description with "quotes" inside');

      const met = parsed.metrics.get('quote_metric');
      assert.equal(met?.displayName, 'Metric "Duration"');
      assert.equal(met?.description, 'Time in "seconds"');

      // Regenerate and verify escaped quotes in output
      const generated = generateScriptContent(scriptWithQuotes, {
        dimensions: Array.from(parsed.dimensions.values()),
        metrics: Array.from(parsed.metrics.values()),
      });

      assert.ok(
        generated.includes(
          'create_dimension "quote_param" "Display \\"Name\\"" "Description with \\"quotes\\" inside"',
        ),
      );
      assert.ok(
        generated.includes(
          'create_metric "quote_metric" "Metric \\"Duration\\"" "SECONDS" "Time in \\"seconds\\""',
        ),
      );

      // Re-parse the generated content and verify exact match
      const reParsed = parseExistingScript(generated);
      assert.deepEqual(reParsed.dimensions.get('quote_param'), dim);
      assert.deepEqual(reParsed.metrics.get('quote_metric'), met);

      // Re-generate and verify identical string output (100% idempotent)
      const reGenerated = generateScriptContent(generated, {
        dimensions: Array.from(reParsed.dimensions.values()),
        metrics: Array.from(reParsed.metrics.values()),
      });
      assert.equal(generated, reGenerated);
    });
  });

  describe('g) --help and -h CLI execution', () => {
    it('returns formatted help text with formatHelpText', () => {
      const help = formatHelpText();
      assert.ok(help.includes('--check'));
      assert.ok(help.includes('--dry-run'));
      assert.ok(help.includes('-h, --help'));
    });

    it('prints help text and exits with code 0 on --help and -h flags', () => {
      const scriptFile = path.resolve(__dirname, 'update_ga4_dimensions.mjs');

      const outHelp = execFileSync(process.execPath, [scriptFile, '--help'], {
        encoding: 'utf-8',
      });
      assert.ok(outHelp.includes('Usage: node scripts/update_ga4_dimensions.mjs [options]'));
      assert.ok(outHelp.includes('--check'));

      const outH = execFileSync(process.execPath, [scriptFile, '-h'], {
        encoding: 'utf-8',
      });
      assert.ok(outH.includes('Usage: node scripts/update_ga4_dimensions.mjs [options]'));
      assert.ok(outH.includes('--dry-run'));
    });
  });
});
