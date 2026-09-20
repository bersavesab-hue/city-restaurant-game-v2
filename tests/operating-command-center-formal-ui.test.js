import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";


test(
  "门店一级页使用确认版结构且门店卡由统一模板动态渲染",
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
        "门店管理",
        "集团经营概况",
        "旗下门店",
        "新开门店",
        "营业中 (",
        "筹备中 (",
        "异常 (",
        "今日待办",
        "门店管理功能",
        "装修布局",
        "门店设施",
        "租约管理",
        "开店准备",
        "renderStoreCard",
        "data-store-state",
        "data-restaurant-id",
        "store-filter-all",
        "store-filter-open",
        "store-filter-preparing",
        "store-filter-abnormal",
        "renderGameTopBar",
        "renderBottomNavigation"
      ]
    ) {
      assert.equal(
        source.includes(
          text
        ),
        true,
        "门店确认版主页缺少：" +
          text
      );
    }

    assert.equal(
      source.includes(
        "热销菜品"
      ),
      false
    );

    assert.equal(
      source.includes(
        "库存与采购预警"
      ),
      false
    );

    assert.equal(
      source.includes(
        "城市小贴士"
      ),
      false
    );
  }
);


test(
  "门店页样式支持动态横向门店列表和四类筛选",
  () => {
    const css =
      fs.readFileSync(
        new URL(
          "../src/ui/pages/command-center/command-center.css",
          import.meta.url
        ),
        "utf8"
      );

    for (
      const contract
      of [
        ".store-hub-cards",
        "overflow-x: auto",
        ".store-hub-card",
        "#store-filter-open:checked",
        "#store-filter-preparing:checked",
        "#store-filter-abnormal:checked",
        "grid-template-columns: repeat(4,minmax(0,1fr))"
      ]
    ) {
      assert.equal(
        css.includes(
          contract
        ),
        true,
        "门店动态结构缺少：" +
          contract
      );
    }
  }
);
