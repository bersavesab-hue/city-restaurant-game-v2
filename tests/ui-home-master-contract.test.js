import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  PRIMARY_NAV,
  renderHomePage
} from "../client/mobile/HomePage.js";

const mobileApp =
  fs.readFileSync(
    new URL(
      "../client/mobile/MobileApp.js",
      import.meta.url
    ),
    "utf8"
  );

const homePage =
  fs.readFileSync(
    new URL(
      "../client/mobile/HomePage.js",
      import.meta.url
    ),
    "utf8"
  );

const css =
  fs.readFileSync(
    new URL(
      "../client/mobile/app.css",
      import.meta.url
    ),
    "utf8"
  );

const toolkit =
  fs.readFileSync(
    new URL(
      "../client/mobile/DevToolkit.js",
      import.meta.url
    ),
    "utf8"
  );

function fixture() {
  return {
    restaurant: {
      name:
        "测试餐厅",
      status:
        "open",
      reviewScore:
        4.2,
      totalReviews:
        16,
      customerSatisfaction:
        73
    },

    finance: {
      balance:
        123456
    },

    progress: {
      level:
        3,
      title:
        "商圈新秀",
      nextTitle:
        "成熟门店",
      remainingExperience:
        1800,
      progress:
        .42,
      maxLevel:
        false
    },

    property: {
      name:
        "测试铺位"
    },

    district: {
      name:
        "测试商圈",
      trafficIndex:
        81,
      spendingPower:
        76,
      competition:
        55,
      customerMix: {
        office_worker:
          60,
        resident:
          40
      }
    },

    employees: [
      {
        name:
          "张师傅",
        roleId:
          "chef",
        level:
          2,
        status:
          "active",
        mood:
          70
      }
    ],

    inventory: [
      {
        ingredientId:
          "rice",
        name:
          "大米",
        batches:
          1,
        usableQuantity:
          12
      }
    ],

    menu: [
      {
        dishId:
          "rice_bowl",
        dishName:
          "招牌盖饭",
        price:
          28,
        soldCount:
          12
      }
    ],

    research: {
      total:
        1,
      bestDish: {
        name:
          "招牌盖饭"
      }
    },

    procurement: {
      ingredientName:
        "大米",
      currentQuantity:
        12,
      quantity:
        5
    },

    pendingDeliveries:
      1,

    today: {
      revenue:
        860,
      orders:
        31
    },

    time: {
      day:
        18,
      clock:
        "12:25"
    },

    runtime: {
      paused:
        false,
      speed:
        2
    },

    lastMessage:
      "真实数据已连接"
  };
}


test(
  "formal home keeps the background master and real-data shell",
  () => {
    const html =
      renderHomePage(
        fixture(),
        "store"
      );

    assert.match(
      html,
      /background-master-v1/
    );

    assert.match(
      html,
      /formal-primary-v1/
    );

    assert.match(
      html,
      /data-coordinate-space="logical"/
    );

    for (
      const value
      of [
        "测试餐厅",
        "¥123,456",
        "第18天",
        "12:25",
        "★ 4.2",
        "¥860",
        "31",
        "测试商圈"
      ]
    ) {
      assert.ok(
        html.includes(
          value
        ),
        value
      );
    }

    assert.doesNotMatch(
      html,
      /86,240|第28天|12:15|4\.7/
    );

    assert.doesNotMatch(
      html,
      /测试快进 1 小时|data-game-action="advance-hour"/
    );
  }
);


test(
  "formal home exposes exactly five primary routes",
  () => {
    assert.deepEqual(
      PRIMARY_NAV.map(
        item =>
          item.id
      ),
      [
        "store",
        "business",
        "research",
        "staff",
        "more"
      ]
    );

    assert.deepEqual(
      PRIMARY_NAV.map(
        item =>
          item.label
      ),
      [
        "门店",
        "经营",
        "研发",
        "员工",
        "更多"
      ]
    );

    for (
      const page
      of PRIMARY_NAV
    ) {
      const html =
        renderHomePage(
          fixture(),
          page.id
        );

      assert.match(
        html,
        new RegExp(
          `data-primary-page="${page.id}"`
        )
      );

      assert.match(
        html,
        new RegExp(
          `data-nav="${page.id}"`
        )
      );
    }
  }
);


test(
  "formal route skeleton binds real system actions without fake success values",
  () => {
    const business =
      renderHomePage(
        fixture(),
        "business"
      );

    const more =
      renderHomePage(
        fixture(),
        "more"
      );

    assert.match(
      business,
      /data-game-action="purchase"/
    );

    assert.match(
      more,
      /data-game-action="toggle-time"/
    );

    assert.match(
      more,
      /data-game-action="speed"/
    );

    assert.match(
      more,
      /data-game-action="toggle-restaurant"/
    );

    assert.match(
      more,
      /data-game-action="save"/
    );

    assert.doesNotMatch(
      homePage,
      /购买成功|保存成功|营业成功/
    );
  }
);


test(
  "mobile runtime owns route state and keeps one reusable render path",
  () => {
    assert.match(
      mobileApp,
      /let activePage\s*=\s*"store"/
    );

    assert.match(
      mobileApp,
      /PRIMARY_NAV\.map/
    );

    assert.match(
      mobileApp,
      /\[data-nav\]/
    );

    assert.match(
      mobileApp,
      /renderHomePage\(\s*viewModel,\s*activePage\s*\)/
    );

    assert.match(
      mobileApp,
      /getActivePage:\s*\(\) => activePage/
    );
  }
);


test(
  "formal home stays non-scrolling while inner lists may scroll",
  () => {
    for (
      const marker
      of [
        "--screen-scale",
        "--logical-width",
        "--logical-height",
        "--safe-top",
        "--safe-bottom",
        ".home-top-chrome",
        ".home-primary-content",
        ".home-bottom-chrome",
        ".formal-scroll-list"
      ]
    ) {
      assert.ok(
        css.includes(
          marker
        ),
        marker
      );
    }

    const primaryBlocks =
      [
        ...css.matchAll(
          /\.home-primary-content\s*\{([\s\S]*?)\}/g
        )
      ].map(
        match =>
          match[1]
      );

    const positionedPrimary =
      primaryBlocks.find(
        block =>
          /top:/.test(
            block
          )
      ) ??
      "";

    assert.ok(
      positionedPrimary
    );

    assert.match(
      positionedPrimary,
      /overflow:\s*hidden/
    );

    assert.doesNotMatch(
      positionedPrimary,
      /overflow-y:\s*(auto|scroll)/
    );

    assert.match(
      css,
      /\.formal-scroll-list\s*\{[\s\S]*?overflow-y:\s*auto/
    );
  }
);


test(
  "editor keeps responsive logical coordinate support",
  () => {
    assert.match(
      toolkit,
      /city-restaurant-ui-dev-overrides\.v6/
    );

    assert.match(
      toolkit,
      /city-restaurant-ui-dev-project\.v6/
    );

    assert.match(
      toolkit,
      /component-layout-v7-typed-responsive-space/
    );

    assert.match(
      toolkit,
      /function uiScale\(\)/
    );

    assert.match(
      toolkit,
      /function logicalRect\(node\)/
    );
  }
);
