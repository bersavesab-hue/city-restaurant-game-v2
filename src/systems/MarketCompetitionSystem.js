import { entitySystem } from "../core/EntitySystem.js";
import { randomSystem } from "../core/RandomSystem.js";
import { districtSystem } from "./DistrictSystem.js";
import { customerSegmentSystem } from "./CustomerSegmentSystem.js";

function clamp(value, min, max) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

const NAMES = [
  "街角小馆",
  "百味食坊",
  "邻里饭堂",
  "好味厨房",
  "食光餐厅",
  "烟火小厨"
];

class MarketCompetitionSystem {
  create({
    districtId,
    name,
    priceIndex = 1,
    qualityScore = 60,
    reputation = 50,
    serviceScore = 60,
    segmentFocus = null
  }) {
    if (
      !districtSystem.exists(
        districtId
      )
    ) {
      throw new Error(
        `District "${districtId}" does not exist`
      );
    }

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      throw new Error(
        "Competitor name is required"
      );
    }

    if (
      !Number.isFinite(priceIndex) ||
      priceIndex <= 0
    ) {
      throw new Error(
        "Invalid competitor priceIndex"
      );
    }

    const competitor =
      entitySystem.create(
        "competitor_store",
        {
          districtId,
          name: name.trim(),

          priceIndex,

          qualityScore:
            clamp(
              qualityScore,
              0,
              100
            ),

          reputation:
            clamp(
              reputation,
              0,
              100
            ),

          serviceScore:
            clamp(
              serviceScore,
              0,
              100
            ),

          segmentFocus,

          active: true
        }
      );

    return competitor;
  }

  listByDistrict(
    districtId,
    {
      activeOnly = true
    } = {}
  ) {
    return entitySystem
      .list("competitor_store")
      .filter(
        item =>
          item.districtId ===
          districtId
      )
      .filter(
        item =>
          !activeOnly ||
          item.active
      );
  }

  getTargetCount(district) {
    return Math.min(
      4,
      Math.ceil(
        district.competition /
        25
      )
    );
  }

  ensureDistrict(
    districtId
  ) {
    const district =
      districtSystem.get(
        districtId
      );

    if (!district) {
      return [];
    }

    const existing =
      this.listByDistrict(
        districtId,
        {
          activeOnly: false
        }
      );

    const target =
      this.getTargetCount(
        district
      );

    if (
      existing.length >= target
    ) {
      return existing;
    }

    const segmentIds =
      Object.keys(
        district.customerMix ?? {}
      );

    for (
      let index = existing.length;
      index < target;
      index += 1
    ) {
      const focus =
        segmentIds.length > 0
          ? segmentIds[
              randomSystem.int(
                0,
                segmentIds.length - 1
              )
            ]
          : null;

      const strength =
        district.competition;

      this.create({
        districtId,

        name:
          NAMES[
            index %
            NAMES.length
          ] +
          (
            index >= NAMES.length
              ? `${index + 1}`
              : ""
          ),

        priceIndex:
          randomSystem.int(
            80,
            130
          ) /
          100,

        qualityScore:
          clamp(
            40 +
            Math.round(
              strength * 0.35
            ) +
            randomSystem.int(
              -10,
              10
            ),
            25,
            90
          ),

        reputation:
          clamp(
            30 +
            Math.round(
              strength * 0.35
            ) +
            randomSystem.int(
              -10,
              10
            ),
            15,
            90
          ),

        serviceScore:
          clamp(
            40 +
            Math.round(
              strength * 0.3
            ) +
            randomSystem.int(
              -10,
              10
            ),
            25,
            90
          ),

        segmentFocus:
          focus
      });
    }

    return this.listByDistrict(
      districtId
    );
  }

  getCompetitorAppeal(
    competitor,
    segmentId
  ) {
    const segment =
      customerSegmentSystem.get(
        segmentId
      );

    if (!segment) {
      return 0;
    }

    const markup =
      Math.max(
        0,
        competitor.priceIndex -
        1
      );

    const discount =
      Math.max(
        0,
        1 -
        competitor.priceIndex
      );

    const priceFactor =
      clamp(
        1 -
        markup *
          segment.priceSensitivity /
          100 *
          0.7 +
        discount *
          segment.priceSensitivity /
          100 *
          0.25 +
        (
          segment.spendingPower -
          50
        ) /
          400,
        0.35,
        1.35
      );

    const qualityFactor =
      0.6 +
      competitor.qualityScore /
      125;

    const reputationFactor =
      0.7 +
      competitor.reputation /
      200;

    const serviceFactor =
      0.7 +
      competitor.serviceScore /
      200;

    const focusFactor =
      competitor.segmentFocus ===
      segmentId
        ? 1.2
        : 1;

    return (
      priceFactor *
      qualityFactor *
      reputationFactor *
      serviceFactor *
      focusFactor
    );
  }

  getMarketSnapshot({
    restaurantId,
    district,
    segmentId,
    playerAppeal
  }) {
    const competitors =
      this.ensureDistrict(
        district.id
      )
      .filter(
        item =>
          item.active
      );

    if (
      competitors.length === 0
    ) {
      return {
        restaurantId,
        districtId:
          district.id,

        playerAppeal,

        competitorAppeal: 0,

        marketShare: 1,

        competitionFactor: 1,

        competitors: []
      };
    }

    const records =
      competitors.map(
        competitor => ({
          competitor,

          appeal:
            this.getCompetitorAppeal(
              competitor,
              segmentId
            )
        })
      );

    const competitorAppeal =
      records.reduce(
        (sum, item) =>
          sum + item.appeal,
        0
      );

    const totalAppeal =
      Math.max(
        0.001,
        playerAppeal +
        competitorAppeal
      );

    const marketShare =
      clamp(
        playerAppeal /
        totalAppeal,
        0,
        1
      );

    /*
     * 不直接按市场份额砍光客流。
     * 市场份额主要供玩家观察，
     * competitionFactor控制实际抢客强度。
     */
    const competitionFactor =
      clamp(
        0.55 +
        marketShare *
        0.45,
        0.55,
        1
      );

    return {
      restaurantId,
      districtId:
        district.id,

      playerAppeal,

      competitorAppeal,

      marketShare,

      competitionFactor,

      competitors:
        records
          .sort(
            (a, b) =>
              b.appeal -
              a.appeal
          )
          .map(item => ({
            id:
              item.competitor.id,

            name:
              item.competitor.name,

            appeal:
              Number(
                item.appeal
                  .toFixed(3)
              ),

            priceIndex:
              item.competitor
                .priceIndex,

            qualityScore:
              item.competitor
                .qualityScore,

            reputation:
              item.competitor
                .reputation,

            segmentFocus:
              item.competitor
                .segmentFocus
          }))
    };
  }

  getDistrictSnapshot(
    districtId
  ) {
    const district =
      districtSystem.get(
        districtId
      );

    if (!district) {
      return null;
    }

    const competitors =
      this.ensureDistrict(
        districtId
      );

    return {
      districtId,

      competition:
        district.competition,

      competitorCount:
        competitors.length,

      competitors
    };
  }

  setActive(
    competitorId,
    active
  ) {
    return entitySystem.update(
      "competitor_store",
      competitorId,
      {
        active:
          Boolean(active)
      }
    );
  }
}

export const marketCompetitionSystem =
  new MarketCompetitionSystem();

export {
  MarketCompetitionSystem
};
