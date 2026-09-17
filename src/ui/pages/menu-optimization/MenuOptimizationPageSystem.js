import {
  menuOptimizationSystem
} from "../../../systems/MenuOptimizationSystem.js";

import {
  menuEngineeringSystem
} from "../../../systems/MenuEngineeringSystem.js";

class MenuOptimizationPageSystem {
  getPage(
    restaurantId
  ) {
    return {
      pageId:
        "menu-optimization",

      title:
        "菜单调整",

      restaurantId,

      dashboard:
        menuOptimizationSystem
          .getDashboard(
            restaurantId
          ),

      engineering:
        menuEngineeringSystem
          .analyze(
            restaurantId
          )
    };
  }
}

export const menuOptimizationPageSystem =
  new MenuOptimizationPageSystem();

export {
  MenuOptimizationPageSystem
};
