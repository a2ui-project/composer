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

CHECK_ONLY="${CHECK_ONLY:-true}"

for arg in "$@"; do
  case "$arg" in
    --check)
      CHECK_ONLY=true
      ;;
    --fix|--write)
      CHECK_ONLY=false
      ;;
  esac
done

# Get repo root
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

if [ "$CHECK_ONLY" = true ]; then
  echo "Checking Prettier formatting..."
  corepack yarn prettier:check
else
  echo "Fixing Prettier formatting..."
  corepack yarn prettier
fi

echo "Done."
