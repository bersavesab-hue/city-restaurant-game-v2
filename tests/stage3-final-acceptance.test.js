import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  fileURLToPath
} from "node:url";

import {
  FORMAL_RUNTIME_PAGE_IDS
} from "../src/ui/runtime/FormalPageRuntime.js";

import {
  MAIN_ROOT_PAGE_IDS,
  NATIVE_RUNTIME_PAGE_IDS,
  INTENTIONAL_PLACEHOLDER_PAGE_IDS
} from "../src/ui/runtime/RuntimeRouteContract.js";

import {
  MORE_GROUPS
} from "../src/ui/pages/more/MoreHubPageSystem.js";

import {
  PRIMARY_ENTRIES
} from "../src/ui/pages/operations-hub/OperationsHubPageSystem.js";

import {
  gameplayNavigationSystem
} from "../src/ui/navigation/GameplayNavigationSystem.js";


const HERE =
  path.dirname(
    fileURLToPath(
      import.meta.url
    )
  );


function read(
  relativePath
) {
  return fs.readFileSync(
    path.resolve(
      HERE,
      relativePath
    ),
    "utf8"
  );
}


function walk(
  directory
) {
  const out =
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
      out.push(
        ...walk(
          full
        )
      );
    } else {
      out.push(
        full
      );
    }
  }

  return out;
}


const FORMAL_VIEW_FILES =
  [
    "supply/SupplyManagementView.js",
    "finance/FinanceCenterView.js",
    "employee-recruitment/EmployeeRecruitmentView.js",
    "employee-detail/EmployeeDetailView.js",
    "employee-training/EmployeeTrainingView.js",
    "employee-promotion/EmployeePromotionView.js",
    "workforce-capacity/WorkforceCapacityView.js",
    "command-center/OperatingCommandCenterView.js",
    "capacity/CapacityManagementView.js",
    "reputation/ReputationView.js",
    "channels/ChannelManagementView.js",
    "menu-optimization/MenuOptimizationView.js",
    "menu-engineering/MenuEngineeringView.js",
    "equipment/EquipmentManagementView.js",
    "equipment-maintenance/EquipmentMaintenanceView.js",
    "customers/CustomerManagementView.js",
    "marketing/MemberMarketingView.js",
    "compliance/ComplianceCenterView.js",
    "operations-hub/OperationsHubView.js",
    "ranking/RankingCenterView.js",
    "awards/AwardsView.js",
    "honors/HonorHallView.js",
    "award-ceremony/AwardCeremonyView.js",
    "more/MoreHubView.js",
    "market-strategy/MarketStrategyView.js",
    "progress/StoreProgressView.js",
    "chain/ChainManagementView.js",
    "lease/LeaseManagementView.js",
    "settings/SettingsView.js",
    "brand-investments/BrandInvestmentView.js",
    "feedback/FeedbackView.js"
  ];


test(
  "第三阶段所有正式运行时页面统一使用全局游戏外壳",
  () => {
    for (
      const file
      of FORMAL_VIEW_FILES
    ) {
      const source =
        read(
          "../src/ui/pages/" +
          file
        );

      for (
        const symbol
        of [
          "renderGameTopBar",
          "renderNoticeTicker",
          "renderPageTitle",
          "renderBottomNavigation"
        ]
      ) {
        assert.ok(
          source.includes(
            symbol
          ),
          `${file} 缺少 ${symbol}`
        );
      }
    }
  }
);


test(
  "第三阶段正式入口全部指向真实运行时页面",
  () => {
    assert.deepEqual(
      INTENTIONAL_PLACEHOLDER_PAGE_IDS,
      []
    );

    const supported =
      new Set([
        ...FORMAL_RUNTIME_PAGE_IDS,
        ...NATIVE_RUNTIME_PAGE_IDS,
        ...MAIN_ROOT_PAGE_IDS
      ]);

    const targets =
      [
        ...MORE_GROUPS
          .flatMap(
            group =>
              group.entries
          )
          .map(
            entry =>
              entry.target
          ),

        ...PRIMARY_ENTRIES
          .flatMap(
            entry => [
              entry.target,
              ...entry.secondary
                .map(
                  item =>
                    item.target
                )
            ]
          )
      ];

    const missing =
      [
        ...new Set(
          targets
        )
      ]
        .filter(
          target =>
            !supported.has(
              target
            )
        );

    assert.deepEqual(
      missing,
      []
    );
  }
);


test(
  "五个主导航只有一个正式落地页",
  () => {
    assert.equal(
      gameplayNavigationSystem
        .getLandingPage(
          "city"
        ),
      "city"
    );

    assert.equal(
      gameplayNavigationSystem
        .getLandingPage(
          "restaurant"
        ),
      "restaurant"
    );

    assert.equal(
      gameplayNavigationSystem
        .getLandingPage(
          "operations"
        ),
      "operations"
    );

    assert.equal(
      gameplayNavigationSystem
        .getLandingPage(
          "employees"
        ),
      "employees"
    );

    assert.equal(
      gameplayNavigationSystem
        .getLandingPage(
          "more"
        ),
      "more"
    );
  }
);


test(
  "UI源码不再包含开发期占位文案和废弃主页接口",
  () => {
    const root =
      path.resolve(
        HERE,
        "../src/ui"
      );

    const files =
      walk(
        root
      )
        .filter(
          file =>
            /\.(js|css)$/
              .test(
                file
              )
        );

    const forbidden =
      [
        "图片槽位",
        "头像槽位",
        "待正式页面",
        "页面尚未接入",
        "后续接入",
        "store-hud",
        "store-bottom-nav",
        "signature-dish-",
        "restaurant-avatar"
      ];

    for (
      const file
      of files
    ) {
      const source =
        fs.readFileSync(
          file,
          "utf8"
        );

      for (
        const value
        of forbidden
      ) {
        assert.equal(
          source.includes(
            value
          ),
          false,
          `${path.relative(root,file)} 仍包含废弃内容：${value}`
        );
      }
    }
  }
);


test(
  "第三阶段收尾样式已进入主主题且包含手机断点",
  () => {
    const theme =
      read(
        "../src/ui/theme/theme.css"
      );

    const finalStyles =
      read(
        "../src/ui/theme/stage3-final-pages.css"
      );

    assert.ok(
      theme.includes(
        "stage3-final-pages.css"
      )
    );

    assert.ok(
      finalStyles.includes(
        "max-width: 520px"
      )
    );

    for (
      const selector
      of [
        ".workforce-capacity-page",
        ".capacity-management-page",
        ".reputation-formal-page",
        ".menu-optimization-page",
        ".menu-engineering-page",
        ".equipment-management-page",
        ".equipment-maintenance-page"
      ]
    ) {
      assert.ok(
        finalStyles.includes(
          selector
        ),
        `收尾样式缺少：${selector}`
      );
    }
  }
);
