import { gameState } from "../core/GameState.js";
import { eventBus } from "../core/EventBus.js";
import { entitySystem } from "../core/EntitySystem.js";

import { restaurantSystem } from "./RestaurantSystem.js";
import { propertySystem } from "./PropertySystem.js";
import { districtSystem } from "./DistrictSystem.js";
import { menuSystem } from "./MenuSystem.js";
import { dishCatalogSystem } from "./DishCatalogSystem.js";
import { renovationSystem } from "./RenovationSystem.js";
import { marketActionSystem } from "./MarketActionSystem.js";
import { marketCompetitionSystem } from "./MarketCompetitionSystem.js";

import {
  RESTAURANT_POSITIONINGS_V1
} from "../data/restaurantPositionings.v1.js";

const POSITIONINGS = Object.freeze(
  Object.fromEntries(
    RESTAURANT_POSITIONINGS_V1.map(
      item => [
        item.id,
        item
      ]
    )
  )
);

function clamp(value, min, max) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

class RestaurantPositioningSystem {
  getDefinition(id) {
    if (id === null) {
      return null;
    }

    const definition =
      POSITIONINGS[id];

    if (!definition) {
      throw new Error(
        `Unknown restaurant positioning "${id}"`
      );
    }

    return definition;
  }

  getAvailability(
    restaurantId,
    positioningId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const definition =
      this.getDefinition(
        positioningId
      );

    const level =
      restaurant.level ?? 1;

    const reasons = [];

    if (
      level <
      definition.minRestaurantLevel
    ) {
      reasons.push(
        "restaurant_level"
      );
    }

    return {
      canSelect:
        reasons.length === 0,
      reasons,
      restaurantLevel:
        level,
      minRestaurantLevel:
        definition.minRestaurantLevel
    };
  }

  setPositioning(
    restaurantId,
    positioningId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const definition =
      this.getDefinition(
        positioningId
      );

    const availability =
      this.getAvailability(
        restaurantId,
        positioningId
      );

    if (
      !availability.canSelect
    ) {
      throw new Error(
        `Restaurant positioning unavailable: ${availability.reasons.join(",")}`
      );
    }

    const time =
      gameState.getSection(
        "time"
      );

    const history = [
      ...(
        restaurant
          .positioningHistory ??
        []
      ),
      {
        positioningId,
        day: time.day
      }
    ];

    if (history.length > 20) {
      history.splice(
        0,
        history.length - 20
      );
    }

    const result =
      entitySystem.update(
        "restaurant",
        restaurantId,
        {
          positioningId:
            definition.id,

          positioningChangedDay:
            time.day,

          positioningHistory:
            history
        }
      );

    eventBus.emit(
      "restaurant:positioningChanged",
      {
        restaurantId,
        positioningId:
          definition.id,
        day: time.day
      }
    );

    return result;
  }

  clearPositioning(
    restaurantId
  ) {
    return entitySystem.update(
      "restaurant",
      restaurantId,
      {
        positioningId: null,
        positioningChangedDay:
          gameState.getSection(
            "time"
          ).day
      }
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

    let total = 0;
    let count = 0;

    for (const item of menu) {
      const dish =
        dishCatalogSystem.get(
          item.dishId
        );

      if (
        !dish ||
        !Number.isFinite(
          dish.basePrice
        ) ||
        dish.basePrice <= 0
      ) {
        continue;
      }

      total +=
        item.price /
        dish.basePrice;

      count += 1;
    }

    return (
      count > 0
        ? total / count
        : 1
    );
  }

  getCategoryFit(
    restaurantId,
    definition
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

    let total = 0;
    let count = 0;

    for (const item of menu) {
      const dish =
        dishCatalogSystem.get(
          item.dishId
        );

      if (!dish) {
        continue;
      }

      total +=
        definition
          .categoryWeights[
            dish.category
          ] ??
        definition
          .categoryWeights
          .default ??
        1;

      count += 1;
    }

    return clamp(
      count > 0
        ? total / count
        : 1,
      0.55,
      1.45
    );
  }

  getPriceFit(
    restaurantId,
    definition
  ) {
    const priceIndex =
      this.getMenuPriceIndex(
        restaurantId
      );

    const [
      minimum,
      maximum
    ] =
      definition.priceRange;

    if (
      priceIndex >= minimum &&
      priceIndex <= maximum
    ) {
      const center =
        (
          minimum +
          maximum
        ) /
        2;

      const halfWidth =
        Math.max(
          0.05,
          (
            maximum -
            minimum
          ) /
          2
        );

      const centerDistance =
        Math.abs(
          priceIndex -
          center
        ) /
        halfWidth;

      return clamp(
        1.08 -
        centerDistance *
        0.04,
        1.04,
        1.08
      );
    }

    const distance =
      priceIndex < minimum
        ? minimum -
          priceIndex
        : priceIndex -
          maximum;

    return clamp(
      1 -
      distance * 0.65,
      0.62,
      1.04
    );
  }

  getDistrict(
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

  getDistrictFit(
    restaurantId,
    definition
  ) {
    const district =
      this.getDistrict(
        restaurantId
      );

    if (
      !district ||
      !district.customerMix
    ) {
      return 1;
    }

    const entries =
      Object.entries(
        district.customerMix
      )
      .filter(
        ([, weight]) =>
          Number.isFinite(
            weight
          ) &&
          weight > 0
      );

    const total =
      entries.reduce(
        (
          sum,
          [, weight]
        ) =>
          sum + weight,
        0
      );

    if (total <= 0) {
      return 1;
    }

    const customerFit =
      entries.reduce(
        (
          sum,
          [
            segmentId,
            weight
          ]
        ) =>
          sum +
          (
            definition
              .targetSegments[
                segmentId
              ] ??
            0.82
          ) *
          weight,
        0
      ) /
      total;

    const explicit =
      district
        .positioningAffinity?.[
          definition.id
        ];

    const score =
      Number.isFinite(explicit)
        ? customerFit *
            0.75 +
          explicit *
            0.25
        : customerFit;

    return clamp(
      score,
      0.62,
      1.45
    );
  }

  getVenueTypeId(
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

      return (
        property.venueTypeId ??
        "street_shop"
      );
    } catch {
      return null;
    }
  }

  getVenueFit(
    restaurantId,
    definition
  ) {
    const venueTypeId =
      this.getVenueTypeId(
        restaurantId
      );

    if (!venueTypeId) {
      return 1;
    }

    return clamp(
      definition
        .venueWeights[
          venueTypeId
        ] ??
      definition
        .venueWeights
        .default ??
      0.82,
      0.5,
      1.55
    );
  }

  getRenovationFit(
    restaurantId,
    definition
  ) {
    let renovation;

    try {
      renovation =
        renovationSystem
          .getOperationalModifiers(
            restaurantId
          );
    } catch {
      return 1;
    }

    if (
      !renovation ||
      !renovation.active
    ) {
      return 1;
    }

    const throughput =
      clamp(
        (
          renovation
            .kitchenEfficiency +
          renovation
            .serviceEfficiency +
          renovation
            .queueEfficiency
        ) /
        3,
        1,
        1.3
      );

    const comfort =
      clamp(
        1 +
        (
          renovation
            .comfortBonus ??
          0
        ),
        1,
        1.12
      );

    const appeal =
      clamp(
        renovation
          .appealMultiplier ??
        1,
        1,
        1.18
      );

    const profile =
      definition
        .renovationProfile;

    return Number(
      clamp(
        throughput *
          profile.throughput +
        comfort *
          profile.comfort +
        appeal *
          profile.appeal,
        0.8,
        1.3
      ).toFixed(3)
    );
  }

  getMarketingFit(
    restaurantId,
    definition
  ) {
    let actions;

    try {
      actions =
        marketActionSystem
          .getActiveActions(
            restaurantId
          );
    } catch {
      return 1;
    }

    if (
      actions.length === 0
    ) {
      return 1;
    }

    let total = 0;
    let count = 0;

    for (
      const action
      of actions
    ) {
      let actionDefinition;

      try {
        actionDefinition =
          marketActionSystem
            .getDefinition(
              action.type
            );
      } catch {
        continue;
      }

      total +=
        definition
          .marketingCategoryWeights[
            actionDefinition.category
          ] ??
        1;

      count += 1;
    }

    return clamp(
      count > 0
        ? total / count
        : 1,
      0.55,
      1.45
    );
  }

  getCompetitionFit(
    restaurantId,
    definition
  ) {
    const district =
      this.getDistrict(
        restaurantId
      );

    if (!district) {
      return 1;
    }

    const competitors =
      marketCompetitionSystem
        .listByDistrict(
          district.id
        );

    if (
      competitors.length === 0
    ) {
      return 1.04;
    }

    const venueTypeId =
      this.getVenueTypeId(
        restaurantId
      );

    let similarityTotal = 0;

    for (
      const competitor
      of competitors
    ) {
      const segmentWeight =
        competitor.segmentFocus
          ? (
              definition
                .targetSegments[
                  competitor
                    .segmentFocus
                ] ??
              0.82
            )
          : 0.9;

      const segmentSimilarity =
        clamp(
          (
            segmentWeight -
            0.6
          ) /
          0.9,
          0,
          1
        );

      const [
        minimum,
        maximum
      ] =
        definition.priceRange;

      const priceSimilarity =
        competitor.priceIndex >=
          minimum &&
        competitor.priceIndex <=
          maximum
          ? 1
          : 0.45;

      const venueSimilarity =
        venueTypeId &&
        (
          competitor
            .venueTypeFocus ??
          []
        ).includes(
          venueTypeId
        )
          ? 1
          : 0.55;

      similarityTotal +=
        segmentSimilarity *
          0.55 +
        priceSimilarity *
          0.3 +
        venueSimilarity *
          0.15;
    }

    const averageSimilarity =
      similarityTotal /
      competitors.length;

    const competitionIntensity =
      clamp(
        (
          district.competition ??
          50
        ) /
        100,
        0,
        1
      );

    const pressure =
      averageSimilarity *
      competitionIntensity *
      (
        1 -
        definition
          .competitionTolerance *
          0.55
      );

    return Number(
      clamp(
        1.05 -
        pressure *
        0.28,
        0.72,
        1.05
      ).toFixed(3)
    );
  }

  getContext(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    if (
      !restaurant.positioningId
    ) {
      return {
        positioningId: null,
        definition: null,
        categoryFit: 1,
        priceFit: 1,
        districtFit: 1,
        venueFit: 1,
        renovationFit: 1,
        marketingFit: 1,
        competitionFit: 1
      };
    }

    const definition =
      this.getDefinition(
        restaurant.positioningId
      );

    return {
      positioningId:
        definition.id,

      definition,

      categoryFit:
        this.getCategoryFit(
          restaurantId,
          definition
        ),

      priceFit:
        this.getPriceFit(
          restaurantId,
          definition
        ),

      districtFit:
        this.getDistrictFit(
          restaurantId,
          definition
        ),

      venueFit:
        this.getVenueFit(
          restaurantId,
          definition
        ),

      renovationFit:
        this.getRenovationFit(
          restaurantId,
          definition
        ),

      marketingFit:
        this.getMarketingFit(
          restaurantId,
          definition
        ),

      competitionFit:
        this.getCompetitionFit(
          restaurantId,
          definition
        )
    };
  }

  getSegmentDemandMultiplier(
    context,
    segmentId
  ) {
    if (!context.definition) {
      return 1;
    }

    const segmentFit =
      context
        .definition
        .targetSegments[
          segmentId
        ] ??
      0.82;

    const result =
      1 +
      (
        segmentFit - 1
      ) *
        0.5 +
      (
        context.categoryFit - 1
      ) *
        0.16 +
      (
        context.priceFit - 1
      ) *
        0.1 +
      (
        context.venueFit - 1
      ) *
        0.08 +
      (
        context.renovationFit - 1
      ) *
        0.06 +
      (
        context.marketingFit - 1
      ) *
        0.05 +
      (
        context.competitionFit - 1
      ) *
        0.05;

    return Number(
      clamp(
        result,
        0.68,
        1.32
      ).toFixed(3)
    );
  }

  getAnalysisForDefinition(
    restaurantId,
    definition
  ) {
    const categoryFit =
      this.getCategoryFit(
        restaurantId,
        definition
      );

    const priceFit =
      this.getPriceFit(
        restaurantId,
        definition
      );

    const districtFit =
      this.getDistrictFit(
        restaurantId,
        definition
      );

    const venueFit =
      this.getVenueFit(
        restaurantId,
        definition
      );

    const renovationFit =
      this.getRenovationFit(
        restaurantId,
        definition
      );

    const marketingFit =
      this.getMarketingFit(
        restaurantId,
        definition
      );

    const competitionFit =
      this.getCompetitionFit(
        restaurantId,
        definition
      );

    const weightedFit =
      districtFit * 0.22 +
      categoryFit * 0.18 +
      priceFit * 0.12 +
      venueFit * 0.14 +
      renovationFit * 0.12 +
      marketingFit * 0.1 +
      competitionFit * 0.12;

    const availability =
      this.getAvailability(
        restaurantId,
        definition.id
      );

    return {
      restaurantId,
      positioningId:
        definition.id,
      positioningName:
        definition.name,
      description:
        definition.description,
      minRestaurantLevel:
        definition.minRestaurantLevel,
      priceRange:
        [...definition.priceRange],
      targetSegments:
        structuredClone(
          definition.targetSegments
        ),
      categoryFit:
        Number(
          categoryFit.toFixed(2)
        ),
      priceFit:
        Number(
          priceFit.toFixed(2)
        ),
      districtFit:
        Number(
          districtFit.toFixed(2)
        ),
      venueFit:
        Number(
          venueFit.toFixed(2)
        ),
      renovationFit:
        Number(
          renovationFit.toFixed(2)
        ),
      marketingFit:
        Number(
          marketingFit.toFixed(2)
        ),
      competitionFit:
        Number(
          competitionFit.toFixed(2)
        ),
      fitScore:
        Math.round(
          clamp(
            weightedFit * 100,
            55,
            135
          )
        ),
      availability
    };
  }

  getAnalysis(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    if (
      !restaurant.positioningId
    ) {
      return {
        restaurantId,
        positioningId: null,
        positioningName:
          "未设定",
        menuCategoryFit: 1,
        categoryFit: 1,
        priceFit: 1,
        districtFit: 1,
        venueFit: 1,
        renovationFit: 1,
        marketingFit: 1,
        competitionFit: 1,
        fitScore: 100
      };
    }

    const analysis =
      this.getAnalysisForDefinition(
        restaurantId,
        this.getDefinition(
          restaurant.positioningId
        )
      );

    return {
      ...analysis,
      menuCategoryFit:
        analysis.categoryFit
    };
  }

  getOptions(
    restaurantId
  ) {
    return RESTAURANT_POSITIONINGS_V1
      .map(
        definition =>
          this.getAnalysisForDefinition(
            restaurantId,
            definition
          )
      )
      .sort(
        (a, b) =>
          Number(
            b.availability
              .canSelect
          ) -
            Number(
              a.availability
                .canSelect
            ) ||
          b.fitScore -
            a.fitScore ||
          a.positioningId
            .localeCompare(
              b.positioningId
            )
      );
  }

  getAvailable() {
    return RESTAURANT_POSITIONINGS_V1;
  }
}

export const restaurantPositioningSystem =
  new RestaurantPositioningSystem();

export {
  RestaurantPositioningSystem,
  POSITIONINGS as RESTAURANT_POSITIONINGS
};
