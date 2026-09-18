import {
  rankingCenterSystem,
  RANKING_DEFINITIONS
} from "../../../systems/RankingCenterSystem.js";


const RANKING_PERIODS =
  Object.freeze([
    {
      id: "month",
      name: "月榜"
    },

    {
      id: "quarter",
      name: "季榜"
    },

    {
      id: "year",
      name: "年榜"
    },

    {
      id: "all",
      name: "总榜"
    }
  ]);


const RANKING_CATEGORIES =
  Object.freeze([
    {
      id: "restaurant",
      name: "门店榜"
    },

    {
      id: "dish",
      name: "菜品榜"
    },

    {
      id: "employee",
      name: "员工榜"
    }
  ]);


class RankingCenterPageSystem {
  getPage(
    restaurantId,
    {
      period = "month",
      category = "restaurant",
      boardId = null
    } = {}
  ) {
    const safePeriod =
      RANKING_PERIODS
        .some(
          item =>
            item.id === period
        )
        ? period
        : "month";


    const safeCategory =
      RANKING_CATEGORIES
        .some(
          item =>
            item.id === category
        )
        ? category
        : "restaurant";


    const definitions =
      RANKING_DEFINITIONS
        .filter(
          item =>
            item.category ===
            safeCategory
        );


    const selectedDefinition =
      definitions.find(
        item =>
          item.id === boardId
      ) ??
      definitions[0] ??
      null;


    const boards =
      rankingCenterSystem
        .getBoards(
          restaurantId,
          {
            period:
              safePeriod,

            category:
              safeCategory
          }
        );


    const selectedBoard =
      selectedDefinition
        ? rankingCenterSystem
            .buildBoard(
              restaurantId,
              selectedDefinition
                .id,
              {
                period:
                  safePeriod
              }
            )
        : null;


    return {
      pageId:
        "ranking-center",

      title:
        "排行榜中心",

      period:
        safePeriod,

      category:
        safeCategory,

      boardId:
        selectedDefinition
          ?.id ??
        null,

      periods:
        RANKING_PERIODS,

      categories:
        RANKING_CATEGORIES,

      definitions,

      boards,

      selectedBoard,

      boardCount:
        RANKING_DEFINITIONS
          .length
    };
  }
}


export const rankingCenterPageSystem =
  new RankingCenterPageSystem();


export {
  RankingCenterPageSystem,
  RANKING_PERIODS,
  RANKING_CATEGORIES
};
