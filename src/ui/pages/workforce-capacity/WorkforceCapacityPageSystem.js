import {
  workforceCapacitySystem
} from "../../../systems/WorkforceCapacitySystem.js";

import {
  serviceCapacitySystem
} from "../../../systems/ServiceCapacitySystem.js";

import {
  buildFormalPageChrome
} from "../../components/FormalPageChromeModel.js";

class WorkforceCapacityPageSystem {
  getPage(
    restaurantId
  ) {
    const workforce =
      workforceCapacitySystem
        .getDashboard(
          restaurantId
        );

    const notices =
      [];

    const unavailable =
      workforce.capacity
        .absentEmployees
        .length +
      workforce.capacity
        .exhaustedEmployees
        .length;

    if (
      unavailable >
      0
    ) {
      notices.push({
        id:
          "workforce_unavailable",
        type:
          "warning",
        title:
          "人力预警",
        message:
          `当前有${unavailable}名员工无法正常在岗`,
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
      pageId:
        "workforce-capacity",

      topBar:
        chrome.topBar,

      noticeTicker:
        chrome.noticeTicker,

      title:
        "员工产能",

      restaurantId,

      workforce,

      storeCapacity:
        serviceCapacitySystem
          .getHourlyCapacity(
            restaurantId
          )
    };
  }
}

export const workforceCapacityPageSystem =
  new WorkforceCapacityPageSystem();

export {
  WorkforceCapacityPageSystem
};
