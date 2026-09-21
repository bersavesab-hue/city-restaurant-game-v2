const UI_REFERENCE =
  Object.freeze({
    width: 864,
    height: 1536
  });

const UI_REGIONS =
  Object.freeze({
    hud:
      Object.freeze({
        y: 0,
        height: 94
      }),
    hero:
      Object.freeze({
        y: 94,
        height: 135
      }),
    filters:
      Object.freeze({
        y: 229,
        height: 66
      }),
    map:
      Object.freeze({
        y: 295,
        height: 657
      }),
    detail:
      Object.freeze({
        y: 952,
        height: 435
      }),
    navigation:
      Object.freeze({
        y: 1387,
        height: 149
      })
  });

const UI_BOXES =
  Object.freeze({
    hudAvatar:
      Object.freeze({
        width: 82,
        height: 82
      }),
    hudWeather:
      Object.freeze({
        width: 44,
        height: 44
      }),
    hudSpeedAction:
      Object.freeze({
        width: 40,
        height: 40
      }),
    hudResourceAction:
      Object.freeze({
        width: 30,
        height: 30
      }),
    hudIcon:
      Object.freeze({
        width: 33,
        height: 30
      }),
    heroIcon:
      Object.freeze({
        width: 45,
        height: 55
      }),
    heroSummary:
      Object.freeze({
        width: 277,
        height: 103
      }),
    filter:
      Object.freeze({
        width: 166,
        height: 58
      }),
    filterIcon:
      Object.freeze({
        width: 20,
        height: 20
      }),
    mapMarker:
      Object.freeze({
        width: 223,
        height: 68
      }),
    mapMarkerIcon:
      Object.freeze({
        width: 58,
        height: 58
      }),
    mapControl:
      Object.freeze({
        width: 56,
        height: 56
      }),
    detailHandle:
      Object.freeze({
        width: 60,
        height: 6
      }),
    detailClose:
      Object.freeze({
        width: 32,
        height: 32
      }),
    detailThumbnail:
      Object.freeze({
        width: 124,
        height: 104
      }),
    primaryAction:
      Object.freeze({
        width: 221,
        height: 81
      }),
    metric:
      Object.freeze({
        width: 133,
        height: 115
      }),
    metricIcon:
      Object.freeze({
        width: 46,
        height: 46
      }),
    opportunity:
      Object.freeze({
        width: 271,
        height: 102
      }),
    opportunityThumbnail:
      Object.freeze({
        width: 70,
        height: 82
      }),
    navigationCell:
      Object.freeze({
        width: 149,
        height: 137
      }),
    navigationIcon:
      Object.freeze({
        width: 52,
        height: 52
      })
  });

const UI_PLACEMENTS =
  Object.freeze({
    hud:
      Object.freeze({
        identity:
          Object.freeze({
            x: 0,
            y: 0,
            width: 289,
            height: 94
          }),
        simulation:
          Object.freeze({
            x: 289,
            y: 0,
            width: 380,
            height: 94
          }),
        resources:
          Object.freeze({
            x: 669,
            y: 0,
            width: 195,
            height: 94
          })
      }),
    hero:
      Object.freeze({
        icon:
          Object.freeze({
            x: 12,
            y: 28
          }),
        copy:
          Object.freeze({
            x: 60,
            y: 21,
            width: 518,
            height: 95
          }),
        summary:
          Object.freeze({
            x: 576,
            y: 16,
            width: 276,
            height: 103
          })
      }),
    filters:
      Object.freeze({
        x: 11,
        y: 0,
        width: 842,
        height: 66,
        gap: 5
      }),
    map:
      Object.freeze({
        markers:
          Object.freeze({
            university:
              Object.freeze({
                x: 467,
                y: 59
              }),
            cbd:
              Object.freeze({
                x: 320,
                y: 191
              }),
            nightlife:
              Object.freeze({
                x: 708,
                y: 264
              }),
            oldTown:
              Object.freeze({
                x: 233,
                y: 488
              }),
            waterfront:
              Object.freeze({
                x: 674,
                y: 455
              })
          }),
        controls:
          Object.freeze({
            x: 794,
            y: 360,
            width: 56,
            height: 192,
            gap: 12
          })
      }),
    detail:
      Object.freeze({
        handle:
          Object.freeze({
            x: 402,
            y: 8,
            width: 60,
            height: 6
          }),
        close:
          Object.freeze({
            x: 817,
            y: 10,
            width: 32,
            height: 32
          }),
        thumbnail:
          Object.freeze({
            x: 24,
            y: 28,
            width: 124,
            height: 104
          }),
        copy:
          Object.freeze({
            x: 160,
            y: 30,
            width: 438,
            height: 100
          }),
        primaryAction:
          Object.freeze({
            x: 612,
            y: 39,
            width: 221,
            height: 81
          }),
        metrics:
          Object.freeze({
            x: 17,
            y: 145,
            width: 830,
            height: 115,
            gap: 7
          }),
        opportunityHeader:
          Object.freeze({
            x: 17,
            y: 274,
            width: 830,
            height: 43
          }),
        opportunities:
          Object.freeze({
            x: 17,
            y: 322,
            width: 830,
            height: 102,
            gap: 8
          })
      }),
    navigation:
      Object.freeze({
        iconY: 24,
        labelY: 91,
        activeInsetX: 15,
        activeInsetY: 8,
        activeWidth: 145,
        activeHeight: 132
      })
  });

const UI_TEXT_SLOTS =
  Object.freeze({
    hudIdentityTitle:
      Object.freeze({
        x: 114,
        y: 17,
        width: 153,
        height: 31
      }),
    hudIdentitySubtitle:
      Object.freeze({
        x: 114,
        y: 60,
        width: 153,
        height: 20
      }),
    heroTitle:
      Object.freeze({
        x: 60,
        y: 21,
        width: 518,
        height: 65
      }),
    heroSubtitle:
      Object.freeze({
        x: 31,
        y: 99,
        width: 544,
        height: 26
      }),
    detailTitle:
      Object.freeze({
        x: 160,
        y: 30,
        width: 438,
        height: 35
      }),
    detailBody:
      Object.freeze({
        x: 160,
        y: 72,
        width: 438,
        height: 52
      }),
    navLabel:
      Object.freeze({
        y: 91,
        height: 32
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
            size: 23,
            weight: 800,
            lineHeight: 1.15
          }),
        hudMoney:
          Object.freeze({
            size: 22,
            weight: 800,
            lineHeight: 1
          }),
        hudLevel:
          Object.freeze({
            size: 22,
            weight: 800,
            lineHeight: 1
          }),
        hudSecondary:
          Object.freeze({
            size: 17,
            weight: 600,
            lineHeight: 1.12
          }),
        hudTime:
          Object.freeze({
            size: 31,
            weight: 900,
            lineHeight: 1.05
          }),
        pageTitle:
          Object.freeze({
            size: 54,
            weight: 900,
            lineHeight: 1.2
          }),
        pageSubtitle:
          Object.freeze({
            size: 22,
            weight: 700,
            lineHeight: 1.2
          }),
        filter:
          Object.freeze({
            size: 22,
            weight: 800,
            lineHeight: 1
          }),
        markerTitle:
          Object.freeze({
            size: 20,
            weight: 900,
            lineHeight: 1.15
          }),
        markerMeta:
          Object.freeze({
            size: 18,
            weight: 700,
            lineHeight: 1.15
          }),
        detailTitle:
          Object.freeze({
            size: 29,
            weight: 900,
            lineHeight: 1.2
          }),
        detailBody:
          Object.freeze({
            size: 18,
            weight: 600,
            lineHeight: 1.35
          }),
        detailButton:
          Object.freeze({
            size: 26,
            weight: 900,
            lineHeight: 1
          }),
        metricLabel:
          Object.freeze({
            size: 17,
            weight: 700,
            lineHeight: 1
          }),
        metricValue:
          Object.freeze({
            size: 22,
            weight: 900,
            lineHeight: 1.1
          }),
        sectionTitle:
          Object.freeze({
            size: 27,
            weight: 900,
            lineHeight: 1.08
          }),
        opportunityTitle:
          Object.freeze({
            size: 17,
            weight: 800,
            lineHeight: 1.25
          }),
        opportunityBody:
          Object.freeze({
            size: 15,
            weight: 600,
            lineHeight: 1.35
          }),
        navigation:
          Object.freeze({
            size: 27,
            weight: 700,
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
