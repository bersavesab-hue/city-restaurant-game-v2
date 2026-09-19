import {
  openingPermitSystem
} from "../../../systems/OpeningPermitSystem.js";

import {
  buildFormalPageChrome
} from "../../components/FormalPageChromeModel.js";

class ComplianceCenterPageSystem {
  getPage(restaurantId) {
    const status =
      openingPermitSystem
        .getDashboard(
          restaurantId
        );

    const notices =
      [];

    if (
      status.openViolations
        .length >
      0
    ) {
      notices.push({
        id:
          "compliance_violations",

        type:
          "danger",

        title:
          "整改任务",

        message:
          `当前有${status.openViolations.length}项整改任务尚未完成`,

        priority:
          120
      });
    }

    if (
      status.renewalDueCount >
      0
    ) {
      notices.push({
        id:
          "compliance_renewal",

        type:
          "warning",

        title:
          "证照续期",

        message:
          `${status.renewalDueCount}项证照需要续期`,

        priority:
          90
      });
    }

    const chrome =
      buildFormalPageChrome(
        restaurantId,
        {
          notices
        }
      );

    return {
      pageId: "compliance-center",

      topBar:
        chrome.topBar,

      noticeTicker:
        chrome.noticeTicker,
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
