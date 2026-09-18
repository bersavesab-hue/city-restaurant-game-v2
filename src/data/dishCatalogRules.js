import {
  getRecipeId
} from "./recipeRules.js";

export const DISH_SCHEMA_VERSION = 1;

export const DISH_ID_PATTERN =
  /^[a-z][a-z0-9_]*$/;

export const DISH_CATEGORY =
  Object.freeze({
    RICE: "rice",
    NOODLE: "noodle",
    DUMPLING_BUN: "dumpling_bun",
    STIR_FRY: "stir_fry",
    COLD_DISH: "cold_dish",
    SOUP: "soup",
    HOTPOT: "hotpot",
    BARBECUE: "barbecue",
    BREAKFAST: "breakfast",
    SNACK: "snack",
    FAST_FOOD: "fast_food",
    SET_MEAL: "set_meal",
    DESSERT: "dessert",
    BEVERAGE: "beverage",
    BAKERY: "bakery",
    SPECIALTY: "specialty"
  });

export const DISH_CATEGORY_LABELS =
  Object.freeze({
    rice: "米饭主食",
    noodle: "粉面",
    dumpling_bun: "面点",
    stir_fry: "热炒",
    cold_dish: "凉菜",
    soup: "汤羹",
    hotpot: "锅物",
    barbecue: "烧烤",
    breakfast: "早餐",
    snack: "小吃",
    fast_food: "快捷餐食",
    set_meal: "套餐",
    dessert: "甜品",
    beverage: "饮品",
    bakery: "烘焙",
    specialty: "特色菜"
  });

export const DISH_CATEGORY_LIST =
  Object.freeze(
    Object.values(
      DISH_CATEGORY
    ).map(
      id =>
        Object.freeze({
          id,
          name:
            DISH_CATEGORY_LABELS[id]
        })
    )
  );

export const DISH_UNLOCK_LEVEL_RANGE =
  Object.freeze({
    min: 1,
    max: 10
  });

export const DISH_DIFFICULTY_RANGE =
  Object.freeze({
    min: 1,
    max: 100
  });

export function getDefaultRecipeId(
  dishId
) {
  return getRecipeId(
    dishId,
    "standard"
  );
}
