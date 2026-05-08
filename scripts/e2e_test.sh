#!/bin/bash
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

# About this script:
#
# This script runs all the tests that use non-stubbed AI models and thus require API key.
# It is invoked by GitHub Actions. But, it cannot be invoked by GitHub for fork branches.
#
# If your PR is from forked branch, please, run this script locally before merging.
# If the script fails both locally and on the main branch, # file an issue and
# link in your PR.
#
# To run script locally, you need to set API key as an environment variable.
# Example: export GEMINI_API_KEY=your_api_key

echo "Triggering integration tests..."
npx playwright test
