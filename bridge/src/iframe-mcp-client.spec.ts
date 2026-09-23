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

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {IframeMcpClient} from './iframe-mcp-client.js';

describe('IframeMcpClient', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves callTool when matching MCP_RESPONSE is received', async () => {
    const sentPayloads: Array<{
      requestId: string;
      toolName: string;
      args: Record<string, unknown>;
    }> = [];
    const client = new IframeMcpClient(payload => {
      sentPayloads.push(payload);
    });

    const promise = client.callTool({name: 'list_dir', arguments: {path: '/root'}});
    expect(sentPayloads).toHaveLength(1);
    expect(sentPayloads[0].toolName).toBe('list_dir');
    expect(sentPayloads[0].args).toEqual({path: '/root'});

    client.handleResponse({
      requestId: sentPayloads[0].requestId,
      result: {content: [{type: 'text', text: 'file1.txt'}]},
    });

    const result = await promise;
    expect(result).toEqual({content: [{type: 'text', text: 'file1.txt'}]});
  });

  it('rejects callTool when MCP_RESPONSE contains error', async () => {
    let reqId = '';
    const client = new IframeMcpClient(payload => {
      reqId = payload.requestId;
    });

    const promise = client.callTool({name: 'fail_tool'});
    client.handleResponse({
      requestId: reqId,
      error: 'Server unreachable',
    });

    await expect(promise).rejects.toThrow('Server unreachable');
  });

  it('times out if no response is received within timeoutMs', async () => {
    const client = new IframeMcpClient(() => {}, 1000);
    const promise = client.callTool({name: 'slow_tool'});
    vi.advanceTimersByTime(1001);
    await expect(promise).rejects.toThrow(/timed out/);
  });
});
