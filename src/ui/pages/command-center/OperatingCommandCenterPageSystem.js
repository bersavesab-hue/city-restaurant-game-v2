import {
  gameState
} from "../../../core/GameState.js";

import {
  operatingCommandCenterSystem
} from "../../../systems/OperatingCommandCenterSystem.js";

import {
  awardFeedbackSystem
} from "../../../systems/AwardFeedbackSystem.js";

import {
  buildGlobalTopBarModel,
  buildNoticeTickerModel
} from "../../components/GlobalChromeModel.js";

import {
  gameChromeSystem
} from "../../components/GameChromeSystem.js";


function noticeType(
  severity
) {
  return {
    critical: "danger",
    high: "warning",
    medium: "warning",
    low: "info"
  }[severity] ?? "info";
}


class OperatingCommandCenterPageSystem {
  getPage(
    restaurantId
  ) {
    const dashboard =
      operatingCommandCenterSystem
        .getDashboard(
          restaurantId
        );

    const awardFeedback =
      awardFeedbackSystem
        .getDashboard(
          restaurantId
        );

    const time =
      gameState.getSection(
        "time"
      );

    const runtime =
      gameState.getSection(
        "runtime"
      );

    const notices =
      dashboard.priorities
        .map(
          item => ({
            id:
              item.id,

            type:
              noticeType(
                item.severity
              ),

            title:
              item.title,

            message:
              item.description,

            priority:
              {
                critical: 100,
                high: 80,
                medium: 60,
                low: 40
              }[
                item.severity
              ] ?? 20,

            action:
              item.target
          })
        );

    if (
      awardFeedback
        .notifications
        .length >
      0
    ) {
      const awardNotice =
        awardFeedback
          .notifications[0];

      notices.push({
        id:
          "award_feedback",

        type:
          "info",

        title:
          awardNotice.title,

        message:
          awardNotice.message,

        priority:
          55,

        action:
          awardNotice.action
      });
    }

    if (
      notices.length ===
      0
    ) {
      notices.push({
        id:
          "command_center_normal",

        type:
          "success",

        title:
          "经营通报",

        message:
          "当前门店经营正常，可继续关注客流、库存和员工状态",

        priority:
          10,

        action:
          null
      });
    }

    return {
      pageId:
        "operating-command-center",

      title:
        "经营总控",

      ...dashboard,

      topBar:
        buildGlobalTopBarModel({
          restaurantName:
            dashboard
              .restaurant
              .name,

          balance:
            dashboard
              .finance
              .balance,

          storeLevel:
            dashboard
              .restaurant
              .level,

          reputation:
            dashboard
              .restaurant
              .reputation,

          time,
          runtime,

          currentStoreId:
            restaurantId
        }),

      noticeTicker:
        buildNoticeTickerModel(
          notices
        ),

      navigation:
        gameChromeSystem
          .getNavigation({
            restaurantId,

            activePageId:
              "operating-command-center"
          })
          .map(
            item => ({
              ...item,

              active:
                item.id ===
                "restaurant"
            })
          ),

      awardFeedback
    };
  }
}


export const operatingCommandCenterPageSystem =
  new OperatingCommandCenterPageSystem();

export {
  OperatingCommandCenterPageSystem
};
