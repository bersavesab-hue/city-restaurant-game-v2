import test from "node:test";
import assert from "node:assert/strict";

import {
  PageRegistry
} from "../src/ui/registry/PageRegistry.js";

import {
  resolveMainRoot,
  buildNavigationItems
} from "../src/ui/components/GameChromeSystem.js";

import {
  renderBottomNavigation,
  renderGameTopBar
} from "../src/ui/components/GameChromeView.js";


test(
  "子页面能够正确归属五大主导航",
  () => {
    const registry =
      new PageRegistry();


    registry.register({
      id:
        "city",

      title:
        "城市",

      nav:
        "main"
    });


    registry.register({
      id:
        "properties",

      title:
        "房源",

      parent:
        "city"
    });


    registry.register({
      id:
        "property_detail",

      title:
        "详情",

      parent:
        "properties"
    });


    assert.equal(
      resolveMainRoot(
        "property_detail",
        registry
      ),
      "city"
    );
  }
);


test(
  "统一导航支持激活态和动态红点",
  () => {
    const items =
      buildNavigationItems(
        [
          {
            id:
              "city",

            title:
              "城市"
          },

          {
            id:
              "restaurant",

            title:
              "门店"
          },

          {
            id:
              "operations",

            title:
              "经营"
          },

          {
            id:
              "employees",

            title:
              "员工"
          },

          {
            id:
              "more",

            title:
              "更多"
          }
        ],
        "operations",
        {
          operations:
            3,

          employees:
            2
        }
      );


    assert.equal(
      items.find(
        item =>
          item.id ===
          "operations"
      ).active,
      true
    );


    assert.equal(
      items.find(
        item =>
          item.id ===
          "operations"
      ).badge,
      3
    );


    const html =
      renderBottomNavigation(
        items
      );


    assert.ok(
      html.includes(
        "rg-nav-badge"
      )
    );


    assert.ok(
      html.includes(
        "经营"
      )
    );


    assert.ok(
      html.includes(
        'data-ui-icon="operations"'
      )
    );


    assert.equal(
      html.includes(
        ">营<"
      ),
      false
    );
  }
);


test(
  "统一HUD包含门店资金等级声望时间",
  () => {
    const html =
      renderGameTopBar({
        restaurantName:
          "东门小馆",

        balance:
          88000,

        storeLevel:
          3,

        reputation:
          72,

        clock: {
          dateText:
            "第5天",

          clockText:
            "11:30",

          paused:
            false,

          speed:
            1,

          speedOptions: [
            1,
            2,
            4
          ]
        },

        actions: {
          speeds: [
            1,
            2,
            4
          ]
        }
      });


    assert.ok(
      html.includes(
        'data-ui-icon="store"'
      )
    );


    assert.equal(
      html.includes(
        'data-image-slot="restaurant-avatar"'
      ),
      false
    );


    for (
      const text
      of [
        "东门小馆",
        "¥88,000",
        "Lv.3",
        "声望",
        "11:30"
      ]
    ) {
      assert.equal(
        html.includes(
          text
        ),
        true
      );
    }
  }
);
