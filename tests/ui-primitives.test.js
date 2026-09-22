import test from "node:test";
import assert from "node:assert/strict";

import {
  renderActionGrid,
  renderListCardRows,
  renderSegmentTabs,
  UI_COMPONENT_LIBRARY
} from "../client/mobile/UiPrimitives.js";

test("mobile UI primitives render stable component markers", () => {
  const tabs = renderSegmentTabs(
    ["菜单", "采购"],
    { componentId: "business-tabs" }
  );

  assert.match(
    tabs,
    /data-ui-component="business-tabs"/
  );

  assert.match(
    tabs,
    /class="is-active"/
  );

  const list = renderListCardRows(
    [
      {
        label: "供应商与采购",
        value: "统一管理 ›"
      }
    ],
    { componentId: "business-list" }
  );

  assert.match(
    list,
    /data-ui-component="business-list"/
  );

  const grid = renderActionGrid(
    [
      {
        title: "自研菜品",
        detail: "从食材与工艺开始研发"
      }
    ],
    { componentId: "research-actions" }
  );

  assert.match(
    grid,
    /data-ui-component="research-actions"/
  );

  assert.equal(
    UI_COMPONENT_LIBRARY.length,
    3
  );
});

test("mobile UI primitives escape injected markup", () => {
  const html = renderSegmentTabs([
    '<img src=x onerror="alert(1)">'
  ]);

  assert.doesNotMatch(
    html,
    /<img src=x/
  );

  assert.match(
    html,
    /&lt;img/
  );
});
