import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  normalizeActivePageId,
  renderAppShell
} from "../src/ui-v2/shell/AppShell.js";

test(
  "UI V2运行时只保留唯一AppShell和五项一级导航",
  () => {
    const html =
      renderAppShell({
        activePageId:
          "city",

        hudModel: {
          scopeTitle:
            "集团视角",
          scopeSubtitle:
            "管理旗下3家门店",
          dateLabel:
            "第1天",
          timeLabel:
            "08:00",
          moneyLabel:
            "¥52,800",
          levelLabel:
            "Lv.3",
          ratingLabel:
            "4.8",
          speed:
            1
        }
      });

    assert.equal(
      (
        html.match(
          /data-ui="global-hud"/g
        ) ??
        []
      ).length,
      1
    );

    assert.equal(
      (
        html.match(
          /data-ui="global-nav"/g
        ) ??
        []
      ).length,
      1
    );

    assert.equal(
      (
        html.match(
          /data-ui="page-content"/g
        ) ??
        []
      ).length,
      1
    );

    assert.doesNotMatch(
      html,
      /operating-command-center|operations-home|employee_roster|more-home|restaurant-home/
    );
  }
);

test(
  "非法一级入口不会建立兼容别名而是回到city",
  () => {
    assert.equal(
      normalizeActivePageId(
        "operations-home"
      ),
      "city"
    );
  }
);

test(
  "Android启动链挂载UI V2且旧Canvas入口已物理删除",
  () => {
    assert.equal(
      fs.existsSync(
        "android/entry.js"
      ),
      false
    );

    const bootstrap =
      fs.readFileSync(
        "src/runtime/AndroidBootstrap.js",
        "utf8"
      );

    const build =
      fs.readFileSync(
        "scripts/build-android-js.mjs",
        "utf8"
      );

    assert.match(
      bootstrap,
      /mountAppShell/
    );

    assert.match(
      bootstrap,
      /toggle-pause/
    );

    assert.match(
      bootstrap,
      /set-speed/
    );

    assert.doesNotMatch(
      bootstrap,
      /uiState\s*=\s*["']reset/
    );

    assert.match(
      build,
      /game\.css/
    );

    for (
      const stylesheet
      of [
        "tokens.css",
        "app-shell.css",
        "global-hud.css",
        "global-nav.css"
      ]
    ) {
      assert.match(
        build,
        new RegExp(
          stylesheet.replace(
            ".",
            "\\."
          )
        )
      );
    }
  }
);
