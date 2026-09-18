import { ECONOMIC_BASELINE } from "../data/economicBaseline.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeUnitPrice(reference) {
  const sourceUnit =
    reference.sourceUnit ??
    reference.unit;

  const gameUnit =
    reference.gameUnit ??
    reference.unit;

  const price =
    reference.referencePrice;

  if (
    sourceUnit === "kg" &&
    gameUnit === "g"
  ) {
    return price / 1000;
  }

  if (
    sourceUnit === "l" &&
    gameUnit === "ml"
  ) {
    return price / 1000;
  }

  if (
    sourceUnit === "kg" &&
    gameUnit === "piece"
  ) {
    const gramsPerPiece =
      Number(
        reference.gramsPerPiece
      );

    if (
      !Number.isFinite(
        gramsPerPiece
      ) ||
      gramsPerPiece <= 0
    ) {
      throw new Error(
        "gramsPerPiece is required for kg-to-piece conversion"
      );
    }

    return (
      price /
      1000 *
      gramsPerPiece
    );
  }

  if (
    sourceUnit ===
    gameUnit
  ) {
    return price;
  }

  throw new Error(
    `Unsupported reality price unit conversion: ${sourceUnit} -> ${gameUnit}`
  );
}

class EconomicBaselineSystem {
  constructor() {
    this.snapshot = structuredClone(ECONOMIC_BASELINE);
  }

  loadSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== "object") {
      throw new TypeError("Economic snapshot must be an object");
    }

    if (!snapshot.macro || !snapshot.sourcePolicy) {
      throw new Error("Economic snapshot is incomplete");
    }

    this.snapshot = structuredClone(snapshot);
    return this.getSnapshot();
  }

  getSnapshot() {
    return structuredClone(this.snapshot);
  }

  getIngredientReference(ingredientId) {
    const reference = this.snapshot.ingredientReference?.[ingredientId];
    if (!reference) return null;

    return {
      ...structuredClone(reference),
      unit:
        reference.gameUnit ??
        reference.unit,
      normalizedUnitPrice:
        normalizeUnitPrice(
          reference
        )
    };
  }

  getLaborReference(roleId) {
    const value =
      this.snapshot
        .laborReference?.[
          roleId
        ];

    if (!value) {
      return null;
    }

    return {
      ...structuredClone(
        value
      ),

      marketReference:
        structuredClone(
          this.snapshot
            .laborMarketReference ??
          null
        )
    };
  }

  getLaborMarketReference() {
    return structuredClone(
      this.snapshot
        .laborMarketReference ??
      null
    );
  }

  getFurnitureReference(
    furnitureId
  ) {
    const value =
      this.snapshot
        .furnitureReference?.[
          furnitureId
        ];

    return Number.isFinite(
      value
    )
      ? value
      : null;
  }

  getFurnitureReferenceDetail(
    furnitureId
  ) {
    const price =
      this.getFurnitureReference(
        furnitureId
      );

    if (
      !Number.isFinite(
        price
      )
    ) {
      return null;
    }

    return {
      furnitureId,
      price,

      marketReference:
        structuredClone(
          this.snapshot
            .furnitureMarketReference ??
          null
        )
    };
  }

  getEquipmentReference(
    equipmentId
  ) {
    const price =
      this.snapshot
        .equipmentReference?.[
          equipmentId
        ];

    if (
      !Number.isFinite(
        price
      )
    ) {
      return null;
    }

    return {
      equipmentId,
      price,

      sample:
        structuredClone(
          this.snapshot
            .equipmentMarketReference
            ?.samples?.[
              equipmentId
            ] ??
          null
        ),

      marketReference:
        structuredClone(
          this.snapshot
            .equipmentMarketReference ??
          null
        )
    };
  }

  getUtilityReference() {
    return structuredClone(
      this.snapshot
        .utilitiesReference ??
      {}
    );
  }

  getLogisticsReference() {
    return structuredClone(
      this.snapshot
        .logisticsReference ??
      {}
    );
  }

  getRenovationReference() {
    return structuredClone(
      this.snapshot
        .renovationReference ??
      {}
    );
  }

  getCommercialRentContext(
    districtId
  ) {
    const reference =
      this.snapshot
        .commercialRentReference;

    const anchor =
      reference?.citywideAnchor;

    if (
      !anchor ||
      !Number.isFinite(
        anchor
          .monthlyPerSquareMeter
      )
    ) {
      return null;
    }

    const districtFactor =
      Number.isFinite(
        reference
          .districtFactor?.[
            districtId
          ]
      )
        ? reference
            .districtFactor[
              districtId
            ]
        : 1;

    return {
      districtId,

      citywideMonthlyPerSquareMeter:
        anchor
          .monthlyPerSquareMeter,

      districtFactor,

      referencePerSquareMeter:
        Number(
          (
            anchor
              .monthlyPerSquareMeter *
            districtFactor
          ).toFixed(
            2
          )
        ),

      sourceKind:
        anchor.sourceKind ??
        null,

      sourceName:
        anchor.sourceName ??
        null,

      sourceUrl:
        anchor.sourceUrl ??
        null,

      observedYear:
        anchor.observedYear ??
        null,

      note:
        anchor.note ??
        null
    };
  }

  getCommercialRentReference(
    districtId
  ) {
    return (
      this
        .getCommercialRentContext(
          districtId
        )
        ?.referencePerSquareMeter ??
      null
    );
  }

  getVenueRentMultiplier(venueType, district) {
    const districtMultiplier = Number.isFinite(district?.rentMultiplier)
      ? district.rentMultiplier
      : 1;

    const venueMultiplier = Number.isFinite(venueType?.baseRentMultiplier)
      ? venueType.baseRentMultiplier
      : 1;

    return clamp(
      districtMultiplier *
        venueMultiplier *
        (this.snapshot.macro?.commercialRentIndex ?? 1),
      0.25,
      3.5
    );
  }

  calculateMonthlyRent({
    districtId,
    area,
    venueType = null,
    frontageFactor = 1,
    floorFactor = 1,
    eventFactor = 1
  }) {
    const rentContext =
      this.getCommercialRentContext(
        districtId
      );

    const referencePerSquareMeter =
      rentContext
        ?.referencePerSquareMeter;

    if (
      !referencePerSquareMeter ||
      !Number.isFinite(
        area
      ) ||
      area <= 0
    ) {
      return null;
    }

    const venueMultiplier = Number.isFinite(venueType?.baseRentMultiplier)
      ? venueType.baseRentMultiplier
      : 1;

    const macro = this.snapshot.macro?.commercialRentIndex ?? 1;
    const multiplier = clamp(
      venueMultiplier * frontageFactor * floorFactor * eventFactor * macro,
      0.35,
      3
    );

    return {
      districtId,
      area,
      referencePerSquareMeter,
      multiplier,
      monthlyRent:
        Math.max(
          1,
          Math.round(
            referencePerSquareMeter *
            area *
            multiplier
          )
        ),

      priceModel:
        "reality_1_to_1_v2",

      source:
        rentContext
    };
  }

  calculateIngredientPrice({
    ingredientId,
    districtFactor = 1,
    seasonFactor = 1,
    supplyDemandFactor = 1,
    qualityFactor = 1,
    eventFactor = 1,
    contractFactor = 1
  }) {
    const reference = this.getIngredientReference(ingredientId);
    if (!reference) return null;

    const macro =
      this.snapshot.sourcePolicy
        ?.strictNominalRmb
        ? (
            this.snapshot.macro
              ?.foodPriceIndex ??
            1
          )
        : (
            (
              this.snapshot.macro
                ?.foodPriceIndex ??
              1
            ) *
            (
              this.snapshot.macro
                ?.consumerPriceIndex ??
              1
            )
          );

    const multiplier = clamp(
      macro *
        districtFactor *
        seasonFactor *
        supplyDemandFactor *
        qualityFactor *
        eventFactor *
        contractFactor,
      0.35,
      3.2
    );

    return {
      ingredientId,
      unit:
        reference.unit,

      sourceUnit:
        reference.sourceUnit ??
        reference.unit,

      referencePrice:
        reference.referencePrice,

      normalizedUnitPrice:
        reference.normalizedUnitPrice,

      sourceKind:
        reference.sourceKind ??
        null,

      sourceName:
        reference.sourceName ??
        null,

      sourceUrl:
        reference.sourceUrl ??
        null,

      observedDate:
        reference.observedDate ??
        null,

      observedPeriod:
        reference.observedPeriod ??
        null,
      multiplier,
      price: reference.normalizedUnitPrice * multiplier,
      volatility: reference.volatility ?? 0
    };
  }

  calculatePriceElasticity({
    priceRatio,
    priceSensitivity,
    spendingPower = 50,
    qualityBuffer = 1,
    positioningBuffer = 1,
    venuePriceTolerance = 1,
    loyaltyBuffer = 1
  }) {
    const rules = this.snapshot.demandElasticity;
    const sensitivity = clamp(priceSensitivity / 100, 0, 1);
    const spendingRelief = clamp((spendingPower - 50) / 50, -1, 1);
    const markup = Math.max(0, priceRatio - 1);
    const discount = Math.max(0, 1 - priceRatio);

    const markupPenalty =
      markup * sensitivity * rules.markupStrength / Math.max(0.5, venuePriceTolerance);

    const discountLift = discount * sensitivity * rules.discountStrength;
    const spendingLift = Math.max(0, spendingRelief) * rules.spendingPowerRelief;

    const demandFactor = clamp(
      (1 - markupPenalty + discountLift + spendingLift) *
        qualityBuffer *
        positioningBuffer *
        loyaltyBuffer,
      rules.minDemandFactor,
      rules.maxDemandFactor
    );

    return {
      priceRatio,
      priceSensitivity,
      demandFactor,
      markupPenalty,
      discountLift,
      spendingLift
    };
  }
}

export const economicBaselineSystem = new EconomicBaselineSystem();
export { EconomicBaselineSystem };
