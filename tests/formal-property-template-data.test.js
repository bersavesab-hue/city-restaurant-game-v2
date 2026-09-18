import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  PROPERTY_TEMPLATES_V1,
  PROPERTY_TEMPLATE_DATASET_META
} from "../src/data/propertyTemplates.v1.js";

import {
  validatePropertyTemplate
} from "../src/data/propertyTemplateRules.js";

import {
  CITY_DISTRICTS_V2
} from "../src/data/cityDistricts.v2.js";

import { app } from "../src/main.js";

const {
  propertyMarketSystem,
  propertyLeaseMarketSystem,
  venueTypeSystem
} = app.systems;

const {
  cityPropertyPageSystem
} = app.ui;


test(
  "正式房源生成包固定22个模板并全部通过Schema",
  () => {
    assert.equal(
      PROPERTY_TEMPLATE_DATASET_META.total,
      22
    );

    assert.equal(
      PROPERTY_TEMPLATES_V1.length,
      22
    );

    assert.equal(
      new Set(
        PROPERTY_TEMPLATES_V1.map(
          item => item.id
        )
      ).size,
      22
    );

    for (
      const template
      of PROPERTY_TEMPLATES_V1
    ) {
      assert.equal(
        validatePropertyTemplate(
          template
        ),
        true,
        template.id
      );
    }
  }
);


test(
  "模板商圈权重只引用正式20商圈且会真实改变分布",
  () => {
    const districtIds =
      new Set(
        CITY_DISTRICTS_V2.map(
          item => item.id
        )
      );

    for (
      const template
      of PROPERTY_TEMPLATES_V1
    ) {
      for (
        const districtId
        of Object.keys(
          template.districtWeights
        )
      ) {
        assert.ok(
          districtIds.has(
            districtId
          ),
          `${template.id} -> ${districtId}`
        );
      }
    }

    assert.ok(
      propertyMarketSystem
        .getTemplateWeight(
          "campus_unit",
          "university"
        ) >
      propertyMarketSystem
        .getTemplateWeight(
          "campus_unit",
          "cbd"
        )
    );

    assert.ok(
      propertyMarketSystem
        .getTemplateWeight(
          "transport_concourse",
          "transport_hub"
        ) >
      propertyMarketSystem
        .getTemplateWeight(
          "transport_concourse",
          "residential"
        )
    );

    assert.ok(
      propertyMarketSystem
        .getTemplateWeight(
          "old_town_narrow",
          "old_town"
        ) >
      propertyMarketSystem
        .getTemplateWeight(
          "old_town_narrow",
          "cbd"
        )
    );

    const distribution =
      propertyMarketSystem
        .getTemplateDistribution(
          "university"
        );

    assert.equal(
      distribution.length,
      22
    );

    const total =
      distribution.reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.share,
        0
      );

    assert.ok(
      Math.abs(
        total -
        1
      ) <
      0.000001
    );
  }
);


test(
  "动态房源实际继承模板的面积结构采光入口柱网和厨房条件",
  () => {
    gameState.reset();

    const property =
      propertyMarketSystem
        .createListing(
          "old_town",
          7401,
          1
        );

    const templateId =
      property
        .marketMeta
        .templateId;

    const template =
      propertyMarketSystem
        .getTemplate(
          templateId
        );

    assert.ok(
      template,
      templateId
    );

    assert.ok(
      property.area >=
        template.areaRange.min &&
      property.area <=
        template.areaRange.max
    );

    assert.ok(
      template.floorOptions
        .includes(
          property.floorCount
        )
    );

    const actualUsableRatio =
      property.usableArea /
      property.area;

    assert.ok(
      actualUsableRatio >=
        template
          .usableRatioRange
          .min -
        0.03
    );

    assert.ok(
      actualUsableRatio <=
        template
          .usableRatioRange
          .max +
        0.01
    );

    assert.ok(
      property.frontageMeters >=
        template.frontageRange.min &&
      property.frontageMeters <=
        template.frontageRange.max
    );

    assert.ok(
      property.ceilingHeight >=
        template
          .ceilingHeightRange
          .min &&
      property.ceilingHeight <=
        template
          .ceilingHeightRange
          .max
    );

    assert.ok(
      property.parkingSpaces >=
        template.parkingRange.min &&
      property.parkingSpaces <=
        template.parkingRange.max
    );

    const features =
      property
        .marketMeta
        .propertyFeatures;

    assert.ok(
      features
    );

    assert.ok(
      features.naturalLightScore >=
        template
          .naturalLightRange
          .min &&
      features.naturalLightScore <=
        template
          .naturalLightRange
          .max
    );

    assert.ok(
      features.entranceCount >=
        template
          .entranceCountRange
          .min &&
      features.entranceCount <=
        template
          .entranceCountRange
          .max
    );

    assert.ok(
      features.columnDensityPer1000 >=
        template
          .columnDensityPer1000Range
          .min &&
      features.columnDensityPer1000 <=
        template
          .columnDensityPer1000Range
          .max
    );

    assert.equal(
      property.floors[0]
        .entrances.length,
      features.entranceCount
    );

    assert.ok(
      property.floors[0]
        .windows.length >=
      1
    );

    assert.deepEqual(
      features.kitchenProfile,
      template.kitchenProfile
    );

    assert.ok(
      features.kitchenReadinessScore >=
      0
    );

    assert.ok(
      property.marketMeta
        .recommendedVenueTypes
        .length <=
      3
    );
  }
);


test(
  "生成房源租约严格落在模板租约画像范围",
  () => {
    gameState.reset();

    const property =
      propertyMarketSystem
        .createListing(
          "commercial_core",
          8802,
          1
        );

    const template =
      propertyMarketSystem
        .getTemplate(
          property
            .marketMeta
            .templateId
        );

    const enriched =
      propertyLeaseMarketSystem
        .ensureTerms(
          property.id
        );

    const terms =
      enriched.leaseTerms;

    const leaseProfile =
      template.leaseProfile;

    assert.equal(
      terms.templateId,
      template.id
    );

    assert.equal(
      terms.minMonths,
      leaseProfile
        .monthsRange
        .min
    );

    assert.equal(
      terms.maxMonths,
      leaseProfile
        .monthsRange
        .max
    );

    assert.ok(
      terms.propertyFeePerSqm >=
        leaseProfile
          .propertyFeePerSqmRange
          .min &&
      terms.propertyFeePerSqm <=
        leaseProfile
          .propertyFeePerSqmRange
          .max
    );

    assert.ok(
      terms.rentFreeMaxDays >=
        leaseProfile
          .rentFreeDaysRange
          .min &&
      terms.rentFreeMaxDays <=
        leaseProfile
          .rentFreeDaysRange
          .max
    );

    assert.ok(
      terms.maxDiscountRate >=
        leaseProfile
          .maxDiscountRateRange
          .min &&
      terms.maxDiscountRate <=
        leaseProfile
          .maxDiscountRateRange
          .max
    );

    assert.ok(
      terms.renewalIncreaseRate >=
        leaseProfile
          .renewalIncreaseRateRange
          .min &&
      terms.renewalIncreaseRate <=
        leaseProfile
          .renewalIncreaseRateRange
          .max
    );

    if (
      terms.transferFee >
      0
    ) {
      assert.ok(
        terms
          .transferFeeRentMultiple >=
          leaseProfile
            .transferFeeRentMultipleRange
            .min &&
        terms
          .transferFeeRentMultiple <=
          leaseProfile
            .transferFeeRentMultipleRange
            .max
      );
    }
  }
);


test(
  "模板生成房源仍通过30业态真实适配并进入选址页面",
  () => {
    gameState.reset();

    let property =
      null;

    for (
      let sequence = 9900;
      sequence < 9930;
      sequence += 1
    ) {
      const candidate =
        propertyMarketSystem
          .createListing(
            "residential",
            sequence,
            1
          );

      if (
        candidate.foodServiceAllowed &&
        candidate
          .marketMeta
          .recommendedVenueTypes
          .length >
        0
      ) {
        property =
          candidate;
        break;
      }
    }

    assert.ok(
      property,
      "expected at least one food-service-compatible generated property"
    );

    for (
      const recommendation
      of property
        .marketMeta
        .recommendedVenueTypes
    ) {
      const compatibility =
        venueTypeSystem
          .evaluatePropertyFit(
            recommendation.id,
            property,
            app.systems
              .districtSystem
              .get(
                property.districtId
              )
          );

      assert.equal(
        compatibility.eligible,
        true,
        recommendation.id
      );
    }

    const card =
      cityPropertyPageSystem
        .buildPropertyCard(
          property
        );

    assert.equal(
      card.template.id,
      property
        .marketMeta
        .templateId
    );

    assert.equal(
      card.template.name,
      property
        .marketMeta
        .templateName
    );

    assert.equal(
      card.propertyFeatures
        .naturalLightScore,
      property
        .marketMeta
        .propertyFeatures
        .naturalLightScore
    );

    assert.equal(
      card.leaseTerms.templateId,
      property
        .marketMeta
        .templateId
    );
  }
);
