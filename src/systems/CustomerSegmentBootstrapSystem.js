import { customerSegmentSystem } from "./CustomerSegmentSystem.js";
import { CUSTOMER_SEGMENTS_V3 } from "../data/customerSegments.v3.js";

class CustomerSegmentBootstrapSystem {
  ensureLoaded({ overwrite = false } = {}) {
    const existing = customerSegmentSystem.getAll();

    if (existing.length === 0 || overwrite) {
      customerSegmentSystem.load(CUSTOMER_SEGMENTS_V3, { overwrite: true });
    }

    return customerSegmentSystem.getAll();
  }
}

export const customerSegmentBootstrapSystem = new CustomerSegmentBootstrapSystem();
export { CustomerSegmentBootstrapSystem };
