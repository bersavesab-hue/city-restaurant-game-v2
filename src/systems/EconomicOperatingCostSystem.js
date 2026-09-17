import { simulationSystem } from "../core/SimulationSystem.js";
import { entitySystem } from "../core/EntitySystem.js";
import { financeSystem, FINANCE_CATEGORY } from "./FinanceSystem.js";
import { restaurantSystem } from "./RestaurantSystem.js";
import { operatingScheduleSystem } from "./OperatingScheduleSystem.js";
import { renovationSystem } from "./RenovationSystem.js";
import { propertySystem } from "./PropertySystem.js";
import { venueTypeSystem } from "./VenueTypeSystem.js";
import { economicBaselineSystem } from "./EconomicBaselineSystem.js";
import { cityEconomySystem } from "./CityEconomySystem.js";

function countOrders(restaurantId, day) {
  return entitySystem
    .list("customer_order")
    .filter((order) => order.restaurantId === restaurantId && order.day === day)
    .reduce((sum, order) => sum + (order.orderCount ?? 1), 0);
}

class EconomicOperatingCostSystem {
  constructor() {
    this.registered = false;
  }

  findSettlement(restaurantId, day) {
    return entitySystem
      .list("operating_cost_settlement")
      .find((item) => item.restaurantId === restaurantId && item.day === day);
  }

  estimateDailyCost(restaurantId, day) {
    const restaurant = restaurantSystem.get(restaurantId);
    const schedule = operatingScheduleSystem.get(restaurantId);
    const renovation = renovationSystem.getSummary(restaurantId);
    const seats = renovation.modifiers?.seats ?? 0;
    const kitchenStations = renovation.modifiers?.kitchenStations ?? 0;
    const openHours = schedule?.enabled
      ? Math.max(0, schedule.closeHour - schedule.openHour)
      : 0;
    const orders = countOrders(restaurantId, day);

    let venue = null;
    let districtId = null;
    if (restaurant.locationId) {
      try {
        const property = propertySystem.get(restaurant.locationId);
        venue = venueTypeSystem.get(property.venueTypeId ?? "street_shop");
        districtId = property.districtId;
      } catch {
        venue = null;
      }
    }

    const baseline = economicBaselineSystem.getSnapshot();
    const economy = cityEconomySystem.getState(districtId);
    const maintenanceMultiplier = venue?.maintenanceMultiplier ?? 1;

    const electricityKwh =
      openHours * (1.6 + kitchenStations * 2.4 + seats * 0.045) + orders * 0.06;
    const waterTon =
      openHours * 0.045 + orders * 0.012 + seats * 0.002;
    const gasCubicMeter =
      kitchenStations > 0 ? openHours * kitchenStations * 0.22 + orders * 0.035 : 0;

    const electricity = electricityKwh * baseline.utilitiesReference.electricityPerKwh * economy.energyIndex;
    const water = waterTon * baseline.utilitiesReference.waterPerTon;
    const gas = gasCubicMeter * baseline.utilitiesReference.gasPerCubicMeter * economy.energyIndex;
    const waste = baseline.utilitiesReference.wasteDisposalMonthlyBase / 30 * maintenanceMultiplier;
    const internet = baseline.utilitiesReference.internetMonthlyBase / 30;

    const total = Math.max(
      1,
      Math.round((electricity + water + gas + waste + internet) * maintenanceMultiplier)
    );

    return {
      restaurantId,
      day,
      venueTypeId: venue?.id ?? "street_shop",
      orders,
      openHours,
      seats,
      kitchenStations,
      usage: {
        electricityKwh: Number(electricityKwh.toFixed(2)),
        waterTon: Number(waterTon.toFixed(3)),
        gasCubicMeter: Number(gasCubicMeter.toFixed(2))
      },
      breakdown: {
        electricity: Math.round(electricity),
        water: Math.round(water),
        gas: Math.round(gas),
        waste: Math.round(waste),
        internet: Math.round(internet)
      },
      total
    };
  }

  settleDay(restaurantId, day) {
    const existing = this.findSettlement(restaurantId, day);
    if (existing) return existing;

    const estimate = this.estimateDailyCost(restaurantId, day);
    const balance = financeSystem.getBalance(restaurantId);
    let paid = 0;
    let unpaid = 0;
    let transactionId = null;

    if (balance >= estimate.total) {
      const result = financeSystem.expense(
        restaurantId,
        estimate.total,
        FINANCE_CATEGORY.UTILITIES,
        `第${day}日水电燃气及基础运营费用`
      );
      paid = estimate.total;
      transactionId = result.transaction.id;
    } else {
      unpaid = estimate.total;
      entitySystem.create("operating_cost_arrear", {
        restaurantId,
        day,
        amount: estimate.total,
        status: "unpaid"
      });
    }

    return entitySystem.create("operating_cost_settlement", {
      ...estimate,
      paid,
      unpaid,
      transactionId
    });
  }

  register() {
    if (this.registered) return false;

    simulationSystem.register(
      "economic_operating_costs",
      {
        onDay: ({ current }) => {
          const targetDay = Math.max(1, current.day - 1);
          const restaurants = entitySystem.list("restaurant");
          for (const restaurant of restaurants) {
            this.settleDay(restaurant.id, targetDay);
          }
        }
      },
      { priority: 90 }
    );

    this.registered = true;
    return true;
  }
}

export const economicOperatingCostSystem = new EconomicOperatingCostSystem();
export { EconomicOperatingCostSystem };
