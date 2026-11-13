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

/** Component usages dictionary matching the A2UI v1.0 basic catalog specification. */
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
        child: 'demo_button_child',
        action: {
          event: {
            name: 'submit',
            context: {
              formId: 'contact-form',
            },
          },
        },
        variant: 'primary',
      },
      {
        id: 'demo_button_child',
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
        child: 'demo_card_contents',
      },
      {
        id: 'demo_card_contents',
        component: 'Column',
        children: ['demo_card_title', 'demo_card_content'],
      },
      {
        id: 'demo_card_title',
        component: 'Text',
        text: '### Card Title',
      },
      {
        id: 'demo_card_content',
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
        value: ['US'],
        options: [
          {label: 'United States', value: 'US'},
          {label: 'Canada', value: 'CA'},
          {label: 'Mexico', value: 'MX'},
        ],
        variant: 'multipleSelection',
      },
    ],
  },
  Column: {
    usage: [
      {
        id: 'root',
        component: 'Column',
        children: ['demo_column_header', 'demo_column_content', 'demo_column_footer'],
        justify: 'start',
        align: 'stretch',
      },
      {
        id: 'demo_column_header',
        component: 'Text',
        text: '## Header',
      },
      {
        id: 'demo_column_content',
        component: 'Text',
        text: 'Content goes here',
        variant: 'body',
      },
      {
        id: 'demo_column_footer',
        component: 'Text',
        text: 'Footer',
        variant: 'caption',
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
        name: 'check',
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
        variant: 'mediumFeature',
      },
    ],
  },
  List: {
    usage: [
      {
        id: 'root',
        component: 'List',
        children: ['demo_list_item_1', 'demo_list_item_2', 'demo_list_item_3'],
        direction: 'vertical',
      },
      {
        id: 'demo_list_item_1',
        component: 'Text',
        text: 'List Item 1',
      },
      {
        id: 'demo_list_item_2',
        component: 'Text',
        text: 'List Item 2',
      },
      {
        id: 'demo_list_item_3',
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
        children: ['demo_modal'],
      },
      {
        id: 'demo_modal',
        component: 'Modal',
        trigger: 'demo_modal_button',
        content: 'demo_modal_content',
      },
      {
        id: 'demo_modal_button',
        component: 'Button',
        child: 'demo_modal_button_label',
        action: {
          event: {
            name: 'open',
            context: {},
          },
        },
      },
      {
        id: 'demo_modal_button_label',
        component: 'Text',
        text: 'Open Modal',
      },
      {
        id: 'demo_modal_content',
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
        children: ['demo_row_left', 'demo_row_center', 'demo_row_right'],
        justify: 'spaceBetween',
        align: 'center',
      },
      {
        id: 'demo_row_left',
        component: 'Text',
        text: 'Left',
      },
      {
        id: 'demo_row_center',
        component: 'Text',
        text: 'Center',
      },
      {
        id: 'demo_row_right',
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
        min: 0,
        max: 100,
      },
    ],
  },
  Tabs: {
    usage: [
      {
        id: 'root',
        component: 'Tabs',
        tabs: [
          {
            title: 'Tab 1',
            child: 'demo_tab_1',
          },
          {
            title: 'Tab 2',
            child: 'demo_tab_2',
          },
        ],
      },
      {
        id: 'demo_tab_1',
        component: 'Text',
        text: 'Content of Tab 1',
      },
      {
        id: 'demo_tab_2',
        component: 'Text',
        text: 'Content of Tab 2',
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
        variant: 'shortText',
        value: {
          '@path': '/user/name',
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
