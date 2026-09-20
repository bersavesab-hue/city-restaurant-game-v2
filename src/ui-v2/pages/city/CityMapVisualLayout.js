const CITY_MAP_VISUAL_LAYOUT =
  Object.freeze({
    old_town: Object.freeze({x: 22,y: 72,theme: "green",iconKey: "shop"}),
    cbd: Object.freeze({x: 40,y: 42,theme: "yellow",iconKey: "building"}),
    university: Object.freeze({x: 58,y: 14,theme: "blue",iconKey: "university"}),
    premium_residential: Object.freeze({x: 13,y: 54,theme: "green",iconKey: "shop"}),
    residential: Object.freeze({x: 49,y: 60,theme: "blue",iconKey: "shop"}),
    transport_hub: Object.freeze({x: 82,y: 36,theme: "blue",iconKey: "building"}),
    industrial_park: Object.freeze({x: 14,y: 78,theme: "blue",iconKey: "building"}),
    nightlife: Object.freeze({x: 80,y: 45,theme: "pink",iconKey: "nightlife"}),
    tourist_scenic: Object.freeze({x: 73,y: 72,theme: "green",iconKey: "waterfront"}),
    suburban_resort: Object.freeze({x: 57,y: 86,theme: "green",iconKey: "waterfront"}),
    commercial_core: Object.freeze({x: 24,y: 62,theme: "green",iconKey: "shop"}),
    office_park: Object.freeze({x: 53,y: 25,theme: "blue",iconKey: "building"}),
    tech_park: Object.freeze({x: 81,y: 27,theme: "blue",iconKey: "building"}),
    medical_cluster: Object.freeze({x: 13,y: 39,theme: "green",iconKey: "shop"}),
    cultural_creative: Object.freeze({x: 31,y: 78,theme: "green",iconKey: "shop"}),
    convention_center: Object.freeze({x: 81,y: 65,theme: "blue",iconKey: "building"}),
    sports_entertainment: Object.freeze({x: 66,y: 54,theme: "pink",iconKey: "nightlife"}),
    wholesale_market: Object.freeze({x: 9,y: 87,theme: "green",iconKey: "shop"}),
    suburban_community: Object.freeze({x: 36,y: 88,theme: "green",iconKey: "shop"}),
    waterfront_leisure: Object.freeze({x: 73,y: 76,theme: "blue",iconKey: "waterfront"})
  });

function getCityDistrictVisual(
  districtId,
  fallback = {}
) {
  const preset =
    CITY_MAP_VISUAL_LAYOUT[
      districtId
    ];

  if (preset) {
    return preset;
  }

  return Object.freeze({
    x:
      Number(
        fallback.x
      ) ||
      50,
    y:
      Number(
        fallback.y
      ) ||
      50,
    theme:
      "blue",
    iconKey:
      "building"
  });
}

export {
  CITY_MAP_VISUAL_LAYOUT,
  getCityDistrictVisual
};
