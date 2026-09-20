import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  DESIGN_REFERENCE,
  UI_HIT_TARGET,
  UI_SPACING
} from "../src/ui-v2/tokens/tokens.js";

import {
  APP_SHELL_REGIONS,
  classifyWindow,
  getPrimaryNavigationMode
} from "../src/ui-v2/shell/AppShellContract.js";

import {
  PRIMARY_NAV_ITEMS,
  renderGlobalNav
} from "../src/ui-v2/components/GlobalNav.js";

import {
  renderGlobalHud
} from "../src/ui-v2/components/GlobalHud.js";

test(
  "UI V2采用864x1536设计参考且Android触摸目标固定48",
  () => {
    assert.deepEqual(
      DESIGN_REFERENCE,
      {
        width: 864,
        height: 1536,
        orientation: "portrait"
      }
    );

    assert.equal(
      UI_HIT_TARGET.minimum,
      48
    );

    assert.deepEqual(
      Object.values(UI_SPACING),
      [4,8,12,16,20,24,32]
    );
  }
);

test(
  "AppShell保持安全区HUD内容导航安全区五层结构",
  () => {
    assert.deepEqual(
      APP_SHELL_REGIONS,
      [
        "safe-top",
        "global-hud",
        "page-content",
        "global-nav",
        "safe-bottom"
      ]
    );
  }
);

test(
  "窗口按宽高Size Class分类",
  () => {
    assert.deepEqual(
      classifyWindow({
        width: 412,
        height: 915
      }),
      {
        widthClass: "compact",
        heightClass: "expanded",
        orientation: "portrait"
      }
    );

    assert.equal(
      getPrimaryNavigationMode({
        width: 900,
        height: 1200
      }),
      "rail"
    );
  }
);

test(
  "五项Global Nav保持唯一一级导航",
  () => {
    assert.deepEqual(
      PRIMARY_NAV_ITEMS.map(item => item.id),
      [
        "city",
        "store",
        "operations",
        "employees",
        "more"
      ]
    );

    const html =
      renderGlobalNav({
        activeId: "city"
      });

    assert.match(
      html,
      /data-ui-destination="city"/
    );

    assert.doesNotMatch(
      html,
      /operating-command-center|operations-home|employee_roster|more-home|restaurant-home/
    );
  }
);

test(
  "Global HUD严格采用城市参考稿字段与结构",
  () => {
    const html =
      renderGlobalHud({
        scopeTitle: "集团视角",
        scopeSubtitle: "管理旗下3家门店",
        dateLabel: "第1年 4月10日 周三",
        timeLabel: "11:30",
        weatherKey: "sunny",
        weatherLabel: "晴",
        moneyLabel: "¥52,800",
        levelLabel: "Lv.3",
        ratingLabel: "4.8",
        speed: 1
      });

    assert.match(
      html,
      /data-hud-preset="city"/
    );

    for (
      const slot
      of [
        "store-avatar",
        "scope-chevron",
        "weather",
        "money",
        "plus",
        "level",
        "rating"
      ]
    ) {
      assert.match(
        html,
        new RegExp(
          slot
        )
      );
    }

    for (
      const action
      of [
        "change-scope",
        "toggle-pause",
        "set-speed",
        "open-funds"
      ]
    ) {
      assert.match(
        html,
        new RegExp(
          action
        )
      );
    }

    assert.doesNotMatch(
      html,
      /员工人数|会员人数|库存|任务/
    );
  }
);

test(
  "HUD窄屏只重排不建立第二套结构且关键数值不截断",
  () => {
    const css =
      fs.readFileSync(
        "src/ui-v2/components/global-hud.css",
        "utf8"
      );

    assert.match(
      css,
      /@media \(max-width: 399px\)/
    );

    assert.match(
      css,
      /grid-template-areas:\s*"identity resources"\s*"simulation simulation"/
    );

    assert.doesNotMatch(
      css,
      /text-overflow:\s*ellipsis[\s\S]*ui-v2-no-truncate-number/
    );

    assert.doesNotMatch(
      css,
      /position\s*:\s*fixed/
    );
  }
);

test(
  "Safe Area同时读取CSS env与Android Native Insets",
  () => {
    const tokens =
      fs.readFileSync(
        "src/ui-v2/tokens/tokens.css",
        "utf8"
      );

    const activity =
      fs.readFileSync(
        "android/app/src/main/java/com/cityrestaurant/game/MainActivity.java",
        "utf8"
      );

    assert.match(
      tokens,
      /--ui-native-safe-top/
    );

    assert.match(
      activity,
      /WindowInsets\.Type\.displayCutout\(\)/
    );

    assert.match(
      activity,
      /--ui-native-safe-bottom/
    );
  }
);
