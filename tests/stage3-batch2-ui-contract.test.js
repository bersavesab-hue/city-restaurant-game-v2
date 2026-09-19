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
  "第三阶段第二批页面统一接入正式游戏外壳",
  () => {
    const sources = [
      [
        "经营分析",
        "../src/ui/pages/analytics/BusinessAnalyticsView.js"
      ],
      [
        "财务",
        "../src/ui/pages/finance/FinanceCenterView.js"
      ],
      [
        "渠道",
        "../src/ui/pages/channels/ChannelManagementView.js"
      ],
      [
        "顾客",
        "../src/ui/pages/customers/CustomerManagementView.js"
      ]
    ];

    for (
      const [
        name,
        path
      ]
      of sources
    ) {
      const source =
        read(
          path
        );

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

      assert.match(
        source,
        /backTarget:\s*"operations"/
      );
    }
  }
);


test(
  "第三阶段第二批页面不再暴露开发期占位文案",
  () => {
    const paths = [
      "../src/ui/pages/analytics/BusinessAnalyticsView.js",
      "../src/ui/pages/finance/FinanceCenterView.js",
      "../src/ui/pages/channels/ChannelManagementView.js",
      "../src/ui/pages/customers/CustomerManagementView.js"
    ];

    for (
      const path
      of paths
    ) {
      const source =
        read(
          path
        );

      for (
        const forbidden
        of [
          "图片槽位",
          "头像槽位",
          "待正式页面",
          "后续接入",
          "页面尚未接入"
        ]
      ) {
        assert.equal(
          source.includes(
            forbidden
          ),
          false,
          `${path}仍包含开发期文案：${forbidden}`
        );
      }
    }
  }
);


test(
  "第二批正式页面样式全部进入主主题",
  () => {
    const theme =
      read(
        "../src/ui/theme/theme.css"
      );

    for (
      const file
      of [
        "business-analytics.css",
        "finance-center.css",
        "channel-management.css",
        "customer-management.css"
      ]
    ) {
      assert.ok(
        theme.includes(
          file
        ),
        `主主题缺少：${file}`
      );
    }
  }
);
