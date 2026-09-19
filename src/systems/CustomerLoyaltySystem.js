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
  customerSystem
} from "./CustomerSystem.js";

import {
  restaurantSystem
} from "./RestaurantSystem.js";

import {
  customerSegmentSystem
} from "./CustomerSegmentSystem.js";

import {
  MEMBER_LEVELS_V1
} from "../data/memberLevels.v1.js";

import {
  CUSTOMER_SEGMENTS_V3
} from "../data/customerSegments.v3.js";

import {
  MEMBER_POINT_POLICY,
  MEMBER_IDENTITY_POLICY,
  getMemberEnrollmentPropensity
} from "../data/memberProgramRules.js";

const MEMBER_LEVELS =
  MEMBER_LEVELS_V1;

function clamp(
  value,
  min,
  max
) {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
}

function requirePositiveInteger(
  value,
  name
) {
  if (
    !Number.isInteger(value) ||
    value < 0
  ) {
    throw new RangeError(
      `${name} must be a non-negative integer`
    );
  }
}

function currentDay() {
  return gameState
    .getSection(
      "time"
    ).day;
}

class CustomerLoyaltySystem {
  getLevelByStats({
    visits = 0,
    totalSpend = 0,
    points = 0,
    lifetimePoints = null
  }) {
    let result =
      MEMBER_LEVELS[0];

    const qualificationPoints =
      lifetimePoints ??
      points;

    for (
      const level
      of MEMBER_LEVELS
    ) {
      if (
        visits >=
          level.minVisits &&
        totalSpend >=
          level.minSpend &&
        qualificationPoints >=
          level.minLifetimePoints
      ) {
        result = level;
      }
    }

    return result;
  }

  getLevel(id) {
    return (
      MEMBER_LEVELS.find(
        item =>
          item.id === id
      ) ?? null
    );
  }

  getLevels() {
    return structuredClone(
      MEMBER_LEVELS
    );
  }

  getLevelIndex(id) {
    return MEMBER_LEVELS
      .findIndex(
        item =>
          item.id === id
      );
  }

  getEnrollmentPropensity(
    segmentId
  ) {
    if (!segmentId) {
      return 50;
    }

    let segment = null;

    try {
      segment =
        customerSegmentSystem.get(
          segmentId
        );
    } catch {
      segment = null;
    }

    if (!segment) {
      segment =
        CUSTOMER_SEGMENTS_V3
          .find(
            item =>
              item.id ===
              segmentId
          ) ??
        null;
    }

    return segment
      ? getMemberEnrollmentPropensity(
          segment
        )
      : 50;
  }

  shouldAutoEnroll({
    segmentId,
    satisfaction,
    spend = 0,
    recognizedVisits = 0
  }) {
    const repeatVisits =
      Math.max(
        0,
        Math.floor(
          Number(
            recognizedVisits
          ) ||
          0
        )
      );

    const repeatBonus =
      Math.min(
        MEMBER_IDENTITY_POLICY
          .maxEnrollmentRepeatBonus,
        Math.max(
          0,
          repeatVisits - 1
        ) *
        MEMBER_IDENTITY_POLICY
          .enrollmentRepeatBonusPerVisit
      );

    return (
      this.getEnrollmentPropensity(
        segmentId
      ) +
        repeatBonus >=
        MEMBER_POINT_POLICY
          .enrollmentThreshold &&
      Number(
        satisfaction
      ) >=
        MEMBER_POINT_POLICY
          .enrollmentMinSatisfaction &&
      Number(
        spend
      ) > 0
    );
  }

  findMember(
    restaurantId,
    customerId
  ) {
    return (
      entitySystem
        .filter(
          "member_profile",
          item =>
            item.restaurantId ===
              restaurantId &&
            item.customerId ===
              customerId
        )[0] ?? null
    );
  }

  enrollMember({
    restaurantId,
    customerId,
    segmentId = null,
    source = "manual"
  }) {
    restaurantSystem.get(
      restaurantId
    );

    customerSystem.get(
      customerId
    );

    const existing =
      this.findMember(
        restaurantId,
        customerId
      );

    if (existing) {
      return existing;
    }

    const day =
      currentDay();

    const member =
      entitySystem.create(
        "member_profile",
        {
          restaurantId,
          customerId,
          segmentId,

          joinedDay: day,
          enrollmentSource:
            source,

          lastVisitDay: null,

          visits: 0,
          repeatVisits: 0,

          totalSpend: 0,
          averageSpend: 0,
          averageSatisfaction: 0,

          points: 0,
          lifetimePoints: 0,
          lifetimeRedeemedPoints: 0,
          lifetimeExpiredPoints: 0,

          levelId: "member",
          highestLevelId: "member",
          lastLevelChangeDay:
            day,

          favoriteDishCounts: {},

          lastOrderId: null
        }
      );

    eventBus.emit(
      "member:enrolled",
      {
        restaurantId,
        customerId,
        memberId:
          member.id,
        segmentId,
        source
      }
    );

    return member;
  }

  listPointLots(
    memberProfileId
  ) {
    return entitySystem
      .filter(
        "member_point_lot",
        item =>
          item.memberProfileId ===
            memberProfileId
      )
      .sort(
        (a, b) =>
          a.expiresDay -
            b.expiresDay ||
          a.earnedDay -
            b.earnedDay
      );
  }

  ensurePointLedger(
    member
  ) {
    const lots =
      this.listPointLots(
        member.id
      );

    if (
      lots.length === 0 &&
      (
        member.points ??
        0
      ) > 0
    ) {
      const day =
        currentDay();

      entitySystem.create(
        "member_point_lot",
        {
          memberProfileId:
            member.id,
          restaurantId:
            member.restaurantId,
          customerId:
            member.customerId,

          source:
            "legacy_migration",

          earnedPoints:
            member.points,

          remainingPoints:
            member.points,

          earnedDay:
            day,

          expiresDay:
            day +
            MEMBER_POINT_POLICY
              .expiryDays -
            1,

          status:
            "active"
        }
      );
    }

    return this.listPointLots(
      member.id
    );
  }

  expirePointsForMember(
    memberOrRestaurantId,
    customerId = null,
    day = currentDay()
  ) {
    let member =
      typeof memberOrRestaurantId ===
        "object"
        ? memberOrRestaurantId
        : this.findMember(
            memberOrRestaurantId,
            customerId
          );

    if (!member) {
      return null;
    }

    this.ensurePointLedger(
      member
    );

    let expired = 0;

    for (
      const lot
      of this.listPointLots(
        member.id
      )
    ) {
      if (
        lot.status ===
          "active" &&
        lot.remainingPoints > 0 &&
        lot.expiresDay <
          day
      ) {
        expired +=
          lot.remainingPoints;

        entitySystem.update(
          "member_point_lot",
          lot.id,
          {
            remainingPoints: 0,
            status: "expired",
            expiredDay: day
          }
        );
      }
    }

    if (
      expired >
      0
    ) {
      member =
        entitySystem.update(
          "member_profile",
          member.id,
          {
            points:
              Math.max(
                0,
                (
                  member.points ??
                  0
                ) -
                expired
              ),

            lifetimeExpiredPoints:
              (
                member
                  .lifetimeExpiredPoints ??
                0
              ) +
              expired
          }
        );

      eventBus.emit(
        "member:pointsExpired",
        {
          restaurantId:
            member.restaurantId,
          customerId:
            member.customerId,
          memberId:
            member.id,
          expiredPoints:
            expired,
          day
        }
      );
    }

    return member;
  }

  redeemPoints({
    restaurantId,
    customerId,
    points
  }) {
    requirePositiveInteger(
      points,
      "points"
    );

    if (
      points === 0
    ) {
      return {
        pointsUsed: 0,
        remainingPoints:
          this.findMember(
            restaurantId,
            customerId
          )?.points ??
          0
      };
    }

    let member =
      this.findMember(
        restaurantId,
        customerId
      );

    if (!member) {
      throw new Error(
        "Customer is not a member of this restaurant"
      );
    }

    member =
      this.expirePointsForMember(
        member
      );

    if (
      points >
      member.points
    ) {
      throw new Error(
        "Insufficient member points"
      );
    }

    let remaining =
      points;

    for (
      const lot
      of this.listPointLots(
        member.id
      )
    ) {
      if (
        remaining <= 0
      ) {
        break;
      }

      if (
        lot.status !==
          "active" ||
        lot.remainingPoints <=
          0
      ) {
        continue;
      }

      const used =
        Math.min(
          remaining,
          lot.remainingPoints
        );

      const lotRemaining =
        lot.remainingPoints -
        used;

      entitySystem.update(
        "member_point_lot",
        lot.id,
        {
          remainingPoints:
            lotRemaining,
          status:
            lotRemaining > 0
              ? "active"
              : "redeemed",
          redeemedDay:
            lotRemaining > 0
              ? lot.redeemedDay ??
                null
              : currentDay()
        }
      );

      remaining -=
        used;
    }

    const updated =
      entitySystem.update(
        "member_profile",
        member.id,
        {
          points:
            member.points -
            points,

          lifetimeRedeemedPoints:
            (
              member
                .lifetimeRedeemedPoints ??
              0
            ) +
            points
        }
      );

    eventBus.emit(
      "member:pointsRedeemed",
      {
        restaurantId,
        customerId,
        memberId:
          member.id,
        pointsUsed:
          points,
        remainingPoints:
          updated.points
      }
    );

    return {
      pointsUsed:
        points,
      remainingPoints:
        updated.points
    };
  }

  recordMemberVisit({
    restaurantId,
    customerId,
    spend,
    satisfaction,
    orderId = null,
    dishIds = [],
    segmentId = null
  }) {
    requirePositiveInteger(
      spend,
      "spend"
    );

    if (
      !Number.isFinite(
        satisfaction
      )
    ) {
      throw new TypeError(
        "satisfaction must be a number"
      );
    }

    satisfaction =
      clamp(
        satisfaction,
        0,
        100
      );

    let member =
      this.findMember(
        restaurantId,
        customerId
      );

    if (!member) {
      member =
        this.enrollMember({
          restaurantId,
          customerId,
          segmentId
        });
    }

    member =
      this.expirePointsForMember(
        member
      );

    const visits =
      member.visits + 1;

    const totalSpend =
      member.totalSpend +
      spend;

    const currentLevel =
      this.getLevel(
        member.levelId
      ) ??
      MEMBER_LEVELS[0];

    const earnedPoints =
      Math.max(
        0,
        Math.floor(
          spend /
          MEMBER_POINT_POLICY
            .earnPerAmount *
          currentLevel
            .pointMultiplier
        )
      );

    const points =
      member.points +
      earnedPoints;

    const lifetimePoints =
      member.lifetimePoints +
      earnedPoints;

    const averageSatisfaction =
      Math.round(
        (
          member
            .averageSatisfaction *
            member.visits +
          satisfaction
        ) /
        visits
      );

    const favoriteDishCounts = {
      ...member
        .favoriteDishCounts
    };

    for (
      const dishId
      of dishIds
    ) {
      if (
        typeof dishId !==
          "string" ||
        dishId.trim() === ""
      ) {
        continue;
      }

      favoriteDishCounts[
        dishId
      ] =
        (
          favoriteDishCounts[
            dishId
          ] ?? 0
        ) + 1;
    }

    const nextLevel =
      this.getLevelByStats({
        visits,
        totalSpend,
        lifetimePoints
      });

    const day =
      currentDay();

    if (
      earnedPoints >
      0
    ) {
      entitySystem.create(
        "member_point_lot",
        {
          memberProfileId:
            member.id,
          restaurantId,
          customerId,

          source:
            "purchase",

          orderId,

          earnedPoints,

          remainingPoints:
            earnedPoints,

          earnedDay:
            day,

          expiresDay:
            day +
            MEMBER_POINT_POLICY
              .expiryDays -
            1,

          status:
            "active"
        }
      );
    }

    const currentHighestIndex =
      Math.max(
        0,
        this.getLevelIndex(
          member.highestLevelId ??
          member.levelId
        )
      );

    const nextLevelIndex =
      this.getLevelIndex(
        nextLevel.id
      );

    const updated =
      entitySystem.update(
        "member_profile",
        member.id,
        {
          segmentId:
            segmentId ??
            member.segmentId,

          lastVisitDay:
            day,

          visits,

          repeatVisits:
            Math.max(
              0,
              visits - 1
            ),

          totalSpend,

          averageSpend:
            Math.round(
              totalSpend /
              visits
            ),

          averageSatisfaction,

          points,
          lifetimePoints,

          levelId:
            nextLevel.id,

          highestLevelId:
            MEMBER_LEVELS[
              Math.max(
                currentHighestIndex,
                nextLevelIndex
              )
            ].id,

          lastLevelChangeDay:
            nextLevel.id !==
              member.levelId
              ? day
              : (
                  member
                    .lastLevelChangeDay ??
                  day
                ),

          favoriteDishCounts,

          lastOrderId:
            orderId
        }
      );

    if (
      updated.levelId !==
      member.levelId
    ) {
      eventBus.emit(
        "member:levelChanged",
        {
          restaurantId,
          customerId,
          memberId:
            member.id,
          previousLevelId:
            member.levelId,
          levelId:
            updated.levelId,
          reason:
            "qualification",
          day
        }
      );
    }

    return updated;
  }

  refreshMemberLevel(
    member,
    day = currentDay()
  ) {
    member =
      this.expirePointsForMember(
        member,
        null,
        day
      );

    if (
      !member ||
      member.levelId ===
        "member" ||
      member.lastVisitDay ===
        null
    ) {
      return member;
    }

    const level =
      this.getLevel(
        member.levelId
      );

    if (
      !level ||
      level.inactivityDowngradeDays ===
        null
    ) {
      return member;
    }

    const inactiveDays =
      day -
      member.lastVisitDay;

    const sinceLevelChange =
      day -
      (
        member
          .lastLevelChangeDay ??
        member.lastVisitDay
      );

    if (
      inactiveDays <
        level
          .inactivityDowngradeDays ||
      sinceLevelChange <
        MEMBER_POINT_POLICY
          .downgradeCooldownDays
    ) {
      return member;
    }

    const index =
      this.getLevelIndex(
        member.levelId
      );

    const previous =
      MEMBER_LEVELS[
        Math.max(
          0,
          index - 1
        )
      ];

    const updated =
      entitySystem.update(
        "member_profile",
        member.id,
        {
          levelId:
            previous.id,
          lastLevelChangeDay:
            day
        }
      );

    eventBus.emit(
      "member:levelChanged",
      {
        restaurantId:
          member.restaurantId,
        customerId:
          member.customerId,
        memberId:
          member.id,
        previousLevelId:
          member.levelId,
        levelId:
          previous.id,
        reason:
          "inactivity",
        day
      }
    );

    return updated;
  }

  processDay(
    day = currentDay()
  ) {
    let expiredMembers = 0;
    let downgradedMembers = 0;

    const members =
      entitySystem.list(
        "member_profile"
      );

    for (
      const member
      of members
    ) {
      const beforePoints =
        member.points ??
        0;

      const beforeLevel =
        member.levelId;

      const updated =
        this.refreshMemberLevel(
          member,
          day
        );

      if (
        updated &&
        updated.points <
          beforePoints
      ) {
        expiredMembers += 1;
      }

      if (
        updated &&
        updated.levelId !==
          beforeLevel
      ) {
        downgradedMembers +=
          1;
      }
    }

    return {
      members:
        members.length,
      expiredMembers,
      downgradedMembers
    };
  }

  recordAnonymousTraffic({
    restaurantId,
    segmentId = "general",
    visitors,
    served,
    revenue,
    satisfaction
  }) {
    restaurantSystem.get(
      restaurantId
    );

    requirePositiveInteger(
      visitors,
      "visitors"
    );

    requirePositiveInteger(
      served,
      "served"
    );

    requirePositiveInteger(
      revenue,
      "revenue"
    );

    if (served > visitors) {
      throw new RangeError(
        "served cannot exceed visitors"
      );
    }

    const day =
      currentDay();

    const existing =
      entitySystem
        .filter(
          "customer_cohort_daily",
          item =>
            item.restaurantId ===
              restaurantId &&
            item.day === day &&
            item.segmentId ===
              segmentId
        )[0];

    const satisfactionValue =
      clamp(
        Number(
          satisfaction ?? 0
        ),
        0,
        100
      );

    if (!existing) {
      return entitySystem.create(
        "customer_cohort_daily",
        {
          restaurantId,
          day,
          segmentId,

          visitors,
          served,
          rejected:
            visitors - served,

          revenue,

          satisfactionTotal:
            satisfactionValue *
            served,

          satisfactionCount:
            served
        }
      );
    }

    return entitySystem.update(
      "customer_cohort_daily",
      existing.id,
      {
        visitors:
          existing.visitors +
          visitors,

        served:
          existing.served +
          served,

        rejected:
          existing.rejected +
          (
            visitors -
            served
          ),

        revenue:
          existing.revenue +
          revenue,

        satisfactionTotal:
          existing
            .satisfactionTotal +
          satisfactionValue *
          served,

        satisfactionCount:
          existing
            .satisfactionCount +
          served
      }
    );
  }

  getMembers(
    restaurantId
  ) {
    const members =
      entitySystem
        .filter(
          "member_profile",
          item =>
            item.restaurantId ===
              restaurantId
        );

    for (
      const member
      of members
    ) {
      this.expirePointsForMember(
        member
      );
    }

    return entitySystem
      .filter(
        "member_profile",
        item =>
          item.restaurantId ===
            restaurantId
      )
      .sort(
        (a, b) =>
          b.totalSpend -
          a.totalSpend
      );
  }

  getMemberProfile(
    restaurantId,
    customerId
  ) {
    let member =
      this.findMember(
        restaurantId,
        customerId
      );

    if (!member) {
      return null;
    }

    member =
      this.expirePointsForMember(
        member
      );

    const customer =
      customerSystem.get(
        customerId
      );

    const level =
      this.getLevel(
        member.levelId
      );

    const favoriteDishes =
      Object.entries(
        member.favoriteDishCounts ??
        {}
      )
        .sort(
          (a, b) =>
            b[1] - a[1]
        )
        .map(
          ([dishId, count]) => ({
            dishId,
            count
          })
        );

    return {
      ...member,

      customerName:
        customer.name,

      level,

      favoriteDishes,

      pointLots:
        this.listPointLots(
          member.id
        ),

      isRepeatCustomer:
        member.visits >= 2
    };
  }

  getAtRiskMembers(
    restaurantId,
    inactivityDays = 14
  ) {
    const day =
      currentDay();

    return this
      .getMembers(
        restaurantId
      )
      .filter(
        member =>
          member.visits >= 2 &&
          member.lastVisitDay !==
            null &&
          day -
            member.lastVisitDay >=
            inactivityDays
      );
  }

  getSegmentSummary(
    restaurantId
  ) {
    const cohorts =
      entitySystem.filter(
        "customer_cohort_daily",
        item =>
          item.restaurantId ===
            restaurantId
      );

    const map =
      new Map();

    for (
      const cohort
      of cohorts
    ) {
      const current =
        map.get(
          cohort.segmentId
        ) ?? {
          segmentId:
            cohort.segmentId,

          visitors: 0,
          served: 0,
          rejected: 0,
          revenue: 0,

          satisfactionTotal: 0,
          satisfactionCount: 0
        };

      current.visitors +=
        cohort.visitors;

      current.served +=
        cohort.served;

      current.rejected +=
        cohort.rejected;

      current.revenue +=
        cohort.revenue;

      current.satisfactionTotal +=
        cohort.satisfactionTotal;

      current.satisfactionCount +=
        cohort.satisfactionCount;

      map.set(
        cohort.segmentId,
        current
      );
    }

    return [
      ...map.values()
    ].map(
      item => ({
        segmentId:
          item.segmentId,

        visitors:
          item.visitors,

        served:
          item.served,

        rejected:
          item.rejected,

        revenue:
          item.revenue,

        averageSpend:
          item.served > 0
            ? Math.round(
                item.revenue /
                item.served
              )
            : 0,

        satisfaction:
          item
            .satisfactionCount >
          0
            ? Math.round(
                item
                  .satisfactionTotal /
                item
                  .satisfactionCount
              )
            : 0,

        enrollmentPropensity:
          this.getEnrollmentPropensity(
            item.segmentId
          )
      })
    );
  }

  getSegmentRetentionMultiplier(
    restaurantId,
    segmentId
  ) {
    const members =
      entitySystem
        .filter(
          "member_profile",
          item =>
            item.restaurantId ===
              restaurantId &&
            item.segmentId ===
              segmentId
        );

    if (
      members.length === 0
    ) {
      return 1;
    }

    const day =
      currentDay();

    const activeMembers =
      members.filter(
        item =>
          item.lastVisitDay !==
            null &&
          day -
            item.lastVisitDay <=
            30
      );

    const visits =
      members.reduce(
        (
          sum,
          item
        ) =>
          sum +
          (
            item.visits ??
            0
          ),
        0
      );

    const repeatVisits =
      members.reduce(
        (
          sum,
          item
        ) =>
          sum +
          (
            item.repeatVisits ??
            0
          ),
        0
      );

    const repeatRate =
      visits > 0
        ? repeatVisits /
          visits
        : 0;

    const activeRate =
      activeMembers.length /
      members.length;

    const memberScale =
      Math.min(
        1,
        members.length /
        MEMBER_IDENTITY_POLICY
          .maxRecognizedCustomersPerSegment
      );

    return clamp(
      1 +
      memberScale * 0.04 +
      repeatRate * 0.04 +
      activeRate * 0.02,
      1,
      MEMBER_IDENTITY_POLICY
        .maxSegmentRetentionMultiplier
    );
  }


  getDashboard(
    restaurantId
  ) {
    restaurantSystem.get(
      restaurantId
    );

    const members =
      this.getMembers(
        restaurantId
      );

    const segments =
      this.getSegmentSummary(
        restaurantId
      );

    const memberVisits =
      members.reduce(
        (sum, item) =>
          sum +
          item.visits,
        0
      );

    const memberRevenue =
      members.reduce(
        (sum, item) =>
          sum +
          item.totalSpend,
        0
      );

    const repeatMembers =
      members.filter(
        item =>
          item.visits >= 2
      ).length;

    const anonymousVisitors =
      segments.reduce(
        (sum, item) =>
          sum +
          item.visitors,
        0
      );

    const anonymousServed =
      segments.reduce(
        (sum, item) =>
          sum +
          item.served,
        0
      );

    const anonymousRevenue =
      segments.reduce(
        (sum, item) =>
          sum +
          item.revenue,
        0
      );

    const averageMemberSatisfaction =
      memberVisits > 0
        ? Math.round(
            members.reduce(
              (sum, item) =>
                sum +
                item
                  .averageSatisfaction *
                item.visits,
              0
            ) /
            memberVisits
          )
        : 0;

    const levelCounts = {};

    for (
      const level
      of MEMBER_LEVELS
    ) {
      levelCounts[level.id] = 0;
    }

    for (
      const member
      of members
    ) {
      levelCounts[
        member.levelId
      ] =
        (
          levelCounts[
            member.levelId
          ] ?? 0
        ) + 1;
    }

    return {
      restaurantId,

      members:
        members.length,

      repeatMembers,

      memberRepeatRate:
        members.length > 0
          ? Number(
              (
                repeatMembers /
                members.length *
                100
              ).toFixed(1)
            )
          : 0,

      memberVisits,

      memberRevenue,

      averageMemberSpend:
        memberVisits > 0
          ? Math.round(
              memberRevenue /
              memberVisits
            )
          : 0,

      averageMemberSatisfaction,

      currentPoints:
        members.reduce(
          (sum, item) =>
            sum +
            (
              item.points ??
              0
            ),
          0
        ),

      lifetimePoints:
        members.reduce(
          (sum, item) =>
            sum +
            (
              item.lifetimePoints ??
              0
            ),
          0
        ),

      pointsRedeemed:
        members.reduce(
          (sum, item) =>
            sum +
            (
              item
                .lifetimeRedeemedPoints ??
              0
            ),
          0
        ),

      pointsExpired:
        members.reduce(
          (sum, item) =>
            sum +
            (
              item
                .lifetimeExpiredPoints ??
              0
            ),
          0
        ),

      anonymousVisitors,
      anonymousServed,
      anonymousRevenue,

      totalTrackedVisits:
        anonymousVisitors +
        memberVisits,

      totalTrackedRevenue:
        anonymousRevenue +
        memberRevenue,

      levelCounts,

      segments,

      atRiskMembers:
        this.getAtRiskMembers(
          restaurantId
        )
    };
  }
}

export const customerLoyaltySystem =
  new CustomerLoyaltySystem();

export {
  CustomerLoyaltySystem,
  MEMBER_LEVELS
};
