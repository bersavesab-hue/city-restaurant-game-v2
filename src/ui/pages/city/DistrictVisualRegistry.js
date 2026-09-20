const DISTRICT_THUMBNAIL_SPRITE =
  "assets/images/ui/city/district-thumbnails-sprite.webp";


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
  DISTRICT_VISUALS,
  resolveDistrictVisual,
  getDistrictThumbnailStyle
};
