const CITY_MAP_V3_CONFIG = Object.freeze({
  version: "city-map-v3",
  layout: Object.freeze({
    topHud: true,
    mapArea: true,
    detailPanel: true,
    bottomNav: true
  }),
  staticLayers: Object.freeze([
    "city-map-master",
    "district-tags",
    "map-controls",
    "navigation-shell",
    "metric-icons"
  ]),
  dynamicLayers: Object.freeze([
    "opened-stores",
    "available-properties",
    "high-potential-events",
    "district-metrics",
    "daily-opportunities"
  ]),
  rules: Object.freeze({
    keepLabelIntegrity: true,
    allowResize: true,
    allowCrop: false,
    separateStaticAndDynamic: true
  })
});

export {
  CITY_MAP_V3_CONFIG
};
