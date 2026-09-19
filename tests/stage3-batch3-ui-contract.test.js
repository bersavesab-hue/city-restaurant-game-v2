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
  "第三阶段第三批竞争荣誉页面统一接入正式游戏外壳",
  () => {
    const sources = [
      [
        "市场与竞争",
        "../src/ui/pages/market-strategy/MarketStrategyView.js",
        "operations"
      ],
      [
        "排行榜",
        "../src/ui/pages/ranking/RankingCenterView.js",
        "market-strategy"
      ],
      [
        "奖项中心",
        "../src/ui/pages/awards/AwardsView.js",
        "ranking-center"
      ],
      [
        "荣誉馆",
        "../src/ui/pages/honors/HonorHallView.js",
        "awards-center"
      ]
    ];

    for (
      const [
        name,
        path,
        backTarget
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
        `${name}缺少统一顶部栏`
      );

      assert.ok(
        source.includes(
          "renderNoticeTicker"
        ),
        `${name}缺少统一公告栏`
      );

      assert.ok(
        source.includes(
          "renderPageTitle"
        ),
        `${name}缺少统一标题栏`
      );

      assert.ok(
        source.includes(
          "renderBottomNavigation"
        ),
        `${name}缺少统一底部导航`
      );

      assert.ok(
        source.includes(
          `backTarget:
            "${backTarget}"`
        ),
        `${name}返回路径不正确`
      );
    }
  }
);


test(
  "第三阶段第三批页面模型提供统一顶部数据和公告数据",
  () => {
    const paths = [
      "../src/ui/pages/market-strategy/MarketStrategyPageSystem.js",
      "../src/ui/pages/ranking/RankingCenterPageSystem.js",
      "../src/ui/pages/awards/AwardsPageSystem.js",
      "../src/ui/pages/honors/HonorHallPageSystem.js"
    ];

    for (
      const path
      of paths
    ) {
      const source =
        read(
          path
        );

      assert.ok(
        source.includes(
          "buildFormalPageChrome"
        ),
        `${path}未使用统一页面模型`
      );

      assert.ok(
        source.includes(
          "topBar:"
        ),
        `${path}缺少topBar`
      );

      assert.ok(
        source.includes(
          "noticeTicker:"
        ),
        `${path}缺少noticeTicker`
      );
    }
  }
);


test(
  "第三阶段第三批页面样式全部载入主主题",
  () => {
    const theme =
      read(
        "../src/ui/theme/theme.css"
      );

    for (
      const file
      of [
        "market-strategy.css",
        "ranking-center.css",
        "awards-center.css",
        "honor-hall.css"
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


test(
  "竞争荣誉页面不再暴露开发期占位文案",
  () => {
    const paths = [
      "../src/ui/pages/market-strategy/MarketStrategyView.js",
      "../src/ui/pages/ranking/RankingCenterView.js",
      "../src/ui/pages/awards/AwardsView.js",
      "../src/ui/pages/honors/HonorHallView.js"
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
  "荣誉馆提供周期类别与对象三维筛选",
  () => {
    const source =
      read(
        "../src/ui/pages/honors/HonorHallView.js"
      );

    assert.ok(
      source.includes(
        "data-honor-period"
      )
    );

    assert.ok(
      source.includes(
        "data-honor-division"
      )
    );

    assert.ok(
      source.includes(
        "data-honor-subject"
      )
    );
  }
);
