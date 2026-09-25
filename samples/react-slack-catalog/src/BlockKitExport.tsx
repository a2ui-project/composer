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

import {useEffect, useMemo, useState} from 'react';
import {type PreviewSnapshot} from './preview-session';

interface BlockKitExportProps {
  readonly snapshot: PreviewSnapshot;
}

export function BlockKitExport({snapshot}: BlockKitExportProps) {
  const canCopy = snapshot.status === 'ready';
  const blockKitJson = useMemo(
    () =>
      JSON.stringify(
        {
          blocks: canCopy ? snapshot.blocks : [],
        },
        null,
        2,
      ),
    [canCopy, snapshot.blocks],
  );
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => {
    setCopyStatus('');
  }, [blockKitJson]);

  const copyBlockKit = async () => {
    if (!canCopy) {
      return;
    }

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable');
      }
      await navigator.clipboard.writeText(blockKitJson);
      setCopyStatus('Block Kit copied.');
    } catch {
      setCopyStatus('Clipboard unavailable. Select and copy the JSON below.');
    }
  };

  return (
    <details>
      <summary>Generated Block Kit</summary>
      <button type="button" disabled={!canCopy} onClick={copyBlockKit}>
        Copy Block Kit
      </button>
      <p role="status" aria-live="polite">
        {copyStatus}
      </p>
      <pre data-testid="block-kit-json" tabIndex={0}>
        {blockKitJson}
      </pre>
    </details>
  );
}
