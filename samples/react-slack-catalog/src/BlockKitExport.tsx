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
import {PreviewStatus, type PreviewSnapshot} from './preview-snapshot';

interface BlockKitExportProps {
  readonly snapshot: PreviewSnapshot;
}

/**
 * Shows the Slack Block Kit JSON for the current preview, with a button to copy
 * it. Each image drawn for a component, such as a chart, is in Slack's
 * uploaded-file form with the placeholder file ID `RENDERED_AT_SEND`, which the
 * app that sends the message replaces with the ID of the image it uploads.
 * Without drawn images, the JSON is ready to paste into Slack's Block Kit
 * Builder or an app.
 */
export function BlockKitExport({snapshot}: BlockKitExportProps) {
  const canCopy = snapshot.status === PreviewStatus.READY;
  const blockKitJson = useMemo(
    () => JSON.stringify({blocks: canCopy ? snapshot.exportBlocks : []}, null, 2),
    [canCopy, snapshot.exportBlocks],
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
