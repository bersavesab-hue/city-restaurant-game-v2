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
  propertySystem
} from "../../../systems/PropertySystem.js";

import {
  cityPropertyPageSystem
} from "./CityPropertyPageSystem.js";

import {
  buildGlobalTopBarModel,
  buildNoticeTickerModel
} from "../../components/GlobalChromeModel.js";


const FALLBACK_POSITIONS =
  Object.freeze([
    { x: 48, y: 19 },
    { x: 33, y: 43 },
    { x: 74, y: 44 },
    { x: 22, y: 72 },
    { x: 72, y: 72 },
    { x: 88, y: 18 },
    { x: 10, y: 25 },
    { x: 50, y: 84 },
    { x: 87, y: 86 },
    { x: 9, y: 88 }
  ]);


const HOME_MAP_DISTRICT_LAYOUT =
  Object.freeze([
    {
      id: "university",
      x: 48,
      y: 18
    },
    {
      id: "cbd",
      x: 34,
      y: 43
    },
    {
      id: "tourist_scenic",
      x: 74,
      y: 43
    },
    {
      id: "old_town",
      x: 22,
      y: 72
    },
    {
      id: "residential",
      x: 72,
      y: 72
    }
  ]);


const CITY_MAP_AREAS =
  Object.freeze([
    {
      id: "core",
      name: "核心城区",
      test:
        position =>
          position.x < 55 &&
          position.y < 55
    },
    {
      id: "innovation",
      name: "新城科教区",
      test:
        position =>
          position.x >= 55 &&
          position.y < 55
    },
    {
      id: "culture",
      name: "生活文旅区",
      test:
        position =>
          position.x < 55 &&
          position.y >= 55
    },
    {
      id: "waterfront",
      name: "滨水休闲区",
      test:
        position =>
          position.x >= 55 &&
          position.y >= 55
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
  getAreaId(
    position
  ) {
    return (
      CITY_MAP_AREAS.find(
        area =>
          area.test(
            position
          )
      )?.id ??
      CITY_MAP_AREAS[0].id
    );
  }


  getAreas(
    districts
  ) {
    return CITY_MAP_AREAS.map(
      area => {
        const items =
          districts.filter(
            district =>
              district.areaId ===
              area.id
          );

        return {
          id:
            area.id,

          name:
            area.name,

          districtCount:
            items.length,

          unlockedCount:
            items.filter(
              item =>
                !item.locked
            ).length,

          lockedCount:
            items.filter(
              item =>
                item.locked
            ).length,

          openStoreCount:
            items.reduce(
              (
                sum,
                item
              ) =>
                sum +
                (
                  item.openStoreCount ??
                  0
                ),
              0
            ),

          highPotentialCount:
            items.filter(
              item =>
                item.highPotential
            ).length
        };
      }
    );
  }


  getDistrictPosition(
    district,
    index
  ) {
    const fixed =
      HOME_MAP_DISTRICT_LAYOUT
        .find(
          item =>
            item.id ===
            district.id
        );

    if (fixed) {
      return {
        x:
          fixed.x,

        y:
          fixed.y,

        source:
          "city-home-layout"
      };
    }

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

    const cycle =
      Math.floor(
        index /
        FALLBACK_POSITIONS.length
      );

    return {
      x:
        Math.max(
          7,
          Math.min(
            93,
            fallback.x +
            (
              cycle % 2 === 0
                ? cycle * 2
                : -cycle * 2
            )
          )
        ),

      y:
        Math.max(
          9,
          Math.min(
            91,
            fallback.y +
            (
              cycle % 3 -
              1
            ) *
            5
          )
        ),

      source:
        "layout-fallback"
    };
  }


  getStoreDistrictCounts() {
    const counts =
      new Map();

    for (
      const restaurant
      of restaurantSystem.list()
    ) {
      if (
        !restaurant.locationId
      ) {
        continue;
      }

      try {
        const property =
          propertySystem.get(
            restaurant.locationId
          );

        counts.set(
          property.districtId,
          (
            counts.get(
              property.districtId
            ) ??
            0
          ) +
          1
        );
      } catch {
        // A removed property must not break the city overview.
      }
    }

    return counts;
  }


  getDistricts(
    marketplace
  ) {
    const raw =
      districtSystem.getAll();

    const storeCounts =
      this.getStoreDistrictCounts();

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

          const opportunityScore =
            districtSystem
              .getOpportunityScore(
                source
              );

          const openStoreCount =
            storeCounts.get(
              district.id
            ) ??
            0;

          const locked =
            source.unlocked ===
              false ||
            source.locked ===
              true ||
            source.isLocked ===
              true;

          const position =
            this.getDistrictPosition(
              source,
              index
            );

          return {
            ...district,

            position,

            areaId:
              this.getAreaId(
                position
              ),

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
              null,

            openStoreCount,

            hasOpenStore:
              openStoreCount >
              0,

            opportunityScore,

            highPotential:
              opportunityScore >=
              70,

            locked,

            deliveryDemand:
              source.deliveryDemand ??
              district.deliveryDemand ??
              50
          };
        }
      );
  }


  getRecommendedProperties(
    marketplace,
    limit = 9
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

          propertyStatus:
            "available"
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


  getFilterCounts(
    districts
  ) {
    return {
      all:
        districts.length,

      opened:
        districts.filter(
          item =>
            item.hasOpenStore
        ).length,

      available:
        districts.filter(
          item =>
            !item.locked &&
            item.propertyCount >
            0
        ).length,

      potential:
        districts.filter(
          item =>
            !item.locked &&
            item.highPotential
        ).length,

      locked:
        districts.filter(
          item =>
            item.locked
        ).length
    };
  }


  getOpportunities(
    properties,
    selectedDistrictId
  ) {
    return [
      ...properties
    ]
      .sort(
        (
          a,
          b
        ) => {
          const selectedA =
            a.districtId ===
            selectedDistrictId
              ? 1
              : 0;

          const selectedB =
            b.districtId ===
            selectedDistrictId
              ? 1
              : 0;

          if (
            selectedA !==
            selectedB
          ) {
            return (
              selectedB -
              selectedA
            );
          }

          return (
            (
              b.qualityScore ??
              0
            ) -
            (
              a.qualityScore ??
              0
            )
          );
        }
      )
      .slice(
        0,
        6
      )
      .map(
        item => ({
          ...item,

          tag:
            (
              item.qualityScore ??
              0
            ) >=
            80
              ? "高潜力"
              : item.affordable
                ? "可选址"
                : "关注",

          description:
            item.districtName +
            " · " +
            item.area +
            "㎡ · " +
            Math.round(
              item.monthlyRent ??
              0
            ).toLocaleString(
              "zh-CN"
            ) +
            "元/月"
        })
      );
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

    const areas =
      this.getAreas(
        districts
      );

    const districtAreaCounts =
      new Map(
        areas.map(
          area => [
            area.id,
            area.districtCount
          ]
        )
      );

    for (
      const district
      of districts
    ) {
      district.areaDistrictCount =
        districtAreaCounts.get(
          district.areaId
        ) ??
        0;
    }

    const selectedDistrict =
      districts.find(
        item =>
          item.id ===
          selectedDistrictId &&
          !item.locked
      ) ??
      districts.find(
        item =>
          !item.locked
      ) ??
      districts[0] ??
      null;

    const recommended =
      this.getRecommendedProperties(
        marketplace,
        9
      );

    const allRestaurants =
      restaurantSystem.list();

    const restaurant =
      safeRestaurant(
        restaurantId
      ) ??
      allRestaurants[0] ??
      null;

    const time =
      gameState.getSection(
        "time"
      );

    const runtime =
      gameState.getSection(
        "runtime"
      );

    const groupBalance =
      allRestaurants.length >
      0
        ? allRestaurants.reduce(
            (
              sum,
              item
            ) =>
              sum +
              safeBalance(
                item.id
              ),
            0
          )
        : safeBalance(
            restaurantId
          );

    const notices =
      [];

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
          urgentProperties.length +
          "套热门铺位将在3天内面临抢租风险",

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
        "当前开放" +
        districts.length +
        "个商圈，共" +
        marketplace.properties.length +
        "套可租房源",

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

    const baseTopBar =
      buildGlobalTopBarModel({
        restaurantName:
          restaurant?.name ??
          "城市餐饮创业",

        brandName:
          "集团视角",

        balance:
          groupBalance,

        storeLevel:
          Math.max(
            1,
            ...allRestaurants.map(
              item =>
                item.level ??
                1
            )
          ),

        reputation:
          restaurant?.reputation ??
          0,

        time,

        runtime,

        currentStoreId:
          restaurant?.id ??
          null,

        stores:
          allRestaurants
            .map(
              item => ({
                id:
                  item.id,

                name:
                  item.name
              })
            )
      });

    const averageRating =
      allRestaurants.length >
      0
        ? allRestaurants.reduce(
            (
              sum,
              item
            ) =>
              sum +
              (
                Number(
                  item.reviewScore
                ) ||
                0
              ),
            0
          ) /
          allRestaurants.length
        : (
            Number(
              restaurant?.reviewScore
            ) ||
            0
          );

    return {
      pageId:
        "city",

      topBar: {
        ...baseTopBar,

        brandName:
          "集团视角",

        rating:
          averageRating,

        scope: {
          ...baseTopBar.scope,

          type:
            "group",

          canSwitch:
            allRestaurants.length >
            0,

          stores:
            allRestaurants
              .map(
                item => ({
                  id:
                    item.id,

                  name:
                    item.name
                })
              )
        }
      },

      noticeTicker:
        buildNoticeTickerModel(
          notices
        ),

      map: {
        selectedDistrictId:
          selectedDistrict?.id ??
          null,

        districts,

        areas,

        totalDistrictCount:
          districts.length,

        totalAreaCount:
          areas.length
      },

      citySummary:
        summary,

      filterCounts:
        this.getFilterCounts(
          districts
        ),

      selectedDistrict,

      recommendedProperties:
        recommended,

      opportunities:
        this.getOpportunities(
          recommended,
          selectedDistrict?.id ??
          null
        ),

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
