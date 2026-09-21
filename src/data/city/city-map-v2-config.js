const CITY_MAP_V2_CONFIG = Object.freeze({
  staticRegions: Object.freeze([
    "hud",
    "title",
    "filters",
    "mapControls",
    "detailCard",
    "bottomNav"
  ]),
  dynamicRegions: Object.freeze([
    "time",
    "money",
    "level",
    "rating",
    "districtCount",
    "metrics",
    "opportunities"
  ]),
  districts: Object.freeze([
    { id: "university", name: "大学城区", count: 5 },
    { id: "cbd", name: "CBD商务区", count: 6 },
    { id: "nightlife", name: "夜生活区", count: 4 },
    { id: "old_town", name: "老城商业区", count: 4 },
    { id: "waterfront", name: "水岸休闲区", count: 5 }
  ])
});

export { CITY_MAP_V2_CONFIG };
