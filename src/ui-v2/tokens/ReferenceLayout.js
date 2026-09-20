const CITY_REFERENCE_LAYOUT =
  Object.freeze({
    artwork:
      Object.freeze({
        width: 864,
        height: 1536
      }),

    regions:
      Object.freeze({
        hud:
          Object.freeze({
            y: 0,
            height: 94,
            dvh: 6.12
          }),

        hero:
          Object.freeze({
            y: 94,
            height: 135,
            dvh: 8.79
          }),

        filters:
          Object.freeze({
            y: 229,
            height: 66,
            dvh: 4.30
          }),

        map:
          Object.freeze({
            y: 295,
            height: 657,
            dvh: 42.77
          }),

        detail:
          Object.freeze({
            y: 952,
            height: 435,
            dvh: 28.32
          }),

        navigation:
          Object.freeze({
            y: 1387,
            height: 149,
            dvh: 9.70
          })
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
        filterLabel: 22,
        markerTitle: 20,
        markerMeta: 17,
        detailTitle: 27,
        detailBody: 16,
        detailButton: 20,
        metricLabel: 14,
        metricValue: 21,
        sectionTitle: 22,
        opportunityTitle: 15,
        opportunityBody: 13,
        navLabel: 25
      })
  });

const CITY_RUNTIME_POLICY =
  Object.freeze({
    verticalComposition:
      "viewport-height-locked",

    horizontalCompression:
      "width-responsive",

    safeInsets:
      "do-not-consume-vertical-rows",

    mapMarkerPolicy:
      "canonical-five-plus-selected",

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
