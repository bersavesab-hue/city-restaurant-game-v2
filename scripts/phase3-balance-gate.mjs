import {
  spawnSync
} from "node:child_process";

const tests = [
  "tests/business-lifecycle-balance.test.js",
  "tests/formal-economic-balance-data.test.js",
  "tests/economic-balance-integration.test.js",
  "tests/store-progression-integration.test.js",
  "tests/sales-channel-integration.test.js",
  "tests/member-lifecycle-integration.test.js",
  "tests/marketing-action-integration.test.js"
];

console.log(
  "========================================"
);

console.log(
  " 第三阶段 经营平衡 Gate"
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
        "inherit"
    }
  );

process.exit(
  result.status ??
  1
);
