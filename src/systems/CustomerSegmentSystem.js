import { dataRegistry } from "../core/DataRegistry.js";

const COLLECTION =
  "customer_segments";

function validatePercent(
  value,
  name
) {
  if (
    !Number.isInteger(value) ||
    value < 0 ||
    value > 100
  ) {
    throw new Error(
      `${name} must be 0-100`
    );
  }
}

function validateSegment(item) {
  if (
    !item ||
    typeof item !== "object"
  ) {
    throw new TypeError(
      "Customer segment must be an object"
    );
  }

  if (
    typeof item.id !== "string" ||
    !item.id.trim()
  ) {
    throw new Error(
      "Customer segment id is required"
    );
  }

  if (
    typeof item.name !== "string" ||
    !item.name.trim()
  ) {
    throw new Error(
      "Customer segment name is required"
    );
  }

  validatePercent(
    item.spendingPower,
    "spendingPower"
  );

  validatePercent(
    item.priceSensitivity,
    "priceSensitivity"
  );

  validatePercent(
    item.qualitySensitivity,
    "qualitySensitivity"
  );

  validatePercent(
    item.speedSensitivity,
    "speedSensitivity"
  );

  if (
    item.categoryPreferences !==
    undefined
  ) {
    if (
      !item.categoryPreferences ||
      typeof item.categoryPreferences !==
        "object" ||
      Array.isArray(
        item.categoryPreferences
      )
    ) {
      throw new Error(
        "categoryPreferences must be an object"
      );
    }

    for (
      const weight
      of Object.values(
        item.categoryPreferences
      )
    ) {
      if (
        !Number.isFinite(weight) ||
        weight < 0
      ) {
        throw new Error(
          "Invalid category preference"
        );
      }
    }
  }

  if (
    !item.hourWeights ||
    typeof item.hourWeights !==
      "object" ||
    Array.isArray(
      item.hourWeights
    )
  ) {
    throw new Error(
      "hourWeights is required"
    );
  }

  for (
    const [hour, weight]
    of Object.entries(
      item.hourWeights
    )
  ) {
    const numericHour =
      Number(hour);

    if (
      !Number.isInteger(
        numericHour
      ) ||
      numericHour < 0 ||
      numericHour > 23
    ) {
      throw new Error(
        "Invalid hourWeights hour"
      );
    }

    if (
      !Number.isFinite(weight) ||
      weight < 0
    ) {
      throw new Error(
        "Invalid hour weight"
      );
    }
  }

  return true;
}

class CustomerSegmentSystem {
  load(
    records,
    {
      overwrite = false
    } = {}
  ) {
    if (
      !Array.isArray(records)
    ) {
      throw new TypeError(
        "Customer segments must be an array"
      );
    }

    records.forEach(
      validateSegment
    );

    return dataRegistry.register(
      COLLECTION,
      records,
      { overwrite }
    );
  }

  get(id) {
    return dataRegistry.get(
      COLLECTION,
      id
    );
  }

  getAll() {
    return dataRegistry.getAll(
      COLLECTION
    );
  }

  exists(id) {
    return dataRegistry.has(
      COLLECTION,
      id
    );
  }

  getHourWeight(
    id,
    hour
  ) {
    const segment =
      this.get(id);

    if (!segment) {
      return 0;
    }

    return (
      segment.hourWeights?.[
        hour
      ] ?? 0
    );
  }
}

export const customerSegmentSystem =
  new CustomerSegmentSystem();

export {
  CustomerSegmentSystem,
  validateSegment
};
