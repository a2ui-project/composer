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

import {
  A2UI,
  Button,
  Card,
  CheckBox,
  ChoicePicker,
  Column,
  DateTimeInput,
  Divider,
  Icon,
  Image,
  LineChart,
  List,
  Loading,
  Modal,
  PieChart,
  RadioGroup,
  Row,
  Slider,
  Tabs,
  Text,
  TextField,
  basicFunctions,
  createMessageStore,
  normalizePayloadToMessages,
} from '@lynx-js/genui/a2ui';
import type {
  CatalogComponent,
  CatalogInput,
  CatalogManifest,
  MessageStore,
} from '@lynx-js/genui/a2ui';
import {catalogManifests} from '@lynx-js/genui/a2ui/catalog';
import {useCallback, useEffect, useLynxGlobalEventListener, useState} from '@lynx-js/react';

function catalogEntry(
  component: unknown,
  manifest: CatalogManifest,
): readonly [CatalogComponent, CatalogManifest] {
  return [component as CatalogComponent, manifest];
}

const CATALOGS: readonly CatalogInput[] = [
  catalogEntry(Text, catalogManifests.Text),
  catalogEntry(Image, catalogManifests.Image),
  catalogEntry(Row, catalogManifests.Row),
  catalogEntry(Column, catalogManifests.Column),
  catalogEntry(List, catalogManifests.List),
  catalogEntry(Card, catalogManifests.Card),
  catalogEntry(Modal, catalogManifests.Modal),
  catalogEntry(Button, catalogManifests.Button),
  catalogEntry(Divider, catalogManifests.Divider),
  catalogEntry(Icon, catalogManifests.Icon),
  catalogEntry(CheckBox, catalogManifests.CheckBox),
  catalogEntry(ChoicePicker, catalogManifests.ChoicePicker),
  catalogEntry(DateTimeInput, catalogManifests.DateTimeInput),
  catalogEntry(LineChart, catalogManifests.LineChart),
  catalogEntry(PieChart, catalogManifests.PieChart),
  catalogEntry(Loading, catalogManifests.Loading),
  catalogEntry(RadioGroup, catalogManifests.RadioGroup),
  catalogEntry(Slider, catalogManifests.Slider),
  catalogEntry(TextField, catalogManifests.TextField),
  catalogEntry(Tabs, catalogManifests.Tabs),
  ...basicFunctions,
];

interface RenderSession {
  id: number;
  store: MessageStore;
}

type Theme = 'light' | 'dark';

/** ReactLynx A2UI surface driven by Composer global events. */
export function App() {
  const [session, setSession] = useState<RenderSession>(() => ({
    id: 0,
    store: createMessageStore(),
  }));
  const [theme, setTheme] = useState<Theme>('light');

  useLynxGlobalEventListener('COMPOSER_REPLAY_MESSAGES', (payload: unknown) => {
    setSession(previous => ({
      id: previous.id + 1,
      store: createMessageStore({initialMessages: normalizePayloadToMessages(payload)}),
    }));
  });

  useLynxGlobalEventListener('COMPOSER_LIVE_MESSAGES', (payload: unknown) => {
    const messages = normalizePayloadToMessages(payload);
    if (messages.length > 0) session.store.push(messages);
  });

  useLynxGlobalEventListener('COMPOSER_THEME', (nextTheme: unknown) => {
    if (nextTheme === 'light' || nextTheme === 'dark') setTheme(nextTheme);
  });

  const handleLayout = useCallback(() => {
    NativeModules.bridge?.call?.('A2UI_SURFACE_RESIZE', {}, () => undefined);
  }, []);

  useEffect(() => {
    NativeModules.bridge?.call?.('A2UI_RUNTIME_READY', {}, () => undefined);
  }, []);

  return (
    <view
      className={`page ${theme === 'dark' ? 'luna-dark a2ui-dark' : 'luna-light a2ui-light'}`}
      bindlayoutchange={handleLayout}
    >
      <A2UI
        key={session.id}
        messageStore={session.store}
        catalogs={CATALOGS}
        onAction={action => {
          NativeModules.bridge?.call?.(
            'A2UI_USER_ACTION',
            action as unknown as Record<string, unknown>,
            () => undefined,
          );
        }}
        renderEmpty={() => (
          <view className="empty-state">
            <text>Waiting for A2UI payloads...</text>
          </view>
        )}
        renderFallback={() => (
          <view className="empty-state">
            <text>Rendering...</text>
          </view>
        )}
        className="a2ui-container"
      />
    </view>
  );
}
