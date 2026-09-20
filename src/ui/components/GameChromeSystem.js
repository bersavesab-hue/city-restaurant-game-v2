import "../registry/defaultPages.js";

import {
  PRIMARY_UI_ICON_BY_ID,
  resolvePrimaryRouteAlias
} from "../contracts/PrimaryUiContract.js";

import {
  pageRegistry
} from "../registry/PageRegistry.js";

import {
  openingFlowSystem
} from "../../systems/OpeningFlowSystem.js";

import {
  staffingRecommendationSystem
} from "../../systems/StaffingRecommendationSystem.js";

import {
  awardFeedbackSystem
} from "../../systems/AwardFeedbackSystem.js";


const MAIN_ICONS =
  PRIMARY_UI_ICON_BY_ID;


const BACK_OVERRIDES =
  Object.freeze({
    properties:
      "city",

    property_detail:
      "properties",

    lease:
      "restaurant",

    renovation:
      "restaurant",

    renovation_construction:
      "renovation",

    "opening-setup":
      "restaurant",

    dishes:
      "operations",

    supply:
      "operations",

    analytics:
      "operations",

    finance:
      "operations",

    employee_training:
      "employee_roster",

    employee_promotion:
      "employee_roster",

    employee_detail:
      "employee_roster",

    employee_recruitment:
      "employee_roster",

    chain:
      "more",

    settings:
      "more"
  });


function clampBadge(
  value
) {
  const number =
    Math.max(
      0,
      Math.floor(
        Number(value) ||
        0
      )
    );

  return Math.min(
    99,
    number
  );
}


function resolveMainRoot(
  pageId,
  registry =
    pageRegistry
) {
  if (!pageId) {
    return null;
  }


  let currentId =
    resolvePrimaryRouteAlias(
      pageId
    );

  const visited =
    new Set();


  while (
    currentId &&
    !visited.has(
      currentId
    )
  ) {
    visited.add(
      currentId
    );


    let page;

    try {
      page =
        registry.get(
          currentId
        );
    } catch {
      return null;
    }


    if (
      page.nav ===
      "main"
    ) {
      return page.id;
    }


    currentId =
      page.parent;
  }


  return null;
}


function buildNavigationItems(
  mainPages,
  activeRoot,
  badges = {}
) {
  return mainPages.map(
    page => ({
      id:
        page.id,

      target:
        page.id,

      label:
        page.title,

      title:
        page.title,

      icon:
        MAIN_ICONS[
          page.id
        ] ??
        page.id,

      active:
        page.id ===
        activeRoot,

      badge:
        clampBadge(
          badges[
            page.id
          ] ??
          0
        )
    })
  );
}


class GameChromeSystem {
  getBadges(
    restaurantId
  ) {
    const badges = {
      city:
        0,

      restaurant:
        0,

      operations:
        0,

      employees:
        0,

      more:
        0
    };


    if (!restaurantId) {
      return badges;
    }


    try {
      const opening =
        openingFlowSystem
          .getStatus(
            restaurantId
          );


      if (
        !opening.hasOpened
      ) {
        if (
          !opening.lease
        ) {
          badges.city +=
            1;
        }


        if (
          !opening.renovation
            .active
        ) {
          badges.restaurant +=
            1;
        }


        if (
          !opening.permits
            .complete
        ) {
          badges.restaurant +=
            1;
        }


        if (
          opening.activeMenu
            .length ===
          0
        ) {
          badges.operations +=
            1;
        }


        if (
          opening.activeMenu
            .length >
            0 &&
          !opening.starterStock
            .complete
        ) {
          badges.operations +=
            Math.max(
              1,
              opening.starterStock
                .items
                .filter(
                  item =>
                    !item.ready
                )
                .length
            );
        }


        if (
          opening.availableChefs
            .length ===
          0
        ) {
          badges.employees +=
            1;
        }
      }
    } catch {
      // 开局尚未形成完整门店时不阻塞UI。
    }


    try {
      const staffing =
        staffingRecommendationSystem
          .getRecommendation(
            restaurantId
          );


      badges.employees +=
        staffing.totalShortage;
    } catch {
      // 装修或餐位尚未形成时无需显示编制红点。
    }


    try {
      badges.operations +=
        awardFeedbackSystem
          .getUnreadCount(
            restaurantId
          );
    } catch {
      // 尚无评奖记录时不影响导航。
    }


    for (
      const key
      of Object.keys(
        badges
      )
    ) {
      badges[key] =
        clampBadge(
          badges[key]
        );
    }


    return badges;
  }


  getNavigation({
    restaurantId = null,
    activePageId = null
  } = {}) {
    const root =
      resolveMainRoot(
        activePageId
      ) ??
      activePageId;


    return buildNavigationItems(
      pageRegistry
        .mainNavigation(),
      root,
      this.getBadges(
        restaurantId
      )
    );
  }


  getBackTarget(
    pageId
  ) {
    if (
      BACK_OVERRIDES[
        pageId
      ]
    ) {
      return BACK_OVERRIDES[
        pageId
      ];
    }


    try {
      return (
        pageRegistry
          .get(
            pageId
          )
          .parent ??
        null
      );
    } catch {
      return null;
    }
  }


  getMainRoot(
    pageId
  ) {
    return resolveMainRoot(
      pageId
    );
  }
}


export const gameChromeSystem =
  new GameChromeSystem();


export {
  GameChromeSystem,
  MAIN_ICONS,
  BACK_OVERRIDES,
  resolveMainRoot,
  buildNavigationItems
};
