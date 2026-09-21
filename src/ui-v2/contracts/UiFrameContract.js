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
        height: 118
      }),
    hero:
      Object.freeze({
        y: 118,
        height: 132
      }),
    filters:
      Object.freeze({
        y: 250,
        height: 66
      }),
    map:
      Object.freeze({
        y: 316,
        height: 686
      }),
    detail:
      Object.freeze({
        y: 1002,
        height: 408
      }),
    navigation:
      Object.freeze({
        y: 1410,
        height: 126
      })
  });

const UI_BOXES =
  Object.freeze({
    hudAvatar:
      Object.freeze({
        width: 90,
        height: 90
      }),
    hudWeather:
      Object.freeze({
        width: 48,
        height: 48
      }),
    hudSpeedAction:
      Object.freeze({
        width: 42,
        height: 42
      }),
    hudResourceAction:
      Object.freeze({
        width: 30,
        height: 30
      }),
    hudIcon:
      Object.freeze({
        width: 32,
        height: 28
      }),
    heroIcon:
      Object.freeze({
        width: 48,
        height: 60
      }),
    filter:
      Object.freeze({
        width: 165,
        height: 62
      }),
    filterIcon:
      Object.freeze({
        width: 20,
        height: 20
      }),
    mapMarker:
      Object.freeze({
        width: 226,
        height: 62
      }),
    mapMarkerIcon:
      Object.freeze({
        width: 56,
        height: 56
      }),
    mapControl:
      Object.freeze({
        width: 60,
        height: 60
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
        width: 132,
        height: 108
      }),
    primaryAction:
      Object.freeze({
        width: 230,
        height: 84
      }),
    metric:
      Object.freeze({
        width: 133,
        height: 115
      }),
    metricIcon:
      Object.freeze({
        width: 50,
        height: 50
      }),
    opportunity:
      Object.freeze({
        width: 271,
        height: 104
      }),
    opportunityThumbnail:
      Object.freeze({
        width: 76,
        height: 84
      }),
    navigationCell:
      Object.freeze({
        width: 173,
        height: 126
      }),
    navigationIcon:
      Object.freeze({
        width: 60,
        height: 60
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
            width: 294,
            height: 118
          }),
        simulation:
          Object.freeze({
            x: 294,
            y: 0,
            width: 346,
            height: 118
          }),
        resources:
          Object.freeze({
            x: 640,
            y: 0,
            width: 224,
            height: 118
          })
      }),
    hero:
      Object.freeze({
        icon:
          Object.freeze({
            x: 14,
            y: 34
          }),
        copy:
          Object.freeze({
            x: 70,
            y: 17,
            width: 780,
            height: 98
          })
      }),
    filters:
      Object.freeze({
        x: 8,
        y: 0,
        width: 848,
        height: 66,
        gap: 6
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
            x: 790,
            y: 430,
            width: 60,
            height: 200,
            gap: 10
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
            x: 20,
            y: 27,
            width: 132,
            height: 108
          }),
        copy:
          Object.freeze({
            x: 164,
            y: 29,
            width: 422,
            height: 104
          }),
        primaryAction:
          Object.freeze({
            x: 604,
            y: 36,
            width: 230,
            height: 84
          }),
        metrics:
          Object.freeze({
            x: 16,
            y: 144,
            width: 832,
            height: 118,
            gap: 8
          }),
        opportunityHeader:
          Object.freeze({
            x: 16,
            y: 276,
            width: 832,
            height: 44
          }),
        opportunities:
          Object.freeze({
            x: 16,
            y: 322,
            width: 832,
            height: 104,
            gap: 10
          })
      }),
    navigation:
      Object.freeze({
        hitCellWidth: 173,
        hitCellHeight: 126,
        iconSize: 60
      })
  });

const UI_TEXT_SLOTS =
  Object.freeze({
    hudIdentityTitle:
      Object.freeze({
        x: 122,
        y: 22,
        width: 164,
        height: 36
      }),
    hudIdentitySubtitle:
      Object.freeze({
        x: 122,
        y: 78,
        width: 164,
        height: 23
      }),
    heroTitle:
      Object.freeze({
        x: 70,
        y: 17,
        width: 780,
        height: 64
      }),
    heroSubtitle:
      Object.freeze({
        x: 70,
        y: 86,
        width: 780,
        height: 27
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
            size: 26,
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
            size: 20,
            weight: 800,
            lineHeight: 1
          }),
        hudSecondary:
          Object.freeze({
            size: 19,
            weight: 600,
            lineHeight: 1.12
          }),
        hudTime:
          Object.freeze({
            size: 36,
            weight: 900,
            lineHeight: 1.05
          }),
        pageTitle:
          Object.freeze({
            size: 56,
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
            size: 17,
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
            lineHeight: 1.32
          }),
        detailButton:
          Object.freeze({
            size: 26,
            weight: 900,
            lineHeight: 1
          }),
        metricLabel:
          Object.freeze({
            size: 18,
            weight: 700,
            lineHeight: 1
          }),
        metricValue:
          Object.freeze({
            size: 24,
            weight: 900,
            lineHeight: 1.1
          }),
        sectionTitle:
          Object.freeze({
            size: 28,
            weight: 900,
            lineHeight: 1.08
          }),
        opportunityTitle:
          Object.freeze({
            size: 18,
            weight: 800,
            lineHeight: 1.25
          }),
        opportunityBody:
          Object.freeze({
            size: 16,
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
