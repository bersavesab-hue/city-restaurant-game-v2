export const ECONOMIC_BALANCE_SCHEMA_VERSION = 1;

export const ECONOMIC_BALANCE_META =
  Object.freeze({
    schemaVersion:
      ECONOMIC_BALANCE_SCHEMA_VERSION,
    datasetVersion:
      "1.0.0",
    currency:
      "CNY",
    nominalCurrencyScale:
      1,
    model:
      "reality_price_plus_gameplay_balance"
  });

export const DISH_RESEARCH_ECONOMY =
  Object.freeze({
    baseCost: 700,
    perIngredientCost: 250,
    difficultyCost: 12,
    minimumCost: 500,
    baseMarkup: 2.1,
    researchScoreMarkup: 0.009
  });

export const DISH_IMPROVEMENT_ECONOMY =
  Object.freeze({
    quality: Object.freeze({
      id: "quality",
      name: "品质改良",
      requiredMasteryLevel: 2,
      baseCost: 1800
    }),
    speed: Object.freeze({
      id: "speed",
      name: "流程优化",
      requiredMasteryLevel: 3,
      baseCost: 2200
    }),
    cost: Object.freeze({
      id: "cost",
      name: "成本优化",
      requiredMasteryLevel: 3,
      baseCost: 2600
    }),
    attemptCostIncrement: 250,
    rankCostIncrement: 300,
    successBase: 0.72,
    masterySuccessIncrement: 0.04,
    recipeQualityPenaltyDivisor: 350,
    attemptSuccessPenalty: 0.01,
    minSuccessChance: 0.25,
    maxSuccessChance: 0.85
  });

export const UTILITY_USAGE_BALANCE =
  Object.freeze({
    inactiveFactor: 0.22,
    electricity: Object.freeze({
      baseKwhPerOpenHour: 1.6,
      kitchenStationKwhPerOpenHour: 2.4,
      seatKwhPerOpenHour: 0.045,
      orderKwh: 0.06
    }),
    water: Object.freeze({
      tonPerOpenHour: 0.045,
      tonPerOrder: 0.012,
      tonPerSeatOpenHour: 0.002
    }),
    gas: Object.freeze({
      cubicMeterPerStationOpenHour: 0.22,
      cubicMeterPerOrder: 0.035
    })
  });

export const CHANNEL_ECONOMY_POLICY =
  Object.freeze({
    defaultPackagingCost: Object.freeze({
      dine_in: 0,
      pickup: 2,
      delivery: 4,
      reservation: 0
    }),
    maxCommissionRate: 30,
    maxPackagingCostPerOrder: 50
  });

export const FINANCIAL_HEALTH_POLICY =
  Object.freeze({
    targetOperatingMargin:
      Object.freeze({
        warningBelow: 0,
        watchBelow: 0.05,
        healthyFrom: 0.12
      }),
    cashRunwayDays:
      Object.freeze({
        criticalBelow: 7,
        warningBelow: 21,
        healthyFrom: 45
      }),
    costRatioWarning:
      Object.freeze({
        ingredient: 0.45,
        salary: 0.35,
        rent: 0.2,
        utilities: 0.08,
        marketing: 0.15,
        channel: 0.25
      })
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

export function calculateDishResearchCost({
  ingredientCount,
  difficulty
}) {
  const count =
    Math.max(
      0,
      Math.floor(
        Number(
          ingredientCount
        ) || 0
      )
    );

  const safeDifficulty =
    clamp(
      Number(
        difficulty
      ) || 0,
      0,
      100
    );

  return Math.max(
    DISH_RESEARCH_ECONOMY
      .minimumCost,
    Math.round(
      DISH_RESEARCH_ECONOMY
        .baseCost +
      count *
        DISH_RESEARCH_ECONOMY
          .perIngredientCost +
      safeDifficulty *
        DISH_RESEARCH_ECONOMY
          .difficultyCost
    )
  );
}

export function getDishResearchMarkup(
  researchScore
) {
  return (
    DISH_RESEARCH_ECONOMY
      .baseMarkup +
    clamp(
      Number(
        researchScore
      ) || 0,
      0,
      100
    ) *
      DISH_RESEARCH_ECONOMY
        .researchScoreMarkup
  );
}

export function calculateDishImprovementCost({
  focus,
  attempts = 0,
  rankOrder = 1
}) {
  const definition =
    DISH_IMPROVEMENT_ECONOMY[
      focus
    ];

  if (
    !definition ||
    typeof definition !==
      "object" ||
    !Number.isFinite(
      definition.baseCost
    )
  ) {
    throw new Error(
      "Invalid dish improvement focus"
    );
  }

  return Math.round(
    definition.baseCost +
    Math.max(
      0,
      Math.floor(
        Number(attempts) || 0
      )
    ) *
      DISH_IMPROVEMENT_ECONOMY
        .attemptCostIncrement +
    Math.max(
      1,
      Math.floor(
        Number(rankOrder) || 1
      )
    ) *
      DISH_IMPROVEMENT_ECONOMY
        .rankCostIncrement
  );
}

export function calculateDishImprovementSuccessChance({
  masteryLevel,
  recipeQualityScore,
  attempts = 0
}) {
  return clamp(
    DISH_IMPROVEMENT_ECONOMY
      .successBase +
    Math.max(
      1,
      Math.min(
        5,
        Number(
          masteryLevel
        ) || 1
      )
    ) *
      DISH_IMPROVEMENT_ECONOMY
        .masterySuccessIncrement -
    clamp(
      Number(
        recipeQualityScore
      ) || 0,
      0,
      100
    ) /
      DISH_IMPROVEMENT_ECONOMY
        .recipeQualityPenaltyDivisor -
    Math.max(
      0,
      Number(
        attempts
      ) || 0
    ) *
      DISH_IMPROVEMENT_ECONOMY
        .attemptSuccessPenalty,
    DISH_IMPROVEMENT_ECONOMY
      .minSuccessChance,
    DISH_IMPROVEMENT_ECONOMY
      .maxSuccessChance
  );
}

export function calculateUtilityUsage({
  openHours = 0,
  kitchenStations = 0,
  seats = 0,
  orders = 0
}) {
  const hours =
    Math.max(
      0,
      Number(openHours) || 0
    );

  const stations =
    Math.max(
      0,
      Number(
        kitchenStations
      ) || 0
    );

  const safeSeats =
    Math.max(
      0,
      Number(seats) || 0
    );

  const safeOrders =
    Math.max(
      0,
      Number(orders) || 0
    );

  const activeFactor =
    hours > 0 ||
    safeOrders > 0
      ? 1
      : UTILITY_USAGE_BALANCE
          .inactiveFactor;

  const electricityKwh =
    (
      hours *
        (
          UTILITY_USAGE_BALANCE
            .electricity
            .baseKwhPerOpenHour +
          stations *
            UTILITY_USAGE_BALANCE
              .electricity
              .kitchenStationKwhPerOpenHour +
          safeSeats *
            UTILITY_USAGE_BALANCE
              .electricity
              .seatKwhPerOpenHour
        ) +
      safeOrders *
        UTILITY_USAGE_BALANCE
          .electricity
          .orderKwh
    ) *
    activeFactor;

  const waterTon =
    (
      hours *
        UTILITY_USAGE_BALANCE
          .water
          .tonPerOpenHour +
      safeOrders *
        UTILITY_USAGE_BALANCE
          .water
          .tonPerOrder +
      safeSeats *
        UTILITY_USAGE_BALANCE
          .water
          .tonPerSeatOpenHour
    ) *
    activeFactor;

  const gasCubicMeter =
    stations > 0
      ? (
          hours *
            stations *
            UTILITY_USAGE_BALANCE
              .gas
              .cubicMeterPerStationOpenHour +
          safeOrders *
            UTILITY_USAGE_BALANCE
              .gas
              .cubicMeterPerOrder
        ) *
        activeFactor
      : 0;

  return {
    activeFactor,
    electricityKwh,
    waterTon,
    gasCubicMeter
  };
}

export function validateEconomicBalanceRules() {
  if (
    ECONOMIC_BALANCE_META
      .currency !== "CNY" ||
    ECONOMIC_BALANCE_META
      .nominalCurrencyScale !== 1
  ) {
    throw new Error(
      "Economic balance must use nominal CNY 1:1"
    );
  }

  for (
    const value
    of Object.values(
      CHANNEL_ECONOMY_POLICY
        .defaultPackagingCost
    )
  ) {
    if (
      !Number.isFinite(value) ||
      value < 0 ||
      value >
        CHANNEL_ECONOMY_POLICY
          .maxPackagingCostPerOrder
    ) {
      throw new Error(
        "Invalid channel packaging cost"
      );
    }
  }

  if (
    FINANCIAL_HEALTH_POLICY
      .cashRunwayDays
      .criticalBelow >=
    FINANCIAL_HEALTH_POLICY
      .cashRunwayDays
      .warningBelow
  ) {
    throw new Error(
      "Cash runway thresholds must be ordered"
    );
  }

  return true;
}
