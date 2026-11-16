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
 * Compressed A2UI corresponding to the v1.0 EV_CHARGE_CONTROL_A2UI.
 */
export const ELECTRIC_CAR_CHARGING_UI =
  'a2ui=d1.pVbBjts2EP0VYtLeDNlW7DbQqY1bIHsoCmSL5LBYCLQ0tphIpECOvNka-veAFGVTlnZjtydb5OObeY_DIR-OcEBthJKQwDJawAwyjZzwvtE7niEkRzDd37scEsBDmhVc74XcWygnXqq9mymIapPM5zxuRKT0fm5qzMROZJyEkvPDMl3MPd7Mt9yIrP-MvhglLZuqaiVRkoHk4QjCsmqlKJyCBDaqbCqHL0SZa5SQPECBPEcNMyC-NWmmJHEhUcNjO_NMJ0TI9VE9wQy-NIbE7hkSMDXP8D3SE6KNwEuxt8ZkKKlbOwqZkqASYdZ_ikzJUdQTKIz9D36z0sj-JPDmDfvzE9tYb5FtlCStSrikceRDlrtuSPIKIQEhd-q86sKLi_B8a7xfzu4uxQQ2jdYoid0Tp8b0mq03biAlvnURevwHYUjp5wBYdCMd8mxFsP6KDfXojOvcbkRmiyjV6glGhB4yYPRDw8wt0NlhQVMsp8kr8ttyItTPaYkHLFPq9rI_GqnmhP1gLg7Cbt4SZi6YuZAxzfRSoRzht5pTAQnMs26n5gMCaE_Ek9ncQuytqcw-YA3lhGR_dON2s74JY8tAafGvLb5yaHan_4pz-LtWjcwn6iIlUaF3M63V0-Cch4BbxNolqcaKC2mbWzsk7KLcxtitORMFRfy6-sl2syWZGlJ1qtE0Tp0d0bjTaIqwnEa4MNT7hkjJ4Gyc4L4-DlwL7qC1FhV3B7tL3GrEg6M59v2G1H5f4qa_Edp2nMZ_qDtvVMm3g3oO9V6hykPHwnLc8aakV4X5xb4JtpNJ_FAafPTZnvt40BqvudU8vBSGwkslHP4hzfEMuAtX-77Zm--HA78vgK802B4pCKtxh52cvUG9Vk-u24Tf8YQdPe6GC34qXM4Jg2iZmvTeo64oa4eccFWNNu8FAoccE3Q2_G-5KFHvnwPBeaPdk21C9Al7RdYeO877xH-dez26bR9n1kv-l8qxdGXdtQv7d3gFJvBu_bN_S-X-nvD3WAJ9s2Kc2AdVIbtvatTuruwekMN7IIHVmlVCGkaK7ZqytEfGNfYEfo1W7OtnNmfxavHp_Erp-lYC96Rqdu6NJ4fdc8tVRQJ_Z8Ti1YzFi_gXZ4ixXvy0jKOVfYt7E20SUcy-fi4Yz3On6eRLAm8LtlxX7ryFrIsR67toPSB9G0fLl0jjgi0XI9LlepzqOloOWNfraPES66pgC5vqY9u2j98B';

/**
 * A2UI v1.0 interface to display the charging status and history for an EV.
 */
export const EV_CHARGE_CONTROL_A2UI = `[
  {
    "version": "1.0",
    "createSurface": {
      "surfaceId": "ev_charging",
      "catalogId": "https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json",
      "components": [
        {
          "id": "root",
          "component": "Column",
          "children": [
            "header",
            "tabs_container"
          ]
        },
        {
          "id": "header",
          "component": "Row",
          "justify": "spaceBetween",
          "align": "center",
          "children": [
            "header_title",
            "header_icon"
          ]
        },
        {
          "id": "header_title",
          "component": "Text",
          "text": "## EV Charge Control"
        },
        {
          "id": "header_icon",
          "component": "Icon",
          "name": "info"
        },
        {
          "id": "tabs_container",
          "component": "Tabs",
          "tabs": [
            {
              "title": "Current Status",
              "child": "status_tab"
            },
            {
              "title": "History",
              "child": "history_tab"
            }
          ]
        },
        {
          "id": "status_tab",
          "component": "Column",
          "children": [
            "status_card",
            "action_row"
          ]
        },
        {
          "id": "status_card",
          "component": "Card",
          "child": "status_card_content"
        },
        {
          "id": "status_card_content",
          "component": "Column",
          "children": [
            "battery_level_text",
            "charging_rate_text",
            "divider_1",
            "stats_row"
          ]
        },
        {
          "id": "battery_level_text",
          "component": "Text",
          "text": {
            "@path": "/current/battery_level"
          }
        },
        {
          "id": "charging_rate_text",
          "component": "Text",
          "text": {
            "@path": "/current/status_msg"
          }
        },
        {
          "id": "divider_1",
          "component": "Divider",
          "axis": "horizontal"
        },
        {
          "id": "stats_row",
          "component": "Row",
          "justify": "spaceAround",
          "children": [
            "stat_time",
            "stat_power"
          ]
        },
        {
          "id": "stat_time",
          "component": "Text",
          "text": {
            "@path": "/current/time_remaining"
          }
        },
        {
          "id": "stat_power",
          "component": "Text",
          "text": {
            "@path": "/current/power"
          }
        },
        {
          "id": "action_row",
          "component": "Row",
          "justify": "center",
          "children": [
            "btn_stop_resume",
            "btn_refresh"
          ]
        },
        {
          "id": "btn_stop_resume",
          "component": "Button",
          "child": "btn_stop_text",
          "variant": "primary",
          "action": {
            "event": {
              "name": "toggleCharging"
            }
          }
        },
        {
          "id": "btn_stop_text",
          "component": "Text",
          "text": {
            "@path": "/current/action_label"
          }
        },
        {
          "id": "btn_refresh",
          "component": "Button",
          "child": "btn_refresh_text",
          "variant": "default",
          "action": {
            "event": {
              "name": "refreshStatus"
            }
          }
        },
        {
          "id": "btn_refresh_text",
          "component": "Text",
          "text": "Refresh"
        },
        {
          "id": "history_tab",
          "component": "Column",
          "children": [
            "history_list"
          ]
        },
        {
          "id": "history_list",
          "component": "Column",
          "children": {
            "componentId": "history_card",
            "path": "/history"
          }
        },
        {
          "id": "history_card",
          "component": "Card",
          "child": "history_item_content"
        },
        {
          "id": "history_item_content",
          "component": "Column",
          "children": [
            "history_row_1",
            "history_row_2"
          ]
        },
        {
          "id": "history_row_1",
          "component": "Row",
          "justify": "spaceBetween",
          "children": [
            "history_date",
            "history_cost"
          ]
        },
        {
          "id": "history_date",
          "component": "Text",
          "text": {
            "@path": "date"
          }
        },
        {
          "id": "history_cost",
          "component": "Text",
          "text": {
            "@path": "cost"
          }
        },
        {
          "id": "history_row_2",
          "component": "Row",
          "justify": "spaceBetween",
          "children": [
            "history_energy",
            "history_duration"
          ]
        },
        {
          "id": "history_energy",
          "component": "Text",
          "text": {
            "@path": "energy"
          }
        },
        {
          "id": "history_duration",
          "component": "Text",
          "text": {
            "@path": "duration"
          }
        }
      ],
      "dataModel": {
        "current": {
          "battery_level": "85% Charged",
          "status_msg": "Charging at Home Supercharger",
          "time_remaining": "45 mins to full",
          "power": "7.4 kW / 240V",
          "action_label": "Stop Charging"
        },
        "history": [
          {
            "date": "Oct 24, 2026",
            "cost": "$12.40",
            "energy": "45.2 kWh added",
            "duration": "3h 15m"
          },
          {
            "date": "Oct 20, 2026",
            "cost": "$8.50",
            "energy": "32.1 kWh added",
            "duration": "2h 10m"
          },
          {
            "date": "Oct 15, 2026",
            "cost": "$15.10",
            "energy": "55.0 kWh added",
            "duration": "4h 05m"
          }
        ]
      }
    }
  }
]`;
