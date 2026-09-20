import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  PRIMARY_ENTRIES
} from "../src/ui/pages/operations-hub/OperationsHubPageSystem.js";

import {
  FORMAL_RUNTIME_PAGE_IDS
} from "../src/ui/runtime/FormalPageRuntime.js";

import {
  MAIN_ROOT_PAGE_IDS,
  NATIVE_RUNTIME_PAGE_IDS
} from "../src/ui/runtime/RuntimeRouteContract.js";


const MORE_TARGETS = Object.freeze([
  "chain",
  "brand-investments",
  "ranking-center",
  "honor-hall",
  "member-marketing",
  "reputation",
  "compliance-center",
  "settings",
  "feedback"
]);


function read(relativePath) {
  return fs.readFileSync(
    new URL(
      relativePath,
      import.meta.url
    ),
    "utf8"
  );
}


test(
  "第五批二级页继续使用完整游戏外壳，更多一级页使用确认版根页面外壳",
  () => {
    const formalPaths = [
      ["会员营销","../src/ui/pages/marketing/MemberMarketingView.js"],
      ["合规中心","../src/ui/pages/compliance/ComplianceCenterView.js"],
      ["成长与解锁","../src/ui/pages/progress/StoreProgressView.js"],
      ["连锁管理","../src/ui/pages/chain/ChainManagementView.js"]
    ];

    for (const [name,path] of formalPaths) {
      const source = read(path);

      for (const symbol of [
        "renderGameTopBar",
        "renderNoticeTicker",
        "renderPageTitle",
        "renderBottomNavigation"
      ]) {
        assert.ok(
          source.includes(symbol),
          name + "缺少" + symbol
        );
      }
    }

    const more =
      read(
        "../src/ui/pages/more/MoreHubView.js"
      );

    assert.ok(
      more.includes("renderGameTopBar")
    );

    assert.ok(
      more.includes("renderBottomNavigation")
    );

    assert.ok(
      more.includes("more-home-hero")
    );

    assert.equal(
      more.includes("renderPageTitle"),
      false
    );
  }
);


test(
  "会员合规成长连锁页面模型继续提供动态顶部数据",
  () => {
    const paths = [
      "../src/ui/pages/marketing/MemberMarketingPageSystem.js",
      "../src/ui/pages/compliance/ComplianceCenterPageSystem.js",
      "../src/ui/pages/progress/StoreProgressPageSystem.js",
      "../src/ui/pages/chain/ChainManagementPageSystem.js"
    ];

    for (const path of paths) {
      const source = read(path);

      assert.ok(
        source.includes("buildFormalPageChrome"),
        path + "未接入统一页面模型"
      );

      assert.ok(source.includes("topBar:"));
      assert.ok(source.includes("noticeTicker:"));
    }
  }
);


test(
  "经营和更多确认版可见入口都有真实运行时目标",
  () => {
    const supported =
      new Set([
        ...FORMAL_RUNTIME_PAGE_IDS,
        ...NATIVE_RUNTIME_PAGE_IDS,
        ...MAIN_ROOT_PAGE_IDS
      ]);

    const operationTargets =
      PRIMARY_ENTRIES.flatMap(
        entry => [
          entry.target,
          ...entry.secondary.map(
            item => item.target
          )
        ]
      );

    const missing =
      [
        ...new Set([
          ...MORE_TARGETS,
          ...operationTargets
        ])
      ].filter(
        target =>
          !supported.has(target)
      );

    assert.deepEqual(
      missing,
      [],
      "正式入口存在无运行时目标：" +
      missing.join(", ")
    );
  }
);


test(
  "第五批页面不暴露开发期占位文案",
  () => {
    const paths = [
      "../src/ui/pages/marketing/MemberMarketingView.js",
      "../src/ui/pages/compliance/ComplianceCenterView.js",
      "../src/ui/pages/progress/StoreProgressView.js",
      "../src/ui/pages/chain/ChainManagementView.js",
      "../src/ui/pages/more/MoreHubView.js"
    ];

    for (const path of paths) {
      const source = read(path);

      for (const forbidden of [
        "图片槽位",
        "头像槽位",
        "待正式页面",
        "页面尚未接入",
        "后续接入"
      ]) {
        assert.equal(
          source.includes(forbidden),
          false,
          path + "仍包含开发期文案：" + forbidden
        );
      }
    }
  }
);


test(
  "第五批正式样式全部载入主主题",
  () => {
    const theme =
      read(
        "../src/ui/theme/theme.css"
      );

    for (const file of [
      "member-marketing.css",
      "compliance-center.css",
      "store-progress.css",
      "chain-management.css",
      "more-hub.css"
    ]) {
      assert.ok(
        theme.includes(file),
        "主主题缺少：" + file
      );
    }
  }
);
