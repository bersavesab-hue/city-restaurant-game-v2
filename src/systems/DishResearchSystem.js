import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";
import { eventBus } from "../core/EventBus.js";
import { randomSystem } from "../core/RandomSystem.js";

import {
  financeSystem,
  FINANCE_CATEGORY
} from "./FinanceSystem.js";

import { restaurantSystem } from "./RestaurantSystem.js";
import { ingredientCatalogSystem } from "./IngredientCatalogSystem.js";
import { economicBaselineSystem } from "./EconomicBaselineSystem.js";

import {
  getDishRank
} from "../data/dishRules.js";

function clamp(
  value,
  min,
  max
) {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
}

const CATEGORIES =
  Object.freeze([
    "rice",
    "noodle",
    "fast_food",
    "stir_fry",
    "hotpot",
    "dessert"
  ]);

const METHODS =
  Object.freeze({
    stir_fry: {
      id: "stir_fry",
      name: "炒制",
      baseMinutes: 12,
      difficultyBonus: 15,
      techniqueScore: 76,
      defaultCategory:
        "stir_fry"
    },

    steam: {
      id: "steam",
      name: "蒸制",
      baseMinutes: 18,
      difficultyBonus: 10,
      techniqueScore: 80,
      defaultCategory:
        "rice"
    },

    boil: {
      id: "boil",
      name: "煮制",
      baseMinutes: 15,
      difficultyBonus: 8,
      techniqueScore: 72,
      defaultCategory:
        "noodle"
    },

    stew: {
      id: "stew",
      name: "炖煮",
      baseMinutes: 35,
      difficultyBonus: 20,
      techniqueScore: 82,
      defaultCategory:
        "hotpot"
    },

    fry: {
      id: "fry",
      name: "炸制",
      baseMinutes: 12,
      difficultyBonus: 18,
      techniqueScore: 74,
      defaultCategory:
        "fast_food"
    },

    cold_mix: {
      id: "cold_mix",
      name: "凉拌",
      baseMinutes: 8,
      difficultyBonus: 5,
      techniqueScore: 70,
      defaultCategory:
        "stir_fry"
    },

    bake: {
      id: "bake",
      name: "烤制",
      baseMinutes: 25,
      difficultyBonus: 20,
      techniqueScore: 79,
      defaultCategory:
        "fast_food"
    }
  });

class DishResearchSystem {
  validateIngredients(
    ingredients
  ) {
    if (
      !Array.isArray(
        ingredients
      ) ||
      ingredients.length < 2 ||
      ingredients.length > 6
    ) {
      throw new Error(
        "Research requires 2-6 ingredients"
      );
    }

    const used =
      new Set();

    for (
      const item
      of ingredients
    ) {
      if (
        !item ||
        typeof item.ingredientId !==
          "string" ||
        !ingredientCatalogSystem
          .exists(
            item.ingredientId
          )
      ) {
        throw new Error(
          "Research contains unknown ingredient"
        );
      }

      if (
        used.has(
          item.ingredientId
        )
      ) {
        throw new Error(
          "Research ingredients cannot repeat"
        );
      }

      if (
        !Number.isFinite(
          item.quantity
        ) ||
        item.quantity <= 0
      ) {
        throw new Error(
          "Invalid research ingredient quantity"
        );
      }

      used.add(
        item.ingredientId
      );
    }
  }

  analyze({
    ingredients,
    method
  }) {
    this.validateIngredients(
      ingredients
    );

    const methodRule =
      METHODS[method];

    if (!methodRule) {
      throw new Error(
        `Unknown cooking method "${method}"`
      );
    }

    let estimatedCost = 0;

    const categories =
      new Set();

    for (
      const item
      of ingredients
    ) {
      const ingredient =
        ingredientCatalogSystem.get(
          item.ingredientId
        );

      const economicReference =
        economicBaselineSystem
          .getIngredientReference(
            ingredient.id
          );

      const unitPrice =
        economicReference
          ?.normalizedUnitPrice ??
        ingredient.basePurchasePrice;

      estimatedCost +=
        unitPrice *
        item.quantity;

      categories.add(
        ingredient.category
      );
    }

    const ingredientScore =
      clamp(
        45 +
        ingredients.length *
          5 +
        categories.size *
          10,
        45,
        95
      );

    const diversityScore =
      clamp(
        40 +
        categories.size *
        15,
        40,
        100
      );

    const inspirationScore =
      randomSystem.int(
        35,
        100
      );

    const qualityScore =
      Math.round(
        ingredientScore *
          0.45 +
        diversityScore *
          0.2 +
        methodRule
          .techniqueScore *
          0.2 +
        inspirationScore *
          0.15
      );

    const difficulty =
      Math.round(
        clamp(
          15 +
          ingredients.length *
            7 +
          categories.size *
            4 +
          methodRule
            .difficultyBonus,
          1,
          100
        )
      );

    const cookingMinutes =
      Math.max(
        5,
        Math.round(
          methodRule
            .baseMinutes +
          ingredients.length *
            2
        )
      );

    const researchCost =
      Math.max(
        500,
        Math.round(
          700 +
          ingredients.length *
            250 +
          difficulty *
            12
        )
      );

    const markup =
      2.1 +
      qualityScore *
        0.009;

    const suggestedPrice =
      Math.max(
        1,
        Math.round(
          estimatedCost *
          markup
        )
      );

    return {
      qualityScore,

      ingredientScore:
        Math.round(
          ingredientScore
        ),

      diversityScore:
        Math.round(
          diversityScore
        ),

      inspirationScore,

      difficulty,

      cookingMinutes,

      estimatedCost:
        Math.round(
          estimatedCost
        ),

      researchCost,

      suggestedPrice
    };
  }

  research({
    restaurantId,
    name,
    category,
    method,
    ingredients
  }) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      throw new Error(
        "Dish name is required"
      );
    }

    if (
      !CATEGORIES.includes(
        category
      )
    ) {
      throw new Error(
        "Invalid dish category"
      );
    }

    if (!METHODS[method]) {
      throw new Error(
        "Invalid cooking method"
      );
    }

    const existing =
      entitySystem.filter(
        "custom_dish",
        item =>
          item.ownerRestaurantId ===
          restaurantId
      );

    if (
      existing.length >= 60
    ) {
      throw new Error(
        "Custom dish limit reached"
      );
    }

    const analysis =
      this.analyze({
        ingredients,
        method
      });

    financeSystem.getAccount(
      restaurantId
    );

    if (
      financeSystem.getBalance(
        restaurantId
      ) <
      analysis.researchCost
    ) {
      throw new Error(
        "Insufficient funds for dish research"
      );
    }

    financeSystem.expense(
      restaurantId,
      analysis.researchCost,
      FINANCE_CATEGORY.OTHER,
      `研发菜品：${name.trim()}`
    );

    const time =
      gameState.getSection(
        "time"
      );

    const initialRank =
      getDishRank({
        masteryLevel: 1,
        qualityScore:
          analysis.qualityScore
      });

    let dish =
      entitySystem.create(
        "custom_dish",
        {
          ownerRestaurantId:
            restaurantId,

          name:
            name.trim(),

          category,

          basePrice:
            analysis
              .suggestedPrice,

          custom: true,

          qualityScore:
            analysis
              .qualityScore,

          researchCost:
            analysis
              .researchCost,

          estimatedIngredientCost:
            analysis
              .estimatedCost,

          method,

          createdDay:
            time.day,

          recipeId: null,

          masteryXp: 0,
          masteryLevel: 1,
          masteryQualityBonus: 0,

          dishRankId:
            initialRank.id,

          dishRankName:
            initialRank.name,

          dishRankOrder:
            initialRank.order,

          lifetimeSold: 0,
          lifetimeRevenue: 0,

          improvementAttempts: 0,
          successfulImprovements: 0,

          improvementHistory: []
        }
      );

    const recipe =
      entitySystem.create(
        "custom_recipe",
        {
          ownerRestaurantId:
            restaurantId,

          dishId:
            dish.id,

          ingredients:
            structuredClone(
              ingredients
            ),

          difficulty:
            analysis
              .difficulty,

          cookingMinutes:
            analysis
              .cookingMinutes,

          method,

          researchQuality:
            analysis
              .qualityScore,

          ingredientEfficiency: 1,
          improvementAttempts: 0,

          createdDay:
            time.day
        }
      );

    dish =
      entitySystem.update(
        "custom_dish",
        dish.id,
        {
          recipeId:
            recipe.id
        }
      );

    const history = [
      ...(
        restaurant
          .dishResearchHistory ??
        []
      ),
      {
        day:
          time.day,

        dishId:
          dish.id,

        name:
          dish.name,

        rankId:
          dish.dishRankId,

        rankName:
          dish.dishRankName,

        score:
          dish.qualityScore,

        cost:
          analysis
            .researchCost
      }
    ];

    if (
      history.length > 20
    ) {
      history.splice(
        0,
        history.length - 20
      );
    }

    entitySystem.update(
      "restaurant",
      restaurantId,
      {
        dishResearchHistory:
          history
      }
    );

    eventBus.emit(
      "dish:researched",
      {
        restaurantId,

        dish:
          structuredClone(
            dish
          ),

        recipe:
          structuredClone(
            recipe
          )
      }
    );

    return {
      dish,
      recipe,
      analysis
    };
  }

  getRandomQuantity(
    ingredient
  ) {
    switch (
      ingredient.unit
    ) {
      case "g":
        return (
          randomSystem.int(
            5,
            30
          ) *
          10
        );

      case "kg":
        return (
          randomSystem.int(
            1,
            5
          ) /
          10
        );

      case "ml":
        return (
          randomSystem.int(
            2,
            20
          ) *
          10
        );

      case "l":
        return (
          randomSystem.int(
            1,
            5
          ) /
          10
        );

      case "piece":
        return randomSystem.int(
          1,
          3
        );

      default:
        return randomSystem.int(
          1,
          2
        );
    }
  }

  researchRandom({
    restaurantId,
    name = null,
    category = null,
    method = null
  }) {
    const ingredients =
      ingredientCatalogSystem
        .getAll();

    if (
      ingredients.length < 2
    ) {
      throw new Error(
        "Not enough ingredients for random research"
      );
    }

    const ingredientCount =
      Math.min(
        ingredients.length,
        randomSystem.int(
          2,
          4
        )
      );

    const selected =
      randomSystem
        .shuffle(
          ingredients
        )
        .slice(
          0,
          ingredientCount
        );

    const selectedMethod =
      method ??
      randomSystem.pick(
        Object.keys(
          METHODS
        )
      );

    const methodRule =
      METHODS[
        selectedMethod
      ];

    const selectedCategory =
      category ??
      methodRule
        .defaultCategory;

    const first =
      selected[0];

    const second =
      selected[1];

    const generatedName =
      name ??
      `${methodRule.name}${first.name}${second.name}`;

    return this.research({
      restaurantId,

      name:
        generatedName,

      category:
        selectedCategory,

      method:
        selectedMethod,

      ingredients:
        selected.map(
          ingredient => ({
            ingredientId:
              ingredient.id,

            quantity:
              this.getRandomQuantity(
                ingredient
              )
          })
        )
    });
  }

  listByRestaurant(
    restaurantId
  ) {
    return entitySystem.filter(
      "custom_dish",
      item =>
        item.ownerRestaurantId ===
        restaurantId
    );
  }

  getResearchSummary(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const dishes =
      this.listByRestaurant(
        restaurantId
      );

    const byRank = {
      homestyle: 0,
      selected: 0,
      signature: 0,
      famous: 0,
      house_special: 0
    };

    for (
      const dish
      of dishes
    ) {
      const rank =
        dish.dishRankId ??
        getDishRank({
          masteryLevel:
            dish.masteryLevel ?? 1,
          qualityScore:
            dish.qualityScore ?? 0
        }).id;

      if (rank in byRank) {
        byRank[rank] += 1;
      }
    }

    const best =
      [...dishes]
        .sort(
          (a, b) =>
            b.qualityScore -
            a.qualityScore
        )[0] ??
      null;

    return {
      restaurantId,

      total:
        dishes.length,

      byRank,

      bestDish:
        best,

      recent:
        restaurant
          .dishResearchHistory ??
        []
    };
  }

  getAvailableMethods() {
    return Object.values(
      METHODS
    );
  }

  getAvailableCategories() {
    return [
      ...CATEGORIES
    ];
  }
}

export const dishResearchSystem =
  new DishResearchSystem();

export {
  DishResearchSystem,
  METHODS as DISH_RESEARCH_METHODS,
  CATEGORIES as DISH_RESEARCH_CATEGORIES
};
