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

import {A2uiMessageListSchema} from '@a2ui/web_core/v0_9';
import {afterEach, describe, expect, it} from 'vitest';
import bookingExample from '../public/examples/car-booking.json';
import config from '../../../shell/src/config.json';
import {createSlackPreviewSession} from './preview-session';
import {PreviewStatus} from './preview-snapshot';

describe('Book a Car starter', () => {
  // Sessions are disposed after the test, whether it passes or fails.
  const sessionsToDispose: Array<{dispose(): void}> = [];

  afterEach(() => {
    for (const session of sessionsToDispose.splice(0)) {
      session.dispose();
    }
  });

  it('loads the same valid, interactive example from the built-in Slack profile', () => {
    const messages = A2uiMessageListSchema.parse(JSON.parse(config.renderers.slack.samplePayload));
    expect(messages).toEqual(bookingExample);
    const session = createSlackPreviewSession();
    sessionsToDispose.push(session);
    session.processMessages(messages);
    const snapshot = session.getSnapshot();
    expect(snapshot.status).toBe(PreviewStatus.READY);
    expect(snapshot.diagnostics).toEqual([]);
    expect(snapshot.blocks.filter(block => block.type === 'input')).toHaveLength(3);
    expect(snapshot.blocks).toContainEqual(expect.objectContaining({type: 'actions'}));
  });
});
