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

import {
  storeProgressSystem
} from "../../../systems/StoreProgressSystem.js";

import {
  chainSystem
} from "../../../systems/ChainSystem.js";

import {
  buildFormalPageChrome
} from "../../components/FormalPageChromeModel.js";


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
          state: "ready",
          unlockFeature: "membership"
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
          id: "lease",
          title: "租约管理",
          description: "查看租金、物业费、押金、欠款与续租",
          target: "lease",
          state: "ready"
        },

        {
          id: "chain",
          title: "扩张与连锁",
          description: "第二门店、品牌管理、中央厨房与区域扩张",
          target: "chain",
          state: "ready",
          unlockFeature: "second_store",
          unlockScope: "chain"
        },

        {
          id: "brand-investments",
          title: "长期品牌基建",
          description: "CRM、会员服务、冷链仓配与区域品牌总部",
          target: "brand-investments",
          state: "ready",
          minLevel: 7
        }
      ]
    },

    {
      id: "system",
      title: "系统",

      entries: [
        {
          id: "feedback",
          title: "测试反馈",
          description: "记录问题、评分与建议，并生成可复制诊断报告",
          target: "feedback",
          state: "ready"
        },

        {
          id: "settings",
          title: "设置",
          description: "运行速度、暂停与存档控制",
          target: "settings",
          state: "ready"
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

    const notices =
      [];

    const unreadAwards =
      awardFeedbackSystem
        .getUnreadCount(
          restaurantId
        );

    if (
      unreadAwards >
      0
    ) {
      notices.push({
        id:
          "more_awards",

        type:
          "success",

        title:
          "奖项消息",

        message:
          `有${unreadAwards}条新的奖项反馈`,

        priority:
          70
      });
    }

    const chrome =
      buildFormalPageChrome(
        restaurantId,
        {
          notices,
          restaurant,
          balance:
            financeSystem.getBalance(
              restaurantId
            )
        }
      );

    return {
      pageId:
        "more-home",

      topBar:
        chrome.topBar,

      noticeTicker:
        chrome.noticeTicker,

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
          unreadAwards,

        honors:
          honor.totalHonors,

        prestige:
          honor.prestigePoints
      },

      groups:
        structuredClone(
          MORE_GROUPS
        ).map(
          group => ({
            ...group,

            entries:
              group.entries
                .map(
                  entry => {
                    if (
                      Number.isInteger(
                        entry.minLevel
                      )
                    ) {
                      const anchorRestaurant =
                        chainSystem
                          .getAnchorRestaurant(
                            restaurantId
                          );

                      const unlocked =
                        (
                          anchorRestaurant
                            .level ??
                          1
                        ) >=
                        entry.minLevel;

                      return {
                        ...entry,

                        state:
                          unlocked
                            ? entry.state
                            : "locked",

                        unlockLevel:
                          entry.minLevel
                      };
                    }

                    if (
                      !entry
                        .unlockFeature
                    ) {
                      return entry;
                    }

                    const unlocked =
                      entry.unlockScope ===
                        "chain"
                        ? chainSystem
                            .isFeatureUnlocked(
                              restaurantId,
                              entry
                                .unlockFeature
                            )
                        : storeProgressSystem
                            .isUnlocked(
                              restaurantId,
                              entry
                                .unlockFeature
                            );

                    return {
                      ...entry,

                      state:
                        unlocked
                          ? entry.state
                          : "locked",

                      unlockLevel:
                        storeProgressSystem
                          .getUnlockLevel(
                            entry
                              .unlockFeature
                          )
                    };
                  }
                )
          })
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
