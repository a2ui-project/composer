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

/**
 * Pre-defined rich visual component rendering presets.
 * Maps component types to A2UI structures/configurations.
 */
export const DEFAULT_PRESETS: Record<string, unknown> = {
  AudioPlayer: [
    {
      id: 'target',
      component: 'AudioPlayer',
      url: 'https://www.w3schools.com/html/horse.mp3',
      description: 'Audio Clip',
    },
  ],
  Button: [
    {
      id: 'target',
      component: 'Button',
      child: 'ButtonLabel',
      event: {
        name: 'submit',
        context: [
          {
            key: 'formId',
            value: 'contact-form',
          },
        ],
      },
    },
    {
      id: 'ButtonLabel',
      component: 'Text',
      text: 'Click Me',
    },
  ],
  Card: [
    {
      id: 'target',
      component: 'Card',
      child: 'CardContent',
    },
    {
      id: 'CardContent',
      component: 'Text',
      text: 'This is card content.',
    },
  ],
  CheckBox: [
    {
      id: 'target',
      component: 'CheckBox',
      label: 'I agree to the terms',
      value: false,
    },
  ],
  ChoicePicker: [
    {
      id: 'target',
      component: 'ChoicePicker',
      label: 'Select your role',
      options: [
        {label: 'Admin', value: 'admin'},
        {label: 'Editor', value: 'editor'},
        {label: 'Viewer', value: 'viewer'},
      ],
      value: ['viewer'],
    },
  ],
  Column: [
    {
      id: 'target',
      component: 'Column',
      children: ['ColItem1', 'ColItem2'],
    },
    {
      id: 'ColItem1',
      component: 'Text',
      text: 'Vertical Item 1',
    },
    {
      id: 'ColItem2',
      component: 'Text',
      text: 'Vertical Item 2',
    },
  ],
  DateTimeInput: [
    {
      id: 'target',
      component: 'DateTimeInput',
      label: 'Meeting Time',
      value: '2026-06-16T12:00:00Z',
      enableDate: true,
      enableTime: true,
    },
  ],
  Divider: [
    {
      id: 'target',
      component: 'Divider',
      axis: 'horizontal',
    },
  ],
  Icon: [
    {
      id: 'target',
      component: 'Icon',
      name: 'home',
    },
  ],
  Image: [
    {
      id: 'target',
      component: 'Image',
      url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119',
      description: 'Visual Artwork',
    },
  ],
  List: [
    {
      id: 'target',
      component: 'List',
      children: ['list-item-1', 'list-item-2'],
    },
    {
      id: 'list-item-1',
      component: 'Text',
      text: 'List Item One',
    },
    {
      id: 'list-item-2',
      component: 'Text',
      text: 'List Item Two',
    },
  ],
  Row: [
    {
      id: 'target',
      component: 'Row',
      children: ['RowItem1', 'RowItem2'],
    },
    {
      id: 'RowItem1',
      component: 'Text',
      text: 'Horizontal Item 1',
    },
    {
      id: 'RowItem2',
      component: 'Text',
      text: 'Horizontal Item 2',
    },
  ],
  Slider: [
    {
      id: 'target',
      component: 'Slider',
      label: 'Volume',
      min: 0,
      max: 100,
      value: 50,
    },
  ],
  Tabs: [
    {
      id: 'target',
      component: 'Tabs',
      tabs: [
        {title: 'Tab One', child: 'tab-content-1'},
        {title: 'Tab Two', child: 'tab-content-2'},
      ],
    },
    {
      id: 'tab-content-1',
      component: 'Text',
      text: 'Content of Tab One',
    },
    {
      id: 'tab-content-2',
      component: 'Text',
      text: 'Content of Tab Two',
    },
  ],
  Text: [
    {
      id: 'target',
      component: 'Text',
      text: 'Headline Large (H1)',
      variant: 'h1',
    },
  ],
  TextField: [
    {
      id: 'target',
      component: 'TextField',
      label: 'Username',
      variant: 'shortText',
    },
  ],
  Video: [
    {
      id: 'target',
      component: 'Video',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    },
  ],
};
