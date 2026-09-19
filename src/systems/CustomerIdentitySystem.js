import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  gameState
} from "../core/GameState.js";

import {
  randomSystem
} from "../core/RandomSystem.js";

import {
  customerSystem
} from "./CustomerSystem.js";

import {
  customerSegmentSystem
} from "./CustomerSegmentSystem.js";

import {
  restaurantSystem
} from "./RestaurantSystem.js";

import {
  storeProgressSystem
} from "./StoreProgressSystem.js";

import {
  MEMBER_IDENTITY_POLICY
} from "../data/memberProgramRules.js";

import {
  lateGameInvestmentSystem
} from "./LateGameInvestmentSystem.js";


function currentDay() {
  return gameState
    .getSection(
      "time"
    ).day;
}


class CustomerIdentitySystem {
  isMembershipEnabled(
    restaurantId
  ) {
    restaurantSystem.get(
      restaurantId
    );

    return storeProgressSystem
      .isUnlocked(
        restaurantId,
        MEMBER_IDENTITY_POLICY
          .unlockFeature
      );
  }


  getProfiles(
    restaurantId,
    segmentId = null
  ) {
    return entitySystem
      .filter(
        "recognized_customer_profile",
        item =>
          item.restaurantId ===
            restaurantId &&
          item.active !== false &&
          (
            segmentId === null ||
            item.segmentId ===
              segmentId
          )
      )
      .sort(
        (a, b) =>
          (
            b.recognizedVisits ??
            0
          ) -
          (
            a.recognizedVisits ??
            0
          )
      );
  }


  getMaxRecognizedPerSegment(
    restaurantId
  ) {
    const modifiers =
      lateGameInvestmentSystem
        .getModifiers(
          restaurantId
        );

    return (
      MEMBER_IDENTITY_POLICY
        .maxRecognizedCustomersPerSegment +
      (
        modifiers
          .recognizedCustomerCapacityBonus ??
        0
      )
    );
  }


  getRecognitionRate(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    const repeatRate =
      Math.max(
        0,
        Math.min(
          100,
          Number(
            restaurant.repeatRate
          ) || 0
        )
      );

    const modifiers =
      lateGameInvestmentSystem
        .getModifiers(
          restaurantId
        );

    return Math.min(
      0.5,
      MEMBER_IDENTITY_POLICY
        .recognitionRate +
      repeatRate /
        1000 +
      (
        modifiers
          .customerRecognitionRateBonus ??
        0
      )
    );
  }


  createProfile({
    restaurantId,
    segmentId
  }) {
    if (
      !this.isMembershipEnabled(
        restaurantId
      )
    ) {
      return null;
    }

    const profiles =
      this.getProfiles(
        restaurantId,
        segmentId
      );

    if (
      profiles.length >=
      this.getMaxRecognizedPerSegment(
        restaurantId
      )
    ) {
      return profiles[
        profiles.length - 1
      ];
    }

    let segment = null;

    try {
      segment =
        customerSegmentSystem
          .get(
            segmentId
          );
    } catch {
      segment = null;
    }

    const customer =
      customerSystem.create({
        name:
          `${segment?.name ?? "熟客"}·${profiles.length + 1}`,

        budget:
          Math.max(
            100,
            Math.round(
              (
                segment
                  ?.spendingPower ??
                50
              ) *
              12
            )
          ),

        segmentId:
          segment
            ? segment.id
            : null
      });

    return entitySystem.create(
      "recognized_customer_profile",
      {
        restaurantId,
        customerId:
          customer.id,
        segmentId,

        active:
          true,

        createdDay:
          currentDay(),

        lastSeenDay:
          currentDay(),

        recognizedVisits:
          0,

        totalSpend:
          0,

        averageSatisfaction:
          0,

        lastOrderId:
          null,

        favoriteDishCounts:
          {},

        relationshipStage:
          "new"
      }
    );
  }


  touchProfile(
    profile
  ) {
    return entitySystem.update(
      "recognized_customer_profile",
      profile.id,
      {
        lastSeenDay:
          currentDay(),

        recognizedVisits:
          (
            profile
              .recognizedVisits ??
            0
          ) +
          1
      }
    );
  }


  getRelationshipStage(
    recognizedVisits
  ) {
    const visits =
      Math.max(
        0,
        Math.floor(
          Number(
            recognizedVisits
          ) || 0
        )
      );

    if (visits >= 12) {
      return "core";
    }

    if (visits >= 6) {
      return "familiar";
    }

    if (visits >= 3) {
      return "regular";
    }

    return "new";
  }


  recordVisitOutcome({
    restaurantId,
    customerId,
    spend = 0,
    satisfaction = 0,
    orderId = null,
    dishIds = []
  }) {
    const profile =
      this.getProfiles(
        restaurantId
      )
        .find(
          item =>
            item.customerId ===
            customerId
        );

    if (!profile) {
      return null;
    }

    const visits =
      Math.max(
        1,
        profile
          .recognizedVisits ??
        1
      );

    const previousOutcomeVisits =
      Math.max(
        0,
        profile
          .outcomeVisits ??
        0
      );

    const nextOutcomeVisits =
      previousOutcomeVisits + 1;

    const nextSpend =
      Math.max(
        0,
        Math.round(
          Number(spend) || 0
        )
      );

    const nextSatisfaction =
      Math.max(
        0,
        Math.min(
          100,
          Number(
            satisfaction
          ) || 0
        )
      );

    const favoriteDishCounts = {
      ...(
        profile
          .favoriteDishCounts ??
        {}
      )
    };

    for (
      const dishId
      of dishIds
    ) {
      if (
        typeof dishId !==
          "string" ||
        !dishId.trim()
      ) {
        continue;
      }

      favoriteDishCounts[dishId] =
        (
          favoriteDishCounts[
            dishId
          ] ??
          0
        ) + 1;
    }

    return entitySystem.update(
      "recognized_customer_profile",
      profile.id,
      {
        totalSpend:
          (
            profile.totalSpend ??
            0
          ) +
          nextSpend,

        averageSatisfaction:
          Math.round(
            (
              (
                profile
                  .averageSatisfaction ??
                0
              ) *
              previousOutcomeVisits +
              nextSatisfaction
            ) /
            nextOutcomeVisits
          ),

        outcomeVisits:
          nextOutcomeVisits,

        lastOrderId:
          orderId,

        favoriteDishCounts,

        relationshipStage:
          this.getRelationshipStage(
            visits
          )
      }
    );
  }


  getDetailedProfiles(
    restaurantId
  ) {
    const day =
      currentDay();

    const riskGrace =
      lateGameInvestmentSystem
        .getModifiers(
          restaurantId
        )
        .relationshipRiskGraceDays ??
      0;

    return this
      .getProfiles(
        restaurantId
      )
      .map(
        profile => {
          const customer =
            customerSystem.get(
              profile.customerId
            );

          const daysSinceSeen =
            Math.max(
              0,
              day -
              (
                profile.lastSeenDay ??
                day
              )
            );

          const riskThreshold =
            (
              profile
                .recognizedVisits ??
              0
            ) >= 6
              ? 21 + riskGrace
              : 30 + riskGrace;

          const favoriteDishId =
            Object.entries(
              profile
                .favoriteDishCounts ??
              {}
            )
              .sort(
                (a, b) =>
                  b[1] - a[1]
              )[0]?.[0] ??
            null;

          return {
            ...structuredClone(
              profile
            ),

            customerName:
              customer.name,

            customerBudget:
              customer.budget,

            relationshipStage:
              profile
                .relationshipStage ??
              this
                .getRelationshipStage(
                  profile
                    .recognizedVisits
                ),

            daysSinceSeen,

            atRisk:
              (
                profile
                  .recognizedVisits ??
                0
              ) >= 3 &&
              daysSinceSeen >
                riskThreshold,

            riskThreshold,

            favoriteDishId
          };
        }
      );
  }


  resolveVisit({
    restaurantId,
    segmentId,
    force = false
  }) {
    if (
      !segmentId ||
      !this.isMembershipEnabled(
        restaurantId
      )
    ) {
      return null;
    }

    if (
      !force &&
      !randomSystem.chance(
        this.getRecognitionRate(
          restaurantId
        )
      )
    ) {
      return null;
    }

    const profiles =
      this.getProfiles(
        restaurantId,
        segmentId
      );

    let profile = null;

    if (
      profiles.length > 0 &&
      (
        profiles.length >=
          this.getMaxRecognizedPerSegment(
            restaurantId
          ) ||
        randomSystem.chance(
          MEMBER_IDENTITY_POLICY
            .repeatCustomerBias
        )
      )
    ) {
      profile =
        randomSystem.pick(
          profiles
        );
    } else {
      profile =
        this.createProfile({
          restaurantId,
          segmentId
        });
    }

    if (!profile) {
      return null;
    }

    const touched =
      this.touchProfile(
        profile
      );

    return {
      profile:
        touched,

      customer:
        customerSystem.get(
          touched.customerId
        )
    };
  }


  resolveAggregateVisits({
    restaurantId,
    segmentId,
    visitors
  }) {
    if (
      !this.isMembershipEnabled(
        restaurantId
      )
    ) {
      return [];
    }

    const attempts =
      Math.min(
        Math.max(
          0,
          Math.floor(
            Number(
              visitors
            ) || 0
          )
        ),
        MEMBER_IDENTITY_POLICY
          .maxAggregateRecognizedVisits
      );

    const result = [];

    for (
      let index = 0;
      index < attempts;
      index += 1
    ) {
      const resolved =
        this.resolveVisit({
          restaurantId,
          segmentId
        });

      if (resolved) {
        result.push(
          resolved
        );
      }
    }

    return result;
  }


  getSummary(
    restaurantId
  ) {
    const profiles =
      this.getProfiles(
        restaurantId
      );

    return {
      enabled:
        this.isMembershipEnabled(
          restaurantId
        ),

      recognizedCustomers:
        profiles.length,

      recognizedVisits:
        profiles.reduce(
          (
            sum,
            item
          ) =>
            sum +
            (
              item
                .recognizedVisits ??
              0
            ),
          0
        ),

      maxPerSegment:
        this.getMaxRecognizedPerSegment(
          restaurantId
        ),

      recognitionRate:
        Number(
          (
            this.getRecognitionRate(
              restaurantId
            ) *
            100
          ).toFixed(1)
        ),

      relationshipCounts:
        this
          .getDetailedProfiles(
            restaurantId
          )
          .reduce(
            (
              result,
              item
            ) => {
              result[
                item.relationshipStage
              ] =
                (
                  result[
                    item.relationshipStage
                  ] ??
                  0
                ) + 1;

              return result;
            },
            {
              new: 0,
              regular: 0,
              familiar: 0,
              core: 0
            }
          )
    };
  }
}


export const customerIdentitySystem =
  new CustomerIdentitySystem();


export {
  CustomerIdentitySystem
};
