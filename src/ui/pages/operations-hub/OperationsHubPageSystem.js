import {
  storeProgressSystem
} from "../../../systems/StoreProgressSystem.js";

import {
  restaurantSystem
} from "../../../systems/RestaurantSystem.js";

import {
  financeSystem
} from "../../../systems/FinanceSystem.js";

import {
  gameState
} from "../../../core/GameState.js";

import {
  buildGlobalTopBarModel,
  buildNoticeTickerModel
} from "../../components/GlobalChromeModel.js";

import {
  gameChromeSystem
} from "../../components/GameChromeSystem.js";

import {
  chainSystem
} from "../../../systems/ChainSystem.js";

import {
  operatingCommandCenterSystem
} from "../../../systems/OperatingCommandCenterSystem.js";

import {
  inventorySystem
} from "../../../systems/InventorySystem.js";

import {
  menuOptimizationSystem
} from "../../../systems/MenuOptimizationSystem.js";

import {
  operatingAnalyticsSystem
} from "../../../systems/OperatingAnalyticsSystem.js";

import {
  customerLoyaltySystem
} from "../../../systems/CustomerLoyaltySystem.js";

import {
  salesChannelSystem
} from "../../../systems/SalesChannelSystem.js";

import {
  marketActionSystem
} from "../../../systems/MarketActionSystem.js";

import {
  dishResearchSystem
} from "../../../systems/DishResearchSystem.js";

import {
  rankingCenterSystem
} from "../../../systems/RankingCenterSystem.js";

import {
  awardFeedbackSystem
} from "../../../systems/AwardFeedbackSystem.js";


const PRIMARY_ENTRIES =
  Object.freeze([
    {
      id: "menu",
      kind: "module",
      icon: "dishes",
      title: "菜品与菜单",
      subtitle: "优化菜品结构，打造爆款",
      target: "dishes",
      secondary: [
        {
          title: "菜单优化",
          target: "menu-optimization"
        },
        {
          title: "菜单工程",
          target: "menu-engineering"
        }
      ]
    },
    {
      id: "supply",
      kind: "module",
      icon: "supply",
      title: "供应链与库存",
      subtitle: "保障食材供应，控制成本",
      target: "supply",
      secondary: []
    },
    {
      id: "finance",
      kind: "module",
      icon: "cash",
      title: "财务资金",
      subtitle: "掌握收支状况，稳健经营",
      target: "finance",
      secondary: []
    },
    {
      id: "customers",
      kind: "module",
      icon: "employees",
      title: "顾客与会员",
      subtitle: "提升顾客体验，增加复购",
      target: "customers",
      secondary: [
        {
          title: "会员营销",
          target: "member-marketing"
        },
        {
          title: "顾客口碑",
          target: "reputation"
        }
      ]
    },
    {
      id: "marketing",
      kind: "module",
      icon: "operations",
      title: "营销与渠道",
      subtitle: "扩大品牌影响，带来更多顾客",
      target: "channels",
      unlockFeature: "marketing",
      secondary: [
        {
          title: "市场策略",
          target: "market-strategy"
        }
      ]
    },
    {
      id: "analytics",
      kind: "module",
      icon: "analytics",
      title: "经营数据",
      subtitle: "多维度分析，辅助决策",
      target: "analytics",
      secondary: [
        {
          title: "产能与排队",
          target: "capacity"
        }
      ]
    },
    {
      id: "ranking",
      kind: "compact",
      icon: "ranking",
      title: "排行榜与荣誉",
      subtitle: "查看集团排名与获得的荣誉",
      target: "ranking-center",
      secondary: [
        {
          title: "奖项中心",
          target: "awards-center"
        },
        {
          title: "荣誉馆",
          target: "honor-hall"
        }
      ]
    },
    {
      id: "research",
      kind: "compact",
      icon: "dishes",
      title: "研发菜品",
      subtitle: "开发新菜品，丰富菜单选择",
      target: "dishes",
      secondary: []
    }
  ]);


function safe(fn, fallback) {
  try {
    return fn();
  } catch {
    return fallback;
  }
}


function severityScore(severity) {
  return {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  }[severity] ?? 0;
}


function getStores(restaurantId) {
  if (!restaurantId) {
    return [];
  }

  const current =
    safe(
      () => restaurantSystem.get(restaurantId),
      null
    );

  if (!current) {
    return [];
  }

  const chain =
    safe(
      () => chainSystem.getDashboard(restaurantId),
      null
    );

  return chain?.stores ?? [current];
}


function buildDashboardSnapshot(store) {
  return safe(
    () =>
      operatingCommandCenterSystem.getDashboard(store.id),
    null
  );
}


function percentChange(current, previous) {
  const now =
    Number(current) || 0;

  const before =
    Number(previous) || 0;

  if (before === 0) {
    return now === 0 ? 0 : 100;
  }

  return Number(
    (
      (now - before) /
      Math.abs(before) *
      100
    ).toFixed(1)
  );
}


function buildKpis(stores) {
  const snapshots =
    stores
      .map(buildDashboardSnapshot)
      .filter(Boolean);

  const current =
    snapshots.reduce(
      (sum, dashboard) => {
        sum.revenue +=
          dashboard.sales?.revenue ?? 0;

        sum.profit +=
          dashboard.sales?.profit ?? 0;

        sum.orders +=
          dashboard.sales?.orderCount ?? 0;

        sum.satisfaction +=
          Number(
            dashboard.restaurant?.customerSatisfaction ??
            dashboard.restaurant?.satisfaction ??
            0
          );

        sum.satisfactionCount += 1;

        return sum;
      },
      {
        revenue: 0,
        profit: 0,
        orders: 0,
        satisfaction: 0,
        satisfactionCount: 0
      }
    );

  const previous =
    snapshots.reduce(
      (sum, dashboard) => {
        sum.revenue +=
          dashboard.previousDay?.revenue ?? 0;

        sum.profit +=
          dashboard.previousDay?.operatingProfit ?? 0;

        sum.orders +=
          dashboard.previousDay?.orders ?? 0;

        return sum;
      },
      {
        revenue: 0,
        profit: 0,
        orders: 0
      }
    );

  const satisfaction =
    current.satisfactionCount > 0
      ? current.satisfaction / current.satisfactionCount
      : 0;

  return {
    revenue: current.revenue,
    profit: current.profit,
    orders: current.orders,
    satisfaction,
    revenueChange:
      percentChange(
        current.revenue,
        previous.revenue
      ),
    profitChange:
      percentChange(
        current.profit,
        previous.profit
      ),
    orderChange:
      percentChange(
        current.orders,
        previous.orders
      ),
    satisfactionChange: 0
  };
}


function buildTodos(stores) {
  const items = [];

  for (const store of stores) {
    const dashboard =
      buildDashboardSnapshot(store);

    for (
      const priority
      of dashboard?.priorities ?? []
    ) {
      items.push({
        id:
          store.id +
          ":" +
          priority.id,
        storeId: store.id,
        title: priority.title,
        description:
          store.name +
          " · " +
          (priority.description ?? ""),
        severity:
          priority.severity,
        target:
          priority.target,
        score:
          severityScore(
            priority.severity
          )
      });
    }
  }

  return items
    .sort(
      (a,b) =>
        b.score - a.score
    )
    .slice(
      0,
      9
    );
}


function buildModuleData(stores) {
  let activeMenu = 0;
  let menuWarnings = 0;
  let inventoryWarnings = 0;
  let balance = 0;
  let lifetimeProfit = 0;
  let members = 0;
  let repeatRateTotal = 0;
  let repeatRateCount = 0;
  let activeChannels = 0;
  let activeMarketing = 0;
  let researchTotal = 0;
  let recentResearch = 0;
  let currentRevenue = 0;
  let previousRevenue = 0;

  for (const store of stores) {
    const menu =
      safe(
        () =>
          menuOptimizationSystem.getDashboard(store.id),
        null
      );

    activeMenu +=
      menu?.activeItems ?? 0;

    const health =
      safe(
        () =>
          operatingAnalyticsSystem.getDishHealth(store.id),
        []
      );

    menuWarnings +=
      health.filter(
        item =>
          item.active &&
          item.warnings?.length > 0
      ).length;

    const inventory =
      safe(
        () =>
          inventorySystem.getSummary(store.id),
        []
      );

    inventoryWarnings +=
      inventory.filter(
        item =>
          Number(
            item.usableQuantity ?? 0
          ) <= 5
      ).length;

    const finance =
      safe(
        () =>
          financeSystem.getSummary(store.id),
        null
      );

    balance +=
      finance?.balance ?? 0;

    lifetimeProfit +=
      finance?.lifetimeProfit ?? 0;

    const loyalty =
      safe(
        () =>
          customerLoyaltySystem.getDashboard(store.id),
        null
      );

    members +=
      loyalty?.members ?? 0;

    if (loyalty) {
      repeatRateTotal +=
        loyalty.memberRepeatRate ?? 0;

      repeatRateCount +=
        1;
    }

    const channels =
      safe(
        () =>
          salesChannelSystem.getDashboard(store.id),
        null
      );

    activeChannels +=
      channels?.activeCount ?? 0;

    const marketing =
      safe(
        () =>
          marketActionSystem.getStatus(store.id),
        null
      );

    activeMarketing +=
      marketing?.active?.length ?? 0;

    const research =
      safe(
        () =>
          dishResearchSystem.getResearchSummary(store.id),
        null
      );

    researchTotal +=
      research?.total ?? 0;

    recentResearch +=
      research?.recent?.length ?? 0;

    const dashboard =
      buildDashboardSnapshot(store);

    currentRevenue +=
      dashboard?.sales?.revenue ?? 0;

    previousRevenue +=
      dashboard?.previousDay?.revenue ?? 0;
  }

  return {
    menu: {
      activeMenu,
      menuWarnings
    },
    supply: {
      inventoryWarnings
    },
    finance: {
      balance,
      lifetimeProfit
    },
    customers: {
      members,
      repeatRate:
        repeatRateCount > 0
          ? repeatRateTotal / repeatRateCount
          : 0
    },
    marketing: {
      activeChannels,
      activeMarketing
    },
    analytics: {
      revenueChange:
        percentChange(
          currentRevenue,
          previousRevenue
        )
    },
    research: {
      total:
        researchTotal,
      recent:
        recentResearch
    }
  };
}


function decorateEntries(
  restaurantId,
  data
) {
  return PRIMARY_ENTRIES.map(
    entry => {
      const unlocked =
        !entry.unlockFeature ||
        restaurantId === null ||
        safe(
          () =>
            storeProgressSystem.isUnlocked(
              restaurantId,
              entry.unlockFeature
            ),
          false
        );

      let statusText = "";
      let badge = "";
      let badgeTone = "neutral";

      if (entry.id === "menu") {
        statusText =
          "在售菜品 " +
          data.menu.activeMenu +
          " 道";

        if (
          data.menu.menuWarnings > 0
        ) {
          badge =
            data.menu.menuWarnings +
            " 道待优化";
          badgeTone =
            "danger";
        }
      }

      if (entry.id === "supply") {
        statusText =
          data.supply.inventoryWarnings +
          " 种食材库存预警";

        badgeTone =
          data.supply.inventoryWarnings > 0
            ? "danger"
            : "success";
      }

      if (entry.id === "finance") {
        statusText =
          "账户余额 " +
          Math.round(
            data.finance.balance
          ).toLocaleString(
            "zh-CN"
          );

        badge =
          data.finance.lifetimeProfit >= 0
            ? "现金流健康"
            : "关注现金流";

        badgeTone =
          data.finance.lifetimeProfit >= 0
            ? "success"
            : "warning";
      }

      if (entry.id === "customers") {
        statusText =
          "会员 " +
          data.customers.members.toLocaleString(
            "zh-CN"
          ) +
          " 人";

        badge =
          "复购 " +
          Number(
            data.customers.repeatRate
          ).toFixed(1) +
          "%";

        badgeTone =
          "success";
      }

      if (entry.id === "marketing") {
        statusText =
          "进行中活动 " +
          data.marketing.activeMarketing +
          " 个";

        badge =
          "渠道 " +
          data.marketing.activeChannels +
          " 个";

        badgeTone =
          "success";
      }

      if (entry.id === "analytics") {
        statusText =
          "今日同比 " +
          (
            data.analytics.revenueChange > 0
              ? "+"
              : ""
          ) +
          data.analytics.revenueChange.toFixed(1) +
          "%";

        badgeTone =
          data.analytics.revenueChange >= 0
            ? "success"
            : "warning";
      }

      return {
        ...entry,
        state:
          unlocked
            ? "ready"
            : "locked",
        unlockLevel:
          entry.unlockFeature
            ? safe(
                () =>
                  storeProgressSystem.getUnlockLevel(
                    entry.unlockFeature
                  ),
                null
              )
            : null,
        statusText,
        badge,
        badgeTone,
        secondary:
          entry.secondary.map(
            item => ({
              ...item
            })
          )
      };
    }
  );
}


function buildRanking(
  restaurantId
) {
  if (!restaurantId) {
    return {
      text:
        "查看集团排名与获得的荣誉",
      badge:
        ""
    };
  }

  const overview =
    safe(
      () =>
        rankingCenterSystem.getOverview(
          restaurantId
        ),
      null
    );

  const feedback =
    safe(
      () =>
        awardFeedbackSystem.getDashboard(
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
            " · 第" +
            best.rank +
            "名"
          )
        : "查看集团排名与获得的荣誉",
    badge:
      (feedback?.unreadCount ?? 0) > 0
        ? String(
            feedback.unreadCount
          )
        : ""
  };
}


class OperationsHubPageSystem {
  getPage(
    restaurantId = null
  ) {
    const stores =
      getStores(
        restaurantId
      );

    const moduleData =
      buildModuleData(
        stores
      );

    const kpis =
      buildKpis(
        stores
      );

    const todos =
      buildTodos(
        stores
      );

    let topBar =
      null;

    if (
      restaurantId &&
      stores.length > 0
    ) {
      const current =
        safe(
          () =>
            restaurantSystem.get(
              restaurantId
            ),
          stores[0]
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

      const base =
        buildGlobalTopBarModel({
          restaurantName:
            current?.name ??
            "经营中心",
          brandName:
            safe(
              () =>
                chainSystem.getDashboard(
                  restaurantId
                ).brandName,
              current?.name ??
              "餐饮集团"
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
            current?.reputation ?? 0,
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

      topBar = {
        ...base,
        rating,
        scope: {
          ...base.scope,
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
      };
    }

    return {
      pageId:
        "operations",

      title:
        "经营中心",

      restaurantId,

      topBar,

      noticeTicker:
        buildNoticeTickerModel(
          []
        ),

      navigation:
        gameChromeSystem
          .getNavigation({
            restaurantId,
            activePageId:
              "operations"
          }),

      kpis,

      todos,

      entries:
        decorateEntries(
          restaurantId,
          moduleData
        ),

      ranking:
        buildRanking(
          restaurantId
        ),

      research: {
        total:
          moduleData
            .research
            .total,
        badge:
          moduleData
            .research
            .recent > 0
            ? (
                "新增 " +
                moduleData
                  .research
                  .recent
              )
            : (
                "已研发 " +
                moduleData
                  .research
                  .total
              )
      }
    };
  }
}


export const operationsHubPageSystem =
  new OperationsHubPageSystem();


export {
  OperationsHubPageSystem,
  PRIMARY_ENTRIES
};
