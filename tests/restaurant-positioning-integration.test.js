import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  entitySystem
} from "../src/core/EntitySystem.js";

import { app } from "../src/main.js";

const {
  districtSystem,
  propertySystem,
  restaurantSystem,
  restaurantPositioningSystem,
  financeSystem,
  marketActionSystem,
  marketCompetitionSystem,
  trafficDemandSystem
} = app.systems;

function createRestaurant({
  districtId,
  name,
  venueTypeId = "street_shop",
  level = 1
}) {
  const property =
    propertySystem.create({
      districtId,
      name:
        `${name}铺位`,
      area: 180,
      seats: 30,
      baseMonthlyRent:
        10000
    });

  entitySystem.update(
    "property",
    property.id,
    {
      venueTypeId
    }
  );

  const restaurant =
    restaurantSystem.create({
      name,
      locationId:
        property.id
    });

  restaurantSystem.setLevel(
    restaurant.id,
    level
  );

  financeSystem.createAccount(
    restaurant.id,
    300000
  );

  return restaurant;
}

test(
  "高等级定位会被门店等级真实锁定",
  () => {
    gameState.reset();

    const districtId =
      districtSystem
        .getAll()[0].id;

    const restaurant =
      createRestaurant({
        districtId,
        name:
          "定位等级测试店",
        level: 1
      });

    const locked =
      restaurantPositioningSystem
        .getAvailability(
          restaurant.id,
          "premium_private"
        );

    assert.equal(
      locked.canSelect,
      false
    );

    assert.ok(
      locked.reasons.includes(
        "restaurant_level"
      )
    );

    restaurantSystem.setLevel(
      restaurant.id,
      5
    );

    assert.equal(
      restaurantPositioningSystem
        .getAvailability(
          restaurant.id,
          "premium_private"
        )
        .canSelect,
      true
    );
  }
);

test(
  "业态和营销会真实改变定位匹配及需求倍率",
  () => {
    gameState.reset();

    districtSystem.load(
      [
        {
          id:
            "premium_position_area",
          name:
            "高端定位测试区",
          trafficIndex: 70,
          rentMultiplier: 1,
          spendingPower: 88,
          competition: 0,
          customerMix: {
            high_income: 45,
            business_guest: 30,
            premium_foodie: 25
          }
        }
      ],
      {
        overwrite: true
      }
    );

    const restaurant =
      createRestaurant({
        districtId:
          "premium_position_area",
        name:
          "高端定位联动店",
        venueTypeId:
          "villa_private_kitchen",
        level: 5
      });

    const premium =
      restaurantPositioningSystem
        .getDefinition(
          "premium_private"
        );

    const quick =
      restaurantPositioningSystem
        .getDefinition(
          "quick_service"
        );

    assert.ok(
      restaurantPositioningSystem
        .getVenueFit(
          restaurant.id,
          premium
        ) >
      restaurantPositioningSystem
        .getVenueFit(
          restaurant.id,
          quick
        )
    );

    restaurantPositioningSystem
      .setPositioning(
        restaurant.id,
        "premium_private"
      );

    const before =
      restaurantPositioningSystem
        .getContext(
          restaurant.id
        );

    marketActionSystem
      .startAction(
        restaurant.id,
        "brand_story_campaign"
      );

    const after =
      restaurantPositioningSystem
        .getContext(
          restaurant.id
        );

    assert.ok(
      after.marketingFit >
      before.marketingFit
    );

    const premiumDemand =
      restaurantPositioningSystem
        .getSegmentDemandMultiplier(
          after,
          "high_income"
        );

    restaurantPositioningSystem
      .setPositioning(
        restaurant.id,
        "quick_service"
      );

    const quickDemand =
      restaurantPositioningSystem
        .getSegmentDemandMultiplier(
          restaurantPositioningSystem
            .getContext(
              restaurant.id
            ),
          "high_income"
        );

    assert.ok(
      premiumDemand >
      quickDemand
    );
  }
);

test(
  "装修取向会区分高氛围定位和高周转定位",
  () => {
    gameState.reset();

    const districtId =
      districtSystem
        .getAll()[0].id;

    const restaurant =
      createRestaurant({
        districtId,
        name:
          "装修定位测试店",
        level: 5
      });

    entitySystem.create(
      "renovation_layout",
      {
        restaurantId:
          restaurant.id,
        active: true,
        placements: [
          {
            furnitureId:
              "decor_feature_flagship"
          },
          {
            furnitureId:
              "decor_feature_flagship"
          },
          {
            furnitureId:
              "ambient_light_flagship"
          },
          {
            furnitureId:
              "ambient_light_flagship"
          },
          {
            furnitureId:
              "booth_4_flagship"
          }
        ]
      }
    );

    const premiumFit =
      restaurantPositioningSystem
        .getRenovationFit(
          restaurant.id,
          restaurantPositioningSystem
            .getDefinition(
              "premium_private"
            )
        );

    const quickFit =
      restaurantPositioningSystem
        .getRenovationFit(
          restaurant.id,
          restaurantPositioningSystem
            .getDefinition(
              "quick_service"
            )
        );

    assert.ok(
      premiumFit >
      quickFit
    );
  }
);

test(
  "同定位竞争密集会降低定位竞争匹配",
  () => {
    gameState.reset();

    districtSystem.load(
      [
        {
          id:
            "competition_position_area",
          name:
            "竞争定位测试区",
          trafficIndex: 75,
          rentMultiplier: 1,
          spendingPower: 85,
          competition: 80,
          customerMix: {
            high_income: 50,
            business_guest: 30,
            premium_foodie: 20
          }
        }
      ],
      {
        overwrite: true
      }
    );

    const restaurant =
      createRestaurant({
        districtId:
          "competition_position_area",
        name:
          "竞争定位测试店",
        venueTypeId:
          "villa_private_kitchen",
        level: 5
      });

    for (
      let index = 1;
      index <= 4;
      index += 1
    ) {
      marketCompetitionSystem
        .create({
          districtId:
            "competition_position_area",
          name:
            `高端竞店${index}`,
          priceIndex: 1.5,
          qualityScore: 80,
          reputation: 75,
          serviceScore: 80,
          segmentFocus:
            "high_income",
          venueTypeFocus: [
            "villa_private_kitchen"
          ],
          strengthTier: 4
        });
    }

    const premiumFit =
      restaurantPositioningSystem
        .getCompetitionFit(
          restaurant.id,
          restaurantPositioningSystem
            .getDefinition(
              "premium_private"
            )
        );

    const canteenFit =
      restaurantPositioningSystem
        .getCompetitionFit(
          restaurant.id,
          restaurantPositioningSystem
            .getDefinition(
              "industrial_canteen"
            )
        );

    assert.ok(
      premiumFit <
      canteenFit
    );
  }
);

test(
  "正式定位仍然进入小时客流计算",
  () => {
    gameState.reset();

    districtSystem.load(
      [
        {
          id:
            "office_position_v2",
          name:
            "办公定位测试区",
          trafficIndex: 85,
          rentMultiplier: 1,
          spendingPower: 70,
          competition: 0,
          customerMix: {
            office_worker: 100
          }
        }
      ],
      {
        overwrite: true
      }
    );

    const office =
      createRestaurant({
        districtId:
          "office_position_v2",
        name:
          "办公午餐定位店",
        venueTypeId:
          "office_restaurant",
        level: 3
      });

    const tourism =
      createRestaurant({
        districtId:
          "office_position_v2",
        name:
          "文旅定位店",
        venueTypeId:
          "office_restaurant",
        level: 3
      });

    restaurantPositioningSystem
      .setPositioning(
        office.id,
        "office_lunch"
      );

    restaurantPositioningSystem
      .setPositioning(
        tourism.id,
        "tourism_destination"
      );

    const officeDemand =
      trafficDemandSystem
        .getHourlyDemand(
          office.id,
          12
        )
        .expectedVisitors;

    const tourismDemand =
      trafficDemandSystem
        .getHourlyDemand(
          tourism.id,
          12
        )
        .expectedVisitors;

    assert.ok(
      officeDemand >
      tourismDemand
    );
  }
);
