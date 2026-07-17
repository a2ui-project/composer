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

import {Injectable} from '@angular/core';
import {Catalog} from '../../../storage/models/catalog-storage.model';
import {CatalogSchemaResolver} from '../../../gallery/schema/catalog-schema-resolver';

/**
 * Describes a specific validation issue found within an A2UI JSON Line payload.
 */
export interface ValidationIssue {
  type: 'missing_version' | 'missing_root_id' | 'missing_required_field' | 'invalid_structure';
  message: string;
  componentId?: string;
  componentType?: string;
  field?: string;
}

/**
 * Result of executing client-side A2UI JSON Line validation.
 */
export interface A2UIValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  repairPrompt?: string;
}

/**
 * Client-Side Self-Healing Guardrail validating A2UI JSON Lines
 * (version: "v0.9", root id, required properties) and generating targeted
 * auto-repair prompts on failure.
 *
 * Token-saving rationale & Self-healing validation:
 * Performing strict schema validation locally on the client before rendering
 * allows composer to catch structural omissions (missing envelopes or required
 * component properties) without requiring full regeneration of the chat turn.
 * By constructing a concise, itemized repair prompt (`repairPrompt`), the client
 * enables a fast, single-turn self-healing loop with minimal token consumption.
 */
@Injectable({
  providedIn: 'root',
})
export class A2uiValidator {
  /**
   * Validates a sequence of parsed A2UI message payloads against A2UI JSON Line
   * envelope constraints and catalog required fields.
   *
   * High-level validation flow:
   * 1. Check array envelope and top-level block structure.
   * 2. Inspect updateComponents blocks and verify presence of root surface component.
   * 3. Verify all required properties defined by the catalog schema.
   * 4. Return validation results along with an itemized repair prompt if invalid.
   */
  validate(blocks: unknown[], catalog?: Catalog | null): A2UIValidationResult {
    // 1. Verify top-level envelope array structure and collect structural issues
    const {issues, validRecords} = this.validateEnvelopeStructure(blocks);

    if (issues.length > 0 && validRecords.length === 0) {
      return {
        isValid: false,
        issues,
        repairPrompt: this.formatRepairPrompt(issues),
      };
    }

    // 2. Prepare schema resolver and property cache to avoid duplicate resolutions
    const resolver = catalog ? new CatalogSchemaResolver(catalog) : null;
    const propertyCache = new Map<
      string,
      ReturnType<CatalogSchemaResolver['resolveComponentProperties']>
    >();

    let hasUpdateComponents = false;
    let hasRootComponent = false;

    // 3. Inspect every valid record for version envelope and component requirements
    for (const record of validRecords) {
      if (record['version'] !== 'v0.9') {
        issues.push({
          type: 'missing_version',
          message: 'Every A2UI JSON Line message must include top-level field version: "v0.9".',
        });
      }

      const updateComponents = record['updateComponents'];
      if (updateComponents && typeof updateComponents === 'object') {
        hasUpdateComponents = true;
        const rootFound = this.validateUpdateComponentsBlock(
          updateComponents as Record<string, unknown>,
          resolver,
          propertyCache,
          issues,
        );
        if (rootFound) {
          hasRootComponent = true;
        }
      }
    }

    // 4. Ensure an updateComponents payload includes the entry point surface root component
    if (hasUpdateComponents && !hasRootComponent) {
      issues.push({
        type: 'missing_root_id',
        message: 'updateComponents message must contain a component with id: "root".',
      });
    }

    const isValid = issues.length === 0;

    return {
      isValid,
      issues,
      repairPrompt: isValid ? undefined : this.formatRepairPrompt(issues),
    };
  }

  /**
   * Validates the structural integrity of the input blocks array, verifying
   * non-emptiness and object-level structure for each JSON line.
   */
  private validateEnvelopeStructure(blocks: unknown[]): {
    issues: ValidationIssue[];
    validRecords: Record<string, unknown>[];
  } {
    const issues: ValidationIssue[] = [];
    const validRecords: Record<string, unknown>[] = [];

    if (!Array.isArray(blocks) || blocks.length === 0) {
      issues.push({
        type: 'invalid_structure',
        message: 'Payload blocks must be a non-empty array of A2UI messages.',
      });
      return {issues, validRecords};
    }

    for (const block of blocks) {
      if (!block || typeof block !== 'object' || Array.isArray(block)) {
        issues.push({
          type: 'invalid_structure',
          message: 'Each JSON line must be a valid JSON object.',
        });
        continue;
      }
      validRecords.push(block as Record<string, unknown>);
    }

    return {issues, validRecords};
  }

  /**
   * Validates an updateComponents payload block, inspecting all declared components
   * for root id existence and required properties.
   *
   * @returns true if a component with id "root" was found in this block.
   */
  private validateUpdateComponentsBlock(
    ucRecord: Record<string, unknown>,
    resolver: CatalogSchemaResolver | null,
    propertyCache: Map<string, ReturnType<CatalogSchemaResolver['resolveComponentProperties']>>,
    issues: ValidationIssue[],
  ): boolean {
    let hasRootComponent = false;

    if (!Array.isArray(ucRecord['components'])) {
      return hasRootComponent;
    }

    for (const comp of ucRecord['components']) {
      if (!comp || typeof comp !== 'object' || Array.isArray(comp)) {
        continue;
      }

      const compRecord = comp as Record<string, unknown>;
      const compId = typeof compRecord['id'] === 'string' ? compRecord['id'] : undefined;
      const compType =
        typeof compRecord['component'] === 'string' ? compRecord['component'] : undefined;

      if (compId === 'root') {
        hasRootComponent = true;
      }

      if (resolver && compType) {
        this.validateComponentProperties(
          compRecord,
          compId,
          compType,
          resolver,
          propertyCache,
          issues,
        );
      }
    }

    return hasRootComponent;
  }

  /**
   * Validates a single component record against catalog-defined required properties,
   * caching resolved properties per component type for efficiency.
   */
  private validateComponentProperties(
    compRecord: Record<string, unknown>,
    compId: string | undefined,
    compType: string,
    resolver: CatalogSchemaResolver,
    propertyCache: Map<string, ReturnType<CatalogSchemaResolver['resolveComponentProperties']>>,
    issues: ValidationIssue[],
  ): void {
    let properties = propertyCache.get(compType);
    if (!properties) {
      properties = resolver.resolveComponentProperties(compType);
      propertyCache.set(compType, properties);
    }
    for (const prop of properties) {
      if (prop.required && compRecord[prop.name] === undefined) {
        issues.push({
          type: 'missing_required_field',
          message: `Component "${compType}" (id: "${compId ?? 'unknown'}") is missing required property "${prop.name}".`,
          componentId: compId,
          componentType: compType,
          field: prop.name,
        });
      }
    }
  }

  /**
   * Formats a concise auto-repair instruction prompt itemizing all found
   * validation issues so the LLM or self-healing guardrail can correct the
   * payload immediately.
   */
  private formatRepairPrompt(issues: ValidationIssue[]): string {
    if (issues.length === 0) {
      return '';
    }

    const itemized = issues.map((issue, idx) => `${idx + 1}. ${issue.message}`);

    return [
      'The generated A2UI JSON Lines failed strict schema validation with ' +
        'the following issues:',
      ...itemized,
      '',
      'Please repair the A2UI JSON Lines payload to resolve these exact ' +
        'issues. Ensure every line has top-level version: "v0.9", ' +
        'updateComponents contains a component with id: "root", and all ' +
        'required component properties are provided.',
    ].join('\n');
  }
}
