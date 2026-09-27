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

const devCss =
  fs.readFileSync(
    new URL(
      "../client/mobile/devtools.css",
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

test(
  "store starts from a truly empty upload-first canvas",
  () => {
    assert.match(
      mobileApp,
      /return renderHomePage\(\)/
    );

    assert.match(
      homePage,
      /class="home-editor-canvas"/
    );

    assert.match(
      homePage,
      /data-layout-key="home-page"/
    );

    assert.match(
      homePage,
      /blank-canvas-v\d+/
    );

    assert.doesNotMatch(
      homePage,
      /home-hud|home-kpi|home-opportunity|home-growth|home-dialogue|home-district|home-schedule|home-component-nav|restaurant-hero/
    );

    assert.doesNotMatch(
      mobileApp,
      /home-master|home-live-overlay|hotspot-/
    );
  }
);

test(
  "old built-in homepage styling is removed",
  () => {
    assert.match(
      css,
      /\.home-editor-canvas\s*\{/
    );

    assert.doesNotMatch(
      css,
      /\.home-component-hud\s*\{|\.home-component-kpis\s*\{|\.home-opportunity-card\s*\{|\.home-growth-card\s*\{|\.home-dialogue-card\s*\{|\.home-district-card\s*\{|\.home-schedule-card\s*\{|\.home-component-nav\s*\{/
    );
  }
);

test(
  "editor starts from fresh v3 storage instead of restoring old layout",
  () => {
    assert.match(
      toolkit,
      /city-restaurant-ui-dev-overrides\.v3/
    );

    assert.match(
      toolkit,
      /city-restaurant-ui-dev-project\.v3/
    );

    assert.doesNotMatch(
      toolkit,
      /LEGACY_STORAGE_KEY/
    );

    assert.match(
      toolkit,
      /component-layout-v3-clean/
    );
  }
);

test(
  "blank canvas always exposes the mobile UI editor launcher",
  () => {
    assert.match(
      toolkit,
      /data-dev-open/
    );

    assert.match(
      toolkit,
      /上传排版/
    );

    assert.match(
      devCss,
      /\.ui-dev-launcher\s*\{/
    );
  }
);

test(
  "upload-first editor supports component CRUD touch resize and layers",
  () => {
    for (
      const marker
      of [
        "function deleteSelected",
        "function duplicateSelected",
        "function setLayer",
        "function chooseImage",
        "function handleImageFile",
        "function beginResize",
        "function moveResize",
        "data-dev-upload",
        "data-dev-replace-image",
        "data-dev-layer",
        "data-dev-resize",
        "data-dev-custom"
      ]
    ) {
      assert.match(
        toolkit,
        new RegExp(marker)
      );
    }

    assert.match(
      toolkit,
      /删除原组件/
    );

    assert.match(
      toolkit,
      /删除上传组件/
    );
  }
);

test(
  "Android WebView can pick images from the phone",
  () => {
    assert.match(
      androidActivity,
      /onShowFileChooser/
    );

    assert.match(
      androidActivity,
      /REQUEST_FILE_CHOOSER/
    );

    assert.match(
      androidActivity,
      /FileChooserParams[\s\S]*?\.parseResult/
    );

    assert.match(
      androidActivity,
      /setAllowContentAccess\(true\)/
    );
  }
);

test(
  "Android remains immersive",
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
