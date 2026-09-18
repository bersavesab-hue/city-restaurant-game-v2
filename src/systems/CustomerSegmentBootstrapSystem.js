import { customerSegmentSystem } from "./CustomerSegmentSystem.js";
import { CUSTOMER_SEGMENTS_V3 } from "../data/customerSegments.v3.js";

class CustomerSegmentBootstrapSystem {
  ensureLoaded({
    overwrite = false
  } = {}) {
    let effectiveOverwrite =
      overwrite;

    if (!overwrite) {
      const complete =
        CUSTOMER_SEGMENTS_V3.every(
          segment =>
            customerSegmentSystem
              .exists(
                segment.id
              )
        );

      if (complete) {
        return customerSegmentSystem
          .getAll();
      }

      effectiveOverwrite =
        true;
    }

    customerSegmentSystem.load(
      CUSTOMER_SEGMENTS_V3,
      {
        overwrite:
          effectiveOverwrite
      }
    );

    return customerSegmentSystem
      .getAll();
  }
}

export const customerSegmentBootstrapSystem = new CustomerSegmentBootstrapSystem();
export { CustomerSegmentBootstrapSystem };
