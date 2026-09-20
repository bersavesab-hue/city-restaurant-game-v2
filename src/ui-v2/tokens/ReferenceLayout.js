const CITY_REFERENCE_LAYOUT =
  Object.freeze({
    canvas:
      Object.freeze({
        width: 864,
        height: 1536
      }),

    regions:
      Object.freeze({
        hud:
          Object.freeze({
            x: 0,
            y: 0,
            width: 864,
            height: 94
          }),

        hero:
          Object.freeze({
            x: 0,
            y: 94,
            width: 864,
            height: 135
          }),

        filters:
          Object.freeze({
            x: 10,
            y: 229,
            width: 844,
            height: 66
          }),

        map:
          Object.freeze({
            x: 0,
            y: 295,
            width: 864,
            height: 657
          }),

        detail:
          Object.freeze({
            x: 0,
            y: 952,
            width: 864,
            height: 435
          }),

        navigation:
          Object.freeze({
            x: 0,
            y: 1387,
            width: 864,
            height: 149
          })
      }),

    pageContent:
      Object.freeze({
        y: 94,
        height: 1293,

        rows:
          Object.freeze({
            hero: 135,
            filters: 66,
            map: 657,
            detail: 435
          })
      }),

    anchors:
      Object.freeze({
        mapControls:
          Object.freeze({
            right: 16,
            bottom: 92,
            size: 54,
            gap: 12
          }),

        detailHandle:
          Object.freeze({
            top: 8,
            width: 76,
            height: 6
          }),

        detailPadding:
          Object.freeze({
            x: 20,
            top: 28,
            bottom: 18
          }),

        filterPadding:
          Object.freeze({
            x: 10,
            y: 6
          })
      })
  });

const CITY_REFERENCE_TYPOGRAPHY =
  Object.freeze({
    hudScopeTitle: 23,
    hudScopeSubtitle: 15,
    hudDate: 16,
    hudTime: 29,
    hudValue: 23,
    hudLevel: 20,
    hudSpeed: 17,

    pageTitle: 46,
    pageSubtitle: 23,
    summaryValue: 25,
    summaryCaption: 15,

    filterLabel: 22,

    markerTitle: 20,
    markerMeta: 17,

    detailTitle: 27,
    detailBody: 16,
    detailButton: 20,

    metricLabel: 14,
    metricValue: 21,
    metricTrend: 13,

    sectionTitle: 22,
    opportunityTitle: 15,
    opportunityBody: 13,

    navLabel: 25
  });

const CITY_RUNTIME_POLICY =
  Object.freeze({
    referenceMode:
      "fixed-structure-fluid-map",

    fixedRegions:
      Object.freeze([
        "global-hud",
        "city-hero",
        "city-filters",
        "city-detail",
        "global-nav"
      ]),

    flexibleRegion:
      "city-map",

    extraHeightTarget:
      "city-map",

    minimumTouchTarget:
      48,

    textScaling:
      "bounded",

    imageScaling:
      "cover-no-stretch"
  });

export {
  CITY_REFERENCE_LAYOUT,
  CITY_REFERENCE_TYPOGRAPHY,
  CITY_RUNTIME_POLICY
};
