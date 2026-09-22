import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  eventBus
} from "../core/EventBus.js";

import {
  restaurantSystem
} from "./RestaurantSystem.js";

import {
  financeSystem,
  FINANCE_CATEGORY
} from "./FinanceSystem.js";

import {
  LATE_GAME_INVESTMENTS,
  LATE_GAME_INVESTMENT_SCHEMA_VERSION,
  getLateGameInvestment
} from "../data/lateGameInvestmentRules.js";


class LateGameInvestmentSystem {
  getInvestments(
    restaurantId
  ) {
    restaurantSystem.get(
      restaurantId
    );

    return entitySystem
      .filter(
        "store_investment",
        item =>
          item.restaurantId ===
            restaurantId &&
          item.status ===
            "active"
      );
  }


  hasInvestment(
    restaurantId,
    investmentId
  ) {
    return this
      .getInvestments(
        restaurantId
      )
      .some(
        item =>
          item.investmentId ===
          investmentId
      );
  }


  getModifiers(
    restaurantId
  ) {
    const result = {
      customerRecognitionRateBonus: 0,
      recognizedCustomerCapacityBonus: 0,
      memberRetentionMultiplierBonus: 0,
      relationshipRiskGraceDays: 0
    };

    for (
      const investment
      of this.getInvestments(
        restaurantId
      )
    ) {
      const config =
        getLateGameInvestment(
          investment.investmentId
        );

      if (!config) {
        continue;
      }

      const modifiers =
        config.modifiers ?? {};

      result.customerRecognitionRateBonus +=
        Number(
          modifiers
            .customerRecognitionRateBonus
        ) || 0;

      result.recognizedCustomerCapacityBonus +=
        Math.max(
          0,
          Math.floor(
            Number(
              modifiers
                .recognizedCustomerCapacityBonus
            ) || 0
          )
        );

      result.memberRetentionMultiplierBonus +=
        Number(
          modifiers
            .memberRetentionMultiplierBonus
        ) || 0;

      result.relationshipRiskGraceDays +=
        Math.max(
          0,
          Math.floor(
            Number(
              modifiers
                .relationshipRiskGraceDays
            ) || 0
          )
        );
    }

    return result;
  }


  purchase(
    restaurantId,
    investmentId
  ) {
    const config =
      getLateGameInvestment(
        investmentId
      );

    if (!config) {
      throw new Error(
        `Unknown late-game investment "${investmentId}"`
      );
    }

    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    if (
      (restaurant.level ?? 1) <
      config.requiredLevel
    ) {
      throw new Error(
        `Investment requires Lv.${config.requiredLevel}`
      );
    }

    if (
      this.hasInvestment(
        restaurantId,
        investmentId
      )
    ) {
      return this
        .getInvestments(
          restaurantId
        )
        .find(
          item =>
            item.investmentId ===
            investmentId
        );
    }

    financeSystem.expense(
      restaurantId,
      config.cost,
      FINANCE_CATEGORY.OTHER,
      `长期门店建设：${config.name}`
    );

    const investment =
      entitySystem.create(
        "store_investment",
        {
          schemaVersion:
            LATE_GAME_INVESTMENT_SCHEMA_VERSION,

          restaurantId,

          investmentId:
            config.id,

          cost:
            config.cost,

          status:
            "active"
        }
      );

    eventBus.emit(
      "storeInvestment:purchased",
      {
        restaurantId,
        investmentId:
          config.id,
        cost:
          config.cost
      }
    );

    return investment;
  }


  getDashboard(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const owned =
      new Set(
        this
          .getInvestments(
            restaurantId
          )
          .map(
            item =>
              item.investmentId
          )
      );

    const balance =
      financeSystem.getBalance(
        restaurantId
      );

    return {
      restaurantId,

      level:
        restaurant.level ?? 1,

      balance,

      totalInvested:
        this
          .getInvestments(
            restaurantId
          )
          .reduce(
            (
              sum,
              item
            ) =>
              sum +
              (
                item.cost ??
                0
              ),
            0
          ),

      modifiers:
        this.getModifiers(
          restaurantId
        ),

      projects:
        LATE_GAME_INVESTMENTS
          .map(
            config => ({
              ...structuredClone(
                config
              ),

              owned:
                owned.has(
                  config.id
                ),

              unlocked:
                (
                  restaurant.level ??
                  1
                ) >=
                config.requiredLevel,

              affordable:
                balance >=
                config.cost
            })
          )
    };
  }
}


export const lateGameInvestmentSystem =
  new LateGameInvestmentSystem();


export {
  LateGameInvestmentSystem
};
