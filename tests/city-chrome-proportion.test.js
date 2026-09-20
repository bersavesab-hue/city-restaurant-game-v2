import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";


test(
  "城市公共HUD和底栏不得用固定最小高度撑坏1536比例",
  () => {
    const css =
      fs.readFileSync(
        "src/ui/theme/game-chrome.css",
        "utf8"
      );

    assert.equal(
      css.includes(
        "min-height:\n    82px"
      ),
      false
    );

    assert.equal(
      css.includes(
        "min-height:\n    118px"
      ),
      false
    );

    assert.equal(
      css.includes(
        "grid-template-columns:\n    15%\n    31%\n    minmax(0,54%)"
      ),
      true
    );
  }
);
