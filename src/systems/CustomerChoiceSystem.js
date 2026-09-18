import { randomSystem } from "../core/RandomSystem.js";
import { customerSegmentSystem } from "./CustomerSegmentSystem.js";
import { dishCatalogSystem } from "./DishCatalogSystem.js";
import { menuSystem } from "./MenuSystem.js";

function clamp(value, min, max) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

class CustomerChoiceSystem {
  getCategoryPreference(
    segment,
    category
  ) {
    return (
      segment.categoryPreferences?.[
        category
      ] ??
      segment.categoryPreferences
        ?.default ??
      1
    );
  }

  getTastePreference(
    segment,
    dish
  ) {
    const preferences =
      segment.tastePreferences ??
      {};

    const tags =
      dish.tags ??
      [];

    let best = 1;

    for (
      const tag
      of tags
    ) {
      const weight =
        preferences[tag];

      if (
        Number.isFinite(
          weight
        )
      ) {
        best =
          Math.max(
            best,
            weight
          );
      }
    }

    return best;
  }

  getPriceFactor(
    segment,
    menuItem,
    dish
  ) {
    const priceRatio =
      menuItem.price /
      dish.basePrice;

    const markup =
      Math.max(
        0,
        priceRatio - 1
      );

    const discount =
      Math.max(
        0,
        1 - priceRatio
      );

    return clamp(
      1 -
      markup *
        (
          segment.priceSensitivity /
          100
        ) *
        1.1 +
      discount *
        (
          segment.priceSensitivity /
          100
        ) *
        0.35 +
      (
        segment.spendingPower -
        50
      ) /
        250,
      0.05,
      1.5
    );
  }

  scoreMenuItem(
    segmentId,
    menuItem
  ) {
    const segment =
      customerSegmentSystem.get(
        segmentId
      );

    const dish =
      dishCatalogSystem.get(
        menuItem.dishId
      );

    if (
      !segment ||
      !dish
    ) {
      return 0;
    }

    const categoryFactor =
      this.getCategoryPreference(
        segment,
        dish.category
      );

    const priceFactor =
      this.getPriceFactor(
        segment,
        menuItem,
        dish
      );

    const tasteFactor =
      this.getTastePreference(
        segment,
        dish
      );

    return Math.max(
      0,
      categoryFactor *
      tasteFactor *
      priceFactor
    );
  }

  rankMenu(
    restaurantId,
    segmentId
  ) {
    const menu =
      menuSystem.listByRestaurant(
        restaurantId,
        {
          activeOnly: true
        }
      );

    return menu
      .map(
        item => ({
          item,
          score:
            this.scoreMenuItem(
              segmentId,
              item
            )
        })
      )
      .sort(
        (a, b) =>
          b.score - a.score
      );
  }

  chooseMenuItem(
    restaurantId,
    segmentId
  ) {
    const ranked =
      this.rankMenu(
        restaurantId,
        segmentId
      )
      .filter(
        item =>
          item.score > 0
      );

    if (
      ranked.length === 0
    ) {
      return null;
    }

    return randomSystem.weightedPick(
      ranked.map(
        entry => ({
          value: entry.item,
          weight: entry.score
        })
      )
    );
  }
}

export const customerChoiceSystem =
  new CustomerChoiceSystem();

export {
  CustomerChoiceSystem
};
