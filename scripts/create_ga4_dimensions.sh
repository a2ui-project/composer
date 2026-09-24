#!/usr/bin/env bash
# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ==============================================================================
# Script: create_ga4_dimensions.sh
# Purpose: Idempotently create GA4 Custom Dimensions & Custom Metrics for
#          GA4 Property 549078235 via Google Analytics Admin API v1beta.
# ==============================================================================
set -euo pipefail

PROPERTY_ID="549078235"
API_BASE="https://analyticsadmin.googleapis.com/v1beta/properties/${PROPERTY_ID}"
REQUIRED_SCOPE="https://www.googleapis.com/auth/analytics.edit"

echo "=== GA4 Custom Dimensions & Metrics Provisioning ==="
echo "Target Property: properties/${PROPERTY_ID}"

# ------------------------------------------------------------------------------
# 1. Resolve Access Token
# ------------------------------------------------------------------------------
TOKEN="${ACCESS_TOKEN:-}"

if [[ -z "${TOKEN}" ]]; then
  if command -v gcloud >/dev/null 2>&1; then
    echo "Querying gcloud for access token..."
    TOKEN=$(gcloud auth print-access-token 2>/dev/null || true)
    if [[ -z "${TOKEN}" ]]; then
      TOKEN=$(gcloud auth application-default print-access-token 2>/dev/null || true)
    fi
  fi
fi

test_token() {
  local tok="$1"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer ${tok}" "${API_BASE}/customDimensions")
  if [[ "${code}" == "200" ]]; then
    return 0
  else
    return 1
  fi
}

if [[ -n "${TOKEN}" ]] && test_token "${TOKEN}"; then
  echo "Valid access token verified against GA4 Admin API."
else
  echo ""
  echo "No valid OAuth access token found with access to properties/${PROPERTY_ID}."
  echo ""
  if ! command -v gcloud >/dev/null 2>&1; then
    echo "Note: 'gcloud' is not currently installed on this system."
    echo "To install google-cloud-cli on gLinux/Debian:"
    echo "  sudo apt-get update && sudo apt-get install -y google-cloud-cli"
    echo ""
  fi
  echo "To authenticate, run either:"
  echo "  gcloud auth application-default login --scopes=${REQUIRED_SCOPE}"
  echo "  or"
  echo "  gcloud auth login --scopes=${REQUIRED_SCOPE}"
  echo ""
  echo "Then re-run this script, or export ACCESS_TOKEN:"
  echo "  export ACCESS_TOKEN=\"\$(gcloud auth print-access-token)\""
  echo "  $0"
  echo ""
  if [[ -t 0 ]]; then
    read -r -p "Enter OAuth Access Token (or Ctrl+C to abort): " MANUAL_TOKEN
    TOKEN="${MANUAL_TOKEN}"
    if ! test_token "${TOKEN}"; then
      echo "Error: The provided token is invalid or does not have access to properties/${PROPERTY_ID}." >&2
      exit 1
    fi
  else
    echo "Error: Non-interactive shell and no valid active token found." >&2
    exit 1
  fi
fi

# ------------------------------------------------------------------------------
# 2. Fetch Existing Custom Dimensions and Custom Metrics
# ------------------------------------------------------------------------------
echo ""
echo "Fetching existing custom dimensions and metrics..."

EXISTING_DIMS=$(curl -s -H "Authorization: Bearer ${TOKEN}" -H "Content-Type: application/json" "${API_BASE}/customDimensions?pageSize=200")
EXISTING_METS=$(curl -s -H "Authorization: Bearer ${TOKEN}" -H "Content-Type: application/json" "${API_BASE}/customMetrics?pageSize=200")

dimension_exists() {
  local param="$1"
  echo "${EXISTING_DIMS}" | grep -q "\"parameterName\": \"${param}\""
}

metric_exists() {
  local param="$1"
  echo "${EXISTING_METS}" | grep -q "\"parameterName\": \"${param}\""
}

# ------------------------------------------------------------------------------
# 3. Create Custom Dimensions
# ------------------------------------------------------------------------------
FAILURES=0

create_dimension() {
  local param="$1"
  local display="$2"
  local desc="$3"

  if dimension_exists "${param}"; then
    echo "  [EXISTS] Dimension '${param}' already exists. Skipping."
    return 0
  fi

  echo -n "  [CREATING] Dimension '${param}' (${display})... "
  local payload
  payload=$(cat <<EOF
{
  "parameterName": "${param}",
  "displayName": "${display}",
  "description": "${desc}",
  "scope": "EVENT"
}
EOF
)

  local resp
  local http_code
  resp=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "${payload}" \
    "${API_BASE}/customDimensions")

  http_code=$(echo "${resp}" | tail -n1)
  local body
  body=$(echo "${resp}" | sed '$d')

  if [[ "${http_code}" == "200" ]]; then
    echo "SUCCESS (200)"
  elif [[ "${http_code}" == "409" ]] || echo "${body}" | grep -q "ALREADY_EXISTS"; then
    echo "ALREADY_EXISTS (409) - Skipped"
  else
    echo "FAILED (${http_code}): ${body}" >&2
    FAILURES=$((FAILURES + 1))
  fi
}

# ------------------------------------------------------------------------------
# 4. Create Custom Metrics
# ------------------------------------------------------------------------------
create_metric() {
  local param="$1"
  local display="$2"
  local unit="$3"
  local desc="$4"

  if metric_exists "${param}"; then
    echo "  [EXISTS] Metric '${param}' already exists. Skipping."
    return 0
  fi

  echo -n "  [CREATING] Metric '${param}' (${display}, ${unit})... "
  local payload
  payload=$(cat <<EOF
{
  "parameterName": "${param}",
  "displayName": "${display}",
  "description": "${desc}",
  "measurementUnit": "${unit}",
  "scope": "EVENT"
}
EOF
)

  local resp
  local http_code
  resp=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "${payload}" \
    "${API_BASE}/customMetrics")

  http_code=$(echo "${resp}" | tail -n1)
  local body
  body=$(echo "${resp}" | sed '$d')

  if [[ "${http_code}" == "200" ]]; then
    echo "SUCCESS (200)"
  elif [[ "${http_code}" == "409" ]] || echo "${body}" | grep -q "ALREADY_EXISTS"; then
    echo "ALREADY_EXISTS (409) - Skipped"
  else
    echo "FAILED (${http_code}): ${body}" >&2
    FAILURES=$((FAILURES + 1))
  fi
}

echo ""
echo "--- Provisioning Custom Dimensions ---"
#### BEGIN DIMENSIONS -- DO NOT EDIT
create_dimension "env_mode" "Environment Mode" "Distinguishes standalone, plugin, or extension mode"
create_dimension "usage_type" "Usage Type" "Distinguishes 1P vs 3P usage"
create_dimension "active_renderer_id" "Active Renderer ID" "Selected component catalog renderer ID"
create_dimension "catalog_id" "Active Catalog ID" "Active component schema catalog ID"
create_dimension "composer_session_id" "Composer Session ID" "Unique session UUID"
create_dimension "turn_type" "Prompt Turn Type" "initial vs followup prompt turn"
create_dimension "has_screenshot" "Prompt Has Screenshot" "Whether prompt included a screenshot"
create_dimension "prompt_id" "Prompt ID" "Unique prompt turn ID"
create_dimension "retry_of_prompt_id" "Retry Of Prompt ID" "Original prompt ID being retried"
create_dimension "pipeline_status_at_cancel" "Pipeline Status at Cancel" "Pipeline status when generation canceled"
create_dimension "status" "Share Status" "Outcome of sharing design link"
create_dimension "theme" "UI Theme" "Selected UI theme"
create_dimension "component_key" "Gallery Component Key" "Selected gallery component key"
create_dimension "category" "Gallery Category" "Selected gallery component category"
create_dimension "from_renderer_id" "From Renderer ID" "Prior renderer before switch"
create_dimension "to_renderer_id" "To Renderer ID" "Target renderer after switch"
create_dimension "renderer_id" "Renderer ID" "Target renderer added/edited/deleted"
create_dimension "is_valid_json" "Is Valid JSON" "Whether manual JSON edit is valid"
create_dimension "tab_id" "Debug Tab ID" "Debug panel tab opened"
create_dimension "message_type" "Raw Message Type" "Raw inspector message type expanded"
create_dimension "action" "API Key Action" "API key action taken"
create_dimension "error_category" "Error Category" "Functional error category"
create_dimension "source_tag" "Error Source Tag" "Subsystem emitting error"
create_dimension "invalid_property" "Error Invalid Property" "Schema property failing validation"
create_dimension "error_type" "Error Type" "Functional error type classification"
#### END DIMENSIONS

echo ""
echo "--- Provisioning Custom Metrics ---"
#### BEGIN METRICS -- DO NOT EDIT
create_metric "duration_seconds" "Conversation Duration" "SECONDS" "Active engagement time in seconds"
create_metric "interface_count" "Interface Count" "STANDARD" "Number of A2UI interfaces rendered"
create_metric "turn_index" "Turn Index" "STANDARD" "Zero-based index of chat turn"
create_metric "attempt_number" "Attempt Number" "STANDARD" "Attempt count for prompt turn"
create_metric "attachment_count" "Attachment Count" "STANDARD" "Number of attachments on prompt"
create_metric "total_prompt_turns" "Total Prompt Turns" "STANDARD" "Total turns before session reset"
create_metric "compressed_length_chars" "Share Compressed Length" "STANDARD" "Character length of compressed share payload"
create_metric "line" "Error Line Number" "STANDARD" "Line number of error"
create_metric "column" "Error Column Number" "STANDARD" "Column offset of error"
#### END METRICS

if [[ ${FAILURES} -gt 0 ]]; then
  echo "Error: ${FAILURES} dimension/metric provisioning requests failed." >&2
  exit 1
fi

echo ""
echo "=== Provisioning Complete ==="

