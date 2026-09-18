import { districtSystem } from "./DistrictSystem.js";
import { CITY_DISTRICTS } from "../data/cityDistricts.js";

class DistrictBootstrapSystem {
  ensureLoaded({
    overwrite = false
  } = {}) {
    if (!overwrite) {
      const complete =
        CITY_DISTRICTS.every(
          district =>
            districtSystem.exists(
              district.id
            )
        );

      if (complete) {
        return districtSystem.getAll();
      }
    }

    districtSystem.load(
      CITY_DISTRICTS,
      {
        overwrite: true
      }
    );

    return districtSystem.getAll();
  }
}

export const districtBootstrapSystem = new DistrictBootstrapSystem();
export { DistrictBootstrapSystem };
