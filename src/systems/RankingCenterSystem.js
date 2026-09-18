import {
  competitionMetricsSystem
} from "./CompetitionMetricsSystem.js";


const RANKING_DEFINITIONS =
  Object.freeze([
    {
      id: "district_market_share",
      title: "商圈市场份额榜",
      category: "restaurant",
      scope: "district",
      metric: "marketShare",
      format: "percent"
    },

    {
      id: "district_reputation",
      title: "商圈口碑榜",
      category: "restaurant",
      scope: "district",
      metric: "reputationScore",
      format: "score"
    },

    {
      id: "district_service",
      title: "商圈服务榜",
      category: "restaurant",
      scope: "district",
      metric: "serviceScore",
      format: "score"
    },

    {
      id: "district_quality",
      title: "商圈品质榜",
      category: "restaurant",
      scope: "district",
      metric: "qualityScore",
      format: "score"
    },

    {
      id: "city_brand",
      title: "全城品牌榜",
      category: "restaurant",
      scope: "city",
      metric: "brandScore",
      format: "score"
    },

    {
      id: "store_revenue",
      title: "门店营业额榜",
      category: "restaurant",
      scope: "player",
      metric: "revenue",
      format: "money"
    },

    {
      id: "store_profit",
      title: "门店利润榜",
      category: "restaurant",
      scope: "player",
      metric: "profit",
      format: "money"
    },

    {
      id: "store_customer",
      title: "顾客满意榜",
      category: "restaurant",
      scope: "player",
      metric: "customerScore",
      format: "score"
    },

    {
      id: "store_repeat",
      title: "复购率榜",
      category: "restaurant",
      scope: "player",
      metric: "repeatRate",
      format: "percent"
    },

    {
      id: "dish_sales",
      title: "热销菜榜",
      category: "dish",
      scope: "restaurant",
      metric: "quantity",
      format: "number"
    },

    {
      id: "dish_revenue",
      title: "菜品营业额榜",
      category: "dish",
      scope: "restaurant",
      metric: "revenue",
      format: "money"
    },

    {
      id: "dish_profit",
      title: "菜品贡献利润榜",
      category: "dish",
      scope: "restaurant",
      metric: "contributionProfit",
      format: "money"
    },

    {
      id: "dish_margin",
      title: "高效菜品榜",
      category: "dish",
      scope: "restaurant",
      metric: "marginScore",
      format: "score"
    },

    {
      id: "dish_quality",
      title: "菜品品质榜",
      category: "dish",
      scope: "restaurant",
      metric: "averageQuality",
      format: "score"
    },

    {
      id: "dish_signature",
      title: "招牌菜榜",
      category: "dish",
      scope: "restaurant",
      metric: "signatureScore",
      format: "score"
    },

    {
      id: "chef_ranking",
      title: "厨师榜",
      category: "employee",
      scope: "restaurant",
      metric: "craftScore",
      format: "score",
      roleIds: [
        "chef",
        "kitchen_assistant"
      ]
    },

    {
      id: "service_employee_ranking",
      title: "服务员工榜",
      category: "employee",
      scope: "restaurant",
      metric: "serviceScore",
      format: "score",
      roleIds: [
        "server",
        "cashier"
      ]
    },

    {
      id: "manager_ranking",
      title: "店长榜",
      category: "employee",
      scope: "restaurant",
      metric: "leadershipScore",
      format: "score",
      roleIds: [
        "manager"
      ]
    },

    {
      id: "employee_growth_ranking",
      title: "员工成长榜",
      category: "employee",
      scope: "restaurant",
      metric: "growthScore",
      format: "score"
    }
  ]);


class RankingCenterSystem {
  getDefinitions() {
    return structuredClone(
      RANKING_DEFINITIONS
    );
  }


  getCandidates(
    restaurantId,
    definition,
    period,
    endDay
  ) {
    if (
      definition.category ===
      "restaurant"
    ) {
      if (
        definition.scope ===
        "district"
      ) {
        return competitionMetricsSystem
          .getDistrictRestaurantCandidates(
            restaurantId,
            period,
            endDay
          );
      }


      if (
        definition.scope ===
        "city"
      ) {
        return competitionMetricsSystem
          .getCityRestaurantCandidates(
            restaurantId,
            period,
            endDay
          );
      }


      return competitionMetricsSystem
        .getPlayerRestaurantCandidates(
          period,
          endDay
        );
    }


    if (
      definition.category ===
      "dish"
    ) {
      return competitionMetricsSystem
        .getDishCandidates(
          restaurantId,
          period,
          endDay
        );
    }


    if (
      definition.category ===
      "employee"
    ) {
      let candidates =
        competitionMetricsSystem
          .getEmployeeCandidates(
            restaurantId
          );


      if (
        definition.roleIds
          ?.length
      ) {
        candidates =
          candidates.filter(
            item =>
              definition.roleIds
                .includes(
                  item.roleId
                )
          );
      }


      return candidates;
    }


    return [];
  }


  buildBoard(
    restaurantId,
    definitionId,
    {
      period = "month",
      endDay = null,
      limit = 20
    } = {}
  ) {
    const definition =
      RANKING_DEFINITIONS
        .find(
          item =>
            item.id ===
            definitionId
        );


    if (!definition) {
      throw new Error(
        `Unknown ranking "${definitionId}"`
      );
    }


    const candidates =
      this.getCandidates(
        restaurantId,
        definition,
        period,
        endDay ??
          competitionMetricsSystem
            .getCurrentDay()
      )
        .filter(
          item =>
            Number.isFinite(
              item[
                definition.metric
              ]
            )
        )
        .sort(
          (a, b) => {
            const delta =
              b[
                definition.metric
              ] -
              a[
                definition.metric
              ];


            if (delta !== 0) {
              return delta;
            }


            return String(
              a.id
            ).localeCompare(
              String(
                b.id
              )
            );
          }
        );


    const rows =
      candidates
        .slice(
          0,
          limit
        )
        .map(
          (
            item,
            index
          ) => ({
            rank:
              index + 1,

            id:
              item.id,

            name:
              item.name,

            subjectType:
              item.subjectType,

            isPlayer:
              Boolean(
                item.isPlayer
              ),

            roleName:
              item.roleName ??
              null,

            districtName:
              item.districtName ??
              null,

            score:
              item[
                definition.metric
              ],

            metric:
              definition.metric
          })
        );


    const playerRows =
      rows.filter(
        item =>
          item.isPlayer
      );


    return {
      ...definition,

      period,

      rows,

      playerRows,

      totalCandidates:
        candidates.length
    };
  }


  getBoards(
    restaurantId,
    {
      period = "month",
      category = null,
      endDay = null
    } = {}
  ) {
    return RANKING_DEFINITIONS
      .filter(
        item =>
          !category ||
          item.category ===
            category
      )
      .map(
        definition =>
          this.buildBoard(
            restaurantId,
            definition.id,
            {
              period,
              endDay
            }
          )
      );
  }


  getOverview(
    restaurantId,
    {
      period = "month",
      endDay = null
    } = {}
  ) {
    const boards =
      this.getBoards(
        restaurantId,
        {
          period,
          endDay
        }
      );


    const playerHighlights =
      boards
        .map(
          board => {
            const row =
              board.rows.find(
                item =>
                  item.isPlayer
              );


            return row
              ? {
                  boardId:
                    board.id,

                  boardTitle:
                    board.title,

                  rank:
                    row.rank,

                  score:
                    row.score,

                  format:
                    board.format,

                  totalCandidates:
                    board.totalCandidates
                }
              : null;
          }
        )
        .filter(Boolean)
        .sort(
          (a, b) =>
            a.rank -
            b.rank
        );


    return {
      period,
      boardCount:
        boards.length,

      boards,

      playerHighlights:
        playerHighlights.slice(
          0,
          8
        )
    };
  }
}


export const rankingCenterSystem =
  new RankingCenterSystem();


export {
  RankingCenterSystem,
  RANKING_DEFINITIONS
};
