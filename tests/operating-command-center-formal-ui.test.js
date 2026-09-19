import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";


test(
  "经营总控正式UI包含热销菜员工库存市场和独立图片槽位",
  () => {
    const source =
      fs.readFileSync(
        new URL(
          "../src/ui/pages/command-center/OperatingCommandCenterView.js",
          import.meta.url
        ),
        "utf8"
      );

    for (
      const text
      of [
        "热销菜品",
        "员工状态",
        "库存与采购预警",
        "市场与口碑",
        "快捷入口",
        "command-center-hero",
        "command-dish-",
        "command-employee-",
        "command-ingredient-",
        "market-strategy"
      ]
    ) {
      assert.equal(
        source.includes(
          text
        ),
        true,
        "经营总控正式UI缺少：" +
          text
      );
    }
  }
);
