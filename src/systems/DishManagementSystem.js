import { entitySystem } from "../core/EntitySystem.js";

import { financeSystem } from "./FinanceSystem.js";
import { dishCatalogSystem } from "./DishCatalogSystem.js";
import { dishResearchSystem } from "./DishResearchSystem.js";
import { dishGrowthSystem } from "./DishGrowthSystem.js";
import { dishLifecycleSystem } from "./DishLifecycleSystem.js";
import { ingredientCatalogSystem } from "./IngredientCatalogSystem.js";
import { recipeSystem } from "./RecipeSystem.js";
import { menuSystem } from "./MenuSystem.js";
import { restaurantSystem } from "./RestaurantSystem.js";

const DISH_CATEGORIES = Object.freeze([
  { id: "rice", name: "米饭主食" },
  { id: "noodle", name: "面食" },
  { id: "fast_food", name: "快餐" },
  { id: "stir_fry", name: "炒菜" },
  { id: "hotpot", name: "锅物" },
  { id: "dessert", name: "甜品" }
]);

const COOKING_METHODS = Object.freeze([
  { id: "stir_fry", name: "炒制" },
  { id: "steam", name: "蒸制" },
  { id: "boil", name: "煮制" },
  { id: "stew", name: "炖煮" },
  { id: "fry", name: "炸制" },
  { id: "cold_mix", name: "凉拌" },
  { id: "bake", name: "烤制" }
]);

function safeBalance(restaurantId) {
  try {
    return financeSystem.getBalance(
      restaurantId
    );
  } catch {
    return null;
  }
}

function requireOwnedDish(
  restaurantId,
  dishId
) {
  restaurantSystem.get(
    restaurantId
  );

  const dish =
    dishCatalogSystem.get(
      dishId
    );

  if (
    !dish ||
    dish.ownerRestaurantId !==
      restaurantId
  ) {
    throw new Error(
      "Dish does not belong to restaurant"
    );
  }

  return dish;
}

function getMenuItem(
  restaurantId,
  dishId
) {
  return menuSystem
    .listByRestaurant(
      restaurantId
    )
    .find(
      item =>
        item.dishId ===
        dishId
    ) ?? null;
}

function getIngredientInfo(
  recipe
) {
  return (
    recipe?.ingredients ?? []
  ).map(
    item => {
      const ingredient =
        ingredientCatalogSystem
          .get(
            item.ingredientId
          );

      return {
        ingredientId:
          item.ingredientId,

        name:
          ingredient?.name ??
          item.ingredientId,

        category:
          ingredient?.category ??
          null,

        unit:
          ingredient?.unit ??
          null,

        quantity:
          item.quantity,

        basePurchasePrice:
          ingredient
            ?.basePurchasePrice ??
          0
      };
    }
  );
}

class DishManagementSystem {
  getPage(
    restaurantId,
    {
      tierId = null,
      menuOnly = false
    } = {}
  ) {
    restaurantSystem.get(
      restaurantId
    );

    let dishes =
      dishLifecycleSystem
        .listRestaurantDishes(
          restaurantId
        )
        .map(
          status => {
            const dish =
              requireOwnedDish(
                restaurantId,
                status.dishId
              );

            const menuItem =
              getMenuItem(
                restaurantId,
                dish.id
              );

            return {
              ...status,

              category:
                dish.category,

              basePrice:
                dish.basePrice,

              researchCost:
                dish.researchCost ?? 0,

              estimatedIngredientCost:
                dish
                  .estimatedIngredientCost ??
                0,

              menu: menuItem
                ? {
                    listed: true,
                    id:
                      menuItem.id,
                    active:
                      menuItem.active,
                    price:
                      menuItem.price,
                    soldCount:
                      menuItem.soldCount,
                    totalRevenue:
                      menuItem.totalRevenue
                  }
                : {
                    listed: false,
                    id: null,
                    active: false,
                    price:
                      dish.basePrice,
                    soldCount: 0,
                    totalRevenue: 0
                  }
            };
          }
        );

    if (tierId !== null) {
      dishes =
        dishes.filter(
          dish =>
            dish.tier.id ===
            tierId
        );
    }

    if (menuOnly) {
      dishes =
        dishes.filter(
          dish =>
            dish.menu.listed
        );
    }

    const summary =
      dishLifecycleSystem
        .getPortfolioSummary(
          restaurantId
        );

    return {
      pageId: "dishes",
      title: "菜品中心",

      balance:
        safeBalance(
          restaurantId
        ),

      summary: {
        ...summary,

        menuCount:
          menuSystem
            .listByRestaurant(
              restaurantId
            ).length,

        activeMenuCount:
          menuSystem
            .listByRestaurant(
              restaurantId,
              {
                activeOnly: true
              }
            ).length
      },

      filters: {
        tierId,
        menuOnly
      },

      dishes
    };
  }

  getDishDetail(
    restaurantId,
    dishId
  ) {
    const dish =
      requireOwnedDish(
        restaurantId,
        dishId
      );

    const status =
      dishLifecycleSystem
        .getStatus(
          dishId
        );

    const recipe =
      dish.recipeId
        ? recipeSystem.get(
            dish.recipeId
          )
        : null;

    const menuItem =
      getMenuItem(
        restaurantId,
        dishId
      );

    const improvements =
      dishGrowthSystem
        .getAvailableImprovements()
        .map(
          item => ({
            ...item,

            unlocked:
              (
                dish.masteryLevel ??
                1
              ) >=
              item.requiredLevel
          })
        );

    return {
      pageId:
        "dish_detail",

      dish: {
        id:
          dish.id,

        name:
          dish.name,

        category:
          dish.category,

        qualityScore:
          dish.qualityScore,

        basePrice:
          dish.basePrice,

        estimatedIngredientCost:
          dish
            .estimatedIngredientCost ??
          0,

        method:
          dish.method,

        createdDay:
          dish.createdDay,

        dishRankId:
          dish.dishRankId,

        dishRankName:
          dish.dishRankName,

        dishRankOrder:
          dish.dishRankOrder,

        improvementAttempts:
          dish
            .improvementAttempts ??
          0
      },

      lifecycle:
        status,

      recipe:
        recipe
          ? {
              id:
                recipe.id,

              method:
                recipe.method,

              difficulty:
                recipe.difficulty,

              cookingMinutes:
                recipe
                  .cookingMinutes,

              ingredientEfficiency:
                recipe
                  .ingredientEfficiency ??
                1,

              ingredients:
                getIngredientInfo(
                  recipe
                )
            }
          : null,

      menu:
        menuItem
          ? {
              listed: true,
              id:
                menuItem.id,
              active:
                menuItem.active,
              price:
                menuItem.price,
              soldCount:
                menuItem.soldCount,
              totalRevenue:
                menuItem
                  .totalRevenue
            }
          : {
              listed: false,
              id: null,
              active: false,
              price:
                dish.basePrice,
              soldCount: 0,
              totalRevenue: 0
            },

      improvements
    };
  }

  getResearchLab(
    restaurantId
  ) {
    restaurantSystem.get(
      restaurantId
    );

    return {
      pageId:
        "dish_research",

      title:
        "自主研发",

      balance:
        safeBalance(
          restaurantId
        ),

      categories:
        DISH_CATEGORIES.map(
          item => ({
            ...item
          })
        ),

      methods:
        COOKING_METHODS.map(
          item => ({
            ...item
          })
        ),

      ingredients:
        ingredientCatalogSystem
          .getAll()
          .map(
            item => ({
              id:
                item.id,

              name:
                item.name,

              category:
                item.category,

              unit:
                item.unit,

              basePurchasePrice:
                item
                  .basePurchasePrice
            })
          )
    };
  }

  manualResearch({
    restaurantId,
    name,
    category,
    method,
    ingredients
  }) {
    const result =
      dishResearchSystem
        .research({
          restaurantId,
          name,
          category,
          method,
          ingredients
        });

    dishLifecycleSystem
      .ensureProfile(
        result.dish.id
      );

    return {
      ...result,

      lifecycle:
        dishLifecycleSystem
          .getStatus(
            result.dish.id
          )
    };
  }

  randomResearch({
    restaurantId,
    name = null
  }) {
    return (
      dishLifecycleSystem
        .developRandom({
          restaurantId,
          name
        })
    );
  }

  addToMenu({
    restaurantId,
    dishId,
    price = null
  }) {
    const dish =
      requireOwnedDish(
        restaurantId,
        dishId
      );

    const existing =
      getMenuItem(
        restaurantId,
        dishId
      );

    if (existing) {
      throw new Error(
        "Dish is already on the menu"
      );
    }

    if (!dish.recipeId) {
      throw new Error(
        "Dish does not have a recipe"
      );
    }

    return menuSystem.addItem({
      restaurantId,
      dishId,
      recipeId:
        dish.recipeId,
      price:
        price ??
        dish.basePrice
    });
  }

  setMenuPrice(
    restaurantId,
    dishId,
    price
  ) {
    requireOwnedDish(
      restaurantId,
      dishId
    );

    const menuItem =
      getMenuItem(
        restaurantId,
        dishId
      );

    if (!menuItem) {
      throw new Error(
        "Dish is not on the menu"
      );
    }

    return menuSystem.setPrice(
      menuItem.id,
      price
    );
  }

  setMenuActive(
    restaurantId,
    dishId,
    active
  ) {
    requireOwnedDish(
      restaurantId,
      dishId
    );

    const menuItem =
      getMenuItem(
        restaurantId,
        dishId
      );

    if (!menuItem) {
      throw new Error(
        "Dish is not on the menu"
      );
    }

    return menuSystem.setActive(
      menuItem.id,
      active
    );
  }

  improveRecipe({
    restaurantId,
    dishId,
    focus
  }) {
    requireOwnedDish(
      restaurantId,
      dishId
    );

    return (
      dishGrowthSystem
        .improveRecipe({
          restaurantId,
          dishId,
          focus
        })
    );
  }

  renameDish(
    restaurantId,
    dishId,
    name
  ) {
    const dish =
      requireOwnedDish(
        restaurantId,
        dishId
      );

    const value =
      String(
        name ?? ""
      ).trim();

    if (
      value.length < 2 ||
      value.length > 24
    ) {
      throw new Error(
        "Dish name must be 2-24 characters"
      );
    }

    return entitySystem.update(
      "custom_dish",
      dish.id,
      {
        name: value
      }
    );
  }
}

export const dishManagementSystem =
  new DishManagementSystem();

export {
  DishManagementSystem,
  DISH_CATEGORIES,
  COOKING_METHODS
};
