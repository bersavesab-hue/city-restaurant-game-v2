import test from "node:test";
import assert from "node:assert/strict";

import {
  SALES_CHANNELS_V1,
  SALES_CHANNEL_DATASET_META
} from "../src/data/salesChannels.v1.js";

import {
  SALES_CHANNEL_IDS,
  validateSalesChannel
} from "../src/data/salesChannelRules.js";

test(
  "正式销售渠道固定堂食自取外卖预约4条",
  () => {
    assert.equal(
      SALES_CHANNEL_DATASET_META.total,
      4
    );

    assert.equal(
      SALES_CHANNELS_V1.length,
      4
    );

    assert.equal(
      new Set(
        SALES_CHANNELS_V1.map(
          item => item.id
        )
      ).size,
      4
    );

    assert.deepEqual(
      new Set(
        SALES_CHANNELS_V1.map(
          item => item.id
        )
      ),
      new Set(
        SALES_CHANNEL_IDS
      )
    );

    for (
      const item
      of SALES_CHANNELS_V1
    ) {
      assert.equal(
        validateSalesChannel(
          item
        ),
        true,
        item.id
      );

      assert.ok(
        item.defaultOrderLimitPerHour >
        0
      );
    }
  }
);

test(
  "四渠道保留既有费用语义并明确是否占用座位",
  () => {
    const byId =
      Object.fromEntries(
        SALES_CHANNELS_V1.map(
          item => [
            item.id,
            item
          ]
        )
      );

    assert.equal(
      byId.dine_in
        .commissionRate,
      0
    );

    assert.equal(
      byId.delivery
        .commissionRate,
      18
    );

    assert.equal(
      byId.delivery
        .packagingCostPerOrder,
      180
    );

    assert.equal(
      byId.pickup
        .onPremiseShare,
      0
    );

    assert.equal(
      byId.delivery
        .onPremiseShare,
      0
    );

    assert.equal(
      byId.dine_in
        .onPremiseShare,
      1
    );

    assert.equal(
      byId.reservation
        .onPremiseShare,
      1
    );
  }
);
