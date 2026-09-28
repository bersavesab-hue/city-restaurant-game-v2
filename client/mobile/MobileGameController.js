function requireApp(app) {
  if (
    !app?.core ||
    !app?.systems
  ) {
    throw new TypeError(
      "Mobile game controller requires the bootstrapped app"
    );
  }

  return app;
}

function clampNumber(
  value,
  fallback = 0
) {
  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function formatClock(time) {
  return (
    String(time.hour)
      .padStart(
        2,
        "0"
      ) +
    ":" +
    String(time.minute)
      .padStart(
        2,
        "0"
      )
  );
}

function createMobileGameController(
  app
) {
  requireApp(app);

  const {
    gameState,
    timeSystem,
    saveSystem,
    simulationSystem,
    entitySystem
  } =
    app.core;

  const {
    restaurantSystem,
    financeSystem,
    employeeSystem,
    storeProgressSystem,
    ingredientCatalogSystem,
    inventorySystem,
    supplierSystem,
    procurementSystem,
    dishCatalogSystem,
    recipeSystem,
    menuSystem,
    orderSystem,
    operatingScheduleSystem,
    propertySystem,
    districtSystem,
    dishResearchSystem
  } =
    app.systems;

  let lastMessage =
    "经营系统已连接真实数据";

  function getRestaurant() {
    return (
      restaurantSystem
        .list()[0] ??
      null
    );
  }

  function findStarterDish() {
    return (
      dishCatalogSystem
        .getAll()
        .filter(
          dish =>
            (
              dish.unlockLevel ??
              1
            ) <= 1
        )
        .map(
          dish => ({
            dish,

            recipe:
              recipeSystem.get(
                dish.defaultRecipeId
              ) ??
              recipeSystem
                .getByDish(
                  dish.id
                )[0] ??
              null
          })
        )
        .find(
          item =>
            item.recipe &&
            Array.isArray(
              item.recipe
                .ingredients
            ) &&
            item.recipe
              .ingredients
              .length >
              0
        ) ??
      null
    );
  }

  function ensureStarterState() {
    const existing =
      getRestaurant();

    if (existing) {
      return {
        restaurant:
          existing,
        created:
          false
      };
    }

    const property =
      propertySystem
        .list({
          availableOnly:
            true
        })
        .sort(
          (
            a,
            b
          ) =>
            (
              a.monthlyRent ??
              Infinity
            ) -
            (
              b.monthlyRent ??
              Infinity
            )
        )[0] ??
      null;

    const restaurant =
      restaurantSystem
        .create({
          name:
            "街角小馆",

          locationId:
            property?.id ??
            null
        });

    financeSystem
      .createAccount(
        restaurant.id,
        120000
      );

    for (
      const [
        name,
        roleId
      ]
      of [
        [
          "主厨",
          "chef"
        ],
        [
          "服务员",
          "server"
        ],
        [
          "收银员",
          "cashier"
        ]
      ]
    ) {
      employeeSystem.hire({
        restaurantId:
          restaurant.id,
        name,
        roleId
      });
    }

    const starterDish =
      findStarterDish();

    if (!starterDish) {
      throw new Error(
        "没有可用的一级菜品配方"
      );
    }

    const menuItem =
      menuSystem.addItem({
        restaurantId:
          restaurant.id,
        dishId:
          starterDish.dish.id,
        recipeId:
          starterDish.recipe.id,
        price:
          starterDish.dish
            .basePrice
      });

    for (
      const ingredient
      of starterDish.recipe
        .ingredients
    ) {
      inventorySystem
        .addBatch({
          restaurantId:
            restaurant.id,

          ingredientId:
            ingredient
              .ingredientId,

          quantity:
            Math.max(
              20,
              Math.ceil(
                ingredient
                  .quantity *
                200 *
                100
              ) /
              100
            ),

          quality:
            4,

          sourceType:
            "starter_stock",

          sourceId:
            menuItem.id
        });
    }

    operatingScheduleSystem
      .create({
        restaurantId:
          restaurant.id,
        openHour: 9,
        closeHour: 22
      });

    lastMessage =
      "已建立真实测试门店，可直接开始经营";

    return {
      restaurant:
        restaurantSystem.get(
          restaurant.id
        ),
      created:
        true
    };
  }

  function getTodayOrders(
    restaurantId,
    day
  ) {
    return orderSystem
      .listByRestaurant(
        restaurantId
      )
      .filter(
        order =>
          order.day === day &&
          order.status ===
            "completed"
      );
  }

  function getLatestSettlement(
    restaurantId
  ) {
    return (
      entitySystem
        .list(
          "daily_settlement"
        )
        .filter(
          item =>
            item.restaurantId ===
            restaurantId
        )
        .sort(
          (
            a,
            b
          ) =>
            b.day -
            a.day
        )[0] ??
      null
    );
  }

  function getProcurementTarget(
    restaurantId
  ) {
    const menuItems =
      menuSystem
        .listByRestaurant(
          restaurantId,
          {
            activeOnly:
              true
          }
        );

    const candidates = [];

    for (
      const menuItem
      of menuItems
    ) {
      const recipe =
        recipeSystem.get(
          menuItem.recipeId
        );

      for (
        const ingredient
        of recipe?.ingredients ??
        []
      ) {
        candidates.push({
          ingredientId:
            ingredient
              .ingredientId,

          available:
            inventorySystem
              .getAvailableQuantity(
                restaurantId,
                ingredient
                  .ingredientId
              )
        });
      }
    }

    candidates.sort(
      (
        a,
        b
      ) =>
        a.available -
        b.available
    );

    const suppliers =
      supplierSystem
        .list()
        .filter(
          supplier =>
            supplier.status ===
            "active"
        );

    for (
      const candidate
      of candidates
    ) {
      for (
        const supplier
        of suppliers
      ) {
        const offer =
          supplierSystem
            .listOffers(
              supplier.id
            )
            .find(
              item =>
                item.ingredientId ===
                  candidate
                    .ingredientId
            );

        if (!offer) {
          continue;
        }

        const remaining =
          procurementSystem
            .getRemainingDailyCapacity(
              supplier.id,
              candidate
                .ingredientId,
              gameState
                .getSection(
                  "time"
                )
                .day
            );

        const minimum =
          clampNumber(
            offer.minimumOrder,
            1
          );

        if (
          remaining <
          minimum
        ) {
          continue;
        }

        return {
          supplierId:
            supplier.id,

          supplierName:
            supplier.name,

          ingredientId:
            candidate
              .ingredientId,

          ingredientName:
            ingredientCatalogSystem
              .get(
                candidate
                  .ingredientId
              )
              ?.name ??
            candidate
              .ingredientId,

          currentQuantity:
            candidate.available,

          quantity:
            minimum,

          remainingCapacity:
            remaining
        };
      }
    }

    return null;
  }

  function getViewModel() {
    const {
      restaurant
    } =
      ensureStarterState();

    const time =
      gameState
        .getSection(
          "time"
        );

    const runtime =
      gameState
        .getSection(
          "runtime"
        );

    const finance =
      financeSystem
        .getSummary(
          restaurant.id
        );

    const orders =
      getTodayOrders(
        restaurant.id,
        time.day
      );

    const todayRevenue =
      orders.reduce(
        (
          sum,
          order
        ) =>
          sum +
          (
            order.totalRevenue ??
            0
          ),
        0
      );

    const progress =
      storeProgressSystem
        .getProgress(
          restaurant.id
        );

    const inventory =
      inventorySystem
        .getSummary(
          restaurant.id
        )
        .map(
          item => ({
            ...item,

            name:
              ingredientCatalogSystem
                .get(
                  item
                    .ingredientId
                )
                ?.name ??
              item.ingredientId
          })
        )
        .sort(
          (
            a,
            b
          ) =>
            a.name
              .localeCompare(
                b.name,
                "zh-CN"
              )
        );

    const pendingOrders =
      procurementSystem
        .listByRestaurant(
          restaurant.id,
          "pending"
        );

    const menu =
      menuSystem
        .listByRestaurant(
          restaurant.id,
          {
            activeOnly:
              true
          }
        )
        .map(
          item => ({
            ...item,

            dishName:
              dishCatalogSystem
                .get(
                  item.dishId
                )
                ?.name ??
              item.dishId
          })
        );

    const latestSettlement =
      getLatestSettlement(
        restaurant.id
      );

    const procurement =
      getProcurementTarget(
        restaurant.id
      );

    const property =
      restaurant.locationId
        ? propertySystem.get(
            restaurant.locationId
          )
        : null;

    const district =
      property?.districtId
        ? districtSystem.get(
            property.districtId
          )
        : null;

    const research =
      dishResearchSystem
        .getResearchSummary(
          restaurant.id
        );

    const schedule =
      operatingScheduleSystem
        .get(
          restaurant.id
        );

    return {
      restaurant,
      finance,
      progress,
      inventory,
      menu,
      latestSettlement,
      procurement,
      property,
      district,
      research,
      schedule,

      employees:
        employeeSystem
          .listByRestaurant(
            restaurant.id
          ),

      time: {
        ...time,
        clock:
          formatClock(
            time
          )
      },

      runtime: {
        paused:
          Boolean(
            runtime?.paused
          ),

        speed:
          runtime?.speed ??
          1
      },

      today: {
        orders:
          orders.length,

        revenue:
          todayRevenue
      },

      pendingDeliveries:
        pendingOrders.length,

      lastMessage
    };
  }

  function setSpeed(speed) {
    timeSystem
      .setSpeed(
        speed
      );

    lastMessage =
      `时间速度已切换为 ${speed}×`;

    return getViewModel();
  }

  function toggleTimePause() {
    const runtime =
      gameState
        .getSection(
          "runtime"
        );

    if (
      runtime?.paused
    ) {
      timeSystem.resume();

      lastMessage =
        "游戏时间继续";
    } else {
      timeSystem.pause();

      lastMessage =
        "游戏时间已暂停";
    }

    return getViewModel();
  }

  function toggleRestaurant() {
    const restaurant =
      getRestaurant();

    if (!restaurant) {
      throw new Error(
        "门店尚未初始化"
      );
    }

    if (
      restaurant.status ===
      "open"
    ) {
      restaurantSystem
        .pause(
          restaurant.id
        );

      lastMessage =
        "门店已暂停营业";
    } else if (
      restaurant.status ===
      "paused"
    ) {
      restaurantSystem
        .resume(
          restaurant.id
        );

      lastMessage =
        "门店恢复营业";
    } else {
      restaurantSystem
        .open(
          restaurant.id
        );

      lastMessage =
        "门店已开始营业";
    }

    return getViewModel();
  }

  function purchaseRecommended() {
    const restaurant =
      getRestaurant();

    const target =
      restaurant
        ? getProcurementTarget(
            restaurant.id
          )
        : null;

    if (!restaurant) {
      throw new Error(
        "门店尚未初始化"
      );
    }

    if (!target) {
      throw new Error(
        "当前没有可下单的推荐原料"
      );
    }

    const quote =
      supplierSystem
        .getQuote(
          target.supplierId,
          target.ingredientId,
          target.quantity
        );

    const order =
      procurementSystem
        .purchase({
          restaurantId:
            restaurant.id,

          supplierId:
            target.supplierId,

          ingredientId:
            target.ingredientId,

          quantity:
            target.quantity,

          quoteOverride:
            quote
        });

    lastMessage =
      `已采购${target.ingredientName} × ${target.quantity}，预计 ${order.deliveryMinutes} 游戏分钟到货`;

    return order;
  }

  function advanceOneHour() {
    simulationSystem
      .advanceFast(
        60
      );

    lastMessage =
      "测试快进 1 游戏小时完成";

    return getViewModel();
  }

  function saveNow() {
    const record =
      saveSystem.save(
        "auto"
      );

    lastMessage =
      "已手动保存";

    return record;
  }

  function performAction(
    action,
    value = null
  ) {
    try {
      switch (action) {
        case "toggle-time":
          return {
            ok: true,
            viewModel:
              toggleTimePause()
          };

        case "speed":
          return {
            ok: true,
            viewModel:
              setSpeed(
                Number(value)
              )
          };

        case "toggle-restaurant":
          return {
            ok: true,
            viewModel:
              toggleRestaurant()
          };

        case "purchase":
          purchaseRecommended();

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "advance-hour":
          return {
            ok: true,
            viewModel:
              advanceOneHour()
          };

        case "save":
          saveNow();

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        default:
          throw new Error(
            `未知操作：${action}`
          );
      }
    } catch (error) {
      lastMessage =
        error?.message ??
        "操作失败";

      return {
        ok: false,
        error:
          lastMessage,
        viewModel:
          getViewModel()
      };
    }
  }

  return Object.freeze({
    ensureStarterState,
    getViewModel,
    performAction,
    getProcurementTarget
  });
}

export {
  createMobileGameController
};
