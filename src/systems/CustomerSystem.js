import { entitySystem } from "../core/EntitySystem.js";
import { eventBus } from "../core/EventBus.js";
import { customerSegmentSystem } from "./CustomerSegmentSystem.js";

function requireCustomer(id) {
  const customer = entitySystem.get("customer", id);
  if (!customer) {
    throw new Error(`Customer "${id}" does not exist`);
  }
  return customer;
}

class CustomerSystem {
  create({
    name = "散客",
    budget = 10000,
    priceSensitivity = null,
    patience = null,
    segmentId = null
  } = {}) {
    if (typeof name !== "string" || !name.trim()) {
      throw new TypeError("Customer name is required");
    }

    if (!Number.isInteger(budget) || budget <= 0) {
      throw new RangeError("Customer budget must be positive");
    }

    const segment = segmentId ? customerSegmentSystem.get(segmentId) : null;

    if (segmentId && !segment) {
      throw new Error(`Customer segment "${segmentId}" does not exist`);
    }

    const resolvedPriceSensitivity =
      priceSensitivity ?? segment?.priceSensitivity ?? 50;

    const resolvedPatience =
      patience ??
      (segment
        ? Math.max(0, Math.min(100, Math.round(segment.queuePatienceMinutes * 4)))
        : 50);

    const customer = entitySystem.create("customer", {
      name: name.trim(),
      segmentId: segment?.id ?? null,
      segmentName: segment?.name ?? null,
      budget,
      priceSensitivity: Math.max(0, Math.min(100, resolvedPriceSensitivity)),
      patience: Math.max(0, Math.min(100, resolvedPatience)),
      spendingPower: segment?.spendingPower ?? null,
      qualitySensitivity: segment?.qualitySensitivity ?? null,
      speedSensitivity: segment?.speedSensitivity ?? null,

      ageRange:
        segment?.ageRange
          ? structuredClone(
              segment.ageRange
            )
          : null,

      occupationTags:
        segment?.occupationTags
          ? [
              ...segment
                .occupationTags
            ]
          : [],

      partySize:
        segment?.partySize
          ? structuredClone(
              segment.partySize
            )
          : null,

      repeatPreference:
        segment?.repeatPreference ??
        null,

      reviewPropensity:
        segment?.reviewPropensity ??
        null,

      channelPreferences:
        segment
          ?.channelPreferences
          ? structuredClone(
              segment.channelPreferences
            )
          : null,
      visits: 0,
      totalSpend: 0,
      averageSatisfaction: 0,
      lastRestaurantId: null,
      lastOrderId: null
    });

    eventBus.emit("customer:created", {
      customer: structuredClone(customer)
    });

    return customer;
  }

  get(id) {
    return requireCustomer(id);
  }

  recordVisit({
    customerId,
    restaurantId,
    orderId,
    spend,
    satisfaction
  }) {
    const customer = requireCustomer(customerId);
    const visits = customer.visits + 1;

    const averageSatisfaction = Math.round(
      (
        customer.averageSatisfaction * customer.visits +
        satisfaction
      ) / visits
    );

    return entitySystem.update("customer", customerId, {
      visits,
      totalSpend: customer.totalSpend + spend,
      averageSatisfaction,
      lastRestaurantId: restaurantId,
      lastOrderId: orderId
    });
  }
}

export const customerSystem = new CustomerSystem();
export { CustomerSystem };
