import {
  entitySystem
} from "../../../core/EntitySystem.js";

import {
  gameState
} from "../../../core/GameState.js";

import {
  restaurantSystem
} from "../../../systems/RestaurantSystem.js";

import {
  financeSystem
} from "../../../systems/FinanceSystem.js";


function safeList(type) {
  try {
    return entitySystem.list(type);
  } catch {
    return [];
  }
}


function findRestaurantItems(
  type,
  restaurantId
) {
  return safeList(type)
    .filter(
      item =>
        item.restaurantId ===
        restaurantId
    );
}


function uniqueById(items) {
  const result = [];
  const used = new Set();

  for (const item of items) {
    const key =
      item.id ??
      `${item.name}-${result.length}`;

    if (used.has(key)) {
      continue;
    }

    used.add(key);
    result.push(item);
  }

  return result;
}


class RestaurantHubPageSystem {
  getRooms(restaurantId) {
    const rooms =
      uniqueById([
        ...findRestaurantItems(
          "restaurant_room",
          restaurantId
        ),

        ...findRestaurantItems(
          "dining_room",
          restaurantId
        ),

        ...findRestaurantItems(
          "private_room",
          restaurantId
        )
      ]);

    return rooms
      .slice(0, 8)
      .map(
        (room, index) => ({
          id:
            room.id ??
            `room_${index + 1}`,

          name:
            room.name ??
            `包厢 ${index + 1}`,

          seats:
            room.seats ??
            room.capacity ??
            0,

          image:
            room.image ??
            `assets/images/ui/store/room-${(index % 3) + 1}.webp`
        })
      );
  }


  getSeats(
    restaurantId,
    rooms
  ) {
    const configs = [
      ...findRestaurantItems(
        "service_capacity_config",
        restaurantId
      ),

      ...findRestaurantItems(
        "service_capacity_setting",
        restaurantId
      )
    ];

    const config =
      configs[0];

    if (
      config &&
      Number.isFinite(
        config.seats
      )
    ) {
      return config.seats;
    }

    return rooms.reduce(
      (sum, room) =>
        sum +
        (
          Number(room.seats) ||
          0
        ),
      0
    );
  }


  getMonthlyRevenue(
    restaurantId
  ) {
    const day =
      gameState
        .getSection("time")
        .day;

    return findRestaurantItems(
      "customer_order",
      restaurantId
    )
      .filter(
        order =>
          order.status ===
            "completed" &&
          (
            !Number.isFinite(
              order.day
            ) ||
            order.day >=
              day - 29
          )
      )
      .reduce(
        (sum, order) =>
          sum +
          (
            order.paidAmount ??
            order.channelNetRevenue ??
            order.totalRevenue ??
            0
          ),
        0
      );
  }


  getOpeningProgress(
    restaurantId,
    restaurant
  ) {
    const hasLease =
      [
        ...findRestaurantItems(
          "lease_contract",
          restaurantId
        ),

        ...findRestaurantItems(
          "restaurant_lease",
          restaurantId
        )
      ].length > 0 ||
      restaurant.locationId !==
        null;

    const hasRenovation =
      [
        ...findRestaurantItems(
          "renovation_project",
          restaurantId
        ),

        ...findRestaurantItems(
          "renovation_plan",
          restaurantId
        ),

        ...findRestaurantItems(
          "restaurant_layout",
          restaurantId
        )
      ].length > 0;

    const hasMenu =
      findRestaurantItems(
        "menu_item",
        restaurantId
      ).length > 0;

    const hasEmployees =
      findRestaurantItems(
        "employee",
        restaurantId
      ).length > 0;

    const isOpen =
      restaurant.status ===
      "open";

    const steps = [
      {
        id: "lease",
        label: "选址签约",
        done: hasLease
      },
      {
        id: "renovation",
        label: "装修施工",
        done: hasRenovation
      },
      {
        id: "license",
        label: "办理证照",
        done:
          hasRenovation &&
          hasMenu
      },
      {
        id: "staff",
        label: "招聘员工",
        done: hasEmployees
      },
      {
        id: "open",
        label: "正式营业",
        done: isOpen
      }
    ];

    let currentFound = false;

    return steps.map(
      step => {
        let state =
          "pending";

        if (step.done) {
          state =
            "complete";
        } else if (
          !currentFound
        ) {
          state =
            "current";

          currentFound =
            true;
        }

        return {
          ...step,
          state
        };
      }
    );
  }


  getSuggestions(
    progress
  ) {
    const suggestions = [];

    const unfinished =
      progress.find(
        item =>
          item.state ===
          "current"
      );

    if (!unfinished) {
      return [
        {
          icon: "chart",
          title:
            "查看经营数据",
          description:
            "分析今天的收入、利润和客流",
          target:
            "analytics"
        },
        {
          icon: "menu",
          title:
            "优化菜单",
          description:
            "查看明星菜和低效菜品",
          target:
            "menu-optimization"
        }
      ];
    }

    const table = {
      lease: {
        icon: "location",
        title:
          "选择合适房源",
        description:
          "确定商圈和具体门店",
        target:
          "properties"
      },

      renovation: {
        icon: "renovation",
        title:
          "前往装修",
        description:
          "打造独特的用餐环境",
        target:
          "renovation"
      },

      license: {
        icon: "license",
        title:
          "完善开店准备",
        description:
          "完成菜单和营业准备",
        target:
          "dishes"
      },

      staff: {
        icon: "employee",
        title:
          "招聘员工",
        description:
          "配置厨师、服务员等岗位",
        target:
          "employees"
      },

      open: {
        icon: "open",
        title:
          "准备正式营业",
        description:
          "检查门店状态后开业",
        target:
          "operating-command-center"
      }
    };

    suggestions.push(
      table[unfinished.id]
    );

    if (
      unfinished.id !==
      "staff"
    ) {
      suggestions.push({
        icon: "employee",
        title:
          "查看员工配置",
        description:
          "提前准备门店人员",
        target:
          "employees"
      });
    }

    if (
      unfinished.id !==
      "renovation"
    ) {
      suggestions.push({
        icon: "renovation",
        title:
          "检查装修布局",
        description:
          "优化桌位、厨房与动线",
        target:
          "renovation"
      });
    }

    return suggestions
      .filter(Boolean)
      .slice(0, 3);
  }


  getPage(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const rooms =
      this.getRooms(
        restaurantId
      );

    const seats =
      this.getSeats(
        restaurantId,
        rooms
      );

    const revenue =
      this.getMonthlyRevenue(
        restaurantId
      );

    let finance = null;

    try {
      finance =
        financeSystem.getSummary(
          restaurantId
        );
    } catch {
      finance = {
        balance: 0
      };
    }

    const progress =
      this.getOpeningProgress(
        restaurantId,
        restaurant
      );

    return {
      pageId:
        "restaurant-home",

      title:
        "门店",

      restaurantId,

      heroImage:
        restaurant.heroImage ??
        "assets/images/ui/store/store-front.webp",

      restaurant: {
        name:
          restaurant.name,

        location:
          restaurant.locationName ??
          restaurant.address ??
          (
            restaurant.locationId
              ? `门店位置 · ${restaurant.locationId}`
              : "门店位置待完善"
          ),

        status:
          restaurant.status,

        statusLabel:
          restaurant.status ===
            "open"
            ? "营业中"
            : restaurant.status ===
              "paused"
              ? "暂停营业"
              : "筹备中",

        reviewScore:
          Number(
            restaurant.reviewScore ??
            3
          ),

        level:
          restaurant.level ??
          1
      },

      metrics: {
        rooms:
          rooms.length,

        seats,

        score:
          Number(
            restaurant.reviewScore ??
            3
          ),

        monthlyRevenue:
          revenue,

        balance:
          finance.balance ??
          0
      },

      rooms,

      progress,

      suggestions:
        this.getSuggestions(
          progress
        ),

      bottomNavigation: [
        {
          label: "城市",
          icon: "⌂",
          target: "city"
        },
        {
          label: "门店",
          icon: "▣",
          target: "restaurant",
          active: true
        },
        {
          label: "装修",
          icon: "▱",
          target: "renovation"
        },
        {
          label: "人员",
          icon: "♟",
          target: "employees"
        },
        {
          label: "市场",
          icon: "◎",
          target: "channels"
        },
        {
          label: "研发",
          icon: "◈",
          target: "dishes"
        },
        {
          label: "更多",
          icon: "•••",
          target: "more"
        }
      ]
    };
  }
}


export const restaurantHubPageSystem =
  new RestaurantHubPageSystem();

export {
  RestaurantHubPageSystem
};
