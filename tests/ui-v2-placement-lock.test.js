import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  UI_BOXES,
  UI_PLACEMENTS,
  UI_TEXT_SLOTS,
  UI_TYPOGRAPHY,
  UI_REGIONS
} from "../src/ui-v2/contracts/UiFrameContract.js";
import { renderCityFrame } from "../src/ui-v2/pages/city/CityFrame.js";

test("HUD和地图坐标与864母版一致", () => {
  assert.deepEqual(UI_PLACEMENTS.hud.identity, {
    x: 0, y: 0, width: 289, height: 94
  });
  assert.deepEqual(UI_PLACEMENTS.hud.simulation, {
    x: 289, y: 0, width: 380, height: 94
  });
  assert.deepEqual(UI_PLACEMENTS.hud.resources, {
    x: 669, y: 0, width: 195, height: 94
  });
  assert.deepEqual(UI_PLACEMENTS.hero.summary, {
    x: 576, y: 16, width: 276, height: 103
  });
  assert.deepEqual(UI_PLACEMENTS.filters, {
    x: 11, y: 0, width: 842, height: 66, gap: 5
  });
  assert.deepEqual(UI_PLACEMENTS.map.controls, {
    x: 794, y: 360, width: 56, height: 192, gap: 12
  });
  assert.deepEqual(UI_PLACEMENTS.map.markers.cbd, {
    x: 320, y: 191
  });
  assert.deepEqual(UI_PLACEMENTS.map.markers.waterfront, {
    x: 674, y: 455
  });
});

test("详情与文字盒固定，动态数据落在盒内", () => {
  assert.deepEqual(UI_PLACEMENTS.detail.thumbnail, {
    x: 24, y: 28, width: 124, height: 104
  });
  assert.deepEqual(UI_PLACEMENTS.detail.primaryAction, {
    x: 612, y: 39, width: 221, height: 81
  });
  assert.deepEqual(UI_PLACEMENTS.detail.metrics, {
    x: 17, y: 145, width: 830, height: 115, gap: 7
  });
  assert.deepEqual(UI_PLACEMENTS.detail.opportunities, {
    x: 17, y: 322, width: 830, height: 102, gap: 8
  });
  assert.deepEqual(UI_BOXES.detailHandle, {
    width: 60, height: 6
  });
  assert.deepEqual(UI_TEXT_SLOTS.heroTitle, {
    x: 60, y: 21, width: 518, height: 65
  });
  assert.equal(UI_TYPOGRAPHY.roles.hudPrimary.size, 23);
  assert.equal(UI_TYPOGRAPHY.roles.markerTitle.size, 20);
  assert.equal(UI_TYPOGRAPHY.roles.opportunityBody.size, 15);
  const html = renderCityFrame();
  assert.match(html, /data-ui-box="detail-handle"/);
  assert.match(html, /data-ui-box="detail-close"/);
  assert.match(html, /data-live="metric-value-5"/);
  assert.match(html, /data-live="opportunity-count"/);
});

test("地图是独立静态素材，状态文字和操作由DOM实时绘制", () => {
  const cityCss = fs.readFileSync(
    "src/ui-v2/pages/city/city-frame.css", "utf8"
  );
  const hudCss = fs.readFileSync(
    "src/ui-v2/components/components.css", "utf8"
  );
  const shellCss = fs.readFileSync(
    "src/ui-v2/shell/app-shell.css", "utf8"
  );
  assert.match(cityCss, /city-map-master\.webp/);
  assert.match(cityCss, /marker-cbd\.webp/);
  assert.match(cityCss, /pin-selected\.svg/);
  assert.match(cityCss, /ui-v2-city-frame__region-overlays/);
  assert.match(cityCss, /min\(\s*100cqw/);
  assert.match(cityCss, /district-cbd-v3\.webp/);
  assert.match(cityCss, /opportunity-sheet-v3\.webp/);
  assert.match(hudCss, /hud-weather\.webp/);
  assert.match(shellCss, /var\(--ui-safe-top\)/);
  assert.match(shellCss, /var\(--ui-safe-bottom\)/);
  assert.doesNotMatch(cityCss + hudCss, /data:image|base64|map-grid/);
  assert.equal(UI_REGIONS.detail.y + UI_REGIONS.detail.height,
    UI_REGIONS.navigation.y);
  for (const file of [
    "illustrations/city-map-master.webp",
    "illustrations/store-avatar.webp",
    "illustrations/district-cbd-v3.webp",
    "illustrations/district-university-v3.webp",
    "illustrations/district-nightlife-v3.webp",
    "illustrations/district-oldtown-v3.webp",
    "illustrations/district-waterfront-v3.webp",
    "illustrations/opportunity-sheet-v3.webp",
    "icons/marker-cbd.webp",
    "icons/marker-university.webp",
    "icons/marker-nightlife.webp",
    "icons/marker-oldtown.webp",
    "icons/marker-waterfront.webp",
    "icons/hud-weather.webp",
    "icons/hud-money.webp",
    "icons/hud-crown.webp",
    "icons/hud-star.webp",
    "icons/nav-city.svg",
    "icons/map-locate.svg",
    "markers/pin-selected.svg"
  ]) {
    assert.equal(fs.existsSync(`resources/ui-v2/${file}`), true, file);
  }
});
