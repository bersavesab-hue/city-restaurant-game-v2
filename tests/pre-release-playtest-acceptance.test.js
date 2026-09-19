import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  fileURLToPath
} from "node:url";

import {
  CORE_PAGES
} from "../src/ui/registry/defaultPages.js";

import {
  GAMEPLAY_PAGES
} from "../src/ui/registry/gameplayPages.js";

import {
  MAIN_ROOT_PAGE_IDS
} from "../src/ui/runtime/RuntimeRouteContract.js";


const repoRoot =
  path.resolve(
    path.dirname(
      fileURLToPath(
        import.meta.url
      )
    ),
    ".."
  );


function read(
  relativePath
) {
  return fs.readFileSync(
    path.join(
      repoRoot,
      relativePath
    ),
    "utf8"
  );
}


function walkJs(
  directory
) {
  const result = [];

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
      result.push(
        ...walkJs(
          full
        )
      );

      continue;
    }

    if (
      entry.isFile() &&
      entry.name.endsWith(
        ".js"
      )
    ) {
      result.push(
        full
      );
    }
  }

  return result;
}


test(
  "首启试玩不再注入测试员工或未完成页面占位",
  () => {
    const source =
      read(
        "src/ui/runtime/AndroidPlaytestEntry.js"
      );

    assert.doesNotMatch(
      source,
      /周师傅|林小雨/
    );

    assert.doesNotMatch(
      source,
      /employeeSystem\.hire/
    );

    assert.doesNotMatch(
      source,
      /function placeholderPage/
    );

    assert.doesNotMatch(
      source,
      /当前测试APK暂未接入/
    );

    assert.match(
      source,
      /captureRuntimeError[\s\S]{0,240}"navigation"/
    );
  }
);


test(
  "手机端自动存档采用30秒周期并保留日切与后台保存",
  () => {
    const source =
      read(
        "src/ui/runtime/AndroidPlaytestEntry.js"
      );

    assert.match(
      source,
      /AUTO_SAVE_INTERVAL_MS\s*=\s*30000/
    );

    assert.doesNotMatch(
      source,
      /setInterval\(\s*saveNow,\s*5000/
    );

    assert.match(
      source,
      /visibilitychange/
    );

    assert.match(
      source,
      /onDay[\s\S]{0,180}saveNow\(\)/
    );
  }
);


test(
  "UI中的静态页面跳转目标全部属于正式页面注册表",
  () => {
    const known =
      new Set(
        [
          ...CORE_PAGES,
          ...GAMEPLAY_PAGES
        ].map(
          item =>
            item.id
        )
      );

    for (
      const id
      of MAIN_ROOT_PAGE_IDS
    ) {
      known.add(
        id
      );
    }

    const aliases =
      new Set([
        "members"
      ]);

    const uiRoots = [
      path.join(
        repoRoot,
        "src/ui/pages"
      ),
      path.join(
        repoRoot,
        "src/ui/renovation"
      ),
      path.join(
        repoRoot,
        "src/ui/components"
      )
    ];

    const unknown = [];

    const patterns = [
      /data-page-target=["']([a-z0-9_-]+)["']/g,
      /data-page-id=["']([a-z0-9_-]+)["']/g,
      /onNavigate\?\.\(\s*["']([a-z0-9_-]+)["']/g
    ];

    for (
      const root
      of uiRoots
    ) {
      for (
        const file
        of walkJs(
          root
        )
      ) {
        const source =
          fs.readFileSync(
            file,
            "utf8"
          );

        for (
          const pattern
          of patterns
        ) {
          pattern.lastIndex = 0;

          for (
            const match
            of source.matchAll(
              pattern
            )
          ) {
            const target =
              match[1];

            if (
              known.has(
                target
              ) ||
              aliases.has(
                target
              )
            ) {
              continue;
            }

            unknown.push({
              file:
                path.relative(
                  repoRoot,
                  file
                ),
              target
            });
          }
        }
      }
    }

    assert.deepEqual(
      unknown,
      [],
      "存在未注册的静态页面跳转：" +
      JSON.stringify(
        unknown
      )
    );
  }
);


test(
  "运行错误页面不向玩家直接暴露JavaScript堆栈",
  () => {
    const source =
      read(
        "src/ui/runtime/AndroidPlaytestEntry.js"
      );

    const start =
      source.indexOf(
        "function errorPage"
      );

    const end =
      source.indexOf(
        "function navigate",
        start
      );

    assert.ok(
      start >= 0 &&
      end > start
    );

    const block =
      source.slice(
        start,
        end
      );

    assert.doesNotMatch(
      block,
      /error\?\.stack/
    );

    assert.match(
      block,
      /页面加载失败/
    );

    assert.match(
      block,
      /测试反馈/
    );
  }
);


test(
  "Android宿主关闭调试、内容提供器和跨域文件访问",
  () => {
    const source =
      read(
        "android/app/src/main/java/com/cityrestaurant/game/MainActivity.java"
      );

    assert.match(
      source,
      /setWebContentsDebuggingEnabled\(false\)/
    );

    assert.match(
      source,
      /setAllowContentAccess\(false\)/
    );

    assert.match(
      source,
      /setAllowFileAccessFromFileURLs\(false\)/
    );

    assert.match(
      source,
      /setAllowUniversalAccessFromFileURLs\(false\)/
    );

    assert.match(
      source,
      /MIXED_CONTENT_NEVER_ALLOW/
    );

    assert.match(
      source,
      /setJavaScriptCanOpenWindowsAutomatically\(false\)/
    );
  }
);


test(
  "Android返回键优先回到上一个游戏页面而不是直接退出",
  () => {
    const runtime =
      read(
        "src/ui/runtime/AndroidPlaytestEntry.js"
      );

    const activity =
      read(
        "android/app/src/main/java/com/cityrestaurant/game/MainActivity.java"
      );

    assert.match(
      runtime,
      /const navigationHistory\s*=/
    );

    assert.match(
      runtime,
      /window\.restaurantGameBack\s*=/
    );

    assert.match(
      runtime,
      /navigationHistory\.pop\(\)/
    );

    assert.match(
      runtime,
      /handlingBackNavigation/
    );

    assert.match(
      runtime,
      /navigationHistory\.length\s*>\s*50/
    );

    assert.match(
      activity,
      /public void onBackPressed\(\)/
    );

    assert.match(
      activity,
      /evaluateJavascript\(/
    );

    assert.match(
      activity,
      /window\.restaurantGameBack/
    );

    assert.match(
      activity,
      /MainActivity\.super\.onBackPressed\(\)/
    );
  }
);
