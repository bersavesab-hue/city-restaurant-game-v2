export const MEMBER_PROGRAM_SCHEMA_VERSION = 1;

export const MEMBER_LEVEL_IDS = Object.freeze([
  "member",
  "silver",
  "gold",
  "black"
]);

export const MEMBER_POINT_POLICY =
  Object.freeze({
    earnPerAmount: 100,
    pointValue: 1,
    maxRedemptionRate: 0.2,
    expiryDays: 180,
    maxCombinedDiscountRate: 0.4,
    downgradeCooldownDays: 30,
    enrollmentThreshold: 78,
    enrollmentMinSatisfaction: 75
  });

export const MEMBER_IDENTITY_POLICY =
  Object.freeze({
    unlockFeature:
      "membership",

    maxRecognizedCustomersPerSegment:
      10,

    recognitionRate:
      0.22,

    repeatCustomerBias:
      0.78,

    maxAggregateRecognizedVisits:
      5,

    maxSegmentRetentionMultiplier:
      1.1
  });


export function getMemberEnrollmentPropensity(
  segment
) {
  if (!segment) {
    return 50;
  }

  const repeat =
    Number(
      segment.repeatPreference ??
      50
    );

  const price =
    Number(
      segment.priceSensitivity ??
      50
    );

  const review =
    Number(
      segment.reviewPropensity ??
      50
    );

  const spending =
    Number(
      segment.spendingPower ??
      50
    );

  return Math.round(
    Math.max(
      0,
      Math.min(
        100,
        repeat * 0.65 +
        price * 0.15 +
        review * 0.05 +
        spending * 0.15
      )
    )
  );
}

export function validateMemberLevel(
  item
) {
  if (
    !item ||
    typeof item !== "object"
  ) {
    throw new TypeError(
      "Member level must be an object"
    );
  }

  if (
    item.schemaVersion !==
    MEMBER_PROGRAM_SCHEMA_VERSION
  ) {
    throw new Error(
      `Member level "${item.id ?? "unknown"}" has invalid schemaVersion`
    );
  }

  if (
    !MEMBER_LEVEL_IDS.includes(
      item.id
    )
  ) {
    throw new Error(
      `Member level "${item.id}" has invalid id`
    );
  }

  for (
    const field
    of [
      "name"
    ]
  ) {
    if (
      typeof item[field] !==
        "string" ||
      !item[field].trim()
    ) {
      throw new Error(
        `Member level "${item.id}" requires ${field}`
      );
    }
  }

  for (
    const field
    of [
      "minVisits",
      "minSpend",
      "minLifetimePoints"
    ]
  ) {
    if (
      !Number.isInteger(
        item[field]
      ) ||
      item[field] < 0
    ) {
      throw new Error(
        `Member level "${item.id}" has invalid ${field}`
      );
    }
  }

  if (
    !Number.isFinite(
      item.discount
    ) ||
    item.discount < 0 ||
    item.discount > 20
  ) {
    throw new Error(
      `Member level "${item.id}" has invalid discount`
    );
  }

  if (
    !Number.isFinite(
      item.pointMultiplier
    ) ||
    item.pointMultiplier < 1 ||
    item.pointMultiplier > 3
  ) {
    throw new Error(
      `Member level "${item.id}" has invalid pointMultiplier`
    );
  }

  if (
    item.inactivityDowngradeDays !==
      null &&
    (
      !Number.isInteger(
        item.inactivityDowngradeDays
      ) ||
      item.inactivityDowngradeDays <
        30
    )
  ) {
    throw new Error(
      `Member level "${item.id}" has invalid inactivityDowngradeDays`
    );
  }

  return true;
}
