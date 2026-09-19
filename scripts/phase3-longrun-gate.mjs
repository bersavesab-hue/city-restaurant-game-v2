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
  "tests/customer-identity-membership-integration.test.js",
  "tests/compliance-lifecycle-integration.test.js",
  "tests/marketing-action-integration.test.js"
];

console.log(
  "========================================"
);

console.log(
  " 第三阶段 365天长期经营 Gate"
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
        ...process.env,
        PHASE3_BALANCE_DAYS:
          "365"
      }
    }
  );

process.exit(
  result.status ??
  1
);
