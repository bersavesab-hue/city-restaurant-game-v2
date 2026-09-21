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
        height: 131
      }),
    filters:
      Object.freeze({
        y: 225,
        height: 63
      }),
    map:
      Object.freeze({
        y: 288,
        height: 682
      }),
    detail:
      Object.freeze({
        y: 970,
        height: 430
      }),
    navigation:
      Object.freeze({
        y: 1400,
        height: 136
      })
  });

const UI_BOXES =
  Object.freeze({
    hudAvatar:
      Object.freeze({
        width: 76,
        height: 76
      }),
    hudWeather:
      Object.freeze({
        width: 38,
        height: 38
      }),
    hudSpeedAction:
      Object.freeze({
        width: 40,
        height: 40
      }),
    hudResourceAction:
      Object.freeze({
        width: 26,
        height: 26
      }),
    hudIcon:
      Object.freeze({
        width: 30,
        height: 26
      }),
    heroIcon:
      Object.freeze({
        width: 42,
        height: 52
      }),
    heroSummary:
      Object.freeze({
        width: 265,
        height: 97
      }),
    filter:
      Object.freeze({
        width: 165,
        height: 58
      }),
    filterIcon:
      Object.freeze({
        width: 18,
        height: 18
      }),
    mapMarker:
      Object.freeze({
        width: 214,
        height: 58
      }),
    mapMarkerIcon:
      Object.freeze({
        width: 52,
        height: 52
      }),
    mapControl:
      Object.freeze({
        width: 56,
        height: 56
      }),
    detailHandle:
      Object.freeze({
        width: 69,
        height: 5
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
        width: 157,
        height: 108
      }),
    navigationIcon:
      Object.freeze({
        width: 46,
        height: 46
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
            width: 272,
            height: 94
          }),
        simulation:
          Object.freeze({
            x: 272,
            y: 0,
            width: 393,
            height: 94
          }),
        resources:
          Object.freeze({
            x: 665,
            y: 0,
            width: 199,
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
            x: 587,
            y: 17,
            width: 265,
            height: 97
          })
      }),
    filters:
      Object.freeze({
        x: 10,
        y: 0,
        width: 844,
        height: 63,
        gap: 5
      }),
    map:
      Object.freeze({
        markers:
          Object.freeze({
            university:
              Object.freeze({
                x: 467,
                y: 61
              }),
            cbd:
              Object.freeze({
                x: 320,
                y: 198
              }),
            nightlife:
              Object.freeze({
                x: 708,
                y: 273
              }),
            oldTown:
              Object.freeze({
                x: 233,
                y: 505
              }),
            waterfront:
              Object.freeze({
                x: 674,
                y: 471
              })
          }),
        controls:
          Object.freeze({
            x: 793,
            y: 442,
            width: 56,
            height: 192,
            gap: 12
          })
      }),
    detail:
      Object.freeze({
        handle:
          Object.freeze({
            x: 398,
            y: 7,
            width: 69,
            height: 5
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
        y: 17,
        width: 518,
        height: 60
      }),
    heroSubtitle:
      Object.freeze({
        x: 28,
        y: 96,
        width: 562,
        height: 25
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
            size: 21,
            weight: 800,
            lineHeight: 1
          }),
        hudLevel:
          Object.freeze({
            size: 20,
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
            size: 30,
            weight: 900,
            lineHeight: 1.05
          }),
        pageTitle:
          Object.freeze({
            size: 50,
            weight: 900,
            lineHeight: 1.2
          }),
        pageSubtitle:
          Object.freeze({
            size: 21,
            weight: 700,
            lineHeight: 1.2
          }),
        filter:
          Object.freeze({
            size: 21,
            weight: 800,
            lineHeight: 1
          }),
        markerTitle:
          Object.freeze({
            size: 19,
            weight: 900,
            lineHeight: 1.15
          }),
        markerMeta:
          Object.freeze({
            size: 16,
            weight: 700,
            lineHeight: 1.15
          }),
        detailTitle:
          Object.freeze({
            size: 28,
            weight: 900,
            lineHeight: 1.2
          }),
        detailBody:
          Object.freeze({
            size: 17,
            weight: 600,
            lineHeight: 1.32
          }),
        detailButton:
          Object.freeze({
            size: 24,
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
            size: 23,
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
