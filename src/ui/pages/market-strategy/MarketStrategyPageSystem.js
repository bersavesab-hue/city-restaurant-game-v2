import {
  restaurantSystem
} from "../../../systems/RestaurantSystem.js";

import {
  financeSystem
} from "../../../systems/FinanceSystem.js";

import {
  restaurantPositioningSystem
} from "../../../systems/RestaurantPositioningSystem.js";

import {
  marketActionSystem
} from "../../../systems/MarketActionSystem.js";

import {
  marketInsightSystem
} from "../../../systems/MarketInsightSystem.js";

import {
  marketCompetitionSystem
} from "../../../systems/MarketCompetitionSystem.js";

import {
  districtEventSystem
} from "../../../systems/DistrictEventSystem.js";

import {
  trafficDemandSystem
} from "../../../systems/TrafficDemandSystem.js";


function round1(
  value
) {
  return Math.round(
    value * 10
  ) / 10;
}


class MarketStrategyPageSystem {
  constructor({
    restaurant =
      restaurantSystem,

    finance =
      financeSystem,

    positioning =
      restaurantPositioningSystem,

    actions =
      marketActionSystem,

    insight =
      marketInsightSystem,

    competition =
      marketCompetitionSystem,

    districtEvents =
      districtEventSystem,

    traffic =
      trafficDemandSystem
  } = {}) {
    this.restaurant =
      restaurant;

    this.finance =
      finance;

    this.positioning =
      positioning;

    this.actions =
      actions;

    this.insight =
      insight;

    this.competition =
      competition;

    this.districtEvents =
      districtEvents;

    this.traffic =
      traffic;
  }


  getDistrict(
    restaurantId
  ) {
    try {
      return this.traffic
        .getDistrictForRestaurant(
          restaurantId
        );
    } catch {
      return null;
    }
  }


  getPositioningOptions(
    restaurantId
  ) {
    return this.positioning
      .getAvailable()
      .map(
        definition => {
          const categoryFit =
            this.positioning
              .getCategoryFit(
                restaurantId,
                definition
              );

          const priceFit =
            this.positioning
              .getPriceFit(
                restaurantId,
                definition
              );

          const districtFit =
            this.positioning
              .getDistrictFit(
                restaurantId,
                definition
              );

          const fitScore =
            Math.round(
              Math.max(
                60,
                Math.min(
                  125,
                  (
                    categoryFit *
                      0.35 +
                    priceFit *
                      0.2 +
                    districtFit *
                      0.45
                  ) *
                    100
                )
              )
            );


          return {
            id:
              definition.id,

            name:
              definition.name,

            targetSegments:
              structuredClone(
                definition
                  .targetSegments
              ),

            priceRange:
              [
                ...definition
                  .priceRange
              ],

            categoryFit:
              round1(
                categoryFit
              ),

            priceFit:
              round1(
                priceFit
              ),

            districtFit:
              round1(
                districtFit
              ),

            fitScore
          };
        }
      )
      .sort(
        (a, b) =>
          b.fitScore -
          a.fitScore
      );
  }


  getCompetition(
    district
  ) {
    if (!district) {
      return {
        competitorCount:
          0,

        competitors:
          []
      };
    }


    const snapshot =
      this.competition
        .getDistrictSnapshot(
          district.id
        );


    if (!snapshot) {
      return {
        competitorCount:
          0,

        competitors:
          []
      };
    }


    return {
      competitorCount:
        snapshot
          .competitorCount ??
        0,

      competitors:
        (
          snapshot.competitors ??
          []
        )
          .map(
            item => ({
              id:
                item.id,

              name:
                item.name,

              priceIndex:
                item.priceIndex ??
                1,

              qualityScore:
                item.qualityScore ??
                0,

              serviceScore:
                item.serviceScore ??
                0,

              reputation:
                item.reputation ??
                0,

              strategy:
                item.strategy ??
                null,

              healthScore:
                item.healthScore ??
                null,

              ageDays:
                item.ageDays ??
                0,

              active:
                item.active !==
                false
            })
          )
          .sort(
            (a, b) =>
              b.reputation -
              a.reputation
          )
    };
  }


  getEvents(
    district
  ) {
    if (!district) {
      return {
        active: [],
        recent: []
      };
    }


    const status =
      this.districtEvents
        .getDistrictStatus(
          district.id
        );


    const normalize =
      item => {
        let definition =
          null;


        try {
          definition =
            this.districtEvents
              .getDefinition(
                item.type
              );
        } catch {
          definition =
            null;
        }


        return {
          ...item,

          name:
            definition
              ?.name ??
            item.type
        };
      };


    return {
      active:
        (
          status.active ??
          []
        ).map(
          normalize
        ),

      recent:
        (
          status.recent ??
          []
        ).map(
          normalize
        )
    };
  }


  getPage(
    restaurantId
  ) {
    const restaurant =
      this.restaurant.get(
        restaurantId
      );

    const balance =
      this.finance.getBalance(
        restaurantId
      );

    const district =
      this.getDistrict(
        restaurantId
      );

    const positioning =
      this.positioning
        .getAnalysis(
          restaurantId
        );

    const actions =
      this.actions
        .getStatus(
          restaurantId
        );

    const activeTypes =
      new Set(
        actions.active.map(
          item =>
            item.type
        )
      );

    const availableActions =
      actions.available.map(
        item => {
          const availability =
            item.availability ?? {
              canStart: false,
              reasons: [
                "unknown"
              ],
              missingChannels: [],
              availableDay: null
            };

          return {
            ...structuredClone(
              item
            ),

            active:
              activeTypes.has(
                item.id
              ),

            canStart:
              !activeTypes.has(
                item.id
              ) &&
              availability.canStart,

            lockedReasons:
              [
                ...(
                  availability
                    .reasons ??
                  []
                )
              ],

            missingChannels:
              [
                ...(
                  availability
                    .missingChannels ??
                  []
                )
              ],

            availableDay:
              availability
                .availableDay ??
              null
          };
        }
      );


    return {
      pageId:
        "market-strategy",

      title:
        "市场与竞争",

      restaurantId,

      restaurant: {
        id:
          restaurant.id,

        name:
          restaurant.name,

        reputation:
          restaurant.reputation ??
          0,

        balance
      },

      district:
        district
          ? {
              id:
                district.id,

              name:
                district.name,

              competition:
                district.competition,

              traffic:
                district.traffic,

              spendingPower:
                district.spendingPower
            }
          : null,

      insight:
        this.insight
          .getSummary(
            restaurantId
          ),

      positioning,

      positioningOptions:
        this.getPositioningOptions(
          restaurantId
        ),

      actions: {
        active:
          actions.active,

        modifiers:
          actions.modifiers,

        available:
          availableActions
      },

      competition:
        this.getCompetition(
          district
        ),

      events:
        this.getEvents(
          district
        )
    };
  }


  setPositioning(
    restaurantId,
    positioningId
  ) {
    return this.positioning
      .setPositioning(
        restaurantId,
        positioningId
      );
  }


  clearPositioning(
    restaurantId
  ) {
    return this.positioning
      .clearPositioning(
        restaurantId
      );
  }


  startMarketAction(
    restaurantId,
    actionId
  ) {
    return this.actions
      .startAction(
        restaurantId,
        actionId
      );
  }
}


export const marketStrategyPageSystem =
  new MarketStrategyPageSystem();


export {
  MarketStrategyPageSystem
};
