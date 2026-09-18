import { restaurantSystem } from "./RestaurantSystem.js";
import { propertySystem } from "./PropertySystem.js";
import { districtSystem } from "./DistrictSystem.js";
import { customerSegmentSystem } from "./CustomerSegmentSystem.js";
import { customerLoyaltySystem } from "./CustomerLoyaltySystem.js";
import { menuSystem } from "./MenuSystem.js";
import { dishCatalogSystem } from "./DishCatalogSystem.js";
import { marketCompetitionSystem } from "./MarketCompetitionSystem.js";
import { marketActionSystem } from "./MarketActionSystem.js";
import { districtEventSystem } from "./DistrictEventSystem.js";
import { businessCalendarSystem } from "./BusinessCalendarSystem.js";
import { restaurantPositioningSystem } from "./RestaurantPositioningSystem.js";
import { dishGrowthSystem } from "./DishGrowthSystem.js";
import { renovationSystem } from "./RenovationSystem.js";
import { wordOfMouthSystem } from "./WordOfMouthSystem.js";
import { businessCausalitySystem } from "./BusinessCausalitySystem.js";
import { salesChannelSystem } from "./SalesChannelSystem.js";
import { venueTypeSystem } from "./VenueTypeSystem.js";

function clamp(value, min, max) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

class TrafficDemandSystem {
  getVenueContext(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    if (!restaurant.locationId) {
      const venueTypeId =
        "street_shop";

      return {
        property: null,
        venueTypeId,
        venueType:
          venueTypeSystem.get(
            venueTypeId
          )
      };
    }

    try {
      const property =
        propertySystem.get(
          restaurant.locationId
        );

      const venueTypeId =
        property.venueTypeId ??
        "street_shop";

      return {
        property,
        venueTypeId,
        venueType:
          venueTypeSystem.get(
            venueTypeId
          )
      };
    } catch {
      return {
        property: null,
        venueTypeId:
          "street_shop",
        venueType:
          venueTypeSystem.get(
            "street_shop"
          )
      };
    }
  }

  getVenueChannelFactor(
    restaurantId,
    segment,
    venueTypeId
  ) {
    const active =
      salesChannelSystem
        .getActiveChannels(
          restaurantId
        );

    let weighted = 0;
    let total = 0;

    for (
      const channel
      of active
    ) {
      const preference =
        Math.max(
          0,
          Number(
            segment
              .channelPreferences?.[
                channel.id
              ] ??
            0
          )
        );

      if (
        preference <= 0
      ) {
        continue;
      }

      total +=
        preference;

      weighted +=
        preference *
        venueTypeSystem
          .getChannelCapability(
            venueTypeId,
            channel.id
          );
    }

    if (
      total <= 0
    ) {
      return 1;
    }

    return clamp(
      weighted /
      total,
      0.55,
      1.35
    );
  }

  getDistrictForRestaurant(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    if (!restaurant.locationId) {
      return null;
    }

    try {
      const property =
        propertySystem.get(
          restaurant.locationId
        );

      return districtSystem.get(
        property.districtId
      );
    } catch {
      return null;
    }
  }

  getFallbackDistrict() {
    return {
      id: "fallback",
      trafficIndex: 50,
      spendingPower: 50,
      competition: 20,
      customerMix: null
    };
  }

  getCustomerMix(
    district
  ) {
    const segments =
      customerSegmentSystem
        .getAll();

    if (
      segments.length === 0
    ) {
      return [];
    }

    const weights =
      new Map();

    const source =
      district?.customerMix;

    if (source) {
      for (
        const [
          id,
          weight
        ]
        of Object.entries(
          source
        )
      ) {
        if (
          customerSegmentSystem
            .exists(
              id
            ) &&
          Number.isFinite(
            weight
          ) &&
          weight > 0
        ) {
          weights.set(
            id,
            weight
          );
        }
      }
    }

    const zoneType =
      district
        ?.customerProfileType ??
      district?.zoneType ??
      district?.id ??
      null;

    for (
      const segment
      of segments
    ) {
      if (
        weights.has(
          segment.id
        )
      ) {
        continue;
      }

      const affinity =
        zoneType
          ? customerSegmentSystem
              .getDistrictAffinity(
                segment.id,
                zoneType
              )
          : 0.7;

      if (
        affinity <= 0.85
      ) {
        continue;
      }

      const presence =
        Math.max(
          0,
          Number(
            segment.basePresence ??
            1
          )
        );

      const supplementalWeight =
        Math.min(
          4.5,
          presence *
          Math.max(
            0,
            affinity -
            0.85
          ) *
          1.4
        );

      if (
        supplementalWeight >
        0
      ) {
        weights.set(
          segment.id,
          supplementalWeight
        );
      }
    }

    if (
      weights.size === 0
    ) {
      const share =
        1 /
        segments.length;

      return segments.map(
        segment => ({
          segmentId:
            segment.id,
          share
        })
      );
    }

    const total =
      [
        ...weights.values()
      ].reduce(
        (
          sum,
          weight
        ) =>
          sum +
          weight,
        0
      );

    return [
      ...weights.entries()
    ].map(
      (
        [
          segmentId,
          weight
        ]
      ) => ({
        segmentId,
        share:
          weight /
          total
      })
    );
  }

  getMarketingChannelFactor(
    restaurantId,
    segment,
    channelMultipliers = {}
  ) {
    const active =
      salesChannelSystem
        .getActiveChannels(
          restaurantId
        );

    if (
      active.length === 0
    ) {
      return 1;
    }

    const preferences =
      segment
        .channelPreferences ??
      {};

    let weighted = 0;
    let total = 0;

    for (
      const channel
      of active
    ) {
      const preference =
        Math.max(
          0,
          Number(
            preferences[
              channel.id
            ] ??
            0
          )
        );

      if (
        preference <= 0
      ) {
        continue;
      }

      total +=
        preference;

      weighted +=
        preference *
        (
          channelMultipliers[
            channel.id
          ] ??
          1
        );
    }

    if (
      total <= 0
    ) {
      const values =
        active.map(
          channel =>
            channelMultipliers[
              channel.id
            ] ??
            1
        );

      return (
        values.reduce(
          (sum, value) =>
            sum +
            value,
          0
        ) /
        Math.max(
          1,
          values.length
        )
      );
    }

    return clamp(
      weighted /
      total,
      0.6,
      1.8
    );
  }


  getChannelAccessFactor(
    restaurantId,
    segment
  ) {
    const active =
      salesChannelSystem
        .getActiveChannels(
          restaurantId
        );

    if (
      active.length === 0
    ) {
      return 0.75;
    }

    const preferences =
      segment
        .channelPreferences ??
      {
        dine_in: 1
      };

    const totalPreference =
      Object.values(
        preferences
      ).reduce(
        (
          sum,
          value
        ) =>
          sum +
          Math.max(
            0,
            Number(
              value
            ) ||
            0
          ),
        0
      );

    if (
      totalPreference <= 0
    ) {
      return 1;
    }

    const activePreference =
      active.reduce(
        (
          sum,
          channel
        ) =>
          sum +
          Math.max(
            0,
            Number(
              preferences[
                channel.id
              ] ??
              0
            )
          ),
        0
      );

    const coverage =
      activePreference /
      totalPreference;

    return clamp(
      0.72 +
      coverage *
      0.48,
      0.72,
      1.2
    );
  }

  getDistrictAccessFactor(
    district,
    segment
  ) {
    const partySize =
      Math.max(
        1,
        Number(
          segment.partySize
            ?.average ??
          1.8
        )
      );

    const parkingWeight =
      clamp(
        0.18 +
        (
          partySize -
          1
        ) *
        0.13,
        0.18,
        0.75
      );

    const transitWeight =
      1 -
      parkingWeight;

    const accessScore =
      (
        (
          district
            .parkingConvenience ??
          50
        ) *
        parkingWeight +
        (
          district
            .transitAccess ??
          50
        ) *
        transitWeight
      );

    return clamp(
      0.75 +
      accessScore /
      100 *
      0.45,
      0.75,
      1.2
    );
  }

  getDistrictDeliveryFactor(
    district,
    segment
  ) {
    const preferences =
      segment
        .channelPreferences ??
      {};

    const total =
      Object.values(
        preferences
      ).reduce(
        (
          sum,
          value
        ) =>
          sum +
          Math.max(
            0,
            Number(
              value
            ) ||
            0
          ),
        0
      );

    if (
      total <= 0
    ) {
      return 1;
    }

    const deliveryShare =
      Math.max(
        0,
        Number(
          preferences.delivery ??
          0
        )
      ) /
      total;

    const deliveryDemand =
      district.deliveryDemand ??
      50;

    return clamp(
      1 +
      (
        deliveryDemand -
        50
      ) /
      100 *
      deliveryShare *
      0.5,
      0.8,
      1.2
    );
  }

  getMenuPriceIndex(
    restaurantId
  ) {
    const menu =
      menuSystem.listByRestaurant(
        restaurantId,
        {
          activeOnly: true
        }
      );

    if (menu.length === 0) {
      return 1;
    }

    const ratios = [];

    for (const item of menu) {
      const dish =
        dishCatalogSystem.get(
          item.dishId
        );

      if (
        dish &&
        dish.basePrice > 0
      ) {
        ratios.push(
          item.price /
          dish.basePrice
        );
      }
    }

    if (ratios.length === 0) {
      return 1;
    }

    return (
      ratios.reduce(
        (sum, value) =>
          sum + value,
        0
      ) /
      ratios.length
    );
  }

  getHourlyDemand(
    restaurantId,
    hour
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const district =
      this.getDistrictForRestaurant(
        restaurantId
      ) ??
      this.getFallbackDistrict();

    const mix =
      this.getCustomerMix(
        district
      );

    const actionModifiers =
      marketActionSystem
        .getModifiers(
          restaurantId
        );

    const positioningContext =
      restaurantPositioningSystem
        .getContext(
          restaurantId
        );

    const dishPrestigeFactor =
      dishGrowthSystem
        .getRestaurantAppealMultiplier(
          restaurantId
        );

    const renovation =
      renovationSystem
        .getOperationalModifiers(
          restaurantId
        );

    const renovationAppealFactor =
      renovation.active
        ? clamp(
            renovation.appealMultiplier ?? 1,
            1,
            1.15
          )
        : 1;

    const priceIndex =
      this.getMenuPriceIndex(
        restaurantId
      ) *
      actionModifiers
        .priceMultiplier;

    const trafficFactor =
      clamp(
        district.trafficIndex /
          50,
        0.2,
        2.5
      );

    const districtSpendFactor =
      clamp(
        0.7 +
        district.spendingPower /
          200,
        0.7,
        1.2
      );

    const reputationFactor =
      clamp(
        1 +
        Math.min(
          restaurant.reputation ?? 0,
          100
        ) /
          200,
        1,
        1.5
      );

    const reviewScore =
      clamp(
        Number.isFinite(
          restaurant.reviewScore
        )
          ? restaurant.reviewScore
          : 3,
        1,
        5
      );

    const reviewFactor =
      clamp(
        0.8 +
        (reviewScore - 1) *
          0.1,
        0.8,
        1.2
      );

    const repeatFactor =
      clamp(
        1 +
        clamp(
          restaurant.repeatRate ?? 0,
          0,
          100
        ) /
          100 *
          0.15,
        1,
        1.15
      );

    const levelFactor =
      clamp(
        1 +
        Math.max(
          0,
          (restaurant.level ?? 1) -
            1
        ) *
          0.03,
        1,
        1.3
      );

    const wordOfMouthFactor =
      wordOfMouthSystem
        .getDemandMultiplier(
          restaurantId
        );

    const mealPeriodFactor =
      districtSystem
        .getMealPeriodMultiplier(
          district,
          hour
        );

    const seasonalityFactor =
      clamp(
        district.seasonality ??
        1,
        0.75,
        1.35
      );

    const districtPositioningFactor =
      positioningContext
        .districtFit ??
      districtSystem
        .getPositioningAffinity(
          district,
          positioningContext
            .positioningId
        );

    const venueContext =
      this.getVenueContext(
        restaurantId
      );

    const venueDistrictFactor =
      venueTypeSystem
        .getDistrictAffinity(
          venueContext
            .venueTypeId,
          district
        );

    const venuePriceTolerance =
      venueTypeSystem
        .getPriceToleranceMultiplier(
          venueContext
            .venueTypeId
        );

    const segments = [];

    let expectedVisitors = 0;

    let weightedMarketShare = 0;
    let weightedCompetitionFactor = 0;
    let competitionWeight = 0;

    for (const item of mix) {
      const segment =
        customerSegmentSystem.get(
          item.segmentId
        );

      if (!segment) {
        continue;
      }

      const hourFactor =
        customerSegmentSystem
          .getHourWeight(
            segment.id,
            hour
          ) /
        100;

      const markup =
        Math.max(
          0,
          priceIndex - 1
        );

      const discount =
        Math.max(
          0,
          1 - priceIndex
        );

      const priceFactor =
        clamp(
          1 -
          markup *
            (
              segment
                .priceSensitivity /
              100
            ) *
            0.9 /
            Math.max(
              0.5,
              venuePriceTolerance
            ) +
          discount *
            (
              segment
                .priceSensitivity /
              100
            ) *
            0.35 +
          (
            segment.spendingPower -
            50
          ) /
            300,
          0.35,
          1.35
        );

      const environment =
        districtEventSystem
          .getModifiers(
            district.id,
            segment.id
          );

      const calendarFactor =
        businessCalendarSystem
          .getDemandMultiplier(
            segment.id,
            hour
          );

      const positioningFactor =
        restaurantPositioningSystem
          .getSegmentDemandMultiplier(
            positioningContext,
            segment.id
          );

      const channelAccessFactor =
        this.getChannelAccessFactor(
          restaurantId,
          segment
        );

      const marketingSegmentFactor =
        actionModifiers
          .segmentMultipliers?.[
            segment.id
          ] ??
        1;

      const marketingChannelFactor =
        this.getMarketingChannelFactor(
          restaurantId,
          segment,
          actionModifiers
            .channelMultipliers
        );

      const venueSegmentFactor =
        venueTypeSystem
          .getSegmentMultiplier(
            venueContext
              .venueTypeId,
            segment.id
          );

      const venueChannelFactor =
        this.getVenueChannelFactor(
          restaurantId,
          segment,
          venueContext
            .venueTypeId
        );

      const segmentRetentionFactor =
        businessCausalitySystem
          .getSegmentDemandMultiplier(
            restaurantId,
            segment.id,
            7
          );

      const memberRetentionFactor =
        customerLoyaltySystem
          .getSegmentRetentionMultiplier(
            restaurantId,
            segment.id
          );

      const districtAccessFactor =
        this.getDistrictAccessFactor(
          district,
          segment
        );

      const districtDeliveryFactor =
        this.getDistrictDeliveryFactor(
          district,
          segment
        );

      const playerAppeal =
        clamp(
          priceFactor *
          reputationFactor *
          reviewFactor *
          repeatFactor *
          levelFactor *
          wordOfMouthFactor *
          actionModifiers
            .marketAppealMultiplier *
          environment
            .playerAppealMultiplier *
          positioningFactor *
          segmentRetentionFactor *
          dishPrestigeFactor *
          renovationAppealFactor,
          0.2,
          4
        );

      const market =
        marketCompetitionSystem
          .getMarketSnapshot({
            restaurantId,
            district,
            segmentId:
              segment.id,
            playerAppeal
          });

      const competitionFactor =
        market.competitionFactor;

      weightedMarketShare +=
        market.marketShare *
        item.share;

      weightedCompetitionFactor +=
        competitionFactor *
        item.share;

      competitionWeight +=
        item.share;

      const demand =
        4 *
        item.share *
        hourFactor *
        trafficFactor *
        competitionFactor *
        districtSpendFactor *
        environment
          .spendingMultiplier *
        environment
          .demandMultiplier *
        calendarFactor *
        mealPeriodFactor *
        seasonalityFactor *
        districtPositioningFactor *
        venueDistrictFactor *
        venueSegmentFactor *
        venueChannelFactor *
        positioningFactor *
        channelAccessFactor *
        districtAccessFactor *
        districtDeliveryFactor *
        segmentRetentionFactor *
        memberRetentionFactor *
        dishPrestigeFactor *
        renovationAppealFactor *
        priceFactor *
        reputationFactor *
        reviewFactor *
        repeatFactor *
        levelFactor *
        wordOfMouthFactor *
        actionModifiers
          .demandMultiplier *
        marketingSegmentFactor *
        marketingChannelFactor;

      expectedVisitors += demand;

      segments.push({
        segmentId:
          segment.id,

        share:
          item.share,

        hourFactor,

        priceFactor,

        marketShare:
          market.marketShare,

        competitionFactor,

        environmentFactor:
          environment
            .demandMultiplier *
          environment
            .spendingMultiplier,

        calendarFactor,

        positioningFactor,

        districtPositioningFactor,

        venueTypeId:
          venueContext
            .venueTypeId,

        venueDistrictFactor,

        venueSegmentFactor,

        venueChannelFactor,

        channelAccessFactor,

        marketingSegmentFactor,

        marketingChannelFactor,

        districtAccessFactor,

        districtDeliveryFactor,

        mealPeriodFactor,

        seasonalityFactor,

        segmentRetentionFactor,

        memberRetentionFactor,

        renovationAppealFactor,

        expectedVisitors:
          demand
      });
    }

    return {
      restaurantId,
      hour,

      districtId:
        district.id,

      expectedVisitors:
        Math.max(
          0,
          expectedVisitors
        ),

      priceIndex,

      trafficFactor,

      marketShare:
        competitionWeight > 0
          ? weightedMarketShare /
            competitionWeight
          : 1,

      competitionFactor:
        competitionWeight > 0
          ? weightedCompetitionFactor /
            competitionWeight
          : 1,

      districtSpendFactor,

      mealPeriodFactor,

      seasonalityFactor,

      districtPositioningFactor,

      venueTypeId:
        venueContext
          .venueTypeId,

      venueDistrictFactor,

      venuePriceTolerance,

      calendar:
        businessCalendarSystem
          .getCalendar(),

      positioningId:
        positioningContext
          .positioningId,

      positioningFit: {
        category:
          positioningContext
            .categoryFit,

        price:
          positioningContext
            .priceFit
      },

      dishPrestigeFactor,
      renovationAppealFactor,

      reputationFactor,
      reviewFactor,
      repeatFactor,
      levelFactor,
      wordOfMouthFactor,

      segments
    };
  }

  getDailyDemand(
    restaurantId,
    openHour,
    closeHour
  ) {
    let expectedVisitors = 0;

    const hours = [];

    for (
      let hour = openHour;
      hour < closeHour;
      hour += 1
    ) {
      const result =
        this.getHourlyDemand(
          restaurantId,
          hour
        );

      expectedVisitors +=
        result.expectedVisitors;

      hours.push(result);
    }

    return {
      restaurantId,
      expectedVisitors,
      hours
    };
  }
}

export const trafficDemandSystem =
  new TrafficDemandSystem();

export { TrafficDemandSystem };
