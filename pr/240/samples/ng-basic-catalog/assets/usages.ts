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

import {type ComponentUsages} from 'a2ui-bridge';

/** Component usages dictionary matching the A2UiComponentV09 usage spec. */
export const COMPONENT_USAGES: ComponentUsages = {
  AudioPlayer: {
    usage: [
      {
        id: 'root',
        component: 'AudioPlayer',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        description: 'Deep dive into A2UI',
      },
    ],
  },
  Button: {
    usage: [
      {
        id: 'root',
        component: 'Button',
        child: 'demo-button-child',
        action: {
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
        primary: true,
      },
      {
        id: 'demo-button-child',
        component: 'Text',
        text: 'Submit',
      },
    ],
  },
  Card: {
    usage: [
      {
        id: 'root',
        component: 'Card',
        child: 'demo-card-contents',
      },
      {
        id: 'demo-card-contents',
        component: 'Column',
        children: ['demo-card-title', 'demo-card-content'],
      },
      {
        id: 'demo-card-title',
        component: 'Text',
        text: 'Card Title',
        usageHint: 'h3',
      },
      {
        id: 'demo-card-content',
        component: 'Text',
        text: 'This is the card with some text',
      },
    ],
  },
  CheckBox: {
    usage: [
      {
        id: 'root',
        component: 'CheckBox',
        label: 'Label',
        value: true,
      },
    ],
  },
  ChoicePicker: {
    usage: [
      {
        id: 'root',
        component: 'ChoicePicker',
        selections: ['US'],
        options: [
          {label: 'United States', value: 'US'},
          {label: 'Canada', value: 'CA'},
          {label: 'Mexico', value: 'MX'},
        ],
        variant: 'multipleSelection',
        maxAllowedSelections: 1,
      },
    ],
  },
  Column: {
    usage: [
      {
        id: 'root',
        component: 'Column',
        children: ['demo-column-header', 'demo-column-content', 'demo-column-footer'],
        justify: 'start',
        align: 'stretch',
      },
      {
        id: 'demo-column-header',
        component: 'Text',
        text: 'Header',
        usageHint: 'h2',
      },
      {
        id: 'demo-column-content',
        component: 'Text',
        text: 'Content goes here',
        usageHint: 'body',
      },
      {
        id: 'demo-column-footer',
        component: 'Text',
        text: 'Footer',
        usageHint: 'caption',
      },
    ],
  },
  DateTimeInput: {
    usage: [
      {
        id: 'root',
        component: 'DateTimeInput',
        value: '2023-01-01T12:00:00Z',
        enableDate: true,
        enableTime: true,
      },
    ],
  },
  Divider: {
    usage: [
      {
        id: 'root',
        component: 'Divider',
        axis: 'horizontal',
      },
    ],
  },
  Icon: {
    usage: [
      {
        id: 'root',
        component: 'Icon',
        name: 'check_circle',
      },
    ],
  },
  Image: {
    usage: [
      {
        id: 'root',
        component: 'Image',
        url: 'https://www.gstatic.com/marketing-cms/assets/images/c5/3a/200414104c669203c62270f7884f/google-wordmarks-2x.webp=n-w100-h32-fcrop64=1,00000000ffffffff-rw',
        fit: 'scaleDown',
        usageHint: 'mediumFeature',
      },
    ],
  },
  List: {
    usage: [
      {
        id: 'root',
        component: 'List',
        children: ['demo-list-item-1', 'demo-list-item-2', 'demo-list-item-3'],
        direction: 'vertical',
      },
      {
        id: 'demo-list-item-1',
        component: 'Text',
        text: 'List Item 1',
      },
      {
        id: 'demo-list-item-2',
        component: 'Text',
        text: 'List Item 2',
      },
      {
        id: 'demo-list-item-3',
        component: 'Text',
        text: 'List Item 3',
      },
    ],
  },
  Modal: {
    usage: [
      {
        id: 'root',
        component: 'Column',
        align: 'center',
        justify: 'center',
        children: ['demo-modal'],
      },
      {
        id: 'demo-modal',
        component: 'Modal',
        trigger: 'demo-modal-button',
        content: 'demo-modal-content',
      },
      {
        id: 'demo-modal-button',
        component: 'Button',
        child: 'demo-modal-button-label',
        action: {
          event: {
            name: 'open',
          },
        },
      },
      {
        id: 'demo-modal-button-label',
        component: 'Text',
        text: 'Open Modal',
      },
      {
        id: 'demo-modal-content',
        component: 'Text',
        text: 'Modal Content',
      },
    ],
  },
  Row: {
    usage: [
      {
        id: 'root',
        component: 'Row',
        children: ['demo-row-left', 'demo-row-center', 'demo-row-right'],
        justify: 'spaceBetween',
        align: 'center',
      },
      {
        id: 'demo-row-left',
        component: 'Text',
        text: 'Left',
      },
      {
        id: 'demo-row-center',
        component: 'Text',
        text: 'Center',
      },
      {
        id: 'demo-row-right',
        component: 'Text',
        text: 'Right',
      },
    ],
  },
  Slider: {
    usage: [
      {
        id: 'root',
        component: 'Slider',
        value: 50,
        minValue: 0,
        maxValue: 100,
      },
    ],
  },
  Text: {
    usage: [
      {
        id: 'root',
        component: 'Text',
        text: 'Example text',
      },
    ],
  },
  TextField: {
    usage: [
      {
        id: 'root',
        component: 'TextField',
        label: 'Your name',
        textFieldType: 'shortText',
        validationRegexp: '^[a-zA-Z]+$',
        value: {
          path: '/user/name',
        },
      },
    ],
    data: {
      user: {
        name: 'Hello',
      },
    },
  },
  Video: {
    usage: [
      {
        id: 'root',
        component: 'Video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      },
    ],
  },
};
