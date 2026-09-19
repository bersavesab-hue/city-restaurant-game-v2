import {
  spawnSync
} from "node:child_process";

const tests = [
  "tests/phase6-lifecycle-integration.test.js",
  "tests/customer-identity-membership-integration.test.js",
  "tests/lease-flow.test.js",
  "tests/lease-cycle.test.js",
  "tests/more-hub.test.js",
  "tests/formal-page-runtime.test.js",
  "tests/runtime-route-coverage.test.js",
  "tests/no-formal-ui-placeholder.test.js"
];

console.log(
  "========================================"
);

console.log(
  " 第六阶段：租约 / 设置 / 熟客 / 后期消费 Gate"
);

console.log(
  "========================================"
);

const result =
  spawnSync(
    process.execPath,
    [
      "--test",
      ...tests
    ],
    {
      stdio:
        "inherit",
      env: {
        ...process.env
      }
    }
  );

process.exit(
  result.status ??
  1
);
