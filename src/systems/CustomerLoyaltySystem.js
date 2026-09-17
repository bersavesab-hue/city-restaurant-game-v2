import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  gameState
} from "../core/GameState.js";

import {
  customerSystem
} from "./CustomerSystem.js";

import {
  restaurantSystem
} from "./RestaurantSystem.js";

const MEMBER_LEVELS = Object.freeze([
  {
    id: "member",
    name: "注册会员",
    minVisits: 0,
    minSpend: 0,
    minPoints: 0,
    discount: 0,
    pointMultiplier: 1
  },
  {
    id: "silver",
    name: "银卡会员",
    minVisits: 3,
    minSpend: 3000,
    minPoints: 30,
    discount: 2,
    pointMultiplier: 1.1
  },
  {
    id: "gold",
    name: "金卡会员",
    minVisits: 8,
    minSpend: 12000,
    minPoints: 120,
    discount: 4,
    pointMultiplier: 1.25
  },
  {
    id: "black",
    name: "黑金会员",
    minVisits: 20,
    minSpend: 40000,
    minPoints: 400,
    discount: 6,
    pointMultiplier: 1.5
  }
]);

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

class CustomerLoyaltySystem {
  getLevelByStats({
    visits = 0,
    totalSpend = 0,
    points = 0
  }) {
    let result =
      MEMBER_LEVELS[0];

    for (
      const level
      of MEMBER_LEVELS
    ) {
      if (
        visits >=
          level.minVisits &&
        totalSpend >=
          level.minSpend &&
        points >=
          level.minPoints
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
    segmentId = null
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
      gameState.getSection(
        "time"
      ).day;

    return entitySystem.create(
      "member_profile",
      {
        restaurantId,
        customerId,
        segmentId,

        joinedDay: day,
        lastVisitDay: null,

        visits: 0,
        repeatVisits: 0,

        totalSpend: 0,
        averageSpend: 0,
        averageSatisfaction: 0,

        points: 0,
        lifetimePoints: 0,

        levelId: "member",

        favoriteDishCounts: {},

        lastOrderId: null
      }
    );
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
          100 *
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
        points
      });

    return entitySystem.update(
      "member_profile",
      member.id,
      {
        segmentId:
          segmentId ??
          member.segmentId,

        lastVisitDay:
          gameState.getSection(
            "time"
          ).day,

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

        favoriteDishCounts,

        lastOrderId:
          orderId
      }
    );
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
      gameState.getSection(
        "time"
      ).day;

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
    const member =
      this.findMember(
        restaurantId,
        customerId
      );

    if (!member) {
      return null;
    }

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

      isRepeatCustomer:
        member.visits >= 2
    };
  }

  getAtRiskMembers(
    restaurantId,
    inactivityDays = 14
  ) {
    const day =
      gameState.getSection(
        "time"
      ).day;

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
            : 0
      })
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
