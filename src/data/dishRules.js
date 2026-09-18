export const DISH_RANK = Object.freeze({
  HOMESTYLE: Object.freeze({
    id: "homestyle",
    name: "家常",
    order: 1,
    minMasteryLevel: 1,
    minQualityScore: 0
  }),

  SELECTED: Object.freeze({
    id: "selected",
    name: "优选",
    order: 2,
    minMasteryLevel: 2,
    minQualityScore: 55
  }),

  SIGNATURE: Object.freeze({
    id: "signature",
    name: "招牌",
    order: 3,
    minMasteryLevel: 3,
    minQualityScore: 68
  }),

  FAMOUS: Object.freeze({
    id: "famous",
    name: "名菜",
    order: 4,
    minMasteryLevel: 4,
    minQualityScore: 80
  }),

  HOUSE_SPECIAL: Object.freeze({
    id: "house_special",
    name: "镇店",
    order: 5,
    minMasteryLevel: 5,
    minQualityScore: 90
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
  qualityScore = 0
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
    Number.isFinite(
      qualityScore
    )
      ? Math.max(
          0,
          Math.min(
            100,
            qualityScore
          )
        )
      : 0;

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
        rule.minQualityScore
    ) {
      result =
        rule;
    }
  }

  return result;
}

export function getCookOutputGrade(
  qualityScore
) {
  const score =
    Number.isFinite(
      qualityScore
    )
      ? qualityScore
      : 0;

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
  qualityScore
) {
  const grade =
    getCookOutputGrade(
      qualityScore
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
