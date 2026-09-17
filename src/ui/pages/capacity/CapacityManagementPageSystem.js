import {
  serviceCapacitySystem
} from "../../../systems/ServiceCapacitySystem.js";

class CapacityManagementPageSystem {
  getPage(
    restaurantId
  ) {
    return {
      pageId:
        "capacity",

      title:
        "产能与排队",

      ...serviceCapacitySystem
        .getDashboard(
          restaurantId
        )
    };
  }
}

export const capacityManagementPageSystem =
  new CapacityManagementPageSystem();

export {
  CapacityManagementPageSystem
};
