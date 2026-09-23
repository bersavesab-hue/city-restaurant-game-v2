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
      /client\/mobile\/assets-src\/home/
    );

    assert.match(
      buildScript,
      /Expected 4 restaurant hero chunks/
    );

    assert.match(
      buildScript,
      /Buffer\.from\(\s*heroBase64,\s*"base64"\s*\)/
    );

    assert.match(
      buildScript,
      /Restaurant hero asset decode failed/
    );

    assert.match(
      buildScript,
      /path\.join\(\s*heroOutputDirectory,\s*"restaurant-hero\.jpg"\s*\)/
    );
  }
);
