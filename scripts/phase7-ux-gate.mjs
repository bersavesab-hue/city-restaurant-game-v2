import {
  spawnSync
} from "node:child_process";

const tests = [
  "tests/phase7-ux-integration.test.js",
  "tests/operating-command-center-formal-ui.test.js",
  "tests/game-chrome-unified.test.js",
  "tests/game-ui-chrome.test.js",
  "tests/renovation-mobile-page.test.js",
  "tests/renovation-mobile-view.test.js",
  "tests/renovation-game-ui.test.js",
  "tests/renovation-construction-ui.test.js",
  "tests/visual-asset-binder.test.js"
];

console.log(
  "========================================"
);

console.log(
  " 第七阶段：UI / 装修 / 美术 / 引导 / 提示 Gate"
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
