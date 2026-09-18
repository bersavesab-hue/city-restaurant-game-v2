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

    return Math.min(
      0.35,
      MEMBER_IDENTITY_POLICY
        .recognitionRate +
      repeatRate /
        1000
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
      MEMBER_IDENTITY_POLICY
        .maxRecognizedCustomersPerSegment
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
          0
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
          MEMBER_IDENTITY_POLICY
            .maxRecognizedCustomersPerSegment ||
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
        MEMBER_IDENTITY_POLICY
          .maxRecognizedCustomersPerSegment
    };
  }
}


export const customerIdentitySystem =
  new CustomerIdentitySystem();


export {
  CustomerIdentitySystem
};
