import {
  spawnSync
} from "node:child_process";

const commands = [
  {
    label:
      "倍速与快速推进回归",
    args: [
      "--test",
      "tests/simulation-performance-regression.test.js"
    ]
  },
  {
    label:
      "20年长期实体与历史压缩",
    args: [
      "scripts/stress-20year.mjs"
    ]
  },
  {
    label:
      "20年存档老化性能",
    args: [
      "scripts/aging-performance.mjs"
    ]
  }
];

console.log(
  "========================================"
);

console.log(
  " 第三阶段 倍速与长期性能 Gate"
);

console.log(
  "========================================"
);

for (
  const command
  of commands
) {
  console.log(
    `[performance-gate] ${command.label}`
  );

  const result =
    spawnSync(
      process.execPath,
      command.args,
      {
        stdio:
          "inherit",
        env: {
          ...process.env
        }
      }
    );

  if (
    result.status !== 0
  ) {
    process.exit(
      result.status ??
      1
    );
  }
}

console.log(
  "✅ 第三阶段性能 Gate 全部通过"
);
