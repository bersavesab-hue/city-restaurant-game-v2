import {
  openingPermitSystem
} from "../../../systems/OpeningPermitSystem.js";

class ComplianceCenterPageSystem {
  getPage(restaurantId) {
    const status =
      openingPermitSystem
        .getDashboard(
          restaurantId
        );

    return {
      pageId: "compliance-center",
      title: "合规中心",
      restaurantId,
      status,
      permits:
        status.permits,
      violations:
        status.openViolations,
      inspections:
        status.inspections
    };
  }

  submitPermit(
    restaurantId,
    permitKind
  ) {
    openingPermitSystem
      .submitPermit(
        restaurantId,
        permitKind
      );

    return this.getPage(
      restaurantId
    );
  }

  renewPermit(
    restaurantId,
    permitKind
  ) {
    openingPermitSystem
      .renewPermit(
        restaurantId,
        permitKind
      );

    return this.getPage(
      restaurantId
    );
  }

  inspectPermit(
    restaurantId,
    permitKind
  ) {
    openingPermitSystem
      .runInspection(
        restaurantId,
        permitKind
      );

    return this.getPage(
      restaurantId
    );
  }

  resolveViolation(
    restaurantId,
    violationId
  ) {
    openingPermitSystem
      .resolveViolation(
        violationId
      );

    return this.getPage(
      restaurantId
    );
  }
}

export const complianceCenterPageSystem =
  new ComplianceCenterPageSystem();

export {
  ComplianceCenterPageSystem
};
