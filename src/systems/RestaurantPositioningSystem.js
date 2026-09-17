import { gameState } from "../core/GameState.js";
import { eventBus } from "../core/EventBus.js";
import { entitySystem } from "../core/EntitySystem.js";

import { restaurantSystem } from "./RestaurantSystem.js";
import { propertySystem } from "./PropertySystem.js";
import { districtSystem } from "./DistrictSystem.js";
import { menuSystem } from "./MenuSystem.js";
import { dishCatalogSystem } from "./DishCatalogSystem.js";

function clamp(value, min, max) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

const POSITIONINGS = Object.freeze({
  quick_service: {
    id: "quick_service",
    name: "快餐便餐",

    targetSegments: {
      office_worker: 1.3,
      student: 1.15,
      resident: 0.9,
      tourist: 0.8
    },

    categoryWeights: {
      fast_food: 1.3,
      rice: 1.2,
      noodle: 1.15,
      stir_fry: 0.85,
      hotpot: 0.65,
      dessert: 0.8,
      default: 0.8
    },

    priceRange: [
      0.75,
      1.05
    ]
  },

  family_dining: {
    id: "family_dining",
    name: "家庭正餐",

    targetSegments: {
      resident: 1.3,
      tourist: 1.05,
      office_worker: 0.85,
      student: 0.8
    },

    categoryWeights: {
      stir_fry: 1.3,
      hotpot: 1.15,
      rice: 1.05,
      noodle: 0.9,
      fast_food: 0.7,
      dessert: 0.9,
      default: 0.85
    },

    priceRange: [
      0.9,
      1.25
    ]
  },

  student_value: {
    id: "student_value",
    name: "学生实惠",

    targetSegments: {
      student: 1.35,
      office_worker: 1,
      resident: 0.95,
      tourist: 0.7
    },

    categoryWeights: {
      fast_food: 1.25,
      rice: 1.2,
      noodle: 1.2,
      dessert: 1.05,
      stir_fry: 0.8,
      hotpot: 0.7,
      default: 0.8
    },

    priceRange: [
      0.65,
      0.95
    ]
  },

  specialty_dining: {
    id: "specialty_dining",
    name: "特色餐饮",

    targetSegments: {
      tourist: 1.3,
      resident: 1.05,
      office_worker: 0.95,
      student: 0.75
    },

    categoryWeights: {
      hotpot: 1.25,
      stir_fry: 1.2,
      dessert: 1.05,
      rice: 0.9,
      noodle: 0.9,
      fast_food: 0.65,
      default: 1
    },

    priceRange: [
      0.95,
      1.4
    ]
  }
});

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

    if (history.length > 10) {
      history.splice(
        0,
        history.length - 10
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
      0.65,
      1.3
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
      return 1.05;
    }

    const distance =
      priceIndex < minimum
        ? minimum -
          priceIndex
        : priceIndex -
          maximum;

    return clamp(
      1 -
      distance * 0.6,
      0.7,
      1.05
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
        priceFit: 1
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
      0.85;

    const result =
      1 +
      (
        segmentFit - 1
      ) *
        0.5 +
      (
        context.categoryFit - 1
      ) *
        0.3 +
      (
        context.priceFit - 1
      ) *
        0.2;

    return Number(
      clamp(
        result,
        0.72,
        1.25
      ).toFixed(3)
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

    const score =
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
            0.85
          ) *
          weight,
        0
      ) /
      total;

    return clamp(
      score,
      0.7,
      1.35
    );
  }

  getAnalysis(
    restaurantId
  ) {
    const context =
      this.getContext(
        restaurantId
      );

    if (!context.definition) {
      return {
        restaurantId,
        positioningId: null,
        positioningName:
          "未设定",
        menuCategoryFit: 1,
        priceFit: 1,
        districtFit: 1,
        fitScore: 100
      };
    }

    const districtFit =
      this.getDistrictFit(
        restaurantId,
        context.definition
      );

    const weightedFit =
      context.categoryFit *
        0.35 +
      context.priceFit *
        0.2 +
      districtFit *
        0.45;

    return {
      restaurantId,

      positioningId:
        context.definition.id,

      positioningName:
        context.definition.name,

      menuCategoryFit:
        Number(
          context
            .categoryFit
            .toFixed(2)
        ),

      priceFit:
        Number(
          context
            .priceFit
            .toFixed(2)
        ),

      districtFit:
        Number(
          districtFit
            .toFixed(2)
        ),

      fitScore:
        Math.round(
          clamp(
            weightedFit *
            100,
            60,
            125
          )
        )
    };
  }

  getAvailable() {
    return Object.values(
      POSITIONINGS
    );
  }
}

export const restaurantPositioningSystem =
  new RestaurantPositioningSystem();

export {
  RestaurantPositioningSystem,
  POSITIONINGS as RESTAURANT_POSITIONINGS
};
