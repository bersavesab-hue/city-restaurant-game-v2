import {
  spawnSync
} from "node:child_process";

import {
  existsSync
} from "node:fs";


const tests = [
  "tests/district-visual-registry.test.js",
  "tests/city-generated-art.test.js",
  "tests/foundation-v2-smoke.test.js",
  "tests/word-of-mouth.test.js",
  "tests/customer-loyalty-integration.test.js",
  "tests/no-formal-ui-placeholder.test.js",
  "tests/navigation-roundtrip.test.js",
  "tests/runtime-route-coverage.test.js",
  "tests/android-runtime-routing.test.js",
  "tests/formal-page-runtime.test.js",
  "tests/android-single-bootstrap.test.js",
  "tests/gameplay-navigation.test.js",
  "tests/game-chrome-unified.test.js",

  "tests/city-property-game-ui.test.js",
  "tests/property-lease-market.test.js",
  "tests/lease-flow.test.js",

  "tests/formal-renovation-furniture-data.test.js",
  "tests/formal-renovation-template-data.test.js",
  "tests/renovation-planning.test.js",
  "tests/renovation-editor.test.js",
  "tests/renovation-mobile-page.test.js",
  "tests/renovation-construction-ui.test.js",

  "tests/opening-readiness.test.js",
  "tests/opening-flow-ui.test.js",
  "tests/opening-live-refresh.test.js",
  "tests/opening-journey-e2e.test.js",


  "tests/operating-command-center-formal-ui.test.js",
  "tests/operating-cycle.test.js",
  "tests/operating-day-e2e.test.js",
  "tests/formal-runtime-live-refresh.test.js",
  "tests/formal-runtime-navigation-params.test.js",
  "tests/analytics-live-refresh.test.js",
  "tests/operating-live-snapshot.test.js",
  "tests/operating-analytics.test.js",
  "tests/finance-settlement.test.js",
  "tests/finance-center-ui.test.js",
  "tests/formal-economic-balance-data.test.js",
  "tests/economic-balance-integration.test.js",
  "tests/business-analytics-ui.test.js",

  "tests/dish-center-ui.test.js",
  "tests/dish-management-system.test.js",
  "tests/dish-rules.test.js",
  "tests/formal-dish-growth-rules.test.js",
  "tests/dish-quality-semantics-integration.test.js",
  "tests/cooking-flow.test.js",
  "tests/dish-catalog-schema.test.js",
  "tests/formal-dish-recipe-data.test.js",
  "tests/cooking-method-recipe-schema.test.js",
  "tests/restaurant-dish-progress.test.js",
  "tests/dish-research.test.js",
  "tests/dish-growth.test.js",
  "tests/dish-lifecycle.test.js",
  "tests/dish-research-preview.test.js",
  "tests/formal-supplier-data.test.js",
  "tests/supply-management.test.js",
  "tests/formal-equipment-data.test.js",
  "tests/equipment-maintenance.test.js",
  "tests/formal-employee-generation-data.test.js",
  "tests/formal-employee-career-data.test.js",
  "tests/employee-management-ui.test.js",
  "tests/employee-formal-pages.test.js",
  "tests/formal-customer-segment-data.test.js",
  "tests/customer-segment.test.js",
  "tests/customer-experience.test.js",
  "tests/formal-district-data.test.js",
  "tests/formal-venue-type-data.test.js",
  "tests/formal-property-template-data.test.js",
  "tests/formal-competitor-data.test.js",
  "tests/market-competition.test.js",
  "tests/competitor-dynamics.test.js",
  "tests/formal-random-event-data.test.js",
  "tests/random-event-integration.test.js",
  "tests/district-event.test.js",
  "tests/business-calendar.test.js",
  "tests/formal-marketing-action-data.test.js",
  "tests/marketing-action-integration.test.js",
  "tests/formal-restaurant-positioning-data.test.js",
  "tests/restaurant-positioning.test.js",
  "tests/restaurant-positioning-integration.test.js",
  "tests/formal-sales-channel-data.test.js",
  "tests/sales-channel.test.js",
  "tests/sales-channel-order.test.js",
  "tests/sales-channel-integration.test.js",
  "tests/formal-member-program-data.test.js",
  "tests/customer-loyalty.test.js",
  "tests/member-benefit-marketing.test.js",
  "tests/member-order-checkout.test.js",
  "tests/member-lifecycle-integration.test.js",
  "tests/formal-compliance-permit-data.test.js",
  "tests/compliance-lifecycle-integration.test.js",
  "tests/existing-page-entry-points.test.js",
  "tests/ranking-awards-catalog.test.js",
  "tests/award-cycle.test.js",
  "tests/ranking-awards-pages.test.js",
  "tests/award-feedback.test.js",
  "tests/award-ceremony.test.js",
  "tests/more-hub.test.js",
  "tests/market-strategy-ui.test.js",
  "tests/store-progress-ui.test.js",
  "tests/formal-store-progression-data.test.js",
  "tests/store-progression-integration.test.js",
  "tests/service-capacity.test.js",
  "tests/service-capacity-integration.test.js",
  "tests/ingredient-data-v1.test.js"
];


console.log(
  "========================================"
);

console.log(
  " 第二阶段 V0.1 可玩流程 Gate"
);

console.log(
  "========================================"
);


const missingTests =
  tests.filter(
    path =>
      !existsSync(
        path
      )
  );


if (
  missingTests.length >
  0
) {
  console.error(
    "Phase2 Gate contains missing test files:"
  );

  for (
    const path
    of missingTests
  ) {
    console.error(
      " - " +
      path
    );
  }

  process.exit(
    1
  );
}


const result =
  spawnSync(
    process.execPath,
    [
      "--test",
      ...tests
    ],
    {
      stdio:
        "inherit"
    }
  );


process.exit(
  result.status ??
  1
);
