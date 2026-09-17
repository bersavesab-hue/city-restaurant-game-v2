import { gameState } from "../../../core/GameState.js";
import { entitySystem } from "../../../core/EntitySystem.js";
import { timeSystem } from "../../../core/TimeSystem.js";

import { restaurantSystem } from "../../../systems/RestaurantSystem.js";
import { financeSystem } from "../../../systems/FinanceSystem.js";
import { employeeSystem } from "../../../systems/EmployeeSystem.js";
import { inventorySystem } from "../../../systems/InventorySystem.js";
import { propertySystem } from "../../../systems/PropertySystem.js";
import { seatingSystem } from "../../../systems/SeatingSystem.js";
import { renovationSystem } from "../../../systems/RenovationSystem.js";
import { renovationPlanningSystem } from "../../../systems/RenovationPlanningSystem.js";

import {
  buildGlobalTopBarModel,
  buildNoticeTickerModel
} from "../../components/GlobalChromeModel.js";
import { pageRegistry } from "../../registry/PageRegistry.js";

function average(values, fallback = 0) {
  const valid = values.filter(Number.isFinite);
  if (valid.length === 0) {
    return fallback;
  }
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function safeBalance(restaurantId) {
  try {
    return financeSystem.getBalance(restaurantId);
  } catch {
    return 0;
  }
}

class RestaurantHomePageSystem {
  getTodayOrders(restaurantId) {
    const day = gameState.getSection("time").day;
    const orders = entitySystem.filter(
      "customer_order",
      item => item.restaurantId === restaurantId && item.day === day
    );

    return {
      day,
      orders: orders.length,
      revenue: orders.reduce(
        (sum, item) => sum + (item.totalRevenue ?? 0),
        0
      ),
      ingredientCost: orders.reduce(
        (sum, item) => sum + (item.ingredientCost ?? 0),
        0
      ),
      averageQuality: Math.round(
        average(orders.map(item => item.averageQuality), 0)
      )
    };
  }

  getEmployeeSummary(restaurantId) {
    const employees = employeeSystem.listByRestaurant(restaurantId);
    const active = employees.filter(item => item.status === "active");

    return {
      total: employees.length,
      active: active.length,
      tired: active.filter(item => (item.fatigue ?? 0) >= 75).length,
      averageMood: Math.round(
        average(active.map(item => item.mood), 0)
      )
    };
  }

  getInventorySummary(restaurantId) {
    const batches = inventorySystem.getBatches(
      restaurantId,
      null,
      { activeOnly: true, includeSpoiled: true }
    );

    return {
      activeBatches: batches.length,
      spoiledBatches: batches.filter(item => item.spoiled).length,
      lowFreshnessBatches: batches.filter(
        item => !item.spoiled && item.freshness <= 25
      ).length,
      ingredientKinds: new Set(batches.map(item => item.ingredientId)).size
    };
  }

  getProperty(restaurant) {
    if (!restaurant.locationId) {
      return null;
    }

    try {
      return propertySystem.get(restaurant.locationId);
    } catch {
      return null;
    }
  }

  getRenovation(restaurantId) {
    const summary = renovationSystem.getSummary(restaurantId);
    let score = null;
    let grade = null;

    if (summary.initialized) {
      try {
        const analysis = renovationPlanningSystem.getAnalysis(restaurantId);
        score = analysis.score;
        grade = analysis.grade;
      } catch {
        score = null;
        grade = null;
      }
    }

    return {
      ...summary,
      score,
      grade
    };
  }

  buildNotices({
    restaurant,
    property,
    employees,
    inventory,
    renovation,
    today
  }) {
    const notices = [];
    const time = gameState.getSection("time");
    const timeLabel = `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`;

    if (!property) {
      notices.push({
        id: "no_property",
        type: "warning",
        title: "选址提醒",
        message: "当前门店尚未租赁房源，请先前往城市地图选址",
        priority: 100,
        timeLabel,
        action: "properties"
      });
    }

    if (restaurant.status === "closed") {
      notices.push({
        id: "store_closed",
        type: "info",
        title: "营业状态",
        message: "门店当前处于闭店状态",
        priority: 90,
        timeLabel
      });
    }

    if (inventory.spoiledBatches > 0) {
      notices.push({
        id: "inventory_spoiled",
        type: "danger",
        title: "库存预警",
        message: `${inventory.spoiledBatches} 批食材已经变质，需要尽快处理`,
        priority: 88,
        timeLabel,
        action: "supply"
      });
    }

    if (employees.total === 0) {
      notices.push({
        id: "no_employees",
        type: "warning",
        title: "人员提醒",
        message: "当前门店还没有员工",
        priority: 82,
        timeLabel,
        action: "employee_roster"
      });
    } else if (employees.tired > 0) {
      notices.push({
        id: "tired_employees",
        type: "warning",
        title: "员工状态",
        message: `${employees.tired} 名员工疲劳度较高`,
        priority: 72,
        timeLabel,
        action: "employee_roster"
      });
    }

    if (inventory.lowFreshnessBatches > 0) {
      notices.push({
        id: "low_freshness",
        type: "warning",
        title: "食材新鲜度",
        message: `${inventory.lowFreshnessBatches} 批食材即将进入高损耗区间`,
        priority: 65,
        timeLabel,
        action: "supply"
      });
    }

    if (property && !renovation.active) {
      notices.push({
        id: "renovation_inactive",
        type: "info",
        title: "装修布局",
        message: "当前房源尚未启用正式装修布局",
        priority: 45,
        timeLabel,
        action: "renovation"
      });
    }

    if (restaurant.reviewScore < 3) {
      notices.push({
        id: "review_low",
        type: "warning",
        title: "顾客评价",
        message: `当前综合评分 ${Number(restaurant.reviewScore).toFixed(1)}，建议检查经营问题`,
        priority: 70,
        timeLabel,
        action: "analytics"
      });
    }

    if (notices.length === 0) {
      notices.push({
        id: "normal_operation",
        type: "success",
        title: "经营通报",
        message: `今日已完成 ${today.orders} 单，门店运行正常`,
        priority: 10,
        timeLabel
      });
    }

    return notices;
  }

  getPage(restaurantId) {
    const restaurant = restaurantSystem.get(restaurantId);
    const property = this.getProperty(restaurant);
    const today = this.getTodayOrders(restaurantId);
    const employees = this.getEmployeeSummary(restaurantId);
    const inventory = this.getInventorySummary(restaurantId);
    const renovation = this.getRenovation(restaurantId);
    const time = gameState.getSection("time");
    const runtime = gameState.getSection("runtime");
    const balance = safeBalance(restaurantId);
    const notices = this.buildNotices({
      restaurant,
      property,
      employees,
      inventory,
      renovation,
      today
    });

    const seats = property
      ? seatingSystem.getSeatCount(restaurantId)
      : 0;

    return {
      pageId: "restaurant",
      topBar: buildGlobalTopBarModel({
        restaurantName: restaurant.name,
        balance,
        storeLevel: restaurant.level,
        reputation: restaurant.reputation,
        time,
        runtime,
        currentStoreId: restaurantId
      }),
      noticeTicker: buildNoticeTickerModel(notices),
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        status: restaurant.status,
        level: restaurant.level,
        reputation: restaurant.reputation,
        reviewScore: restaurant.reviewScore,
        satisfaction: restaurant.customerSatisfaction,
        repeatRate: restaurant.repeatRate
      },
      scene: {
        propertyId: property?.id ?? null,
        propertyName: property?.name ?? "尚未租赁房源",
        area: property?.area ?? 0,
        seats,
        renovationActive: Boolean(renovation.active),
        renovationScore: renovation.score,
        renovationGrade: renovation.grade
      },
      today,
      employees,
      inventory,
      keyMetrics: [
        { id: "revenue", label: "今日营收", value: today.revenue, format: "money" },
        { id: "orders", label: "今日订单", value: today.orders, format: "number" },
        { id: "satisfaction", label: "顾客满意", value: Math.round(restaurant.customerSatisfaction), format: "percent" },
        { id: "rating", label: "门店评分", value: Number(restaurant.reviewScore.toFixed(1)), format: "score" }
      ],
      quickActions: [
        { id: "renovation", label: "装修布局", pageId: "renovation", enabled: Boolean(property) },
        { id: "dishes", label: "菜品中心", pageId: "dishes", enabled: true },
        { id: "employees", label: "员工管理", pageId: "employee_roster", enabled: true },
        { id: "supply", label: "采购库存", pageId: "supply", enabled: true },
        { id: "analytics", label: "经营数据", pageId: "analytics", enabled: true },
        { id: "lease", label: "租约信息", pageId: "lease", enabled: Boolean(property) }
      ],
      navigation: pageRegistry.mainNavigation().map(page => ({
        id: page.id,
        title: page.title,
        active: page.id === "restaurant"
      })),
      actions: {
        canOpen: restaurant.status === "closed" && Boolean(property),
        canClose: restaurant.status !== "closed",
        canRename: true,
        canPauseTime: !runtime.paused,
        canResumeTime: runtime.paused,
        speeds: [1, 2, 4]
      }
    };
  }

  rename(restaurantId, name) {
    restaurantSystem.rename(restaurantId, name);
    return this.getPage(restaurantId);
  }

  pauseTime(restaurantId) {
    timeSystem.pause();
    return this.getPage(restaurantId);
  }

  resumeTime(restaurantId) {
    timeSystem.resume();
    return this.getPage(restaurantId);
  }

  setSpeed(restaurantId, speed) {
    timeSystem.setSpeed(speed);
    return this.getPage(restaurantId);
  }

  toggleBusiness(restaurantId) {
    const restaurant = restaurantSystem.get(restaurantId);

    if (restaurant.status === "closed") {
      restaurantSystem.open(restaurantId);
    } else {
      restaurantSystem.close(restaurantId);
    }

    return this.getPage(restaurantId);
  }
}

export const restaurantHomePageSystem = new RestaurantHomePageSystem();
export { RestaurantHomePageSystem };
