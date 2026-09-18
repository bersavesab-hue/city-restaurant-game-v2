export const MARKETING_ACTION_SCHEMA_VERSION = 1;

export const MARKETING_ACTION_CATEGORIES = Object.freeze([
  "local_acquisition",
  "discount_conversion",
  "brand_building",
  "content_social",
  "delivery_growth",
  "community_scene",
  "member_retention",
  "group_business",
  "seasonal_event"
]);

export const MARKETING_ACTION_CHANNELS = Object.freeze([
  "dine_in",
  "pickup",
  "delivery",
  "reservation"
]);

export const MARKETING_ACTION_MULTIPLIERS = Object.freeze([
  "demandMultiplier",
  "priceMultiplier",
  "marketAppealMultiplier",
  "repeatIntentMultiplier",
  "reviewPropensityMultiplier"
]);

function validateMap(
  value,
  field,
  id,
  {
    allowed = null,
    min = 0,
    max = 3
  } = {}
) {
  if (
    value === undefined ||
    value === null
  ) {
    return;
  }

  if (
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new Error(
      `Marketing action "${id}" has invalid ${field}`
    );
  }

  for (
    const [key, number]
    of Object.entries(value)
  ) {
    if (
      !key ||
      !Number.isFinite(number) ||
      number < min ||
      number > max ||
      (
        allowed &&
        !allowed.includes(key)
      )
    ) {
      throw new Error(
        `Marketing action "${id}" has invalid ${field}`
      );
    }
  }
}

export function validateMarketingAction(
  item
) {
  if (
    !item ||
    typeof item !== "object"
  ) {
    throw new TypeError(
      "Marketing action must be an object"
    );
  }

  if (
    item.schemaVersion !==
      MARKETING_ACTION_SCHEMA_VERSION
  ) {
    throw new Error(
      `Marketing action "${item.id ?? "unknown"}" has invalid schemaVersion`
    );
  }

  if (
    typeof item.id !== "string" ||
    !/^[a-z0-9_]+$/.test(item.id)
  ) {
    throw new Error(
      "Marketing action requires a stable snake_case id"
    );
  }

  if (
    typeof item.name !== "string" ||
    !item.name.trim() ||
    typeof item.description !== "string" ||
    !item.description.trim()
  ) {
    throw new Error(
      `Marketing action "${item.id}" requires name and description`
    );
  }

  if (
    !MARKETING_ACTION_CATEGORIES.includes(
      item.category
    )
  ) {
    throw new Error(
      `Marketing action "${item.id}" has invalid category`
    );
  }

  for (
    const [field, min, max]
    of [
      ["cost", 0, 1000000],
      ["durationDays", 1, 30],
      ["cooldownDays", 0, 90],
      ["minRestaurantLevel", 1, 10]
    ]
  ) {
    if (
      !Number.isInteger(item[field]) ||
      item[field] < min ||
      item[field] > max
    ) {
      throw new Error(
        `Marketing action "${item.id}" has invalid ${field}`
      );
    }
  }

  if (
    typeof item.exclusiveGroup !== "string" ||
    !item.exclusiveGroup
  ) {
    throw new Error(
      `Marketing action "${item.id}" requires exclusiveGroup`
    );
  }

  if (
    !Array.isArray(
      item.requiredChannels
    ) ||
    item.requiredChannels.some(
      channel =>
        !MARKETING_ACTION_CHANNELS.includes(
          channel
        )
    )
  ) {
    throw new Error(
      `Marketing action "${item.id}" has invalid requiredChannels`
    );
  }

  if (
    !Array.isArray(
      item.targetSegments
    ) ||
    item.targetSegments.some(
      value =>
        typeof value !== "string" ||
        !value
    )
  ) {
    throw new Error(
      `Marketing action "${item.id}" has invalid targetSegments`
    );
  }

  const modifiers =
    item.modifiers ?? {};

  for (
    const field
    of MARKETING_ACTION_MULTIPLIERS
  ) {
    const value =
      modifiers[field] ?? 1;

    if (
      !Number.isFinite(value) ||
      value < 0.5 ||
      value > 2
    ) {
      throw new Error(
        `Marketing action "${item.id}" has invalid modifier ${field}`
      );
    }
  }

  if (
    !Number.isFinite(
      modifiers.qualityBonus ?? 0
    ) ||
    !Number.isFinite(
      modifiers.serviceCapacityMultiplier ?? 1
    )
  ) {
    throw new Error(
      `Marketing action "${item.id}" has invalid legacy modifiers`
    );
  }

  validateMap(
    modifiers.segmentMultipliers,
    "segmentMultipliers",
    item.id,
    {
      min: 0.5,
      max: 2
    }
  );

  validateMap(
    modifiers.channelMultipliers,
    "channelMultipliers",
    item.id,
    {
      allowed:
        MARKETING_ACTION_CHANNELS,
      min: 0.5,
      max: 2
    }
  );

  return true;
}
