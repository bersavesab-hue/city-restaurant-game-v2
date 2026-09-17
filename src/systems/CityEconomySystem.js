import { gameState } from "../core/GameState.js";
import { districtSystem } from "./DistrictSystem.js";
import { economicBaselineSystem } from "./EconomicBaselineSystem.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function seasonalWave(day, phase = 0) {
  const yearDay = ((Math.max(1, day) - 1) % 360) / 360;
  return Math.sin((yearDay + phase) * Math.PI * 2);
}

class CityEconomySystem {
  getState(districtId = null) {
    const time = gameState.getSection("time") ?? { day: 1 };
    const day = time.day ?? 1;
    const district = districtId ? districtSystem.get(districtId) : null;
    const snapshot = economicBaselineSystem.getSnapshot();

    const foodSeason = 1 + seasonalWave(day, 0.08) * 0.045;
    const energySeason = 1 + Math.abs(seasonalWave(day, 0.25)) * 0.035;
    const tourismSeason = district?.zoneType === "tourist_scenic" || district?.zoneType === "suburban_resort"
      ? 1 + seasonalWave(day, 0.18) * 0.16
      : 1;

    const districtDemand = clamp(
      0.82 + (district?.spendingPower ?? 50) / 280 + (district?.trafficIndex ?? 50) / 500,
      0.75,
      1.35
    );

    const competitionPressure = clamp(
      0.88 + (district?.competition ?? 50) / 420,
      0.88,
      1.15
    );

    return {
      day,
      districtId: district?.id ?? null,
      foodPriceIndex: (snapshot.macro.foodPriceIndex ?? 1) * foodSeason,
      energyIndex: (snapshot.macro.energyIndex ?? 1) * energySeason,
      wageIndex: snapshot.macro.wageIndex ?? 1,
      commercialRentIndex: snapshot.macro.commercialRentIndex ?? 1,
      logisticsIndex: snapshot.macro.logisticsIndex ?? 1,
      districtDemand,
      competitionPressure,
      tourismSeason,
      seasonality: district?.seasonality ?? 1
    };
  }

  getDemandMultiplier(districtId) {
    const state = this.getState(districtId);

    return clamp(
      state.districtDemand *
        state.tourismSeason *
        state.seasonality /
        state.competitionPressure,
      0.45,
      1.8
    );
  }
}

export const cityEconomySystem = new CityEconomySystem();
export { CityEconomySystem };
