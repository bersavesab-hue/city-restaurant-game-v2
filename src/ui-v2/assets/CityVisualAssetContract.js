const CITY_VISUAL_ASSET_CONTRACT =
  Object.freeze({
    cityMapMaster:
      Object.freeze({
        id: "city-map-master",
        targetPath:
          "assets/ui-v2/city/city-map-master.webp",
        fit: "cover",
        status: "approved"
      }),

    sharedIcons:
      Object.freeze({
        directory:
          "assets/ui-v2/icons/shared",
        files:
          Object.freeze([
            "hud-store.svg",
            "money.svg",
            "plus.svg",
            "crown.svg",
            "star.svg",
            "weather-sunny.svg",
            "pause.svg",
            "play.svg",
            "chevron-down.svg"
          ])
      }),

    navigationIcons:
      Object.freeze({
        directory:
          "assets/ui-v2/icons/nav",
        files:
          Object.freeze([
            "city.svg",
            "store.svg",
            "operations.svg",
            "employees.svg",
            "more.svg"
          ])
      }),

    mapIcons:
      Object.freeze({
        directory:
          "assets/ui-v2/icons/map",
        files:
          Object.freeze([
            "plus.svg",
            "minus.svg",
            "locate.svg",
            "building.svg",
            "university.svg",
            "nightlife.svg",
            "shop.svg",
            "lock.svg",
            "waterfront.svg"
          ])
      }),

    metricIcons:
      Object.freeze({
        directory:
          "assets/ui-v2/icons/metric",
        files:
          Object.freeze([
            "traffic.svg",
            "spending.svg",
            "rent.svg",
            "competition.svg",
            "delivery.svg",
            "properties.svg"
          ])
      }),

    actionIcons:
      Object.freeze({
        directory:
          "assets/ui-v2/icons/action",
        files:
          Object.freeze([
            "search.svg",
            "opportunity.svg",
            "chevron-right.svg"
          ])
      }),

    regionOutlines:
      Object.freeze({
        directory:
          "assets/ui-v2/icons/regions",
        files:
          Object.freeze([
            "core.svg",
            "campus.svg",
            "nightlife.svg",
            "lifestyle.svg"
          ])
      })
  });

const CITY_VISUAL_SLOT_POLICY =
  Object.freeze({
    dynamicText:
      Object.freeze([
        "district-name",
        "district-count",
        "money",
        "level",
        "rating",
        "traffic",
        "spending",
        "rent",
        "competition",
        "delivery-demand",
        "available-properties",
        "opportunity-copy"
      ]),

    imageOnly:
      Object.freeze([
        "background",
        "icon",
        "region-outline",
        "thumbnail"
      ]),

    spriteAtlas:
      false
  });

export {
  CITY_VISUAL_ASSET_CONTRACT,
  CITY_VISUAL_SLOT_POLICY
};
