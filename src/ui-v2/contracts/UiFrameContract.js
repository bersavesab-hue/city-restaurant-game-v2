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

    hudWeather:
      Object.freeze({
        width: 28,
        height: 28
      }),

    hudSpeedAction:
      Object.freeze({
        width: 34,
        height: 34
      }),

    hudResourceAction:
      Object.freeze({
        width: 28,
        height: 28
      }),

    hudIcon:
      Object.freeze({
        width: 24,
        height: 24
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
        width: 176,
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

    detailHandle:
      Object.freeze({
        width: 48,
        height: 4
      }),

    detailClose:
      Object.freeze({
        width: 28,
        height: 28
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
        width: 42,
        height: 42
      })
  });

const UI_PLACEMENTS =
  Object.freeze({
    hud:
      Object.freeze({
        identity:
          Object.freeze({
            x: 12,
            y: 14,
            width: 205,
            height: 75
          }),

        simulation:
          Object.freeze({
            x: 225,
            y: 14,
            width: 300,
            height: 75
          }),

        resources:
          Object.freeze({
            x: 533,
            y: 14,
            width: 146,
            height: 75
          })
      }),

    hero:
      Object.freeze({
        icon:
          Object.freeze({
            x: 20,
            y: 35
          }),

        copy:
          Object.freeze({
            x: 73,
            y: 26,
            width: 370,
            height: 78
          }),

        summary:
          Object.freeze({
            x: 461,
            y: 35,
            width: 218,
            height: 79
          })
      }),

    filters:
      Object.freeze({
        x: 12,
        y: 5,
        width: 667,
        height: 48,
        gap: 4
      }),

    map:
      Object.freeze({
        markers:
          Object.freeze({
            university:
              Object.freeze({
                x: 366,
                y: 172
              }),

            cbd:
              Object.freeze({
                x: 269,
                y: 308
              }),

            nightlife:
              Object.freeze({
                x: 580,
                y: 329
              }),

            oldTown:
              Object.freeze({
                x: 124,
                y: 473
              }),

            waterfront:
              Object.freeze({
                x: 518,
                y: 501
              })
          }),

        controls:
          Object.freeze({
            x: 625,
            y: 507,
            width: 54,
            height: 180,
            gap: 9
          })
      }),

    detail:
      Object.freeze({
        handle:
          Object.freeze({
            x: 321,
            y: 7,
            width: 48,
            height: 4
          }),

        close:
          Object.freeze({
            x: 648,
            y: 9,
            width: 28,
            height: 28
          }),

        thumbnail:
          Object.freeze({
            x: 20,
            y: 22,
            width: 110,
            height: 90
          }),

        copy:
          Object.freeze({
            x: 145,
            y: 23,
            width: 314,
            height: 86
          }),

        primaryAction:
          Object.freeze({
            x: 479,
            y: 31,
            width: 184,
            height: 68
          }),

        metrics:
          Object.freeze({
            x: 18,
            y: 119,
            width: 655,
            height: 112,
            gap: 4
          }),

        opportunityHeader:
          Object.freeze({
            x: 18,
            y: 242,
            width: 655,
            height: 34
          }),

        opportunities:
          Object.freeze({
            x: 18,
            y: 284,
            width: 655,
            height: 86,
            gap: 8
          })
      }),

    navigation:
      Object.freeze({
        iconY: 18,
        labelY: 78,
        activeInsetX: 17,
        activeInsetY: 10,
        activeWidth: 104,
        activeHeight: 110
      })
  });

const UI_TEXT_SLOTS =
  Object.freeze({
    hudIdentityTitle:
      Object.freeze({
        x: 86,
        y: 27,
        width: 126,
        height: 25
      }),

    hudIdentitySubtitle:
      Object.freeze({
        x: 86,
        y: 56,
        width: 126,
        height: 18
      }),

    heroTitle:
      Object.freeze({
        x: 73,
        y: 26,
        width: 370,
        height: 42
      }),

    heroSubtitle:
      Object.freeze({
        x: 73,
        y: 77,
        width: 370,
        height: 24
      }),

    detailTitle:
      Object.freeze({
        x: 145,
        y: 23,
        width: 314,
        height: 31
      }),

    detailBody:
      Object.freeze({
        x: 145,
        y: 60,
        width: 314,
        height: 43
      }),

    navLabel:
      Object.freeze({
        y: 78,
        height: 26
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
            size: 18,
            weight: 800,
            lineHeight: 1.1
          }),

        hudMoney:
          Object.freeze({
            size: 17,
            weight: 800,
            lineHeight: 1
          }),

        hudLevel:
          Object.freeze({
            size: 16,
            weight: 800,
            lineHeight: 1
          }),

        hudSecondary:
          Object.freeze({
            size: 12,
            weight: 600,
            lineHeight: 1.2
          }),

        hudTime:
          Object.freeze({
            size: 25,
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
            size: 17,
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
            size: 13,
            weight: 700,
            lineHeight: 1.1
          }),

        metricValue:
          Object.freeze({
            size: 17,
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
            size: 13,
            weight: 800,
            lineHeight: 1.1
          }),

        opportunityBody:
          Object.freeze({
            size: 11,
            weight: 600,
            lineHeight: 1.25
          }),

        navigation:
          Object.freeze({
            size: 20,
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
  UI_PLACEMENTS,
  UI_TEXT_SLOTS,
  UI_TYPOGRAPHY,
  PRIMARY_NAV_ITEMS
};
