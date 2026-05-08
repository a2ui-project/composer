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

set -euo pipefail

CHECK_ONLY=false
if [[ "${1:-}" == "--check" ]]; then
  CHECK_ONLY=true
fi

# Get repo root
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "Running Prettier..."
if [ "$CHECK_ONLY" = true ]; then
  npx -y prettier --config .prettierrc --check .
else
  npx -y prettier --config .prettierrc --write .
fi

echo "Done."
