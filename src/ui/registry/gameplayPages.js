import {
  pageRegistry
} from "./PageRegistry.js";

import "./defaultPages.js";


const GAMEPLAY_PAGES = [
  {
    id:
      "equipment-management",

    title:
      "门店设施",

    parent:
      "restaurant",

    order:
      230,

    layout:
      "management"
  },


  {
    id:
      "menu-optimization",

    title:
      "菜单调整",

    parent:
      "operations",

    order:
      315,

    layout:
      "management"
  },


  {
    id:
      "capacity",

    title:
      "产能与排队",

    parent:
      "operations",

    order:
      325,

    layout:
      "dashboard"
  },


  {
    id:
      "reputation",

    title:
      "顾客口碑",

    parent:
      "operations",

    order:
      335,

    layout:
      "dashboard"
  },


  {
    id:
      "channels",

    title:
      "销售渠道",

    parent:
      "operations",

    order:
      345,

    layout:
      "management"
  },


  {
    id:
      "employee_recruitment",

    title:
      "招聘员工",

    parent:
      "employees",

    order:
      411,

    layout:
      "management",

    metadata: {
      hiddenFromMenu:
        true
    }
  },


  {
    id:
      "employee_detail",

    title:
      "员工详情",

    parent:
      "employees",

    order:
      412,

    layout:
      "management",

    metadata: {
      hiddenFromMenu:
        true
    }
  },


  {
    id:
      "workforce-capacity",

    title:
      "员工产能",

    parent:
      "employees",

    order:
      415,

    layout:
      "management"
  },


  {
    id:
      "equipment-maintenance",

    title:
      "设备维护",

    parent:
      "restaurant",

    order:
      235,

    layout:
      "management"
  },


  {
    id:
      "customers",

    title:
      "顾客管理",

    parent:
      "operations",

    order:
      350,

    layout:
      "management"
  },


  {
    id:
      "menu-engineering",

    title:
      "菜单工程",

    parent:
      "operations",

    order:
      355,

    layout:
      "dashboard"
  },


  {
    id:
      "ranking-center",

    title:
      "排行榜",

    parent:
      "operations",

    order:
      365,

    layout:
      "dashboard"
  },


  {
    id:
      "awards-center",

    title:
      "奖项中心",

    parent:
      "operations",

    order:
      366,

    layout:
      "dashboard"
  },


  {
    id:
      "honor-hall",

    title:
      "荣誉馆",

    parent:
      "operations",

    order:
      367,

    layout:
      "dashboard"
  },


  {
    id:
      "award-ceremony",

    title:
      "颁奖典礼",

    parent:
      "operations",

    order:
      368,

    layout:
      "dashboard"
  },


  {
    id:
      "market-strategy",

    title:
      "市场与竞争",

    parent:
      "operations",

    order:
      360,

    layout:
      "dashboard"
  },


  {
    id:
      "store-progress",

    title:
      "成长与解锁",

    parent:
      "more",

    order:
      505,

    layout:
      "management"
  },

];


export function registerGameplayPages(
  registry =
    pageRegistry
) {
  for (
    const definition
    of GAMEPLAY_PAGES
  ) {
    if (
      !registry.has(
        definition.id
      )
    ) {
      registry.register(
        definition
      );
    }
  }

  return registry;
}


registerGameplayPages();


export {
  GAMEPLAY_PAGES
};
