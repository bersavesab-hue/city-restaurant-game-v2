import test from "node:test";
import assert from "node:assert/strict";

import {
  MEMBER_LEVELS_V1,
  MEMBER_PROGRAM_DATASET_META
} from "../src/data/memberLevels.v1.js";

import {
  MEMBER_LEVEL_IDS,
  MEMBER_POINT_POLICY,
  getMemberEnrollmentPropensity,
  validateMemberLevel
} from "../src/data/memberProgramRules.js";

import {
  CUSTOMER_SEGMENTS_V3
} from "../src/data/customerSegments.v3.js";

test(
  "正式会员体系固定4级并保留原会员等级ID",
  () => {
    assert.equal(
      MEMBER_PROGRAM_DATASET_META.levels,
      4
    );

    assert.equal(
      MEMBER_LEVELS_V1.length,
      4
    );

    assert.deepEqual(
      new Set(
        MEMBER_LEVELS_V1.map(
          item => item.id
        )
      ),
      new Set(
        MEMBER_LEVEL_IDS
      )
    );

    for (
      const level
      of MEMBER_LEVELS_V1
    ) {
      assert.equal(
        validateMemberLevel(
          level
        ),
        true,
        level.id
      );
    }
  }
);

test(
  "会员积分规则正式定义有效期兑换价值和优惠上限",
  () => {
    assert.equal(
      MEMBER_POINT_POLICY.expiryDays,
      180
    );

    assert.equal(
      MEMBER_POINT_POLICY.pointValue,
      10
    );

    assert.equal(
      MEMBER_POINT_POLICY.maxRedemptionRate,
      0.2
    );

    assert.equal(
      MEMBER_POINT_POLICY.maxCombinedDiscountRate,
      0.4
    );

    assert.equal(
      MEMBER_POINT_POLICY.downgradeCooldownDays,
      30
    );
  }
);

test(
  "28类正式客群都能计算0到100的入会倾向",
  () => {
    assert.equal(
      CUSTOMER_SEGMENTS_V3.length,
      28
    );

    for (
      const segment
      of CUSTOMER_SEGMENTS_V3
    ) {
      const score =
        getMemberEnrollmentPropensity(
          segment
        );

      assert.ok(
        score >= 0 &&
        score <= 100,
        segment.id
      );
    }

    const byId =
      Object.fromEntries(
        CUSTOMER_SEGMENTS_V3.map(
          item => [
            item.id,
            getMemberEnrollmentPropensity(
              item
            )
          ]
        )
      );

    assert.ok(
      byId.breakfast_commuter >
      byId.tourist
    );
  }
);
