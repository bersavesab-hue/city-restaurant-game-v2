import test from "node:test";
import assert from "node:assert/strict";

import {
  OPERATING_PERMITS_V1,
  OPERATING_PERMIT_DATASET_META
} from "../src/data/operatingPermits.v1.js";

import {
  OPERATING_PERMIT_KINDS,
  COMPLIANCE_POLICY,
  validateOperatingPermitDefinition
} from "../src/data/operatingPermitRules.js";

test(
  "正式合规体系固定4类核心证照并保留既有ID",
  () => {
    assert.equal(
      OPERATING_PERMIT_DATASET_META.total,
      4
    );

    assert.equal(
      OPERATING_PERMITS_V1.length,
      4
    );

    assert.deepEqual(
      new Set(
        OPERATING_PERMITS_V1.map(
          item => item.permitKind
        )
      ),
      new Set(
        OPERATING_PERMIT_KINDS
      )
    );

    for (
      const item
      of OPERATING_PERMITS_V1
    ) {
      assert.equal(
        validateOperatingPermitDefinition(
          item
        ),
        true,
        item.permitKind
      );

      assert.ok(
        item.processingDays >= 1
      );

      assert.ok(
        item.validityDays >= 30
      );

      assert.ok(
        item.inspectionIntervalDays >
        0
      );
    }
  }
);

test(
  "整改期限罚款和合规扣分规则完整",
  () => {
    assert.equal(
      COMPLIANCE_POLICY
        .renewalWindowDays,
      30
    );

    assert.ok(
      COMPLIANCE_POLICY
        .fines.critical >
      COMPLIANCE_POLICY
        .fines.major
    );

    assert.ok(
      COMPLIANCE_POLICY
        .scorePenalty.critical >
      COMPLIANCE_POLICY
        .scorePenalty.minor
    );
  }
);
