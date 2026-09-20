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
  classifyViewport
} from "../src/ui-v2/shell/AppShellContract.js";

test(
  "UI V2 Design System锁定864x1536设计基准和44px最小点击区",
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
      44
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
  "AppShell固定安全区HUD内容导航安全区五层结构",
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
  "不同手机按宽高比分档而不是按具体机型分叉",
  () => {
    assert.equal(
      classifyViewport({
        width: 720,
        height: 1600
      }),
      "tall-phone"
    );

    assert.equal(
      classifyViewport({
        width: 1080,
        height: 2160
      }),
      "standard-phone"
    );

    assert.equal(
      classifyViewport({
        width: 1200,
        height: 2000
      }),
      "wide-phone-tablet"
    );

    assert.equal(
      classifyViewport({
        width: 1600,
        height: 900
      }),
      "landscape"
    );
  }
);

test(
  "AppShell禁止整页百分比切割和fixed底栏旧模式",
  () => {
    const shell =
      fs.readFileSync(
        "src/ui-v2/shell/app-shell.css",
        "utf8"
      );

    assert.match(
      shell,
      /minmax\(0,1fr\)/
    );

    assert.match(
      shell,
      /safe-area-inset-top/
    );

    assert.match(
      shell,
      /safe-area-inset-bottom/
    );

    assert.doesNotMatch(
      shell,
      /position\s*:\s*fixed/
    );

    assert.doesNotMatch(
      shell,
      /transform\s*:\s*scale\(/
    );
  }
);
