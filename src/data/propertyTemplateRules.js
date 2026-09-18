export const PROPERTY_TEMPLATE_SCHEMA_VERSION = 1;

export const PROPERTY_SHAPES =
  Object.freeze([
    "rectangle",
    "l_shape"
  ]);

export const PROPERTY_TEMPLATE_IDS =
  Object.freeze([
    "corner_micro",
    "breakfast_bay",
    "takeaway_unit",
    "community_small",
    "community_corner",
    "street_standard",
    "street_wide_front",
    "old_town_narrow",
    "mall_inline",
    "mall_foodcourt",
    "office_podium",
    "campus_unit",
    "medical_support_unit",
    "night_market_shop",
    "creative_loft",
    "wholesale_fast_unit",
    "transport_concourse",
    "family_large",
    "courtyard_property",
    "standalone_parking",
    "flagship_duplex",
    "destination_complex"
  ]);

function finiteRange(
  range,
  field,
  id,
  {
    min = 0,
    max = Infinity,
    integer = false
  } = {}
) {
  if (
    !range ||
    typeof range !== "object" ||
    !Number.isFinite(range.min) ||
    !Number.isFinite(range.max) ||
    range.min < min ||
    range.max > max ||
    range.min > range.max ||
    (
      integer &&
      (
        !Number.isInteger(range.min) ||
        !Number.isInteger(range.max)
      )
    )
  ) {
    throw new Error(
      `Property template "${id}" has invalid ${field}`
    );
  }
}

export function validatePropertyTemplate(
  item
) {
  if (
    !item ||
    typeof item !== "object"
  ) {
    throw new TypeError(
      "Property template must be an object"
    );
  }

  if (
    item.schemaVersion !==
      PROPERTY_TEMPLATE_SCHEMA_VERSION
  ) {
    throw new Error(
      `Property template "${item.id ?? "unknown"}" has invalid schemaVersion`
    );
  }

  if (
    !PROPERTY_TEMPLATE_IDS.includes(
      item.id
    )
  ) {
    throw new Error(
      `Unknown property template "${item.id}"`
    );
  }

  if (
    typeof item.name !== "string" ||
    !item.name.trim()
  ) {
    throw new Error(
      `Property template "${item.id}" requires a name`
    );
  }

  if (
    !Number.isFinite(item.baseWeight) ||
    item.baseWeight <= 0
  ) {
    throw new Error(
      `Property template "${item.id}" has invalid baseWeight`
    );
  }

  finiteRange(
    item.areaRange,
    "areaRange",
    item.id,
    {
      min: 10,
      max: 15000,
      integer: true
    }
  );

  finiteRange(
    item.usableRatioRange,
    "usableRatioRange",
    item.id,
    {
      min: 0.45,
      max: 1
    }
  );

  if (
    !Array.isArray(
      item.floorOptions
    ) ||
    item.floorOptions.length === 0 ||
    item.floorOptions.some(
      floor =>
        !Number.isInteger(floor) ||
        floor < 1 ||
        floor > 6
    )
  ) {
    throw new Error(
      `Property template "${item.id}" has invalid floorOptions`
    );
  }

  if (
    !item.shapeWeights ||
    typeof item.shapeWeights !== "object" ||
    Array.isArray(item.shapeWeights) ||
    Object.entries(
      item.shapeWeights
    ).some(
      ([shape, weight]) =>
        !PROPERTY_SHAPES.includes(shape) ||
        !Number.isFinite(weight) ||
        weight < 0
    ) ||
    Object.values(
      item.shapeWeights
    ).reduce(
      (sum, weight) =>
        sum + weight,
      0
    ) <= 0
  ) {
    throw new Error(
      `Property template "${item.id}" has invalid shapeWeights`
    );
  }

  for (
    const [
      field,
      min,
      max,
      integer
    ]
    of [
      [
        "frontageRange",
        1,
        80,
        false
      ],
      [
        "ceilingHeightRange",
        2.4,
        8,
        false
      ],
      [
        "parkingRange",
        0,
        300,
        true
      ],
      [
        "entranceCountRange",
        1,
        5,
        true
      ],
      [
        "naturalLightRange",
        0,
        100,
        true
      ],
      [
        "columnDensityPer1000Range",
        0,
        20,
        false
      ],
      [
        "depositMonthsRange",
        1,
        6,
        true
      ],
      [
        "listingLifeDaysRange",
        7,
        120,
        true
      ]
    ]
  ) {
    finiteRange(
      item[field],
      field,
      item.id,
      {
        min,
        max,
        integer
      }
    );
  }

  for (
    const field
    of [
      "foodServiceProbability",
      "exhaustProbability",
      "parkingDistrictInfluence"
    ]
  ) {
    if (
      !Number.isFinite(item[field]) ||
      item[field] < 0 ||
      item[field] > 1
    ) {
      throw new Error(
        `Property template "${item.id}" has invalid ${field}`
      );
    }
  }

  if (
    !Number.isFinite(
      item.rentRateMultiplier
    ) ||
    item.rentRateMultiplier < 0.4 ||
    item.rentRateMultiplier > 2
  ) {
    throw new Error(
      `Property template "${item.id}" has invalid rentRateMultiplier`
    );
  }

  if (
    !item.leaseProfile ||
    typeof item.leaseProfile !==
      "object" ||
    Array.isArray(
      item.leaseProfile
    )
  ) {
    throw new Error(
      `Property template "${item.id}" requires leaseProfile`
    );
  }

  const lease =
    item.leaseProfile;

  finiteRange(
    lease.monthsRange,
    "leaseProfile.monthsRange",
    item.id,
    {
      min: 1,
      max: 120,
      integer: true
    }
  );

  finiteRange(
    lease.propertyFeePerSqmRange,
    "leaseProfile.propertyFeePerSqmRange",
    item.id,
    {
      min: 0,
      max: 20
    }
  );

  finiteRange(
    lease.transferFeeRentMultipleRange,
    "leaseProfile.transferFeeRentMultipleRange",
    item.id,
    {
      min: 0,
      max: 8
    }
  );

  finiteRange(
    lease.rentFreeDaysRange,
    "leaseProfile.rentFreeDaysRange",
    item.id,
    {
      min: 0,
      max: 90,
      integer: true
    }
  );

  finiteRange(
    lease.maxDiscountRateRange,
    "leaseProfile.maxDiscountRateRange",
    item.id,
    {
      min: 0,
      max: 0.3
    }
  );

  finiteRange(
    lease.renewalIncreaseRateRange,
    "leaseProfile.renewalIncreaseRateRange",
    item.id,
    {
      min: 0,
      max: 0.3
    }
  );

  if (
    !Number.isFinite(
      lease.transferFeeProbability
    ) ||
    lease.transferFeeProbability < 0 ||
    lease.transferFeeProbability > 1
  ) {
    throw new Error(
      `Property template "${item.id}" has invalid transferFeeProbability`
    );
  }

  if (
    !item.kitchenProfile ||
    typeof item.kitchenProfile !==
      "object" ||
    Array.isArray(
      item.kitchenProfile
    )
  ) {
    throw new Error(
      `Property template "${item.id}" requires kitchenProfile`
    );
  }

  for (
    const field
    of [
      "waterDrainQuality",
      "gasAvailability",
      "powerCapacity",
      "exhaustPotential"
    ]
  ) {
    const value =
      item.kitchenProfile[
        field
      ];

    if (
      !Number.isInteger(value) ||
      value < 0 ||
      value > 100
    ) {
      throw new Error(
        `Property template "${item.id}" has invalid kitchenProfile.${field}`
      );
    }
  }

  if (
    !item.districtWeights ||
    typeof item.districtWeights !==
      "object" ||
    Array.isArray(
      item.districtWeights
    ) ||
    Object.values(
      item.districtWeights
    ).some(
      weight =>
        !Number.isFinite(weight) ||
        weight < 0
    )
  ) {
    throw new Error(
      `Property template "${item.id}" has invalid districtWeights`
    );
  }

  return true;
}
