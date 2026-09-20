import test from "node:test";
import assert from "node:assert/strict";

import {
  PRIMARY_UI_TABS,
  PRIMARY_UI_IDS,
  resolvePrimaryRouteAlias
} from "../src/ui/contracts/PrimaryUiContract.js";

test("一级UI固定为五个唯一入口", () => {
  assert.deepEqual(
    PRIMARY_UI_IDS,
    ["city", "restaurant", "operations", "employees", "more"]
  );

  assert.deepEqual(
    PRIMARY_UI_TABS.map(item => item.title),
    ["城市", "门店", "经营", "员工", "更多"]
  );
});

test("旧一级落地ID只作为兼容别名，不再成为正式页面", () => {
  assert.equal(resolvePrimaryRouteAlias("operating-command-center"), "restaurant");
  assert.equal(resolvePrimaryRouteAlias("operations-home"), "operations");
  assert.equal(resolvePrimaryRouteAlias("employee_roster"), "employees");
  assert.equal(resolvePrimaryRouteAlias("more-home"), "more");
});
