const PRIMARY_ENTRIES =
  Object.freeze([
    {
      id: "menu",
      title: "菜品与菜单",
      description:
        "菜品、定价、菜单结构与菜品优化",
      target: "dishes",

      secondary: [
        {
          title: "菜单优化",
          target:
            "menu-optimization"
        },

        {
          title: "菜单工程",
          target:
            "menu-engineering"
        }
      ]
    },

    {
      id: "supply",
      title: "供应链",
      description:
        "库存、采购、供应商与缺货风险",
      target: "supply",

      secondary: []
    },

    {
      id: "channels",
      title: "客流与渠道",
      description:
        "堂食、外卖、渠道表现与顾客口碑",
      target: "channels",

      secondary: [
        {
          title: "顾客口碑",
          target:
            "reputation"
        },

        {
          title: "顾客管理",
          target:
            "customers"
        }
      ]
    },

    {
      id: "analytics",
      title: "经营分析",
      description:
        "营业数据、排队、产能与经营趋势",
      target: "analytics",

      secondary: [
        {
          title: "产能与排队",
          target:
            "capacity"
        }
      ]
    },

    {
      id: "finance",
      title: "财务",
      description:
        "现金、收入、成本与利润",
      target: "finance",

      secondary: []
    },

    {
      id: "market",
      title: "市场与竞争",
      description:
        "门店定位、市场份额、竞争店、商圈事件和营销动作",
      target: "market-strategy",

      secondary: [
        {
          title: "排行榜",
          target:
            "ranking-center"
        }
      ]
    },


    {
      id: "competition",
      title: "榜单与荣誉",
      description:
        "市场排名、周期评奖、提名入围与永久荣誉",
      target: "ranking-center",

      secondary: [
        {
          title: "奖项中心",
          target:
            "awards-center"
        },

        {
          title: "荣誉馆",
          target:
            "honor-hall"
        }
      ]
    }
  ]);


class OperationsHubPageSystem {
  getPage() {
    return {
      pageId:
        "operations-home",

      title:
        "经营",

      entries:
        PRIMARY_ENTRIES
          .map(
            entry => ({
              ...entry,

              secondary:
                entry.secondary
                  .map(
                    item => ({
                      ...item
                    })
                  )
            })
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
