import {
  gameState
} from "../../../core/GameState.js";

import {
  financeSystem
} from "../../../systems/FinanceSystem.js";

import {
  restaurantSystem
} from "../../../systems/RestaurantSystem.js";

import {
  cityPropertyPageSystem
} from "./CityPropertyPageSystem.js";

import {
  buildGlobalTopBarModel,
  buildNoticeTickerModel
} from "../../components/GlobalChromeModel.js";


function safeBalance(
  restaurantId
) {
  if (!restaurantId) {
    return null;
  }

  try {
    return financeSystem.getBalance(
      restaurantId
    );
  } catch {
    return null;
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


function textOf(
  item
) {
  if (
    !item ||
    typeof item !==
    "object"
  ) {
    return "";
  }

  return [
    item.type,
    item.kind,
    item.name,
    item.label,
    item.category,
    item.subtype
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}


function countMatch(
  list,
  patterns
) {
  return list.filter(
    item => {
      const text =
        textOf(item);

      return patterns.some(
        pattern =>
          text.includes(
            pattern
          )
      );
    }
  ).length;
}


function clamp(
  value,
  min = 0,
  max = 100
) {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
}


class PropertyDetailDashboardSystem {
  getStructureSummary(
    layout
  ) {
    const floors =
      layout?.floors ??
      [];

    const entrances =
      floors.flatMap(
        floor =>
          floor.entrances ??
          []
      );

    const windows =
      floors.flatMap(
        floor =>
          floor.windows ??
          []
      );

    const columns =
      floors.flatMap(
        floor =>
          floor.columns ??
          []
      );

    const fixedStructures =
      floors.flatMap(
        floor =>
          floor.fixedStructures ??
          []
      );

    const utilityPoints =
      floors.flatMap(
        floor =>
          floor.utilityPoints ??
          []
      );


    return {
      floorCount:
        floors.length,

      entrances:
        entrances.length,

      windows:
        windows.length,

      columns:
        columns.length,

      fixedStructures:
        fixedStructures.length,

      utilityPoints:
        utilityPoints.length,

      waterPoints:
        countMatch(
          utilityPoints,
          [
            "water",
            "给水",
            "排水",
            "水点"
          ]
        ),

      powerPoints:
        countMatch(
          utilityPoints,
          [
            "power",
            "electric",
            "electricity",
            "电力",
            "电源",
            "强电"
          ]
        ),

      gasPoints:
        countMatch(
          utilityPoints,
          [
            "gas",
            "燃气",
            "煤气"
          ]
        ),

      exhaustPoints:
        countMatch(
          utilityPoints,
          [
            "exhaust",
            "烟道",
            "排烟"
          ]
        ),

      restroomCount:
        countMatch(
          [
            ...fixedStructures,
            ...utilityPoints
          ],
          [
            "restroom",
            "toilet",
            "wc",
            "bathroom",
            "卫生间",
            "厕所"
          ]
        ),

      stairs:
        countMatch(
          fixedStructures,
          [
            "stair",
            "stairs",
            "楼梯"
          ]
        ),

      elevators:
        countMatch(
          fixedStructures,
          [
            "elevator",
            "lift",
            "电梯"
          ]
        )
    };
  }


  getAssessment(
    detail
  ) {
    const property =
      detail.property;

    const district =
      detail.district;

    const traffic =
      district?.trafficIndex ??
      50;

    const spending =
      district?.spendingPower ??
      50;

    const competition =
      district?.competition ??
      50;

    const frontageBonus =
      Math.min(
        8,
        (
          property.frontageMeters ??
          0
        ) *
        0.7
      );

    const parkingBonus =
      Math.min(
        5,
        (
          property.parkingSpaces ??
          0
        ) *
        0.7
      );

    const licenseBonus =
      property.foodServiceAllowed
        ? 8
        : 0;

    const exhaustBonus =
      property.exhaustAllowed
        ? 7
        : 0;

    const score =
      clamp(
        Math.round(
          traffic *
            0.26 +
          spending *
            0.22 +
          (
            100 -
            competition
          ) *
            0.18 +
          frontageBonus +
          parkingBonus +
          licenseBonus +
          exhaustBonus +
          8
        )
      );

    const usableArea =
      property.usableArea ??
      property.area ??
      1;

    const rentPerSqm =
      usableArea > 0
        ? Number(
            (
              property.monthlyRent /
              usableArea
            ).toFixed(1)
          )
        : null;

    let level =
      "一般";

    if (
      score >= 82
    ) {
      level =
        "优秀";
    } else if (
      score >= 70
    ) {
      level =
        "良好";
    } else if (
      score >= 58
    ) {
      level =
        "可经营";
    }

    return {
      score,

      level,

      traffic,

      spending,

      competition,

      rentPerSqm
    };
  }


  getRisks(
    detail
  ) {
    const property =
      detail.property;

    const district =
      detail.district;

    const risks = [];


    if (
      property
        .foodServiceAllowed ===
      false
    ) {
      risks.push({
        id:
          "food_service",

        level:
          "danger",

        title:
          "餐饮许可受限",

        description:
          "当前房源不允许直接开展餐饮经营。"
      });
    }


    if (
      property
        .exhaustAllowed ===
      false
    ) {
      risks.push({
        id:
          "exhaust",

        level:
          "danger",

        title:
          "排烟条件不足",

        description:
          "热厨、炒制等品类会受到明显限制。"
      });
    }


    if (
      (
        district
          ?.competition ??
        0
      ) >=
      75
    ) {
      risks.push({
        id:
          "competition",

        level:
          "warning",

        title:
          "商圈竞争较高",

        description:
          `当前竞争指数${district.competition}/100。`
      });
    }


    if (
      Number.isInteger(
        property
          .competition
          ?.daysUntilPossibleClaim
      ) &&
      property
        .competition
        .daysUntilPossibleClaim <=
        3
    ) {
      risks.push({
        id:
          "claim",

        level:
          "danger",

        title:
          "存在抢租风险",

        description:
          `预计${property.competition.daysUntilPossibleClaim}天内可能被其他经营者签走。`
      });
    }


    if (
      property.quote
        ?.affordable ===
      false
    ) {
      risks.push({
        id:
          "funds",

        level:
          "danger",

        title:
          "签约资金不足",

        description:
          "当前现金无法覆盖签约首付。"
      });
    }


    if (
      Number.isFinite(
        property.frontageMeters
      ) &&
      property.frontageMeters <
        4
    ) {
      risks.push({
        id:
          "frontage",

        level:
          "warning",

        title:
          "门面宽度偏小",

        description:
          `当前门面约${property.frontageMeters}米。`
      });
    }


    if (
      Number.isInteger(
        property
          .listing
          ?.remainingDays
      ) &&
      property
        .listing
        .remainingDays <=
        3
    ) {
      risks.push({
        id:
          "expiry",

        level:
          "warning",

        title:
          "房源即将下架",

        description:
          `挂牌剩余${property.listing.remainingDays}天。`
      });
    }


    if (
      risks.length ===
      0
    ) {
      risks.push({
        id:
          "normal",

        level:
          "success",

        title:
          "暂未发现明显硬伤",

        description:
          "仍需结合品类、装修成本和供应链判断。"
      });
    }

    return risks;
  }


  getFacilities(
    detail,
    structures
  ) {
    const property =
      detail.property;

    const rules =
      detail.suitability
        .renovationRules ??
      {};

    return [
      {
        id:
          "food",

        label:
          "餐饮许可",

        value:
          property
            .foodServiceAllowed
            ? "允许"
            : "受限",

        state:
          property
            .foodServiceAllowed
            ? "good"
            : "bad"
      },

      {
        id:
          "exhaust",

        label:
          "排烟许可",

        value:
          property
            .exhaustAllowed
            ? "允许"
            : "受限",

        state:
          property
            .exhaustAllowed
            ? "good"
            : "bad"
      },

      {
        id:
          "water",

        label:
          "水点",

        value:
          `${structures.waterPoints}个`,

        state:
          structures.waterPoints >
          0
            ? "good"
            : "neutral"
      },

      {
        id:
          "power",

        label:
          "电力点位",

        value:
          `${structures.powerPoints}个`,

        state:
          structures.powerPoints >
          0
            ? "good"
            : "neutral"
      },

      {
        id:
          "gas",

        label:
          "燃气点位",

        value:
          structures.gasPoints >
          0
            ? `${structures.gasPoints}个`
            : "未记录",

        state:
          structures.gasPoints >
          0
            ? "good"
            : "neutral"
      },

      {
        id:
          "restroom",

        label:
          "卫生间",

        value:
          structures.restroomCount >
          0
            ? `${structures.restroomCount}处`
            : "未记录",

        state:
          structures.restroomCount >
          0
            ? "good"
            : "neutral"
      },

      {
        id:
          "partition",

        label:
          "隔断改造",

        value:
          rules.allowPartitions ===
          false
            ? "不允许"
            : "允许",

        state:
          rules.allowPartitions ===
          false
            ? "warning"
            : "good"
      },

      {
        id:
          "open_flame",

        label:
          "明火条件",

        value:
          rules.allowOpenFlame ===
          true
            ? "允许"
            : rules.allowOpenFlame ===
              false
              ? "禁止"
              : "未记录",

        state:
          rules.allowOpenFlame ===
          true
            ? "good"
            : rules.allowOpenFlame ===
              false
              ? "bad"
              : "neutral"
      }
    ];
  }


  getPage(
    propertyId,
    restaurantId = null,
    months = 12,
    offerId = null
  ) {
    const detail =
      cityPropertyPageSystem
        .getPropertyDetail(
          propertyId,
          restaurantId,
          months,
          offerId
        );

    const restaurant =
      safeRestaurant(
        restaurantId
      );

    const balance =
      safeBalance(
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

    const structures =
      this.getStructureSummary(
        detail.layout
      );

    const assessment =
      this.getAssessment(
        detail
      );

    const risks =
      this.getRisks(
        detail
      );

    const facilities =
      this.getFacilities(
        detail,
        structures
      );


    return {
      pageId:
        "property_detail",

      restaurant: restaurant
        ? {
            id:
              restaurant.id,

            name:
              restaurant.name,

            level:
              restaurant.level,

            reputation:
              restaurant.reputation
          }
        : null,

      topBar:
        buildGlobalTopBarModel({
          restaurantName:
            restaurant?.name ??
            "城市餐饮创业",

          balance:
            balance ??
            0,

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
          risks
            .filter(
              risk =>
                risk.level ===
                  "danger" ||
                risk.level ===
                  "warning"
            )
            .slice(
              0,
              4
            )
            .map(
              risk => ({
                id:
                  `property_${risk.id}`,

                type:
                  risk.level,

                title:
                  risk.title,

                message:
                  risk.description,

                priority:
                  risk.level ===
                    "danger"
                    ? 110
                    : 80
              })
            )
        ),

      property:
        detail.property,

      district:
        detail.district,

      landlord:
        detail.landlord,

      leaseTerms:
        detail.leaseTerms,

      quote:
        detail.quote,

      activeOffer:
        detail.activeOffer,

      leaseState:
        detail.leaseState,

      layout:
        detail.layout,

      structures,

      facilities,

      assessment,

      risks,

      media: {
        defaultTab:
          "exterior",

        tabs: [
          {
            id:
              "exterior",

            label:
              "门头实拍",

            slot:
              `property-exterior-${propertyId}`
          },

          {
            id:
              "street",

            label:
              "街景",

            slot:
              `property-street-${propertyId}`
          },

          {
            id:
              "surroundings",

            label:
              "周边环境",

            slot:
              `property-surroundings-${propertyId}`
          },

          {
            id:
              "floorplan",

            label:
              "户型平面",

            slot:
              `property-floorplan-${propertyId}`
          }
        ]
      },

      floorTabs:
        (
          detail.layout
            ?.floors ??
          []
        ).map(
          floor => ({
            id:
              floor.id,

            label:
              floor.label,

            area:
              floor.area,

            usableArea:
              floor.usableArea,

            imageSlot:
              `property-floorplan-overlay-${floor.id}`
          })
        ),

      imageSlots: [
        `property-exterior-${propertyId}`,
        `property-street-${propertyId}`,
        `property-surroundings-${propertyId}`,
        `property-floorplan-${propertyId}`,

        ...(
          detail.layout
            ?.floors ??
          []
        ).map(
          floor =>
            `property-floorplan-overlay-${floor.id}`
        )
      ],

      nextPage:
        detail.nextAfterLease
    };
  }


  negotiate({
    restaurantId,
    propertyId,
    months,
    requestedRent,
    requestedRentFreeDays
  }) {
    return cityPropertyPageSystem
      .negotiateLease({
        restaurantId,
        propertyId,
        months,
        requestedRent,
        requestedRentFreeDays
      });
  }


  acceptCounter(
    offerId
  ) {
    return cityPropertyPageSystem
      .acceptCounter(
        offerId
      );
  }


  signLease({
    restaurantId,
    propertyId,
    months,
    offerId = null
  }) {
    return cityPropertyPageSystem
      .signLease({
        restaurantId,
        propertyId,
        months,
        offerId
      });
  }
}


export const propertyDetailDashboardSystem =
  new PropertyDetailDashboardSystem();

export {
  PropertyDetailDashboardSystem
};
