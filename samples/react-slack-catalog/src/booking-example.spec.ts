/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {A2uiMessageListSchema} from '@a2ui/web_core/v0_9';
import {describe, expect, it} from 'vitest';
import bookingExample from '../public/examples/car-booking.json';
import config from '../../../shell/src/config.json';
import {createSlackPreviewSession} from './preview-session';

describe('Book a Car starter', () => {
  it('loads the same valid, interactive example from both built-in Slack profiles', () => {
    for (const renderer of [config.renderers.slack, config.renderers['slack-dev']]) {
      const messages = A2uiMessageListSchema.parse(JSON.parse(renderer.samplePayload));
      expect(messages).toEqual(bookingExample);
      const session = createSlackPreviewSession();
      try {
        session.processMessages(messages);
        const snapshot = session.getSnapshot();
        expect(snapshot.status).toBe('ready');
        expect(snapshot.diagnostics).toEqual([]);
        expect(snapshot.blocks.filter(block => block.type === 'input')).toHaveLength(3);
        expect(snapshot.blocks).toContainEqual(expect.objectContaining({type: 'actions'}));
      } finally {
        session.dispose();
      }
    }
  });
});
