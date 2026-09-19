import {
  spawnSync
} from "node:child_process";

const tests = [
  "tests/save-roundtrip.test.js",
  "tests/save-migration-compatibility.test.js"
];

console.log(
  "========================================"
);

console.log(
  " 存档迁移与老存档兼容 Gate"
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
