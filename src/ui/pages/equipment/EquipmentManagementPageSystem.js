import {
  restaurantEquipmentSystem
} from "../../../systems/RestaurantEquipmentSystem.js";

import {
  serviceCapacitySystem
} from "../../../systems/ServiceCapacitySystem.js";


class EquipmentManagementPageSystem {
  getPage(
    restaurantId
  ) {
    return {
      pageId:
        "equipment-management",

      title:
        "设备与工位",

      restaurantId,

      dashboard:
        restaurantEquipmentSystem
          .getDashboard(
            restaurantId
          ),

      storeCapacity:
        serviceCapacitySystem
          .getHourlyCapacity(
            restaurantId
          ),

      catalog:
        restaurantEquipmentSystem
          .getDefinitions()
    };
  }
}


export const equipmentManagementPageSystem =
  new EquipmentManagementPageSystem();

export {
  EquipmentManagementPageSystem
};
