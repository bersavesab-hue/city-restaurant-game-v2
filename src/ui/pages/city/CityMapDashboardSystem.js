import {
  gameState
} from "../../../core/GameState.js";

import {
  districtSystem
} from "../../../systems/DistrictSystem.js";

import {
  restaurantSystem
} from "../../../systems/RestaurantSystem.js";

import {
  financeSystem
} from "../../../systems/FinanceSystem.js";

import {
  cityPropertyPageSystem
} from "./CityPropertyPageSystem.js";

import {
  buildGlobalTopBarModel,
  buildNoticeTickerModel
} from "../../components/GlobalChromeModel.js";


const FALLBACK_POSITIONS =
  Object.freeze([
    { x: 20, y: 26 },
    { x: 48, y: 18 },
    { x: 73, y: 28 },
    { x: 30, y: 50 },
    { x: 58, y: 47 },
    { x: 82, y: 54 },
    { x: 18, y: 74 },
    { x: 46, y: 78 },
    { x: 72, y: 76 },
    { x: 88, y: 80 }
  ]);


const HOME_MAP_DISTRICT_LAYOUT =
  Object.freeze([
    {
      id: "old_town",
      x: 35,
      y: 60
    },
    {
      id: "cbd",
      x: 52,
      y: 27
    },
    {
      id: "university",
      x: 78,
      y: 27
    },
    {
      id: "residential",
      x: 59,
      y: 56
    },
    {
      id: "tourist_scenic",
      x: 82,
      y: 69
    }
  ]);


function safeBalance(
  restaurantId
) {
  if (!restaurantId) {
    return 0;
  }

  try {
    return financeSystem
      .getBalance(
        restaurantId
      );
  } catch {
    return 0;
  }
}


function safeRestaurant(
  restaurantId
) {
  if (!restaurantId) {
    return null;
  }

  try {
    return restaurantSystem.get(
      restaurantId
    );
  } catch {
    return null;
  }
}


function normalizeMix(
  mix
) {
  if (
    !mix ||
    typeof mix !==
    "object"
  ) {
    return [];
  }

  const entries =
    Object.entries(
      mix
    );

  const total =
    entries.reduce(
      (
        sum,
        [
          ,
          value
        ]
      ) =>
        sum +
        (
          Number(value) ||
          0
        ),
      0
    );

  if (total <= 0) {
    return [];
  }

  return entries
    .map(
      (
        [
          id,
          value
        ]
      ) => ({
        id,

        value:
          Number(value) ||
          0,

        percent:
          Math.round(
            (
              Number(value) ||
              0
            ) /
            total *
            100
          )
      })
    )
    .sort(
      (
        a,
        b
      ) =>
        b.percent -
        a.percent
    );
}


class CityMapDashboardSystem {
  getDistrictPosition(
    district,
    index
  ) {
    const custom =
      district.mapPosition ??
      district.uiMapPosition ??
      null;

    if (
      custom &&
      Number.isFinite(
        custom.x
      ) &&
      Number.isFinite(
        custom.y
      )
    ) {
      return {
        x:
          Math.max(
            6,
            Math.min(
              94,
              custom.x
            )
          ),

        y:
          Math.max(
            8,
            Math.min(
              92,
              custom.y
            )
          ),

        source:
          "district"
      };
    }

    const fallback =
      FALLBACK_POSITIONS[
        index %
        FALLBACK_POSITIONS.length
      ];

    return {
      ...fallback,

      source:
        "layout-fallback"
    };
  }


  getDistricts(
    marketplace
  ) {
    const raw =
      districtSystem.getAll();

    return marketplace
      .districts
      .map(
        (
          district,
          index
        ) => {
          const source =
            raw.find(
              item =>
                item.id ===
                district.id
            ) ??
            district;

          const position =
            this.getDistrictPosition(
              source,
              index
            );

          const properties =
            marketplace.properties
              .filter(
                item =>
                  item.districtId ===
                  district.id
              );

          const averageRent =
            properties.length >
            0
              ? Math.round(
                  properties.reduce(
                    (
                      sum,
                      item
                    ) =>
                      sum +
                      (
                        item.monthlyRent ??
                        0
                      ),
                    0
                  ) /
                  properties.length
                )
              : 0;

          return {
            ...district,

            position,

            averageRent,

            customerMix:
              normalizeMix(
                district.customerMix
              ),

            recommendedPropertyId:
              properties[0]?.id ??
              null,

            recommendedPropertyName:
              properties[0]?.name ??
              null
          };
        }
      );
  }


  getHomeMapDistricts(
    districts
  ) {
    const byId =
      new Map(
        districts.map(
          item => [
            item.id,
            item
          ]
        )
      );

    return HOME_MAP_DISTRICT_LAYOUT
      .map(
        layout => {
          const district =
            byId.get(
              layout.id
            );

          if (!district) {
            return null;
          }

          return {
            ...district,

            position: {
              x:
                layout.x,

              y:
                layout.y,

              source:
                "city-home-layout"
            }
          };
        }
      )
      .filter(
        Boolean
      );
  }


  getRecommendedProperties(
    marketplace,
    limit = 6
  ) {
    return marketplace
      .properties
      .slice(
        0,
        limit
      )
      .map(
        property => ({
          id:
            property.id,

          name:
            property.name,

          districtId:
            property.districtId,

          districtName:
            property.districtName,

          area:
            property.area,

          usableArea:
            property.usableArea,

          monthlyRent:
            property.monthlyRent,

          qualityScore:
            property.qualityScore,

          trafficIndex:
            property.district
              ?.trafficIndex ??
            0,

          spendingPower:
            property.district
              ?.spendingPower ??
            0,

          competition:
            property.district
              ?.competition ??
            0,

          affordable:
            property.quote
              ?.affordable !==
            false,

          upfront:
            property.quote
              ?.upfront ??
            null,

          foodServiceAllowed:
            property
              .foodServiceAllowed !==
            false,

          exhaustAllowed:
            property
              .exhaustAllowed !==
            false,

          imageSlot:
            `property-${property.id}`
        })
      );
  }


  getCitySummary(
    districts,
    marketplace
  ) {
    const totalProperties =
      marketplace
        .properties
        .length;

    const averageTraffic =
      districts.length >
      0
        ? Math.round(
            districts.reduce(
              (
                sum,
                item
              ) =>
                sum +
                (
                  item.trafficIndex ??
                  0
                ),
              0
            ) /
            districts.length
          )
        : 0;

    const averageSpending =
      districts.length >
      0
        ? Math.round(
            districts.reduce(
              (
                sum,
                item
              ) =>
                sum +
                (
                  item.spendingPower ??
                  0
                ),
              0
            ) /
            districts.length
          )
        : 0;

    const averageCompetition =
      districts.length >
      0
        ? Math.round(
            districts.reduce(
              (
                sum,
                item
              ) =>
                sum +
                (
                  item.competition ??
                  0
                ),
              0
            ) /
            districts.length
          )
        : 0;

    return {
      districtCount:
        districts.length,

      propertyCount:
        totalProperties,

      averageTraffic,

      averageSpending,

      averageCompetition
    };
  }


  getPage({
    restaurantId = null,
    selectedDistrictId = null
  } = {}) {
    const marketplace =
      cityPropertyPageSystem
        .getMarketplace({
          restaurantId,

          districtId:
            null,

          availableOnly:
            true,

          generateListings:
            true
        });

    const districts =
      this.getDistricts(
        marketplace
      );

    const homeMapDistricts =
      this.getHomeMapDistricts(
        districts
      );

    const selectedDistrict =
      districts.find(
        item =>
          item.id ===
          selectedDistrictId
      ) ??
      homeMapDistricts[0] ??
      districts[0] ??
      null;

    const recommended =
      this.getRecommendedProperties(
        marketplace,
        6
      );

    const restaurant =
      safeRestaurant(
        restaurantId
      );

    const time =
      gameState.getSection(
        "time"
      );

    const runtime =
      gameState.getSection(
        "runtime"
      );

    const balance =
      safeBalance(
        restaurantId
      );

    const urgentProperties =
      marketplace
        .properties
        .filter(
          property =>
            Number.isInteger(
              property
                .competition
                ?.daysUntilPossibleClaim
            ) &&
            property
              .competition
              .daysUntilPossibleClaim <=
              3
        );

    const notices = [];

    if (
      urgentProperties.length >
      0
    ) {
      notices.push({
        id:
          "city_hot_property",

        type:
          "warning",

        title:
          "房源动态",

        message:
          `${urgentProperties.length}套热门铺位将在3天内面临抢租风险`,

        priority:
          100,

        action:
          "properties"
      });
    }

    notices.push({
      id:
        "city_market",

      type:
        "info",

      title:
        "城市市场",

      message:
        `当前开放${districts.length}个商圈，共${marketplace.properties.length}套可租房源`,

      priority:
        30,

      action:
        "properties"
    });

    const summary =
      this.getCitySummary(
        districts,
        marketplace
      );

    return {
      pageId:
        "city",

      topBar:
        buildGlobalTopBarModel({
          restaurantName:
            restaurant?.name ??
            "城市餐饮创业",

          balance,

          storeLevel:
            restaurant?.level ??
            1,

          reputation:
            restaurant?.reputation ??
            0,

          time,

          runtime,

          currentStoreId:
            restaurantId
        }),

      noticeTicker:
        buildNoticeTickerModel(
          notices
        ),

      map: {
        imageSlot:
          "city-main-map",

        selectedDistrictId:
          selectedDistrict?.id ??
          null,

        districts:
          homeMapDistricts,

        totalDistrictCount:
          districts.length
      },

      citySummary:
        summary,

      selectedDistrict,

      recommendedProperties:
        recommended,

      filters: {
        areaMin:
          30,

        areaMax:
          10000,

        rentMax:
          null,

        foodService:
          false,

        exhaust:
          false
      },

      imageSlots: [
        {
          id:
            "city-main-map",

          type:
            "city-map",

          static:
            true
        },

        ...recommended.map(
          property => ({
            id:
              property.imageSlot,

            type:
              "property",

            static:
              true,

            entityId:
              property.id
          })
        )
      ],

      navigation:
        marketplace
          .navigation
          .map(
            item => ({
              id:
                item.id,

              title:
                item.title,

              active:
                item.id ===
                "city"
            })
          )
    };
  }
}


export const cityMapDashboardSystem =
  new CityMapDashboardSystem();

export {
  CityMapDashboardSystem
};
