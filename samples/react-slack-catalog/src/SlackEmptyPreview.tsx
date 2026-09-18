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

import {type ThemePreference} from 'a2ui-bridge';
import {Message, type Block} from 'slack-blocks-to-jsx';

const EXAMPLE_BLOCKS: Block[] = [
  {type: 'header', text: {type: 'plain_text', text: 'Project update'}},
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: '*Ready for review*\nThe latest designs are ready for your team’s feedback.',
    },
  },
  {
    type: 'actions',
    elements: [
      {type: 'button', text: {type: 'plain_text', text: 'Approve update'}, style: 'primary'},
    ],
  },
];

export function SlackEmptyPreview({theme}: {readonly theme?: ThemePreference}) {
  return (
    <div className="slack-preview-empty" role="status" aria-live="polite">
      <div className="slack-preview-empty-content">
        <figure
          className="slack-preview-example"
          aria-label="Read-only example Slack message: a project update with an approval button."
        >
          <figcaption>Example preview</figcaption>
          <div inert aria-hidden="true">
            <Message blocks={EXAMPLE_BLOCKS} logo="" name="" withoutWrapper theme={theme} />
          </div>
        </figure>
        <h2>Your Slack preview starts here</h2>
        <p>Describe a message in the assistant, or open an example from the Gallery.</p>
      </div>
    </div>
  );
}
