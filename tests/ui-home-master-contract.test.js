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

const buildScript =
  fs.readFileSync(
    new URL(
      "../scripts/build-mobile-ui.mjs",
      import.meta.url
    ),
    "utf8"
  );

const masterUrl =
  new URL(
    "../client/mobile/assets/home/home-master.webp",
    import.meta.url
  );

test(
  "store homepage uses exactly one approved static master image",
  () => {
    assert.match(
      mobileApp,
      /class="home-master-page"/
    );

    assert.match(
      mobileApp,
      /assets\/home\/home-master\.webp/
    );

    assert.doesNotMatch(
      mobileApp,
      /homeLayout|sceneMarkup|home-hero-scene|home-top-hud|home-metrics|home-opportunity|home-growth-and-dialogue|home-district-and-schedule/
    );

    assert.doesNotMatch(
      mobileApp,
      /restaurant-hero\.jpg|hud-card-light\.svg|hud-card-dark\.svg|kpi-card\.svg|opportunity-card\.svg|panel-card\.svg|nav-base\.svg/
    );
  }
);

test(
  "master keeps interaction through invisible hotspots only",
  () => {
    for (
      const marker
      of [
        "hotspot-settings",
        "hotspot-opportunity-more",
        "hotspot-opportunity-enter",
        "hotspot-renovation",
        "hotspot-staff-shortcut",
        "hotspot-research-shortcut",
        "hotspot-business-shortcut",
        "hotspot-nav-store",
        "hotspot-nav-business",
        "hotspot-nav-research",
        "hotspot-nav-staff",
        "hotspot-nav-more"
      ]
    ) {
      assert.match(
        mobileApp,
        new RegExp(marker)
      );
    }

    assert.match(
      css,
      /\.home-hotspot\s*\{[\s\S]*?opacity:\s*0/
    );
  }
);

test(
  "store master is rendered on a strict 9 by 16 canvas",
  () => {
    assert.match(
      css,
      /\.mobile-shell\.store-master-shell\s*\{[\s\S]*?aspect-ratio:\s*9\s*\/\s*16/
    );

    assert.match(
      css,
      /\.home-master-artwork\s*\{[\s\S]*?width:\s*100%[\s\S]*?height:\s*100%/
    );

    assert.doesNotMatch(
      css,
      /\.home-hero-shell|\.home-hud\s*\{|\.home-metric-grid|\.home-opportunity\s*\{|\.home-dual-grid|\.home-panel\s*\{/
    );
  }
);

test(
  "approved master asset is packaged directly without reconstruction chunks",
  () => {
    assert.ok(
      fs.statSync(masterUrl).size > 100000,
      "approved master should be the full 720x1280 WebP"
    );

    assert.match(
      buildScript,
      /client\/mobile\/assets/
    );

    assert.doesNotMatch(
      buildScript,
      /assets-src\/home-master|assets-src\/home\/master|heroBase64|part-\d+\.b64/
    );

    assert.equal(
      fs.existsSync(
        new URL(
          "../client/mobile/layout/home.layout.json",
          import.meta.url
        )
      ),
      false
    );
  }
);

test(
  "Android stays immersive while showing the 9 by 16 master",
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


test(
  "20x9 long-screen master fills tall phones without changing the 9x16 fallback",
  () => {
    const longMaster =
      new URL(
        "../client/mobile/assets/home/home-master-20x9.webp",
        import.meta.url
      );

    assert.ok(
      fs.statSync(longMaster).size > 150000,
      "20x9 master should be the full long-screen WebP"
    );

    assert.match(
      mobileApp,
      /max-aspect-ratio:\s*1\/2/
    );

    assert.match(
      mobileApp,
      /home-master-20x9\.webp/
    );

    assert.match(
      mobileApp,
      /home-master\.webp/
    );

    assert.match(
      css,
      /@media \(max-aspect-ratio: 1 \/ 2\)/
    );

    assert.match(
      css,
      /@media \(max-aspect-ratio: 1 \/ 2\)[\s\S]*?height:\s*100dvh/
    );

    assert.match(
      css,
      /@media \(max-aspect-ratio: 1 \/ 2\)[\s\S]*?\.hotspot-nav-store/
    );
  }
);
