function sum(items, selector) {
  return items.reduce(
    (total, item) =>
      total +
      (
        Number(
          selector(item)
        ) || 0
      ),
    0
  );
}

function safeCall(callback, fallback) {
  try {
    const value = callback();
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function clamp(value, min, max) {
  return Math.max(
    min,
    Math.min(
      max,
      Number(value) || 0
    )
  );
}

function formatClock(time) {
  return (
    String(time.hour)
      .padStart(2, "0") +
    ":" +
    String(time.minute)
      .padStart(2, "0")
  );
}

function buildOpportunity({
  restaurant,
  progress,
  employees,
  todayProfit,
  balance
}) {
  if (
    restaurant.status !== "open"
  ) {
    return {
      tone: "warning",
      title: "今日机会：恢复营业",
      detail: "门店当前未营业，营业状态会直接影响今日收入与成长。",
      action: "检查营业准备"
    };
  }

  if (
    restaurant.customerSatisfaction < 65
  ) {
    return {
      tone: "warning",
      title: "今日机会：提升服务体验",
      detail:
        `当前满意度 ${Math.round(
          restaurant.customerSatisfaction
        )}，优先处理员工效率和环境体验。`,
      action: "查看经营"
    };
  }

  if (employees.length < 2) {
    return {
      tone: "warning",
      title: "今日机会：补充员工",
      detail: "当前人手偏少，高峰期容易出现接待与出餐瓶颈。",
      action: "前往员工"
    };
  }

  if (balance < 20000) {
    return {
      tone: "warning",
      title: "今日机会：稳住现金流",
      detail:
        `可用资金仅 ¥${Math.round(
          balance
        ).toLocaleString("zh-CN")}，暂缓大额投入。`,
      action: "查看财务"
    };
  }

  if (
    !progress.maxLevel
  ) {
    return {
      tone:
        todayProfit >= 0
          ? "positive"
          : "neutral",
      title:
        `头号项目：冲刺 Lv.${progress.nextLevel} ${progress.nextTitle}`,
      detail:
        `距离升级还差 ${Math.round(
          progress.remainingExperience
        ).toLocaleString("zh-CN")} 经验，当前进度 ${Math.round(
          progress.progress * 100
        )}% 。`,
      action: "查看成长"
    };
  }

  return {
    tone: "positive",
    title: "头号项目：巩固城市旗舰店",
    detail: "等级已经达到上限，重点转向菜品、口碑、利润和排行榜。",
    action: "查看经营"
  };
}

function buildDialogue({
  restaurant,
  employees,
  todayRevenue,
  todayProfit
}) {
  const lines = [];

  const chef =
    employees.find(
      item =>
        item.roleId === "chef"
    );

  const server =
    employees.find(
      item =>
        item.roleId === "server"
    );

  if (chef) {
    lines.push({
      speaker:
        chef.name,
      role: "后厨",
      text:
        todayRevenue > 0
          ? "今天出餐节奏还行，晚市前最好再检查一次备货。"
          : "今天还没形成营业额，我先把出品和备菜状态检查一遍。"
    });
  }

  if (server) {
    lines.push({
      speaker:
        server.name,
      role: "前厅",
      text:
        restaurant.customerSatisfaction >= 80
          ? "客人反馈不错，桌台周转也比较顺。"
          : "有些客人等得有点久，前厅还需要再顺一下流程。"
    });
  }

  if (
    lines.length === 0
  ) {
    lines.push({
      speaker: "经营提示",
      role: "系统",
      text: "先完善员工配置，再开始正式营业。"
    });
  }

  if (todayProfit < 0) {
    lines.push({
      speaker: "经营提示",
      role: "财务",
      text: "今天目前处于亏损，注意采购、工资和促销支出。"
    });
  }

  return lines.slice(0, 3);
}

function buildSchedule(time) {
  const hour =
    time.hour +
    time.minute / 60;

  const items = [
    {
      time: "10:30",
      title: "午市备菜",
      done: hour >= 10.5
    },
    {
      time: "12:00",
      title: "午市高峰",
      done: hour >= 12
    },
    {
      time: "15:00",
      title: "库存与采购复盘",
      done: hour >= 15
    },
    {
      time: "17:30",
      title: "晚市准备",
      done: hour >= 17.5
    },
    {
      time: "21:30",
      title: "营业总结",
      done: hour >= 21.5
    }
  ];

  return items;
}

function buildHomeDashboardModel(
  app
) {
  const {
    gameState,
    entitySystem
  } = app.core;

  const {
    restaurantSystem,
    financeSystem,
    employeeSystem,
    storeProgressSystem,
    menuSystem,
    renovationSystem,
    districtSystem
  } = app.systems;

  const time =
    gameState.getSection("time");

  const restaurant =
    restaurantSystem.list()[0] ??
    null;

  if (!restaurant) {
    return {
      empty: true,
      time,
      clock:
        formatClock(time)
    };
  }

  const district =
    safeCall(
      () => {
        if (
          !districtSystem ||
          !restaurant.locationId
        ) {
          return null;
        }

        const property =
          entitySystem.get(
            "property",
            restaurant.locationId
          );

        if (!property?.districtId) {
          return null;
        }

        return districtSystem.get(
          property.districtId
        );
      },
      null
    );

  const balance =
    safeCall(
      () =>
        financeSystem.getBalance(
          restaurant.id
        ),
      0
    );

  const employees =
    safeCall(
      () =>
        employeeSystem
          .listByRestaurant(
            restaurant.id
          ),
      []
    );

  const menu =
    safeCall(
      () =>
        menuSystem
          .listByRestaurant(
            restaurant.id,
            {
              activeOnly: true
            }
          ),
      []
    );

  const progress =
    safeCall(
      () =>
        storeProgressSystem
          .getProgress(
            restaurant.id
          ),
      {
        level:
          restaurant.level ?? 1,
        title: "街坊小店",
        progress: 0,
        maxLevel: false,
        nextLevel: 2,
        nextTitle: "稳定经营",
        remainingExperience: 0
      }
    );

  const transactions =
    safeCall(
      () =>
        financeSystem
          .getTransactions(
            restaurant.id
          ),
      []
    );

  const todayTransactions =
    transactions.filter(
      item =>
        item.day ===
        time.day
    );

  const todayRevenue =
    sum(
      todayTransactions.filter(
        item =>
          item.transactionType ===
          "income"
      ),
      item => item.amount
    );

  const todayExpense =
    sum(
      todayTransactions.filter(
        item =>
          [
            "expense",
            "apply_hold"
          ].includes(
            item.transactionType
          )
      ),
      item => item.amount
    );

  const todayProfit =
    todayRevenue -
    todayExpense;

  const renovation =
    safeCall(
      () =>
        renovationSystem
          .getSummary(
            restaurant.id
          ),
      null
    );

  const orders =
    safeCall(
      () =>
        entitySystem
          .list("order")
          .filter(
            item =>
              item.restaurantId ===
              restaurant.id
          ),
      []
    );

  const todayOrders =
    orders.filter(
      item =>
        item.day === time.day ||
        item.createdDay === time.day
    );

  const satisfaction =
    clamp(
      restaurant
        .customerSatisfaction ??
      50,
      0,
      100
    );

  const reputation =
    clamp(
      restaurant
        .reputation ??
      0,
      0,
      100
    );

  const opportunity =
    buildOpportunity({
      restaurant,
      progress,
      employees,
      todayProfit,
      balance
    });

  return {
    empty: false,

    restaurant: {
      id:
        restaurant.id,
      name:
        restaurant.name,
      status:
        restaurant.status,
      level:
        restaurant.level ?? 1,
      title:
        progress.title,
      satisfaction,
      reputation,
      reviewScore:
        Number(
          restaurant.reviewScore ??
          0
        ),
      totalReviews:
        restaurant.totalReviews ??
        0
    },

    time: {
      ...time,
      clock:
        formatClock(time)
    },

    money: {
      balance,
      todayRevenue,
      todayExpense,
      todayProfit
    },

    operations: {
      todayOrders:
        todayOrders.length,
      employees:
        employees.length,
      activeMenuItems:
        menu.length,
      totalServedGuests:
        restaurant
          .totalServedGuests ??
        0
    },

    progress,
    renovation,

    district: district
      ? {
          id: district.id,
          name: district.name,
          trafficIndex:
            Number(
              district.trafficIndex ??
              0
            ),
          spendingPower:
            Number(
              district.spendingPower ??
              0
            ),
          competition:
            Number(
              district.competition ??
              0
            ),
          deliveryDemand:
            Number(
              district.deliveryDemand ??
              0
            ),
          rentMultiplier:
            Number(
              district.rentMultiplier ??
              1
            ),
          opportunityScore:
            safeCall(
              () =>
                districtSystem
                  .getOpportunityScore(
                    district
                  ),
              0
            )
        }
      : null,

    opportunity,

    dialogue:
      buildDialogue({
        restaurant,
        employees,
        todayRevenue,
        todayProfit
      }),

    schedule:
      buildSchedule(time)  };
}

export {
  buildHomeDashboardModel
};
