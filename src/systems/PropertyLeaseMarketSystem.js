import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";
import { eventBus } from "../core/EventBus.js";
import { districtSystem } from "./DistrictSystem.js";
import { financeSystem } from "./FinanceSystem.js";
import { propertySystem, PROPERTY_STATUS } from "./PropertySystem.js";
import { leaseSystem } from "./LeaseSystem.js";

const OFFER_VALID_DAYS = 2;
const CLAIM_RETENTION_DAYS = 45;

const SURNAMES = Object.freeze([
  "陈", "林", "周", "吴", "赵", "许", "郑", "徐", "孙", "何", "高", "梁"
]);

const GIVEN_NAMES = Object.freeze([
  "建国", "明远", "志成", "海峰", "文华", "瑞安", "雅琴", "秀兰", "国强", "振华"
]);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function currentDay() {
  return gameState.getSection("time")?.day ?? 1;
}

function hashString(value) {
  let hash = 2166136261;

  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function random01(seed, salt = 0) {
  let value = (seed + Math.imul(salt + 1, 0x9e3779b1)) >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x7feb352d);
  value ^= value >>> 15;
  value = Math.imul(value, 0x846ca68b);
  value ^= value >>> 16;
  return (value >>> 0) / 4294967296;
}

function sampleRange(
  seed,
  salt,
  range
) {
  return (
    range.min +
    random01(
      seed,
      salt
    ) *
    (
      range.max -
      range.min
    )
  );
}

function sampleIntegerRange(
  seed,
  salt,
  range
) {
  return Math.round(
    sampleRange(
      seed,
      salt,
      range
    )
  );
}

function safeBalance(restaurantId) {
  if (!restaurantId) {
    return null;
  }

  try {
    return financeSystem.getBalance(restaurantId);
  } catch {
    return null;
  }
}

class PropertyLeaseMarketSystem {
  buildGeneratedTerms(
    property
  ) {
    const district =
      districtSystem.get(
        property.districtId
      );

    const seed =
      property
        .marketMeta
        ?.seed ??
      hashString(
        property.id
      );

    const quality =
      property
        .marketMeta
        ?.qualityScore ??
      55;

    const listedDay =
      property.listedDay ??
      currentDay();

    const leaseProfile =
      property
        .marketMeta
        ?.leaseProfile ??
      null;

    const landlordIsCompany =
      random01(
        seed,
        1
      ) >
      (
        property.area >=
        800
          ? 0.48
          : 0.72
      );

    const landlordName =
      landlordIsCompany
        ? `${district?.name ?? "城市"}置业${1 + Math.floor(
            random01(
              seed,
              2
            ) *
            9
          )}号业主`
        : `${SURNAMES[
            Math.floor(
              random01(
                seed,
                3
              ) *
              SURNAMES.length
            )
          ]}${GIVEN_NAMES[
            Math.floor(
              random01(
                seed,
                4
              ) *
              GIVEN_NAMES.length
            )
          ]}`;

    const maxDiscountRate =
      leaseProfile
        ? Number(
            sampleRange(
              seed,
              5,
              leaseProfile
                .maxDiscountRateRange
            ).toFixed(
              3
            )
          )
        : Number(
            (
              0.03 +
              random01(
                seed,
                5
              ) *
              0.07
            ).toFixed(
              3
            )
          );

    const rentFreeMaxDays =
      leaseProfile
        ? sampleIntegerRange(
            seed,
            6,
            leaseProfile
              .rentFreeDaysRange
          )
        : (
            property.area >=
            1200
              ? 7 +
                Math.floor(
                  random01(
                    seed,
                    6
                  ) *
                  24
                )
              : property.area >=
                  300
                ? Math.floor(
                    random01(
                      seed,
                      6
                    ) *
                    16
                  )
                : Math.floor(
                    random01(
                      seed,
                      6
                    ) *
                    8
                  )
          );

    const propertyFeePerSqm =
      leaseProfile
        ? sampleRange(
            seed,
            7,
            leaseProfile
              .propertyFeePerSqmRange
          )
        : (
            0.8 +
            random01(
              seed,
              7
            ) *
            2.6
          );

    const propertyFeeMonthly =
      Math.max(
        0,
        Math.round(
          property.area *
          propertyFeePerSqm
        )
      );

    const hasTransferFee =
      leaseProfile
        ? random01(
            seed,
            8
          ) <
          leaseProfile
            .transferFeeProbability
        : random01(
            seed,
            8
          ) >
          0.58;

    const transferMultiple =
      leaseProfile
        ? sampleRange(
            seed,
            9,
            leaseProfile
              .transferFeeRentMultipleRange
          )
        : (
            0.4 +
            random01(
              seed,
              9
            ) *
            1.6
          );

    const transferFee =
      hasTransferFee
        ? Math.round(
            property.monthlyRent *
            transferMultiple
          )
        : 0;

    const renewalIncreaseRate =
      leaseProfile
        ? Number(
            sampleRange(
              seed,
              10,
              leaseProfile
                .renewalIncreaseRateRange
            ).toFixed(
              3
            )
          )
        : Number(
            (
              0.03 +
              random01(
                seed,
                10
              ) *
              0.07
            ).toFixed(
              3
            )
          );

    const competitorDemand =
      clamp(
        Math.round(
          22 +
          quality *
            0.55 +
          (
            district
              ?.competition ??
            50
          ) *
            0.23 +
          (
            property
              .exhaustAllowed
              ? 5
              : 0
          ) +
          Math.min(
            7,
            (
              property
                .frontageMeters ??
              0
            ) *
            0.35
          )
        ),
        15,
        98
      );

    const competitorClaimDay =
      quality >= 76 &&
      competitorDemand >= 62
        ? listedDay +
          5 +
          Math.floor(
            random01(
              seed,
              11
            ) *
            18
          )
        : null;

    return {
      landlord: {
        type:
          landlordIsCompany
            ? "company"
            : "individual",

        name:
          landlordName
      },

      leaseTerms: {
        minMonths:
          leaseProfile
            ? leaseProfile
                .monthsRange
                .min
            : (
                property.area >=
                3000
                  ? 24
                  : 6
              ),

        maxMonths:
          leaseProfile
            ? leaseProfile
                .monthsRange
                .max
            : (
                property.area >=
                1200
                  ? 60
                  : 36
              ),

        propertyFeeMonthly,

        propertyFeePerSqm:
          Number(
            propertyFeePerSqm
              .toFixed(
                2
              )
          ),

        transferFee,

        transferFeeRentMultiple:
          hasTransferFee
            ? Number(
                transferMultiple
                  .toFixed(
                    2
                  )
              )
            : 0,

        rentFreeMaxDays,
        maxDiscountRate,
        renewalIncreaseRate,
        negotiable: true,
        competitorDemand,
        competitorClaimDay,

        templateId:
          property
            .marketMeta
            ?.templateId ??
          null
      }
    };
  }

  buildManualTerms(property) {
    return {
      landlord: {
        type: "individual",
        name: "业主"
      },
      leaseTerms: {
        minMonths: 1,
        maxMonths: 60,
        propertyFeeMonthly: 0,
        transferFee: 0,
        rentFreeMaxDays: 0,
        maxDiscountRate: 0,
        renewalIncreaseRate: 0.05,
        negotiable: false,
        competitorDemand: 0,
        competitorClaimDay: null
      }
    };
  }

  ensureTerms(propertyId) {
    const property = propertySystem.get(propertyId);

    if (property.landlord && property.leaseTerms) {
      return property;
    }

    const generated =
      property.source === "market"
        ? this.buildGeneratedTerms(property)
        : this.buildManualTerms(property);

    return entitySystem.update("property", property.id, {
      landlord:
        property.landlord ?? generated.landlord,
      leaseTerms: {
        ...generated.leaseTerms,
        ...(property.leaseTerms ?? {})
      }
    });
  }

  getTerms(propertyId) {
    const property = this.ensureTerms(propertyId);

    return {
      landlord: structuredClone(property.landlord),
      leaseTerms: structuredClone(property.leaseTerms)
    };
  }

  validateMonths(property, months) {
    const terms = property.leaseTerms;

    if (!Number.isInteger(months)) {
      throw new RangeError("Lease months must be an integer");
    }

    if (months < terms.minMonths || months > terms.maxMonths) {
      throw new RangeError(
        `Lease months must be ${terms.minMonths}-${terms.maxMonths}`
      );
    }
  }

  getOffer(offerId) {
    const offer = entitySystem.get("lease_offer", offerId);

    if (!offer) {
      throw new Error(`Lease offer "${offerId}" does not exist`);
    }

    return offer;
  }

  getActiveOffer(restaurantId, propertyId) {
    const day = currentDay();

    return entitySystem
      .list("lease_offer")
      .filter(
        item =>
          item.restaurantId === restaurantId &&
          item.propertyId === propertyId &&
          ["accepted", "countered"].includes(item.status) &&
          item.expiresDay >= day
      )
      .sort((a, b) => b.createdDay - a.createdDay)[0] ?? null;
  }

  getQuote({
    propertyId,
    restaurantId = null,
    months = 12,
    offerId = null
  }) {
    const property = this.ensureTerms(propertyId);
    this.validateMonths(property, months);

    let monthlyRent = property.monthlyRent;
    let rentFreeDays = 0;
    let offer = null;

    if (offerId) {
      offer = this.getOffer(offerId);

      if (
        offer.propertyId !== propertyId ||
        offer.restaurantId !== restaurantId
      ) {
        throw new Error("Lease offer does not match property or restaurant");
      }

      if (offer.status !== "accepted") {
        throw new Error("Lease offer is not accepted");
      }

      if (offer.expiresDay < currentDay()) {
        throw new Error("Lease offer has expired");
      }

      monthlyRent = offer.monthlyRent;
      rentFreeDays = offer.rentFreeDays;
    }

    const propertyFeeMonthly = property.leaseTerms.propertyFeeMonthly ?? 0;
    const transferFee = property.leaseTerms.transferFee ?? 0;
    const deposit = monthlyRent * property.depositMonths;
    const initialRent = rentFreeDays > 0 ? 0 : monthlyRent;
    const upfront =
      deposit +
      initialRent +
      propertyFeeMonthly +
      transferFee;
    const balance = safeBalance(restaurantId);

    return {
      months,
      monthlyRent,
      askMonthlyRent: property.monthlyRent,
      depositMonths: property.depositMonths,
      deposit,
      rentFreeDays,
      initialRent,
      propertyFeeMonthly,
      transferFee,
      upfront,
      totalContractRent: monthlyRent * months,
      totalContractPropertyFee: propertyFeeMonthly * months,
      balance,
      affordable:
        balance === null
          ? null
          : balance >= upfront,
      offerId: offer?.id ?? null
    };
  }

  negotiate({
    restaurantId,
    propertyId,
    months = 12,
    requestedRent = null,
    requestedRentFreeDays = 0
  }) {
    const property = this.ensureTerms(propertyId);
    this.validateMonths(property, months);

    if (property.status !== PROPERTY_STATUS.AVAILABLE) {
      throw new Error("Property is not available");
    }

    const terms = property.leaseTerms;

    if (!terms.negotiable) {
      throw new Error("This landlord does not accept negotiation");
    }

    const day = currentDay();
    const ask = property.monthlyRent;
    const requested = Math.round(
      requestedRent ?? ask * 0.96
    );

    if (!Number.isInteger(requested) || requested <= 0) {
      throw new RangeError("Requested rent must be positive");
    }

    if (
      !Number.isInteger(requestedRentFreeDays) ||
      requestedRentFreeDays < 0
    ) {
      throw new RangeError("Requested rent-free days must be non-negative");
    }

    const ageDays = Math.max(0, day - (property.listedDay ?? day));
    const ageBonus = Math.min(0.02, ageDays / 1200);
    const maxDiscountRate = Math.min(
      0.12,
      (terms.maxDiscountRate ?? 0) + ageBonus
    );
    const minimumRent = Math.round(
      ask * (1 - maxDiscountRate)
    );
    const maximumRentFreeDays =
      (terms.rentFreeMaxDays ?? 0) +
      (ageDays >= 21 ? 7 : 0);
    const accepted =
      requested >= minimumRent &&
      requestedRentFreeDays <= maximumRentFreeDays;
    const monthlyRent = accepted
      ? requested
      : Math.max(
          minimumRent,
          Math.round((ask + requested) / 2)
        );
    const rentFreeDays = accepted
      ? requestedRentFreeDays
      : Math.min(
          requestedRentFreeDays,
          maximumRentFreeDays
        );

    const offer = entitySystem.create("lease_offer", {
      restaurantId,
      propertyId,
      months,
      status: accepted ? "accepted" : "countered",
      askMonthlyRent: ask,
      requestedRent: requested,
      requestedRentFreeDays,
      monthlyRent,
      rentFreeDays,
      landlord: structuredClone(property.landlord),
      createdDay: day,
      expiresDay: day + OFFER_VALID_DAYS
    });

    eventBus.emit("leaseMarket:negotiated", {
      offer: structuredClone(offer)
    });

    return offer;
  }

  acceptCounter(offerId) {
    const offer = this.getOffer(offerId);

    if (offer.status !== "countered") {
      throw new Error("Only countered offers can be accepted");
    }

    if (offer.expiresDay < currentDay()) {
      throw new Error("Lease offer has expired");
    }

    return entitySystem.update("lease_offer", offer.id, {
      status: "accepted",
      acceptedDay: currentDay()
    });
  }

  signLease({
    restaurantId,
    propertyId,
    months = 12,
    offerId = null
  }) {
    const property = this.ensureTerms(propertyId);
    const quote = this.getQuote({
      propertyId,
      restaurantId,
      months,
      offerId
    });

    const lease = leaseSystem.sign({
      restaurantId,
      propertyId,
      months,
      commercialTerms: {
        monthlyRent: quote.monthlyRent,
        propertyFeeMonthly: quote.propertyFeeMonthly,
        transferFee: quote.transferFee,
        rentFreeDays: quote.rentFreeDays,
        offerId
      }
    });

    if (offerId) {
      entitySystem.update("lease_offer", offerId, {
        status: "signed",
        signedDay: currentDay(),
        leaseId: lease.id
      });
    }

    eventBus.emit("leaseMarket:signed", {
      propertyId,
      restaurantId,
      leaseId: lease.id,
      landlord: structuredClone(property.landlord)
    });

    return lease;
  }

  getRenewalQuote(leaseId, months = 12) {
    const lease = leaseSystem.get(leaseId);
    const property = this.ensureTerms(lease.propertyId);
    this.validateMonths(property, months);

    const increaseRate =
      property.leaseTerms.renewalIncreaseRate ?? 0.05;
    const monthlyRent = Math.max(
      1,
      Math.round(
        lease.monthlyRent * (1 + increaseRate)
      )
    );

    return {
      leaseId,
      propertyId: property.id,
      months,
      currentMonthlyRent: lease.monthlyRent,
      monthlyRent,
      increaseRate,
      propertyFeeMonthly:
        lease.propertyFeeMonthly ??
        property.leaseTerms.propertyFeeMonthly ??
        0,
      newEndDay: lease.endDay + months * 30
    };
  }

  renewLease({ leaseId, months = 12 }) {
    const quote = this.getRenewalQuote(leaseId, months);

    return leaseSystem.renew(leaseId, {
      months,
      monthlyRent: quote.monthlyRent,
      propertyFeeMonthly: quote.propertyFeeMonthly
    });
  }

  processDay(day = currentDay()) {
    let expiredOffers = 0;
    let claimed = 0;
    let pruned = 0;

    for (const offer of entitySystem.list("lease_offer")) {
      if (
        ["accepted", "countered"].includes(offer.status) &&
        offer.expiresDay < day
      ) {
        entitySystem.update("lease_offer", offer.id, {
          status: "expired",
          expiredDay: day
        });
        expiredOffers += 1;
      }
    }

    for (const original of entitySystem.list("property")) {
      if (
        original.source !== "market" ||
        original.status !== PROPERTY_STATUS.AVAILABLE
      ) {
        continue;
      }

      const property = this.ensureTerms(original.id);
      const claimDay = property.leaseTerms?.competitorClaimDay;

      if (!Number.isInteger(claimDay) || claimDay > day) {
        continue;
      }

      const protectedOffer = entitySystem
        .list("lease_offer")
        .some(
          offer =>
            offer.propertyId === property.id &&
            offer.status === "accepted" &&
            offer.expiresDay >= day
        );

      if (protectedOffer) {
        continue;
      }

      entitySystem.update("property", property.id, {
        status: PROPERTY_STATUS.LOCKED,
        marketMeta: {
          ...(property.marketMeta ?? {}),
          claimedByNpc: true,
          claimedDay: day
        }
      });
      claimed += 1;

      eventBus.emit("leaseMarket:npcClaimed", {
        propertyId: property.id,
        districtId: property.districtId,
        day
      });
    }

    const oldClaims = entitySystem
      .list("property")
      .filter(
        property =>
          property.source === "market" &&
          property.status === PROPERTY_STATUS.LOCKED &&
          property.marketMeta?.claimedByNpc &&
          Number.isInteger(property.marketMeta?.claimedDay) &&
          property.marketMeta.claimedDay <= day - CLAIM_RETENTION_DAYS
      )
      .map(property => property.id);

    if (oldClaims.length > 0) {
      pruned = entitySystem.removeMany("property", oldClaims);
    }

    return {
      day,
      expiredOffers,
      claimed,
      pruned
    };
  }
}

export const propertyLeaseMarketSystem =
  new PropertyLeaseMarketSystem();

export {
  PropertyLeaseMarketSystem,
  OFFER_VALID_DAYS as LEASE_OFFER_VALID_DAYS,
  CLAIM_RETENTION_DAYS as LEASE_MARKET_CLAIM_RETENTION_DAYS
};
