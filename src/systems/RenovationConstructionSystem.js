import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  gameState
} from "../core/GameState.js";

import {
  eventBus
} from "../core/EventBus.js";

import {
  renovationSystem
} from "./RenovationSystem.js";

import {
  renovationEditorSystem
} from "./RenovationEditorSystem.js";

import {
  financeSystem,
  FINANCE_CATEGORY
} from "./FinanceSystem.js";

import {
  renovationRealityCostSystem
} from "./RenovationRealityCostSystem.js";


const STATUS =
  Object.freeze({
    BUILDING:
      "building",

    READY:
      "ready_for_inspection",

    COMPLETED:
      "completed"
  });


function clamp(
  value,
  min,
  max
) {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
}


function currentDay() {
  return (
    gameState
      .getSection(
        "time"
      )
      ?.day ??
    1
  );
}


class RenovationConstructionSystem {
  listByRestaurant(
    restaurantId
  ) {
    return entitySystem
      .list(
        "renovation_construction"
      )
      .filter(
        item =>
          item.restaurantId ===
          restaurantId
      )
      .sort(
        (
          a,
          b
        ) =>
          (
            b.startDay ??
            0
          ) -
          (
            a.startDay ??
            0
          )
      );
  }


  getCurrent(
    restaurantId
  ) {
    return this
      .listByRestaurant(
        restaurantId
      )
      .find(
        item =>
          [
            STATUS.BUILDING,
            STATUS.READY
          ].includes(
            item.status
          )
      ) ?? null;
  }


  getLatest(
    restaurantId
  ) {
    return (
      this.listByRestaurant(
        restaurantId
      )[0] ??
      null
    );
  }


  estimateDurationDays({
    area,
    placements
  }) {
    const safeArea =
      Math.max(
        1,
        Number(area) ||
        1
      );

    const safePlacements =
      Math.max(
        1,
        Number(placements) ||
        1
      );

    return clamp(
      1 +
      Math.ceil(
        safeArea /
        500
      ) +
      Math.ceil(
        safePlacements /
        20
      ),
      3,
      10
    );
  }


  getProgressModel(
    construction,
    day = currentDay()
  ) {
    if (!construction) {
      return {
        progress:
          0,

        elapsedDays:
          0,

        remainingDays:
          0,

        phase:
          "none",

        phaseLabel:
          "暂无施工"
      };
    }


    if (
      construction.status ===
      STATUS.COMPLETED
    ) {
      return {
        progress:
          100,

        elapsedDays:
          construction
            .durationDays,

        remainingDays:
          0,

        phase:
          "completed",

        phaseLabel:
          "已完工启用"
      };
    }


    const elapsedDays =
      clamp(
        day -
        construction.startDay,
        0,
        construction
          .durationDays
      );

    const progress =
      clamp(
        Math.floor(
          elapsedDays /
          construction
            .durationDays *
          100
        ),
        0,
        100
      );

    const remainingDays =
      Math.max(
        0,
        construction.endDay -
        day
      );


    if (
      construction.status ===
      STATUS.READY ||
      progress >=
        100
    ) {
      return {
        progress:
          100,

        elapsedDays:
          construction
            .durationDays,

        remainingDays:
          0,

        phase:
          "inspection",

        phaseLabel:
          "等待完工验收"
      };
    }


    let phase =
      "base";

    let phaseLabel =
      "基础施工";


    if (
      progress >=
      75
    ) {
      phase =
        "finishing";

      phaseLabel =
        "收尾清洁";
    } else if (
      progress >=
      45
    ) {
      phase =
        "installation";

      phaseLabel =
        "设备与家具安装";
    } else if (
      progress >=
      20
    ) {
      phase =
        "utilities";

      phaseLabel =
        "水电与厨房施工";
    }


    return {
      progress,

      elapsedDays,

      remainingDays,

      phase,

      phaseLabel
    };
  }


  validateDraft(
    restaurantId
  ) {
    const page =
      renovationEditorSystem
        .getPageState(
          restaurantId
        );

    if (
      !page.actions
        .canActivate
    ) {
      throw new Error(
        "装修布局尚未达到施工要求"
      );
    }


    const draft =
      renovationEditorSystem
        .getDraftLayout(
          restaurantId
        );

    const modifiers =
      renovationSystem
        .getOperationalModifiersFromLayout(
          draft
        );


    if (
      modifiers.seats <
      2
    ) {
      throw new Error(
        "施工方案至少需要2个餐位"
      );
    }


    if (
      modifiers
        .kitchenStations <
      1
    ) {
      throw new Error(
        "施工方案至少需要1个厨房工位"
      );
    }


    return {
      page,
      draft,
      modifiers
    };
  }


  startFromEditor(
    restaurantId
  ) {
    if (
      this.getCurrent(
        restaurantId
      )
    ) {
      throw new Error(
        "当前已经有装修施工任务"
      );
    }


    const preview =
      this.validateDraft(
        restaurantId
      );


    const saved =
      renovationEditorSystem
        .save(
          restaurantId,
          {
            activate:
              false
          }
        );


    const started =
      this.startSavedLayout(
        restaurantId,
        {
          projectCost:
            saved.budget
              .purchaseCost,

          expectedBaseConstructionCost:
            saved.budget
              .baseConstructionCost ??
            0,

          analysis:
            saved.analysis,

          expectedModifiers:
            preview.modifiers
        }
      );


    return {
      ...saved,

      construction:
        started,

      constructionStarted:
        true,

      nextPage:
        "renovation_construction"
    };
  }


  startSavedLayout(
    restaurantId,
    {
      projectCost = 0,
      expectedBaseConstructionCost = null,
      analysis = null,
      expectedModifiers = null
    } = {}
  ) {
    if (
      this.getCurrent(
        restaurantId
      )
    ) {
      throw new Error(
        "当前已经有装修施工任务"
      );
    }


    let layout =
      renovationSystem
        .getLayout(
          restaurantId
        );


    if (!layout) {
      throw new Error(
        "装修布局不存在"
      );
    }


    const modifiers =
      expectedModifiers ??
      renovationSystem
        .getOperationalModifiersFromLayout(
          layout
        );


    if (
      modifiers.seats <
      2
    ) {
      throw new Error(
        "施工方案至少需要2个餐位"
      );
    }


    if (
      modifiers
        .kitchenStations <
      1
    ) {
      throw new Error(
        "施工方案至少需要1个厨房工位"
      );
    }


    if (
      layout.active
    ) {
      layout =
        renovationSystem
          .deactivateLayout(
            restaurantId
          );
    }


    const constructionCost =
      renovationRealityCostSystem
        .calculateForLayout(
          layout
        );

    const baseConstructionCost =
      expectedBaseConstructionCost ===
      null
        ? constructionCost
            .baseConstructionCost
        : Math.max(
            0,
            Math.round(
              Number(
                expectedBaseConstructionCost
              ) ||
              0
            )
          );

    if (
      baseConstructionCost >
      0
    ) {
      const balance =
        financeSystem.getBalance(
          restaurantId
        );

      if (
        balance <
        baseConstructionCost
      ) {
        throw new Error(
          `装修基础施工资金不足：需要${baseConstructionCost}元，当前余额${balance}元`
        );
      }

      const payment =
        financeSystem.expense(
          restaurantId,
          baseConstructionCost,
          FINANCE_CATEGORY.DECORATION,
          `基础装修施工 ${constructionCost.area}㎡ × ${constructionCost.ratePerSquareMeter}元/㎡`
        );

      layout =
        entitySystem.update(
          "renovation_layout",
          layout.id,
          {
            baseRenovationPaid:
              true,

            baseRenovationCost:
              (
                layout
                  .baseRenovationCost ??
                0
              ) +
              baseConstructionCost,

            baseRenovationRatePerSquareMeter:
              constructionCost
                .ratePerSquareMeter,

            baseRenovationTier:
              constructionCost.tier,

            baseRenovationSource:
              constructionCost
                .source
                ? structuredClone(
                    constructionCost
                      .source
                  )
                : null,

            baseRenovationTransactionId:
              payment
                .transaction
                .id,

            totalSpent:
              (
                layout.totalSpent ??
                0
              ) +
              baseConstructionCost
          }
        );
    }


    const floors =
      renovationSystem
        .getLayoutFloors(
          layout
        );


    const area =
      floors.reduce(
        (
          sum,
          floor
        ) =>
          sum +
          (
            floor.usableArea ??
            floor.area ??
            0
          ),
        0
      );


    const placements =
      layout.placements
        ?.length ??
      0;


    const durationDays =
      this.estimateDurationDays({
        area,
        placements
      });


    const startDay =
      currentDay();


    const construction =
      entitySystem.create(
        "renovation_construction",
        {
          restaurantId,

          layoutId:
            layout.id,

          layoutRevision:
            layout.revision ??
            1,

          propertyId:
            layout.propertyId ??
            null,

          status:
            STATUS.BUILDING,

          startDay,

          endDay:
            startDay +
            durationDays,

          durationDays,

          area,

          placements,

          furnishingCost:
            Math.max(
              0,
              Number(
                projectCost
              ) ||
              0
            ),

          baseConstructionCost,

          projectCost:
            Math.max(
              0,
              Number(
                projectCost
              ) ||
              0
            ) +
            baseConstructionCost,

          priceModel:
            "reality_1_to_1_v2",

          constructionRatePerSquareMeter:
            constructionCost
              .ratePerSquareMeter,

          constructionTier:
            constructionCost.tier,

          constructionSource:
            constructionCost.source
              ? structuredClone(
                  constructionCost.source
                )
              : null,

          expectedModifiers:
            structuredClone(
              modifiers
            ),

          analysis:
            analysis
              ? structuredClone(
                  analysis
                )
              : null,

          readyDay:
            null,

          inspectedDay:
            null,

          completedDay:
            null
        }
      );


    eventBus.emit(
      "renovationConstruction:started",
      {
        restaurantId,

        constructionId:
          construction.id,

        durationDays,

        endDay:
          construction.endDay
      }
    );


    return construction;
  }


  synchronize(
    construction,
    day = currentDay()
  ) {
    if (
      !construction ||
      construction.status !==
      STATUS.BUILDING
    ) {
      return construction;
    }


    if (
      day <
      construction.endDay
    ) {
      return construction;
    }


    const updated =
      entitySystem.update(
        "renovation_construction",
        construction.id,
        {
          status:
            STATUS.READY,

          readyDay:
            day
        }
      );


    eventBus.emit(
      "renovationConstruction:ready",
      {
        restaurantId:
          construction
            .restaurantId,

        constructionId:
          construction.id,

        day
      }
    );


    return updated;
  }


  getStatus(
    restaurantId
  ) {
    const current =
      this.getCurrent(
        restaurantId
      );


    if (current) {
      const construction =
        this.synchronize(
          current
        );

      return {
        construction,

        progress:
          this.getProgressModel(
            construction
          )
      };
    }


    const latest =
      this.getLatest(
        restaurantId
      );


    return {
      construction:
        latest,

      progress:
        this.getProgressModel(
          latest
        )
    };
  }


  processDay(
    day = currentDay()
  ) {
    let completedWork =
      0;


    const jobs =
      entitySystem
        .list(
          "renovation_construction"
        )
        .filter(
          item =>
            item.status ===
            STATUS.BUILDING
        );


    for (
      const construction
      of jobs
    ) {
      const updated =
        this.synchronize(
          construction,
          day
        );


      if (
        updated.status ===
        STATUS.READY
      ) {
        completedWork +=
          1;
      }
    }


    return {
      day,

      checked:
        jobs.length,

      ready:
        completedWork
    };
  }


  inspect(
    restaurantId
  ) {
    const current =
      this.getCurrent(
        restaurantId
      );


    if (!current) {
      throw new Error(
        "当前没有待验收的装修工程"
      );
    }


    const construction =
      this.synchronize(
        current
      );


    if (
      construction.status !==
      STATUS.READY
    ) {
      throw new Error(
        "装修工程尚未完工"
      );
    }


    const layout =
      renovationSystem
        .getLayout(
          restaurantId
        );


    if (!layout) {
      throw new Error(
        "装修布局不存在"
      );
    }


    if (
      (
        layout.revision ??
        1
      ) !==
      construction
        .layoutRevision
    ) {
      throw new Error(
        "施工期间布局发生变化，必须重新确认施工方案"
      );
    }


    const activated =
      renovationSystem
        .activateLayout(
          restaurantId
        );


    const day =
      currentDay();


    const completed =
      entitySystem.update(
        "renovation_construction",
        construction.id,
        {
          status:
            STATUS.COMPLETED,

          inspectedDay:
            day,

          completedDay:
            day,

          activatedLayoutRevision:
            activated.revision
        }
      );


    eventBus.emit(
      "renovationConstruction:completed",
      {
        restaurantId,

        constructionId:
          completed.id,

        layoutId:
          activated.id,

        day
      }
    );


    return {
      construction:
        completed,

      layout:
        activated,

      modifiers:
        renovationSystem
          .getOperationalModifiers(
            restaurantId
          )
    };
  }
}


export const renovationConstructionSystem =
  new RenovationConstructionSystem();


export {
  RenovationConstructionSystem,
  STATUS as RENOVATION_CONSTRUCTION_STATUS
};
