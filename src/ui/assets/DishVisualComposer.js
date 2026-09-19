import {
  getIngredientVisual
} from "../../data/ingredientVisuals.js";

import {
  INGREDIENT_ATLAS_COLUMNS,
  INGREDIENT_ATLAS_ROWS,
  INGREDIENT_ATLAS_SOURCE_CELL,
  INGREDIENT_ATLAS_DATA_URI
} from "../../data/ingredientAtlas.js";


export const DISH_VISUAL_VERSION =
  1;

export const DISH_VISUAL_CANVAS_SIZE =
  1024;


const HIDDEN_CATEGORIES =
  new Set([
    "seasoning",
    "oil",
    "beverage"
  ]);


const CATEGORY_COLORS =
  Object.freeze({
    meat:
      "#b85a3b",

    poultry:
      "#d68a45",

    seafood:
      "#d98b7c",

    vegetable:
      "#5aa548",

    fruit:
      "#e49a55",

    grain:
      "#e3c26d",

    bean:
      "#d0b46a",

    egg:
      "#f2c84a",

    dairy:
      "#f1eadb",

    dry_goods:
      "#8e704d",

    other:
      "#a38768"
  });


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


export function hashDishVisualSeed(
  value
) {
  const text =
    String(
      value ??
      ""
    );

  let hash =
    2166136261;

  for (
    let index = 0;
    index < text.length;
    index += 1
  ) {
    hash ^=
      text.charCodeAt(
        index
      );

    hash =
      Math.imul(
        hash,
        16777619
      );
  }

  return hash >>>
    0;
}


function createRandom(
  seed
) {
  let state =
    seed >>>
    0;

  return () => {
    state +=
      0x6D2B79F5;

    let value =
      state;

    value =
      Math.imul(
        value ^
          value >>> 15,
        value | 1
      );

    value ^=
      value +
      Math.imul(
        value ^
          value >>> 7,
        value | 61
      );

    return (
      (
        value ^
        value >>> 14
      ) >>>
      0
    ) /
      4294967296;
  };
}


function choose(
  values,
  random
) {
  if (
    !values.length
  ) {
    return null;
  }

  return values[
    Math.floor(
      random() *
      values.length
    )
  ];
}


function getContainer(
  method,
  category
) {
  if (
    method ===
      "hotpot" ||
    method ===
      "stew" ||
    method ===
      "simmer" ||
    method ===
      "pressure_cook" ||
    category ===
      "soup" ||
    category ===
      "hotpot"
  ) {
    return "deep_bowl";
  }

  if (
    method ===
      "claypot"
  ) {
    return "claypot";
  }

  if (
    method ===
      "grill" ||
    method ===
      "roast"
  ) {
    return "dark_plate";
  }

  if (
    category ===
      "noodle"
  ) {
    return "noodle_bowl";
  }

  if (
    category ===
      "rice"
  ) {
    return "rice_plate";
  }

  return "white_plate";
}


function getLayout(
  method,
  category,
  random
) {
  if (
    category ===
    "rice"
  ) {
    return choose(
      [
        "rice_mound",
        "rice_side",
        "rice_center"
      ],
      random
    );
  }

  if (
    category ===
    "noodle"
  ) {
    return choose(
      [
        "noodle_bowl",
        "noodle_center"
      ],
      random
    );
  }

  if (
    category ===
      "soup" ||
    category ===
      "hotpot" ||
    method ===
      "stew" ||
    method ===
      "simmer" ||
    method ===
      "hotpot"
  ) {
    return "broth_center";
  }

  if (
    method ===
      "grill" ||
    method ===
      "roast"
  ) {
    return choose(
      [
        "line_plate",
        "center_stack"
      ],
      random
    );
  }

  return choose(
    [
      "scattered_stirfry",
      "center_stack",
      "three_cluster"
    ],
    random
  );
}


function getSauceStyle(
  method,
  ingredientIds
) {
  const ids =
    new Set(
      ingredientIds
    );

  if (
    ids.has(
      "chili_sauce"
    ) ||
    ids.has(
      "doubanjiang"
    ) ||
    ids.has(
      "dried_chili"
    ) ||
    method ===
      "hotpot"
  ) {
    return {
      id:
        "red_oil",

      color:
        "rgba(166, 45, 20, 0.72)"
    };
  }

  if (
    method ===
      "braise" ||
    ids.has(
      "dark_soy_sauce"
    ) ||
    ids.has(
      "soy_sauce"
    )
  ) {
    return {
      id:
        "brown_glaze",

      color:
        "rgba(122, 54, 22, 0.68)"
    };
  }

  if (
    method ===
      "stew" ||
    method ===
      "simmer" ||
    method ===
      "boil" ||
    method ===
      "poach"
  ) {
    return {
      id:
        "clear_broth",

      color:
        "rgba(218, 177, 93, 0.42)"
    };
  }

  if (
    method ===
      "cold_mix" ||
    method ===
      "raw_prepare"
  ) {
    return {
      id:
        "light_dressing",

      color:
        "rgba(233, 198, 110, 0.28)"
    };
  }

  return {
    id:
      "savory_gloss",

    color:
      "rgba(174, 92, 38, 0.35)"
  };
}


function getEffects(
  method
) {
  return {
    steam:
      [
        "steam",
        "boil",
        "stew",
        "simmer",
        "hotpot",
        "pressure_cook",
        "claypot"
      ].includes(
        method
      ),

    crisp:
      method ===
      "fry",

    char:
      [
        "grill",
        "roast",
        "smoke"
      ].includes(
        method
      ),

    glaze:
      [
        "braise",
        "stir_fry",
        "pan_fry"
      ].includes(
        method
      )
  };
}


function normalizedIngredients(
  recipe,
  ingredientRecords
) {
  const recordMap =
    new Map(
      (
        ingredientRecords ??
        []
      )
        .map(
          item => [
            item.id,
            item
          ]
        )
    );

  return (
    recipe?.ingredients ??
    []
  )
    .map(
      item => {
        const ingredient =
          recordMap.get(
            item.ingredientId
          );

        return {
          id:
            item.ingredientId,

          quantity:
            Number(
              item.quantity ??
              0
            ),

          category:
            ingredient
              ?.category ??
            "other",

          name:
            ingredient
              ?.name ??
            item.ingredientId
        };
      }
    );
}


function buildIngredientPlacements(
  ingredients,
  random
) {
  const visible =
    ingredients
      .filter(
        item =>
          !HIDDEN_CATEGORIES
            .has(
              item.category
            )
      )
      .sort(
        (
          a,
          b
        ) =>
          b.quantity -
          a.quantity
      )
      .slice(
        0,
        6
      );

  return visible.map(
    (
      ingredient,
      index
    ) => {
      const main =
        index ===
        0;

      const secondary =
        index >
        0 &&
        index <
        3;

      const baseSize =
        main
          ? 260
          : secondary
            ? 205
            : 145;

      return {
        ingredientId:
          ingredient.id,

        category:
          ingredient.category,

        role:
          main
            ? "main"
            : secondary
              ? "secondary"
              : "accent",

        x:
          Math.round(
            512 +
            (
              random() -
              0.5
            ) *
            (
              main
                ? 90
                : 360
            )
          ),

        y:
          Math.round(
            520 +
            (
              random() -
              0.5
            ) *
            (
              main
                ? 80
                : 310
            )
          ),

        size:
          Math.round(
            baseSize *
            (
              0.86 +
              random() *
              0.28
            )
          ),

        rotation:
          Math.round(
            (
              random() -
              0.5
            ) *
            34
          ),

        opacity:
          0.96
      };
    }
  );
}


export function createDishVisualPlan({
  dish,
  recipe,
  ingredientRecords = []
}) {
  if (
    !dish?.id
  ) {
    throw new Error(
      "Dish visual plan requires dish.id"
    );
  }

  const seed =
    hashDishVisualSeed(
      "dish_visual_v" +
      DISH_VISUAL_VERSION +
      ":" +
      dish.id
    );

  const random =
    createRandom(
      seed
    );

  const ingredients =
    normalizedIngredients(
      recipe,
      ingredientRecords
    );

  const ingredientIds =
    ingredients.map(
      item =>
        item.id
    );

  const method =
    recipe?.method ??
    dish.method ??
    "stir_fry";

  const category =
    dish.category ??
    "stir_fry";

  const signature =
    JSON.stringify({
      dishId:
        dish.id,

      recipeId:
        recipe?.id ??
        dish.recipeId ??
        null,

      method,

      ingredients:
        ingredients.map(
          item => [
            item.id,
            item.quantity
          ]
        )
    });

  return {
    version:
      DISH_VISUAL_VERSION,

    canvas: {
      width:
        DISH_VISUAL_CANVAS_SIZE,

      height:
        DISH_VISUAL_CANVAS_SIZE
    },

    seed,

    cacheKey:
      "dish_visual_v" +
      DISH_VISUAL_VERSION +
      "_" +
      dish.id +
      "_" +
      hashDishVisualSeed(
        signature
      )
        .toString(
          16
        ),

    dishId:
      dish.id,

    recipeId:
      recipe?.id ??
      dish.recipeId ??
      null,

    method,

    category,

    container:
      getContainer(
        method,
        category
      ),

    layout:
      getLayout(
        method,
        category,
        random
      ),

    sauce:
      getSauceStyle(
        method,
        ingredientIds
      ),

    effects:
      getEffects(
        method
      ),

    ingredients:
      buildIngredientPlacements(
        ingredients,
        random
      ),

    ingredientIds
  };
}


function componentPath(
  ingredientId
) {
  return (
    "assets/images/dishes/components/ingredients/" +
    ingredientId +
    ".webp"
  );
}


function loadImage(
  source
) {
  return new Promise(
    resolve => {
      if (
        typeof Image ===
        "undefined"
      ) {
        resolve(
          null
        );

        return;
      }

      const image =
        new Image();

      image.onload =
        () =>
          resolve(
            image
          );

      image.onerror =
        () =>
          resolve(
            null
          );

      image.src =
        source;
    }
  );
}


function drawContainer(
  context,
  plan
) {
  const size =
    DISH_VISUAL_CANVAS_SIZE;

  context.save();

  context.clearRect(
    0,
    0,
    size,
    size
  );

  context.shadowColor =
    "rgba(32, 30, 25, 0.24)";

  context.shadowBlur =
    30;

  context.shadowOffsetY =
    18;

  const bowl =
    [
      "deep_bowl",
      "noodle_bowl",
      "claypot"
    ].includes(
      plan.container
    );

  context.beginPath();

  context.ellipse(
    512,
    570,
    bowl
      ? 380
      : 410,
    bowl
      ? 300
      : 245,
    0,
    0,
    Math.PI *
      2
  );

  const gradient =
    context.createLinearGradient(
      0,
      300,
      0,
      820
    );

  if (
    plan.container ===
    "dark_plate"
  ) {
    gradient.addColorStop(
      0,
      "#4a4037"
    );

    gradient.addColorStop(
      1,
      "#181818"
    );
  } else if (
    plan.container ===
    "claypot"
  ) {
    gradient.addColorStop(
      0,
      "#9e5638"
    );

    gradient.addColorStop(
      1,
      "#5f2f21"
    );
  } else {
    gradient.addColorStop(
      0,
      "#fffefa"
    );

    gradient.addColorStop(
      1,
      "#e8e1d6"
    );
  }

  context.fillStyle =
    gradient;

  context.fill();

  context.restore();
}


function drawSauce(
  context,
  plan
) {
  context.save();

  context.beginPath();

  context.ellipse(
    512,
    555,
    330,
    205,
    0,
    0,
    Math.PI *
      2
  );

  context.fillStyle =
    plan.sauce.color;

  context.fill();

  context.restore();
}


function drawFallbackIngredient(
  context,
  placement
) {
  const color =
    CATEGORY_COLORS[
      placement.category
    ] ??
    CATEGORY_COLORS.other;

  context.save();

  context.translate(
    placement.x,
    placement.y
  );

  context.rotate(
    placement.rotation *
    Math.PI /
    180
  );

  context.globalAlpha =
    placement.opacity;

  const width =
    placement.size;

  const height =
    Math.round(
      placement.size *
      0.54
    );

  context.shadowColor =
    "rgba(68, 30, 18, 0.16)";

  context.shadowBlur =
    14;

  context.fillStyle =
    color;

  context.beginPath();

  context.roundRect(
    -width /
      2,
    -height /
      2,
    width,
    height,
    Math.min(
      48,
      height /
        2
    )
  );

  context.fill();

  const highlight =
    context.createLinearGradient(
      0,
      -height /
        2,
      0,
      height /
        2
    );

  highlight.addColorStop(
    0,
    "rgba(255,255,255,0.32)"
  );

  highlight.addColorStop(
    0.5,
    "rgba(255,255,255,0.02)"
  );

  highlight.addColorStop(
    1,
    "rgba(64,20,0,0.14)"
  );

  context.fillStyle =
    highlight;

  context.fill();

  context.restore();
}


async function drawIngredient(
  context,
  placement
) {
  const image =
    await loadImage(
      componentPath(
        placement.ingredientId
      )
    );

  if (
    image
  ) {
    context.save();

    context.translate(
      placement.x,
      placement.y
    );

    context.rotate(
      placement.rotation *
      Math.PI /
      180
    );

    context.globalAlpha =
      placement.opacity;

    context.drawImage(
      image,
      -placement.size /
        2,
      -placement.size /
        2,
      placement.size,
      placement.size
    );

    context.restore();

    return;
  }

  drawFallbackIngredient(
    context,
    placement
  );
}


function drawEffects(
  context,
  plan
) {
  context.save();

  if (
    plan.effects.glaze
  ) {
    const glaze =
      context.createRadialGradient(
        460,
        430,
        40,
        512,
        520,
        360
      );

    glaze.addColorStop(
      0,
      "rgba(255,255,255,0.24)"
    );

    glaze.addColorStop(
      0.55,
      "rgba(255,214,140,0.05)"
    );

    glaze.addColorStop(
      1,
      "rgba(255,255,255,0)"
    );

    context.fillStyle =
      glaze;

    context.fillRect(
      150,
      250,
      724,
      560
    );
  }

  if (
    plan.effects.char
  ) {
    context.fillStyle =
      "rgba(64, 33, 18, 0.23)";

    for (
      let index = 0;
      index < 9;
      index += 1
    ) {
      context.fillRect(
        300 +
          index *
          43,
        420 +
          (
            index %
            3
          ) *
          70,
        42,
        8
      );
    }
  }

  if (
    plan.effects.steam
  ) {
    context.strokeStyle =
      "rgba(255,255,255,0.32)";

    context.lineWidth =
      10;

    for (
      let index = 0;
      index < 3;
      index += 1
    ) {
      context.beginPath();

      context.moveTo(
        430 +
          index *
          80,
        390
      );

      context.bezierCurveTo(
        390 +
          index *
          80,
        320,
        485 +
          index *
          80,
        275,
        455 +
          index *
          80,
        205
      );

      context.stroke();
    }
  }

  context.restore();
}


export async function composeDishVisual({
  dish,
  recipe,
  ingredientRecords = [],
  canvas = null
}) {
  if (
    typeof document ===
      "undefined" &&
    !canvas
  ) {
    return {
      plan:
        createDishVisualPlan({
          dish,
          recipe,
          ingredientRecords
        }),

      canvas:
        null,

      blob:
        null
    };
  }

  const plan =
    createDishVisualPlan({
      dish,
      recipe,
      ingredientRecords
    });

  const target =
    canvas ??
    document.createElement(
      "canvas"
    );

  target.width =
    DISH_VISUAL_CANVAS_SIZE;

  target.height =
    DISH_VISUAL_CANVAS_SIZE;

  const context =
    target.getContext(
      "2d"
    );

  drawContainer(
    context,
    plan
  );

  drawSauce(
    context,
    plan
  );

  for (
    const placement
    of plan.ingredients
  ) {
    await drawIngredient(
      context,
      placement
    );
  }

  drawEffects(
    context,
    plan
  );

  const blob =
    await new Promise(
      resolve => {
        if (
          typeof target.toBlob !==
          "function"
        ) {
          resolve(
            null
          );

          return;
        }

        target.toBlob(
          value =>
            resolve(
              value
            ),
          "image/webp",
          0.9
        );
      }
    );

  return {
    plan,
    canvas:
      target,
    blob
  };
}
