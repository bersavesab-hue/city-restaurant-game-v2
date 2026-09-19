import {
  spawnSync
} from "node:child_process";

const tests = [
  "tests/chain-expansion-integration.test.js",
  "tests/store-progression-integration.test.js",
  "tests/runtime-route-coverage.test.js",
  "tests/no-formal-ui-placeholder.test.js"
];

console.log(
  "========================================"
);

console.log(
  " 连锁扩张与中央厨房 Gate"
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
