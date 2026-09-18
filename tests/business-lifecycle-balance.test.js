import test from "node:test";
import assert from "node:assert/strict";

import {
  app
} from "../src/main.js";

import {
  randomSystem
} from "../src/core/RandomSystem.js";

import {
  timeSystem
} from "../src/core/TimeSystem.js";

import {
  districtSystem
} from "../src/systems/DistrictSystem.js";

import {
  propertySystem
} from "../src/systems/PropertySystem.js";

import {
  restaurantSystem
} from "../src/systems/RestaurantSystem.js";

import {
  financeSystem
} from "../src/systems/FinanceSystem.js";

import {
  leaseSystem
} from "../src/systems/LeaseSystem.js";

import {
  renovationSystem
} from "../src/systems/RenovationSystem.js";

import {
  renovationConstructionSystem
} from "../src/systems/RenovationConstructionSystem.js";

import {
  employeeSystem
} from "../src/systems/EmployeeSystem.js";

import {
  ingredientCatalogSystem
} from "../src/systems/IngredientCatalogSystem.js";

import {
  supplierSystem
} from "../src/systems/SupplierSystem.js";

import {
  autoProcurementSystem
} from "../src/systems/AutoProcurementSystem.js";

import {
  dishCatalogSystem
} from "../src/systems/DishCatalogSystem.js";

import {
  recipeSystem
} from "../src/systems/RecipeSystem.js";

import {
  menuSystem
} from "../src/systems/MenuSystem.js";

import {
  openingFlowSystem
} from "../src/systems/OpeningFlowSystem.js";

import {
  openingPermitSystem
} from "../src/systems/OpeningPermitSystem.js";

import {
  salesChannelSystem
} from "../src/systems/SalesChannelSystem.js";

import {
  financeCenterPageSystem
} from "../src/ui/pages/finance/FinanceCenterPageSystem.js";

import {
  DISH_SCHEMA_VERSION,
  getDefaultRecipeId
} from "../src/data/dishCatalogRules.js";

import {
  RECIPE_SCHEMA_VERSION
} from "../src/data/recipeRules.js";

const {
  gameState,
  entitySystem,
  simulationSystem
} = app.core;

const INITIAL_CAPITAL =
  300000;

const TARGET_DAYS =
  Math.max(
    90,
    Number.parseInt(
      process.env
        .PHASE3_BALANCE_DAYS ??
        "90",
      10
    ) ||
    90
  );

function setupScenario() {
  gameState.reset();

  randomSystem.setSeed(
    "phase3-business-lifecycle-v1"
  );

  districtSystem.load(
    [
      {
        id:
          "phase3_balance_district",
        name:
          "平衡基线商圈",
        trafficIndex:
          100,
        rentMultiplier:
          1,
        spendingPower:
          70,
        competition:
          12,
        parkingConvenience:
          60,
        transitAccess:
          75,
        deliveryDemand:
          65,
        seasonality:
          1,
        customerMix: {
          resident:
            45,
          office_worker:
            40,
          young_professional:
            15
        }
      }
    ],
    {
      overwrite:
        true
    }
  );

  const property =
    propertySystem.create({
      districtId:
        "phase3_balance_district",
      name:
        "平衡基线100㎡街铺",
      area:
        100,
      usableArea:
        100,
      baseMonthlyRent:
        6000,
      seats:
        20,
      depositMonths:
        1,
      foodServiceAllowed:
        true,
      exhaustAllowed:
        true
    });

  const restaurant =
    restaurantSystem.create({
      name:
        "第三阶段平衡基线店"
    });

  financeSystem.createAccount(
    restaurant.id,
    INITIAL_CAPITAL
  );

  const lease =
    leaseSystem.sign({
      restaurantId:
        restaurant.id,
      propertyId:
        property.id,
      months:
        18
    });

  assert.equal(
    lease.monthlyRent,
    6000
  );

  renovationSystem.initialize(
    restaurant.id
  );

  for (
    const placement
    of [
      {
        furnitureId:
          "table_4",
        x: 0,
        y: 0
      },
      {
        furnitureId:
          "table_4",
        x: 3,
        y: 0
      },
      {
        furnitureId:
          "table_4",
        x: 6,
        y: 0
      },
      {
        furnitureId:
          "kitchen_station",
        x: 0,
        y: 3
      },
      {
        furnitureId:
          "cashier_counter",
        x: 3,
        y: 3
      }
    ]
  ) {
    renovationSystem.placeItem({
      restaurantId:
        restaurant.id,
      ...placement
    });
  }

  const layout =
    renovationSystem.getLayout(
      restaurant.id
    );

  const construction =
    renovationConstructionSystem
      .startSavedLayout(
        restaurant.id,
        {
          projectCost:
            layout.totalSpent
        }
      );

  timeSystem.advance(
    construction.durationDays *
      1440
  );

  const inspection =
    renovationConstructionSystem
      .inspect(
        restaurant.id
      );

  assert.equal(
    inspection.construction.status,
    "completed"
  );

  const renovation =
    renovationSystem.getSummary(
      restaurant.id
    );

  assert.equal(
    renovation.active,
    true
  );

  assert.equal(
    renovation.modifiers.seats,
    12
  );

  employeeSystem.hire({
    restaurantId:
      restaurant.id,
    name:
      "基线厨师",
    roleId:
      "chef"
  });

  employeeSystem.hire({
    restaurantId:
      restaurant.id,
    name:
      "基线服务员",
    roleId:
      "server"
  });

  employeeSystem.hire({
    restaurantId:
      restaurant.id,
    name:
      "基线收银员",
    roleId:
      "cashier"
  });

  ingredientCatalogSystem.load(
    [
      {
        id:
          "phase3_rice",
        name:
          "基线大米",
        category:
          "grain",
        unit:
          "g",
        storageType:
          "dry",
        basePurchasePrice:
          0.0065,
        shelfLifeDays:
          180,
        edibleRate:
          1,
        baseWasteRate:
          0.01
      },
      {
        id:
          "phase3_egg",
        name:
          "基线鸡蛋",
        category:
          "egg",
        unit:
          "piece",
        storageType:
          "chilled",
        basePurchasePrice:
          0.62,
        shelfLifeDays:
          18,
        edibleRate:
          0.92,
        baseWasteRate:
          0.02
      }
    ],
    {
      overwrite:
        true
    }
  );

  const supplier =
    supplierSystem.create({
      name:
        "平衡基线供应商",
      relationship:
        60,
      reliability:
        100
    });

  supplierSystem.addOffer(
    supplier.id,
    "phase3_rice",
    {
      priceMultiplier:
        1,
      priceVolatility:
        0,
      qualityMin:
        3,
      qualityMax:
        4,
      deliveryMinutes:
        30,
      capacityPerDay:
        50000,
      minimumOrder:
        1000
    }
  );

  supplierSystem.addOffer(
    supplier.id,
    "phase3_egg",
    {
      priceMultiplier:
        1,
      priceVolatility:
        0,
      qualityMin:
        3,
      qualityMax:
        4,
      deliveryMinutes:
        30,
      capacityPerDay:
        500,
      minimumOrder:
        20
    }
  );

  dishCatalogSystem.load(
    [
      {
        schemaVersion:
          DISH_SCHEMA_VERSION,
        id:
          "phase3_egg_rice",
        name:
          "家常鸡蛋饭",
        category:
          "rice",
        basePrice:
          22,
        unlockLevel:
          1,
        baseDifficulty:
          20,
        defaultRecipeId:
          getDefaultRecipeId(
            "phase3_egg_rice"
          ),
        tags: [
          "rice",
          "stir_fry"
        ]
      }
    ],
    {
      overwrite:
        true
    }
  );

  recipeSystem.load(
    [
      {
        schemaVersion:
          RECIPE_SCHEMA_VERSION,
        id:
          getDefaultRecipeId(
            "phase3_egg_rice"
          ),
        dishId:
          "phase3_egg_rice",
        variantId:
          "standard",
        name:
          "标准做法",
        method:
          "stir_fry",
        difficulty:
          20,
        cookingMinutes:
          8,
        ingredients: [
          {
            ingredientId:
              "phase3_rice",
            quantity:
              180
          },
          {
            ingredientId:
              "phase3_egg",
            quantity:
              1
          }
        ]
      }
    ],
    {
      overwrite:
        true
    }
  );

  menuSystem.addItem({
    restaurantId:
      restaurant.id,
    dishId:
      "phase3_egg_rice",
    recipeId:
      getDefaultRecipeId(
        "phase3_egg_rice"
      ),
    price:
      22
  });

  const permitSubmission =
    openingFlowSystem
      .completePermits(
        restaurant.id
      );

  assert.ok(
    permitSubmission
      .applications
      .length >
    0
  );

  timeSystem.advance(
    2 * 1440
  );

  openingFlowSystem
    .configureSchedule(
      restaurant.id,
      {
        openHour:
          9,
        closeHour:
          22
      }
    );

  const starter =
    openingFlowSystem
      .purchaseStarterStock(
        restaurant.id,
        120
      );

  assert.ok(
    starter.orders.length >
    0
  );

  timeSystem.advance(
    60
  );

  autoProcurementSystem.setPolicy({
    restaurantId:
      restaurant.id,
    ingredientId:
      "phase3_rice",
    supplierId:
      supplier.id,
    minimumQuantity:
      6000,
    targetQuantity:
      24000
  });

  autoProcurementSystem.setPolicy({
    restaurantId:
      restaurant.id,
    ingredientId:
      "phase3_egg",
    supplierId:
      supplier.id,
    minimumQuantity:
      40,
    targetQuantity:
      160
  });

  const beforeOpenSettlement =
    app.systems
      .dailySettlementSystem
      .settleThrough(
        restaurant.id,
        gameState
          .getSection("time")
          .day
      );

  assert.deepEqual(
    beforeOpenSettlement,
    []
  );

  const status =
    openingFlowSystem.getStatus(
      restaurant.id
    );

  assert.equal(
    status.canOpen,
    true
  );

  openingFlowSystem.openRestaurant(
    restaurant.id
  );

  salesChannelSystem
    .ensureRestaurantChannels(
      restaurant.id
    );

  return {
    restaurant,
    property,
    lease,
    supplier,
    openingBalance:
      financeSystem.getBalance(
        restaurant.id
      ),
    openingDay:
      gameState
        .getSection("time")
        .day
  };
}

function renewDuePermits(
  restaurantId
) {
  const status =
    openingPermitSystem
      .getStatus(
        restaurantId
      );

  const renewed = [];

  for (
    const permit
    of status.permits
  ) {
    if (
      permit.required &&
      permit.issued &&
      permit.renewalDue
    ) {
      renewed.push(
        openingPermitSystem
          .renewPermit(
            restaurantId,
            permit.permitKind
          )
      );
    }
  }

  return renewed;
}

function advanceManagedDays(
  restaurantId,
  days
) {
  let remaining =
    days;

  while (
    remaining > 0
  ) {
    renewDuePermits(
      restaurantId
    );

    const chunk =
      Math.min(
        30,
        remaining
      );

    simulationSystem
      .advanceLongTerm(
        chunk
      );

    remaining -=
      chunk;
  }

  renewDuePermits(
    restaurantId
  );
}

function getCheckpoint(
  restaurantId,
  elapsedDays
) {
  const restaurant =
    restaurantSystem.get(
      restaurantId
    );

  const account =
    financeSystem.getSummary(
      restaurantId
    );

  const financePage =
    financeCenterPageSystem
      .getPage(
        restaurantId,
        {
          period:
            "month"
        }
      );

  const lease =
    leaseSystem.getByRestaurant(
      restaurantId
    );

  const payrollArrears =
    entitySystem
      .filter(
        "payroll_arrear",
        item =>
          item.restaurantId ===
            restaurantId &&
          item.status ===
            "unpaid"
      );

  const operatingArrears =
    entitySystem
      .filter(
        "operating_cost_arrear",
        item =>
          item.restaurantId ===
            restaurantId &&
          item.status ===
            "unpaid"
      );

  const payables =
    entitySystem
      .filter(
        "supplier_payable",
        item =>
          item.restaurantId ===
            restaurantId &&
          [
            "open",
            "overdue"
          ].includes(
            item.status
          )
      );

  const orders =
    entitySystem
      .filter(
        "customer_order",
        item =>
          item.restaurantId ===
            restaurantId
      );

  const employees =
    employeeSystem
      .listByRestaurant(
        restaurantId
      );

  const monthlyPayroll =
    employeeSystem.getPayroll(
      restaurantId
    );

  const recentSettlements =
    entitySystem
      .filter(
        "daily_settlement",
        item =>
          item.restaurantId ===
            restaurantId
      )
      .sort(
        (a, b) =>
          a.day - b.day
      )
      .slice(-30);

  const recentOrders =
    recentSettlements.reduce(
      (
        sum,
        item
      ) =>
        sum +
        (item.orders ?? 0),
      0
    );

  const recentRevenue =
    recentSettlements.reduce(
      (
        sum,
        item
      ) =>
        sum +
        (item.revenue ?? 0),
      0
    );

  const categoryExpense =
    Object.fromEntries(
      financePage.categories.map(
        item => [
          item.category,
          item.expense ?? 0
        ]
      )
    );

  const checkpoint = {
    elapsedDays,
    day:
      gameState
        .getSection("time")
        .day,
    level:
      restaurant.level,
    experience:
      restaurant.experience,
    balance:
      account.balance,
    lifetimeIncome:
      account.lifetimeIncome,
    lifetimeExpense:
      account.lifetimeExpense,
    monthlyIncome:
      financePage
        .summary
        .income,
    monthlyExpense:
      financePage
        .summary
        .expense,
    monthlyProfit:
      financePage
        .summary
        .profit,
    monthlyMargin:
      financePage
        .summary
        .profitMargin,
    monthlyCategoryExpense:
      categoryExpense,
    health:
      financePage
        .health
        .status,
    healthCostRatios:
      financePage
        .health
        .costRatios,
    healthAlerts:
      financePage
        .health
        .alerts,
    cashRunwayDays:
      financePage
        .health
        .cashRunwayDays,
    activeOrderRecords:
      orders.length,
    recent30DayOrders:
      recentOrders,
    recent30DayRevenue:
      recentRevenue,
    monthlyPayroll,
    employeeCount:
      employees.length,
    employees:
      employees.map(
        item => ({
          roleId:
            item.roleId,
          salary:
            item.salary,
          level:
            item.level,
          careerRankId:
            item.careerRankId,
          fatigue:
            item.fatigue,
          mood:
            item.mood
        })
      ),
    reputation:
      restaurant.reputation,
    satisfaction:
      restaurant
        .customerSatisfaction,
    repeatRate:
      restaurant.repeatRate,
    reviewScore:
      restaurant.reviewScore,
    complianceSuspended:
      Boolean(
        restaurant
          .complianceSuspended
      ),
    openComplianceViolations:
      openingPermitSystem
        .getStatus(
          restaurantId
        )
        .openViolations
        .length,
    payrollArrears:
      payrollArrears.length,
    operatingArrears:
      operatingArrears.length,
    supplierPayables:
      payables.length,
    unpaidRent:
      lease?.unpaidRent ??
      0,
    unpaidPropertyFee:
      lease
        ?.unpaidPropertyFee ??
      0
  };

  console.log(
    "[phase3-balance]",
    JSON.stringify(
      checkpoint
    )
  );

  return checkpoint;
}

test(
  `第三阶段经营基线从真实开店成本连续运行${TARGET_DAYS}天且不破产不爆钱`,
  () => {
    const scenario =
      setupScenario();

    const {
      restaurant,
      openingBalance
    } = scenario;

    assert.ok(
      openingBalance >
      0
    );

    assert.ok(
      openingBalance <
      INITIAL_CAPITAL
    );

    advanceManagedDays(
      restaurant.id,
      30
    );

    const day30 =
      getCheckpoint(
        restaurant.id,
        30
      );

    assert.ok(
      day30.balance >
      0
    );

    assert.equal(
      day30.payrollArrears,
      0
    );

    assert.equal(
      day30.operatingArrears,
      0
    );

    assert.equal(
      day30.unpaidRent,
      0
    );

    assert.ok(
      day30.level >= 2 &&
      day30.level <= 7
    );

    advanceManagedDays(
      restaurant.id,
      60
    );

    const day90 =
      getCheckpoint(
        restaurant.id,
        90
      );

    assert.ok(
      day90.balance >
      0
    );

    assert.equal(
      day90.payrollArrears,
      0
    );

    assert.equal(
      day90.operatingArrears,
      0
    );

    assert.equal(
      day90.unpaidRent,
      0
    );

    assert.ok(
      day90.level >=
      day30.level
    );

    assert.ok(
      day90.balance <
      INITIAL_CAPITAL *
        3
    );

    if (
      TARGET_DAYS <= 90
    ) {
      return;
    }

    advanceManagedDays(
      restaurant.id,
      TARGET_DAYS - 90
    );

    const day365 =
      getCheckpoint(
        restaurant.id,
        TARGET_DAYS
      );

    assert.ok(
      day365.balance >
      0
    );

    assert.equal(
      day365.payrollArrears,
      0
    );

    assert.equal(
      day365.operatingArrears,
      0
    );

    assert.equal(
      day365.unpaidRent,
      0
    );

    assert.equal(
      day365.unpaidPropertyFee,
      0
    );

    assert.equal(
      day365.supplierPayables,
      0
    );

    assert.ok(
      day365.level >=
      day90.level
    );

    assert.ok(
      day365.level >= 7
    );

    assert.ok(
      day365.balance <
      INITIAL_CAPITAL *
        5
    );

    assert.ok(
      Number.isFinite(
        day365
          .lifetimeIncome
      )
    );

    assert.ok(
      Number.isFinite(
        day365
          .lifetimeExpense
      )
    );

    assert.ok(
      day365
        .lifetimeIncome >
      0
    );

    assert.ok(
      day365
        .lifetimeExpense >
      0
    );

    assert.equal(
      day365
        .complianceSuspended,
      false
    );

    assert.equal(
      day365
        .openComplianceViolations,
      0
    );

    assert.ok(
      day365
        .monthlyProfit >
      0,
      "理性续证后的长期门店不应因固定经营结构自然转为亏损"
    );

    assert.ok(
      [
        "healthy",
        "watch",
        "warning"
      ].includes(
        day365.health
      )
    );
  }
);
