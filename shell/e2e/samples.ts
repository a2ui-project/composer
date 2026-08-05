/**
 * Compressed A2UI corresponding to the EV_CHARGE_CONTROL_A2UI.
 */
export const ELECTRIC_CAR_CHARGING_UI =
  'a2ui=d1.vVhLj9s2EL7vrxgQ7c3wQ7HbRLfGKZA9FAWyRXIIAoGWaIuJRArkyM428H8vKNGORMm2JGt7szUPfjPzcTjk5weAHw8AAGTPlOZSEB_Ifj59Qybl51AxiuwpV1saMuJbbQCiy0-PkbFg-yCMqdpxsbOGxpQiTeSu1IgRM-3PZtTL-VSq3UxnLORbHlLkUsz28-DNbEM1DwNrNv2qpSCFr-MDwHFyE2qeRRTZWqaZFEyg7om2avfZfoWzh0KHF-ZKSjzb1W2NeC2TPBWOQsyTSDFRc11IYkYjpmraAATpRgehFEi5YIpUhF_Ov4-TayBb_NZhfpCHuvRrrpFvn41MZzRkbxkeGHMCoQnfFYkPmcCG_xtRBsgxYW6sVsbDU7mHBNriuh7uP-y7UzQ0X3wgf36EtWEDg7UUqGRSV9tTxWnpI_ZIP1BFTJcxPTbEgqZmkxEutrLrWg5XrqSAbrSTAvPFLdaP2j-jVaTWMDtXigmEJ6SYa6eOp_oX_CkUAqQbUtM5Tjqu9J5rlOr5yhJxqdGyxgAOVfCOta-ty5CqyCU8DU3LC5Q8DOH7JccO2KbYKY5xUNDGWPRf-2w6VsI2FJGp5yBhe5YE6G7Xwrbs2YGiyFo1Ir7nZt8tXIEBrodm_Aayjn2mTnaSUYyN_iwsN9WstkoV5vFiO1p0rduNzI0UgWVHqned4G9k9Nw1gPbC1nG_K3Wc8-o710WupOL_mh6Z9OF6SZk7ztA_lMxF20a82DMC5GnjiCwEmTwMGwXa3Y5UdOM3UCylXJhxqkvhQ5qZBtinEDb4F8DfyOpYsCtdfhiB-k1YGxSBRpkFium8ySAjVmyrmI4HtcAr3usRvc0RG0PP6eg5u2m2oEqiM8VT6hz-Np3NgrJ9uXBjljiNUih3u4StT_P-xVnh2DcVL9VGLXESunHOgR4AT6W-o07WxfVSRWxL8wRHKpVd0o6Xo1TqchQdbwcf3E1zY_CvjKWjXRGtz4RrHHRDqtoPBuUU82z6WFujbd49M9wqDSH1Rf-dx96TB44s7Tv3ttqOXV4lD83BtSr07il-0_sYzwG3ozJPMpeCCuV9hG74vq8DF-7GnlxrsY6H1U3dqFhLsv3_XGGCqZ176f9Z7VzR-gDWnzEtK9xXB-vwBebHRtgjEr0lkz1gP1Rz3-tt9h1F-peMWNLvaXZPk5zVwiF2WHJirF_Vjb_Xq1_t655zLlQuq6Zj2zWBIryXKYOnPGOqQOKO4M6FxweyXEHKhQaUsM0T5_mwvF_4QH6fLuHbJ5iBt5x_bBuY7MTnA3lCmUFzYq2U6MQOZy859S4amg_k7xDBW07Am3u_NR5VTCPxgfyy8KbLuSu19C6CnHrw7VMMNIpY44g_M8oH8iqGxSq9yK1rGOc3ML6erq5AfOVNF90gejEs5oMgLla30riaLq5gXK2m824YlzHMnTSef5_a3vHnFnz48h8';

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
