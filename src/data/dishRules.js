export const DISH_GROWTH_SCHEMA_VERSION = 1;

export const DISH_SCORE_SEMANTICS =
  Object.freeze({
    researchScore: Object.freeze({
      id: "researchScore",
      name: "研发评分",
      description:
        "一次研发完成时形成的初始研发结果，只描述研发方案本身，不代表长期菜品品阶或单次出品。"
    }),

    recipeQualityScore: Object.freeze({
      id: "recipeQualityScore",
      name: "配方品质分",
      description:
        "门店长期维护的配方水平，受研发起点与后续配方改良影响，用于长期品阶判定。"
    }),

    outputQualityScore: Object.freeze({
      id: "outputQualityScore",
      name: "出品质量分",
      description:
        "某次真实制作结果，由食材批次、鲜度、厨师、难度、营销与熟练度共同决定。"
    })
  });

export const DISH_RANK = Object.freeze({
  HOMESTYLE: Object.freeze({
    id: "homestyle",
    name: "家常",
    order: 1,
    minMasteryLevel: 1,
    minRecipeQualityScore: 0
  }),

  SELECTED: Object.freeze({
    id: "selected",
    name: "优选",
    order: 2,
    minMasteryLevel: 2,
    minRecipeQualityScore: 55
  }),

  SIGNATURE: Object.freeze({
    id: "signature",
    name: "招牌",
    order: 3,
    minMasteryLevel: 3,
    minRecipeQualityScore: 68
  }),

  FAMOUS: Object.freeze({
    id: "famous",
    name: "名菜",
    order: 4,
    minMasteryLevel: 4,
    minRecipeQualityScore: 80
  }),

  HOUSE_SPECIAL: Object.freeze({
    id: "house_special",
    name: "镇店",
    order: 5,
    minMasteryLevel: 5,
    minRecipeQualityScore: 90
  })
});

export const DISH_RANK_LIST =
  Object.freeze(
    Object.values(
      DISH_RANK
    )
  );

export const DISH_MASTERY_THRESHOLDS =
  Object.freeze([
    0,
    25,
    80,
    180,
    360
  ]);

export const DISH_MASTERY_NAMES =
  Object.freeze({
    1: "生疏",
    2: "熟练",
    3: "精通",
    4: "拿手",
    5: "炉火纯青"
  });

export const COOK_OUTPUT_GRADE =
  Object.freeze({
    C: "C",
    B: "B",
    A: "A",
    S: "S"
  });

export const COOK_OUTPUT_LEVELS =
  Object.freeze([
    Object.freeze({
      id: "c",
      grade: "C",
      name: "普通",
      min: 0
    }),
    Object.freeze({
      id: "b",
      grade: "B",
      name: "良好",
      min: 60
    }),
    Object.freeze({
      id: "a",
      grade: "A",
      name: "精致",
      min: 75
    }),
    Object.freeze({
      id: "s",
      grade: "S",
      name: "完美",
      min: 90
    })
  ]);

export function clampDishScore(
  value,
  fallback = 0
) {
  return Number.isFinite(value)
    ? Math.max(
        0,
        Math.min(
          100,
          Number(value)
        )
      )
    : fallback;
}

export function getDishMasteryLevel(
  masteryXp
) {
  const xp =
    Number.isFinite(
      masteryXp
    )
      ? Math.max(
          0,
          masteryXp
        )
      : 0;

  let level = 1;

  for (
    let index = 1;
    index <
      DISH_MASTERY_THRESHOLDS.length;
    index += 1
  ) {
    if (
      xp >=
      DISH_MASTERY_THRESHOLDS[
        index
      ]
    ) {
      level =
        index + 1;
    }
  }

  return level;
}

export function getDishRank({
  masteryLevel = 1,
  recipeQualityScore = 0
} = {}) {
  const safeMastery =
    Number.isFinite(
      masteryLevel
    )
      ? Math.max(
          1,
          Math.min(
            5,
            Math.floor(
              masteryLevel
            )
          )
        )
      : 1;

  const safeQuality =
    clampDishScore(
      recipeQualityScore,
      0
    );

  let result =
    DISH_RANK.HOMESTYLE;

  for (
    const rule
    of DISH_RANK_LIST
  ) {
    if (
      safeMastery >=
        rule.minMasteryLevel &&
      safeQuality >=
        rule.minRecipeQualityScore
    ) {
      result =
        rule;
    }
  }

  return result;
}

export function getCookOutputGrade(
  outputQualityScore
) {
  const score =
    clampDishScore(
      outputQualityScore,
      0
    );

  if (score >= 90) {
    return COOK_OUTPUT_GRADE.S;
  }

  if (score >= 75) {
    return COOK_OUTPUT_GRADE.A;
  }

  if (score >= 60) {
    return COOK_OUTPUT_GRADE.B;
  }

  return COOK_OUTPUT_GRADE.C;
}

export function getCookOutputLevel(
  outputQualityScore
) {
  const grade =
    getCookOutputGrade(
      outputQualityScore
    );

  return (
    COOK_OUTPUT_LEVELS.find(
      item =>
        item.grade ===
        grade
    ) ??
    COOK_OUTPUT_LEVELS[0]
  );
}

export function validateDishGrowthRules() {
  if (
    DISH_RANK_LIST.length !==
    5
  ) {
    throw new Error(
      "Dish rank must contain exactly five long-term stages"
    );
  }

  if (
    DISH_MASTERY_THRESHOLDS.length !==
    5
  ) {
    throw new Error(
      "Dish mastery must contain exactly five levels"
    );
  }

  if (
    Object.keys(
      COOK_OUTPUT_GRADE
    ).join(",") !==
    "C,B,A,S"
  ) {
    throw new Error(
      "Cook output grades must be C/B/A/S only"
    );
  }

  for (
    let index = 1;
    index <
      DISH_RANK_LIST.length;
    index += 1
  ) {
    const previous =
      DISH_RANK_LIST[
        index - 1
      ];

    const current =
      DISH_RANK_LIST[
        index
      ];

    if (
      current.order <=
        previous.order ||
      current.minMasteryLevel <
        previous.minMasteryLevel ||
      current.minRecipeQualityScore <
        previous.minRecipeQualityScore
    ) {
      throw new Error(
        "Dish rank requirements must increase monotonically"
      );
    }
  }

  return true;
}
