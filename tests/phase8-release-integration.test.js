import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  FeedbackSystem,
  FeedbackMemoryStorage
} from "../src/systems/FeedbackSystem.js";

import {
  RELEASE_INFO
} from "../src/release/ReleaseInfo.js";

import {
  gameState
} from "../src/core/GameState.js";

import {
  dataRegistry
} from "../src/core/DataRegistry.js";

import {
  gameFoundationSystem
} from "../src/systems/GameFoundationSystem.js";

import {
  restaurantSystem
} from "../src/systems/RestaurantSystem.js";

import {
  financeSystem
} from "../src/systems/FinanceSystem.js";

import {
  formalPageRuntime
} from "../src/ui/runtime/FormalPageRuntime.js";

import {
  pageRegistry
} from "../src/ui/registry/PageRegistry.js";

import "../src/ui/registry/defaultPages.js";


function setupRestaurant() {
  gameState.reset();
  dataRegistry.clear();

  gameFoundationSystem
    .initialize({
      seedProperties: false,
      overwriteReferenceData:
        true
    });

  const restaurant =
    restaurantSystem.create({
      name:
        "发布反馈测试店"
    });

  financeSystem.createAccount(
    restaurant.id,
    123456
  );

  return restaurant;
}


test(
  "反馈记录独立本地持久化并可导出诊断报告",
  () => {
    const restaurant =
      setupRestaurant();

    const storage =
      new FeedbackMemoryStorage();

    const system =
      new FeedbackSystem({
        storage,
        storageKey:
          "test:feedback"
      });

    const saved =
      system.submit({
        restaurantId:
          restaurant.id,
        category:
          "bug",
        rating:
          4,
        message:
          "装修页面拖动后偶尔不好点中"
      });

    assert.equal(
      saved.category,
      "bug"
    );

    assert.equal(
      saved.rating,
      4
    );

    assert.equal(
      saved.diagnostics
        .release
        .versionName,
      RELEASE_INFO
        .versionName
    );

    assert.equal(
      saved.diagnostics
        .restaurant
        .balance,
      123456
    );

    const secondInstance =
      new FeedbackSystem({
        storage,
        storageKey:
          "test:feedback"
      });

    assert.equal(
      secondInstance
        .list()
        .length,
      1
    );

    const report =
      JSON.parse(
        secondInstance
          .exportReport()
      );

    assert.equal(
      report.feedback.length,
      1
    );

    assert.match(
      report.app,
      /0\.8\.65/
    );

    secondInstance.clear();

    assert.equal(
      secondInstance
        .list()
        .length,
      0
    );
  }
);


test(
  "反馈输入做正式边界校验",
  () => {
    const system =
      new FeedbackSystem({
        storage:
          new FeedbackMemoryStorage(),
        storageKey:
          "test:validation"
      });

    assert.throws(
      () =>
        system.submit({
          restaurantId:
            null,
          category:
            "unknown",
          rating:
            5,
          message:
            "有效反馈内容"
        }),
      /有效的反馈类型/
    );

    assert.throws(
      () =>
        system.submit({
          restaurantId:
            null,
          category:
            "bug",
          rating:
            0,
          message:
            "有效反馈内容"
        }),
      /1到5/
    );

    assert.throws(
      () =>
        system.submit({
          restaurantId:
            null,
          category:
            "bug",
          rating:
            5,
          message:
            "短"
        }),
      /至少需要4个字/
    );
  }
);


test(
  "发布版本信息在 JS 包和 Android Gradle 中完全一致",
  () => {
    const packageJson =
      JSON.parse(
        fs.readFileSync(
          new URL(
            "../package.json",
            import.meta.url
          ),
          "utf8"
        )
      );

    const lockJson =
      JSON.parse(
        fs.readFileSync(
          new URL(
            "../package-lock.json",
            import.meta.url
          ),
          "utf8"
        )
      );

    const gradle =
      fs.readFileSync(
        new URL(
          "../android/app/build.gradle",
          import.meta.url
        ),
        "utf8"
      );

    assert.equal(
      packageJson.version,
      RELEASE_INFO.versionName
    );

    assert.equal(
      lockJson.version,
      RELEASE_INFO.versionName
    );

    assert.equal(
      lockJson.packages[""]
        .version,
      RELEASE_INFO.versionName
    );

    assert.match(
      gradle,
      new RegExp(
        "versionCode\\s+" +
        RELEASE_INFO.versionCode
      )
    );

    assert.match(
      gradle,
      new RegExp(
        "versionName\\s+['\"]" +
        RELEASE_INFO.versionName
          .replaceAll(".", "\\.") +
        "['\"]"
      )
    );

    assert.match(
      gradle,
      new RegExp(
        "applicationId\\s+['\"]" +
        RELEASE_INFO.packageName
          .replaceAll(".", "\\.") +
        "['\"]"
      )
    );
  }
);


test(
  "反馈页进入正式路由且旧租约占位分支已清除",
  () => {
    assert.equal(
      pageRegistry.has(
        "feedback"
      ),
      true
    );

    assert.equal(
      formalPageRuntime.has(
        "feedback"
      ),
      true
    );

    const runtimeSource =
      fs.readFileSync(
        new URL(
          "../src/ui/runtime/AndroidPlaytestEntry.js",
          import.meta.url
        ),
        "utf8"
      );

    assert.doesNotMatch(
      runtimeSource,
      /"lease",\s*\]\s*\.includes/
    );

    assert.doesNotMatch(
      runtimeSource,
      /页面 \$\{pageId\} 的正式运行入口还在整合/
    );
  }
);


test(
  "发布包装所需隐私说明、发布清单和元数据脚本全部存在",
  () => {
    for (
      const relativePath
      of [
        "../PRIVACY.md",
        "../docs/PUBLISHING.md",
        "../scripts/generate-release-metadata.mjs"
      ]
    ) {
      assert.equal(
        fs.existsSync(
          new URL(
            relativePath,
            import.meta.url
          )
        ),
        true,
        relativePath
      );
    }

    const manifest =
      fs.readFileSync(
        new URL(
          "../android/app/src/main/AndroidManifest.xml",
          import.meta.url
        ),
        "utf8"
      );

    assert.match(
      manifest,
      /android:label="城市餐饮创业"/
    );

    assert.doesNotMatch(
      manifest,
      /android\.permission\.INTERNET/
    );
  }
);
