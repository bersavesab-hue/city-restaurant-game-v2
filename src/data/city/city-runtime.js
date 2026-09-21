import { DISTRICTS } from "./districts.js";
import { OPPORTUNITIES } from "./opportunities.js";
import { METRICS } from "./metrics.js";

function getDistrict(id = "cbd") {
  return DISTRICTS.find((item) => item.id === id) || DISTRICTS[0];
}

function getCityViewModel(selectedId = "cbd") {
  const district = getDistrict(selectedId);

  return Object.freeze({
    district,
    metrics: METRICS[district.id] || [],
    opportunities: OPPORTUNITIES.slice(0, 3),
    updatedAt: Date.now()
  });
}

export {
  getDistrict,
  getCityViewModel
};
