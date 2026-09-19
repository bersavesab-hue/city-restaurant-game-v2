import {
  spawnSync
} from "node:child_process";

const tests = [
  "tests/phase8-release-integration.test.js",
  "tests/formal-page-runtime.test.js",
  "tests/more-hub.test.js",
  "tests/runtime-route-coverage.test.js",
  "tests/no-formal-ui-placeholder.test.js"
];

console.log(
  "========================================"
);

console.log(
  " 第八阶段：反馈 / APK / 发布包装 Gate"
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
