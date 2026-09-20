import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";


function source(path) {
  return fs.readFileSync(
    new URL(
      "../" + path,
      import.meta.url
    ),
    "utf8"
  );
}


test(
  "确认版一级页保留真实二级功能入口",
  () => {
    const operations = source(
      "src/ui/pages/operations-hub/OperationsHubPageSystem.js"
    );

    const stores = source(
      "src/ui/pages/command-center/OperatingCommandCenterView.js"
    );

    const employees = source(
      "src/ui/pages/employees/EmployeeManagementView.js"
    );

    const more = source(
      "src/ui/pages/more/MoreHubPageSystem.js"
    );

    for (const target of [
      "menu-engineering",
      "customers",
      "market-strategy",
      "ranking-center"
    ]) {
      assert.match(
        operations,
        new RegExp(target)
      );
    }

    for (const target of [
      "renovation",
      "equipment-management",
      "lease",
      "opening-setup"
    ]) {
      assert.match(
        stores,
        new RegExp(target)
      );
    }

    for (const target of [
      "employee_recruitment",
      "workforce-capacity",
      "employee_training",
      "employee_promotion"
    ]) {
      assert.match(
        employees,
        new RegExp(target)
      );
    }

    for (const target of [
      "chain",
      "brand-investments",
      "ranking-center",
      "honor-hall",
      "member-marketing",
      "reputation",
      "compliance-center",
      "settings",
      "feedback"
    ]) {
      assert.match(
        more,
        new RegExp(target)
      );
    }
  }
);
