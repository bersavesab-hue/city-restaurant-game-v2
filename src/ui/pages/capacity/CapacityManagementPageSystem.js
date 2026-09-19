import {
  serviceCapacitySystem
} from "../../../systems/ServiceCapacitySystem.js";

import {
  buildFormalPageChrome
} from "../../components/FormalPageChromeModel.js";

class CapacityManagementPageSystem {
  getPage(
    restaurantId
  ) {
    const dashboard =
      serviceCapacitySystem
        .getDashboard(
          restaurantId
        );

    const notices =
      [];

    if (
      dashboard.last7Days
        .abandoned >
      0
    ) {
      notices.push({
        id:
          "capacity_abandonment",

        type:
          "warning",

        title:
          "排队流失",

        message:
          `近7天已有${dashboard.last7Days.abandoned}位顾客因等待离开`,

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

    const dashboard =
      serviceCapacitySystem
        .getDashboard(
          restaurantId
        );

    const notices =
      [];

    if (
      dashboard.last7Days
        .abandoned >
      0
    ) {
      notices.push({
        id:
          "capacity_abandonment",
        type:
          "warning",
        title:
          "排队流失",
        message:
          `近7天已有${dashboard.last7Days.abandoned}位顾客因等待离开`,
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
        "capacity",

      restaurantId,

      topBar:
        chrome.topBar,

      noticeTicker:
        chrome.noticeTicker,

      topBar:
        chrome.topBar,

      noticeTicker:
        chrome.noticeTicker,

      title:
        "产能与排队",

      ...dashboard
    };
  }
}

export const capacityManagementPageSystem =
  new CapacityManagementPageSystem();

export {
  CapacityManagementPageSystem
};
