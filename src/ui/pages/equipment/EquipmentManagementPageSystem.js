import {
  restaurantEquipmentSystem
} from "../../../systems/RestaurantEquipmentSystem.js";

import {
  serviceCapacitySystem
} from "../../../systems/ServiceCapacitySystem.js";

import {
  restaurantSystem
} from "../../../systems/RestaurantSystem.js";


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
