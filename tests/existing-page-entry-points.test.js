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
  "已完成页面都有可见入口",
  () => {
    const operations = source(
      "src/ui/pages/operations-hub/OperationsHubPageSystem.js"
    );

    const command = source(
      "src/ui/pages/command-center/OperatingCommandCenterView.js"
    );

    const employees = source(
      "src/ui/pages/employees/EmployeeManagementView.js"
    );

    const customers = source(
      "src/ui/pages/customers/CustomerManagementView.js"
    );


    assert.match(operations, /menu-engineering/);
    assert.match(operations, /customers/);

    assert.match(
      command,
      /data-page-target="equipment-management"/
    );

    assert.match(
      command,
      /data-page-target="equipment-maintenance"/
    );

    assert.match(
      employees,
      /data-page-target="workforce-capacity"/
    );

    assert.match(
      customers,
      /data-page-target="member-marketing"/
    );
  }
);
