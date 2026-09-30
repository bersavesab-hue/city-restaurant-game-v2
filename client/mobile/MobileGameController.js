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
    dishResearchSystem,
    restaurantDishSystem,
    dishGrowthSystem,
    employeeStaffingSystem,
    employeeCareerSystem,
    employeeDynamicsSystem,
    staffingRecommendationSystem,
    marketActionSystem,
    trafficDemandSystem,
    reviewInsightSystem,
    renovationSystem,
    renovationEditorSystem,
    renovationPlanningSystem,
    renovationConstructionSystem,
    layoutFlowSystem,
    serviceCapacitySystem,
    launchProgressionSystem
  } =
    app.systems;

  let lastMessage =
    "经营系统已连接真实数据";

  const businessUi = {
    tab: "overview",
    ingredientId: null,
    supplierId: null,
    quantity: null,
    paymentMode: "cash",
    quote: null,
    inventoryIngredientId: null,
    marketingCategory: "all",
    marketActionId: null
  };

  const dishUi = {
    tab: "menu",
    selectedDishId: null,
    researchMethodId: null,
    researchIngredientIds: [],
    lastResearchResult: null
  };

  const staffUi = {
    tab: "team",
    selectedEmployeeId: null,
    selectedCandidateId: null
  };

  const moreUi = {
    tab: "system",
    selectedTemplateId: null,
    facilityCategory: "all",
    selectedFurnitureId: null
  };

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

    const availableProperties =
      propertySystem
        .list({
          availableOnly:
            true
        });

    const property =
      (
        availableProperties
          .filter(
            item =>
              (
                item.usableArea ??
                item.area ??
                0
              ) >=
                36 &&
              ![
                "cloud_kitchen",
                "stall"
              ].includes(
                item.venueTypeId ??
                item.tags?.[0] ??
                ""
              )
          )
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
        availableProperties
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
          )[0]
      ) ??
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

    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const suppliers =
      getUnlockedSuppliers(
        restaurant
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

  function getUnlockedSuppliers(
    restaurant
  ) {
    return supplierSystem
      .list({
        activeOnly: true
      })
      .filter(
        supplier =>
          (
            supplier.unlockLevel ??
            1
          ) <=
          (
            restaurant.level ??
            1
          )
      )
      .filter(
        supplier =>
          launchProgressionSystem
            .isSupplierAllowed(
              restaurant.level,
              supplier.id
            )
      );
  }

  function getProcurementCatalog(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const suppliers =
      getUnlockedSuppliers(
        restaurant
      );

    const supplied =
      new Set();

    for (
      const supplier
      of suppliers
    ) {
      for (
        const offer
        of supplierSystem
          .listOffers(
            supplier.id
          )
      ) {
        supplied.add(
          offer.ingredientId
        );
      }
    }

    const menuIngredientIds =
      new Set();

    for (
      const menuItem
      of menuSystem
        .listByRestaurant(
          restaurantId,
          {
            activeOnly: true
          }
        )
    ) {
      const recipe =
        recipeSystem.get(
          menuItem.recipeId
        );

      for (
        const item
        of recipe?.ingredients ??
        []
      ) {
        menuIngredientIds.add(
          item.ingredientId
        );
      }
    }

    return ingredientCatalogSystem
      .getAll()
      .filter(
        ingredient =>
          supplied.has(
            ingredient.id
          ) &&
          launchProgressionSystem
            .isIngredientCategoryAllowed(
              restaurant.level,
              ingredient.category
            )
      )
      .map(
        ingredient => ({
          ...ingredient,
          currentQuantity:
            inventorySystem
              .getAvailableQuantity(
                restaurantId,
                ingredient.id
              ),
          pendingQuantity:
            procurementSystem
              .getPendingQuantity(
                restaurantId,
                ingredient.id
              ),
          requiredByMenu:
            menuIngredientIds.has(
              ingredient.id
            )
        })
      )
      .sort(
        (
          a,
          b
        ) =>
          Number(
            b.requiredByMenu
          ) -
            Number(
              a.requiredByMenu
            ) ||
          a.name.localeCompare(
            b.name,
            "zh-CN"
          )
      );
  }

  function getSupplierOptions(
    restaurantId,
    ingredientId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const day =
      gameState
        .getSection(
          "time"
        )
        .day;

    return getUnlockedSuppliers(
      restaurant
    )
      .map(
        supplier => {
          const offer =
            supplierSystem
              .getOffer(
                supplier.id,
                ingredientId
              );

          if (!offer) {
            return null;
          }

          const remainingCapacity =
            procurementSystem
              .getRemainingDailyCapacity(
                supplier.id,
                ingredientId,
                day
              );

          return {
            id:
              supplier.id,
            name:
              supplier.name,
            relationship:
              supplier.relationship,
            reliability:
              supplier.reliability,
            capabilityTier:
              supplier.capabilityTier,
            maxCreditDays:
              supplier.maxCreditDays ??
              0,
            minimumOrder:
              offer.minimumOrder,
            capacityPerDay:
              offer.capacityPerDay,
            remainingCapacity,
            deliveryMinutes:
              offer.deliveryMinutes,
            qualityMin:
              offer.qualityMin,
            qualityMax:
              offer.qualityMax,
            priceMultiplier:
              offer.priceMultiplier
          };
        }
      )
      .filter(
        Boolean
      )
      .sort(
        (
          a,
          b
        ) =>
          b.relationship -
            a.relationship ||
          b.reliability -
            a.reliability ||
          a.name.localeCompare(
            b.name,
            "zh-CN"
          )
      );
  }

  function clearQuote() {
    businessUi.quote =
      null;
  }

  function ensureProcurementDraft(
    restaurantId
  ) {
    const catalog =
      getProcurementCatalog(
        restaurantId
      );

    const recommended =
      getProcurementTarget(
        restaurantId
      );

    if (
      !catalog.some(
        item =>
          item.id ===
          businessUi
            .ingredientId
      )
    ) {
      businessUi
        .ingredientId =
        recommended
          ?.ingredientId ??
        catalog[0]?.id ??
        null;

      clearQuote();
    }

    const supplierOptions =
      businessUi
        .ingredientId
        ? getSupplierOptions(
            restaurantId,
            businessUi
              .ingredientId
          )
        : [];

    if (
      !supplierOptions.some(
        supplier =>
          supplier.id ===
          businessUi
            .supplierId
      )
    ) {
      businessUi
        .supplierId =
        supplierOptions.some(
          supplier =>
            supplier.id ===
            recommended
              ?.supplierId
        )
          ? recommended
              .supplierId
          : supplierOptions[0]
              ?.id ??
            null;

      clearQuote();
    }

    const selectedSupplier =
      supplierOptions.find(
        supplier =>
          supplier.id ===
          businessUi
            .supplierId
      ) ??
      null;

    if (
      selectedSupplier
    ) {
      const minimum =
        Number(
          selectedSupplier
            .minimumOrder
        );

      const remaining =
        Number(
          selectedSupplier
            .remainingCapacity
        );

      const quantity =
        Number(
          businessUi.quantity
        );

      if (
        !Number.isFinite(
          quantity
        ) ||
        quantity < minimum ||
        quantity > remaining
      ) {
        businessUi.quantity =
          remaining >= minimum
            ? minimum
            : 0;

        clearQuote();
      }

      if (
        businessUi
          .paymentMode ===
            "credit" &&
        selectedSupplier
          .maxCreditDays <=
          0
      ) {
        businessUi
          .paymentMode =
          "cash";
      }
    } else {
      businessUi.quantity =
        0;
      businessUi
        .paymentMode =
        "cash";
      clearQuote();
    }

    return {
      catalog,
      supplierOptions,
      selectedSupplier
    };
  }

  function buildFinalQuotePreview(
    restaurantId,
    baseQuote
  ) {
    if (!baseQuote) {
      return null;
    }

    const modifiers =
      procurementSystem
        .getEventModifiers(
          restaurantId
        );

    const priceMultiplier =
      Math.max(
        0.35,
        Number(
          modifiers
            .supplyPriceMultiplier ??
          1
        )
      );

    const deliveryMultiplier =
      Math.max(
        0.5,
        Number(
          modifiers
            .deliveryTimeMultiplier ??
          1
        )
      );

    return {
      ...baseQuote,
      unitPrice:
        Number(
          (
            baseQuote
              .unitPrice *
            priceMultiplier
          ).toFixed(
            4
          )
        ),
      totalPrice:
        Math.max(
          1,
          Math.round(
            baseQuote
              .totalPrice *
            priceMultiplier
          )
        ),
      deliveryMinutes:
        Math.max(
          1,
          Math.round(
            baseQuote
              .deliveryMinutes *
            deliveryMultiplier
          )
        ),
      eventPriceMultiplier:
        priceMultiplier,
      eventDeliveryMultiplier:
        deliveryMultiplier
    };
  }

  function getBusinessModel(
    restaurantId,
    time
  ) {
    const {
      catalog,
      supplierOptions,
      selectedSupplier
    } =
      ensureProcurementDraft(
        restaurantId
      );

    const selectedIngredient =
      catalog.find(
        ingredient =>
          ingredient.id ===
          businessUi
            .ingredientId
      ) ??
      null;

    const inventorySummary =
      inventorySystem
        .getSummary(
          restaurantId
        );

    const inventoryIds =
      new Set([
        ...catalog.map(
          ingredient =>
            ingredient.id
        ),
        ...inventorySummary.map(
          item =>
            item.ingredientId
        )
      ]);

    const inventoryCatalog =
      [
        ...inventoryIds
      ]
        .map(
          ingredientId => {
            const ingredient =
              ingredientCatalogSystem
                .get(
                  ingredientId
                );

            if (!ingredient) {
              return null;
            }

            const summary =
              inventorySummary.find(
                item =>
                  item.ingredientId ===
                  ingredientId
              );

            return {
              ...ingredient,
              currentQuantity:
                summary
                  ?.usableQuantity ??
                0,
              totalQuantity:
                summary
                  ?.totalQuantity ??
                0,
              spoiledQuantity:
                summary
                  ?.spoiledQuantity ??
                0,
              batches:
                summary
                  ?.batches ??
                0,
              pendingQuantity:
                procurementSystem
                  .getPendingQuantity(
                    restaurantId,
                    ingredientId
                  )
            };
          }
        )
        .filter(
          Boolean
        )
        .sort(
          (
            a,
            b
          ) =>
            Number(
              b.totalQuantity >
              0
            ) -
              Number(
                a.totalQuantity >
                0
              ) ||
            a.name.localeCompare(
              b.name,
              "zh-CN"
            )
        );

    if (
      !businessUi
        .inventoryIngredientId ||
      !inventoryCatalog.some(
        ingredient =>
          ingredient.id ===
          businessUi
            .inventoryIngredientId
      )
    ) {
      businessUi
        .inventoryIngredientId =
        selectedIngredient?.id ??
        inventoryCatalog[0]
          ?.id ??
        null;
    }

    const inventoryIngredient =
      inventoryCatalog.find(
        ingredient =>
          ingredient.id ===
          businessUi
            .inventoryIngredientId
      ) ??
      null;

    const batches =
      inventoryIngredient
        ? inventorySystem
            .getBatches(
              restaurantId,
              inventoryIngredient
                .id,
              {
                activeOnly: true,
                includeSpoiled:
                  true
              }
            )
        : [];

    const orders =
      procurementSystem
        .listByRestaurant(
          restaurantId
        )
        .map(
          order => ({
            ...order,
            ingredientName:
              ingredientCatalogSystem
                .get(
                  order
                    .ingredientId
                )
                ?.name ??
              order
                .ingredientId,
            supplierName:
              supplierSystem
                .get(
                  order
                    .supplierId
                )
                ?.name ??
              order.supplierId,
            remainingMinutes:
              order.status ===
                "pending"
                ? Math.max(
                    0,
                    order.expectedAt -
                      time.totalMinutes
                  )
                : 0
          })
        )
        .sort(
          (
            a,
            b
          ) =>
            b.orderedAt -
            a.orderedAt
        );

    const spoiledBatches =
      inventorySystem
        .getBatches(
          restaurantId,
          null,
          {
            activeOnly: true,
            includeSpoiled:
              true
          }
        )
        .filter(
          batch =>
            batch.spoiled
        );

    const finalQuote =
      businessUi.quote
        ? buildFinalQuotePreview(
            restaurantId,
            businessUi.quote
          )
        : null;

    return {
      tab:
        businessUi.tab,
      catalog,
      inventoryCatalog,
      selectedIngredient,
      supplierOptions,
      selectedSupplier,
      quantity:
        businessUi.quantity,
      paymentMode:
        businessUi
          .paymentMode,
      quote:
        finalQuote,
      quoteLocked:
        Boolean(
          businessUi.quote
        ),
      canUseCredit:
        (
          selectedSupplier
            ?.maxCreditDays ??
          0
        ) > 0,
      creditDays:
        selectedSupplier
          ?.maxCreditDays ??
        0,
      orders,
      pendingOrders:
        orders.filter(
          order =>
            order.status ===
            "pending"
        ),
      inventoryIngredient,
      batches,
      spoiledBatches,
      spoiledQuantity:
        spoiledBatches.reduce(
          (
            total,
            batch
          ) =>
            total +
            batch.quantity,
          0
        ),
      marketing:
        getMarketingModel(
          restaurantId,
          time
        )
    };
  }

  function getMarketingModel(
    restaurantId,
    time
  ) {
    const status =
      marketActionSystem
        .getStatus(
          restaurantId
        );

    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const featureUnlocked =
      storeProgressSystem
        .isUnlocked(
          restaurantId,
          "marketing"
        );

    const launchAvailable =
      featureUnlocked
        ? status.available.filter(
            action =>
              launchProgressionSystem
                .isMarketingActionAllowed(
                  restaurant.level,
                  action.id
                )
          )
        : [];

    const categories =
      [
        ...new Set(
          launchAvailable.map(
            action =>
              action.category
          )
        )
      ];

    if (
      businessUi
        .marketingCategory !==
        "all" &&
      !categories.includes(
        businessUi
          .marketingCategory
      )
    ) {
      businessUi
        .marketingCategory =
        "all";
    }

    const visible =
      launchAvailable
        .filter(
          action =>
            businessUi
              .marketingCategory ===
              "all" ||
            action.category ===
              businessUi
                .marketingCategory
        )
        .map(
          action => {
            const active =
              status.active.find(
                item =>
                  item.type ===
                  action.id
              ) ??
              null;

            const last =
              marketActionSystem
                .getLastRun(
                  restaurantId,
                  action.id
                );

            return {
              ...action,
              active,
              last,
              remainingDays:
                active
                  ? Math.max(
                      0,
                      active.endDay -
                        time.day +
                        1
                    )
                  : 0,
              cooldownRemaining:
                Math.max(
                  0,
                  action
                    .availability
                    .availableDay -
                    time.day
                )
            };
          }
        )
        .sort(
          (
            a,
            b
          ) =>
            Number(
              Boolean(
                b.active
              )
            ) -
              Number(
                Boolean(
                  a.active
                )
              ) ||
            Number(
              b
                .availability
                .canStart
            ) -
              Number(
                a
                  .availability
                  .canStart
              ) ||
            a
              .minRestaurantLevel -
              b
                .minRestaurantLevel ||
            a.cost -
              b.cost ||
            a.name.localeCompare(
              b.name,
              "zh-CN"
            )
        );

    if (
      !visible.some(
        action =>
          action.id ===
          businessUi
            .marketActionId
      )
    ) {
      businessUi
        .marketActionId =
        visible[0]?.id ??
        null;
    }

    const selectedAction =
      visible.find(
        action =>
          action.id ===
          businessUi
            .marketActionId
      ) ??
      null;

    const history =
      marketActionSystem
        .getHistory(
          restaurantId
        )
        .slice()
        .sort(
          (
            a,
            b
          ) =>
            b.startDay -
            a.startDay
        )
        .slice(
          0,
          20
        );

    const noonDemand =
      trafficDemandSystem
        .getHourlyDemand(
          restaurantId,
          12
        );

    const diagnosis =
      reviewInsightSystem
        .getDiagnosis(
          restaurantId
        );

    return {
      unlocked:
        featureUnlocked,
      unlockLevel:
        storeProgressSystem
          .getUnlockLevel(
            "marketing"
          ),
      categories,
      category:
        businessUi
          .marketingCategory,
      actions:
        visible,
      selectedAction,
      active:
        status.active.map(
          action => ({
            ...action,
            remainingDays:
              Math.max(
                0,
                action.endDay -
                  time.day +
                  1
              )
          })
        ),
      history,
      modifiers:
        status.modifiers,
      noonExpectedVisitors:
        Number(
          (
            noonDemand
              .expectedVisitors ??
            0
          ).toFixed(
            1
          )
        ),
      topReviewIssue:
        diagnosis
          .topIssue,
      topReviewPositive:
        diagnosis
          .topPositive,
      activeLimit:
        2
    };
  }

  function setMarketingCategory(
    restaurantId,
    category
  ) {
    const valid =
      new Set([
        "all",
        ...marketActionSystem
          .getDefinitions()
          .map(
            action =>
              action.category
          )
      ]);

    if (
      !valid.has(
        category
      )
    ) {
      throw new Error(
        "未知活动分类"
      );
    }

    businessUi
      .marketingCategory =
      category;

    businessUi
      .marketActionId =
      null;

    getMarketingModel(
      restaurantId,
      gameState
        .getSection(
          "time"
        )
    );

    lastMessage =
      category ===
        "all"
        ? "全部营销活动"
        : "已切换活动分类";
  }

  function selectMarketAction(
    restaurantId,
    actionId
  ) {
    const action =
      marketActionSystem
        .getDefinitions()
        .find(
          item =>
            item.id ===
            actionId
        );

    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    if (
      !action ||
      !storeProgressSystem
        .isUnlocked(
          restaurantId,
          "marketing"
        ) ||
      !launchProgressionSystem
        .isMarketingActionAllowed(
          restaurant.level,
          actionId
        )
    ) {
      throw new Error(
        "营销活动不存在或当前阶段未开放"
      );
    }

    businessUi
      .marketActionId =
      actionId;

    lastMessage =
      `已选择活动：${action.name}`;
  }

  function startSelectedMarketAction(
    restaurantId
  ) {
    if (
      !businessUi
        .marketActionId
    ) {
      getMarketingModel(
        restaurantId,
        gameState
          .getSection(
            "time"
          )
      );
    }

    const actionId =
      businessUi
        .marketActionId;

    if (!actionId) {
      throw new Error(
        "请选择营销活动"
      );
    }

    const definition =
      marketActionSystem
        .getDefinition(
          actionId
        );

    const started =
      marketActionSystem
        .startAction(
          restaurantId,
          actionId
        );

    lastMessage =
      `活动已开始：${definition.name}，持续 ${definition.durationDays} 天`;

    return started;
  }

  function selectProcurementIngredient(
    restaurantId,
    ingredientId
  ) {
    const valid =
      getProcurementCatalog(
        restaurantId
      ).some(
        ingredient =>
          ingredient.id ===
          ingredientId
      );

    if (!valid) {
      throw new Error(
        "该原料当前不可采购"
      );
    }

    businessUi
      .ingredientId =
      ingredientId;
    businessUi
      .supplierId =
      null;
    businessUi.quantity =
      null;
    businessUi
      .paymentMode =
      "cash";
    clearQuote();

    ensureProcurementDraft(
      restaurantId
    );

    lastMessage =
      "已切换采购原料";
  }

  function selectProcurementSupplier(
    restaurantId,
    supplierId
  ) {
    const draft =
      ensureProcurementDraft(
        restaurantId
      );

    const supplier =
      draft.supplierOptions
        .find(
          item =>
            item.id ===
            supplierId
        );

    if (!supplier) {
      throw new Error(
        "该供应商当前无法供应所选原料"
      );
    }

    businessUi
      .supplierId =
      supplierId;
    businessUi.quantity =
      supplier.remainingCapacity >=
        supplier.minimumOrder
        ? supplier.minimumOrder
        : 0;
    businessUi
      .paymentMode =
      "cash";
    clearQuote();

    lastMessage =
      `已选择供应商：${supplier.name}`;
  }

  function adjustProcurementQuantity(
    restaurantId,
    mode
  ) {
    const draft =
      ensureProcurementDraft(
        restaurantId
      );

    const supplier =
      draft.selectedSupplier;

    if (!supplier) {
      throw new Error(
        "请先选择供应商"
      );
    }

    const minimum =
      Number(
        supplier.minimumOrder
      );

    const maximum =
      Number(
        supplier
          .remainingCapacity
      );

    if (
      maximum <
      minimum
    ) {
      throw new Error(
        "该供应商今日供货额度已不足"
      );
    }

    let next =
      Number(
        businessUi.quantity
      ) || minimum;

    switch (mode) {
      case "decrease":
        next =
          Math.max(
            minimum,
            next -
              minimum
          );
        break;

      case "increase":
        next =
          Math.min(
            maximum,
            next +
              minimum
          );
        break;

      case "minimum":
        next =
          minimum;
        break;

      case "maximum":
        next =
          maximum;
        break;

      default:
        throw new Error(
          "未知采购数量操作"
        );
    }

    businessUi.quantity =
      next;
    clearQuote();

    lastMessage =
      `采购数量调整为 ${next}`;
  }

  function setProcurementPayment(
    restaurantId,
    mode
  ) {
    const draft =
      ensureProcurementDraft(
        restaurantId
      );

    if (
      mode ===
        "credit" &&
      (
        draft
          .selectedSupplier
          ?.maxCreditDays ??
        0
      ) <= 0
    ) {
      throw new Error(
        "该供应商不提供账期"
      );
    }

    if (
      ![
        "cash",
        "credit"
      ].includes(
        mode
      )
    ) {
      throw new Error(
        "未知付款方式"
      );
    }

    businessUi
      .paymentMode =
      mode;

    lastMessage =
      mode ===
        "credit"
        ? "已选择供应商账期"
        : "已选择现付";
  }

  function refreshProcurementQuote(
    restaurantId
  ) {
    const draft =
      ensureProcurementDraft(
        restaurantId
      );

    if (
      !draft
        .selectedSupplier ||
      !businessUi
        .ingredientId ||
      !businessUi.quantity
    ) {
      throw new Error(
        "当前采购条件不足，无法报价"
      );
    }

    businessUi.quote =
      supplierSystem
        .getQuote(
          businessUi
            .supplierId,
          businessUi
            .ingredientId,
          businessUi
            .quantity
        );

    const finalQuote =
      buildFinalQuotePreview(
        restaurantId,
        businessUi.quote
      );

    lastMessage =
      `报价已锁定：¥${finalQuote.totalPrice}`;

    return finalQuote;
  }

  function purchaseDraft(
    restaurantId
  ) {
    const draft =
      ensureProcurementDraft(
        restaurantId
      );

    if (
      !businessUi.quote
    ) {
      throw new Error(
        "请先获取报价"
      );
    }

    if (
      businessUi.quote
        .supplierId !==
        businessUi
          .supplierId ||
      businessUi.quote
        .ingredientId !==
        businessUi
          .ingredientId ||
      businessUi.quote
        .quantity !==
        businessUi.quantity
    ) {
      clearQuote();

      throw new Error(
        "采购条件已变化，请重新报价"
      );
    }

    const ingredient =
      ingredientCatalogSystem
        .get(
          businessUi
            .ingredientId
        );

    const order =
      procurementSystem
        .purchase({
          restaurantId,
          supplierId:
            businessUi
              .supplierId,
          ingredientId:
            businessUi
              .ingredientId,
          quantity:
            businessUi
              .quantity,
          quoteOverride:
            businessUi.quote,
          paymentTerms:
            businessUi
              .paymentMode ===
              "credit"
              ? {
                  creditDays:
                    draft
                      .selectedSupplier
                      .maxCreditDays
                }
              : null
        });

    clearQuote();

    lastMessage =
      `采购单已创建：${ingredient?.name ?? order.ingredientId} × ${order.quantity}，预计 ${order.deliveryMinutes} 游戏分钟到货`;

    return order;
  }

  function cancelProcurementOrder(
    restaurantId,
    orderId
  ) {
    const order =
      procurementSystem.get(
        orderId
      );

    if (
      order.restaurantId !==
        restaurantId
    ) {
      throw new Error(
        "采购单不属于当前门店"
      );
    }

    const updated =
      procurementSystem.cancel(
        orderId
      );

    lastMessage =
      "采购单已取消，相关款项已按底层规则处理";

    return updated;
  }

  function selectInventoryIngredient(
    restaurantId,
    ingredientId
  ) {
    const exists =
      ingredientCatalogSystem
        .exists(
          ingredientId
        );

    if (!exists) {
      throw new Error(
        "原料不存在"
      );
    }

    businessUi
      .inventoryIngredientId =
      ingredientId;
    businessUi.tab =
      "inventory";

    lastMessage =
      "已打开库存批次详情";
  }

  function discardInventoryBatch(
    restaurantId,
    batchId
  ) {
    const batch =
      inventorySystem
        .getBatch(
          batchId
        );

    if (
      batch.restaurantId !==
        restaurantId
    ) {
      throw new Error(
        "库存批次不属于当前门店"
      );
    }

    inventorySystem
      .discardBatch(
        batchId,
        batch.spoiled
          ? "spoiled"
          : "manual"
      );

    lastMessage =
      `已处理库存批次 ${batchId}`;
  }

  function discardAllSpoiled(
    restaurantId
  ) {
    const result =
      inventorySystem
        .discardSpoiled(
          restaurantId
        );

    lastMessage =
      result.totalBatches > 0
        ? `已清理 ${result.totalBatches} 个腐坏批次，共 ${result.totalQuantity}`
        : "当前没有腐坏库存";

    return result;
  }

  function setBusinessTab(
    tab
  ) {
    if (
      ![
        "overview",
        "procurement",
        "inventory",
        "orders",
        "marketing"
      ].includes(
        tab
      )
    ) {
      throw new Error(
        "未知经营子页面"
      );
    }

    businessUi.tab =
      tab;

    lastMessage =
      tab ===
        "overview"
        ? "营业数据"
        : tab === "procurement"
          ? "采购中心"
        : tab ===
            "inventory"
          ? "库存中心"
          : tab ===
              "marketing"
            ? "活动与营销"
            : "采购单中心";
  }

  function getDishMenuItem(
    restaurantId,
    dishId
  ) {
    return (
      menuSystem
        .listByRestaurant(
          restaurantId
        )
        .find(
          item =>
            item.dishId ===
            dishId
        ) ??
      null
    );
  }

  function getDishRecipe(
    dish
  ) {
    if (!dish) {
      return null;
    }

    const recipeId =
      dish.recipeId ??
      dish.defaultRecipeId ??
      recipeSystem
        .getByDish(
          dish.id
        )[0]?.id ??
      null;

    return recipeId
      ? recipeSystem.get(
          recipeId
        )
      : null;
  }

  function decorateDish(
    restaurantId,
    dish
  ) {
    const menuItem =
      getDishMenuItem(
        restaurantId,
        dish.id
      );

    const recipe =
      menuItem?.recipeId
        ? recipeSystem.get(
            menuItem.recipeId
          )
        : getDishRecipe(
            dish
          );

    const progress =
      restaurantDishSystem
        .get(
          restaurantId,
          dish.id
        );

    return {
      ...dish,
      menuItem,
      recipe,
      progress,
      onMenu:
        Boolean(
          menuItem
        ),
      active:
        Boolean(
          menuItem?.active
        ),
      currentPrice:
        menuItem?.price ??
        dish.basePrice,
      soldCount:
        menuItem?.soldCount ??
        0,
      totalRevenue:
        menuItem?.totalRevenue ??
        0,
      ingredients:
        (
          recipe?.ingredients ??
          []
        ).map(
          item => {
            const ingredient =
              ingredientCatalogSystem
                .get(
                  item.ingredientId
                );

            return {
              ...item,
              name:
                ingredient
                  ?.name ??
                item.ingredientId,
              unit:
                ingredient
                  ?.unit ??
                "",
              stock:
                inventorySystem
                  .getAvailableQuantity(
                    restaurantId,
                    item.ingredientId
                  )
            };
          }
        )
    };
  }

  function ensureDishResearchDraft(
    restaurantId
  ) {
    const methods =
      dishResearchSystem
        .getAvailableMethods();

    if (
      !methods.some(
        method =>
          method.id ===
          dishUi
            .researchMethodId
      )
    ) {
      dishUi
        .researchMethodId =
        methods[0]?.id ??
        null;
    }

    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const ingredients =
      ingredientCatalogSystem
        .getAll()
        .filter(
          ingredient =>
            launchProgressionSystem
              .isIngredientCategoryAllowed(
                restaurant.level,
                ingredient.category
              )
        );

    const validIds =
      new Set(
        ingredients.map(
          item =>
            item.id
        )
      );

    dishUi
      .researchIngredientIds =
      dishUi
        .researchIngredientIds
        .filter(
          id =>
            validIds.has(
              id
            )
        );

    if (
      dishUi
        .researchIngredientIds
        .length <
      2
    ) {
      dishUi
        .researchIngredientIds =
        ingredients
          .slice(
            0,
            Math.min(
              3,
              ingredients.length
            )
          )
          .map(
            item =>
              item.id
          );
    }

    return {
      methods,
      ingredients
    };
  }

  function getDishModel(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const allMenuItems =
      menuSystem
        .listByRestaurant(
          restaurantId
        );

    const dishes =
      dishCatalogSystem
        .getAll()
        .filter(
          dish =>
            dish.custom
              ? dish
                  .ownerRestaurantId ===
                restaurantId
              : (
                  (
                    dish.unlockLevel ??
                    1
                  ) <=
                    restaurant.level &&
                  launchProgressionSystem
                    .isDishAllowed(
                      restaurant.level,
                      dish.id
                    )
                )
        )
        .map(
          dish =>
            decorateDish(
              restaurantId,
              dish
            )
        )
        .sort(
          (
            a,
            b
          ) =>
            Number(
              b.active
            ) -
              Number(
                a.active
              ) ||
            Number(
              b.onMenu
            ) -
              Number(
                a.onMenu
              ) ||
            Number(
              b.custom
            ) -
              Number(
                a.custom
              ) ||
            a.name.localeCompare(
              b.name,
              "zh-CN"
            )
        );

    if (
      !dishes.some(
        dish =>
          dish.id ===
          dishUi
            .selectedDishId
      )
    ) {
      dishUi.selectedDishId =
        dishes[0]?.id ??
        null;
    }

    const selectedDish =
      dishes.find(
        dish =>
          dish.id ===
          dishUi
            .selectedDishId
      ) ??
      null;

    const researchDraft =
      ensureDishResearchDraft(
        restaurantId
      );

    const selectedResearchIngredients =
      dishUi
        .researchIngredientIds
        .map(
          id =>
            ingredientCatalogSystem
              .get(
                id
              )
        )
        .filter(
          Boolean
        );

    const selectedMethod =
      researchDraft.methods
        .find(
          method =>
            method.id ===
            dishUi
              .researchMethodId
        ) ??
      null;

    const generatedResearchName =
      selectedMethod &&
      selectedResearchIngredients
        .length >=
        2
        ? `${selectedMethod.name}${selectedResearchIngredients[0].name}${selectedResearchIngredients[1].name}`
        : "待研发菜品";

    const limits =
      storeProgressSystem
        .getLimits(
          restaurantId
        );

    return {
      tab:
        dishUi.tab,
      dishes,
      selectedDish,
      menuItems:
        allMenuItems,
      activeMenuCount:
        allMenuItems.filter(
          item =>
            item.active
        ).length,
      menuLimit:
        limits.menuItems,
      research: {
        unlocked:
          storeProgressSystem
            .isUnlocked(
              restaurantId,
              "dish_research"
            ),
        unlockLevel:
          storeProgressSystem
            .getUnlockLevel(
              "dish_research"
            ),
        methods:
          researchDraft.methods,
        ingredients:
          researchDraft
            .ingredients,
        methodId:
          dishUi
            .researchMethodId,
        selectedMethod,
        ingredientIds: [
          ...dishUi
            .researchIngredientIds
        ],
        selectedIngredients:
          selectedResearchIngredients,
        generatedName:
          generatedResearchName,
        lastResult:
          dishUi
            .lastResearchResult
      }
    };
  }

  function setDishTab(
    restaurantId,
    tab
  ) {
    if (
      ![
        "menu",
        "library",
        "research"
      ].includes(
        tab
      )
    ) {
      throw new Error(
        "未知菜品子页面"
      );
    }

    if (
      tab ===
        "research" &&
      !storeProgressSystem
        .isUnlocked(
          restaurantId,
          "dish_research"
        )
    ) {
      throw new Error(
        `菜品研发将在门店 Lv.${storeProgressSystem.getUnlockLevel(
          "dish_research"
        )} 解锁`
      );
    }

    dishUi.tab =
      tab;

    lastMessage =
      tab ===
        "research"
        ? "菜品研发"
        : tab ===
            "library"
          ? "菜品库"
          : "营业菜单";
  }

  function selectDish(
    restaurantId,
    dishId
  ) {
    const dish =
      dishCatalogSystem.get(
        dishId
      );

    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    if (
      !dish ||
      (
        dish.custom &&
        dish.ownerRestaurantId !==
          restaurantId
      ) ||
      (
        !dish.custom &&
        (
          (
            dish.unlockLevel ??
            1
          ) >
            restaurant.level ||
          !launchProgressionSystem
            .isDishAllowed(
              restaurant.level,
              dish.id
            )
        )
      )
    ) {
      throw new Error(
        "菜品不存在或当前阶段未开放"
      );
    }

    dishUi
      .selectedDishId =
      dishId;

    lastMessage =
      `已选择菜品：${dish.name}`;
  }

  function adjustDishPrice(
    restaurantId,
    mode
  ) {
    const dish =
      getDishModel(
        restaurantId
      ).selectedDish;

    if (
      !dish?.menuItem
    ) {
      throw new Error(
        "菜品尚未加入菜单"
      );
    }

    const current =
      dish.menuItem.price;

    const steps = {
      minus5: -5,
      minus1: -1,
      plus1: 1,
      plus5: 5
    };

    if (
      !Object.prototype
        .hasOwnProperty.call(
          steps,
          mode
        )
    ) {
      throw new Error(
        "未知价格调整操作"
      );
    }

    const next =
      Math.max(
        1,
        current +
          steps[mode]
      );

    menuSystem.setPrice(
      dish.menuItem.id,
      next
    );

    lastMessage =
      `${dish.name} 售价调整为 ¥${next}`;
  }

  function toggleDishActive(
    restaurantId
  ) {
    const dish =
      getDishModel(
        restaurantId
      ).selectedDish;

    if (
      !dish?.menuItem
    ) {
      throw new Error(
        "菜品尚未加入菜单"
      );
    }

    const active =
      !dish.menuItem.active;

    menuSystem.setActive(
      dish.menuItem.id,
      active
    );

    lastMessage =
      active
        ? `${dish.name} 已恢复上架`
        : `${dish.name} 已下架`;
  }

  function addSelectedDishToMenu(
    restaurantId
  ) {
    const model =
      getDishModel(
        restaurantId
      );

    const dish =
      model.selectedDish;

    if (!dish) {
      throw new Error(
        "请选择菜品"
      );
    }

    if (
      dish.menuItem
    ) {
      throw new Error(
        "菜品已经在菜单中"
      );
    }

    if (
      model.menuItems
        .length >=
      model.menuLimit
    ) {
      throw new Error(
        `菜单栏位已满：${model.menuLimit}`
      );
    }

    const recipe =
      getDishRecipe(
        dish
      );

    if (!recipe) {
      throw new Error(
        "菜品没有可用配方"
      );
    }

    menuSystem.addItem({
      restaurantId,
      dishId:
        dish.id,
      recipeId:
        recipe.id,
      price:
        dish.basePrice
    });

    lastMessage =
      `${dish.name} 已加入菜单`;
  }

  function setResearchMethod(
    methodId
  ) {
    const method =
      dishResearchSystem
        .getAvailableMethods()
        .find(
          item =>
            item.id ===
            methodId
        );

    if (!method) {
      throw new Error(
        "烹饪方式不存在"
      );
    }

    dishUi
      .researchMethodId =
      methodId;

    lastMessage =
      `研发方式：${method.name}`;
  }

  function toggleResearchIngredient(
    ingredientId
  ) {
    const ingredient =
      ingredientCatalogSystem
        .get(
          ingredientId
        );

    const restaurant =
      getRestaurant();

    if (
      !ingredient ||
      !restaurant ||
      !launchProgressionSystem
        .isIngredientCategoryAllowed(
          restaurant.level,
          ingredient.category
        )
    ) {
      throw new Error(
        "研发原料不存在或当前阶段未开放"
      );
    }

    const current =
      new Set(
        dishUi
          .researchIngredientIds
      );

    if (
      current.has(
        ingredientId
      )
    ) {
      if (
        current.size <=
        2
      ) {
        throw new Error(
          "研发至少需要 2 种原料"
        );
      }

      current.delete(
        ingredientId
      );
    } else {
      if (
        current.size >=
        6
      ) {
        throw new Error(
          "研发最多选择 6 种原料"
        );
      }

      current.add(
        ingredientId
      );
    }

    dishUi
      .researchIngredientIds =
      [
        ...current
      ];

    dishUi
      .lastResearchResult =
      null;

    lastMessage =
      `研发原料已选择 ${current.size} 种`;
  }

  function researchSelectedDish(
    restaurantId
  ) {
    if (
      !storeProgressSystem
        .isUnlocked(
          restaurantId,
          "dish_research"
        )
    ) {
      throw new Error(
        `菜品研发将在门店 Lv.${storeProgressSystem.getUnlockLevel(
          "dish_research"
        )} 解锁`
      );
    }

    const draft =
      getDishModel(
        restaurantId
      ).research;

    if (
      !draft.selectedMethod ||
      draft
        .selectedIngredients
        .length <
        2
    ) {
      throw new Error(
        "研发条件不足"
      );
    }

    const ingredients =
      draft
        .selectedIngredients
        .map(
          ingredient => ({
            ingredientId:
              ingredient.id,
            quantity:
              dishResearchSystem
                .getRandomQuantity(
                  ingredient
                )
          })
        );

    const result =
      dishResearchSystem
        .research({
          restaurantId,
          name:
            draft
              .generatedName,
          category:
            draft
              .selectedMethod
              .defaultCategory,
          method:
            draft
              .selectedMethod
              .id,
          ingredients
        });

    dishUi
      .selectedDishId =
      result.dish.id;

    dishUi.tab =
      "library";

    dishUi
      .lastResearchResult =
      {
        dishId:
          result.dish.id,
        name:
          result.dish.name,
        researchScore:
          result.analysis
            .researchScore,
        researchCost:
          result.analysis
            .researchCost,
        suggestedPrice:
          result.analysis
            .suggestedPrice
      };

    lastMessage =
      `研发完成：${result.dish.name}，评分 ${result.analysis.researchScore}`;

    return result;
  }

  function minuteToClock(
    value
  ) {
    const minute =
      Math.max(
        0,
        Math.min(
          1440,
          Number(value) || 0
        )
      );

    const hour =
      Math.floor(
        minute /
        60
      );

    const rest =
      minute %
      60;

    return (
      String(hour)
        .padStart(
          2,
          "0"
        ) +
      ":" +
      String(rest)
        .padStart(
          2,
          "0"
        )
    );
  }

  function getEmployeeModel(
    restaurantId
  ) {
    let employees =
      employeeSystem
        .listByRestaurant(
          restaurantId
        );

    if (
      !employees.some(
        employee =>
          employee.id ===
          staffUi
            .selectedEmployeeId
      )
    ) {
      staffUi
        .selectedEmployeeId =
        employees[0]?.id ??
        null;
    }

    const profiles =
      employees.map(
        employee => {
          const career =
            employeeCareerSystem
              .getProfile(
                employee.id
              );

          const dynamics =
            employeeDynamicsSystem
              .getProfile(
                employee.id
              );

          const turnover =
            employeeStaffingSystem
              .getTurnoverRisk(
                employee.id
              );

          return {
            ...employee,
            role:
              career.role,
            rank:
              career.rank,
            promotion:
              career.promotion,
            salarySatisfaction:
              career
                .salarySatisfaction,
            trainingPrograms:
              career
                .trainingPrograms,
            dynamics,
            turnover
          };
        }
      );

    employees =
      profiles;

    const selectedEmployee =
      profiles.find(
        employee =>
          employee.id ===
          staffUi
            .selectedEmployeeId
      ) ??
      null;

    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const allowedRoleIds =
      new Set(
        launchProgressionSystem
          .getCumulativeContent(
            restaurant.level
          )
          .employeeRoleIds
      );

    let candidates =
      employeeStaffingSystem
        .listCandidates(
          restaurantId
        )
        .filter(
          candidate =>
            allowedRoleIds.has(
              candidate.roleId
            )
        );

    if (
      candidates.length ===
      0
    ) {
      candidates =
        employeeStaffingSystem
          .refreshTalentPool(
            restaurantId,
            {
              count: 14,
              replace: false
            }
          )
          .filter(
            candidate =>
              allowedRoleIds.has(
                candidate.roleId
              )
          );
    }

    if (
      !candidates.some(
        candidate =>
          candidate.id ===
          staffUi
            .selectedCandidateId
      )
    ) {
      staffUi
        .selectedCandidateId =
        candidates[0]?.id ??
        null;
    }

    const selectedCandidate =
      candidates.find(
        candidate =>
          candidate.id ===
          staffUi
            .selectedCandidateId
      ) ??
      null;

    const schedule =
      employeeStaffingSystem
        .getSchedule(
          restaurantId
        );

    const selectedSchedule =
      selectedEmployee
        ? schedule
            .filter(
              shift =>
                shift.employeeId ===
                selectedEmployee.id
            )
            .map(
              shift => ({
                ...shift,
                startClock:
                  minuteToClock(
                    shift.startMinute
                  ),
                endClock:
                  minuteToClock(
                    shift.endMinute
                  )
              })
            )
        : [];

    const recommendation =
      staffingRecommendationSystem
        .getRecommendation(
          restaurantId
        );

    const payrollHistory =
      employeeStaffingSystem
        .getPayrollHistory(
          restaurantId
        );

    const currentDay =
      gameState
        .getSection(
          "time"
        )
        .day;

    const nextPayrollDay =
      Math.ceil(
        Math.max(
          1,
          currentDay
        ) /
        30
      ) *
      30;

    return {
      tab:
        staffUi.tab,
      employees:
        profiles,
      selectedEmployee,
      candidates,
      selectedCandidate,
      employeeLimit:
        storeProgressSystem
          .getLimits(
            restaurantId
          )
          .employees,
      monthlyPayroll:
        employeeSystem
          .getPayroll(
            restaurantId
          ),
      totalArrears:
        profiles.reduce(
          (
            sum,
            employee
          ) =>
            sum +
            (
              employee
                .salaryArrears ??
              0
            ),
          0
        ),
      schedule,
      selectedSchedule,
      recommendation,
      payrollHistory,
      nextPayrollDay
    };
  }

  function setStaffTab(
    tab
  ) {
    if (
      ![
        "team",
        "recruit",
        "schedule",
        "payroll"
      ].includes(
        tab
      )
    ) {
      throw new Error(
        "未知员工子页面"
      );
    }

    staffUi.tab =
      tab;

    lastMessage =
      tab ===
        "recruit"
        ? "人才市场"
        : tab ===
            "schedule"
          ? "员工排班"
          : tab ===
              "payroll"
            ? "薪资与人工成本"
            : "员工团队";
  }

  function selectEmployee(
    restaurantId,
    employeeId
  ) {
    const employee =
      employeeSystem.get(
        employeeId
      );

    if (
      employee.restaurantId !==
        restaurantId ||
      employee.status ===
        "fired"
    ) {
      throw new Error(
        "员工不属于当前门店"
      );
    }

    staffUi
      .selectedEmployeeId =
      employeeId;

    lastMessage =
      `已选择员工：${employee.name}`;
  }

  function selectCandidate(
    restaurantId,
    candidateId
  ) {
    const candidate =
      employeeStaffingSystem
        .listCandidates(
          restaurantId
        )
        .find(
          item =>
            item.id ===
            candidateId
        );

    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    if (
      !candidate ||
      !launchProgressionSystem
        .isEmployeeRoleAllowed(
          restaurant.level,
          candidate.roleId
        )
    ) {
      throw new Error(
        "候选人已失效或岗位当前阶段未开放"
      );
    }

    staffUi
      .selectedCandidateId =
      candidateId;

    lastMessage =
      `已选择候选人：${candidate.name}`;
  }

  function refreshCandidates(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const allowedRoleIds =
      new Set(
        launchProgressionSystem
          .getCumulativeContent(
            restaurant.level
          )
          .employeeRoleIds
      );

    const candidates =
      employeeStaffingSystem
        .refreshTalentPool(
          restaurantId,
          {
            count: 14,
            replace: true
          }
        )
        .filter(
          candidate =>
            allowedRoleIds.has(
              candidate.roleId
            )
        );

    staffUi
      .selectedCandidateId =
      candidates[0]?.id ??
      null;

    lastMessage =
      `人才市场已刷新，共 ${candidates.length} 名候选人`;

    return candidates;
  }

  function hireSelectedCandidate(
    restaurantId
  ) {
    if (
      !staffUi
        .selectedCandidateId
    ) {
      throw new Error(
        "请选择候选人"
      );
    }

    const hired =
      employeeStaffingSystem
        .hireCandidate({
          restaurantId,
          candidateId:
            staffUi
              .selectedCandidateId
        });

    staffUi
      .selectedEmployeeId =
      hired.id;

    staffUi
      .selectedCandidateId =
      null;

    staffUi.tab =
      "team";

    lastMessage =
      `已招聘：${hired.name}`;

    return hired;
  }

  function trainSelectedEmployee(
    restaurantId,
    programId
  ) {
    const employeeId =
      staffUi
        .selectedEmployeeId;

    if (!employeeId) {
      throw new Error(
        "请选择员工"
      );
    }

    const employee =
      employeeSystem.get(
        employeeId
      );

    if (
      employee.restaurantId !==
        restaurantId
    ) {
      throw new Error(
        "员工不属于当前门店"
      );
    }

    const result =
      employeeCareerSystem
        .train(
          employeeId,
          programId
        );

    lastMessage =
      `${employee.name} 完成培训：${result.program.name}`;

    return result;
  }

  function promoteSelectedEmployee(
    restaurantId
  ) {
    const employeeId =
      staffUi
        .selectedEmployeeId;

    if (!employeeId) {
      throw new Error(
        "请选择员工"
      );
    }

    const employee =
      employeeSystem.get(
        employeeId
      );

    if (
      employee.restaurantId !==
        restaurantId
    ) {
      throw new Error(
        "员工不属于当前门店"
      );
    }

    const promoted =
      employeeCareerSystem
        .promote(
          employeeId
        );

    lastMessage =
      `${employee.name} 已晋升`;

    return promoted;
  }

  function adjustEmployeeSalary(
    restaurantId,
    mode
  ) {
    const employeeId =
      staffUi
        .selectedEmployeeId;

    if (!employeeId) {
      throw new Error(
        "请选择员工"
      );
    }

    const employee =
      employeeSystem.get(
        employeeId
      );

    if (
      employee.restaurantId !==
        restaurantId
    ) {
      throw new Error(
        "员工不属于当前门店"
      );
    }

    const steps = {
      minus500: -500,
      minus100: -100,
      plus100: 100,
      plus500: 500,
      recommended:
        employeeCareerSystem
          .getRecommendedSalary(
            employee
          ) -
        employee.salary
    };

    if (
      !Object.prototype
        .hasOwnProperty.call(
          steps,
          mode
        )
    ) {
      throw new Error(
        "未知薪资调整操作"
      );
    }

    const next =
      Math.max(
        1000,
        employee.salary +
          steps[mode]
      );

    employeeSystem
      .setSalary(
        employeeId,
        next
      );

    lastMessage =
      `${employee.name} 月薪调整为 ¥${next}`;
  }

  function toggleEmployeeShift(
    restaurantId,
    weekday
  ) {
    const employeeId =
      staffUi
        .selectedEmployeeId;

    if (!employeeId) {
      throw new Error(
        "请选择员工"
      );
    }

    const employee =
      employeeSystem.get(
        employeeId
      );

    if (
      employee.restaurantId !==
        restaurantId
    ) {
      throw new Error(
        "员工不属于当前门店"
      );
    }

    const day =
      Number(
        weekday
      );

    const existing =
      employeeStaffingSystem
        .getSchedule(
          restaurantId
        )
        .find(
          shift =>
            shift.employeeId ===
              employeeId &&
            shift.weekday ===
              day
        );

    if (existing) {
      employeeStaffingSystem
        .removeShift(
          employeeId,
          day
        );

      lastMessage =
        `${employee.name} 周${day}已休息`;

      return;
    }

    const schedule =
      operatingScheduleSystem
        .get(
          restaurantId
        );

    const startMinute =
      (
        schedule?.openHour ??
        9
      ) *
      60;

    const endMinute =
      Math.min(
        (
          schedule?.closeHour ??
          22
        ) *
        60,
        startMinute +
          8 *
          60
      );

    employeeStaffingSystem
      .setShift({
        employeeId,
        weekday:
          day,
        startMinute,
        endMinute
      });

    lastMessage =
      `${employee.name} 周${day}已按营业时间排班`;
  }

  function scheduleEmployeeAllWeek(
    restaurantId
  ) {
    const employeeId =
      staffUi
        .selectedEmployeeId;

    if (!employeeId) {
      throw new Error(
        "请选择员工"
      );
    }

    const schedule =
      operatingScheduleSystem
        .get(
          restaurantId
        );

    const startMinute =
      (
        schedule?.openHour ??
        9
      ) *
      60;

    const endMinute =
      Math.min(
        (
          schedule?.closeHour ??
          22
        ) *
        60,
        startMinute +
          8 *
          60
      );

    for (
      let weekday = 1;
      weekday <= 7;
      weekday += 1
    ) {
      if (
        weekday <= 5
      ) {
        employeeStaffingSystem
          .setShift({
            employeeId,
            weekday,
            startMinute,
            endMinute
          });
      } else {
        employeeStaffingSystem
          .removeShift(
            employeeId,
            weekday
          );
      }
    }

    lastMessage =
      "已生成周一至周五标准 8 小时班次";
  }

  function clearEmployeeSchedule(
    restaurantId
  ) {
    const employeeId =
      staffUi
        .selectedEmployeeId;

    if (!employeeId) {
      throw new Error(
        "请选择员工"
      );
    }

    for (
      let weekday = 1;
      weekday <= 7;
      weekday += 1
    ) {
      employeeStaffingSystem
        .removeShift(
          employeeId,
          weekday
        );
    }

    lastMessage =
      "已清空该员工本周排班";
  }

  function fireSelectedEmployee(
    restaurantId
  ) {
    const employeeId =
      staffUi
        .selectedEmployeeId;

    if (!employeeId) {
      throw new Error(
        "请选择员工"
      );
    }

    const employee =
      employeeSystem.get(
        employeeId
      );

    if (
      employee.restaurantId !==
        restaurantId
    ) {
      throw new Error(
        "员工不属于当前门店"
      );
    }

    employeeSystem.fire(
      employeeId
    );

    staffUi
      .selectedEmployeeId =
      null;

    lastMessage =
      `已解除 ${employee.name} 的雇佣关系`;
  }

  function getFacilityCategory(
    definition
  ) {
    if (
      definition.type ===
      "table"
    ) {
      return "dining";
    }

    if (
      definition.type ===
        "kitchen" ||
      definition.type ===
        "kitchen_support"
    ) {
      return "kitchen";
    }

    if (
      renovationSystem
        .hasFurnitureRole(
          definition,
          "waiting"
        )
    ) {
      return "waiting";
    }

    if (
      definition.type ===
      "service"
    ) {
      return "service";
    }

    return "decor";
  }

  function setMoreTab(
    restaurantId,
    tab
  ) {
    if (
      ![
        "renovation",
        "system"
      ].includes(
        tab
      )
    ) {
      throw new Error(
        "未知更多子页面"
      );
    }

    moreUi.tab =
      tab;

    if (
      tab ===
      "renovation"
    ) {
      renovationSystem
        .requireLayout(
          restaurantId
        );

      lastMessage =
        "装修与设施";
    } else {
      lastMessage =
        "时间与存档";
    }
  }

  function getRenovationModel(
    restaurantId
  ) {
    let summary =
      renovationSystem
        .getSummary(
          restaurantId
        );

    if (
      moreUi.tab ===
        "renovation" &&
      !summary.initialized
    ) {
      renovationSystem
        .requireLayout(
          restaurantId
        );

      summary =
        renovationSystem
          .getSummary(
            restaurantId
          );
    }

    if (
      !summary.initialized
    ) {
      return {
        initialized:
          false,
        summary,
        analysis:
          null,
        construction:
          null,
        progress:
          null,
        templates: [],
        selectedTemplate:
          null,
        categories: [],
        facilityCategory:
          moreUi
            .facilityCategory,
        facilities: [],
        selectedFacility:
          null,
        serviceCapacity:
          null
      };
    }

    const status =
      renovationConstructionSystem
        .getStatus(
          restaurantId
        );

    const currentConstruction =
      renovationConstructionSystem
        .getCurrent(
          restaurantId
        );

    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const rawRecommendations =
      renovationPlanningSystem
        .getTemplateRecommendations(
          restaurantId,
          {
            includeUnavailable:
              true
          }
        );

    const allowedTemplateIds =
      new Set(
        launchProgressionSystem
          .getCumulativeContent(
            restaurant.level
          )
          .renovationTemplateIds
      );

    const recommendations = {
      ...rawRecommendations,
      items:
        rawRecommendations
          .items
          .filter(
            item =>
              allowedTemplateIds.has(
                item.id
              )
          ),
      recommendedTemplateId:
        rawRecommendations
          .items
          .find(
            item =>
              allowedTemplateIds.has(
                item.id
              ) &&
              item.executable
          )
          ?.id ??
        null
    };

    if (
      !recommendations
        .items
        .some(
          item =>
            item.id ===
            moreUi
              .selectedTemplateId
        )
    ) {
      moreUi
        .selectedTemplateId =
        recommendations
          .recommendedTemplateId ??
        recommendations
          .items[0]?.id ??
        null;
    }

    const selectedTemplate =
      recommendations
        .items
        .find(
          item =>
            item.id ===
            moreUi
              .selectedTemplateId
        ) ??
      null;

    const layout =
      renovationSystem
        .getLayout(
          restaurantId
        );

    const installedCounts =
      new Map();

    for (
      const placement
      of layout?.placements ??
      []
    ) {
      installedCounts.set(
        placement.furnitureId,
        (
          installedCounts.get(
            placement.furnitureId
          ) ??
          0
        ) +
          1
      );
    }

    const catalog =
      renovationSystem
        .getCatalog(
          restaurantId
        )
        .map(
          item => ({
            ...item,
            category:
              getFacilityCategory(
                item
              ),
            installedCount:
              installedCounts.get(
                item.id
              ) ??
              0,
            affordable:
              financeSystem
                .getBalance(
                  restaurantId
                ) >=
              item.cost
          })
        );

    const categories =
      [
        ...new Set(
          catalog.map(
            item =>
              item.category
          )
        )
      ];

    if (
      moreUi
        .facilityCategory !==
        "all" &&
      !categories.includes(
        moreUi
          .facilityCategory
      )
    ) {
      moreUi
        .facilityCategory =
        "all";
    }

    const facilities =
      catalog
        .filter(
          item =>
            moreUi
              .facilityCategory ===
              "all" ||
            item.category ===
              moreUi
                .facilityCategory
        )
        .sort(
          (
            a,
            b
          ) =>
            Number(
              b.unlocked
            ) -
              Number(
                a.unlocked
              ) ||
            a.unlockLevel -
              b.unlockLevel ||
            a.cost -
              b.cost ||
            a.name.localeCompare(
              b.name,
              "zh-CN"
            )
        );

    if (
      !facilities.some(
        item =>
          item.id ===
          moreUi
            .selectedFurnitureId
      )
    ) {
      moreUi
        .selectedFurnitureId =
        facilities.find(
          item =>
            item.unlocked
        )?.id ??
        facilities[0]?.id ??
        null;
    }

    const selectedFacility =
      facilities.find(
        item =>
          item.id ===
          moreUi
            .selectedFurnitureId
      ) ??
      null;

    let analysis = null;

    try {
      analysis =
        renovationPlanningSystem
          .getAnalysis(
            restaurantId
          );
    } catch {
      analysis = null;
    }

    let serviceCapacity = null;

    try {
      serviceCapacity =
        serviceCapacitySystem
          .getHourlyCapacity(
            restaurantId
          );
    } catch {
      serviceCapacity = null;
    }

    return {
      initialized:
        true,
      summary,
      analysis,
      construction:
        status
          .construction,
      currentConstruction,
      progress:
        status.progress,
      templates:
        recommendations
          .items,
      selectedTemplate,
      categories,
      facilityCategory:
        moreUi
          .facilityCategory,
      facilities,
      selectedFacility,
      serviceCapacity,
      canEdit:
        !currentConstruction,
      layoutEmpty:
        (
          layout?.placements ??
          []
        ).length ===
        0
    };
  }

  function selectRenovationTemplate(
    restaurantId,
    templateId
  ) {
    const template =
      renovationPlanningSystem
        .getTemplate(
          templateId
        );

    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    if (
      !launchProgressionSystem
        .isRenovationTemplateAllowed(
          restaurant.level,
          template.id
        )
    ) {
      throw new Error(
        "装修方案当前阶段未开放"
      );
    }

    moreUi
      .selectedTemplateId =
      template.id;

    lastMessage =
      `已选择装修方案：${template.name}`;
  }

  function startRenovationTemplate(
    restaurantId
  ) {
    if (
      renovationConstructionSystem
        .getCurrent(
          restaurantId
        )
    ) {
      throw new Error(
        "当前已有装修施工任务"
      );
    }

    const model =
      getRenovationModel(
        restaurantId
      );

    const template =
      model.selectedTemplate;

    if (!template) {
      throw new Error(
        "请选择装修方案"
      );
    }

    if (
      !template.executable
    ) {
      throw new Error(
        `装修方案当前不可执行：${template.reasons.join(
          ","
        )}`
      );
    }

    if (
      renovationEditorSystem
        .hasSession(
          restaurantId
        )
    ) {
      renovationEditorSystem
        .discard(
          restaurantId
        );
    }

    try {
      renovationEditorSystem
        .open(
          restaurantId
        );

      renovationEditorSystem
        .applyTemplate(
          restaurantId,
          template.id
        );

      const started =
        renovationConstructionSystem
          .startFromEditor(
            restaurantId
          );

      lastMessage =
        `装修已开工：${template.name}，预计 ${started.construction.durationDays} 天`;

      return started;
    } catch (error) {
      if (
        renovationEditorSystem
          .hasSession(
            restaurantId
          )
      ) {
        renovationEditorSystem
          .discard(
            restaurantId
          );
      }

      throw error;
    }
  }

  function setFacilityCategory(
    restaurantId,
    category
  ) {
    const model =
      getRenovationModel(
        restaurantId
      );

    const valid =
      new Set([
        "all",
        ...model.categories
      ]);

    if (
      !valid.has(
        category
      )
    ) {
      throw new Error(
        "未知设施分类"
      );
    }

    moreUi
      .facilityCategory =
      category;

    moreUi
      .selectedFurnitureId =
      null;

    getRenovationModel(
      restaurantId
    );

    lastMessage =
      category ===
        "all"
        ? "全部设施"
        : "已切换设施分类";
  }

  function selectFacility(
    restaurantId,
    furnitureId
  ) {
    const definition =
      renovationSystem
        .getFurnitureDefinition(
          furnitureId
        );

    moreUi
      .selectedFurnitureId =
      definition.id;

    lastMessage =
      `已选择设施：${definition.name}`;
  }

  function installSelectedFacility(
    restaurantId
  ) {
    if (
      renovationConstructionSystem
        .getCurrent(
          restaurantId
        )
    ) {
      throw new Error(
        "施工期间不能追加设施"
      );
    }

    const model =
      getRenovationModel(
        restaurantId
      );

    if (
      model.layoutEmpty
    ) {
      throw new Error(
        "请先完成首套装修方案"
      );
    }

    const selected =
      model.selectedFacility;

    if (!selected) {
      throw new Error(
        "请选择设施"
      );
    }

    if (!selected.unlocked) {
      throw new Error(
        `设施将在门店 Lv.${selected.unlockLevel} 解锁`
      );
    }

    if (
      renovationEditorSystem
        .hasSession(
          restaurantId
        )
    ) {
      renovationEditorSystem
        .discard(
          restaurantId
        );
    }

    renovationEditorSystem
      .open(
        restaurantId
      );

    const draft =
      renovationEditorSystem
        .getDraftLayout(
          restaurantId
        );

    const candidates =
      renovationPlanningSystem
        .getCandidateCoordinates(
          draft,
          selected.id
        );

    let placed = false;

    for (
      const candidate
      of candidates
    ) {
      try {
        renovationEditorSystem
          .addItem(
            restaurantId,
            selected.id,
            candidate
          );

        placed = true;
        break;
      } catch {
        placed = false;
      }
    }

    if (!placed) {
      renovationEditorSystem
        .discard(
          restaurantId
        );

      throw new Error(
        "当前店面没有满足限制的可安装位置"
      );
    }

    try {
      const page =
        renovationEditorSystem
          .getPageState(
            restaurantId
          );

      if (
        !page.budget
          .affordable
      ) {
        throw new Error(
          "装修资金不足"
        );
      }

      const started =
        renovationConstructionSystem
          .startFromEditor(
            restaurantId
          );

      lastMessage =
        `设施升级已开工：${selected.name}，预计 ${started.construction.durationDays} 天`;

      return started;
    } catch (error) {
      if (
        renovationEditorSystem
          .hasSession(
            restaurantId
          )
      ) {
        renovationEditorSystem
          .discard(
            restaurantId
          );
      }

      throw error;
    }
  }

  function inspectRenovation(
    restaurantId
  ) {
    const completed =
      renovationConstructionSystem
        .inspect(
          restaurantId
        );

    const analysis =
      layoutFlowSystem
        .getAnalysis(
          restaurantId
        );

    lastMessage =
      `装修验收完成：布局评分 ${analysis.flowScore ?? analysis.score ?? "-"}`;

    return completed;
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

    const transactions = financeSystem
      .getTransactions(restaurant.id)
      .filter(item => item.day === time.day);
    const transactionTotal = type => transactions
      .filter(item => item.transactionType === type)
      .reduce((sum, item) => sum + item.amount, 0);
    const income = transactionTotal("income");
    const expense = transactionTotal("expense");
    const refunds = transactionTotal("reversal");
    const expenseCategories = new Map();
    for (const item of transactions) {
      if (item.transactionType === "expense") {
        expenseCategories.set(item.category,
          (expenseCategories.get(item.category) ?? 0) + item.amount);
      }
    }

    const progress =
      storeProgressSystem
        .getProgress(
          restaurant.id
        );

    const launch =
      launchProgressionSystem
        .getStageModel(
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

    const business =
      getBusinessModel(
        restaurant.id,
        time
      );

    const dishes =
      getDishModel(
        restaurant.id
      );

    const staff =
      getEmployeeModel(
        restaurant.id
      );

    const renovation =
      getRenovationModel(
        restaurant.id
      );

    return {
      restaurant,
      finance,
      progress,
      launch,
      inventory,
      menu,
      latestSettlement,
      procurement,
      property,
      district,
      research,
      schedule,
      business,
      dishes,
      staff,
      more: {
        tab:
          moreUi.tab
      },
      renovation,

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
          orders.reduce((sum, order) => sum + (order.orderCount ?? 1), 0),

        revenue:
          todayRevenue,
        income,
        expense,
        refunds,
        cashNet: income + refunds - expense,
        expenseBreakdown: [...expenseCategories]
          .map(([category, amount]) => ({category, amount}))
          .sort((a, b) => b.amount - a.amount)
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

        case "business-tab":
          setBusinessTab(
            String(value)
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "marketing-category":
          setMarketingCategory(
            getRestaurant().id,
            String(value)
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "marketing-select":
          selectMarketAction(
            getRestaurant().id,
            String(value)
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "marketing-start":
          startSelectedMarketAction(
            getRestaurant().id
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "procurement-ingredient":
          selectProcurementIngredient(
            getRestaurant().id,
            String(value)
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "procurement-supplier":
          selectProcurementSupplier(
            getRestaurant().id,
            String(value)
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "procurement-quantity":
          adjustProcurementQuantity(
            getRestaurant().id,
            String(value)
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "procurement-payment":
          setProcurementPayment(
            getRestaurant().id,
            String(value)
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "procurement-quote":
          refreshProcurementQuote(
            getRestaurant().id
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "procurement-purchase":
          purchaseDraft(
            getRestaurant().id
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "procurement-cancel":
          cancelProcurementOrder(
            getRestaurant().id,
            String(value)
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "inventory-select":
          selectInventoryIngredient(
            getRestaurant().id,
            String(value)
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "inventory-discard-batch":
          discardInventoryBatch(
            getRestaurant().id,
            String(value)
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "inventory-discard-spoiled":
          discardAllSpoiled(
            getRestaurant().id
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "dish-tab":
          setDishTab(
            getRestaurant().id,
            String(value)
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "dish-select":
          selectDish(
            getRestaurant().id,
            String(value)
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "dish-price":
          adjustDishPrice(
            getRestaurant().id,
            String(value)
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "dish-toggle-active":
          toggleDishActive(
            getRestaurant().id
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "dish-add-menu":
          addSelectedDishToMenu(
            getRestaurant().id
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "dish-research-method":
          setResearchMethod(
            String(value)
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "dish-research-ingredient":
          toggleResearchIngredient(
            String(value)
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "dish-research":
          researchSelectedDish(
            getRestaurant().id
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "staff-tab":
          setStaffTab(
            String(value)
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "staff-select":
          selectEmployee(
            getRestaurant().id,
            String(value)
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "staff-candidate-select":
          selectCandidate(
            getRestaurant().id,
            String(value)
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "staff-refresh-candidates":
          refreshCandidates(
            getRestaurant().id
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "staff-hire-candidate":
          hireSelectedCandidate(
            getRestaurant().id
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "staff-train":
          trainSelectedEmployee(
            getRestaurant().id,
            String(value)
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "staff-promote":
          promoteSelectedEmployee(
            getRestaurant().id
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "staff-salary":
          adjustEmployeeSalary(
            getRestaurant().id,
            String(value)
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "staff-shift-toggle":
          toggleEmployeeShift(
            getRestaurant().id,
            Number(value)
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "staff-schedule-all":
          scheduleEmployeeAllWeek(
            getRestaurant().id
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "staff-schedule-clear":
          clearEmployeeSchedule(
            getRestaurant().id
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "staff-fire":
          fireSelectedEmployee(
            getRestaurant().id
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "more-tab":
          setMoreTab(
            getRestaurant().id,
            String(value)
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "renovation-template-select":
          selectRenovationTemplate(
            getRestaurant().id,
            String(value)
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "renovation-start-template":
          startRenovationTemplate(
            getRestaurant().id
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "renovation-facility-category":
          setFacilityCategory(
            getRestaurant().id,
            String(value)
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "renovation-facility-select":
          selectFacility(
            getRestaurant().id,
            String(value)
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "renovation-install-facility":
          installSelectedFacility(
            getRestaurant().id
          );

          return {
            ok: true,
            viewModel:
              getViewModel()
          };

        case "renovation-inspect":
          inspectRenovation(
            getRestaurant().id
          );

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
    getProcurementTarget,
    getProcurementCatalog,
    getDishModel,
    getEmployeeModel,
    getMarketingModel,
    getRenovationModel
  });
}

export {
  createMobileGameController
};
