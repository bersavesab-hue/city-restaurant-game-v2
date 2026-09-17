import { entitySystem } from "../core/EntitySystem.js";
import { eventBus } from "../core/EventBus.js";

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
    priceSensitivity = 50,
    patience = 50
  } = {}) {
    if (typeof name !== "string" || !name.trim()) {
      throw new TypeError("Customer name is required");
    }

    if (!Number.isInteger(budget) || budget <= 0) {
      throw new RangeError("Customer budget must be positive");
    }

    const customer = entitySystem.create("customer", {
      name: name.trim(),
      budget,
      priceSensitivity: Math.max(0, Math.min(100, priceSensitivity)),
      patience: Math.max(0, Math.min(100, patience)),
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
