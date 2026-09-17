import {
  menuEngineeringSystem
} from "../../../systems/MenuEngineeringSystem.js";

class MenuEngineeringPageSystem {
  getPage(
    restaurantId
  ) {
    return {
      pageId:
        "menu-engineering",

      title:
        "菜单工程",

      ...menuEngineeringSystem
        .analyze(
          restaurantId
        )
    };
  }
}

export const menuEngineeringPageSystem =
  new MenuEngineeringPageSystem();

export {
  MenuEngineeringPageSystem
};
