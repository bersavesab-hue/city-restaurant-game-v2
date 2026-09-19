import test from "node:test";
import assert from "node:assert/strict";

import {
  RestaurantHomeView
} from "../src/ui/pages/restaurant/RestaurantHomeView.js";


test(
  "门店正式主页包含完整经营区块和图片槽位",
  () => {
    const root = {
      addEventListener() {},
      removeEventListener() {},
      contains() {
        return true;
      },
      innerHTML: ""
    };

    const view =
      new RestaurantHomeView({
        root,
        restaurantId:
          "restaurant_test",
        pageSystem: {}
      });

    const page = {
      topBar: {
        restaurantName:
          "东门小馆",

        storeLevel: 3,

        balance: 88000,

        weather: {
          label:
            "晴"
        },

        clock: {
          dateText:
            "4月10日",

          clockText:
            "11:30",

          paused:
            false,

          speed:
            1
        }
      },

      restaurant: {
        name:
          "东门小馆",

        status:
          "open",

        level:
          3,

        reputation:
          80,

        reviewScore:
          4.6
      },

      noticeTicker: {
        current: {
          type:
            "info",

          title:
            "经营通报",

          message:
            "午市客流正在上升"
        },

        unreadCount:
          1
      },

      scene: {
        propertyId:
          "p1",

        propertyName:
          "东门临街商铺",

        area:
          180,

        seats:
          42,

        renovationActive:
          true,

        renovationGrade:
          "A",

        renovationScore:
          86
      },

      lease: {
        monthlyRent:
          18000,

        remainingDays:
          280
      },

      operating: {
        scheduledHours:
          13,

        schedule: {
          enabled:
            true,

          openHour:
            9,

          closeHour:
            22
        },

        periods: [
          {
            label:
              "早餐",

            start:
              6,

            enabled:
              false,

            current:
              false
          },

          {
            label:
              "午市",

            start:
              10,

            enabled:
              true,

            current:
              true
          },

          {
            label:
              "晚餐",

            start:
              17,

            enabled:
              true,

            current:
              false
          },

          {
            label:
              "夜宵",

            start:
              22,

            enabled:
              false,

            current:
              false
          }
        ]
      },

      dashboardMetrics: [
        {
          label:
            "今日营业额",

          value:
            12000,

          format:
            "money"
        },

        {
          label:
            "今日毛利",

          value:
            7000,

          format:
            "money"
        },

        {
          label:
            "今日订单",

          value:
            86,

          format:
            "number"
        },

        {
          label:
            "单量/餐位",

          value:
            2.1,

          format:
            "decimal"
        },

        {
          label:
            "顾客评分",

          value:
            4.6,

          format:
            "rating"
        }
      ],

      trend:
        Array.from(
          {
            length: 7
          },
          (
            _,
            index
          ) => ({
            day:
              index + 1,

            revenue:
              index * 1000,

            orders:
              index
          })
        ),

      employees: {
        active:
          7,

        total:
          8
      },

      inventory: {
        ingredientKinds:
          18
      },

      today: {
        averageQuality:
          83
      },

      reminders: [
        {
          type:
            "warning",

          title:
            "库存提醒",

          message:
            "部分食材库存偏低",

          action:
            "supply"
        }
      ],

      topDishes: [
        {
          dishId:
            "green_pepper_beef",

          name:
            "青椒牛肉",

          sold:
            50,

          revenue:
            3000,

          quality:
            88,

          imageSlot:
            "dish-green_pepper_beef",

          image:
            "assets/images/dishes/official/green_pepper_beef.webp"
        }
      ],

      actions: {
        canOpen:
          false,

        canClose:
          true,

        speeds: [
          1,
          2,
          4
        ]
      },

      navigation: [
        {
          id:
            "city",

          title:
            "城市",

          active:
            false
        },

        {
          id:
            "restaurant",

          title:
            "门店",

          active:
            true
        },

        {
          id:
            "operations",

          title:
            "经营",

          active:
            false
        },

        {
          id:
            "employees",

          title:
            "员工",

          active:
            false
        },

        {
          id:
            "more",

          title:
            "更多",

          active:
            false
        }
      ]
    };

    const html =
      view.renderMarkup(
        page
      );

    const expected = [
      "门店实景主图",
      "门店概况",
      "今日营业时段",
      "今日营业额",
      "今日毛利",
      "今日订单",
      "顾客评分",
      "近7日销售趋势",
      "门店营业现场",
      "今日经营提醒",
      "本店招牌菜",
      "经营报表",
      "城市",
      "门店",
      "经营",
      "员工",
      "更多"
    ];

    for (
      const text
      of expected
    ) {
      assert.equal(
        html.includes(text),
        true,
        `门店正式主页缺少：${text}`
      );
    }

    assert.ok(
      html.includes(
        'data-image-slot="restaurant-hero"'
      )
    );

    assert.ok(
      html.includes(
        'data-image-slot="restaurant-live"'
      )
    );

    assert.ok(
      html.includes(
        "按近7日真实销量动态变化"
      )
    );

    assert.ok(
      html.includes(
        'data-image-slot="dish-green_pepper_beef"'
      )
    );

    assert.ok(
      html.includes(
        'role="img"'
      )
    );

    assert.equal(
      html.includes(
        "图片槽位"
      ),
      false
    );

    assert.equal(
      html.includes(
        "后续接入动态门店场景图"
      ),
      false
    );
  }
);
