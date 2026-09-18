import {
  restaurantSystem
} from "../../../systems/RestaurantSystem.js";

import {
  financeSystem
} from "../../../systems/FinanceSystem.js";

import {
  honorArchiveSystem
} from "../../../systems/HonorArchiveSystem.js";

import {
  awardFeedbackSystem
} from "../../../systems/AwardFeedbackSystem.js";


const MORE_GROUPS =
  Object.freeze([
    {
      id: "customer",
      title: "顾客与品牌",

      entries: [
        {
          id: "member-marketing",
          title: "会员营销",
          description: "会员等级、权益、营销活动与顾客维护",
          target: "member-marketing",
          state: "ready"
        },
        {
          id: "honor-hall",
          title: "荣誉馆",
          description: "查看门店、菜品与员工获得的永久荣誉",
          target: "honor-hall",
          state: "ready"
        },
        {
          id: "awards-center",
          title: "奖项中心",
          description: "查看月度、季度、年度奖项和评审进度",
          target: "awards-center",
          state: "ready"
        }
      ]
    },

    {
      id: "growth",
      title: "扩张与管理",

      entries: [
        {
          id: "store-progress",
          title: "成长与解锁",
          description: "查看等级、经验、经营上限和后续功能解锁",
          target: "store-progress",
          state: "ready"
        },

        {
          id: "compliance-center",
          title: "合规中心",
          description: "证照申请、续期、抽查、整改与处罚管理",
          target: "compliance-center",
          state: "ready"
        },

        {
          id: "chain",
          title: "连锁管理",
          description: "多门店、品牌扩张与连锁经营",
          target: "chain",
          state: "placeholder"
        }
      ]
    },

    {
      id: "system",
      title: "系统",

      entries: [
        {
          id: "settings",
          title: "设置",
          description: "游戏设置、显示和其他基础选项",
          target: "settings",
          state: "placeholder"
        }
      ]
    }
  ]);


class MoreHubPageSystem {
  getPage(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const honor =
      honorArchiveSystem
        .getSummary(
          restaurantId
        );

    return {
      pageId:
        "more-home",

      title:
        "更多",

      restaurantId,

      restaurant: {
        id:
          restaurant.id,

        name:
          restaurant.name,

        level:
          restaurant.level ??
          1,

        reputation:
          restaurant.reputation ??
          0,

        balance:
          financeSystem.getBalance(
            restaurantId
          )
      },

      badges: {
        awards:
          awardFeedbackSystem
            .getUnreadCount(
              restaurantId
            ),

        honors:
          honor.totalHonors,

        prestige:
          honor.prestigePoints
      },

      groups:
        structuredClone(
          MORE_GROUPS
        )
    };
  }
}


export const moreHubPageSystem =
  new MoreHubPageSystem();


export {
  MoreHubPageSystem,
  MORE_GROUPS
};
