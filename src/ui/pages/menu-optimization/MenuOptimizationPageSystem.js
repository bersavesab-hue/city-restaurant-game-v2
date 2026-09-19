import {
  menuOptimizationSystem
} from "../../../systems/MenuOptimizationSystem.js";

import {
  menuEngineeringSystem
} from "../../../systems/MenuEngineeringSystem.js";

import {
  buildFormalPageChrome
} from "../../components/FormalPageChromeModel.js";

class MenuOptimizationPageSystem {
  getPage(
    restaurantId
  ) {
    const dashboard =
      menuOptimizationSystem
        .getDashboard(
          restaurantId
        );

    const engineering =
      menuEngineeringSystem
        .analyze(
          restaurantId
        );

    const chrome =
      buildFormalPageChrome(
        restaurantId,
        {
          notices:
            dashboard.activePromotions >
            0
              ? [
                  {
                    id:
                      "menu_promotion_active",

                    type:
                      "info",

                    title:
                      "菜单活动",

                    message:
                      `当前有${dashboard.activePromotions}个菜品促销正在执行`,

                    priority:
                      40
                  }
                ]
              : []
        }
      );

    const dashboard =
      menuOptimizationSystem
        .getDashboard(
          restaurantId
        );

    const engineering =
      menuEngineeringSystem
        .analyze(
          restaurantId
        );

    const chrome =
      buildFormalPageChrome(
        restaurantId,
        {
          notices:
            dashboard.activePromotions >
            0
              ? [
                  {
                    id:
                      "menu_promotion_active",
                    type:
                      "info",
                    title:
                      "菜单活动",
                    message:
                      `当前有${dashboard.activePromotions}个菜品促销正在执行`,
                    priority:
                      40
                  }
                ]
              : []
        }
      );

    return {
      pageId:
        "menu-optimization",

      topBar:
        chrome.topBar,

      noticeTicker:
        chrome.noticeTicker,

      topBar:
        chrome.topBar,

      noticeTicker:
        chrome.noticeTicker,

      title:
        "菜单调整",

      restaurantId,

      dashboard,

      engineering
    };
  }
}

export const menuOptimizationPageSystem =
  new MenuOptimizationPageSystem();

export {
  MenuOptimizationPageSystem
};
