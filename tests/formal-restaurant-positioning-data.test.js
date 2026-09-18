import test from "node:test";
import assert from "node:assert/strict";

import {
  RESTAURANT_POSITIONINGS_V1,
  RESTAURANT_POSITIONING_DATASET_META
} from "../src/data/restaurantPositionings.v1.js";

import {
  POSITIONING_MARKETING_CATEGORIES,
  validateRestaurantPositioning
} from "../src/data/restaurantPositioningRules.js";

import {
  CUSTOMER_SEGMENTS_V3
} from "../src/data/customerSegments.v3.js";

import {
  VENUE_TYPES_V2
} from "../src/data/venueTypes.v2.js";

import {
  DISH_DATASET_META
} from "../src/data/dishes.v1.js";

const LEGACY_IDS = [
  "quick_service",
  "family_dining",
  "student_value",
  "specialty_dining"
];

test(
  "正式餐厅定位固定16种且旧4个ID全部保留",
  () => {
    assert.equal(
      RESTAURANT_POSITIONING_DATASET_META.total,
      16
    );

    assert.equal(
      RESTAURANT_POSITIONINGS_V1.length,
      16
    );

    assert.equal(
      new Set(
        RESTAURANT_POSITIONINGS_V1.map(
          item => item.id
        )
      ).size,
      16
    );

    const ids =
      new Set(
        RESTAURANT_POSITIONINGS_V1.map(
          item => item.id
        )
      );

    for (
      const id
      of LEGACY_IDS
    ) {
      assert.ok(
        ids.has(id),
        id
      );
    }

    for (
      const item
      of RESTAURANT_POSITIONINGS_V1
    ) {
      assert.equal(
        validateRestaurantPositioning(
          item
        ),
        true,
        item.id
      );
    }
  }
);

test(
  "定位只引用正式客群菜品类别业态和营销类别",
  () => {
    const segments =
      new Set(
        CUSTOMER_SEGMENTS_V3.map(
          item => item.id
        )
      );

    const venues =
      new Set(
        VENUE_TYPES_V2.map(
          item => item.id
        )
      );

    const dishCategories =
      new Set(
        Object.keys(
          DISH_DATASET_META.categories
        )
      );

    for (
      const item
      of RESTAURANT_POSITIONINGS_V1
    ) {
      for (
        const segmentId
        of Object.keys(
          item.targetSegments
        )
      ) {
        assert.ok(
          segments.has(
            segmentId
          ),
          `${item.id} -> segment ${segmentId}`
        );
      }

      for (
        const category
        of Object.keys(
          item.categoryWeights
        )
      ) {
        if (
          category === "default"
        ) {
          continue;
        }

        assert.ok(
          dishCategories.has(
            category
          ),
          `${item.id} -> dish category ${category}`
        );
      }

      for (
        const venueId
        of Object.keys(
          item.venueWeights
        )
      ) {
        if (
          venueId === "default"
        ) {
          continue;
        }

        assert.ok(
          venues.has(
            venueId
          ),
          `${item.id} -> venue ${venueId}`
        );
      }

      for (
        const category
        of Object.keys(
          item.marketingCategoryWeights
        )
      ) {
        assert.ok(
          POSITIONING_MARKETING_CATEGORIES
            .includes(
              category
            ),
          `${item.id} -> marketing ${category}`
        );
      }
    }
  }
);

test(
  "16种定位覆盖快餐家庭学生特色办公早餐社区外卖健康甜品夜间商务高端文旅宴席团餐",
  () => {
    const expected = [
      "quick_service",
      "family_dining",
      "student_value",
      "specialty_dining",
      "office_lunch",
      "breakfast_convenience",
      "community_home_style",
      "delivery_first",
      "healthy_light_meal",
      "dessert_social",
      "nightlife_social",
      "business_dining",
      "premium_private",
      "tourism_destination",
      "banquet_gathering",
      "industrial_canteen"
    ];

    assert.deepEqual(
      new Set(
        RESTAURANT_POSITIONINGS_V1.map(
          item => item.id
        )
      ),
      new Set(expected)
    );
  }
);
