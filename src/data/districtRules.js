export const DISTRICT_SCHEMA_VERSION = 2;

export const DISTRICT_MEAL_PERIODS =
  Object.freeze([
    "breakfast",
    "lunch",
    "afternoon",
    "dinner",
    "late_night"
  ]);

export const DISTRICT_POSITIONING_IDS =
  Object.freeze([
    "quick_service",
    "family_dining",
    "student_value",
    "specialty_dining"
  ]);

export const DISTRICT_EVENT_IDS =
  Object.freeze([
    "convention",
    "road_construction",
    "severe_weather",
    "school_opening",
    "office_holiday",
    "neighborhood_festival",
    "competitor_promotion"
  ]);

export const DISTRICT_CUSTOMER_PROFILE_TYPES =
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

function percent(
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
      `District "${id}" has invalid ${field}`
    );
  }
}

function positiveMap(
  value,
  field,
  id,
  allowedKeys = null
) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new Error(
      `District "${id}" requires ${field}`
    );
  }

  for (
    const [
      key,
      weight
    ]
    of Object.entries(
      value
    )
  ) {
    if (
      allowedKeys &&
      !allowedKeys.includes(
        key
      )
    ) {
      throw new Error(
        `District "${id}" has invalid ${field} key "${key}"`
      );
    }

    if (
      !Number.isFinite(weight) ||
      weight < 0
    ) {
      throw new Error(
        `District "${id}" has invalid ${field}.${key}`
      );
    }
  }
}

export function validateFormalDistrict(
  item
) {
  if (
    !item ||
    typeof item !== "object"
  ) {
    throw new TypeError(
      "District must be an object"
    );
  }

  if (
    item.schemaVersion !==
      DISTRICT_SCHEMA_VERSION
  ) {
    throw new Error(
      `District "${item.id ?? "unknown"}" has invalid schemaVersion`
    );
  }

  if (
    typeof item.id !== "string" ||
    !/^[a-z][a-z0-9_]*$/.test(
      item.id
    )
  ) {
    throw new Error(
      "District id must use stable snake_case lowercase format"
    );
  }

  if (
    typeof item.name !== "string" ||
    !item.name.trim()
  ) {
    throw new Error(
      `District "${item.id}" requires a name`
    );
  }

  if (
    typeof item.zoneType !==
      "string" ||
    !item.zoneType.trim()
  ) {
    throw new Error(
      `District "${item.id}" requires zoneType`
    );
  }

  if (
    !DISTRICT_CUSTOMER_PROFILE_TYPES
      .includes(
        item.customerProfileType
      )
  ) {
    throw new Error(
      `District "${item.id}" has invalid customerProfileType`
    );
  }

  if (
    !item.mapPosition ||
    !Number.isFinite(
      item.mapPosition.x
    ) ||
    !Number.isFinite(
      item.mapPosition.y
    ) ||
    item.mapPosition.x < 0 ||
    item.mapPosition.x > 100 ||
    item.mapPosition.y < 0 ||
    item.mapPosition.y > 100
  ) {
    throw new Error(
      `District "${item.id}" has invalid mapPosition`
    );
  }

  for (
    const field
    of [
      "trafficIndex",
      "spendingPower",
      "competition",
      "deliveryDemand",
      "parkingConvenience",
      "transitAccess"
    ]
  ) {
    percent(
      item[field],
      field,
      item.id
    );
  }

  if (
    !Number.isFinite(
      item.rentMultiplier
    ) ||
    item.rentMultiplier <= 0 ||
    item.rentMultiplier > 3
  ) {
    throw new Error(
      `District "${item.id}" has invalid rentMultiplier`
    );
  }

  if (
    !Number.isFinite(
      item.seasonality
    ) ||
    item.seasonality < 0.6 ||
    item.seasonality > 1.5
  ) {
    throw new Error(
      `District "${item.id}" has invalid seasonality`
    );
  }

  positiveMap(
    item.customerMix,
    "customerMix",
    item.id
  );

  if (
    Object.values(
      item.customerMix
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
      `District "${item.id}" requires positive customerMix`
    );
  }

  positiveMap(
    item.venueAffinity,
    "venueAffinity",
    item.id
  );

  positiveMap(
    item.positioningAffinity,
    "positioningAffinity",
    item.id,
    DISTRICT_POSITIONING_IDS
  );

  positiveMap(
    item.mealPeriodWeights,
    "mealPeriodWeights",
    item.id,
    DISTRICT_MEAL_PERIODS
  );

  for (
    const period
    of DISTRICT_MEAL_PERIODS
  ) {
    if (
      !Object.prototype
        .hasOwnProperty.call(
          item.mealPeriodWeights,
          period
        )
    ) {
      throw new Error(
        `District "${item.id}" is missing meal period "${period}"`
      );
    }
  }

  positiveMap(
    item.eventSensitivity,
    "eventSensitivity",
    item.id,
    DISTRICT_EVENT_IDS
  );

  return true;
}
