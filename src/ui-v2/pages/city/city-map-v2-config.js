// V2 城市地图页配置层
// 静态UI框架与动态经营数据分离

const CITY_MAP_DYNAMIC_KEYS = Object.freeze({
  hud: [
    'currentTime',
    'money',
    'level',
    'rating'
  ],
  filters: [
    'allCount',
    'openedCount',
    'availableCount',
    'highPotentialCount',
    'lockedCount'
  ],
  districts: [
    'districtCount',
    'traffic',
    'consumption',
    'rent',
    'competition',
    'deliveryDemand',
    'availableHouse'
  ],
  opportunities: [
    'dailyOpportunities'
  ]
});

const CITY_MAP_STATIC_REGIONS = Object.freeze([
  'top-hud',
  'title-banner',
  'filter-container',
  'map-controls',
  'district-card-layout',
  'bottom-navigation'
]);

const DEFAULT_CITY_MAP_DATA = Object.freeze({
  currentTime: '11:30',
  money: 52800,
  level: 3,
  rating: 4.8,
  districts: []
});

export {
  CITY_MAP_DYNAMIC_KEYS,
  CITY_MAP_STATIC_REGIONS,
  DEFAULT_CITY_MAP_DATA
};
