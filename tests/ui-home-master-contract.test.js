import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const mobileApp =
  fs.readFileSync(
    new URL(
      "../client/mobile/MobileApp.js",
      import.meta.url
    ),
    "utf8"
  );

const css =
  fs.readFileSync(
    new URL(
      "../client/mobile/app.css",
      import.meta.url
    ),
    "utf8"
  );

const androidActivity =
  fs.readFileSync(
    new URL(
      "../mobile/android/app/src/main/java/com/cityrestaurant/mobileui/MainActivity.java",
      import.meta.url
    ),
    "utf8"
  );

const demoSeed =
  fs.readFileSync(
    new URL(
      "../client/mobile/DemoSeed.js",
      import.meta.url
    ),
    "utf8"
  );

const buildScript =
  fs.readFileSync(
    new URL(
      "../scripts/build-mobile-ui.mjs",
      import.meta.url
    ),
    "utf8"
  );

const heroAsset =
  fs.statSync(
    new URL(
      "../client/mobile/assets/home/restaurant-hero.jpg",
      import.meta.url
    )
  );

const homeLayout =
  JSON.parse(
    fs.readFileSync(
      new URL(
        "../client/mobile/layout/home.layout.json",
        import.meta.url
      ),
      "utf8"
    )
  );

const devToolkit =
  fs.readFileSync(
    new URL(
      "../client/mobile/DevToolkit.js",
      import.meta.url
    ),
    "utf8"
  );

test(
  "home master keeps the approved reference-inspired module structure",
  () => {
    for (
      const marker
      of [
        "home-top-hud",
        "home-hero-scene",
        "home-metrics",
        "home-opportunity",
        "home-growth-and-dialogue",
        "home-district-and-schedule"
      ]
    ) {
      assert.match(
        mobileApp,
        new RegExp(
          `data-ui-component="${marker}"`
        )
      );
    }

    assert.doesNotMatch(
      mobileApp,
      /store-heading/
    );

    assert.doesNotMatch(
      mobileApp,
      /speed-bar/
    );

    assert.match(
      mobileApp,
      /class="home-hud home-hud-overlay"/
    );

    assert.match(
      mobileApp,
      /class="home-metric-grid home-metric-overlay"/
    );

    assert.match(
      mobileApp,
      /class="hero-artwork"/
    );

    assert.match(
      mobileApp,
      /assets\/home\/restaurant-hero\.jpg/
    );

    assert.doesNotMatch(
      mobileApp,
      /scene-speed|character chef|character server|steam-a|flame|data-speed|data-run/
    );

    assert.match(
      mobileApp,
      /查看完整商圈情报/
    );

    assert.match(
      mobileApp,
      /门店成长/
    );

    assert.match(
      mobileApp,
      /商圈情报/
    );

    assert.match(
      mobileApp,
      /今日日程/
    );
  }
);

test(
  "home master CSS contains one responsive grid implementation",
  () => {
    assert.match(
      css,
      /\.home-hero-shell\s*\{/
    );

    assert.match(
      css,
      /\.home-hud\s*\{/
    );

    assert.match(
      css,
      /\.home-metric-grid\s*\{/
    );

    assert.match(
      css,
      /\.home-dual-grid\s*\{/
    );

    assert.match(
      css,
      /\.home-opportunity\s*\{/
    );

    assert.doesNotMatch(
      css,
      /\.store-heading\s*\{/
    );

    assert.doesNotMatch(
      css,
      /\.speed-bar\s*\{/
    );

    assert.doesNotMatch(
      css,
      /@keyframes (flame|steam|cook-arm|chef-bob|guest-breathe|server-loop|light-breathe)/
    );
  }
);


test(
  "home uses immersive Android viewport without legacy narrow hero collapse",
  () => {
    assert.doesNotMatch(
      css,
      /@media \(max-width: 370px\)[\s\S]*?\.micro-scene\s*\{[\s\S]*?height:\s*246px/
    );

    assert.match(
      androidActivity,
      /SYSTEM_UI_FLAG_IMMERSIVE_STICKY/
    );

    assert.match(
      androidActivity,
      /SYSTEM_UI_FLAG_FULLSCREEN/
    );

    assert.match(
      androidActivity,
      /SYSTEM_UI_FLAG_HIDE_NAVIGATION/
    );
  }
);


test(
  "reference seed and hero asset stay wired into the APK build",
  () => {
    assert.match(
      demoSeed,
      /districtId:\s*"university"/
    );

    assert.match(
      demoSeed,
      /day:\s*18/
    );

    assert.match(
      demoSeed,
      /hour:\s*11/
    );

    assert.match(
      demoSeed,
      /minute:\s*40/
    );

    assert.doesNotMatch(
      mobileApp,
      /timeSystem\s*\.advance\(10\)/
    );

    assert.match(
      buildScript,
      /client\/mobile\/assets/
    );

    assert.doesNotMatch(
      buildScript,
      /assets-src\/home|heroBase64|restaurant hero chunks/
    );

    assert.ok(
      heroAsset.size > 12000,
      "restaurant hero asset should be a non-placeholder JPEG"
    );
  }
);


test(
  "tall-phone layout uses max-aspect-ratio and keeps opportunity header on one row",
  () => {
    assert.match(
      css,
      /@media \(max-aspect-ratio: 9 \/ 18\)/
    );

    assert.doesNotMatch(
      css,
      /@media \(min-aspect-ratio: 9 \/ 18\)/
    );

    assert.doesNotMatch(
      css,
      /@media \(max-width: 370px\)[\s\S]*?\.opportunity-band\s*\{[\s\S]*?grid-template-columns:\s*auto\s+1fr/
    );

    assert.match(
      css,
      /@media \(max-width: 370px\)[\s\S]*?grid-template-columns:\s*68px\s+minmax\(0,1fr\)\s+80px/
    );
  }
);


test(
  "home uses the hybrid static skin architecture with dynamic overlays",
  () => {
    assert.equal(
      homeLayout.version,
      "hybrid-static-v1"
    );

    assert.deepEqual(
      homeLayout.design,
      {
        width: 360,
        height: 640,
        aspect: "9:16"
      }
    );

    for (
      const key
      of [
        "hero",
        "top-hud",
        "kpi-grid",
        "opportunity",
        "upper-panels",
        "growth-panel",
        "dialogue-panel",
        "lower-panels",
        "district-panel",
        "schedule-panel",
        "bottom-nav"
      ]
    ) {
      assert.match(
        mobileApp,
        new RegExp(
          `data-layout-key="${key}"`
        )
      );
    }

    for (
      const skin
      of [
        "hud-card-light.svg",
        "hud-card-dark.svg",
        "kpi-card.svg",
        "opportunity-card.svg",
        "panel-card.svg",
        "nav-base.svg"
      ]
    ) {
      assert.match(
        css,
        new RegExp(
          skin.replace(".", "\\.")
        )
      );
    }

    assert.match(
      mobileApp,
      /homeLayoutStyle\(\)/
    );

    assert.match(
      devToolkit,
      /dataset\.layoutKey/
    );

    assert.match(
      devToolkit,
      /layoutMode:\s*"hybrid-static"/
    );
  }
);


test(
  "touch drag layout editor exposes snap-grid controls for stable master regions",
  () => {
    assert.match(
      devToolkit,
      /dragMode:\s*false/
    );

    assert.match(
      devToolkit,
      /snap:\s*4/
    );

    assert.match(
      devToolkit,
      /data-dev-drag/
    );

    assert.match(
      devToolkit,
      /data-dev-snap/
    );

    assert.match(
      devToolkit,
      /beginLayoutDrag/
    );

    assert.match(
      devToolkit,
      /moveLayoutDrag/
    );

    assert.match(
      devToolkit,
      /finishDragMode/
    );
  }
);
