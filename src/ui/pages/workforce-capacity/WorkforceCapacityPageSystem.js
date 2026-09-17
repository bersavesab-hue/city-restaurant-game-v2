import {
  workforceCapacitySystem
} from "../../../systems/WorkforceCapacitySystem.js";

import {
  serviceCapacitySystem
} from "../../../systems/ServiceCapacitySystem.js";

class WorkforceCapacityPageSystem {
  getPage(
    restaurantId
  ) {
    return {
      pageId:
        "workforce-capacity",

      title:
        "员工产能",

      restaurantId,

      workforce:
        workforceCapacitySystem
          .getDashboard(
            restaurantId
          ),

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
