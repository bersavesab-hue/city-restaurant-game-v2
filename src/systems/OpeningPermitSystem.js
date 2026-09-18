import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  gameState
} from "../core/GameState.js";

import {
  eventBus
} from "../core/EventBus.js";

import {
  restaurantSystem
} from "./RestaurantSystem.js";

import {
  propertySystem
} from "./PropertySystem.js";

import {
  renovationSystem
} from "./RenovationSystem.js";

import {
  restaurantEquipmentSystem
} from "./RestaurantEquipmentSystem.js";

import {
  financeSystem,
  FINANCE_CATEGORY
} from "./FinanceSystem.js";

import {
  menuSystem
} from "./MenuSystem.js";

import {
  recipeSystem
} from "./RecipeSystem.js";

import {
  OPERATING_PERMITS_V1
} from "../data/operatingPermits.v1.js";

import {
  COMPLIANCE_POLICY
} from "../data/operatingPermitRules.js";

const PERMIT_DEFINITIONS =
  OPERATING_PERMITS_V1;

const PERMIT_MAP =
  Object.freeze(
    Object.fromEntries(
      PERMIT_DEFINITIONS.map(
        item => [
          item.permitKind,
          item
        ]
      )
    )
  );

function evaluatePermitRequirements({
  hasLocation,
  foodServiceAllowed,
  renovationActive,
  seats,
  kitchenStations,
  requiresExhaust,
  exhaustAllowed
}) {
  return [
    {
      permitKind:
        "business_registration",

      required:
        true,

      ready:
        Boolean(
          hasLocation
        ),

      reason:
        hasLocation
          ? "经营地址已确定"
          : "尚未完成选址签约"
    },

    {
      permitKind:
        "food_service",

      required:
        true,

      ready:
        Boolean(
          hasLocation &&
          foodServiceAllowed !==
            false
        ),

      reason:
        foodServiceAllowed ===
        false
          ? "该房源不允许餐饮经营"
          : hasLocation
            ? "房源允许餐饮经营"
            : "尚未确定经营房源"
    },

    {
      permitKind:
        "fire_safety",

      required:
        true,

      ready:
        Boolean(
          renovationActive &&
          seats >= 2 &&
          kitchenStations >= 1
        ),

      reason:
        renovationActive
          ? (
              seats >= 2 &&
              kitchenStations >= 1
                ? "装修已经验收并达到基础经营要求"
                : "餐位或厨房工位不足"
            )
          : "装修尚未完工验收"
    },

    {
      permitKind:
        "exhaust",

      required:
        Boolean(
          requiresExhaust
        ),

      ready:
        !requiresExhaust ||
        exhaustAllowed !==
          false,

      reason:
        !requiresExhaust
          ? "当前菜单暂不要求热厨排烟备案"
          : exhaustAllowed ===
            false
            ? "当前菜单涉及热厨，但房源不允许排烟"
            : "热厨排烟条件允许"
    }
  ];
}

function currentDay() {
  return gameState
    .getSection(
      "time"
    ).day;
}

class OpeningPermitSystem {
  constructor() {
    this.started = false;
    this.unsubscribe = null;
    this.start();
  }

  start() {
    if (this.started) {
      return false;
    }

    this.unsubscribe =
      eventBus.on(
        "time:dayChanged",
        payload => {
          const day =
            payload?.current?.day ??
            currentDay();

          this.processDay(
            day
          );
        }
      );

    this.started = true;
    return true;
  }

  getDefinition(
    permitKind
  ) {
    const definition =
      PERMIT_MAP[
        permitKind
      ];

    if (!definition) {
      throw new Error(
        `Unknown operating permit "${permitKind}"`
      );
    }

    return definition;
  }

  listByRestaurant(
    restaurantId
  ) {
    return entitySystem
      .filter(
        "operating_permit",
        item =>
          item.restaurantId ===
          restaurantId
      );
  }

  getLatestRecord(
    restaurantId,
    permitKind
  ) {
    const records =
      this.listByRestaurant(
        restaurantId
      )
      .filter(
        item =>
          item.permitKind ===
          permitKind
      );

    return (
      records[
        records.length - 1
      ] ??
      null
    );
  }

  getIssuedMap(
    restaurantId,
    day = currentDay()
  ) {
    return new Map(
      PERMIT_DEFINITIONS
        .map(
          definition => {
            const record =
              this.getLatestRecord(
                restaurantId,
                definition
                  .permitKind
              );

            if (
              !record ||
              record.status !==
                "issued" ||
              (
                Number.isInteger(
                  record.expiresDay
                ) &&
                record.expiresDay <
                  day
              )
            ) {
              return null;
            }

            return [
              definition
                .permitKind,
              record
            ];
          }
        )
        .filter(Boolean)
    );
  }

  menuRequiresExhaust(
    restaurantId
  ) {
    const items =
      menuSystem
        .listByRestaurant(
          restaurantId,
          {
            activeOnly:
              true
          }
        );

    return items.some(
      item => {
        const recipe =
          recipeSystem.get(
            item.recipeId
          );

        if (!recipe) {
          return false;
        }

        return recipeSystem
          .getOperationalRequirements(
            recipe.id
          )
          .requiresExhaust;
      }
    );
  }

  getRequirementContext(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    let property =
      null;

    if (
      restaurant.locationId
    ) {
      try {
        property =
          propertySystem.get(
            restaurant.locationId
          );
      } catch {
        property =
          null;
      }
    }

    const renovation =
      renovationSystem
        .getSummary(
          restaurantId
        );

    const requiresExhaust =
      this.menuRequiresExhaust(
        restaurantId
      );

    const requirements =
      evaluatePermitRequirements({
        hasLocation:
          Boolean(
            restaurant.locationId
          ),

        foodServiceAllowed:
          property
            ?.foodServiceAllowed,

        renovationActive:
          Boolean(
            renovation.active
          ),

        seats:
          renovation.modifiers
            ?.seats ??
          0,

        kitchenStations:
          renovation.modifiers
            ?.kitchenStations ??
          0,

        requiresExhaust,

        exhaustAllowed:
          property
            ?.exhaustAllowed
      });

    return {
      restaurant,
      property,
      renovation,
      requiresExhaust,
      requirements
    };
  }

  getRequirement(
    restaurantId,
    permitKind
  ) {
    return this
      .getRequirementContext(
        restaurantId
      )
      .requirements
      .find(
        item =>
          item.permitKind ===
          permitKind
      );
  }

  getViolations(
    restaurantId,
    {
      openOnly = false
    } = {}
  ) {
    return entitySystem
      .filter(
        "compliance_violation",
        item =>
          item.restaurantId ===
          restaurantId
      )
      .filter(
        item =>
          !openOnly ||
          item.status ===
            "open"
      )
      .sort(
        (a, b) =>
          b.day -
          a.day
      );
  }

  getInspections(
    restaurantId,
    limit = 20
  ) {
    return entitySystem
      .filter(
        "compliance_inspection",
        item =>
          item.restaurantId ===
          restaurantId
      )
      .sort(
        (a, b) =>
          b.day -
          a.day
      )
      .slice(
        0,
        limit
      );
  }

  getStatus(
    restaurantId
  ) {
    const day =
      currentDay();

    const context =
      this.getRequirementContext(
        restaurantId
      );

    const openViolations =
      this.getViolations(
        restaurantId,
        {
          openOnly: true
        }
      );

    const permits =
      PERMIT_DEFINITIONS
        .map(
          definition => {
            const requirement =
              context.requirements
                .find(
                  item =>
                    item.permitKind ===
                    definition
                      .permitKind
                );

            const record =
              this.getLatestRecord(
                restaurantId,
                definition
                  .permitKind
              );

            const issued =
              Boolean(
                record &&
                record.status ===
                  "issued" &&
                (
                  !Number.isInteger(
                    record.expiresDay
                  ) ||
                  record.expiresDay >=
                    day
                )
              );

            const applicationPending =
              Boolean(
                record &&
                [
                  "submitted",
                  "under_review"
                ].includes(
                  record.status
                )
              );

            const daysUntilExpiry =
              issued &&
              Number.isInteger(
                record.expiresDay
              )
                ? record.expiresDay -
                  day
                : null;

            const renewalDue =
              issued &&
              daysUntilExpiry !==
                null &&
              daysUntilExpiry <=
                COMPLIANCE_POLICY
                  .renewalWindowDays;

            return {
              ...definition,
              ...requirement,

              issued,
              applicationPending,
              renewalDue,
              daysUntilExpiry,

              blockedByViolation:
                openViolations
                  .some(
                    violation =>
                      violation
                        .permitKind ===
                      definition
                        .permitKind
                  ),

              record
            };
          }
        );

    const required =
      permits.filter(
        item =>
          item.required
      );

    const complianceScore =
      Math.max(
        0,
        100 -
        openViolations.reduce(
          (
            total,
            violation
          ) =>
            total +
            (
              COMPLIANCE_POLICY
                .scorePenalty[
                  violation.severity
                ] ??
              0
            ),
          0
        ) -
        required
          .filter(
            item =>
              item.record
                ?.status ===
              "expired"
          )
          .length *
          20
      );

    const blockingViolations =
      openViolations.filter(
        item =>
          item.severity ===
            "critical" ||
          (
            item.severity ===
              "major" &&
            item.correctionDueDay <
              day
          )
      );

    return {
      restaurantId,

      property:
        context.property,

      requiresExhaust:
        context.requiresExhaust,

      permits,

      requiredCount:
        required.length,

      issuedCount:
        required.filter(
          item =>
            item.issued
        ).length,

      pendingCount:
        required.filter(
          item =>
            item.applicationPending
        ).length,

      renewalDueCount:
        required.filter(
          item =>
            item.renewalDue
        ).length,

      allRequirementsReady:
        required.every(
          item =>
            item.ready
        ),

      complete:
        required.every(
          item =>
            item.ready &&
            item.issued
        ) &&
        blockingViolations
          .length ===
          0,

      complianceScore,

      openViolations,
      blockingViolations,

      suspended:
        Boolean(
          context.restaurant
            .complianceSuspended
        ),

      inspections:
        this.getInspections(
          restaurantId,
          10
        )
    };
  }

  submitPermit(
    restaurantId,
    permitKind
  ) {
    restaurantSystem.get(
      restaurantId
    );

    const definition =
      this.getDefinition(
        permitKind
      );

    const requirement =
      this.getRequirement(
        restaurantId,
        permitKind
      );

    if (
      !requirement?.required
    ) {
      throw new Error(
        "当前经营内容不需要该许可"
      );
    }

    if (!requirement.ready) {
      throw new Error(
        `许可条件未满足：${requirement.reason}`
      );
    }

    const existing =
      this.getLatestRecord(
        restaurantId,
        permitKind
      );

    if (
      existing &&
      existing.status ===
        "issued" &&
      (
        !Number.isInteger(
          existing.expiresDay
        ) ||
        existing.expiresDay >=
          currentDay()
      )
    ) {
      return existing;
    }

    if (
      existing &&
      [
        "submitted",
        "under_review"
      ].includes(
        existing.status
      )
    ) {
      return existing;
    }

    financeSystem.expense(
      restaurantId,
      definition.applicationFee,
      FINANCE_CATEGORY.OTHER,
      `证照申请：${definition.name}`
    );

    const day =
      currentDay();

    const record =
      entitySystem.create(
        "operating_permit",
        {
          restaurantId,
          permitKind,

          name:
            definition.name,

          status:
            "under_review",

          appliedDay:
            day,

          reviewReadyDay:
            day +
            definition
              .processingDays,

          issuedDay:
            null,

          expiresDay:
            null,

          nextInspectionDay:
            null,

          applicationFee:
            definition
              .applicationFee,

          renewalCount:
            0,

          lastRenewedDay:
            null,

          rejectedReason:
            null
        }
      );

    eventBus.emit(
      "compliance:applicationSubmitted",
      {
        restaurantId,
        permitKind,
        record:
          structuredClone(
            record
          )
      }
    );

    return record;
  }

  submitAll(
    restaurantId
  ) {
    const status =
      this.getStatus(
        restaurantId
      );

    const blocked =
      status.permits
        .filter(
          item =>
            item.required &&
            !item.ready
        );

    if (
      blocked.length >
      0
    ) {
      throw new Error(
        "许可条件未满足：" +
        blocked
          .map(
            item =>
              item.name
          )
          .join("、")
      );
    }

    const applications = [];

    for (
      const permit
      of status.permits
    ) {
      if (
        !permit.required ||
        permit.issued ||
        permit.applicationPending
      ) {
        continue;
      }

      applications.push(
        this.submitPermit(
          restaurantId,
          permit.permitKind
        )
      );
    }

    return {
      applications,
      status:
        this.getStatus(
          restaurantId
        )
    };
  }

  issueAll(
    restaurantId
  ) {
    return this.submitAll(
      restaurantId
    );
  }

  issueRecord(
    record,
    day
  ) {
    const definition =
      this.getDefinition(
        record.permitKind
      );

    const issued =
      entitySystem.update(
        "operating_permit",
        record.id,
        {
          status:
            "issued",

          issuedDay:
            day,

          expiresDay:
            day +
            definition
              .validityDays -
            1,

          nextInspectionDay:
            day +
            definition
              .inspectionIntervalDays,

          rejectedReason:
            null
        }
      );

    eventBus.emit(
      "compliance:permitIssued",
      {
        restaurantId:
          record.restaurantId,
        permitKind:
          record.permitKind,
        record:
          structuredClone(
            issued
          )
      }
    );

    return issued;
  }

  processApplications(
    restaurantId,
    day = currentDay()
  ) {
    const pending =
      this.listByRestaurant(
        restaurantId
      )
      .filter(
        item =>
          [
            "submitted",
            "under_review"
          ].includes(
            item.status
          ) &&
          item.reviewReadyDay <=
            day
      );

    const issued = [];
    const rejected = [];

    for (
      const record
      of pending
    ) {
      const requirement =
        this.getRequirement(
          restaurantId,
          record.permitKind
        );

      if (
        requirement?.required &&
        requirement.ready
      ) {
        issued.push(
          this.issueRecord(
            record,
            day
          )
        );
      } else {
        const updated =
          entitySystem.update(
            "operating_permit",
            record.id,
            {
              status:
                "rejected",

              rejectedDay:
                day,

              rejectedReason:
                requirement?.reason ??
                "经营条件已发生变化"
            }
          );

        rejected.push(
          updated
        );

        eventBus.emit(
          "compliance:applicationRejected",
          {
            restaurantId,
            permitKind:
              record.permitKind,
            record:
              structuredClone(
                updated
              )
          }
        );
      }
    }

    return {
      issued,
      rejected
    };
  }

  renewPermit(
    restaurantId,
    permitKind
  ) {
    const definition =
      this.getDefinition(
        permitKind
      );

    let record =
      this.getLatestRecord(
        restaurantId,
        permitKind
      );

    if (
      !record ||
      ![
        "issued",
        "expired"
      ].includes(
        record.status
      )
    ) {
      throw new Error(
        "没有可续期的许可"
      );
    }

    const day =
      currentDay();

    const due =
      record.status ===
        "expired" ||
      (
        Number.isInteger(
          record.expiresDay
        ) &&
        record.expiresDay -
          day <=
          COMPLIANCE_POLICY
            .renewalWindowDays
      );

    if (!due) {
      throw new Error(
        "当前许可尚未进入续期窗口"
      );
    }

    const requirement =
      this.getRequirement(
        restaurantId,
        permitKind
      );

    if (
      requirement?.required &&
      !requirement.ready
    ) {
      throw new Error(
        `续期条件未满足：${requirement.reason}`
      );
    }

    financeSystem.expense(
      restaurantId,
      definition.renewalFee,
      FINANCE_CATEGORY.OTHER,
      `证照续期：${definition.name}`
    );

    record =
      entitySystem.update(
        "operating_permit",
        record.id,
        {
          status:
            "issued",

          issuedDay:
            record.issuedDay ??
            day,

          expiresDay:
            Math.max(
              day,
              record.expiresDay ??
              day
            ) +
            definition
              .validityDays,

          nextInspectionDay:
            day +
            definition
              .inspectionIntervalDays,

          renewalCount:
            (
              record
                .renewalCount ??
              0
            ) +
            1,

          lastRenewedDay:
            day
        }
      );

    eventBus.emit(
      "compliance:permitRenewed",
      {
        restaurantId,
        permitKind,
        record:
          structuredClone(
            record
          )
      }
    );

    return record;
  }

  getEquipmentRisk(
    restaurantId
  ) {
    const equipment =
      restaurantEquipmentSystem
        .list(
          restaurantId
        );

    const active =
      equipment.filter(
        item =>
          item.status !==
            "retired"
      );

    const broken =
      active.filter(
        item =>
          item.status ===
            "broken" ||
          item.durability <= 0
      );

    const highRisk =
      active.filter(
        item =>
          item.durability > 0 &&
          item.durability /
            Math.max(
              1,
              item.maxDurability ??
              100
            ) <=
            0.25
      );

    return {
      installed:
        active.length,
      broken:
        broken.length,
      highRisk:
        highRisk.length
    };
  }

  evaluateInspection(
    restaurantId,
    permitKind
  ) {
    const record =
      this.getLatestRecord(
        restaurantId,
        permitKind
      );

    if (
      !record ||
      record.status !==
        "issued"
    ) {
      return {
        passed: false,
        severity:
          "critical",
        reason:
          "必要许可未处于有效签发状态"
      };
    }

    const day =
      currentDay();

    if (
      Number.isInteger(
        record.expiresDay
      ) &&
      record.expiresDay <
        day
    ) {
      return {
        passed: false,
        severity:
          "critical",
        reason:
          "许可已经过期"
      };
    }

    const requirement =
      this.getRequirement(
        restaurantId,
        permitKind
      );

    if (
      requirement?.required &&
      !requirement.ready
    ) {
      return {
        passed: false,
        severity:
          (
            permitKind ===
              "business_registration" ||
            permitKind ===
              "fire_safety" ||
            permitKind ===
              "exhaust"
          )
            ? "critical"
            : "major",
        reason:
          requirement.reason
      };
    }

    const equipment =
      this.getEquipmentRisk(
        restaurantId
      );

    if (
      permitKind ===
        "fire_safety" &&
      equipment.broken > 0
    ) {
      return {
        passed: false,
        severity:
          "major",
        reason:
          `发现${equipment.broken}台故障设备未处理`
      };
    }

    if (
      (
        permitKind ===
          "fire_safety" ||
        permitKind ===
          "food_service"
      ) &&
      equipment.highRisk > 0
    ) {
      return {
        passed: false,
        severity:
          "minor",
        reason:
          `发现${equipment.highRisk}台设备处于严重老化区间`
      };
    }

    return {
      passed: true,
      severity: null,
      reason:
        "本次抽查通过"
    };
  }

  applyFine(
    restaurantId,
    severity,
    permitKind
  ) {
    const fine =
      COMPLIANCE_POLICY
        .fines[
          severity
        ] ??
      0;

    if (
      fine <= 0
    ) {
      return {
        fine: 0,
        paid: true,
        transactionId:
          null
      };
    }

    try {
      const payment =
        financeSystem.expense(
          restaurantId,
          fine,
          FINANCE_CATEGORY.OTHER,
          `合规处罚：${permitKind}`
        );

      return {
        fine,
        paid: true,
        transactionId:
          payment
            ?.transaction?.id ??
          null
      };
    } catch {
      return {
        fine,
        paid: false,
        transactionId:
          null
      };
    }
  }

  suspendForCompliance(
    restaurantId,
    violationId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    if (
      restaurant
        .complianceSuspended
    ) {
      return restaurant;
    }

    const previousStatus =
      restaurant.status;

    if (
      restaurant.status ===
        "open"
    ) {
      restaurantSystem.pause(
        restaurantId
      );
    }

    return entitySystem.update(
      "restaurant",
      restaurantId,
      {
        complianceSuspended:
          true,

        complianceViolationId:
          violationId,

        compliancePreviousStatus:
          previousStatus
      }
    );
  }

  createViolation({
    restaurantId,
    permitKind,
    severity,
    reason,
    source = "inspection",
    day = currentDay()
  }) {
    const duplicate =
      this.getViolations(
        restaurantId,
        {
          openOnly: true
        }
      )
      .find(
        item =>
          item.permitKind ===
            permitKind &&
          item.source ===
            source &&
          item.reason ===
            reason
      );

    if (duplicate) {
      return duplicate;
    }

    const fineResult =
      this.applyFine(
        restaurantId,
        severity,
        permitKind
      );

    const correctionDays =
      COMPLIANCE_POLICY
        .correctionDays[
          severity
        ] ??
      7;

    const violation =
      entitySystem.create(
        "compliance_violation",
        {
          restaurantId,
          permitKind,
          severity,
          reason,
          source,

          day,

          correctionDueDay:
            day +
            correctionDays,

          fine:
            fineResult.fine,

          finePaid:
            fineResult.paid,

          fineTransactionId:
            fineResult
              .transactionId,

          status:
            "open",

          resolvedDay:
            null
        }
      );

    if (
      severity ===
        "critical"
    ) {
      this.suspendForCompliance(
        restaurantId,
        violation.id
      );
    }

    eventBus.emit(
      "compliance:violationCreated",
      {
        restaurantId,
        violation:
          structuredClone(
            violation
          )
      }
    );

    return violation;
  }

  runInspection(
    restaurantId,
    permitKind
  ) {
    const definition =
      this.getDefinition(
        permitKind
      );

    const day =
      currentDay();

    const result =
      this.evaluateInspection(
        restaurantId,
        permitKind
      );

    const inspection =
      entitySystem.create(
        "compliance_inspection",
        {
          restaurantId,
          permitKind,

          day,

          passed:
            result.passed,

          severity:
            result.severity,

          reason:
            result.reason
        }
      );

    const record =
      this.getLatestRecord(
        restaurantId,
        permitKind
      );

    if (
      record &&
      record.status ===
        "issued"
    ) {
      entitySystem.update(
        "operating_permit",
        record.id,
        {
          lastInspectionDay:
            day,

          nextInspectionDay:
            day +
            definition
              .inspectionIntervalDays
        }
      );
    }

    let violation = null;

    if (!result.passed) {
      violation =
        this.createViolation({
          restaurantId,
          permitKind,
          severity:
            result.severity,
          reason:
            result.reason,
          source:
            "inspection",
          day
        });
    }

    eventBus.emit(
      "compliance:inspectionCompleted",
      {
        restaurantId,
        inspection:
          structuredClone(
            inspection
          ),
        violation:
          violation
            ? structuredClone(
                violation
              )
            : null
      }
    );

    return {
      inspection,
      violation
    };
  }

  resolveViolation(
    violationId
  ) {
    const violation =
      entitySystem.get(
        "compliance_violation",
        violationId
      );

    if (!violation) {
      throw new Error(
        "Compliance violation does not exist"
      );
    }

    if (
      violation.status ===
        "resolved"
    ) {
      return violation;
    }

    const inspection =
      this.evaluateInspection(
        violation.restaurantId,
        violation.permitKind
      );

    if (!inspection.passed) {
      throw new Error(
        `整改条件仍未满足：${inspection.reason}`
      );
    }

    const day =
      currentDay();

    const resolved =
      entitySystem.update(
        "compliance_violation",
        violation.id,
        {
          status:
            "resolved",

          resolvedDay:
            day
        }
      );

    const remaining =
      this.getViolations(
        violation.restaurantId,
        {
          openOnly: true
        }
      );

    if (
      remaining.length ===
      0
    ) {
      const restaurant =
        restaurantSystem.get(
          violation.restaurantId
        );

      const previousStatus =
        restaurant
          .compliancePreviousStatus;

      entitySystem.update(
        "restaurant",
        violation.restaurantId,
        {
          complianceSuspended:
            false,

          complianceViolationId:
            null,

          compliancePreviousStatus:
            null
        }
      );

      if (
        restaurant.status ===
          "paused" &&
        previousStatus ===
          "open"
      ) {
        restaurantSystem.resume(
          violation.restaurantId
        );
      }
    }

    eventBus.emit(
      "compliance:violationResolved",
      {
        restaurantId:
          violation.restaurantId,
        violation:
          structuredClone(
            resolved
          )
      }
    );

    return resolved;
  }

  expireDuePermits(
    restaurantId,
    day = currentDay(),
    {
      createViolation = true
    } = {}
  ) {
    const expired = [];

    for (
      const definition
      of PERMIT_DEFINITIONS
    ) {
      const record =
        this.getLatestRecord(
          restaurantId,
          definition
            .permitKind
        );

      if (
        !record ||
        record.status !==
          "issued" ||
        !Number.isInteger(
          record.expiresDay
        ) ||
        record.expiresDay >=
          day
      ) {
        continue;
      }

      const updated =
        entitySystem.update(
          "operating_permit",
          record.id,
          {
            status:
              "expired",

            expiredDay:
              day
          }
        );

      expired.push(
        updated
      );

      if (
        createViolation
      ) {
        const requirement =
          this.getRequirement(
            restaurantId,
            definition
              .permitKind
          );

        if (
          requirement?.required
        ) {
          this.createViolation({
            restaurantId,
            permitKind:
              definition
                .permitKind,
            severity:
              "critical",
            reason:
              `${definition.name}已过期`,
            source:
              "permit_expiry",
            day
          });
        }
      }

      eventBus.emit(
        "compliance:permitExpired",
        {
          restaurantId,
          permitKind:
            definition
              .permitKind,
          record:
            structuredClone(
              updated
            )
        }
      );
    }

    return expired;
  }

  processScheduledInspections(
    restaurantId,
    day = currentDay()
  ) {
    const results = [];

    for (
      const definition
      of PERMIT_DEFINITIONS
    ) {
      const record =
        this.getLatestRecord(
          restaurantId,
          definition
            .permitKind
        );

      if (
        !record ||
        record.status !==
          "issued" ||
        !Number.isInteger(
          record.nextInspectionDay
        ) ||
        record.nextInspectionDay >
          day
      ) {
        continue;
      }

      results.push(
        this.runInspection(
          restaurantId,
          definition
            .permitKind
        )
      );
    }

    return results;
  }

  processOverdueViolations(
    restaurantId,
    day = currentDay()
  ) {
    const escalated = [];

    for (
      const violation
      of this.getViolations(
        restaurantId,
        {
          openOnly: true
        }
      )
    ) {
      if (
        violation
          .correctionDueDay >=
          day ||
        violation.severity ===
          "critical"
      ) {
        continue;
      }

      const fineResult =
        this.applyFine(
          restaurantId,
          "critical",
          violation.permitKind
        );

      const updated =
        entitySystem.update(
          "compliance_violation",
          violation.id,
          {
            severity:
              "critical",

            escalatedDay:
              day,

            fine:
              (
                violation.fine ??
                0
              ) +
              fineResult.fine,

            finePaid:
              Boolean(
                violation.finePaid &&
                fineResult.paid
              ),

            correctionDueDay:
              day +
              COMPLIANCE_POLICY
                .correctionDays
                .critical
          }
        );

      this.suspendForCompliance(
        restaurantId,
        updated.id
      );

      escalated.push(
        updated
      );
    }

    return escalated;
  }

  processRestaurantDay(
    restaurantId,
    day = currentDay()
  ) {
    const applications =
      this.processApplications(
        restaurantId,
        day
      );

    const expired =
      this.expireDuePermits(
        restaurantId,
        day
      );

    const inspections =
      this.processScheduledInspections(
        restaurantId,
        day
      );

    const escalated =
      this.processOverdueViolations(
        restaurantId,
        day
      );

    return {
      restaurantId,
      applications,
      expired,
      inspections,
      escalated
    };
  }

  processDay(
    day = currentDay()
  ) {
    const results = [];

    for (
      const restaurant
      of restaurantSystem.list()
    ) {
      results.push(
        this.processRestaurantDay(
          restaurant.id,
          day
        )
      );
    }

    return {
      day,
      restaurants:
        results
    };
  }

  getDashboard(
    restaurantId
  ) {
    return this.getStatus(
      restaurantId
    );
  }
}

export const openingPermitSystem =
  new OpeningPermitSystem();

export {
  OpeningPermitSystem,
  PERMIT_DEFINITIONS,
  evaluatePermitRequirements
};
