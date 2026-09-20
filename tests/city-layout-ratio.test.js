import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";


test(
  "城市确认稿纵向结构按864设计宽度等比缩放",
  () => {
    const city =
      fs.readFileSync(
        "src/ui/pages/city/city-map.css",
        "utf8"
      );

    const chrome =
      fs.readFileSync(
        "src/ui/theme/game-chrome.css",
        "utf8"
      );

    for (const token of [
      "height: min(14.9vw,129px)",
      "height: min(8.1vw,70px)",
      "height: min(75.8vw,655px)",
      "height: min(50.2vw,434px)"
    ]) {
      assert.equal(
        city.includes(token),
        true,
        "城市纵向比例缺少：" + token
      );
    }

    assert.equal(
      chrome.includes(
        "clamp(76px,11.1vw,96px)"
      ),
      false
    );

    assert.equal(
      chrome.includes(
        "@media (max-width: 520px)"
      ),
      false
    );

    assert.equal(
      city.includes(
        "@media (max-width: 560px)"
      ),
      false
    );

    assert.equal(
      chrome.includes(
        "height: calc(min(15.3vw,132px) + env(safe-area-inset-bottom))"
      ),
      true
    );
  }
);
