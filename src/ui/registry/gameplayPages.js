import {
  pageRegistry
} from "./PageRegistry.js";

import "./defaultPages.js";


const GAMEPLAY_PAGES = [
  {
    id:
      "restaurant-home",

    title:
      "门店",

    parent:
      "restaurant",

    order:
      201,

    layout:
      "management",

    metadata: {
      hiddenFromMenu:
        true,

      landingFor:
        "restaurant"
    }
  },


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
      "operations-home",

    title:
      "经营",

    parent:
      "operations",

    order:
      301,

    layout:
      "management",

    metadata: {
      hiddenFromMenu:
        true,

      landingFor:
        "operations"
    }
  },


  {
    id:
      "operating-command-center",

    title:
      "经营总控",

    parent:
      "restaurant",

    order:
      201,

    layout:
      "dashboard",

    metadata: {
      landingFor:
        "restaurant",

      primary:
        true
    }
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
      "workforce-capacity",

    title:
      "员工产能",

    parent:
      "employees",

    order:
      415,

    layout:
      "management"
  }
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
