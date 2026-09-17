import { districtSystem } from "./DistrictSystem.js";
import { CITY_DISTRICTS } from "../data/cityDistricts.js";

class DistrictBootstrapSystem {
  ensureLoaded({ overwrite = false } = {}) {
    const existing = districtSystem.getAll();

    if (existing.length === 0 || overwrite) {
      districtSystem.load(CITY_DISTRICTS, { overwrite: true });
    }

    return districtSystem.getAll();
  }
}

export const districtBootstrapSystem = new DistrictBootstrapSystem();
export { DistrictBootstrapSystem };
