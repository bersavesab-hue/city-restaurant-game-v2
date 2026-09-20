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
  lateGameInvestmentSystem
} from "../../../systems/LateGameInvestmentSystem.js";

import {
  customerLoyaltySystem
} from "../../../systems/CustomerLoyaltySystem.js";

import {
  memberBenefitSystem
} from "../../../systems/MemberBenefitSystem.js";

import {
  wordOfMouthSystem
} from "../../../systems/WordOfMouthSystem.js";

import {
  openingPermitSystem
} from "../../../systems/OpeningPermitSystem.js";

import {
  rankingCenterSystem
} from "../../../systems/RankingCenterSystem.js";

import {
  feedbackSystem
} from "../../../systems/FeedbackSystem.js";

import {
  gameState
} from "../../../core/GameState.js";

import {
  saveSystem
} from "../../../core/SaveSystem.js";

import {
  buildGlobalTopBarModel
} from "../../components/GlobalChromeModel.js";


function safe(fn, fallback) {
  try {
    return fn();
  } catch {
    return fallback;
  }
}


function getStores(restaurantId) {
  const current =
    restaurantSystem.get(
      restaurantId
    );

  const chain =
    safe(
      () =>
        chainSystem.getDashboard(
          restaurantId
        ),
      null
    );

  return chain?.stores ?? [current];
}


function getBrandGrowth(restaurantId) {
  const dashboard =
    safe(
      () =>
        lateGameInvestmentSystem.getDashboard(
          restaurantId
        ),
      {
        projects: []
      }
    );

  const projects =
    dashboard.projects ?? [];

  const owned =
    projects.filter(
      item =>
        item.owned
    ).length;

  return {
    total:
      projects.length,

    owned,

    progress:
      projects.length > 0
        ? owned / projects.length * 100
        : 0
  };
}


function getRankingStatus(restaurantId) {
  const overview =
    safe(
      () =>
        rankingCenterSystem.getOverview(
          restaurantId
        ),
      null
    );

  const best =
    overview?.playerHighlights?.[0] ??
    null;

  return {
    text:
      best
        ? (
            best.boardTitle +
            " 第" +
            best.rank +
            "名"
          )
        : "查看各类排行榜",
    badge:
      best && best.rank <= 3
        ? "TOP " + best.rank
        : ""
  };
}


function getMemberStatus(restaurantId) {
  const loyalty =
    safe(
      () =>
        customerLoyaltySystem.getDashboard(
          restaurantId
        ),
      null
    );

  const marketing =
    safe(
      () =>
        memberBenefitSystem.getDashboard(
          restaurantId
        ),
      null
    );

  return {
    members:
      loyalty?.members ?? 0,

    campaignCount:
      marketing?.campaigns?.length ?? 0
  };
}


function getReputationStatus(restaurantId) {
  const dashboard =
    safe(
      () =>
        wordOfMouthSystem.getDashboard(
          restaurantId
        ),
      null
    );

  return {
    score:
      dashboard?.reviewScore ?? 0,

    positives:
      dashboard?.positives ?? 0,

    negatives:
      dashboard?.negatives ?? 0,

    unread:
      dashboard?.latestReviews?.length ?? 0
  };
}


function getComplianceStatus(restaurantId) {
  const dashboard =
    safe(
      () =>
        openingPermitSystem.getDashboard(
          restaurantId
        ),
      null
    );

  return {
    violations:
      dashboard?.openViolations?.length ?? 0,

    renewalDue:
      dashboard?.renewalDueCount ?? 0
  };
}


function buildGroups(restaurantId) {
  const restaurant =
    restaurantSystem.get(
      restaurantId
    );

  const growth =
    getBrandGrowth(
      restaurantId
    );

  const ranking =
    getRankingStatus(
      restaurantId
    );

  const honor =
    honorArchiveSystem.getSummary(
      restaurantId
    );

  const awards =
    awardFeedbackSystem.getUnreadCount(
      restaurantId
    );

  const member =
    getMemberStatus(
      restaurantId
    );

  const reputation =
    getReputationStatus(
      restaurantId
    );

  const compliance =
    getComplianceStatus(
      restaurantId
    );

  const feedback =
    safe(
      () =>
        feedbackSystem.getSummary(),
      {}
    );

  const chainUnlocked =
    safe(
      () =>
        chainSystem.isFeatureUnlocked(
          restaurantId,
          "second_store"
        ),
      false
    );

  const chainUnlockLevel =
    safe(
      () =>
        storeProgressSystem.getUnlockLevel(
          "second_store"
        ),
      null
    );

  const membershipUnlocked =
    safe(
      () =>
        storeProgressSystem.isUnlocked(
          restaurantId,
          "membership"
        ),
      false
    );

  const membershipUnlockLevel =
    safe(
      () =>
        storeProgressSystem.getUnlockLevel(
          "membership"
        ),
      null
    );

  const brandUnlocked =
    (restaurant.level ?? 1) >= 7;

  return [
    {
      id:
        "brand-growth",

      icon:
        "♛",

      title:
        "品牌与成长",

      subtitle:
        "打造更优秀的餐饮品牌，让美味走进更多城市",

      entries: [
        {
          id:
            "chain",

          title:
            "连锁管理",

          description:
            "开设新店，管理多城门店",

          target:
            "chain",

          art:
            "chain",

          icon:
            "▥",

          state:
            chainUnlocked
              ? "ready"
              : "locked",

          lockText:
            chainUnlockLevel
              ? (
                  "店铺" +
                  chainUnlockLevel +
                  "级解锁"
                )
              : "达成条件后解锁",

          statusText:
            chainUnlocked
              ? "管理连锁门店"
              : ""
        },

        {
          id:
            "brand-investments",

          title:
            "长期品牌基建",

          description:
            "提升品牌影响力与核心能力\n解锁更多经营玩法",

          target:
            "brand-investments",

          art:
            "brand",

          icon:
            "↗",

          state:
            brandUnlocked
              ? "ready"
              : "locked",

          lockText:
            brandUnlocked
              ? ""
              : "店铺7级解锁",

          progress:
            growth.progress,

          progressLabel:
            growth.owned +
            "/" +
            growth.total
        },

        {
          id:
            "ranking-center",

          title:
            "排行榜",

          description:
            "查看各类排行榜\n与其他店长一较高下",

          target:
            "ranking-center",

          art:
            "ranking",

          icon:
            "♛",

          state:
            "ready",

          statusText:
            ranking.text,

          badge:
            ranking.badge,

          badgeTone:
            "gold"
        },

        {
          id:
            "honor-hall",

          title:
            "荣誉殿堂",

          description:
            "收集荣誉，记录成长历程\n见证小馆的每一个里程碑",

          target:
            "honor-hall",

          art:
            "honor",

          icon:
            "★",

          state:
            "ready",

          statusText:
            "已获得 " +
            honor.totalHonors +
            " 项荣誉",

          badge:
            awards > 0
              ? String(awards)
              : "",

          badgeTone:
            "danger"
        }
      ]
    },

    {
      id:
        "customer-safety",

      icon:
        "♟",

      title:
        "顾客与安全",

      subtitle:
        "用心服务每一位顾客，营造安心的用餐环境",

      entries: [
        {
          id:
            "member-marketing",

          title:
            "会员营销",

          description:
            "开展会员活动\n提升顾客粘性",

          target:
            "member-marketing",

          art:
            "member",

          icon:
            "♛",

          state:
            membershipUnlocked
              ? "ready"
              : "locked",

          lockText:
            membershipUnlockLevel
              ? (
                  "店铺" +
                  membershipUnlockLevel +
                  "级解锁"
                )
              : "达成条件后解锁",

          statusText:
            membershipUnlocked
              ? (
                  member.members +
                  " 位会员 · " +
                  member.campaignCount +
                  " 个活动"
                )
              : ""
        },

        {
          id:
            "reputation",

          title:
            "评价反馈",

          description:
            "倾听顾客声音\n持续优化体验",

          target:
            "reputation",

          art:
            "feedback",

          icon:
            "●",

          state:
            "ready",

          statusText:
            "评分 " +
            Number(
              reputation.score
            ).toFixed(1),

          badge:
            reputation.negatives >
            reputation.positives
              ? "!"
              : "",

          badgeTone:
            "danger"
        },

        {
          id:
            "compliance-center",

          title:
            "合规中心",

          description:
            "食品安全与经营合规\n守护安心餐饮",

          target:
            "compliance-center",

          art:
            "compliance",

          icon:
            "✓",

          state:
            "ready",

          statusText:
            compliance.violations > 0
              ? (
                  compliance.violations +
                  " 项整改"
                )
              : compliance.renewalDue > 0
                ? (
                    compliance.renewalDue +
                    " 项待续期"
                  )
                : "当前合规正常",

          badge:
            (
              compliance.violations +
              compliance.renewalDue
            ) > 0
              ? String(
                  compliance.violations +
                  compliance.renewalDue
                )
              : "",

          badgeTone:
            "danger"
        }
      ]
    },

    {
      id:
        "game-service",

      icon:
        "⚙",

      title:
        "游戏服务",

      subtitle:
        "为您提供更好的游戏体验",

      entries: [
        {
          id:
            "settings",

          title:
            "设置",

          description:
            "声音、画面、\n通知等个性化设置",

          target:
            "settings",

          art:
            "settings",

          icon:
            "⚙",

          state:
            "ready",

          statusText:
            "随时调整游戏设置"
        },

        {
          id:
            "save-management",

          title:
            "存档管理",

          description:
            "管理游戏进度\n保障数据安全",

          target:
            "settings",

          art:
            "save",

          icon:
            "↑",

          state:
            "ready",

          statusText:
            saveSystem.has(
              "auto"
            )
              ? "自动存档可用"
              : "尚无自动存档"
        },

        {
          id:
            "help-feedback",

          title:
            "帮助与反馈",

          description:
            "游戏指南与常见问题\n联系客服反馈",

          target:
            "feedback",

          art:
            "help",

          icon:
            "?",

          state:
            "ready",

          statusText:
            (feedback.total ?? 0) > 0
              ? (
                  "已提交 " +
                  feedback.total +
                  " 条反馈"
                )
              : "查看帮助与反馈"
        }
      ]
    }
  ];
}


class MoreHubPageSystem {
  getPage(restaurantId) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const stores =
      getStores(
        restaurantId
      );

    const totalBalance =
      stores.reduce(
        (sum, store) =>
          sum +
          safe(
            () =>
              financeSystem.getBalance(
                store.id
              ),
            0
          ),
        0
      );

    const rating =
      stores.length > 0
        ? stores.reduce(
            (sum, store) =>
              sum +
              (
                Number(
                  store.reviewScore
                ) ||
                0
              ),
            0
          ) /
          stores.length
        : 0;

    const baseTopBar =
      buildGlobalTopBarModel({
        restaurantName:
          restaurant.name,

        brandName:
          safe(
            () =>
              chainSystem.getDashboard(
                restaurantId
              ).brandName,
            restaurant.name
          ),

        balance:
          totalBalance,

        storeLevel:
          Math.max(
            1,
            ...stores.map(
              item =>
                item.level ?? 1
            )
          ),

        reputation:
          restaurant.reputation ?? 0,

        time:
          gameState.getSection(
            "time"
          ),

        runtime:
          gameState.getSection(
            "runtime"
          ),

        currentStoreId:
          restaurantId,

        stores:
          stores.map(
            item => ({
              id:
                item.id,
              name:
                item.name
            })
          )
      });

    return {
      pageId:
        "more",

      title:
        "更多",

      restaurantId,

      topBar: {
        ...baseTopBar,

        rating,

        scope: {
          ...baseTopBar.scope,

          type:
            "group",

          canSwitch:
            stores.length > 0,

          stores:
            stores.map(
              item => ({
                id:
                  item.id,
                name:
                  item.name
              })
            )
        }
      },

      restaurant: {
        id:
          restaurant.id,

        name:
          restaurant.name,

        level:
          restaurant.level ?? 1,

        reputation:
          restaurant.reputation ?? 0,

        balance:
          financeSystem.getBalance(
            restaurantId
          )
      },

      groups:
        buildGroups(
          restaurantId
        )
    };
  }
}


export const moreHubPageSystem =
  new MoreHubPageSystem();


export {
  MoreHubPageSystem
};
