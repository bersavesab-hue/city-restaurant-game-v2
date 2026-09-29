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

  const businessUi = {
    tab: "procurement",
    ingredientId: null,
    supplierId: null,
    quantity: null,
    paymentMode: "cash",
    quote: null,
    inventoryIngredientId: null
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

    if (
      !businessUi
        .inventoryIngredientId ||
      !catalog.some(
        ingredient =>
          ingredient.id ===
          businessUi
            .inventoryIngredientId
      )
    ) {
      businessUi
        .inventoryIngredientId =
        selectedIngredient?.id ??
        catalog[0]?.id ??
        null;
    }

    const inventoryIngredient =
      catalog.find(
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
        )
    };
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
        "procurement",
        "inventory",
        "orders"
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
        "procurement"
        ? "采购中心"
        : tab ===
            "inventory"
          ? "库存中心"
          : "采购单中心";
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

    const business =
      getBusinessModel(
        restaurant.id,
        time
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
      business,

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

        case "business-tab":
          setBusinessTab(
            String(value)
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
    getProcurementCatalog
  });
}

export {
  createMobileGameController
};
