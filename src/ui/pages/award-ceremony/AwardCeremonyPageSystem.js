import {
  entitySystem
} from "../../../core/EntitySystem.js";


const PERIOD_NAME =
  Object.freeze({
    monthly:
      "月度",

    quarterly:
      "季度",

    annual:
      "年度"
  });


class AwardCeremonyPageSystem {
  getLatestWinningResult(
    restaurantId
  ) {
    return entitySystem
      .filter(
        "award_result",
        result =>
          result.winner
            ?.restaurantId ===
          restaurantId
      )
      .sort(
        (a, b) =>
          (
            b.endDay ??
            0
          ) -
          (
            a.endDay ??
            0
          )
      )[0] ??
      null;
  }


  getPage(
    restaurantId,
    {
      resultId = null
    } = {}
  ) {
    let result =
      resultId
        ? entitySystem.get(
            "award_result",
            resultId
          )
        : null;


    if (
      result &&
      result.winner
        ?.restaurantId !==
        restaurantId
    ) {
      result =
        null;
    }


    result =
      result ??
      this.getLatestWinningResult(
        restaurantId
      );


    const honor =
      result
        ? entitySystem
            .filter(
              "honor_record",
              item =>
                item.restaurantId ===
                  restaurantId &&
                item.awardResultId ===
                  result.id
            )[0] ??
          null
        : null;


    return {
      pageId:
        "award-ceremony",

      title:
        "颁奖典礼",

      restaurantId,

      resultId:
        result?.id ??
        null,

      hasAward:
        Boolean(
          result
        ),

      award:
        result
          ? {
              id:
                result.awardId,

              name:
                result.awardName,

              period:
                result.period,

              periodName:
                PERIOD_NAME[
                  result.period
                ] ??
                result.period,

              periodKey:
                result.periodKey,

              division:
                result.division,

              subjectType:
                result.subjectType,

              scope:
                result.scope,

              metric:
                result.metric,

              prestige:
                result.prestige,

              endDay:
                result.endDay
            }
          : null,

      winner:
        result?.winner ??
        null,

      finalists:
        result?.finalists ??
        [],

      reward:
        honor?.reward ?? {
          reputation:
            0,

          experience:
            0
        }
    };
  }
}


export const awardCeremonyPageSystem =
  new AwardCeremonyPageSystem();


export {
  AwardCeremonyPageSystem,
  PERIOD_NAME
};
