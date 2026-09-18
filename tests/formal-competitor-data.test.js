import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  randomSystem
} from "../src/core/RandomSystem.js";

import {
  COMPETITOR_TEMPLATES_V1,
  COMPETITOR_TEMPLATE_DATASET_META
} from "../src/data/competitorTemplates.v1.js";

import {
  COMPETITOR_NAME_POOL_V1,
  COMPETITOR_NAME_DATASET_META
} from "../src/data/competitorNames.v1.js";

import {
  validateCompetitorTemplate
} from "../src/data/competitorRules.js";

import {
  CITY_DISTRICTS_V2
} from "../src/data/cityDistricts.v2.js";

import {
  CUSTOMER_SEGMENTS_V3
} from "../src/data/customerSegments.v3.js";

import {
  VENUE_TYPES_V2
} from "../src/data/venueTypes.v2.js";

import { app } from "../src/main.js";

const {
  marketCompetitionSystem,
  competitorDynamicsSystem,
  districtSystem
} = app.systems;

test(
  "正式竞争店包固定30个模板和300个唯一名称",
  () => {
    assert.equal(
      COMPETITOR_TEMPLATE_DATASET_META.total,
      30
    );

    assert.equal(
      COMPETITOR_TEMPLATES_V1.length,
      30
    );

    assert.equal(
      new Set(
        COMPETITOR_TEMPLATES_V1.map(
          item => item.id
        )
      ).size,
      30
    );

    assert.equal(
      COMPETITOR_NAME_DATASET_META.total,
      300
    );

    assert.equal(
      COMPETITOR_NAME_POOL_V1.length,
      300
    );

    assert.equal(
      new Set(
        COMPETITOR_NAME_POOL_V1
      ).size,
      300
    );

    for (
      const template
      of COMPETITOR_TEMPLATES_V1
    ) {
      assert.equal(
        validateCompetitorTemplate(
          template
        ),
        true,
        template.id
      );
    }
  }
);

test(
  "竞争模板只引用正式商圈客群和业态ID",
  () => {
    const districts =
      new Set(
        CITY_DISTRICTS_V2.map(
          item => item.id
        )
      );

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

    for (
      const template
      of COMPETITOR_TEMPLATES_V1
    ) {
      for (
        const districtId
        of Object.keys(
          template.districtWeights
        )
      ) {
        assert.ok(
          districts.has(
            districtId
          ),
          `${template.id} -> district ${districtId}`
        );
      }

      for (
        const segmentId
        of Object.keys(
          template.segmentWeights
        )
      ) {
        assert.ok(
          segments.has(
            segmentId
          ),
          `${template.id} -> segment ${segmentId}`
        );
      }

      for (
        const venueId
        of template.venueTypeFocus
      ) {
        assert.ok(
          venues.has(
            venueId
          ),
          `${template.id} -> venue ${venueId}`
        );
      }
    }
  }
);

test(
  "商圈权重真实改变竞争模板分布",
  () => {
    assert.ok(
      marketCompetitionSystem
        .getTemplateWeight(
          "campus_value_bowl",
          "university"
        ) >
      marketCompetitionSystem
        .getTemplateWeight(
          "campus_value_bowl",
          "cbd"
        )
    );

    assert.ok(
      marketCompetitionSystem
        .getTemplateWeight(
          "office_quick_meal",
          "office_park"
        ) >
      marketCompetitionSystem
        .getTemplateWeight(
          "office_quick_meal",
          "suburban_resort"
        )
    );

    const distribution =
      marketCompetitionSystem
        .getTemplateDistribution(
          "commercial_core"
        );

    assert.equal(
      distribution.length,
      30
    );

    const share =
      distribution.reduce(
        (sum, item) =>
          sum + item.share,
        0
      );

    assert.ok(
      Math.abs(
        share - 1
      ) <
      0.000001
    );
  }
);

test(
  "正式商圈会生成带模板实力和经营倾向的竞争店",
  () => {
    gameState.reset();

    randomSystem.setSeed(
      "formal-competitor-data"
    );

    const stores =
      marketCompetitionSystem
        .ensureDistrict(
          "commercial_core"
        );

    assert.equal(
      stores.length,
      marketCompetitionSystem
        .getTargetCount(
          districtSystem.get(
            "commercial_core"
          )
        )
    );

    assert.equal(
      new Set(
        stores.map(
          item => item.name
        )
      ).size,
      stores.length
    );

    for (const store of stores) {
      assert.ok(
        marketCompetitionSystem
          .getTemplate(
            store.templateId
          )
      );

      assert.ok(
        COMPETITOR_NAME_POOL_V1
          .includes(
            store.name
          )
      );

      assert.ok(
        store.strengthTier >= 1 &&
        store.strengthTier <= 5
      );

      assert.ok(
        Number.isFinite(
          store.marketingTendency
        )
      );

      assert.ok(
        Number.isFinite(
          store.expansionTendency
        )
      );

      assert.ok(
        Number.isFinite(
          store.resilience
        )
      );
    }
  }
);

test(
  "抗风险会改变倒闭阈值且强店可以生成新分店",
  () => {
    assert.equal(
      competitorDynamicsSystem
        .getClosureThreshold({
          resilience: 0
        }),
      20
    );

    assert.equal(
      competitorDynamicsSystem
        .getClosureThreshold({
          resilience: 100
        }),
      40
    );

    gameState.reset();

    const parent =
      marketCompetitionSystem
        .create({
          districtId:
            "old_town",
          name:
            "扩张测试总店",
          priceIndex: 1,
          qualityScore: 88,
          reputation: 86,
          serviceScore: 84,
          strengthTier: 5,
          expansionTendency: 90,
          resilience: 80,
          brandName:
            "扩张测试总店"
        });

    const branch =
      competitorDynamicsSystem
        .createExpansion(
          parent,
          150
        );

    assert.equal(
      branch.parentCompetitorId,
      parent.id
    );

    assert.equal(
      branch.branchNumber,
      2
    );

    assert.equal(
      branch.expansionGeneration,
      1
    );

    assert.equal(
      branch.active,
      true
    );
  }
);
