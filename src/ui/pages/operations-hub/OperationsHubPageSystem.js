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
  buildGlobalTopBarModel
} from "../../components/GlobalChromeModel.js";

import {
  gameChromeSystem
} from "../../components/GameChromeSystem.js";


const PRIMARY_ENTRIES =
  Object.freeze([
    {
      id:
        "menu",

      icon:
        "dishes",

      title:
        "菜品与菜单",

      description:
        "菜品、定价、菜单结构与菜品优化",

      target:
        "dishes",

      secondary: [
        {
          title:
            "菜单优化",

          target:
            "menu-optimization"
        },

        {
          title:
            "菜单工程",

          target:
            "menu-engineering"
        }
      ]
    },

    {
      id:
        "supply",

      icon:
        "supply",

      title:
        "供应链",

      description:
        "库存、采购、供应商与缺货风险",

      target:
        "supply",

      secondary:
        []
    },

    {
      id:
        "channels",

      icon:
        "operations",

      title:
        "客流与渠道",

      description:
        "堂食、外卖、渠道表现与顾客口碑",

      target:
        "channels",

      secondary: [
        {
          title:
            "顾客口碑",

          target:
            "reputation"
        },

        {
          title:
            "顾客管理",

          target:
            "customers"
        }
      ]
    },

    {
      id:
        "analytics",

      icon:
        "analytics",

      title:
        "经营分析",

      description:
        "营业数据、排队、产能与经营趋势",

      target:
        "analytics",

      secondary: [
        {
          title:
            "产能与排队",

          target:
            "capacity"
        }
      ]
    },

    {
      id:
        "finance",

      icon:
        "cash",

      title:
        "财务",

      description:
        "现金、收入、成本与利润",

      target:
        "finance",

      secondary:
        []
    },

    {
      id:
        "market",

      icon:
        "city",

      title:
        "市场与竞争",

      description:
        "门店定位、市场份额、竞争店、商圈事件和营销动作",

      target:
        "market-strategy",

      unlockFeature:
        "marketing",

      secondary: [
        {
          title:
            "排行榜",

          target:
            "ranking-center"
        }
      ]
    },

    {
      id:
        "competition",

      icon:
        "ranking",

      title:
        "榜单与荣誉",

      description:
        "市场排名、周期评奖、提名入围与永久荣誉",

      target:
        "ranking-center",

      secondary: [
        {
          title:
            "奖项中心",

          target:
            "awards-center"
        },

        {
          title:
            "荣誉馆",

          target:
            "honor-hall"
        }
      ]
    }
  ]);


class OperationsHubPageSystem {
  getPage(
    restaurantId =
      null
  ) {
    let topBar =
      null;

    if (
      restaurantId
    ) {
      const restaurant =
        restaurantSystem.get(
          restaurantId
        );

      topBar =
        buildGlobalTopBarModel({
          restaurantName:
            restaurant.name,

          balance:
            financeSystem.findAccount(
              restaurantId
            )
              ? financeSystem
                  .getBalance(
                    restaurantId
                  )
              : 0,

          storeLevel:
            restaurant.level ??
            1,

          reputation:
            restaurant.reputation ??
            0,

          time:
            gameState.getSection(
              "time"
            ),

          runtime:
            gameState.getSection(
              "runtime"
            ),

          currentStoreId:
            restaurantId
        });
    }

    return {
      pageId:
        "operations-home",

      title:
        "经营",

      restaurantId,

      topBar,

      navigation:
        gameChromeSystem
          .getNavigation({
            restaurantId,

            activePageId:
              "operations"
          }),

      entries:
        PRIMARY_ENTRIES
          .map(
            entry => {
              const unlocked =
                !entry.unlockFeature ||
                restaurantId ===
                  null ||
                storeProgressSystem
                  .isUnlocked(
                    restaurantId,
                    entry.unlockFeature
                  );

              return {
                ...entry,

                state:
                  unlocked
                    ? "ready"
                    : "locked",

                unlockLevel:
                  entry.unlockFeature
                    ? storeProgressSystem
                        .getUnlockLevel(
                          entry.unlockFeature
                        )
                    : null,

                secondary:
                  entry.secondary
                    .map(
                      item => ({
                        ...item
                      })
                    )
              };
            }
          )
    };
  }
}


export const operationsHubPageSystem =
  new OperationsHubPageSystem();


export {
  OperationsHubPageSystem,
  PRIMARY_ENTRIES
};
