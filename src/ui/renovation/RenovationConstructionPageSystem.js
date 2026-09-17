import {
  gameState
} from "../../core/GameState.js";

import {
  financeSystem
} from "../../systems/FinanceSystem.js";

import {
  restaurantSystem
} from "../../systems/RestaurantSystem.js";

import {
  renovationSystem
} from "../../systems/RenovationSystem.js";

import {
  renovationConstructionSystem
} from "../../systems/RenovationConstructionSystem.js";

import {
  pageRegistry
} from "../registry/PageRegistry.js";


if (
  !pageRegistry.has(
    "renovation_construction"
  )
) {
  pageRegistry.register({
    id:
      "renovation_construction",

    title:
      "装修施工",

    parent:
      "restaurant",

    order:
      215,

    layout:
      "management",

    metadata: {
      renovation:
        true
    }
  });
}


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


class RenovationConstructionPageSystem {
  getTimeline(
    progress,
    construction
  ) {
    const current =
      progress.progress;


    const steps = [
      {
        id:
          "confirmed",

        label:
          "方案确认",

        threshold:
          0
      },

      {
        id:
          "base",

        label:
          "基础施工",

        threshold:
          1
      },

      {
        id:
          "utilities",

        label:
          "水电厨房",

        threshold:
          20
      },

      {
        id:
          "installation",

        label:
          "设备安装",

        threshold:
          45
      },

      {
        id:
          "finishing",

        label:
          "收尾清洁",

        threshold:
          75
      },

      {
        id:
          "inspection",

        label:
          "完工验收",

        threshold:
          100
      }
    ];


    return steps.map(
      step => {
        let state =
          "pending";


        if (
          step.id ===
          "confirmed"
        ) {
          state =
            "complete";
        } else if (
          current >=
          step.threshold
        ) {
          state =
            step.id ===
              "inspection" &&
            construction
              ?.status !==
              "completed"
              ? "current"
              : "complete";
        } else if (
          step.id ===
          progress.phase
        ) {
          state =
            "current";
        }


        return {
          ...step,
          state
        };
      }
    );
  }


  getPage(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );


    const status =
      renovationConstructionSystem
        .getStatus(
          restaurantId
        );


    const summary =
      renovationSystem
        .getSummary(
          restaurantId
        );


    const construction =
      status.construction;


    const progress =
      status.progress;


    const time =
      gameState.getSection(
        "time"
      );


    const modifiers =
      construction
        ?.expectedModifiers ??
      summary.modifiers;


    return {
      pageId:
        "renovation_construction",

      restaurant: {
        id:
          restaurant.id,

        name:
          restaurant.name,

        level:
          restaurant.level,

        reputation:
          restaurant.reputation
      },

      topBar: {
        balance:
          safeBalance(
            restaurantId
          ),

        day:
          time.day,

        hour:
          time.hour,

        minute:
          time.minute
      },

      construction,

      progress,

      timeline:
        construction
          ? this.getTimeline(
              progress,
              construction
            )
          : [],

      project: construction
        ? {
            area:
              construction.area,

            placements:
              construction
                .placements,

            projectCost:
              construction
                .projectCost,

            startDay:
              construction
                .startDay,

            endDay:
              construction
                .endDay,

            durationDays:
              construction
                .durationDays,

            seats:
              modifiers
                ?.seats ??
              0,

            kitchenStations:
              modifiers
                ?.kitchenStations ??
              0,

            score:
              construction
                .analysis
                ?.score ??
              null,

            grade:
              construction
                .analysis
                ?.grade ??
              null
          }
        : null,

      actions: {
        canInspect:
          construction
            ?.status ===
            "ready_for_inspection",

        completed:
          construction
            ?.status ===
            "completed",

        hasConstruction:
          Boolean(
            construction
          )
      },

      imageSlots: [
        {
          id:
            "renovation-construction-site",

          type:
            "construction-site"
        },

        {
          id:
            "renovation-construction-preview",

          type:
            "layout-preview"
        }
      ]
    };
  }


  inspect(
    restaurantId
  ) {
    const result =
      renovationConstructionSystem
        .inspect(
          restaurantId
        );


    return {
      ...result,

      page:
        this.getPage(
          restaurantId
        ),

      nextPage:
        "opening-setup"
    };
  }
}


export const renovationConstructionPageSystem =
  new RenovationConstructionPageSystem();


export {
  RenovationConstructionPageSystem
};
