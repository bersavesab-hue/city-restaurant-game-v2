const CITY_REFERENCE_LAYOUT =
  Object.freeze({
    artwork:
      Object.freeze({
        width: 864,
        height: 1536,
        pixelToCssScale: 0.5
      }),

    cssReference:
      Object.freeze({
        width: 432,
        height: 768
      }),

    artworkRegions:
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
      }),

    cssVisualReference:
      Object.freeze({
        hud: 47,
        hero: 67.5,
        filters: 33,
        map: 328.5,
        detail: 217.5,
        navigation: 74.5
      }),

    runtimeTargets:
      Object.freeze({
        hud: 52,
        hero: 68,
        filters: 48,
        detail: 218,
        navigation: 74,
        mapMinimum: 160
      })
  });

const CITY_REFERENCE_TYPOGRAPHY =
  Object.freeze({
    artworkPixels:
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
      }),

    runtimeCss:
      Object.freeze({
        hudScopeTitle: 12,
        hudScopeSubtitle: 9,
        hudDate: 9,
        hudTime: 16,
        hudValue: 12,
        hudLevel: 11,
        hudSpeed: 10,

        pageTitle: 24,
        pageSubtitle: 12,
        summaryValue: 13,
        summaryCaption: 9,

        filterLabel: 11,

        markerTitle: 11,
        markerMeta: 9,

        detailTitle: 16,
        detailBody: 10,
        detailButton: 13,

        metricLabel: 9,
        metricValue: 12,
        metricTrend: 9,

        sectionTitle: 14,
        opportunityTitle: 10,
        opportunityBody: 9,

        navLabel: 13
      })
  });

const CITY_RUNTIME_POLICY =
  Object.freeze({
    referenceMode:
      "artwork-pixels-to-css-reference",

    pixelToCssScale:
      0.5,

    flexibleRegion:
      "city-map",

    extraHeightTarget:
      "city-map",

    minimumTouchTarget:
      48,

    textScaling:
      "bounded",

    imageScaling:
      "cover-no-stretch",

    fullPageScaling:
      false
  });

export {
  CITY_REFERENCE_LAYOUT,
  CITY_REFERENCE_TYPOGRAPHY,
  CITY_RUNTIME_POLICY
};
