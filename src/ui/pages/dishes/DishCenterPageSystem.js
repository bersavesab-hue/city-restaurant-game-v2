import {
  gameState
} from "../../../core/GameState.js";

import {
  restaurantSystem
} from "../../../systems/RestaurantSystem.js";

import {
  financeSystem
} from "../../../systems/FinanceSystem.js";

import {
  dishCatalogSystem
} from "../../../systems/DishCatalogSystem.js";

import {
  recipeSystem
} from "../../../systems/RecipeSystem.js";

import {
  ingredientCatalogSystem
} from "../../../systems/IngredientCatalogSystem.js";

import {
  menuSystem
} from "../../../systems/MenuSystem.js";

import {
  dishResearchSystem
} from "../../../systems/DishResearchSystem.js";

import {
  dishResearchPreviewSystem
} from "../../../systems/DishResearchPreviewSystem.js";

import {
  storeProgressSystem
} from "../../../systems/StoreProgressSystem.js";

import {
  economicBaselineSystem
} from "../../../systems/EconomicBaselineSystem.js";

import {
  restaurantDishSystem
} from "../../../systems/RestaurantDishSystem.js";

import {
  DISH_CATEGORY_LABELS
} from "../../../data/dishCatalogRules.js";

import {
  buildGlobalTopBarModel,
  buildNoticeTickerModel
} from "../../components/GlobalChromeModel.js";


const CATEGORY_LABELS =
  DISH_CATEGORY_LABELS;


const METHOD_OPTIONS =
  Object.freeze([
    {
      id:
        "stir_fry",

      name:
        "炒制",

      icon:
        "炒",

      description:
        "爆炒快出餐"
    },

    {
      id:
        "steam",

      name:
        "蒸制",

      icon:
        "蒸",

      description:
        "稳定保留食材品质"
    },

    {
      id:
        "boil",

      name:
        "煮制",

      icon:
        "煮",

      description:
        "适合汤面与主食"
    },

    {
      id:
        "stew",

      name:
        "炖煮",

      icon:
        "炖",

      description:
        "耗时较长，品质潜力高"
    },

    {
      id:
        "fry",

      name:
        "炸制",

      icon:
        "炸",

      description:
        "高效率高香气"
    },

    {
      id:
        "cold_mix",

      name:
        "凉拌",

      icon:
        "拌",

      description:
        "快速制作"
    },

    {
      id:
        "bake",

      name:
        "烤制",

      icon:
        "烤",

      description:
        "风味突出"
    }
  ]);


function safeBalance(
  restaurantId
) {
  try {
    return financeSystem
      .getBalance(
        restaurantId
      );
  } catch {
    return 0;
  }
}


function categoryLabel(
  id
) {
  return (
    CATEGORY_LABELS[id] ??
    id ??
    "其他"
  );
}


function getDishImage(
  dish
) {
  return (
    dish.image ??
    dish.coverImage ??
    `assets/images/ui/dishes/${dish.id}.webp`
  );
}


class DishCenterPageSystem {
  getDishView(
    dish,
    menuItem = null,
    storeLevel = null,
    progress = null
  ) {
    const recipes =
      recipeSystem
        .getByDish(
          dish.id
        );

    const recipe =
      recipes[0] ??
      null;

    const ingredientCost =
      dish
        .estimatedIngredientCost ??
      null;

    const menuPrice =
      menuItem?.price ??
      dish.basePrice ??
      0;

    const grossMargin =
      Number.isFinite(
        ingredientCost
      ) &&
      menuPrice > 0
        ? Math.round(
            (
              1 -
              ingredientCost /
              menuPrice
            ) *
            100
          )
        : null;

    const unlockLevel =
      dish.unlockLevel ?? 1;

    return {
      id:
        dish.id,

      name:
        dish.name,

      category:
        dish.category,

      categoryLabel:
        categoryLabel(
          dish.category
        ),

      basePrice:
        dish.basePrice ?? 0,

      custom:
        Boolean(
          dish.custom
        ),

      owned:
        Boolean(
          progress
        ),

      qualityScore:
        progress
          ?.qualityScore ??
        null,

      dishRankId:
        progress
          ?.dishRankId ??
        null,

      dishRankName:
        progress
          ?.dishRankName ??
        null,

      dishRankOrder:
        progress
          ?.dishRankOrder ??
        null,

      unlockLevel,

      unlocked:
        dish.custom ||
        storeLevel === null ||
        storeLevel >=
          unlockLevel,

      masteryLevel:
        progress
          ?.masteryLevel ??
        0,

      masteryXp:
        progress
          ?.masteryXp ??
        0,

      lifetimeSold:
        progress
          ?.lifetimeSold ??
        menuItem?.soldCount ??
        0,

      lifetimeRevenue:
        progress
          ?.lifetimeRevenue ??
        menuItem?.totalRevenue ??
        0,

      researchCost:
        dish.researchCost ??
        null,

      ingredientCost,

      grossMargin,

      method:
        dish.method ??
        recipe?.method ??
        null,

      difficulty:
        recipe?.difficulty ??
        dish.baseDifficulty ??
        null,

      cookingMinutes:
        recipe
          ?.cookingMinutes ??
        null,

      ingredientCount:
        recipe
          ?.ingredients
          ?.length ??
        0,

      recipeId:
        recipe?.id ??
        dish.recipeId ??
        null,

      hasRecipe:
        Boolean(
          recipe
        ),

      image:
        getDishImage(
          dish
        ),

      onMenu:
        Boolean(
          menuItem
        ),

      menuItemId:
        menuItem?.id ??
        null,

      active:
        menuItem?.active ??
        false,

      menuPrice,

      soldCount:
        menuItem?.soldCount ??
        0,

      totalRevenue:
        menuItem
          ?.totalRevenue ??
        0
    };
  }


  getIngredients() {
    return ingredientCatalogSystem
      .getAll()
      .map(
        ingredient => {
          const quantityRule =
            dishResearchPreviewSystem
              .getQuantityRule(
                ingredient.unit
              );

          return {
            id:
              ingredient.id,

            name:
              ingredient.name,

            category:
              ingredient.category,

            unit:
              ingredient.unit,

            purchasePrice:
              economicBaselineSystem
                .getIngredientReference(
                  ingredient.id
                )
                ?.normalizedUnitPrice ??
              ingredient.basePurchasePrice,

            shelfLifeDays:
              ingredient.shelfLifeDays,

            quantityRule
          };
        }
      );
  }


  getPage(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const menu =
      menuSystem
        .listByRestaurant(
          restaurantId
        );

    const menuMap =
      new Map(
        menu.map(
          item => [
            item.dishId,
            item
          ]
        )
      );

    const allDishes =
      dishCatalogSystem
        .getAll();

    const progressMap =
      new Map(
        restaurantDishSystem
          .listByRestaurant(
            restaurantId
          )
          .map(
            progress => [
              progress.dishId,
              progress
            ]
          )
      );

    const customDishes =
      dishCatalogSystem
        .getCustomByRestaurant(
          restaurantId
        );

    const menuViews =
      menu.map(
        item => {
          const dish =
            dishCatalogSystem.get(
              item.dishId
            );

          return this.getDishView(
            dish,
            item,
            restaurant.level,
            progressMap.get(
              dish.id
            ) ??
            null
          );
        }
      );

    const catalog =
      allDishes
        .filter(
          dish =>
            !dish.custom ||
            dish
              .ownerRestaurantId ===
              restaurantId
        )
        .map(
          dish =>
            this.getDishView(
              dish,
              menuMap.get(
                dish.id
              ) ??
              null,
              restaurant.level,
              progressMap.get(
                dish.id
              ) ??
              null
            )
        );

    const availableCatalog =
      catalog.filter(
        dish =>
          !dish.onMenu &&
          dish.hasRecipe &&
          dish.unlocked
      );

    const activeMenu =
      menuViews.filter(
        item =>
          item.active
      );

    const categories = [
      {
        id:
          "all",

        label:
          "全部",

        count:
          catalog.length
      },

      ...Object.entries(
        CATEGORY_LABELS
      )
        .map(
          (
            [
              id,
              label
            ]
          ) => ({
            id,

            label,

            count:
              catalog.filter(
                dish =>
                  dish.category ===
                  id
              ).length
          })
        )
        .filter(
          item =>
            item.count > 0
        )
    ];

    const time =
      gameState.getSection(
        "time"
      );

    const runtime =
      gameState.getSection(
        "runtime"
      );

    const balance =
      safeBalance(
        restaurantId
      );

    const limits =
      storeProgressSystem
        .getLimits(
          restaurantId
        );

    const notices = [];

    if (
      activeMenu.length ===
      0
    ) {
      notices.push({
        id:
          "no_active_menu",

        type:
          "warning",

        title:
          "菜单提醒",

        message:
          "当前没有营业中的菜品，门店无法正常接单",

        priority:
          100
      });
    }

    if (
      customDishes.length ===
      0
    ) {
      notices.push({
        id:
          "research_tip",

        type:
          "info",

        title:
          "研发提示",

        message:
          "可以自由搭配食材研发第一道自创菜",

        priority:
          70
      });
    }

    return {
      pageId:
        "dishes",

      topBar:
        buildGlobalTopBarModel({
          restaurantName:
            restaurant.name,

          balance,

          storeLevel:
            restaurant.level,

          reputation:
            restaurant.reputation,

          time,

          runtime,

          currentStoreId:
            restaurantId
        }),

      noticeTicker:
        buildNoticeTickerModel(
          notices
        ),

      metrics: [
        {
          label:
            "菜单菜品",

          value:
            `${menuViews.length}/${limits.menuItems}`,

          caption:
            "当前/上限"
        },

        {
          label:
            "营业菜品",

          value:
            `${activeMenu.length}道`,

          caption:
            activeMenu.length > 0
              ? "可正常接单"
              : "需要至少1道"
        },

        {
          label:
            "自创菜",

          value:
            `${customDishes.length}道`,

          caption:
            "研发上限60道"
        },

        {
          label:
            "累计菜品营收",

          value:
            `¥${Math.round(
              menuViews.reduce(
                (
                  sum,
                  item
                ) =>
                  sum +
                  (
                    item
                      .totalRevenue ??
                    0
                  ),
                0
              )
            ).toLocaleString(
              "zh-CN"
            )}`,

          caption:
            "历史累计"
        }
      ],

      menu:
        menuViews,

      activeMenuCount:
        activeMenu.length,

      catalog,

      availableCatalog,

      customDishes:
        customDishes.map(
          dish =>
            this.getDishView(
              dish,
              menuMap.get(
                dish.id
              ) ??
              null,
              restaurant.level,
              progressMap.get(
                dish.id
              ) ??
              null
            )
        ),

      categories,

      ingredients:
        this.getIngredients(),

      research: {
        methods:
          METHOD_OPTIONS,

        categories:
          Object.entries(
            CATEGORY_LABELS
          ).map(
            (
              [
                id,
                label
              ]
            ) => ({
              id,
              label
            })
          ),

        minIngredients:
          2,

        maxIngredients:
          6,

        balance,

        customCount:
          customDishes.length,

        limit:
          60
      },

      bottomNavigation: [
        {
          label:
            "城市",

          target:
            "city",

          icon:
            "city"
        },

        {
          label:
            "门店",

          target:
            "restaurant",

          icon:
            "store"
        },

        {
          label:
            "装修",

          target:
            "renovation",

          icon:
            "renovation"
        },

        {
          label:
            "人员",

          target:
            "employees",

          icon:
            "employees"
        },

        {
          label:
            "市场",

          target:
            "channels",

          icon:
            "analytics"
        },

        {
          label:
            "研发",

          target:
            "dishes",

          icon:
            "dishes",

          active:
            true
        },

        {
          label:
            "更多",

          target:
            "more",

          icon:
            "more"
        }
      ]
    };
  }


  addToMenu(
    restaurantId,
    dishId,
    price = null
  ) {
    const dish =
      dishCatalogSystem.get(
        dishId
      );

    if (!dish) {
      throw new Error(
        "Dish does not exist"
      );
    }

    const recipe =
      recipeSystem
        .getByDish(
          dishId
        )[0];

    if (!recipe) {
      throw new Error(
        "该菜品还没有有效配方"
      );
    }

    return menuSystem.addItem({
      restaurantId,
      dishId,
      recipeId:
        recipe.id,

      price:
        price ??
        dish.basePrice
    });
  }


  setPrice(
    menuItemId,
    price
  ) {
    return menuSystem.setPrice(
      menuItemId,
      price
    );
  }


  toggleMenuItem(
    menuItemId
  ) {
    const item =
      menuSystem.get(
        menuItemId
      );

    return menuSystem.setActive(
      menuItemId,
      !item.active
    );
  }


  previewResearch({
    restaurantId,
    method,
    ingredients
  }) {
    return dishResearchPreviewSystem
      .preview({
        ingredients,
        method,
        balance:
          safeBalance(
            restaurantId
          )
      });
  }


  researchRandom(
    restaurantId
  ) {
    return dishResearchSystem
      .researchRandom({
        restaurantId
      });
  }


  researchCustom({
    restaurantId,
    name,
    category,
    method,
    ingredients
  }) {
    return dishResearchSystem
      .research({
        restaurantId,
        name,
        category,
        method,
        ingredients
      });
  }
}


export const dishCenterPageSystem =
  new DishCenterPageSystem();

export {
  DishCenterPageSystem,
  CATEGORY_LABELS,
  METHOD_OPTIONS
};
