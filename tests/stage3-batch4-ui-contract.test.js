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
  "第三阶段第四批城市房源施工开店页面接入正式游戏外壳",
  () => {
    const sources = [
      [
        "城市地图",
        "../src/ui/pages/city/CityMapView.js"
      ],
      [
        "房源市场",
        "../src/ui/pages/city/CityPropertyView.js"
      ],
      [
        "房源详情",
        "../src/ui/pages/city/PropertyDetailView.js"
      ],
      [
        "装修施工",
        "../src/ui/renovation/RenovationConstructionView.js"
      ],
      [
        "开店准备",
        "../src/ui/pages/opening/OpeningSetupView.js"
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
        `${name}缺少统一顶部栏`
      );

      assert.ok(
        source.includes(
          "renderBottomNavigation"
        ),
        `${name}缺少统一底部导航`
      );
    }
  }
);


test(
  "城市首页使用新版主视觉，房源页保留统一标题",
  () => {
    const city =
      read(
        "../src/ui/pages/city/CityMapView.js"
      );

    const properties =
      read(
        "../src/ui/pages/city/CityPropertyView.js"
      );

    const detail =
      read(
        "../src/ui/pages/city/PropertyDetailView.js"
      );

    for (const source of [city, properties, detail]) {
      assert.ok(
        source.includes(
          "renderNoticeTicker"
        )
      );
    }

    assert.ok(city.includes("city-home-hero"));
    assert.ok(city.includes("城市发展"));
    assert.ok(!city.includes("renderPageTitle"));

    for (const source of [properties, detail]) {
      assert.ok(
        source.includes(
          "renderPageTitle"
        )
      );
    }
  }
);


test(
  "装修与开店流程导航真实可返回和继续",
  () => {
    const opening =
      read(
        "../src/ui/pages/opening/OpeningSetupView.js"
      );

    const construction =
      read(
        "../src/ui/renovation/RenovationConstructionView.js"
      );

    const editor =
      read(
        "../src/ui/renovation/RenovationGameView.js"
      );

    assert.match(
      opening,
      /onNavigate\s*=\s*this\.onNavigate/
    );

    assert.match(
      construction,
      /onNavigate\s*=\s*this\.onNavigate/
    );

    assert.ok(
      editor.includes(
        '"[data-page-target]"'
      )
    );

    assert.ok(
      editor.includes(
        "this.commit("
      )
    );

    assert.ok(
      construction.includes(
        'data-page-target="opening-setup"'
      )
    );
  }
);


test(
  "第四批页面不再暴露开发期视觉占位文案",
  () => {
    const paths = [
      "../src/ui/pages/city/CityMapView.js",
      "../src/ui/pages/city/CityPropertyView.js",
      "../src/ui/pages/city/PropertyDetailView.js",
      "../src/ui/renovation/RenovationConstructionView.js",
      "../src/ui/pages/opening/OpeningSetupView.js"
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
          "户型装饰覆盖层槽位",
          "后续可绑定施工效果图",
          "待正式页面",
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
  "开店主链保持房源装修施工开店经营顺序",
  () => {
    const propertySystem =
      read(
        "../src/ui/pages/city/CityPropertyPageSystem.js"
      );

    const constructionSystem =
      read(
        "../src/ui/renovation/RenovationConstructionPageSystem.js"
      );

    const openingSystem =
      read(
        "../src/ui/pages/opening/OpeningSetupPageSystem.js"
      );

    assert.ok(
      propertySystem.includes(
        'nextPage: "renovation"'
      )
    );

    assert.ok(
      constructionSystem.includes(
        'nextPage:\n        "opening-setup"'
      )
    );

    assert.ok(
      openingSystem.includes(
        'nextPage:\n        "operating-command-center"'
      )
    );
  }
);
