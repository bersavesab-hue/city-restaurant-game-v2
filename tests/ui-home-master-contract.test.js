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


test(
  "live HUD and KPI overlay replaces master sample values without rebuilding the master",
  () => {
    for (
      const marker
      of [
        "home-live-overlay",
        "live-day",
        "live-clock",
        "live-money",
        "live-rating",
        "live-level",
        "live-kpi-grid"
      ]
    ) {
      assert.match(
        mobileApp,
        new RegExp(marker)
      );
    }

    assert.match(
      mobileApp,
      /data-bind="clock"/
    );

    assert.match(
      mobileApp,
      /model\.money\.balance/
    );

    assert.match(
      mobileApp,
      /model\.money\.todayRevenue/
    );

    assert.match(
      mobileApp,
      /model\.money\.todayProfit/
    );

    assert.match(
      mobileApp,
      /model\.restaurant\.satisfaction/
    );

    assert.match(
      mobileApp,
      /model\.operations\.employees/
    );

    assert.match(
      css,
      /\.home-live-overlay\s*\{[\s\S]*?pointer-events:\s*none/
    );

    assert.match(
      css,
      /\.live-kpi-grid\s*\{/
    );
  }
);


test(
  "second live homepage batch uses real model data and neutral live dialogue avatars",
  () => {
    for (
      const marker
      of [
        "live-opportunity",
        "live-growth",
        "live-dialogue",
        "live-district",
        "live-schedule"
      ]
    ) {
      assert.match(
        mobileApp,
        new RegExp(marker)
      );
    }

    assert.match(
      mobileApp,
      /model\.opportunity\.title/
    );

    assert.match(
      mobileApp,
      /model\.progress\.progress/
    );

    assert.match(
      mobileApp,
      /model\.dialogue\.slice\(0,3\)/
    );

    assert.match(
      mobileApp,
      /item\.speaker\.slice\(0,1\)/
    );

    assert.match(
      mobileApp,
      /model\.district\.trafficIndex/
    );

    assert.match(
      mobileApp,
      /model\.schedule\.slice\(0,4\)/
    );

    assert.match(
      css,
      /\.live-dialogue-avatar\s*\{/
    );

    assert.doesNotMatch(
      mobileApp,
      /avatar.*\.(png|jpg|jpeg|webp)/i
    );
  }
);


test(
  "20x9 screenshot calibration keeps live panels inside their mother-card slots",
  () => {
    assert.match(
      css,
      /\.live-growth\s*\{[\s\S]*?width:\s*33\.6%/
    );

    assert.match(
      css,
      /\.live-dialogue\s*\{[\s\S]*?top:\s*61\.7%/
    );

    assert.match(
      css,
      /\.live-schedule\s*\{[\s\S]*?top:\s*75\.75%/
    );

    assert.match(
      css,
      /\.live-district\s*\{[\s\S]*?top:\s*79\.15%/
    );

    assert.doesNotMatch(
      mobileApp,
      /<span>客流<\/span>|<span>主力客群<\/span>|<span>外卖<\/span>|<span>竞争<\/span>/
    );
  }
);


test(
  "hard-mask baked sample content before drawing live lower dashboard data",
  () => {
    assert.match(
      css,
      /\.live-opportunity\s*\{[\s\S]*?background:\s*#fff/
    );

    assert.match(
      css,
      /\.live-dialogue\s*\{[\s\S]*?background:\s*#fff/
    );

    assert.match(
      css,
      /\.live-schedule\s*\{[\s\S]*?background:\s*#fff/
    );

    assert.match(
      css,
      /\.live-district\s*\{[\s\S]*?top:\s*81\.05%/
    );

    assert.doesNotMatch(
      mobileApp,
      /<span>下一阶段<\/span>/
    );
  }
);
