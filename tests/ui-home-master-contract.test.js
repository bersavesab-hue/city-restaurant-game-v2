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

const homePage =
  fs.readFileSync(
    new URL(
      "../client/mobile/HomePage.js",
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

const toolkit =
  fs.readFileSync(
    new URL(
      "../client/mobile/DevToolkit.js",
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

const heroUrl =
  new URL(
    "../client/mobile/assets/home/restaurant-hero.jpg",
    import.meta.url
  );

test(
  "store homepage is component based instead of a baked full-screen master",
  () => {
    assert.match(
      mobileApp,
      /renderHomePage/
    );

    assert.match(
      mobileApp,
      /store-component-shell/
    );

    assert.doesNotMatch(
      mobileApp,
      /home-master-page|store-master-shell|home-live-overlay|hotspot-/
    );

    assert.doesNotMatch(
      homePage,
      /home-master\.webp|home-master-20x9\.webp/
    );

    assert.match(
      homePage,
      /assets\/home\/restaurant-hero\.jpg/
    );

    assert.ok(
      fs.statSync(heroUrl).size > 12000,
      "restaurant hero should be a real standalone JPEG"
    );
  }
);

test(
  "homepage exposes independently editable UI components",
  () => {
    for (
      const key
      of [
        "home-page",
        "home-scene",
        "home-hud",
        "home-kpis",
        "home-opportunity",
        "home-upper-grid",
        "home-growth",
        "home-dialogue",
        "home-lower-grid",
        "home-district",
        "home-schedule",
        "home-bottom-nav"
      ]
    ) {
      assert.match(
        homePage,
        new RegExp(
          `data-layout-key="${key}"`
        )
      );
    }

    assert.match(
      homePage,
      /data-home-layout-version="component-v1"/
    );
  }
);

test(
  "dynamic restaurant data is rendered directly inside components",
  () => {
    for (
      const marker
      of [
        "model.time.day",
        "model.time.clock",
        "model.money.balance",
        "model.money.todayRevenue",
        "model.money.todayProfit",
        "model.restaurant.satisfaction",
        "model.operations.employees",
        "model.opportunity.title",
        "model.progress.progress",
        "model.dialogue.slice",
        "model.district",
        "model.schedule.slice"
      ]
    ) {
      assert.match(
        homePage,
        new RegExp(
          marker
            .replaceAll(".", "\\.")
        )
      );
    }

    assert.doesNotMatch(
      homePage,
      /position:\s*absolute[^\n]*top:\s*\d+%/
    );
  }
);

test(
  "component layout uses normal grid flow for the dashboard",
  () => {
    assert.match(
      css,
      /\.home-components-page\s*\{[\s\S]*?display:\s*grid/
    );

    assert.match(
      css,
      /\.home-component-grid\s*\{[\s\S]*?grid-template-columns/
    );

    assert.match(
      css,
      /\.home-component-nav\s*\{/
    );

    assert.doesNotMatch(
      css,
      /\.home-master-page\s*\{|\.home-live-overlay\s*\{|\.home-hotspot\s*\{/
    );
  }
);

test(
  "in-game editor targets components instead of a static mother image",
  () => {
    assert.match(
      toolkit,
      /组件排版/
    );

    assert.match(
      toolkit,
      /只会选中首页组件/
    );

    assert.match(
      toolkit,
      /layoutMode:\s*"component-layout-v1"/
    );

    assert.match(
      toolkit,
      /\[data-layout-key\]/
    );

    assert.match(
      toolkit,
      /startDragMode/
    );
  }
);

test(
  "Android remains immersive for the component homepage",
  () => {
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
