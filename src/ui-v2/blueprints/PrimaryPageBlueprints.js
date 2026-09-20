const PRIMARY_PAGE_IDS =
  Object.freeze([
    "city",
    "store",
    "operations",
    "employees",
    "more"
  ]);

const PRIMARY_PAGE_BLUEPRINTS =
  Object.freeze({
    city:
      Object.freeze({
        id: "city",
        label: "城市",
        visualMode: "map-dominant",
        pageTitle: "城市地图",
        subtitle:
          "发现优质商圈，拓展门店版图，让美食走进更多地方",
        sections:
          Object.freeze([
            Object.freeze({
              id: "city-map-header",
              component: "section-header",
              priority: 1,
              scroll: "fixed-with-map"
            }),
            Object.freeze({
              id: "city-map-filters",
              component: "map-filter-bar",
              priority: 1,
              scroll: "fixed-with-map"
            }),
            Object.freeze({
              id: "city-map",
              component: "map-viewport",
              priority: 1,
              scroll: "interactive"
            }),
            Object.freeze({
              id: "city-district-detail",
              component: "detail-sheet",
              priority: 1,
              scroll: "sheet-content"
            })
          ]),
        compact:
          Object.freeze({
            mapMinimumVisibleRatio: 0.42,
            detailMode: "bottom-sheet",
            opportunitiesColumns: 3
          }),
        medium:
          Object.freeze({
            mapMinimumVisibleRatio: 0.48,
            detailMode: "bottom-sheet",
            opportunitiesColumns: 3
          }),
        expanded:
          Object.freeze({
            mapMinimumVisibleRatio: 0.58,
            detailMode: "side-panel",
            opportunitiesColumns: 2
          })
      }),

    store:
      Object.freeze({
        id: "store",
        label: "门店",
        visualMode: "hero-management",
        pageTitle: "门店管理",
        subtitle:
          "多店经营 · 扩大规模 · 打造人气餐饮品牌",
        sections:
          Object.freeze([
            Object.freeze({
              id: "store-hero",
              component: "page-hero",
              priority: 1
            }),
            Object.freeze({
              id: "store-group-kpis",
              component: "kpi-strip",
              priority: 1,
              items: 4
            }),
            Object.freeze({
              id: "store-portfolio",
              component: "entity-carousel",
              priority: 1
            }),
            Object.freeze({
              id: "store-tasks",
              component: "task-row",
              priority: 1,
              maximumPreviewItems: 3
            }),
            Object.freeze({
              id: "store-tools",
              component: "action-card",
              priority: 2,
              items: 4
            })
          ]),
        compact:
          Object.freeze({
            kpiColumns: 2,
            portfolioMode: "horizontal-carousel",
            toolsColumns: 2
          }),
        medium:
          Object.freeze({
            kpiColumns: 4,
            portfolioMode: "horizontal-carousel",
            toolsColumns: 4
          }),
        expanded:
          Object.freeze({
            kpiColumns: 4,
            portfolioMode: "grid",
            toolsColumns: 4
          })
      }),

    operations:
      Object.freeze({
        id: "operations",
        label: "经营",
        visualMode: "dashboard",
        pageTitle: "经营中心",
        subtitle:
          "用好每一份资源，让美食创造更多价值",
        sections:
          Object.freeze([
            Object.freeze({
              id: "operations-hero",
              component: "page-hero",
              priority: 1
            }),
            Object.freeze({
              id: "operations-kpis",
              component: "kpi-strip",
              priority: 1,
              items: 4
            }),
            Object.freeze({
              id: "operations-tasks",
              component: "task-row",
              priority: 1,
              maximumPreviewItems: 3
            }),
            Object.freeze({
              id: "operations-core-modules",
              component: "image-feature-card",
              priority: 1,
              items: 6,
              moduleIds:
                Object.freeze([
                  "menu",
                  "supply",
                  "finance",
                  "customers",
                  "marketing",
                  "analytics"
                ])
            }),
            Object.freeze({
              id: "operations-secondary",
              component: "action-card",
              priority: 2,
              items: 2,
              moduleIds:
                Object.freeze([
                  "ranking",
                  "dish-research"
                ])
            })
          ]),
        compact:
          Object.freeze({
            kpiColumns: 2,
            coreModuleColumns: 2,
            secondaryColumns: 2
          }),
        medium:
          Object.freeze({
            kpiColumns: 4,
            coreModuleColumns: 2,
            secondaryColumns: 2
          }),
        expanded:
          Object.freeze({
            kpiColumns: 4,
            coreModuleColumns: 3,
            secondaryColumns: 2
          })
      }),

    employees:
      Object.freeze({
        id: "employees",
        label: "员工",
        visualMode: "people-management",
        pageTitle: "员工管理",
        subtitle:
          "好团队 · 好服务 · 好味道",
        sections:
          Object.freeze([
            Object.freeze({
              id: "employees-hero",
              component: "page-hero",
              priority: 1
            }),
            Object.freeze({
              id: "employees-kpis",
              component: "kpi-strip",
              priority: 1,
              items: 4
            }),
            Object.freeze({
              id: "employees-actions",
              component: "action-card",
              priority: 1,
              items: 4,
              moduleIds:
                Object.freeze([
                  "recruitment",
                  "scheduling",
                  "training",
                  "promotion"
                ])
            }),
            Object.freeze({
              id: "employees-alert",
              component: "task-row",
              priority: 1,
              maximumPreviewItems: 1
            }),
            Object.freeze({
              id: "employees-list",
              component: "data-list",
              priority: 1,
              controls:
                Object.freeze([
                  "search-field",
                  "filter-tabs"
                ])
            })
          ]),
        compact:
          Object.freeze({
            kpiColumns: 2,
            actionColumns: 2,
            listMode: "dense-list"
          }),
        medium:
          Object.freeze({
            kpiColumns: 4,
            actionColumns: 4,
            listMode: "dense-list"
          }),
        expanded:
          Object.freeze({
            kpiColumns: 4,
            actionColumns: 4,
            listMode: "split-list-detail"
          })
      }),

    more:
      Object.freeze({
        id: "more",
        label: "更多",
        visualMode: "service-hub",
        pageTitle: "更多",
        subtitle:
          "用美食连接更多可能，让小馆走得更远",
        sections:
          Object.freeze([
            Object.freeze({
              id: "more-hero",
              component: "page-hero",
              priority: 1
            }),
            Object.freeze({
              id: "more-brand-growth",
              component: "action-card",
              priority: 1,
              items: 4,
              moduleIds:
                Object.freeze([
                  "chain",
                  "brand",
                  "ranking",
                  "honors"
                ])
            }),
            Object.freeze({
              id: "more-customer-safety",
              component: "action-card",
              priority: 1,
              items: 3,
              moduleIds:
                Object.freeze([
                  "membership",
                  "reviews",
                  "compliance"
                ])
            }),
            Object.freeze({
              id: "more-services",
              component: "action-card",
              priority: 2,
              items: 3,
              moduleIds:
                Object.freeze([
                  "settings",
                  "saves",
                  "help"
                ])
            }),
            Object.freeze({
              id: "more-brand-banner",
              component: "promo-banner",
              priority: 3
            })
          ]),
        compact:
          Object.freeze({
            brandColumns: 2,
            customerSafetyColumns: 3,
            servicesColumns: 3
          }),
        medium:
          Object.freeze({
            brandColumns: 2,
            customerSafetyColumns: 3,
            servicesColumns: 3
          }),
        expanded:
          Object.freeze({
            brandColumns: 4,
            customerSafetyColumns: 3,
            servicesColumns: 3
          })
      })
  });

export {
  PRIMARY_PAGE_IDS,
  PRIMARY_PAGE_BLUEPRINTS
};
