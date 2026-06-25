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
  AudioPlayer: {
    usage: [
      {
        id: 'target',
        component: 'AudioPlayer',
        url: 'https://www.w3schools.com/html/horse.mp3',
        description: 'Audio Clip',
      },
    ],
  },
  Badge: {
    usage: [
      {
        id: 'target',
        component: 'Badge',
        text: '3',
        children: ['BadgeChild'],
      },
      {
        id: 'BadgeChild',
        component: 'Icon',
        icon: 'notifications',
      },
    ],
  },
  Button: {
    usage: [
      {
        id: 'target',
        component: 'Button',
        child: 'ButtonLabel',
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
      },
      {
        id: 'ButtonLabel',
        component: 'Text',
        text: 'Click Me',
      },
    ],
  },
  ButtonToggle: {
    usage: [
      {
        id: 'target',
        component: 'ButtonToggle',
        options: [
          {label: 'Left', value: 'left'},
          {label: 'Center', value: 'center'},
          {label: 'Right', value: 'right'},
        ],
        value: 'center',
      },
    ],
  },
  Card: {
    usage: [
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
  },
  CheckBox: {
    usage: [
      {
        id: 'target',
        component: 'CheckBox',
        label: 'I agree to the terms',
        value: false,
      },
    ],
  },
  ChoicePicker: {
    usage: [
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
  },
  Column: {
    usage: [
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
  },
  DateTimeInput: {
    usage: [
      {
        id: 'target',
        component: 'DateTimeInput',
        label: 'Meeting Time',
        value: '2026-06-16T12:00:00Z',
        enableDate: true,
        enableTime: true,
      },
    ],
  },
  Dialog: {
    usage: [
      {
        id: 'target',
        component: 'Column',
        children: ['DialogTriggerButton', 'DialogComponent'],
      },
      {
        id: 'DialogTriggerButton',
        component: 'Button',
        child: 'DialogTriggerLabel',
      },
      {
        id: 'DialogTriggerLabel',
        component: 'Text',
        text: 'Open Dialog',
      },
      {
        id: 'DialogComponent',
        component: 'Dialog',
        title: 'Modal Title',
        children: ['DialogContent'],
      },
      {
        id: 'DialogContent',
        component: 'Text',
        text: 'This is the modal content.',
      },
    ],
  },
  Divider: {
    usage: [
      {
        id: 'target',
        component: 'Divider',
        axis: 'horizontal',
      },
    ],
  },
  ExpansionPanel: {
    usage: [
      {
        id: 'target',
        component: 'ExpansionPanel',
        title: 'Details',
        description: 'Click to expand summary info',
        children: ['PanelContent'],
      },
      {
        id: 'PanelContent',
        component: 'Text',
        text: 'This is the expandable content inside the panel.',
      },
    ],
  },
  Icon: {
    usage: [
      {
        id: 'target',
        component: 'Icon',
        icon: 'home',
      },
    ],
  },
  Image: {
    usage: [
      {
        id: 'target',
        component: 'Image',
        url: 'https://gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_74x24px.svg',
        description: 'Visual Artwork',
      },
    ],
  },
  List: {
    usage: [
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
  },
  Menu: {
    usage: [
      {
        id: 'target',
        component: 'Menu',
        label: 'Options',
        icon: 'more_vert',
        options: [
          {label: 'Edit', value: 'edit'},
          {label: 'Share', value: 'share'},
          {label: 'Delete', value: 'delete'},
        ],
      },
    ],
  },
  ProgressBar: {
    usage: [
      {
        id: 'target',
        component: 'ProgressBar',
        mode: 'determinate',
        value: 70,
      },
    ],
  },
  ProgressSpinner: {
    usage: [
      {
        id: 'target',
        component: 'ProgressSpinner',
        mode: 'determinate',
        value: 40,
      },
    ],
  },
  Row: {
    usage: [
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
  },
  Slider: {
    usage: [
      {
        id: 'target',
        component: 'Slider',
        label: 'Volume',
        min: 0,
        max: 100,
        value: 50,
      },
    ],
  },
  Table: {
    usage: [
      {
        id: 'target',
        component: 'Table',
        columns: [
          {header: 'Name', field: 'name'},
          {header: 'Age', field: 'age'},
          {header: 'Role', field: 'role'},
        ],
        rows: [
          {name: 'Alice', age: '30', role: 'Engineer'},
          {name: 'Bob', age: '25', role: 'Designer'},
          {name: 'Charlie', age: '35', role: 'Manager'},
        ],
      },
    ],
  },
  Tabs: {
    usage: [
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
  },
  Text: {
    usage: [
      {
        id: 'target',
        component: 'Text',
        text: 'Headline Large (H1)',
        usageHint: 'h1',
      },
    ],
  },
  TextField: {
    usage: [
      {
        id: 'target',
        component: 'TextField',
        label: 'Username',
        variant: 'shortText',
        value: {
          path: '/user/username',
        },
      },
    ],
    data: {
      user: {
        username: 'Alice',
      },
    },
  },
  Video: {
    usage: [
      {
        id: 'target',
        component: 'Video',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      },
    ],
  },
};
