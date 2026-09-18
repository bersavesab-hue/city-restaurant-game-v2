import test from "node:test";
import assert from "node:assert/strict";

import {
  RenovationGameView
} from "../src/ui/renovation/RenovationGameView.js";


test(
  "正式装修UI包含模板平面图工具家具经营效果和施工结算",
  () => {
    const view =
      new RenovationGameView({
        root: {},
        restaurantId:
          "test_restaurant",
        pageSystem: {}
      });

    view.page = {
      header: {
        balance: 100000,
        currentCost: 12000,
        remaining: 88000,
        grade: "A",
        score: 86
      },

      workspace: {
        width: 20,
        height: 12,
        activeFloorId:
          "floor_1",

        activeFloor: {
          id:
            "floor_1",
          label:
            "1F",
          area: 240,
          usableArea: 210
        },

        floors: [
          {
            id:
              "floor_1",
            label:
              "1F",
            usableArea: 210
          }
        ],

        mode:
          "direct",

        modeLabel:
          "整层编辑",

        zoom: 1,
        zoomMin: 1,
        zoomMax: 2,
        canZoom: true,

        zones: [],
        activeZoneId: null,

        placements: [],
        totalPlacements: 5,

        minimap: {
          enabled: false,
          expanded: false
        }
      },

      drawer: {
        expanded: true,
        activeCategory:
          "dining",

        categories: [
          {
            id:
              "dining",
            name:
              "桌椅",
            count: 2
          }
        ],

        items: [
          {
            id:
              "table_test",
            name:
              "四人餐桌",
            width: 2,
            height: 2,
            cost: 800,
            type:
              "table",
            unlocked: true,
            affordable: true
          }
        ],

        selectedFurnitureId:
          null
      },

      selection: {
        canRotate: false,
        canDelete: false
      },

      templates: {
        items: [
          {
            id:
              "template_1",
            name:
              "标准大厅"
          }
        ]
      },

      analysis: {
        grade: "A",
        score: 86,
        scores: {
          动线: 88,
          舒适度: 82
        },
        issues: [],
        issuesExpanded: false
      },

      actions: {
        canSave: true,
        canActivate: true
      }
    };

    view.getChromeModel =
      () => ({
        restaurantName:
          "装修测试店",
        balance:
          100000,
        storeLevel:
          1,
        reputation:
          0,
        clock: {
          dateText:
            "1月1日",
          clockText:
            "08:00"
        },
        weather:
          null
      });

    view.renderStructureMarkers =
      () => "";

    view.renderPlacement =
      () => "";

    view.renderTemplatePreview =
      () => "";

    view.renderMinimap =
      () => "";

    const html =
      view.buildMarkup();

    const expected = [
      "装修布局",
      "布局模板",
      "平面布局",
      "操作工具",
      "经营效果",
      "家具与设施",
      "四人餐桌",
      "本次装修",
      "布局评分",
      "保存草稿",
      "确认施工"
    ];

    for (
      const text
      of expected
    ) {
      assert.equal(
        html.includes(text),
        true,
        `装修页面缺少：${text}`
      );
    }
  }
);
