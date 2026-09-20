const SHARED_VISUAL_RESOURCES =
  Object.freeze([
    Object.freeze({
      id: "hud-store-avatar",
      scope: "shared",
      type: "dynamic-image-slot",
      textInImage: false
    }),
    Object.freeze({
      id: "hud-scope-chevron",
      scope: "shared",
      type: "icon",
      textInImage: false
    }),
    Object.freeze({
      id: "hud-weather-set",
      scope: "shared",
      type: "icon-set",
      requiredStates:
        Object.freeze([
          "sunny",
          "cloudy",
          "rain",
          "snow",
          "storm",
          "fog"
        ]),
      textInImage: false
    }),
    Object.freeze({
      id: "hud-time-controls",
      scope: "shared",
      type: "icon-set",
      requiredStates:
        Object.freeze([
          "pause",
          "play"
        ]),
      textInImage: false
    }),
    Object.freeze({
      id: "hud-money",
      scope: "shared",
      type: "icon",
      textInImage: false
    }),
    Object.freeze({
      id: "hud-plus",
      scope: "shared",
      type: "icon",
      textInImage: false
    }),
    Object.freeze({
      id: "hud-level",
      scope: "shared",
      type: "icon",
      textInImage: false
    }),
    Object.freeze({
      id: "hud-rating",
      scope: "shared",
      type: "icon",
      textInImage: false
    }),
    Object.freeze({
      id: "primary-nav-icons",
      scope: "shared",
      type: "icon-set",
      requiredStates:
        Object.freeze([
          "city",
          "store",
          "operations",
          "employees",
          "more"
        ]),
      textInImage: false
    })
  ]);

const PRIMARY_PAGE_VISUAL_RESOURCES =
  Object.freeze({
    city:
      Object.freeze([
        Object.freeze({
          id: "city-map-master",
          type: "master-art",
          count: 1,
          textInImage: false
        }),
        Object.freeze({
          id: "city-district-thumbnails",
          type: "dynamic-image-set",
          source: "district-data",
          minimumCount: 20,
          textInImage: false
        }),
        Object.freeze({
          id: "city-map-control-icons",
          type: "icon-set",
          requiredStates:
            Object.freeze([
              "zoom-in",
              "zoom-out",
              "locate"
            ]),
          textInImage: false
        }),
        Object.freeze({
          id: "city-metric-icons",
          type: "icon-set",
          requiredStates:
            Object.freeze([
              "traffic",
              "spending",
              "rent",
              "competition",
              "delivery",
              "properties"
            ]),
          textInImage: false
        })
      ]),

    store:
      Object.freeze([
        Object.freeze({
          id: "store-hero",
          type: "hero-art",
          count: 1,
          textInImage: false
        }),
        Object.freeze({
          id: "store-facade-pool",
          type: "dynamic-image-pool",
          minimumCount: 12,
          textInImage: false
        }),
        Object.freeze({
          id: "store-management-icons",
          type: "icon-set",
          requiredStates:
            Object.freeze([
              "renovation",
              "facilities",
              "lease",
              "opening"
            ]),
          textInImage: false
        })
      ]),

    operations:
      Object.freeze([
        Object.freeze({
          id: "operations-hero",
          type: "hero-art",
          count: 1,
          textInImage: false
        }),
        Object.freeze({
          id: "operations-module-covers",
          type: "cover-set",
          requiredStates:
            Object.freeze([
              "menu",
              "supply",
              "finance",
              "customers",
              "marketing",
              "analytics"
            ]),
          textInImage: false
        }),
        Object.freeze({
          id: "operations-secondary-icons",
          type: "icon-set",
          requiredStates:
            Object.freeze([
              "ranking",
              "dish-research"
            ]),
          textInImage: false
        })
      ]),

    employees:
      Object.freeze([
        Object.freeze({
          id: "employees-hero",
          type: "hero-art",
          count: 1,
          textInImage: false
        }),
        Object.freeze({
          id: "employees-action-icons",
          type: "icon-set",
          requiredStates:
            Object.freeze([
              "recruitment",
              "scheduling",
              "training",
              "promotion"
            ]),
          textInImage: false
        }),
        Object.freeze({
          id: "employee-avatar-pool",
          type: "dynamic-image-pool",
          minimumCount: 40,
          textInImage: false
        })
      ]),

    more:
      Object.freeze([
        Object.freeze({
          id: "more-hero",
          type: "hero-art",
          count: 1,
          textInImage: false
        }),
        Object.freeze({
          id: "more-brand-icons",
          type: "icon-set",
          requiredStates:
            Object.freeze([
              "chain",
              "brand",
              "ranking",
              "honors"
            ]),
          textInImage: false
        }),
        Object.freeze({
          id: "more-customer-safety-icons",
          type: "icon-set",
          requiredStates:
            Object.freeze([
              "membership",
              "reviews",
              "compliance"
            ]),
          textInImage: false
        }),
        Object.freeze({
          id: "more-service-icons",
          type: "icon-set",
          requiredStates:
            Object.freeze([
              "settings",
              "saves",
              "help"
            ]),
          textInImage: false
        }),
        Object.freeze({
          id: "more-brand-banner",
          type: "banner-art",
          count: 1,
          textInImage: false
        })
      ])
  });

function collectVisualResourceIds() {
  return [
    ...SHARED_VISUAL_RESOURCES,
    ...Object.values(
      PRIMARY_PAGE_VISUAL_RESOURCES
    ).flat()
  ]
    .map(
      item =>
        item.id
    );
}

export {
  SHARED_VISUAL_RESOURCES,
  PRIMARY_PAGE_VISUAL_RESOURCES,
  collectVisualResourceIds
};
