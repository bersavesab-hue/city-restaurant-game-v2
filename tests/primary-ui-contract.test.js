import test from "node:test";
import assert from "node:assert/strict";

import {
  PRIMARY_UI_TABS,
  PRIMARY_UI_IDS,
  isPrimaryUiPage
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

test("旧一级ID不再作为运行时兼容入口", () => {
  for (const legacyId of [
    "operating-command-center",
    "operations-home",
    "employee_roster",
    "more-home",
    "restaurant_home",
    "restaurant-home",
    "employee-home",
    "employees-home"
  ]) {
    assert.equal(
      isPrimaryUiPage(
        legacyId
      ),
      false,
      legacyId
    );
  }
});
