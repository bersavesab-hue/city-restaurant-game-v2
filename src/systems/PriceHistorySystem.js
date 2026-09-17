import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

class PriceHistorySystem {
  recordMenuPrice({ restaurantId, menuItemId, dishId, previousPrice, nextPrice }) {
    if (!restaurantId || !menuItemId || !dishId) {
      throw new Error("Price history requires restaurant, menu item and dish");
    }

    if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
      throw new RangeError("nextPrice must be positive");
    }

    const time = gameState.getSection("time");
    const previous = Number(previousPrice) || nextPrice;
    const ratio = nextPrice / Math.max(1, previous);

    return entitySystem.create("menu_price_history", {
      restaurantId,
      menuItemId,
      dishId,
      previousPrice: previous,
      nextPrice,
      priceRatio: ratio,
      changeRate: ratio - 1,
      day: time?.day ?? 1,
      totalMinutes: time?.totalMinutes ?? 0
    });
  }

  listRecent(restaurantId, days = 7) {
    const time = gameState.getSection("time");
    const currentDay = time?.day ?? 1;
    const fromDay = Math.max(1, currentDay - days + 1);

    return entitySystem
      .list("menu_price_history")
      .filter((item) => item.restaurantId === restaurantId && item.day >= fromDay)
      .sort((a, b) => a.totalMinutes - b.totalMinutes);
  }

  getShockMultiplier(restaurantId, segment, days = 7) {
    const history = this.listRecent(restaurantId, days);
    if (history.length === 0) {
      return 1;
    }

    const sensitivity = clamp((segment?.priceSensitivity ?? 50) / 100, 0, 1);
    let shock = 0;

    for (const item of history) {
      const increase = Math.max(0, item.changeRate);
      const decrease = Math.max(0, -item.changeRate);
      shock += increase * sensitivity * 0.42;
      shock -= decrease * sensitivity * 0.08;
    }

    return clamp(1 - shock, 0.72, 1.08);
  }
}

export const priceHistorySystem = new PriceHistorySystem();
export { PriceHistorySystem };
