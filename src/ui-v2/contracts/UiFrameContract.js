const UI_REFERENCE =
  Object.freeze({
    width: 691,
    height: 1536
  });

const UI_REGIONS =
  Object.freeze({
    hud:
      Object.freeze({
        y: 0,
        height: 103
      }),

    hero:
      Object.freeze({
        y: 103,
        height: 128
      }),

    filters:
      Object.freeze({
        y: 231,
        height: 58
      }),

    map:
      Object.freeze({
        y: 289,
        height: 716
      }),

    detail:
      Object.freeze({
        y: 1005,
        height: 394
      }),

    navigation:
      Object.freeze({
        y: 1399,
        height: 137
      })
  });

const UI_BOXES =
  Object.freeze({
    hudAvatar:
      Object.freeze({
        width: 68,
        height: 68
      }),

    hudAction:
      Object.freeze({
        width: 40,
        height: 40
      }),

    hudIcon:
      Object.freeze({
        width: 28,
        height: 28
      }),

    heroIcon:
      Object.freeze({
        width: 42,
        height: 42
      }),

    heroSummary:
      Object.freeze({
        width: 218,
        height: 79
      }),

    filter:
      Object.freeze({
        width: 129,
        height: 48
      }),

    filterIcon:
      Object.freeze({
        width: 16,
        height: 16
      }),

    mapMarker:
      Object.freeze({
        width: 160,
        height: 60
      }),

    mapMarkerIcon:
      Object.freeze({
        width: 38,
        height: 38
      }),

    mapControl:
      Object.freeze({
        width: 54,
        height: 54
      }),

    detailThumbnail:
      Object.freeze({
        width: 110,
        height: 90
      }),

    primaryAction:
      Object.freeze({
        width: 184,
        height: 68
      }),

    metric:
      Object.freeze({
        width: 105,
        height: 112
      }),

    metricIcon:
      Object.freeze({
        width: 38,
        height: 38
      }),

    opportunity:
      Object.freeze({
        width: 212,
        height: 86
      }),

    opportunityThumbnail:
      Object.freeze({
        width: 60,
        height: 60
      }),

    navigationCell:
      Object.freeze({
        width: 138,
        height: 137
      }),

    navigationIcon:
      Object.freeze({
        width: 44,
        height: 44
      })
  });

const UI_TYPOGRAPHY =
  Object.freeze({
    family:
      Object.freeze([
        "Noto Sans SC",
        "PingFang SC",
        "Microsoft YaHei",
        "system-ui",
        "sans-serif"
      ]),

    weights:
      Object.freeze([
        500,
        600,
        700,
        800,
        900
      ]),

    roles:
      Object.freeze({
        hudPrimary:
          Object.freeze({
            size: 22,
            weight: 800,
            lineHeight: 1.1
          }),

        hudSecondary:
          Object.freeze({
            size: 14,
            weight: 600,
            lineHeight: 1.2
          }),

        hudTime:
          Object.freeze({
            size: 28,
            weight: 900,
            lineHeight: 1
          }),

        pageTitle:
          Object.freeze({
            size: 38,
            weight: 900,
            lineHeight: 1.05
          }),

        pageSubtitle:
          Object.freeze({
            size: 16,
            weight: 600,
            lineHeight: 1.3
          }),

        filter:
          Object.freeze({
            size: 16,
            weight: 800,
            lineHeight: 1.1
          }),

        markerTitle:
          Object.freeze({
            size: 18,
            weight: 900,
            lineHeight: 1.05
          }),

        markerMeta:
          Object.freeze({
            size: 14,
            weight: 700,
            lineHeight: 1.1
          }),

        detailTitle:
          Object.freeze({
            size: 24,
            weight: 900,
            lineHeight: 1.08
          }),

        detailBody:
          Object.freeze({
            size: 14,
            weight: 600,
            lineHeight: 1.35
          }),

        detailButton:
          Object.freeze({
            size: 18,
            weight: 900,
            lineHeight: 1
          }),

        metricLabel:
          Object.freeze({
            size: 14,
            weight: 700,
            lineHeight: 1.1
          }),

        metricValue:
          Object.freeze({
            size: 18,
            weight: 900,
            lineHeight: 1.05
          }),

        sectionTitle:
          Object.freeze({
            size: 20,
            weight: 900,
            lineHeight: 1.08
          }),

        opportunityTitle:
          Object.freeze({
            size: 14,
            weight: 800,
            lineHeight: 1.1
          }),

        opportunityBody:
          Object.freeze({
            size: 12,
            weight: 600,
            lineHeight: 1.25
          }),

        navigation:
          Object.freeze({
            size: 22,
            weight: 800,
            lineHeight: 1
          })
      })
  });

const PRIMARY_NAV_ITEMS =
  Object.freeze([
    Object.freeze({
      id: "city",
      label: "城市"
    }),

    Object.freeze({
      id: "store",
      label: "门店"
    }),

    Object.freeze({
      id: "operations",
      label: "经营"
    }),

    Object.freeze({
      id: "employees",
      label: "员工"
    }),

    Object.freeze({
      id: "more",
      label: "更多"
    })
  ]);

export {
  UI_REFERENCE,
  UI_REGIONS,
  UI_BOXES,
  UI_TYPOGRAPHY,
  PRIMARY_NAV_ITEMS
};
