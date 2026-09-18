import { entitySystem } from "../core/EntitySystem.js";
import { randomSystem } from "../core/RandomSystem.js";
import { gameState } from "../core/GameState.js";
import { districtSystem } from "./DistrictSystem.js";
import { customerSegmentSystem } from "./CustomerSegmentSystem.js";
import { COMPETITOR_TEMPLATES_V1 } from "../data/competitorTemplates.v1.js";
import { COMPETITOR_NAME_POOL_V1 } from "../data/competitorNames.v1.js";
import {
  COMPETITOR_STRATEGIES,
  getCompetitorBaseTarget,
  getCompetitorActiveLimit
} from "../data/competitorRules.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

const DEFAULT_STRATEGY_WEIGHTS = Object.freeze(
  Object.fromEntries(
    COMPETITOR_STRATEGIES.map(id => [id, 1])
  )
);

class MarketCompetitionSystem {
  getTemplates() {
    return COMPETITOR_TEMPLATES_V1;
  }

  getTemplate(templateId) {
    return COMPETITOR_TEMPLATES_V1.find(
      item => item.id === templateId
    ) ?? null;
  }

  getTemplateWeight(templateOrId, districtId) {
    const template =
      typeof templateOrId === "string"
        ? this.getTemplate(templateOrId)
        : templateOrId;

    if (!template) {
      return 0;
    }

    return Math.max(
      0,
      template.baseWeight *
        (template.districtWeights?.[districtId] ?? 0.45)
    );
  }

  getTemplateDistribution(districtId) {
    const records = COMPETITOR_TEMPLATES_V1.map(
      template => ({
        id: template.id,
        name: template.name,
        category: template.category,
        weight: this.getTemplateWeight(
          template,
          districtId
        )
      })
    );

    const total = records.reduce(
      (sum, item) => sum + item.weight,
      0
    );

    return records.map(item => ({
      ...item,
      share: total > 0
        ? item.weight / total
        : 0
    }));
  }

  pickTemplate(district, existing = []) {
    const counts = new Map();

    for (const item of existing) {
      if (!item.templateId) {
        continue;
      }

      counts.set(
        item.templateId,
        (counts.get(item.templateId) ?? 0) + 1
      );
    }

    return randomSystem.weightedPick(
      COMPETITOR_TEMPLATES_V1.map(
        template => ({
          value: template,
          weight:
            this.getTemplateWeight(
              template,
              district.id
            ) /
            (
              1 +
              (counts.get(template.id) ?? 0) *
                0.9
            )
        })
      )
    );
  }

  pickName() {
    const used = new Set(
      entitySystem
        .list("competitor_store")
        .map(item => item.name)
    );

    const available =
      COMPETITOR_NAME_POOL_V1.filter(
        name => !used.has(name)
      );

    if (available.length > 0) {
      return randomSystem.pick(available);
    }

    let sequence = used.size + 1;
    let name = `新城餐饮${sequence}`;

    while (used.has(name)) {
      sequence += 1;
      name = `新城餐饮${sequence}`;
    }

    return name;
  }

  sampleRange(range, precision = 0) {
    const scale = 10 ** precision;

    return (
      randomSystem.int(
        Math.round(range.min * scale),
        Math.round(range.max * scale)
      ) / scale
    );
  }

  pickStrengthTier(template, district) {
    let tier = randomSystem.int(
      template.strengthRange.min,
      template.strengthRange.max
    );

    if (
      district.competition >= 80 &&
      tier < template.strengthRange.max &&
      randomSystem.chance(0.45)
    ) {
      tier += 1;
    }

    if (
      district.competition <= 35 &&
      tier > template.strengthRange.min &&
      randomSystem.chance(0.35)
    ) {
      tier -= 1;
    }

    return clamp(tier, 1, 5);
  }

  pickSegmentFocus(district, template) {
    const weighted = Object.entries(
      district.customerMix ?? {}
    )
      .map(([segmentId, weight]) => ({
        value: segmentId,
        weight:
          Math.max(0, weight) *
          (
            template.segmentWeights?.[
              segmentId
            ] ?? 0.35
          )
      }))
      .filter(item => item.weight > 0);

    return weighted.length > 0
      ? randomSystem.weightedPick(weighted)
      : null;
  }

  create({
    districtId,
    name,
    priceIndex = 1,
    qualityScore = 60,
    reputation = 50,
    serviceScore = 60,
    segmentFocus = null,
    templateId = null,
    templateName = null,
    category = "independent",
    strengthTier = 3,
    dishStrength = null,
    venueTypeFocus = [],
    strategy = "stable",
    strategyWeights = DEFAULT_STRATEGY_WEIGHTS,
    marketingTendency = 50,
    expansionTendency = 35,
    discountAggression = 50,
    resilience = 50,
    innovationTendency = 50,
    brandName = null,
    branchNumber = 1,
    expansionGeneration = 0
  }) {
    if (!districtSystem.exists(districtId)) {
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

    if (
      !Number.isInteger(strengthTier) ||
      strengthTier < 1 ||
      strengthTier > 5
    ) {
      throw new Error(
        "Competitor strengthTier must be 1-5"
      );
    }

    if (!COMPETITOR_STRATEGIES.includes(strategy)) {
      throw new Error(
        "Invalid competitor strategy"
      );
    }

    const time = gameState.getSection("time");
    const normalizedName = name.trim();

    return entitySystem.create(
      "competitor_store",
      {
        districtId,
        name: normalizedName,
        brandName: brandName ?? normalizedName,
        branchNumber,
        expansionGeneration,

        templateId,
        templateName,
        category,
        strengthTier,
        venueTypeFocus: [...venueTypeFocus],

        priceIndex,
        dishStrength: clamp(
          dishStrength ?? qualityScore,
          0,
          100
        ),
        qualityScore: clamp(
          qualityScore,
          0,
          100
        ),
        reputation: clamp(
          reputation,
          0,
          100
        ),
        serviceScore: clamp(
          serviceScore,
          0,
          100
        ),
        segmentFocus,

        strategy,
        strategyWeights: {
          ...DEFAULT_STRATEGY_WEIGHTS,
          ...strategyWeights
        },

        marketingTendency: clamp(
          marketingTendency,
          0,
          100
        ),
        expansionTendency: clamp(
          expansionTendency,
          0,
          100
        ),
        discountAggression: clamp(
          discountAggression,
          0,
          100
        ),
        resilience: clamp(
          resilience,
          0,
          100
        ),
        innovationTendency: clamp(
          innovationTendency,
          0,
          100
        ),

        active: true,
        openedDay: time.day,
        closedDay: null,
        ageDays: 0,
        weakDays: 0,
        lastStrategyDay: time.day,
        lastExpansionDay: null,
        lastProcessedDay: null
      }
    );
  }

  createFromTemplate({
    districtId,
    templateId = null,
    name = null,
    existing = null
  }) {
    const district =
      districtSystem.get(districtId);

    if (!district) {
      throw new Error(
        `District "${districtId}" does not exist`
      );
    }

    const current =
      existing ??
      this.listByDistrict(
        districtId,
        { activeOnly: false }
      );

    const template =
      templateId
        ? this.getTemplate(templateId)
        : this.pickTemplate(
            district,
            current
          );

    if (!template) {
      throw new Error(
        `Unknown competitor template "${templateId}"`
      );
    }

    const strengthTier =
      this.pickStrengthTier(
        template,
        district
      );

    const tierModifier =
      (strengthTier - 3) * 3;

    const dishStrength = clamp(
      this.sampleRange(
        template.dishStrengthRange
      ) + tierModifier,
      0,
      100
    );

    const serviceScore = clamp(
      this.sampleRange(
        template.serviceRange
      ) + tierModifier,
      0,
      100
    );

    const reputation = clamp(
      this.sampleRange(
        template.reputationRange
      ) +
        Math.round(
          tierModifier * 0.7
        ),
      0,
      100
    );

    return this.create({
      districtId,
      name: name ?? this.pickName(),
      templateId: template.id,
      templateName: template.name,
      category: template.category,
      strengthTier,
      priceIndex:
        this.sampleRange(
          template.priceIndexRange,
          2
        ),
      dishStrength,
      qualityScore: dishStrength,
      serviceScore,
      reputation,
      segmentFocus:
        this.pickSegmentFocus(
          district,
          template
        ),
      venueTypeFocus:
        template.venueTypeFocus,
      strategy:
        randomSystem.weightedPick(
          Object.entries(
            template.strategyWeights
          ).map(
            ([value, weight]) => ({
              value,
              weight
            })
          )
        ),
      strategyWeights:
        template.strategyWeights,
      marketingTendency:
        template.marketingTendency,
      expansionTendency:
        template.expansionTendency,
      discountAggression:
        template.discountAggression,
      resilience:
        template.resilience,
      innovationTendency:
        template.innovationTendency
    });
  }

  listByDistrict(
    districtId,
    { activeOnly = true } = {}
  ) {
    return entitySystem
      .list("competitor_store")
      .filter(
        item =>
          item.districtId === districtId
      )
      .filter(
        item =>
          !activeOnly ||
          item.active
      );
  }

  getTargetCount(district) {
    return getCompetitorBaseTarget(
      district?.competition
    );
  }

  getMaxActiveCount(district) {
    return getCompetitorActiveLimit(
      district?.competition
    );
  }

  ensureDistrict(districtId) {
    const district =
      districtSystem.get(districtId);

    if (!district) {
      return [];
    }

    const existing =
      this.listByDistrict(
        districtId,
        { activeOnly: false }
      );

    const active =
      existing.filter(
        item => item.active
      );

    const target =
      this.getTargetCount(district);

    if (active.length >= target) {
      return active;
    }

    const missing =
      target - active.length;

    for (
      let offset = 0;
      offset < missing;
      offset += 1
    ) {
      this.createFromTemplate({
        districtId,
        existing:
          this.listByDistrict(
            districtId,
            { activeOnly: false }
          )
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

    const markup = Math.max(
      0,
      competitor.priceIndex - 1
    );

    const discount = Math.max(
      0,
      1 - competitor.priceIndex
    );

    const priceFactor = clamp(
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
          segment.spendingPower - 50
        ) /
          400,
      0.35,
      1.35
    );

    const qualityFactor =
      0.6 +
      competitor.qualityScore / 125;

    const reputationFactor =
      0.7 +
      competitor.reputation / 200;

    const serviceFactor =
      0.7 +
      competitor.serviceScore / 200;

    const focusFactor =
      competitor.segmentFocus ===
        segmentId
        ? 1.2
        : 1;

    const strengthFactor = clamp(
      0.91 +
        (
          competitor.strengthTier ?? 3
        ) *
          0.03,
      0.94,
      1.08
    );

    return (
      priceFactor *
      qualityFactor *
      reputationFactor *
      serviceFactor *
      focusFactor *
      strengthFactor
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
      ).filter(
        item => item.active
      );

    if (competitors.length === 0) {
      return {
        restaurantId,
        districtId: district.id,
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

    const totalAppeal = Math.max(
      0.001,
      playerAppeal +
        competitorAppeal
    );

    const marketShare = clamp(
      playerAppeal / totalAppeal,
      0,
      1
    );

    const competitionFactor = clamp(
      0.55 +
        marketShare * 0.45,
      0.55,
      1
    );

    return {
      restaurantId,
      districtId: district.id,
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
            id: item.competitor.id,
            name:
              item.competitor.name,
            appeal: Number(
              item.appeal.toFixed(3)
            ),
            templateId:
              item.competitor
                .templateId ??
              null,
            templateName:
              item.competitor
                .templateName ??
              null,
            category:
              item.competitor
                .category ??
              "independent",
            strengthTier:
              item.competitor
                .strengthTier ??
              3,
            priceIndex:
              item.competitor
                .priceIndex,
            dishStrength:
              item.competitor
                .dishStrength ??
              item.competitor
                .qualityScore,
            qualityScore:
              item.competitor
                .qualityScore,
            serviceScore:
              item.competitor
                .serviceScore,
            reputation:
              item.competitor
                .reputation,
            strategy:
              item.competitor
                .strategy,
            segmentFocus:
              item.competitor
                .segmentFocus
          }))
    };
  }

  getDistrictSnapshot(districtId) {
    const district =
      districtSystem.get(districtId);

    if (!district) {
      return null;
    }

    const competitors =
      this.ensureDistrict(districtId);

    return {
      districtId,
      competition:
        district.competition,
      competitorCount:
        competitors.length,
      competitors,
      templateDistribution:
        this.getTemplateDistribution(
          districtId
        )
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
