import {
  menuEngineeringSystem
} from "../../../systems/MenuEngineeringSystem.js";

import {
  buildFormalPageChrome
} from "../../components/FormalPageChromeModel.js";

class MenuEngineeringPageSystem {
  getPage(
    restaurantId
  ) {
    const analysis =
      menuEngineeringSystem
        .analyze(
          restaurantId
        );

    const notices =
      [];

    if (
      analysis.counts.puzzle >
        0 ||
      analysis.counts.dog >
        0
    ) {
      notices.push({
        id:
          "menu_engineering_attention",

        type:
          "warning",

        title:
          "菜单诊断",

        message:
          `当前有${analysis.counts.puzzle}道问题菜、${analysis.counts.dog}道低效菜需要关注`,

        priority:
          70
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
        "menu-engineering",

      topBar:
        chrome.topBar,

      noticeTicker:
        chrome.noticeTicker,

      title:
        "菜单工程",

      ...analysis
    };
  }
}

export const menuEngineeringPageSystem =
  new MenuEngineeringPageSystem();

export {
  MenuEngineeringPageSystem
};
