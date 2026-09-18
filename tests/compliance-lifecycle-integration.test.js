import test from "node:test";
import assert from "node:assert/strict";

import {
  gameState
} from "../src/core/GameState.js";

import {
  timeSystem
} from "../src/core/TimeSystem.js";

import {
  entitySystem
} from "../src/core/EntitySystem.js";

import {
  districtSystem
} from "../src/systems/DistrictSystem.js";

import {
  propertySystem
} from "../src/systems/PropertySystem.js";

import {
  restaurantSystem
} from "../src/systems/RestaurantSystem.js";

import {
  financeSystem
} from "../src/systems/FinanceSystem.js";

import {
  renovationSystem
} from "../src/systems/RenovationSystem.js";

import {
  restaurantEquipmentSystem
} from "../src/systems/RestaurantEquipmentSystem.js";

import {
  openingPermitSystem
} from "../src/systems/OpeningPermitSystem.js";

import {
  complianceCenterPageSystem
} from "../src/ui/pages/compliance/ComplianceCenterPageSystem.js";

import {
  ComplianceCenterView
} from "../src/ui/pages/compliance/ComplianceCenterView.js";

function createReadyRestaurant(
  name = "合规测试店"
) {
  gameState.reset();

  districtSystem.load(
    [
      {
        id:
          "compliance_test_district",
        name:
          "合规测试商圈",
        trafficIndex: 70,
        rentMultiplier: 1,
        spendingPower: 65,
        competition: 40
      }
    ],
    {
      overwrite: true
    }
  );

  const property =
    propertySystem.create({
      districtId:
        "compliance_test_district",
      name:
        "合规测试铺位",
      area: 120,
      usableArea: 110,
      baseMonthlyRent: 6000,
      seats: 20,
      depositMonths: 1,
      foodServiceAllowed: true,
      exhaustAllowed: true
    });

  const restaurant =
    restaurantSystem.create({
      name,
      locationId:
        property.id
    });

  financeSystem.createAccount(
    restaurant.id,
    100000
  );

  renovationSystem.initialize(
    restaurant.id
  );

  renovationSystem.placeItem({
    restaurantId:
      restaurant.id,
    furnitureId:
      "table_4",
    x: 0,
    y: 0
  });

  renovationSystem.placeItem({
    restaurantId:
      restaurant.id,
    furnitureId:
      "kitchen_station",
    x: 3,
    y: 0
  });

  renovationSystem.activateLayout(
    restaurant.id
  );

  return {
    restaurant,
    property
  };
}

function submitAndIssue(
  restaurantId
) {
  const submitted =
    openingPermitSystem
      .submitAll(
        restaurantId
      );

  assert.equal(
    submitted.status.pendingCount,
    3
  );

  timeSystem.advance(
    2 * 1440
  );

  const status =
    openingPermitSystem
      .getStatus(
        restaurantId
      );

  assert.equal(
    status.complete,
    true
  );

  return status;
}

test(
  "证照申请真实扣费并经过办理天数后签发",
  () => {
    const {
      restaurant
    } =
      createReadyRestaurant(
        "申请流程测试店"
      );

    const before =
      financeSystem.getBalance(
        restaurant.id
      );

    const submitted =
      openingPermitSystem
        .submitAll(
          restaurant.id
        );

    assert.equal(
      submitted.applications.length,
      3
    );

    assert.equal(
      submitted.status.complete,
      false
    );

    assert.equal(
      financeSystem.getBalance(
        restaurant.id
      ),
      before -
      1700
    );

    timeSystem.advance(
      1440
    );

    let status =
      openingPermitSystem
        .getStatus(
          restaurant.id
        );

    assert.equal(
      status.issuedCount,
      1
    );

    assert.equal(
      status.pendingCount,
      2
    );

    timeSystem.advance(
      1440
    );

    status =
      openingPermitSystem
        .getStatus(
          restaurant.id
        );

    assert.equal(
      status.issuedCount,
      3
    );

    assert.equal(
      status.complete,
      true
    );
  }
);

test(
  "许可进入30天窗口后可以续期并真实扣除续期费用",
  () => {
    const {
      restaurant
    } =
      createReadyRestaurant(
        "续期测试店"
      );

    submitAndIssue(
      restaurant.id
    );

    const record =
      openingPermitSystem
        .getLatestRecord(
          restaurant.id,
          "business_registration"
        );

    const day =
      gameState.getSection(
        "time"
      ).day;

    entitySystem.update(
      "operating_permit",
      record.id,
      {
        expiresDay:
          day + 10
      }
    );

    const before =
      financeSystem.getBalance(
        restaurant.id
      );

    const renewed =
      openingPermitSystem
        .renewPermit(
          restaurant.id,
          "business_registration"
        );

    assert.equal(
      financeSystem.getBalance(
        restaurant.id
      ),
      before - 200
    );

    assert.equal(
      renewed.renewalCount,
      1
    );

    assert.ok(
      renewed.expiresDay >
      day + 10
    );
  }
);

test(
  "设备故障会导致消防抽查整改，逾期升级后暂停营业，修复后恢复",
  () => {
    const {
      restaurant
    } =
      createReadyRestaurant(
        "整改停业测试店"
      );

    submitAndIssue(
      restaurant.id
    );

    const definition =
      restaurantEquipmentSystem
        .getDefinitions({
          storeLevel: 1
        })[0];

    assert.ok(definition);

    const installed =
      restaurantEquipmentSystem
        .install({
          restaurantId:
            restaurant.id,
          equipmentId:
            definition.id,
          quantity: 1
        })
        .units[0];

    entitySystem.update(
      "restaurant_equipment",
      installed.id,
      {
        status:
          "broken",
        durability: 0
      }
    );

    restaurantSystem.open(
      restaurant.id
    );

    const inspected =
      openingPermitSystem
        .runInspection(
          restaurant.id,
          "fire_safety"
        );

    assert.equal(
      inspected.inspection
        .passed,
      false
    );

    assert.equal(
      inspected.violation
        .severity,
      "major"
    );

    assert.equal(
      restaurantSystem.get(
        restaurant.id
      ).status,
      "open"
    );

    const daysToOverdue =
      inspected.violation
        .correctionDueDay -
      gameState.getSection(
        "time"
      ).day +
      1;

    timeSystem.advance(
      daysToOverdue *
      1440
    );

    let violation =
      entitySystem.get(
        "compliance_violation",
        inspected.violation.id
      );

    assert.equal(
      violation.severity,
      "critical"
    );

    assert.equal(
      restaurantSystem.get(
        restaurant.id
      ).status,
      "paused"
    );

    assert.equal(
      restaurantSystem.get(
        restaurant.id
      ).complianceSuspended,
      true
    );

    entitySystem.update(
      "restaurant_equipment",
      installed.id,
      {
        status:
          "active",
        durability:
          installed.maxDurability ??
          100
      }
    );

    openingPermitSystem
      .resolveViolation(
        violation.id
      );

    violation =
      entitySystem.get(
        "compliance_violation",
        violation.id
      );

    assert.equal(
      violation.status,
      "resolved"
    );

    assert.equal(
      restaurantSystem.get(
        restaurant.id
      ).status,
      "open"
    );

    assert.equal(
      restaurantSystem.get(
        restaurant.id
      ).complianceSuspended,
      false
    );
  }
);

test(
  "必要证照过期会形成严重违规并阻止合规完成",
  () => {
    const {
      restaurant
    } =
      createReadyRestaurant(
        "证照过期测试店"
      );

    submitAndIssue(
      restaurant.id
    );

    restaurantSystem.open(
      restaurant.id
    );

    const record =
      openingPermitSystem
        .getLatestRecord(
          restaurant.id,
          "food_service"
        );

    entitySystem.update(
      "operating_permit",
      record.id,
      {
        expiresDay:
          gameState.getSection(
            "time"
          ).day
      }
    );

    timeSystem.advance(
      1440
    );

    const status =
      openingPermitSystem
        .getStatus(
          restaurant.id
        );

    assert.equal(
      status.complete,
      false
    );

    assert.equal(
      status.suspended,
      true
    );

    assert.ok(
      status.openViolations
        .some(
          item =>
            item.source ===
            "permit_expiry" &&
            item.permitKind ===
            "food_service"
        )
    );
  }
);

test(
  "合规中心展示证照续期抽查和整改入口",
  () => {
    const {
      restaurant
    } =
      createReadyRestaurant(
        "合规页面测试店"
      );

    submitAndIssue(
      restaurant.id
    );

    const page =
      complianceCenterPageSystem
        .getPage(
          restaurant.id
        );

    const html =
      new ComplianceCenterView()
        .renderMarkup(
          page
        );

    assert.match(
      html,
      /合规中心/
    );

    assert.match(
      html,
      /证照状态/
    );

    assert.match(
      html,
      /整改与处罚/
    );

    assert.match(
      html,
      /最近抽查/
    );
  }
);
