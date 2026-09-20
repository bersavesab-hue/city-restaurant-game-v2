const DISTRICT_THUMBNAIL_SPRITE =
  "assets/images/ui/city/district-thumbnails-sprite.webp";


const DISTRICT_LABEL_SPRITE =
  "assets/images/ui/city/city-labels.webp";


const CITY_METRIC_ICON_SPRITE =
  "assets/images/ui/city/city-metric-icons.webp";


const CITY_MAP_CONTROL_SPRITE =
  "assets/images/ui/city/city-map-controls.webp";


const CITY_STATE_BADGE_SPRITE =
  "assets/images/ui/city/city-state-badges.webp";


const LABEL_COLUMNS =
  2;


const LABEL_ROWS =
  6;


const LABEL_ROW_BY_DISTRICT =
  Object.freeze({
    cbd: 0,
    commercial_core: 0,
    office_park: 0,
    convention_center: 0,
    transport_hub: 0,

    university: 1,
    tech_park: 1,

    nightlife: 2,
    cultural_creative: 2,
    sports_entertainment: 2,

    old_town: 3,
    premium_residential: 3,
    residential: 3,
    industrial_park: 3,
    medical_cluster: 3,
    wholesale_market: 3,
    suburban_community: 3,

    waterfront_leisure: 4,
    tourist_scenic: 4,
    suburban_resort: 4
  });


const SPRITE_COLUMNS =
  4;


const SPRITE_ROWS =
  5;


const DISTRICT_VISUALS =
  Object.freeze({
    cbd: {
      row: 0,
      column: 0
    },

    university: {
      row: 0,
      column: 1
    },

    nightlife: {
      row: 0,
      column: 2
    },

    old_town: {
      row: 0,
      column: 3
    },

    waterfront_leisure: {
      row: 1,
      column: 0
    },

    tech_park: {
      row: 1,
      column: 1
    },

    commercial_core: {
      row: 1,
      column: 2
    },

    premium_residential: {
      row: 1,
      column: 3
    },

    industrial_park: {
      row: 2,
      column: 0
    },

    cultural_creative: {
      row: 2,
      column: 1
    },

    wholesale_market: {
      row: 2,
      column: 2
    },

    medical_cluster: {
      row: 2,
      column: 3
    },

    sports_entertainment: {
      row: 3,
      column: 0
    },

    tourist_scenic: {
      row: 3,
      column: 1
    },

    office_park: {
      row: 3,
      column: 2
    },

    convention_center: {
      row: 3,
      column: 3
    },

    transport_hub: {
      row: 4,
      column: 0
    },

    suburban_resort: {
      row: 4,
      column: 1
    },

    residential: {
      row: 4,
      column: 2
    },

    suburban_community: {
      row: 4,
      column: 3
    }
  });


const FALLBACK_VISUAL =
  DISTRICT_VISUALS
    .commercial_core;


function axisPosition(
  index,
  count
) {
  if (
    count <=
    1
  ) {
    return "0%";
  }

  return (
    (
      index /
      (
        count -
        1
      )
    ) *
    100
  ).toFixed(
    4
  ) + "%";
}


function resolveDistrictVisual(
  districtId
) {
  const visual =
    DISTRICT_VISUALS[
      districtId
    ] ??
    FALLBACK_VISUAL;

  return {
    image:
      DISTRICT_THUMBNAIL_SPRITE,

    size:
      (
        SPRITE_COLUMNS *
        100
      ) +
      "% " +
      (
        SPRITE_ROWS *
        100
      ) +
      "%",

    position:
      axisPosition(
        visual.column,
        SPRITE_COLUMNS
      ) +
      " " +
      axisPosition(
        visual.row,
        SPRITE_ROWS
      ),

    row:
      visual.row,

    column:
      visual.column
  };
}


function getDistrictLabelStyle(
  districtId,
  {
    selected = false,
    locked = false
  } = {}
) {
  const row =
    locked
      ? 5
      : (
          LABEL_ROW_BY_DISTRICT[
            districtId
          ] ??
          0
        );

  const column =
    selected
      ? 1
      : 0;

  return (
    "--district-label-image:url('" +
    DISTRICT_LABEL_SPRITE +
    "');" +
    "--district-label-size:" +
    (
      LABEL_COLUMNS *
      100
    ) +
    "% " +
    (
      LABEL_ROWS *
      100
    ) +
    "%;" +
    "--district-label-position:" +
    axisPosition(
      column,
      LABEL_COLUMNS
    ) +
    " " +
    axisPosition(
      row,
      LABEL_ROWS
    ) +
    ";"
  );
}


function getDistrictThumbnailStyle(
  districtId,
  {
    imageVar =
      "--district-thumbnail-image",

    sizeVar =
      "--district-thumbnail-size",

    positionVar =
      "--district-thumbnail-position"
  } = {}
) {
  const visual =
    resolveDistrictVisual(
      districtId
    );

  return (
    imageVar +
    ":url('" +
    visual.image +
    "');" +
    sizeVar +
    ":" +
    visual.size +
    ";" +
    positionVar +
    ":" +
    visual.position +
    ";"
  );
}


export {
  DISTRICT_THUMBNAIL_SPRITE,
  DISTRICT_LABEL_SPRITE,
  CITY_METRIC_ICON_SPRITE,
  CITY_MAP_CONTROL_SPRITE,
  CITY_STATE_BADGE_SPRITE,
  DISTRICT_VISUALS,
  resolveDistrictVisual,
  getDistrictThumbnailStyle,
  getDistrictLabelStyle
};
