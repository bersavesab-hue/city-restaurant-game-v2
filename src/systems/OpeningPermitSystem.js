import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  gameState
} from "../core/GameState.js";

import {
  restaurantSystem
} from "./RestaurantSystem.js";

import {
  propertySystem
} from "./PropertySystem.js";

import {
  renovationSystem
} from "./RenovationSystem.js";

import {
  menuSystem
} from "./MenuSystem.js";

import {
  recipeSystem
} from "./RecipeSystem.js";

import {
  cookingMethodRequiresExhaust
} from "../data/cookingMethods.v1.js";


const PERMIT_DEFINITIONS =
  Object.freeze([
    {
      permitKind:
        "business_registration",

      name:
        "经营登记",

      description:
        "确认经营地址与租赁关系"
    },

    {
      permitKind:
        "food_service",

      name:
        "餐饮经营许可",

      description:
        "确认房源可开展餐饮经营"
    },

    {
      permitKind:
        "fire_safety",

      name:
        "消防与营业安全检查",

      description:
        "确认装修和基础经营空间达到开业条件"
    },

    {
      permitKind:
        "exhaust",

      name:
        "排烟条件备案",

      description:
        "涉及热厨菜品时检查房源排烟条件"
    }
  ]);


function evaluatePermitRequirements({
  hasLocation,
  foodServiceAllowed,
  renovationActive,
  seats,
  kitchenStations,
  requiresExhaust,
  exhaustAllowed
}) {
  return [
    {
      permitKind:
        "business_registration",

      required:
        true,

      ready:
        Boolean(
          hasLocation
        ),

      reason:
        hasLocation
          ? "经营地址已确定"
          : "尚未完成选址签约"
    },

    {
      permitKind:
        "food_service",

      required:
        true,

      ready:
        Boolean(
          hasLocation &&
          foodServiceAllowed !==
            false
        ),

      reason:
        foodServiceAllowed ===
        false
          ? "该房源不允许餐饮经营"
          : hasLocation
            ? "房源允许餐饮经营"
            : "尚未确定经营房源"
    },

    {
      permitKind:
        "fire_safety",

      required:
        true,

      ready:
        Boolean(
          renovationActive &&
          seats >= 2 &&
          kitchenStations >= 1
        ),

      reason:
        renovationActive
          ? (
              seats >= 2 &&
              kitchenStations >= 1
                ? "装修已经验收并达到基础经营要求"
                : "餐位或厨房工位不足"
            )
          : "装修尚未完工验收"
    },

    {
      permitKind:
        "exhaust",

      required:
        Boolean(
          requiresExhaust
        ),

      ready:
        !requiresExhaust ||
        exhaustAllowed !==
          false,

      reason:
        !requiresExhaust
          ? "当前菜单暂不要求热厨排烟备案"
          : exhaustAllowed ===
            false
            ? "当前菜单涉及热厨，但房源不允许排烟"
            : "热厨排烟条件允许"
    }
  ];
}


class OpeningPermitSystem {
  listByRestaurant(
    restaurantId
  ) {
    return entitySystem
      .list(
        "operating_permit"
      )
      .filter(
        item =>
          item.restaurantId ===
          restaurantId
      );
  }


  getIssuedMap(
    restaurantId
  ) {
    return new Map(
      this
        .listByRestaurant(
          restaurantId
        )
        .filter(
          item =>
            item.status ===
            "issued"
        )
        .map(
          item => [
            item.permitKind,
            item
          ]
        )
    );
  }


  menuRequiresExhaust(
    restaurantId
  ) {
    const items =
      menuSystem
        .listByRestaurant(
          restaurantId,
          {
            activeOnly:
              true
          }
        );


    return items.some(
      item => {
        const recipe =
          recipeSystem.get(
            item.recipeId
          );

        return (
          recipe &&
          cookingMethodRequiresExhaust(
            recipe.method
          )
        );
      }
    );
  }


  getStatus(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );


    let property =
      null;


    if (
      restaurant.locationId
    ) {
      try {
        property =
          propertySystem.get(
            restaurant.locationId
          );
      } catch {
        property =
          null;
      }
    }


    const renovation =
      renovationSystem
        .getSummary(
          restaurantId
        );


    const requiresExhaust =
      this.menuRequiresExhaust(
        restaurantId
      );


    const requirements =
      evaluatePermitRequirements({
        hasLocation:
          Boolean(
            restaurant.locationId
          ),

        foodServiceAllowed:
          property
            ?.foodServiceAllowed,

        renovationActive:
          Boolean(
            renovation.active
          ),

        seats:
          renovation.modifiers
            ?.seats ??
          0,

        kitchenStations:
          renovation.modifiers
            ?.kitchenStations ??
          0,

        requiresExhaust,

        exhaustAllowed:
          property
            ?.exhaustAllowed
      });


    const issued =
      this.getIssuedMap(
        restaurantId
      );


    const permits =
      PERMIT_DEFINITIONS.map(
        definition => {
          const requirement =
            requirements.find(
              item =>
                item.permitKind ===
                definition.permitKind
            );


          const record =
            issued.get(
              definition.permitKind
            ) ??
            null;


          return {
            ...definition,

            ...requirement,

            issued:
              Boolean(
                record
              ),

            record
          };
        }
      );


    const required =
      permits.filter(
        item =>
          item.required
      );


    return {
      restaurantId,

      property,

      requiresExhaust,

      permits,

      requiredCount:
        required.length,

      issuedCount:
        required.filter(
          item =>
            item.issued
        ).length,

      allRequirementsReady:
        required.every(
          item =>
            item.ready
        ),

      complete:
        required.every(
          item =>
            item.ready &&
            item.issued
        )
    };
  }


  issueAll(
    restaurantId
  ) {
    const status =
      this.getStatus(
        restaurantId
      );


    const blocked =
      status.permits
        .filter(
          item =>
            item.required &&
            !item.ready
        );


    if (
      blocked.length >
      0
    ) {
      throw new Error(
        "许可条件未满足：" +
        blocked
          .map(
            item =>
              item.name
          )
          .join("、")
      );
    }


    const day =
      gameState
        .getSection(
          "time"
        )
        ?.day ??
      1;


    const issuedMap =
      this.getIssuedMap(
        restaurantId
      );


    const created = [];


    for (
      const permit
      of status.permits
    ) {
      if (
        !permit.required ||
        issuedMap.has(
          permit.permitKind
        )
      ) {
        continue;
      }


      created.push(
        entitySystem.create(
          "operating_permit",
          {
            restaurantId,

            permitKind:
              permit.permitKind,

            name:
              permit.name,

            status:
              "issued",

            issuedDay:
              day
          }
        )
      );
    }


    return {
      created,

      status:
        this.getStatus(
          restaurantId
        )
    };
  }
}


export const openingPermitSystem =
  new OpeningPermitSystem();


export {
  OpeningPermitSystem,
  PERMIT_DEFINITIONS,
  evaluatePermitRequirements
};
