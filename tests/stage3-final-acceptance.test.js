import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  CORE_PAGES
} from "../src/ui/registry/defaultPages.js";

import {
  GAMEPLAY_PAGES
} from "../src/ui/registry/gameplayPages.js";

import {
  FORMAL_RUNTIME_PAGE_IDS
} from "../src/ui/runtime/FormalPageRuntime.js";

import {
  MAIN_ROOT_PAGE_IDS,
  NATIVE_RUNTIME_PAGE_IDS,
  INTENTIONAL_PLACEHOLDER_PAGE_IDS,
  LEGACY_PAGE_IDS
} from "../src/ui/runtime/RuntimeRouteContract.js";


const TEST_DIR =
  path.dirname(
    fileURLToPath(
      import.meta.url
    )
  );

const UI_DIR =
  path.resolve(
    TEST_DIR,
    "../src/ui"
  );


function walk(
  directory
) {
  const files =
    [];

  for (
    const entry
    of fs.readdirSync(
      directory,
      {
        withFileTypes:
          true
      }
    )
  ) {
    const full =
      path.join(
        directory,
        entry.name
      );

    if (
      entry.isDirectory()
    ) {
      files.push(
        ...walk(
          full
        )
      );
    } else {
      files.push(
        full
      );
    }
  }

  return files;
}


function read(
  file
) {
  return fs.readFileSync(
    file,
    "utf8"
  );
}


const UI_FILES =
  walk(
    UI_DIR
  )
    .filter(
      file =>
        /\.(js|css)$/.test(
          file
        )
    );


test(
  "第三阶段最终验收没有任何正式占位页面",
  () => {
    assert.deepEqual(
      [
        ...INTENTIONAL_PLACEHOLDER_PAGE_IDS
      ],
      []
    );
  }
);


test(
  "全部注册页面都有明确运行时归属",
  () => {
    const registered =
      new Set(
        [
          ...CORE_PAGES,
          ...GAMEPLAY_PAGES
        ]
          .map(
            item =>
              item.id
          )
      );

    const covered =
      new Set([
        ...MAIN_ROOT_PAGE_IDS,
        ...NATIVE_RUNTIME_PAGE_IDS,
        ...FORMAL_RUNTIME_PAGE_IDS
      ]);

    const missing =
      [
        ...registered
      ]
        .filter(
          id =>
            !covered.has(
              id
            )
        )
        .sort();

    assert.deepEqual(
      missing,
      []
    );
  }
);


test(
  "所有静态页面跳转目标都指向真实运行时或主导航",
  () => {
    const supported =
      new Set([
        ...MAIN_ROOT_PAGE_IDS,
        ...NATIVE_RUNTIME_PAGE_IDS,
        ...FORMAL_RUNTIME_PAGE_IDS
      ]);

    const missing =
      [];

    for (
      const file
      of UI_FILES.filter(
        item =>
          item.endsWith(
            ".js"
          )
      )
    ) {
      const source =
        read(
          file
        );

      for (
        const match
        of source.matchAll(
          /data-page-target=["']([^"'$]+)["']/g
        )
      ) {
        const target =
          match[1];

        if (
          !supported.has(
            target
          )
        ) {
          missing.push({
            file:
              path.relative(
                UI_DIR,
                file
              ),

            target
          });
        }
      }
    }

    assert.deepEqual(
      missing,
      []
    );
  }
);


test(
  "正式UI不再出现开发期占位文案和旧导航壳",
  () => {
    const forbiddenText =
      [
        "图片槽位",
        "头像槽位",
        "待正式页面",
        "页面尚未接入",
        "后续接入",
        "户型装饰覆盖层槽位"
      ];

    const forbiddenLegacy =
      [
        "signature-dish-",
        "restaurant-avatar"
      ];

    const violations =
      [];

    for (
      const file
      of UI_FILES.filter(
        item =>
          item.endsWith(
            ".js"
          )
      )
    ) {
      const source =
        read(
          file
        );

      for (
        const term
        of [
          ...forbiddenText,
          ...forbiddenLegacy
        ]
      ) {
        if (
          source.includes(
            term
          )
        ) {
          violations.push({
            file:
              path.relative(
                UI_DIR,
                file
              ),

            term
          });
        }
      }
    }

    assert.deepEqual(
      violations,
      []
    );
  }
);


test(
  "运行时会在内部重绘后重新绑定正式图片资源",
  () => {
    const source =
      read(
        path.join(
          UI_DIR,
          "runtime/AndroidPlaytestEntry.js"
        )
      );

    assert.match(
      source,
      /new MutationObserver/
    );

    assert.match(
      source,
      /bindVisualAssets\(\s*root\s*\)/
    );

    assert.match(
      source,
      /childList:\s*true/
    );

    assert.match(
      source,
      /subtree:\s*true/
    );
  }
);


test(
  "主导航保持唯一落地页且旧页面ID不会复活",
  () => {
    const source =
      read(
        path.join(
          UI_DIR,
          "runtime/AndroidPlaytestEntry.js"
        )
      );

    for (
      const legacy
      of LEGACY_PAGE_IDS
    ) {
      assert.equal(
        source.includes(
          `"${legacy}"`
        ),
        false,
        `Android runtime 仍出现旧页面ID：${legacy}`
      );
    }

    for (
      const expected
      of [
        '"employees-home"',
        '"employee-home"',
        '"restaurant_home"'
      ]
    ) {
      assert.equal(
        source.includes(
          expected
        ),
        false
      );
    }
  }
);


test(
  "手机端正式页面保留统一安全底部间距和触控规则",
  () => {
    const theme =
      read(
        path.join(
          UI_DIR,
          "theme/theme.css"
        )
      );

    assert.match(
      theme,
      /safe-area-inset-bottom/
    );

    assert.match(
      theme,
      /touch-action:\s*manipulation/
    );

    assert.match(
      theme,
      /--rg-shell-max/
    );

    assert.match(
      theme,
      /@media\s*\(min-width:\s*520px\)/
    );
  }
);
