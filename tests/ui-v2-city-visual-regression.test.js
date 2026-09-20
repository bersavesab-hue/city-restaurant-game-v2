import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  APP_SHELL_REGIONS
} from "../src/ui-v2/shell/AppShellContract.js";

import {
  renderAppShell
} from "../src/ui-v2/shell/AppShell.js";

import {
  CITY_MAP_VISUAL_LAYOUT
} from "../src/ui-v2/pages/city/CityMapVisualLayout.js";

test(
  "Safe Area并入HUD与Nav而不是独立白色行",
  () => {
    assert.deepEqual(
      APP_SHELL_REGIONS,
      [
        "global-hud",
        "page-content",
        "global-nav"
      ]
    );

    const html =
      renderAppShell();

    assert.doesNotMatch(
      html,
      /safe-top|safe-bottom/
    );

    const css =
      fs.readFileSync(
        "src/ui-v2/shell/app-shell.css",
        "utf8"
      );

    assert.match(
      css,
      /var\(--ui-safe-top\)/
    );

    assert.match(
      css,
      /var\(--ui-safe-bottom\)/
    );
  }
);

test(
  "所有手机HUD保持单排不再出现Compact双层HUD",
  () => {
    const css =
      fs.readFileSync(
        "src/ui-v2/components/global-hud.css",
        "utf8"
      );

    assert.doesNotMatch(
      css,
      /"identity resources"\s*"simulation simulation"/
    );

    assert.match(
      css,
      /"identity simulation resources"/
    );
  }
);

test(
  "运行UI不再依赖AI大图Sprite Atlas",
  () => {
    const css =
      fs.readFileSync(
        "src/ui-v2/assets/ui-assets.css",
        "utf8"
      );

    const contract =
      fs.readFileSync(
        "src/ui-v2/assets/CityVisualAssetContract.js",
        "utf8"
      );

    assert.doesNotMatch(
      css,
      /atlas/i
    );

    assert.match(
      contract,
      /spriteAtlas:\s*false/
    );

    for (
      const path
      of [
        "assets/ui-v2/icons/shared/money.svg",
        "assets/ui-v2/icons/nav/city.svg",
        "assets/ui-v2/icons/map/locate.svg",
        "assets/ui-v2/icons/metric/traffic.svg",
        "assets/ui-v2/icons/action/search.svg",
        "assets/ui-v2/icons/regions/core.svg"
      ]
    ) {
      assert.equal(
        fs.existsSync(
          path
        ),
        true
      );
    }
  }
);

test(
  "核心商圈使用专属视觉坐标而不是业务mapPosition",
  () => {
    assert.deepEqual(
      CITY_MAP_VISUAL_LAYOUT.cbd,
      {
        x: 40,
        y: 42,
        theme: "yellow",
        iconKey: "building"
      }
    );

    assert.equal(
      CITY_MAP_VISUAL_LAYOUT.university.y,
      14
    );

    assert.equal(
      CITY_MAP_VISUAL_LAYOUT.nightlife.theme,
      "pink"
    );

    assert.equal(
      CITY_MAP_VISUAL_LAYOUT.waterfront_leisure.iconKey,
      "waterfront"
    );
  }
);

test(
  "详情与今日机会缩略图直接使用正式城市主图裁切",
  () => {
    const css =
      fs.readFileSync(
        "src/ui-v2/assets/ui-assets.css",
        "utf8"
      );

    assert.match(
      css,
      /ui-v2-city-detail__image[\s\S]*var\(--ui-city-map-image\)/
    );

    assert.match(
      css,
      /data-image-key="cbd"/
    );
  }
);
