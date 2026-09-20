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
  "UI V2采用864x1536设计参考但Android触摸目标固定48",
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
      Object.values(
        UI_SPACING
      ),
      [
        4,
        8,
        12,
        16,
        20,
        24,
        32
      ]
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
  "窗口按Android主流宽高Size Class分类",
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

    assert.deepEqual(
      classifyWindow({
        width: 700,
        height: 1000
      }),
      {
        widthClass: "medium",
        heightClass: "expanded",
        orientation: "portrait"
      }
    );

    assert.deepEqual(
      classifyWindow({
        width: 900,
        height: 1200
      }),
      {
        widthClass: "expanded",
        heightClass: "expanded",
        orientation: "portrait"
      }
    );

    assert.equal(
      getPrimaryNavigationMode({
        width: 412,
        height: 915
      }),
      "bottom"
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
  "五项Global Nav是唯一一级导航并使用新ID",
  () => {
    assert.deepEqual(
      PRIMARY_NAV_ITEMS.map(
        item =>
          item.id
      ),
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
        activeId:
          "operations"
      });

    assert.match(
      html,
      /aria-label="主导航"/
    );

    assert.match(
      html,
      /data-ui-destination="operations"/
    );

    assert.doesNotMatch(
      html,
      /operating-command-center|operations-home|employee_roster|more-home|restaurant-home/
    );
  }
);

test(
  "Global HUD只保留高频全局状态且关键数字不省略",
  () => {
    const html =
      renderGlobalHud({
        scopeTitle:
          "测试集团",
        scopeSubtitle:
          "2家门店",
        dateLabel:
          "第12天",
        timeLabel:
          "18:30",
        moneyLabel:
          "¥128,500",
        levelLabel:
          "Lv.6",
        ratingLabel:
          "4.8",
        speed:
          2
      });

    for (
      const action
      of [
        "change-scope",
        "toggle-pause",
        "set-speed"
      ]
    ) {
      assert.match(
        html,
        new RegExp(
          action
        )
      );
    }

    assert.match(
      html,
      /ui-v2-no-truncate-number/
    );

    assert.doesNotMatch(
      html,
      /天气|任务|库存|活动/
    );
  }
);

test(
  "AppShell无fixed底栏且大屏切Navigation Rail",
  () => {
    const shell =
      fs.readFileSync(
        "src/ui-v2/shell/app-shell.css",
        "utf8"
      );

    const nav =
      fs.readFileSync(
        "src/ui-v2/components/global-nav.css",
        "utf8"
      );

    assert.match(
      shell,
      /minmax\(0,1fr\)/
    );

    assert.match(
      shell,
      /@media \(min-width: 840px\)/
    );

    assert.match(
      nav,
      /@media \(min-width: 840px\)/
    );

    assert.doesNotMatch(
      shell + nav,
      /position\s*:\s*fixed/
    );

    assert.doesNotMatch(
      shell + nav,
      /transform\s*:\s*scale\(/
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
      /safe-area-inset-top/
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
      /WindowInsets\.Type\.mandatorySystemGestures\(\)/
    );

    assert.match(
      activity,
      /--ui-native-safe-bottom/
    );
  }
);
