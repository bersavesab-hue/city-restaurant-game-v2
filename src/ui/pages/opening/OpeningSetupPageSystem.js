import {
  gameState
} from "../../../core/GameState.js";

import {
  financeSystem
} from "../../../systems/FinanceSystem.js";

import {
  propertySystem
} from "../../../systems/PropertySystem.js";

import {
  openingFlowSystem
} from "../../../systems/OpeningFlowSystem.js";

import {
  buildGlobalTopBarModel,
  buildNoticeTickerModel
} from "../../components/GlobalChromeModel.js";


function safeBalance(
  restaurantId
) {
  try {
    return financeSystem
      .getBalance(
        restaurantId
      );
  } catch {
    return 0;
  }
}


class OpeningSetupPageSystem {
  getLocation(
    status
  ) {
    if (
      !status.restaurant
        .locationId
    ) {
      return {
        name:
          "尚未选择房源",

        area:
          null,

        district:
          null
      };
    }


    try {
      const property =
        propertySystem.get(
          status.restaurant
            .locationId
        );


      return {
        name:
          property.name,

        area:
          property.usableArea ??
          property.area,

        district:
          property.districtName ??
          property.districtId ??
          null
      };
    } catch {
      return {
        name:
          "当前经营房源",

        area:
          null,

        district:
          null
      };
    }
  }


  getPage(
    restaurantId
  ) {
    const status =
      openingFlowSystem
        .getStatus(
          restaurantId
        );


    const restaurant =
      status.restaurant;


    const location =
      this.getLocation(
        status
      );


    const time =
      gameState.getSection(
        "time"
      );


    const runtime =
      gameState.getSection(
        "runtime"
      );


    const next =
      status.nextAction;


    const notices = [
      {
        id:
          "opening_next",

        type:
          status.canOpen
            ? "success"
            : "info",

        title:
          status.canOpen
            ? "开业检查通过"
            : "开店任务",

        message:
          status.canOpen
            ? "全部开业条件已满足，可以正式营业"
            : `下一步：${next.label} · ${next.description}`,

        priority:
          100,

        action:
          next.target
      }
    ];


    return {
      pageId:
        "opening-setup",

      topBar:
        buildGlobalTopBarModel({
          restaurantName:
            restaurant.name,

          balance:
            safeBalance(
              restaurantId
            ),

          storeLevel:
            restaurant.level,

          reputation:
            restaurant.reputation,

          time,

          runtime,

          currentStoreId:
            restaurantId
        }),

      noticeTicker:
        buildNoticeTickerModel(
          notices
        ),

      location,

      status,

      permits:
        status.permits,

      stock:
        status.starterStock,

      metrics: [
        {
          label:
            "准备进度",

          value:
            `${status.preparation.percent}%`
        },

        {
          label:
            "必要许可",

          value:
            `${status.permits.issuedCount}/${status.permits.requiredCount}`
        },

        {
          label:
            "首批食材",

          value:
            `${status.starterStock.stockedCount}/${status.starterStock.ingredientCount}`
        },

        {
          label:
            "可工作厨师",

          value:
            `${status.availableChefs.length}人`
        },

        {
          label:
            "营业菜品",

          value:
            `${status.activeMenu.length}道`
        }
      ],

      bottomNavigation: [
        {
          label:
            "城市",

          target:
            "city",

          icon:
            "city"
        },

        {
          label:
            "门店",

          target:
            "restaurant",

          icon:
            "store",

          active:
            true
        },

        {
          label:
            "经营",

          target:
            "operations",

          icon:
            "operations"
        },

        {
          label:
            "员工",

          target:
            "employees",

          icon:
            "employees"
        },

        {
          label:
            "更多",

          target:
            "more",

          icon:
            "more"
        }
      ]
    };
  }


  completePermits(
    restaurantId
  ) {
    const result =
      openingFlowSystem
        .completePermits(
          restaurantId
        );


    return {
      result,

      page:
        this.getPage(
          restaurantId
        )
    };
  }


  purchaseStarterStock(
    restaurantId
  ) {
    const result =
      openingFlowSystem
        .purchaseStarterStock(
          restaurantId
        );


    return {
      result,

      page:
        this.getPage(
          restaurantId
        )
    };
  }


  configureSchedule(
    restaurantId,
    options = {}
  ) {
    openingFlowSystem
      .configureSchedule(
        restaurantId,
        options
      );


    return this.getPage(
      restaurantId
    );
  }


  openRestaurant(
    restaurantId
  ) {
    const restaurant =
      openingFlowSystem
        .openRestaurant(
          restaurantId
        );


    return {
      restaurant,

      page:
        this.getPage(
          restaurantId
        ),

      nextPage:
        "operating-command-center"
    };
  }
}


export const openingSetupPageSystem =
  new OpeningSetupPageSystem();


export {
  OpeningSetupPageSystem
};
