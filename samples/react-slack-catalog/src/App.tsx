/// <reference types="vite/client" />

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

import {useCallback, useEffect, useRef, useState} from 'react';
import {a2uiBridge, type ThemePreference} from 'a2ui-bridge';
import {
  createSlackPreviewBridgeConfig,
  createSlackPreviewSession,
  type PreviewSession,
  type PreviewSnapshot,
} from './preview-session';
import {SlackPreview} from './SlackPreview';
import './styles.css';

export function App() {
  const [snapshot, setSnapshot] = useState<PreviewSnapshot>(initialSnapshot);
  const [theme, setTheme] = useState<ThemePreference>();
  const sessionRef = useRef<PreviewSession | undefined>(undefined);

  useEffect(() => {
    const nextSession = createSlackPreviewSession(action => {
      a2uiBridge.sendAction(action);
    });
    sessionRef.current = nextSession;
    const unsubscribeSnapshot = nextSession.subscribe(() => {
      setSnapshot(nextSession.getSnapshot());
    });
    const connection = a2uiBridge.attachRenderer(
      nextSession,
      createSlackPreviewBridgeConfig(nextSession, {
        onThemeChange: setTheme,
      }),
    );

    setSnapshot(nextSession.getSnapshot());

    return () => {
      unsubscribeSnapshot();
      connection.unsubscribe();
      if (sessionRef.current === nextSession) {
        sessionRef.current = undefined;
      }
      nextSession.dispose();
    };
  }, []);

  const dispatch = useCallback((actionId: string) => {
    return sessionRef.current?.dispatch(actionId);
  }, []);

  const updateInput = useCallback((actionId: string, value: string) => {
    sessionRef.current?.updateInput(actionId, value);
  }, []);

  return (
    <main className="sandbox-shell slack-preview-shell" data-theme={theme}>
      <SlackPreview
        dispatch={dispatch}
        updateInput={updateInput}
        snapshot={snapshot}
        theme={theme}
      />
    </main>
  );
}

const initialSnapshot: PreviewSnapshot = {
  revision: 0,
  status: 'empty',
  blocks: [],
  diagnostics: [],
};
