import {
  restaurantEquipmentSystem
} from "../../../systems/RestaurantEquipmentSystem.js";

import {
  serviceCapacitySystem
} from "../../../systems/ServiceCapacitySystem.js";

import {
  restaurantSystem
} from "../../../systems/RestaurantSystem.js";

import {
  buildFormalPageChrome
} from "../../components/FormalPageChromeModel.js";


class EquipmentManagementPageSystem {
  getPage(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const catalog =
      restaurantEquipmentSystem
        .getDefinitions({
          storeLevel:
            restaurant.level ??
            1
        });

    const dashboard =
      restaurantEquipmentSystem
        .getDashboard(
          restaurantId
        );

    const notices =
      [];

    if (
      dashboard.broken >
      0
    ) {
      notices.push({
        id:
          "equipment_broken",

        type:
          "danger",

        title:
          "设备故障",

        message:
          `当前有${dashboard.broken}台设备故障`,

        priority:
          120
      });
    } else if (
      dashboard.maintenanceDue >
      0
    ) {
      notices.push({
        id:
          "equipment_maintenance",

        type:
          "warning",

        title:
          "设备保养",

        message:
          `${dashboard.maintenanceDue}台设备需要保养`,

        priority:
          80
      });
    }

    const chrome =
      buildFormalPageChrome(
        restaurantId,
        {
          notices,
          restaurant
        }
      );

    return {
      pageId:
        "equipment-management",

      restaurantId,

      topBar:
        chrome.topBar,

      noticeTicker:
        chrome.noticeTicker,

      title:
        "设备与工位",

      dashboard,

      storeCapacity:
        serviceCapacitySystem
          .getHourlyCapacity(
            restaurantId
          ),

      storeLevel:
        restaurant.level ??
        1,

      catalog,

      lockedCount:
        restaurantEquipmentSystem
          .getDefinitions()
          .length -
        catalog.length
    };
  }
}


export const equipmentManagementPageSystem =
  new EquipmentManagementPageSystem();


export {
  EquipmentManagementPageSystem
};
