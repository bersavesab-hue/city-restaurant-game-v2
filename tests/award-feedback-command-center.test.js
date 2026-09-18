import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";


test("经营总控展示评奖倒计时冲榜和奖项通知入口", () => {
  const source=
    fs.readFileSync(
      new URL(
        "../src/ui/pages/command-center/OperatingCommandCenterView.js",
        import.meta.url
      ),
      "utf8"
    );

  assert.match(
    source,
    /榜单与奖项进度/
  );

  assert.match(
    source,
    /ranking-center/
  );

  assert.match(
    source,
    /awards-center/
  );

  assert.match(
    source,
    /honor-hall/
  );

  assert.match(
    source,
    /awardFeedback/
  );
});
