const CITY_VISUAL_ASSET_CONTRACT =
  Object.freeze({
    cityMapMaster:
      Object.freeze({
        id: "city-map-master",
        sourceReference:
          "approved-user-city-map",
        targetPath:
          "assets/ui-v2/city/city-map-master.webp",
        fit: "cover",
        textInImage: false,
        status: "approved"
      }),

    hudAndNavigation:
      Object.freeze({
        id: "hud-nav-components",
        sourceReference:
          "approved-user-hud-nav-sheet",
        targetPath:
          "assets/ui-v2/shared/shared-ui-atlas.webp",
        fit: "contain",
        textInImage: false,
        status: "approved"
      }),

    cityMapControls:
      Object.freeze({
        id: "city-map-components",
        sourceReference:
          "approved-user-map-component-sheet",
        targetPath:
          "assets/ui-v2/city/city-map-atlas.webp",
        fit: "contain",
        textInImage: false,
        status: "approved"
      }),

    districtLabels:
      Object.freeze({
        id: "district-labels",
        sourceReference:
          "approved-user-district-label-sheet",
        targetPath:
          "assets/ui-v2/city/city-map-atlas.webp",
        fit: "contain",
        textInImage: false,
        status: "approved"
      }),

    districtLabelsExtended:
      Object.freeze({
        id: "district-labels-extended",
        sourceReference:
          "approved-user-district-label-extended-sheet",
        targetPath:
          "assets/ui-v2/city/city-map-atlas.webp",
        fit: "contain",
        textInImage: false,
        status: "approved"
      }),

    detailSheet:
      Object.freeze({
        id: "city-detail-components",
        sourceReference:
          "approved-user-detail-sheet",
        targetPath:
          "assets/ui-v2/city/city-metric-atlas.webp",
        fit: "contain",
        textInImage: false,
        status: "approved"
      }),

    metricIcons:
      Object.freeze({
        id: "city-metric-icons",
        sourceReference:
          "approved-user-metric-icon-sheet",
        targetPath:
          "assets/ui-v2/city/city-metric-atlas.webp",
        fit: "contain",
        textInImage: false,
        status: "approved"
      })
  });

const CITY_VISUAL_SLOT_POLICY =
  Object.freeze({
    dynamicText:
      Object.freeze([
        "district-name",
        "district-count",
        "money",
        "level",
        "rating",
        "traffic",
        "spending",
        "rent",
        "competition",
        "delivery-demand",
        "available-properties",
        "opportunity-copy"
      ]),

    imageOnly:
      Object.freeze([
        "background",
        "icon",
        "frame",
        "badge-frame",
        "marker-frame",
        "region-outline",
        "thumbnail"
      ])
  });

export {
  CITY_VISUAL_ASSET_CONTRACT,
  CITY_VISUAL_SLOT_POLICY
};
