export const OPERATING_PERMIT_SCHEMA_VERSION = 1;

export const OPERATING_PERMIT_KINDS = Object.freeze([
  "business_registration",
  "food_service",
  "fire_safety",
  "exhaust"
]);

export const COMPLIANCE_SEVERITIES = Object.freeze([
  "minor",
  "major",
  "critical"
]);

export const COMPLIANCE_POLICY = Object.freeze({
  renewalWindowDays: 30,
  correctionDays: Object.freeze({
    minor: 10,
    major: 7,
    critical: 3
  }),
  fines: Object.freeze({
    minor: 500,
    major: 2500,
    critical: 8000
  }),
  scorePenalty: Object.freeze({
    minor: 5,
    major: 18,
    critical: 40
  })
});

export function validateOperatingPermitDefinition(item) {
  if (!item || typeof item !== "object") {
    throw new TypeError("Operating permit definition must be an object");
  }

  if (item.schemaVersion !== OPERATING_PERMIT_SCHEMA_VERSION) {
    throw new Error(
      `Permit "${item.permitKind ?? "unknown"}" has invalid schemaVersion`
    );
  }

  if (!OPERATING_PERMIT_KINDS.includes(item.permitKind)) {
    throw new Error(
      `Permit "${item.permitKind}" has invalid permitKind`
    );
  }

  for (const field of ["name", "description"]) {
    if (typeof item[field] !== "string" || !item[field].trim()) {
      throw new Error(
        `Permit "${item.permitKind}" requires ${field}`
      );
    }
  }

  for (
    const field
    of [
      "applicationFee",
      "processingDays",
      "validityDays",
      "renewalFee",
      "inspectionIntervalDays"
    ]
  ) {
    if (!Number.isInteger(item[field]) || item[field] < 0) {
      throw new Error(
        `Permit "${item.permitKind}" has invalid ${field}`
      );
    }
  }

  if (item.processingDays < 1) {
    throw new Error(
      `Permit "${item.permitKind}" processingDays must be at least 1`
    );
  }

  if (item.validityDays < 30) {
    throw new Error(
      `Permit "${item.permitKind}" validityDays must be at least 30`
    );
  }

  return true;
}
