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
  storeProgressSystem
} from "./StoreProgressSystem.js";

import {
  LATE_GAME_INVESTMENTS,
  LATE_GAME_INVESTMENT_SCHEMA_VERSION,
  getLateGameInvestment
} from "../data/lateGameInvestmentRules.js";


class LateGameInvestmentSystem {
  getAnchorRestaurantId(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    if (
      restaurant.brandRole ===
        "branch" &&
      restaurant.parentRestaurantId
    ) {
      return restaurant.parentRestaurantId;
    }

    return restaurantId;
  }


  getAnchorRestaurant(
    restaurantId
  ) {
    return restaurantSystem.get(
      this.getAnchorRestaurantId(
        restaurantId
      )
    );
  }


  getInvestments(
    restaurantId
  ) {
    const anchorId =
      this.getAnchorRestaurantId(
        restaurantId
      );

    return entitySystem
      .filter(
        "brand_investment",
        item =>
          item.restaurantId ===
            anchorId &&
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
      relationshipRiskGraceDays: 0,
      centralKitchenShelfLifeMultiplier: 1,
      regionUnlockCostMultiplier: 1
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

      result.centralKitchenShelfLifeMultiplier *=
        Number(
          modifiers
            .centralKitchenShelfLifeMultiplier
        ) || 1;

      result.regionUnlockCostMultiplier *=
        Number(
          modifiers
            .regionUnlockCostMultiplier
        ) || 1;
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

    const anchor =
      this.getAnchorRestaurant(
        restaurantId
      );

    if (
      !storeProgressSystem
        .isUnlocked(
          anchor.id,
          config.requiredLevel >= 10
            ? "regional_expansion"
            : config.requiredLevel >= 9
              ? "central_kitchen"
              : config.requiredLevel >= 8
                ? "chain_management"
                : "membership"
        )
    ) {
      throw new Error(
        `Investment requires Lv.${config.requiredLevel}`
      );
    }

    if (
      this.hasInvestment(
        anchor.id,
        investmentId
      )
    ) {
      return this
        .getInvestments(
          anchor.id
        )
        .find(
          item =>
            item.investmentId ===
            investmentId
        );
    }

    financeSystem.expense(
      anchor.id,
      config.cost,
      FINANCE_CATEGORY.OTHER,
      `长期品牌基建：${config.name}`
    );

    const investment =
      entitySystem.create(
        "brand_investment",
        {
          schemaVersion:
            LATE_GAME_INVESTMENT_SCHEMA_VERSION,

          restaurantId:
            anchor.id,

          investmentId:
            config.id,

          cost:
            config.cost,

          status:
            "active"
        }
      );

    eventBus.emit(
      "brandInvestment:purchased",
      {
        restaurantId:
          anchor.id,

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
    const anchor =
      this.getAnchorRestaurant(
        restaurantId
      );

    const owned =
      new Set(
        this
          .getInvestments(
            anchor.id
          )
          .map(
            item =>
              item.investmentId
          )
      );

    const balance =
      financeSystem.getBalance(
        anchor.id
      );

    return {
      restaurantId,
      anchorRestaurantId:
        anchor.id,

      level:
        anchor.level ?? 1,

      balance,

      totalInvested:
        this
          .getInvestments(
            anchor.id
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
          anchor.id
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
                  anchor.level ??
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
