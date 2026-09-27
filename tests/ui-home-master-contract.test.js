import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { renderHomePage } from "../client/mobile/HomePage.js";

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
  "store renders static artwork around live dashboard fields",
  () => {
    assert.match(
      mobileApp,
      /renderHomePage\(\s*buildHomeDashboardModel\(app\)/
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
      /layered-v1/
    );

    const view = renderHomePage({
      restaurant: {status:"open",level:3,reviewScore:4.2,satisfaction:71},
      time: {day:42,clock:"13:25"},
      money: {balance:12345,todayRevenue:678,todayProfit:90},
      operations: {employees:2},
      progress: {title:"成长中",nextTitle:"新阶段",progress:.37},
      district: {name:"测试商圈",trafficIndex:76,mainCustomer:"学生",deliveryDemand:44,competition:59},
      opportunity: {title:"新的机会",detail:"测试建议",action:"前往员工",tags:["客流变化"]},
      dialogue: [{speaker:"小张",role:"后厨",text:"正在备菜",time:"13:20"}],
      schedule: [{time:"15:00",title:"库存复盘",status:"upcoming"}]
    });
    for (const value of ["第42天","13:25","¥ 12,345","¥ 678","4.2分","37%","新的机会","前往员工","小张","库存复盘"]) {
      assert.ok(view.includes(value), value);
    }
    assert.doesNotMatch(view, /86,240|6,820|第28天|12:15/);
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
  "editor starts from fresh v5 storage instead of restoring old layout",
  () => {
    assert.match(
      toolkit,
      /city-restaurant-ui-dev-overrides\.v5/
    );

    assert.match(
      toolkit,
      /city-restaurant-ui-dev-project\.v5/
    );

    assert.doesNotMatch(
      toolkit,
      /LEGACY_STORAGE_KEY/
    );

    assert.match(
      toolkit,
      /component-layout-v5-free-size-align/
    );
  }
);

test(
  "layered home retains the mobile UI editor launcher",
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


test(
  "uploaded images preserve their natural aspect ratio and expose fit modes",
  () => {
    for (
      const marker
      of [
        "function measureImage",
        "naturalWidth",
        "naturalHeight",
        "aspectRatio",
        "lockAspect",
        "objectFit",
        "function setImageFit",
        "function toggleAspectLock",
        "function fillCanvasWithSelectedImage",
        'data-dev-fit="contain"',
        'data-dev-fit="cover"',
        'data-dev-fit="fill"',
        "data-dev-aspect-lock",
        "data-dev-fill-canvas"
      ]
    ) {
      assert.match(
        toolkit,
        new RegExp(marker)
      );
    }

    assert.match(
      toolkit,
      /parentRect\.width\s*\*\s*\.92/
    );

    assert.match(
      devCss,
      /\.dev-image-settings\s*\{/
    );

    assert.match(
      devCss,
      /\.dev-fit-actions\s*\{/
    );
  }
);


test(
  "editor keeps its scroll position after controls rerender the panel",
  () => {
    assert.match(
      toolkit,
      /panelScroll/
    );

    assert.match(
      toolkit,
      /body\.scrollTop\s*=\s*state\.panelScroll/
    );

    assert.match(
      toolkit,
      /state\.panelScroll\[\s*state\.tab\s*\]\s*=\s*(?:body|panelBody)\.scrollTop/
    );
  }
);


test(
  "editor preserves its scroll position when controls rerender the panel",
  () => {
    assert.match(
      toolkit,
      /panelScroll:\s*\{[\s\S]*?edit:\s*0[\s\S]*?audit:\s*0[\s\S]*?config:\s*0/
    );

    assert.match(
      toolkit,
      /function capturePanelScroll/
    );

    assert.match(
      toolkit,
      /function restorePanelScroll/
    );

    assert.match(
      toolkit,
      /data-dev-body-tab/
    );

    assert.match(
      toolkit,
      /panelBody\?\.addEventListener\([\s\S]*?"scroll"/
    );
  }
);


test(
  "editor supports independent width height and canvas alignment",
  () => {
    assert.match(
      toolkit,
      /lockAspect:\s*false/
    );

    for (
      const marker
      of [
        "function alignSelected",
        "function sizeSelected",
        "function restoreNaturalRatio",
        'data-dev-align="left"',
        'data-dev-align="center-x"',
        'data-dev-align="right"',
        'data-dev-align="top"',
        'data-dev-align="center-y"',
        'data-dev-align="bottom"',
        'data-dev-size="width"',
        'data-dev-size="height"',
        'data-dev-size="canvas"',
        "data-dev-natural-ratio"
      ]
    ) {
      assert.match(
        toolkit,
        new RegExp(marker)
      );
    }

    assert.match(
      devCss,
      /\.dev-align-settings\s*\{/
    );

    assert.match(
      devCss,
      /\.dev-align-actions\s*,/
    );
  }
);


test(
  "image display modes do not mutate component geometry or force linkage",
  () => {
    assert.equal(
      (toolkit.match(/function alignSelected\(/g) || []).length,
      1
    );

    assert.equal(
      (toolkit.match(/function setImageFit\(/g) || []).length,
      1
    );

    assert.match(
      toolkit,
      /function repairSelectedImageFrame/
    );

    assert.match(
      toolkit,
      /function fitImageNaturalWidth/
    );

    assert.match(
      toolkit,
      /data-dev-repair-image/
    );

    assert.match(
      toolkit,
      /data-dev-natural-width/
    );

    assert.match(
      toolkit,
      /Display mode changes only how pixels are drawn inside the frame/
    );
  }
);


test(
  "free-size image edits fill the frame and editor actions do not scroll the page",
  () => {
    assert.match(
      toolkit,
      /item\.lockAspect\s*===\s*false[\s\S]*?item\.objectFit\s*=\s*"fill"/
    );

    assert.match(
      toolkit,
      /mode\s*===\s*"canvas"[\s\S]*?\?\s*"cover"[\s\S]*?:\s*"fill"/
    );

    assert.doesNotMatch(
      toolkit,
      /state\.selected\.scrollIntoView/
    );
  }
);
