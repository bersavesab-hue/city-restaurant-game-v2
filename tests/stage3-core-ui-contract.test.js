import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";


function read(
  relativePath
) {
  return fs.readFileSync(
    new URL(
      relativePath,
      import.meta.url
    ),
    "utf8"
  );
}


test(
  "第三阶段核心页面统一使用正式全局导航",
  () => {
    const dish =
      read(
        "../src/ui/pages/dishes/DishCenterView.js"
      );

    const supply =
      read(
        "../src/ui/pages/supply/SupplyManagementView.js"
      );

    const employees =
      read(
        "../src/ui/pages/employees/EmployeeManagementView.js"
      );

    for (
      const [
        name,
        source
      ]
      of [
        [
          "菜品",
          dish
        ],
        [
          "供应链",
          supply
        ],
        [
          "员工",
          employees
        ]
      ]
    ) {
      assert.ok(
        source.includes(
          "renderGameTopBar"
        ),
        `${name}页缺少统一顶部栏`
      );

      assert.ok(
        source.includes(
          "renderPageTitle"
        ),
        `${name}页缺少统一页面标题`
      );

      assert.ok(
        source.includes(
          "renderBottomNavigation"
        ),
        `${name}页缺少统一底部导航`
      );
    }
  }
);


test(
  "菜品供应链员工返回路径保持在正确主模块",
  () => {
    const dish =
      read(
        "../src/ui/pages/dishes/DishCenterView.js"
      );

    const supply =
      read(
        "../src/ui/pages/supply/SupplyManagementView.js"
      );

    const employees =
      read(
        "../src/ui/pages/employees/EmployeeManagementView.js"
      );

    assert.match(
      dish,
      /backTarget:\s*"operations"/
    );

    assert.match(
      supply,
      /backTarget:\s*"operations"/
    );

    assert.match(
      employees,
      /backTarget:\s*"employees"/
    );
  }
);


test(
  "第三阶段核心页面不再出现开发期图片占位文案",
  () => {
    const sources =
      [
        "../src/ui/pages/dishes/DishCenterView.js",
        "../src/ui/pages/supply/SupplyManagementView.js",
        "../src/ui/pages/employees/EmployeeManagementView.js"
      ]
        .map(
          read
        );

    for (
      const source
      of sources
    ) {
      assert.equal(
        source.includes(
          "图片槽位"
        ),
        false
      );

      assert.equal(
        source.includes(
          "头像槽位"
        ),
        false
      );

      assert.equal(
        source.includes(
          "待正式页面"
        ),
        false
      );
    }
  }
);
