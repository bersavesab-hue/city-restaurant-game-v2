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
        "store-home-hero",
        "assets/images/ui/store-home/hero/store-hero.webp",
        "command-center__store-artwork-grid",
        "dining-layout.webp",
        "kitchen-equipment.webp",
        "store-renovation.webp",
        "service-quality.webp",
        "opening-hours.webp",
        "environment-hygiene.webp",
        "command-dish-",
        "command-employee-",
        "command-ingredient-",
        "market-strategy",
        "command-center__store-strip",
        "data-restaurant-id",
        "集团经营范围",
        "is-group-scope",
        "command-center__identity-meta"
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

    assert.equal(
      source.includes(
        "图片槽位"
      ),
      false
    );

    assert.equal(
      source.includes(
        "门店经营场景图片槽位"
      ),
      false
    );
  }
);

test(
  "门店一级页使用成稿校正后的大场景三指标和移动端点击尺寸",
  () => {
    const css = fs.readFileSync(
      new URL("../src/ui/pages/command-center/command-center.css", import.meta.url),
      "utf8"
    );

    for (const contract of [
      "--cc-card-radius: 14px",
      "min-height: clamp(230px, 43vw, 326px)",
      "grid-template-columns: repeat(3, minmax(0, 1fr))",
      "min-height: 44px"
    ]) {
      assert.equal(css.includes(contract), true, "门店成稿校正缺少：" + contract);
    }
  }
);
