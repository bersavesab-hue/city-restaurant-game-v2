import {
  INGREDIENTS_V1
} from "./ingredients.v1.js";

import {
  INGREDIENT_ATLAS_COLUMNS,
  INGREDIENT_ATLAS_ROWS
} from "./ingredientAtlas.js";

export const INGREDIENT_IMAGE_DIRECTORY =
  "assets/images/ingredients";

export const INGREDIENT_SPRITE_SLOT_BY_ID =
  Object.freeze({
  "pork": 1,
  "pork_belly": 2,
  "pork_tenderloin": 3,
  "pork_ribs": 4,
  "pork_shoulder": 5,
  "pork_leg": 6,
  "pork_liver": 7,
  "pork_intestine": 8,
  "pork_trotter": 9,
  "beef": 10,
  "beef_brisket": 11,
  "beef_tenderloin": 12,
  "beef_shank": 13,
  "beef_tripe": 14,
  "lamb": 15,
  "lamb_leg": 16,
  "lamb_rack": 17,
  "mutton_roll": 18,
  "chicken": 19,
  "chicken_breast": 20,
  "chicken_thigh": 21,
  "chicken_wing": 22,
  "chicken_feet": 23,
  "duck": 24,
  "duck_breast": 25,
  "duck_leg": 26,
  "goose": 27,
  "pigeon": 28,
  "grass_carp": 29,
  "common_carp": 30,
  "crucian_carp": 31,
  "sea_bass": 32,
  "mandarin_fish": 33,
  "snakehead": 34,
  "tilapia": 221,
  "yellow_croaker": 35,
  "hairtail": 36,
  "pomfret": 222,
  "salmon": 37,
  "tuna": 223,
  "shrimp": 38,
  "river_shrimp": 224,
  "prawn": 39,
  "crayfish": 40,
  "crab": 42,
  "mitten_crab": 225,
  "scallop": 45,
  "oyster": 46,
  "clam": 43,
  "razor_clam": 44,
  "mussel": 226,
  "squid": 49,
  "cuttlefish": 50,
  "octopus": 227,
  "sea_cucumber": 48,
  "abalone": 47,
  "napa_cabbage": 51,
  "cabbage": 52,
  "bok_choy": 55,
  "spinach": 54,
  "lettuce": 53,
  "romaine": 228,
  "water_spinach": 56,
  "chive": 57,
  "celery": 58,
  "cilantro": 59,
  "broccoli": 60,
  "cauliflower": 61,
  "tomato": 62,
  "cucumber": 69,
  "eggplant": 70,
  "zucchini": 84,
  "winter_melon": 73,
  "pumpkin": 71,
  "bitter_melon": 72,
  "luffa": 74,
  "green_pepper": 67,
  "red_pepper": 68,
  "chili_pepper": 229,
  "potato": 63,
  "sweet_potato": 230,
  "taro": 78,
  "lotus_root": 76,
  "white_radish": 66,
  "carrot": 65,
  "yam": 77,
  "bamboo_shoot": 231,
  "bean_sprout": 86,
  "mung_bean_sprout": 87,
  "green_bean": 80,
  "shiitake": 89,
  "oyster_mushroom": 92,
  "enoki_mushroom": 88,
  "king_oyster_mushroom": 90,
  "apple": 95,
  "pear": 96,
  "banana": 97,
  "orange": 98,
  "mandarin": 99,
  "lemon": 100,
  "lime": 101,
  "pineapple": 102,
  "watermelon": 103,
  "grape": 104,
  "strawberry": 105,
  "mango": 106,
  "peach": 107,
  "kiwi": 108,
  "rice": 109,
  "glutinous_rice": 110,
  "brown_rice": 111,
  "millet": 112,
  "cornmeal": 113,
  "wheat_flour": 114,
  "high_gluten_flour": 115,
  "low_gluten_flour": 116,
  "whole_wheat_flour": 117,
  "dried_noodle": 118,
  "rice_noodle": 119,
  "oats": 120,
  "soybean": 121,
  "tofu": 122,
  "firm_tofu": 123,
  "silken_tofu": 124,
  "dried_tofu": 125,
  "tofu_skin": 126,
  "mung_bean": 127,
  "red_bean": 128,
  "black_bean": 129,
  "broad_bean": 130,
  "egg": 131,
  "duck_egg": 132,
  "quail_egg": 133,
  "century_egg": 134,
  "milk": 136,
  "cream": 140,
  "butter": 139,
  "cheese": 138,
  "yogurt": 137,
  "condensed_milk": 207,
  "salt": 141,
  "sugar": 142,
  "rock_sugar": 143,
  "soy_sauce": 151,
  "dark_soy_sauce": 152,
  "vinegar": 232,
  "rice_vinegar": 154,
  "black_vinegar": 155,
  "oyster_sauce": 153,
  "cooking_wine": 156,
  "chili_sauce": 233,
  "doubanjiang": 160,
  "soybean_paste": 234,
  "sweet_bean_paste": 235,
  "hoisin_sauce": 236,
  "ketchup": 237,
  "mustard": 238,
  "pepper_powder": 239,
  "white_pepper": 240,
  "sichuan_pepper": 165,
  "star_anise": 161,
  "cinnamon": 162,
  "bay_leaf": 163,
  "cumin": 166,
  "five_spice": 241,
  "msg": 145,
  "chicken_powder": 146,
  "baking_soda": 150,
  "soybean_oil": 242,
  "rapeseed_oil": 243,
  "peanut_oil": 244,
  "corn_oil": 245,
  "sunflower_oil": 246,
  "sesame_oil": 157,
  "lard": 247,
  "dried_shiitake": 248,
  "dried_wood_ear": 179,
  "dried_tremella": 180,
  "dried_daylily": 249,
  "vermicelli": 172,
  "bean_thread_noodle": 173,
  "dried_seaweed": 177,
  "dried_kelp": 178,
  "dried_shrimp": 175,
  "dried_scallop": 176,
  "dried_anchovy": 250,
  "peanut": 191,
  "cashew": 193,
  "walnut": 192,
  "black_sesame": 215,
  "white_sesame": 169,
  "dried_chili": 164,
  "dried_date": 197,
  "goji_berry": 198,
  "lotus_seed": 251,
  "dried_lily_bulb": 252,
  "dried_tangerine_peel": 253,
  "dried_longan": 254,
  "dried_plum": 255,
  "dried_bamboo_shoot": 256,
  "preserved_mustard": 184,
  "pickled_radish": 257,
  "pickled_cabbage": 182,
  "mineral_water": 258,
  "soda_water": 259,
  "cola": 260,
  "lemon_soda": 261,
  "orange_juice": 262,
  "apple_juice": 263,
  "coconut_milk": 206,
  "soy_milk": 264,
  "green_tea_drink": 265,
  "black_tea_drink": 266,
  "potato_starch": 149,
  "corn_starch": 147,
  "dumpling_wrapper": 267,
  "wonton_wrapper": 268,
  "spring_roll_wrapper": 269,
  "breadcrumbs": 270,
  "gelatin": 271
});

const FALLBACK_IDS =
  new Set([
  "tilapia",
  "pomfret",
  "tuna",
  "river_shrimp",
  "mitten_crab",
  "mussel",
  "octopus",
  "romaine",
  "chili_pepper",
  "sweet_potato",
  "bamboo_shoot",
  "vinegar",
  "chili_sauce",
  "soybean_paste",
  "sweet_bean_paste",
  "hoisin_sauce",
  "ketchup",
  "mustard",
  "pepper_powder",
  "white_pepper",
  "five_spice",
  "soybean_oil",
  "rapeseed_oil",
  "peanut_oil",
  "corn_oil",
  "sunflower_oil",
  "lard",
  "dried_shiitake",
  "dried_daylily",
  "dried_anchovy",
  "lotus_seed",
  "dried_lily_bulb",
  "dried_tangerine_peel",
  "dried_longan",
  "dried_plum",
  "dried_bamboo_shoot",
  "pickled_radish",
  "mineral_water",
  "soda_water",
  "cola",
  "lemon_soda",
  "orange_juice",
  "apple_juice",
  "soy_milk",
  "green_tea_drink",
  "black_tea_drink",
  "dumpling_wrapper",
  "wonton_wrapper",
  "spring_roll_wrapper",
  "breadcrumbs",
  "gelatin"
]);

function padIngredientIndex(
  value
) {
  return String(
    value
  ).padStart(
    3,
    "0"
  );
}

export const INGREDIENT_VISUALS =
  Object.freeze(
    INGREDIENTS_V1.map(
      (
        ingredient,
        offset
      ) => {
        const index =
          offset + 1;

        const spriteSlot =
          INGREDIENT_SPRITE_SLOT_BY_ID[
            ingredient.id
          ];

        const spriteOffset =
          spriteSlot - 1;

        return Object.freeze({
          index,
          code:
            padIngredientIndex(
              index
            ),
          batch:
            Math.floor(
              offset / 10
            ) + 1,
          batchPosition:
            (
              offset %
              10
            ) + 1,
          id:
            ingredient.id,
          name:
            ingredient.name,
          category:
            ingredient.category,

          /*
           * 语义路径继续保留，便于以后将高清单图直接
           * 放入 assets/images/ingredients 后无缝升级。
           */
          image:
            `${INGREDIENT_IMAGE_DIRECTORY}/${padIngredientIndex(index)}_${ingredient.id}.webp`,

          spriteSlot,
          spriteColumn:
            spriteOffset %
            INGREDIENT_ATLAS_COLUMNS,
          spriteRow:
            Math.floor(
              spriteOffset /
              INGREDIENT_ATLAS_COLUMNS
            ),
          spriteFallback:
            FALLBACK_IDS.has(
              ingredient.id
            )
        });
      }
    )
  );

const INGREDIENT_VISUAL_MAP =
  new Map(
    INGREDIENT_VISUALS.map(
      visual => [
        visual.id,
        visual
      ]
    )
  );

export function getIngredientVisual(
  ingredientId
) {
  const visual =
    INGREDIENT_VISUAL_MAP.get(
      ingredientId
    );

  if (!visual) {
    throw new Error(
      `Ingredient visual "${ingredientId}" does not exist`
    );
  }

  return visual;
}

export function getIngredientImagePath(
  ingredientId
) {
  return getIngredientVisual(
    ingredientId
  ).image;
}

export function getIngredientVisualByIndex(
  index
) {
  if (
    !Number.isInteger(index) ||
    index < 1 ||
    index >
      INGREDIENT_VISUALS.length
  ) {
    throw new RangeError(
      "Ingredient visual index must be between 1 and 220"
    );
  }

  return INGREDIENT_VISUALS[
    index - 1
  ];
}

export function getIngredientSpriteStyle(
  ingredientId,
  displaySize = 40
) {
  const visual =
    getIngredientVisual(
      ingredientId
    );

  const size =
    Math.max(
      16,
      Number(displaySize) ||
      40
    );

  const atlasWidth =
    INGREDIENT_ATLAS_COLUMNS *
    size;

  const atlasHeight =
    INGREDIENT_ATLAS_ROWS *
    size;

  return [
    `width:${size}px`,
    `height:${size}px`,
    `background-size:${atlasWidth}px ${atlasHeight}px`,
    `background-position:-${visual.spriteColumn * size}px -${visual.spriteRow * size}px`
  ].join(";");
}
