import { app } from "../../src/main.js";
import { randomSystem } from "../../src/core/RandomSystem.js";
import { timeSystem } from "../../src/core/TimeSystem.js";
import { districtSystem } from "../../src/systems/DistrictSystem.js";
import { propertySystem } from "../../src/systems/PropertySystem.js";
import { restaurantSystem } from "../../src/systems/RestaurantSystem.js";
import { financeSystem } from "../../src/systems/FinanceSystem.js";
import { leaseSystem } from "../../src/systems/LeaseSystem.js";
import { renovationSystem } from "../../src/systems/RenovationSystem.js";
import { renovationConstructionSystem } from "../../src/systems/RenovationConstructionSystem.js";
import { employeeSystem } from "../../src/systems/EmployeeSystem.js";
import { ingredientCatalogSystem } from "../../src/systems/IngredientCatalogSystem.js";
import { supplierSystem } from "../../src/systems/SupplierSystem.js";
import { autoProcurementSystem } from "../../src/systems/AutoProcurementSystem.js";
import { dishCatalogSystem } from "../../src/systems/DishCatalogSystem.js";
import { recipeSystem } from "../../src/systems/RecipeSystem.js";
import { menuSystem } from "../../src/systems/MenuSystem.js";
import { openingFlowSystem } from "../../src/systems/OpeningFlowSystem.js";
import { salesChannelSystem } from "../../src/systems/SalesChannelSystem.js";
import {
  DISH_SCHEMA_VERSION,
  getDefaultRecipeId
} from "../../src/data/dishCatalogRules.js";
import { RECIPE_SCHEMA_VERSION } from "../../src/data/recipeRules.js";

const {
  gameState,
  entitySystem,
  simulationSystem
} = app.core;

export const BALANCE_INITIAL_CAPITAL =
  300000;

export function setupLaunchBalanceScenario({
  seed,
  price = 22,
  trafficIndex = 100
}) {
  gameState.reset();

  randomSystem.setSeed(
    seed
  );

  districtSystem.load(
    [
      {
        id:
          "t11_balance_district",
        name:
          "T11平衡商圈",
        trafficIndex,
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
        "t11_balance_district",
      name:
        "T11 100㎡街铺",
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
        "T11策略模拟店"
    });

  financeSystem.createAccount(
    restaurant.id,
    BALANCE_INITIAL_CAPITAL
  );

  leaseSystem.sign({
    restaurantId:
      restaurant.id,
    propertyId:
      property.id,
    months:
      18
  });

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

  renovationConstructionSystem
    .inspect(
      restaurant.id
    );

  employeeSystem.hire({
    restaurantId:
      restaurant.id,
    name:
      "T11厨师",
    roleId:
      "chef"
  });

  employeeSystem.hire({
    restaurantId:
      restaurant.id,
    name:
      "T11服务员",
    roleId:
      "server"
  });

  employeeSystem.hire({
    restaurantId:
      restaurant.id,
    name:
      "T11收银员",
    roleId:
      "cashier"
  });

  ingredientCatalogSystem.load(
    [
      {
        id:
          "t11_rice",
        name:
          "T11大米",
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
          "t11_egg",
        name:
          "T11鸡蛋",
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
        "T11基线供应商",
      relationship:
        60,
      reliability:
        100
    });

  supplierSystem.addOffer(
    supplier.id,
    "t11_rice",
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
    "t11_egg",
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
          "t11_egg_rice",
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
            "t11_egg_rice"
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
            "t11_egg_rice"
          ),
        dishId:
          "t11_egg_rice",
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
              "t11_rice",
            quantity:
              180
          },
          {
            ingredientId:
              "t11_egg",
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

  const menuItem =
    menuSystem.addItem({
      restaurantId:
        restaurant.id,
      dishId:
        "t11_egg_rice",
      recipeId:
        getDefaultRecipeId(
          "t11_egg_rice"
        ),
      price
    });

  openingFlowSystem
    .completePermits(
      restaurant.id
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

  openingFlowSystem
    .purchaseStarterStock(
      restaurant.id,
      120
    );

  timeSystem.advance(
    60
  );

  autoProcurementSystem.setPolicy({
    restaurantId:
      restaurant.id,
    ingredientId:
      "t11_rice",
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
      "t11_egg",
    supplierId:
      supplier.id,
    minimumQuantity:
      40,
    targetQuantity:
      160
  });

  openingFlowSystem
    .openRestaurant(
      restaurant.id
    );

  salesChannelSystem
    .ensureRestaurantChannels(
      restaurant.id
    );

  return {
    restaurant,
    property,
    supplier,
    menuItem,
    openingBalance:
      financeSystem.getBalance(
        restaurant.id
      )
  };
}

function tryStartMarketing(
  restaurantId,
  actionId
) {
  if (!actionId) {
    return false;
  }

  const restaurant =
    restaurantSystem.get(
      restaurantId
    );

  if (
    (
      restaurant.level ??
      1
    ) <
    3
  ) {
    return false;
  }

  const availability =
    app.systems
      .marketActionSystem
      .getAvailability(
        restaurantId,
        actionId
      );

  if (
    !availability.canStart
  ) {
    return false;
  }

  app.systems
    .marketActionSystem
    .startAction(
      restaurantId,
      actionId
    );

  return true;
}

export function advanceStrategyDays(
  restaurantId,
  days,
  {
    marketingActionId =
      null
  } = {}
) {
  for (
    let day = 0;
    day < days;
    day += 1
  ) {
    tryStartMarketing(
      restaurantId,
      marketingActionId
    );

    simulationSystem
      .advanceLongTerm(
        1
      );
  }
}

export function getStrategyCheckpoint(
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

  const settlements =
    entitySystem
      .filter(
        "daily_settlement",
        item =>
          item.restaurantId ===
            restaurantId
      )
      .sort(
        (
          a,
          b
        ) =>
          a.day -
          b.day
      )
      .slice(
        -30
      );

  const orders =
    settlements.reduce(
      (
        sum,
        item
      ) =>
        sum +
        (
          item.orders ??
          0
        ),
      0
    );

  const revenue =
    settlements.reduce(
      (
        sum,
        item
      ) =>
        sum +
        (
          item.revenue ??
          0
        ),
      0
    );

  const ingredientCost =
    settlements.reduce(
      (
        sum,
        item
      ) =>
        sum +
        (
          item.ingredientCost ??
          0
        ),
      0
    );

  const payroll =
    settlements.reduce(
      (
        sum,
        item
      ) =>
        sum +
        (
          item.payrollDue ??
          0
        ),
      0
    );

  const transactions =
    financeSystem
      .getTransactions(
        restaurantId
      );

  const currentDay =
    app.core
      .gameState
      .getSection(
        "time"
      )
      .day;

  const recentTransactions =
    transactions.filter(
      item =>
        item.day >=
          currentDay -
          30 &&
        item.day <
          currentDay
    );

  const expenseByCategory =
    {};

  let financeIncome = 0;
  let financeExpense = 0;

  for (
    const item
    of recentTransactions
  ) {
    if (
      item.transactionType ===
      "income"
    ) {
      financeIncome +=
        item.amount;
    }

    if (
      [
        "expense",
        "apply_hold"
      ].includes(
        item.transactionType
      )
    ) {
      financeExpense +=
        item.amount;

      expenseByCategory[
        item.category
      ] =
        (
          expenseByCategory[
            item.category
          ] ??
          0
        ) +
        item.amount;
    }
  }

  const profit =
    financeIncome -
    financeExpense;

  const marketingRuns =
    app.systems
      .marketActionSystem
      .getHistory(
        restaurantId
      )
      .filter(
        item =>
          item.status ===
            "started" ||
          item.status ===
            "ended"
      )
      .length;

  return {
    elapsedDays,
    level:
      restaurant.level,
    experience:
      restaurant.experience,
    balance:
      account.balance,
    income:
      financeIncome,
    expense:
      financeExpense,
    profit,
    margin:
      financeIncome >
        0
        ? profit /
          financeIncome
        : 0,
    orders,
    revenue,
    averageSpend:
      orders >
        0
        ? revenue /
          orders
        : 0,
    ingredientCost,
    ingredientRatio:
      revenue >
        0
        ? ingredientCost /
          revenue
        : 0,
    payroll,
    salaryRatio:
      revenue >
        0
        ? payroll /
          revenue
        : 0,
    rent:
      expenseByCategory
        .rent ??
      0,
    utilities:
      expenseByCategory
        .utilities ??
      0,
    marketing:
      expenseByCategory
        .marketing ??
      0,
    marketingRuns,
    reviewScore:
      restaurant.reviewScore,
    repeatRate:
      restaurant.repeatRate,
    reputation:
      restaurant.reputation
  };
}
