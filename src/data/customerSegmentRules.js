export const CUSTOMER_SEGMENT_SCHEMA_VERSION = 3;

export const CUSTOMER_CHANNEL_IDS =
  Object.freeze([
    "dine_in",
    "pickup",
    "delivery",
    "reservation"
  ]);

export const CUSTOMER_DISTRICT_TYPES =
  Object.freeze([
    "old_town",
    "cbd",
    "university",
    "premium_residential",
    "residential",
    "transport_hub",
    "industrial_park",
    "nightlife",
    "tourist_scenic",
    "suburban_resort"
  ]);

function requirePercent(
  value,
  field,
  id
) {
  if (
    !Number.isInteger(value) ||
    value < 0 ||
    value > 100
  ) {
    throw new Error(
      `Customer segment "${id}" has invalid ${field}`
    );
  }
}

export function validateFormalCustomerSegment(
  item
) {
  if (
    !item ||
    typeof item !== "object"
  ) {
    throw new TypeError(
      "Customer segment must be an object"
    );
  }

  if (
    item.schemaVersion !==
      CUSTOMER_SEGMENT_SCHEMA_VERSION
  ) {
    throw new Error(
      `Customer segment "${item.id ?? "unknown"}" has invalid schemaVersion`
    );
  }

  if (
    typeof item.id !== "string" ||
    !/^[a-z][a-z0-9_]*$/.test(
      item.id
    )
  ) {
    throw new Error(
      "Customer segment id must use stable snake_case lowercase format"
    );
  }

  if (
    typeof item.name !== "string" ||
    !item.name.trim()
  ) {
    throw new Error(
      `Customer segment "${item.id}" requires a name`
    );
  }

  if (
    !item.ageRange ||
    !Number.isInteger(
      item.ageRange.min
    ) ||
    !Number.isInteger(
      item.ageRange.max
    ) ||
    item.ageRange.min < 12 ||
    item.ageRange.max > 90 ||
    item.ageRange.min >
      item.ageRange.max
  ) {
    throw new Error(
      `Customer segment "${item.id}" has invalid ageRange`
    );
  }

  if (
    !Array.isArray(
      item.occupationTags
    ) ||
    item.occupationTags.length ===
      0 ||
    item.occupationTags.some(
      tag =>
        typeof tag !== "string" ||
        !tag.trim()
    )
  ) {
    throw new Error(
      `Customer segment "${item.id}" has invalid occupationTags`
    );
  }

  for (
    const field
    of [
      "spendingPower",
      "priceSensitivity",
      "qualitySensitivity",
      "speedSensitivity",
      "repeatPreference",
      "reviewPropensity"
    ]
  ) {
    requirePercent(
      item[field],
      field,
      item.id
    );
  }

  if (
    !Number.isInteger(
      item.averageDiningMinutes
    ) ||
    item.averageDiningMinutes < 8 ||
    item.averageDiningMinutes > 180
  ) {
    throw new Error(
      `Customer segment "${item.id}" has invalid averageDiningMinutes`
    );
  }

  if (
    !Number.isInteger(
      item.queuePatienceMinutes
    ) ||
    item.queuePatienceMinutes < 0 ||
    item.queuePatienceMinutes > 60
  ) {
    throw new Error(
      `Customer segment "${item.id}" has invalid queuePatienceMinutes`
    );
  }

  if (
    !item.partySize ||
    !Number.isInteger(
      item.partySize.min
    ) ||
    !Number.isInteger(
      item.partySize.max
    ) ||
    !Number.isFinite(
      item.partySize.average
    ) ||
    item.partySize.min < 1 ||
    item.partySize.max > 12 ||
    item.partySize.min >
      item.partySize.max ||
    item.partySize.average <
      item.partySize.min ||
    item.partySize.average >
      item.partySize.max
  ) {
    throw new Error(
      `Customer segment "${item.id}" has invalid partySize`
    );
  }

  if (
    !Number.isFinite(
      item.basePresence
    ) ||
    item.basePresence <= 0 ||
    item.basePresence > 10
  ) {
    throw new Error(
      `Customer segment "${item.id}" has invalid basePresence`
    );
  }

  for (
    const [
      field,
      keys
    ]
    of [
      [
        "channelPreferences",
        CUSTOMER_CHANNEL_IDS
      ],
      [
        "districtAffinity",
        CUSTOMER_DISTRICT_TYPES
      ]
    ]
  ) {
    const object =
      item[field];

    if (
      !object ||
      typeof object !==
        "object" ||
      Array.isArray(
        object
      )
    ) {
      throw new Error(
        `Customer segment "${item.id}" requires ${field}`
      );
    }

    for (
      const [
        key,
        value
      ]
      of Object.entries(
        object
      )
    ) {
      if (
        !keys.includes(
          key
        ) ||
        !Number.isFinite(
          value
        ) ||
        value < 0
      ) {
        throw new Error(
          `Customer segment "${item.id}" has invalid ${field}.${key}`
        );
      }
    }
  }

  if (
    Object.values(
      item.channelPreferences
    ).reduce(
      (
        sum,
        value
      ) =>
        sum +
        value,
      0
    ) <= 0
  ) {
    throw new Error(
      `Customer segment "${item.id}" requires positive channel preference weight`
    );
  }

  for (
    const field
    of [
      "categoryPreferences",
      "tastePreferences",
      "hourWeights"
    ]
  ) {
    const object =
      item[field];

    if (
      !object ||
      typeof object !==
        "object" ||
      Array.isArray(
        object
      )
    ) {
      throw new Error(
        `Customer segment "${item.id}" requires ${field}`
      );
    }

    for (
      const value
      of Object.values(
        object
      )
    ) {
      if (
        !Number.isFinite(
          value
        ) ||
        value < 0
      ) {
        throw new Error(
          `Customer segment "${item.id}" has invalid ${field}`
        );
      }
    }
  }

  return true;
}
