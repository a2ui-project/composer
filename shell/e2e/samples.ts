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
 * Compressed A2UI corresponding to the EV_CHARGE_CONTROL_A2UI.
 */
export const ELECTRIC_CAR_CHARGING_UI =
  'a2ui=d1.pVZdr9s2DP0rArG9Bflwk63125oO6H0YBvQO7cPFhaHYTKzWlgyJTpoF-e-DZDmRY998YE9x6KND8pCm-HKALWojlIQYttPxBxhBqpETPtd6zVOE-ACmeXzKIAbcJmnO9UbIjYVy4oXauDc5UWXiyYRHtRgrvZmYClOxFiknoeRkO00-TFbciDTxp8bfjZJwPI4GYqirjBMuVVkpiZLMjTAC3MsBhEVopSh8BTEsVVGX0hpzUWQaJcQvkCPPUMMIiK9MkipJXEjU8GrjckwnRMj1Re1gBN9rQ2K9hxhMxVP8iLRDtB54ITY2nRQlNWd7LhMSVCCM2r8iVbLn9QQKff-DP21qZH9i-PMrW1opkC2VJK0KGMGWa8EdNo_gktI56jI-NSbJS4QYhFyr86kLXS5C4SvjtXPSN-HGsKy1RknsmTjVps3f6uQMCfGV89DiPwtDSu8DYN5YGuRZluD8HcX16JTrzBYltZ2YaLWDHqGHdBi9qRu5BTo5LGiI5fTyjvhWnAj1Pilwi0VCTV3bxk40J2yNmdgKW7wZjJwzc5HGMNNbTXOAilMOMUzSplCTznk4dlpods5zMLYH3HidSrPp-lipbH_2EiYbkn9q7LaUP4WxoSkt_rWtWXRL0ahzxxf7h1a1zAa6JiFRotc6qdSuMxFCwAPJ2xOJxpILaedWR4CUV7Y5u2l4xw85aY5c5w4-hOsaDY6vFcnEkKoSjaZ2GliLxrVGk4ct2cOFrj7WREoG39cJ7rvqHH-lRcndcGgCt2nj1tEc2plFarMpcNneCcdjP4zHu9XrVPCV_SY6jG26dyTlof28MlzzuqCrefnDfo4eB4O4mRl88dGer4Jgut5zSXp4IQyFd1RovklzOAOewtN-9Lbie3Og9wXwyoxukYKw7A_pwbcPZK_Vzo2k8H80IEeLe2BfGHJnN6DAW6oGtfeo213tgFeGbsfPPYQOeAdhI9P_lgMl6s0-ECSrtVstB0Q5YW9n4aHXB2bP5V2Ct-Bh7tdrm-8nTvwvlWFxffHd8qJ2K7qfWPaxe5PH8H7xq18QM3-f-Qs4hnZcMk7ssyqRPdcVasffrMTdCyuG-YKVQhpGiq3rwm6azXUTw-_jOfvxjU1YNJ9-Pe9azeiM4ZlUxc7T-VREtzS6zozh75RYNB-xaBr95gQ2Vq9fZtF4PoVRWygbxDhiP77ljGeZy-kkdAzvcjZblK5wIeu0x_p-vOiQvovGs7dIo5zNpj3S2aIf6mI867AuFuPpW6zznE1tqK_H4_H1Pw';

/**
 * A2UI interface to display the charting status and history for an EV.
 */
export const EV_CHARGE_CONTROL_A2UI = `[
  {
    "version": "v0.9",
    "createSurface": {
      "surfaceId": "ev_charging",
      "catalogId": "https://a2ui.org/specification/v0_9/basic_catalog.json"
    }
  },
  {
    "version": "v0.9",
    "updateComponents": {
      "surfaceId": "ev_charging",
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
          "text": "EV Charge Control",
          "variant": "h2"
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
            "path": "/current/battery_level"
          },
          "variant": "h1"
        },
        {
          "id": "charging_rate_text",
          "component": "Text",
          "text": {
            "path": "/current/status_msg"
          },
          "variant": "body"
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
            "path": "/current/time_remaining"
          },
          "variant": "caption"
        },
        {
          "id": "stat_power",
          "component": "Text",
          "text": {
            "path": "/current/power"
          },
          "variant": "caption"
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
            "path": "/current/action_label"
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
            "path": "date"
          },
          "variant": "body"
        },
        {
          "id": "history_cost",
          "component": "Text",
          "text": {
            "path": "cost"
          },
          "variant": "body"
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
            "path": "energy"
          },
          "variant": "caption"
        },
        {
          "id": "history_duration",
          "component": "Text",
          "text": {
            "path": "duration"
          },
          "variant": "caption"
        }
      ]
    }
  },
  {
    "version": "v0.9",
    "updateDataModel": {
      "surfaceId": "ev_charging",
      "value": {
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
