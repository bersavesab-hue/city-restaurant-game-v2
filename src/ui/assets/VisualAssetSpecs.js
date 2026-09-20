export const VISUAL_ASSET_SPECS =
  Object.freeze({
    restaurantHero:
      Object.freeze({
        width: 1536,
        height: 768,
        aspectRatio: "2:1",
        format: "webp"
      }),

    restaurantLive:
      Object.freeze({
        width: 1536,
        height: 864,
        aspectRatio: "16:9",
        format: "webp"
      }),

    commandCenterHero:
      Object.freeze({
        width: 1536,
        height: 768,
        aspectRatio: "2:1",
        format: "webp"
      }),

    cityMap:
      Object.freeze({
        width: 1536,
        height: 864,
        aspectRatio: "16:9",
        format: "webp"
      }),

    propertyCard:
      Object.freeze({
        width: 1024,
        height: 576,
        aspectRatio: "16:9",
        format: "webp"
      }),

    dishSquare:
      Object.freeze({
        width: 1024,
        height: 1024,
        aspectRatio: "1:1",
        format: "webp"
      }),

    employeeAvatar:
      Object.freeze({
        width: 512,
        height: 512,
        aspectRatio: "1:1",
        format: "webp"
      }),

    renovationConstruction:
      Object.freeze({
        width: 1536,
        height: 864,
        aspectRatio: "16:9",
        format: "webp"
      }),

    renovationFurniture:
      Object.freeze({
        width: 512,
        height: 512,
        aspectRatio: "1:1",
        format: "webp"
      }),

    uiIcon:
      Object.freeze({
        width: 256,
        height: 256,
        aspectRatio: "1:1",
        format: "svg-or-webp"
      })
  });


export const VISUAL_SLOT_SPEC_MAP =
  Object.freeze({
    "restaurant-hero":
      "restaurantHero",

    "restaurant-live":
      "restaurantLive",

    "store-home-hero":
      "commandCenterHero",

    "renovation-construction-site":
      "renovationConstruction"
  });


export function getVisualAssetSpec(
  slot
) {
  if (
    typeof slot !==
      "string"
  ) {
    return null;
  }

  if (
    slot.startsWith(
      "property-"
    )
  ) {
    return VISUAL_ASSET_SPECS
      .propertyCard;
  }

  if (
    slot.startsWith(
      "dish-"
    ) ||
    slot.startsWith(
      "command-dish-"
    )
  ) {
    return VISUAL_ASSET_SPECS
      .dishSquare;
  }

  if (
    slot.startsWith(
      "employee-avatar-"
    ) ||
    slot.startsWith(
      "command-employee-"
    )
  ) {
    return VISUAL_ASSET_SPECS
      .employeeAvatar;
  }

  if (
    slot.startsWith(
      "renovation-furniture-"
    )
  ) {
    return VISUAL_ASSET_SPECS
      .renovationFurniture;
  }

  const key =
    VISUAL_SLOT_SPEC_MAP[
      slot
    ];

  return key
    ? VISUAL_ASSET_SPECS[
        key
      ]
    : null;
}
