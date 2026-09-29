import {
  spawnSync
} from "node:child_process";

const tests = [
  "tests/business-lifecycle-balance.test.js",
  "tests/launch-balance-strategies.test.js",
  "tests/formal-economic-balance-data.test.js",
  "tests/store-progression-integration.test.js",
  "tests/pricing-decision-impact.test.js",
  "tests/reality-pricing.test.js",
  "tests/finance-settlement.test.js"
];

console.log(
  "========================================"
);

console.log(
  " T11 真实经营数值平衡 Gate"
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
          process.env
            .PHASE3_BALANCE_DAYS ??
          "90"
      }
    }
  );

process.exit(
  result.status ??
  1
);
