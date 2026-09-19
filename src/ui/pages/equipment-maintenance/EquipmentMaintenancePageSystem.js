import {
  equipmentMaintenanceSystem
} from "../../../systems/EquipmentMaintenanceSystem.js";

import {
  buildFormalPageChrome
} from "../../components/FormalPageChromeModel.js";


class EquipmentMaintenancePageSystem {
  getPage(
    restaurantId
  ) {
    const dashboard =
      equipmentMaintenanceSystem
        .getDashboard(
          restaurantId
        );

    const notices =
      [];

    if (
      dashboard.broken >
      0 ||
      dashboard.highRisk >
      0
    ) {
      notices.push({
        id:
          "maintenance_risk",

        type:
          dashboard.broken >
            0
            ? "danger"
            : "warning",

        title:
          "设备风险",

        message:
          dashboard.broken >
            0
            ? `${dashboard.broken}台设备故障，需要立即处理`
            : `${dashboard.highRisk}台设备处于高故障风险`,

        priority:
          dashboard.broken >
            0
            ? 120
            : 90
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
      equipmentMaintenanceSystem
        .getDashboard(
          restaurantId
        );

    const notices =
      [];

    if (
      dashboard.broken >
      0 ||
      dashboard.highRisk >
      0
    ) {
      notices.push({
        id:
          "maintenance_risk",
        type:
          dashboard.broken >
            0
            ? "danger"
            : "warning",
        title:
          "设备风险",
        message:
          dashboard.broken >
            0
            ? `${dashboard.broken}台设备故障，需要立即处理`
            : `${dashboard.highRisk}台设备处于高故障风险`,
        priority:
          dashboard.broken >
            0
            ? 120
            : 90
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
        "equipment-maintenance",

      topBar:
        chrome.topBar,

      noticeTicker:
        chrome.noticeTicker,

      topBar:
        chrome.topBar,

      noticeTicker:
        chrome.noticeTicker,

      title:
        "设备维护",

      ...dashboard
    };
  }
}


export const equipmentMaintenancePageSystem =
  new EquipmentMaintenancePageSystem();

export {
  EquipmentMaintenancePageSystem
};
