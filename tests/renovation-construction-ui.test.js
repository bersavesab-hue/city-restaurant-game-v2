import test from "node:test";
import assert from "node:assert/strict";

import {
  RenovationConstructionSystem
} from "../src/systems/RenovationConstructionSystem.js";

import {
  RenovationConstructionView
} from "../src/ui/renovation/RenovationConstructionView.js";


test(
  "施工周期根据面积和设施数量计算",
  () => {
    const system =
      new RenovationConstructionSystem();

    assert.equal(
      system.estimateDurationDays({
        area: 180,
        placements: 10
      }),
      3
    );

    assert.ok(
      system.estimateDurationDays({
        area: 1800,
        placements: 45
      }) > 3
    );
  }
);


test(
  "装修施工页面包含进度阶段工程信息和验收入口",
  () => {
    const view =
      new RenovationConstructionView();

    const page = {
      restaurant: {
        name:
          "东门小馆",

        level:
          2
      },

      topBar: {
        restaurantName:
          "东门小馆",

        balance:
          88000,

        storeLevel:
          2,

        reputation:
          60,

        weather: {
          label:
            "晴"
        },

        clock: {
          dateText:
            "第5天",

          clockText:
            "10:00",

          paused:
            false,

          speed:
            1
        }
      },

      noticeTicker: {
        current: {
          type:
            "success",

          title:
            "装修待验收",

          message:
            "施工已经完成，可以进行完工验收"
        },

        unreadCount:
          1
      },

      construction: {
        status:
          "ready_for_inspection"
      },

      progress: {
        progress:
          100,

        remainingDays:
          0,

        phaseLabel:
          "等待完工验收"
      },

      timeline: [
        {
          label:
            "方案确认",

          state:
            "complete"
        },

        {
          label:
            "基础施工",

          state:
            "complete"
        },

        {
          label:
            "水电厨房",

          state:
            "complete"
        },

        {
          label:
            "设备安装",

          state:
            "complete"
        },

        {
          label:
            "收尾清洁",

          state:
            "complete"
        },

        {
          label:
            "完工验收",

          state:
            "current"
        }
      ],

      project: {
        area:
          180,

        placements:
          10,

        durationDays:
          3,

        startDay:
          2,

        endDay:
          5,

        projectCost:
          32000,

        seats:
          24,

        kitchenStations:
          2,

        grade:
          "A",

        score:
          86
      },

      actions: {
        canInspect:
          true,

        completed:
          false
      }
    };


    const html =
      view.renderMarkup(
        page
      );


    const expected = [
      "装修施工",
      "施工现场",
      "当前进度",
      "方案确认",
      "基础施工",
      "水电厨房",
      "设备安装",
      "收尾清洁",
      "完工验收",
      "工程信息",
      "完工后经营能力",
      "施工方案预览",
      "完工验收并正式启用"
    ];


    for (
      const text
      of expected
    ) {
      assert.equal(
        html.includes(
          text
        ),
        true,
        `施工页面缺少：${text}`
      );
    }


    assert.ok(
      html.includes(
        'data-image-slot="renovation-construction-site"'
      )
    );

    assert.equal(
      html.includes(
        "后续可绑定施工效果图"
      ),
      false
    );

    assert.ok(
      html.includes(
        'data-page-target="restaurant"'
      )
    );
  }
);
