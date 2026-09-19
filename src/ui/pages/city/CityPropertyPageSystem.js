import { gameState } from "../../../core/GameState.js";
import { districtSystem } from "../../../systems/DistrictSystem.js";
import { propertySystem } from "../../../systems/PropertySystem.js";
import { propertyMarketSystem } from "../../../systems/PropertyMarketSystem.js";
import { propertyLeaseMarketSystem } from "../../../systems/PropertyLeaseMarketSystem.js";
import { financeSystem } from "../../../systems/FinanceSystem.js";
import { leaseSystem } from "../../../systems/LeaseSystem.js";
import { restaurantSystem } from "../../../systems/RestaurantSystem.js";
import { chainSystem } from "../../../systems/ChainSystem.js";
import { venueTypeSystem } from "../../../systems/VenueTypeSystem.js";
import { pageRegistry } from "../../registry/PageRegistry.js";

import {
  buildGlobalTopBarModel,
  buildNoticeTickerModel
} from "../../components/GlobalChromeModel.js";

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

function getDistrict(property) {
  return districtSystem.get(property.districtId) ?? null;
}

function buildFloorSummary(property) {
  return (property.floors ?? []).map((floor) => ({
    id: floor.id,
    label: floor.label,
    floorNumber: floor.floorNumber,
    area: floor.area,
    usableArea: floor.usableArea,
    width: floor.width,
    height: floor.height,
    shape: floor.shape,
    entranceCount: floor.entrances?.length ?? 0,
    windowCount: floor.windows?.length ?? 0,
    columnCount: floor.columns?.length ?? 0,
    fixedStructureCount: floor.fixedStructures?.length ?? 0,
    utilityPointCount: floor.utilityPoints?.length ?? 0
  }));
}

class CityPropertyPageSystem {
  getLeaseQuote(
    property,
    restaurantId = null,
    months = 12,
    offerId = null
  ) {
    return propertyLeaseMarketSystem.getQuote({
      propertyId: property.id,
      restaurantId,
      months,
      offerId
    });
  }

  buildPropertyCard(property, restaurantId = null) {
    const enriched = propertyLeaseMarketSystem.ensureTerms(property.id);
    const district = getDistrict(enriched);
    const defaultMonths = Math.max(
      12,
      enriched.leaseTerms?.minMonths ?? 12
    );
    const quote = this.getLeaseQuote(
      enriched,
      restaurantId,
      Math.min(
        defaultMonths,
        enriched.leaseTerms?.maxMonths ?? defaultMonths
      )
    );
    const day =
      gameState.getSection(
        "time"
      )?.day ??
      1;

    const qualityScore =
      enriched
        .marketMeta
        ?.qualityScore ??
      50;

    const templateId =
      enriched
        .marketMeta
        ?.templateId ??
      enriched.propertyType ??
      null;

    const templateName =
      enriched
        .marketMeta
        ?.templateName ??
      templateId;

    const propertyFeatures =
      enriched
        .marketMeta
        ?.propertyFeatures ??
      null;

    const recommendedVenueTypes =
      enriched
        .marketMeta
        ?.recommendedVenueTypes ??
      (
        district
          ? venueTypeSystem
              .recommendForProperty(
                enriched,
                district,
                {
                  limit: 3
                }
              )
              .map(
                item => ({
                  id:
                    item.venueTypeId,
                  name:
                    item.venueName,
                  score:
                    item.score,
                  districtAffinity:
                    item
                      .districtAffinity
                })
              )
          : []
      );

    const districtOpportunityScore =
      district
        ? districtSystem
            .getOpportunityScore(
              district
            )
        : 0;

    let positioningAffinity = 1;

    if (
      restaurantId &&
      district
    ) {
      try {
        const restaurant =
          restaurantSystem.get(
            restaurantId
          );

        positioningAffinity =
          districtSystem
            .getPositioningAffinity(
              district,
              restaurant
                .positioningId
            );
      } catch {
        positioningAffinity = 1;
      }
    }

    const positioningScore =
      Math.round(
        clamp(
          60 +
          (
            positioningAffinity -
            1
          ) *
          80,
          30,
          100
        )
      );

    const recommendationScore =
      Math.round(
        districtOpportunityScore *
          0.55 +
        qualityScore *
          0.3 +
        positioningScore *
          0.15
      );

    return {
      id: enriched.id,
      name: enriched.name,
      districtId: enriched.districtId,
      districtName: district?.name ?? enriched.districtId,
      area: enriched.area,
      usableArea: enriched.usableArea ?? enriched.area,
      floorCount: enriched.floorCount ?? enriched.floors?.length ?? 1,
      seats: enriched.seats,
      monthlyRent: enriched.monthlyRent,
      depositMonths: enriched.depositMonths,
      status: enriched.status,
      available: enriched.status === "available",
      frontageMeters: enriched.frontageMeters ?? null,
      ceilingHeight: enriched.ceilingHeight ?? null,
      parkingSpaces: enriched.parkingSpaces ?? 0,
      foodServiceAllowed: enriched.foodServiceAllowed !== false,
      exhaustAllowed: enriched.exhaustAllowed !== false,
      tags: [...(enriched.tags ?? [])],
      floors: buildFloorSummary(enriched),
      source: enriched.source ?? "manual",
      propertyType:
        enriched.propertyType ??
        null,

      template:
        templateId
          ? {
              id:
                templateId,
              name:
                templateName
            }
          : null,

      propertyFeatures:
        propertyFeatures
          ? structuredClone(
              propertyFeatures
            )
          : null,

      qualityScore,

      recommendation: {
        score:
          recommendationScore,

        districtOpportunityScore,

        positioningAffinity:
          Number(
            positioningAffinity
              .toFixed(2)
          ),

        positioningScore
      },

      venueTypeId:
        enriched.venueTypeId ??
        null,

      venueTypeName:
        enriched.venueTypeId
          ? (
              venueTypeSystem
                .get(
                  enriched.venueTypeId
                )?.name ??
              enriched.venueTypeId
            )
          : null,

      recommendedVenueTypes:
        structuredClone(
          recommendedVenueTypes
        ),
      landlord: structuredClone(enriched.landlord ?? null),
      leaseTerms: structuredClone(enriched.leaseTerms ?? null),
      competition: {
        demandScore: enriched.leaseTerms?.competitorDemand ?? 0,
        claimDay: enriched.leaseTerms?.competitorClaimDay ?? null,
        daysUntilPossibleClaim:
          Number.isInteger(enriched.leaseTerms?.competitorClaimDay)
            ? Math.max(
                0,
                enriched.leaseTerms.competitorClaimDay - day
              )
            : null
      },
      listing: {
        listedDay: enriched.listedDay ?? null,
        expiresDay: enriched.expiresDay ?? null,
        remainingDays:
          Number.isInteger(enriched.expiresDay)
            ? Math.max(0, enriched.expiresDay - day)
            : null
      },
      quote,
      district: district
        ? {
            trafficIndex:
              district.trafficIndex,
            spendingPower:
              district.spendingPower,
            competition:
              district.competition,
            rentMultiplier:
              district.rentMultiplier,
            deliveryDemand:
              district.deliveryDemand ??
              50,
            parkingConvenience:
              district
                .parkingConvenience ??
              50,
            transitAccess:
              district
                .transitAccess ??
              50,
            seasonality:
              district.seasonality ??
              1,
            positioningAffinity:
              district
                .positioningAffinity ??
              null,
            mealPeriodWeights:
              district
                .mealPeriodWeights ??
              null,
            customerMix:
              district.customerMix ??
              null
          }
        : null
    };
  }

  getMarketplace({
    restaurantId = null,
    districtId = null,
    minArea = null,
    maxArea = null,
    maxRent = null,
    availableOnly = true,
    foodServiceOnly = false,
    exhaustRequired = false,
    generateListings = true,
    marketTarget = 18
  } = {}) {
    const districts = districtSystem.getAll();

    let plannedRegionId =
      null;

    if (restaurantId) {
      try {
        const restaurant =
          restaurantSystem.get(
            restaurantId
          );

        const chain =
          chainSystem
            .findChainByRestaurant(
              restaurantId
            );

        if (
          chain &&
          !restaurant.locationId &&
          restaurant.plannedRegionId
        ) {
          plannedRegionId =
            restaurant
              .plannedRegionId;
        }
      } catch {
        plannedRegionId =
          null;
      }
    }

    const allowedDistricts =
      plannedRegionId
        ? districts.filter(
            district =>
              chainSystem
                .getRegionIdForDistrict(
                  district.id
                ) ===
              plannedRegionId
          )
        : districts;

    const allowedDistrictIds =
      new Set(
        allowedDistricts.map(
          item =>
            item.id
        )
      );

    const effectiveDistrictId =
      districtId !== null &&
      allowedDistrictIds.has(
        districtId
      )
        ? districtId
        : (
            districtId === null
              ? null
              : "__unavailable__"
          );

    if (generateListings) {
      if (
        effectiveDistrictId !==
          null &&
        effectiveDistrictId !==
          "__unavailable__"
      ) {
        propertyMarketSystem.ensureDistrictStock(
          effectiveDistrictId,
          { target: marketTarget }
        );
      } else if (
        effectiveDistrictId ===
          null
      ) {
        for (
          const district
          of allowedDistricts
        ) {
          propertyMarketSystem.ensureDistrictStock(
            district.id,
            { target: marketTarget }
          );
        }
      }
    }

    const properties = propertySystem
      .list({
        districtId:
          effectiveDistrictId ===
            "__unavailable__"
            ? "__unavailable__"
            : effectiveDistrictId,
        availableOnly
      })
      .filter(
        item =>
          allowedDistrictIds
            .has(
              item.districtId
            )
      )
      .filter(item => minArea === null || item.area >= minArea)
      .filter(item => maxArea === null || item.area <= maxArea)
      .filter(item => maxRent === null || item.monthlyRent <= maxRent)
      .filter(
        item =>
          !foodServiceOnly || item.foodServiceAllowed !== false
      )
      .filter(
        item =>
          !exhaustRequired || item.exhaustAllowed !== false
      )
      .map(item => this.buildPropertyCard(item, restaurantId))
      .sort(
        (a, b) => {
          const scoreA =
            a.recommendation
              ?.score ??
            0;

          const scoreB =
            b.recommendation
              ?.score ??
            0;

          if (
            scoreA !==
            scoreB
          ) {
            return (
              scoreB -
              scoreA
            );
          }

          const qualityA =
            a.qualityScore ??
            50;

          const qualityB =
            b.qualityScore ??
            50;

          if (
            qualityA !==
            qualityB
          ) {
            return (
              qualityB -
              qualityA
            );
          }

          return (
            a.monthlyRent -
            b.monthlyRent
          );
        }
      );

    const activeLease = restaurantId
      ? leaseSystem.getByRestaurant(restaurantId) ?? null
      : null;

    const marketDistricts =
      effectiveDistrictId === null
        ? allowedDistricts
        : allowedDistricts.filter(
            item =>
              item.id ===
              effectiveDistrictId
          );

    let restaurant =
      null;

    if (
      restaurantId
    ) {
      try {
        restaurant =
          restaurantSystem.get(
            restaurantId
          );
      } catch {
        restaurant =
          null;
      }
    }

    const time =
      gameState.getSection(
        "time"
      );

    const runtime =
      gameState.getSection(
        "runtime"
      );

    const notices =
      [
        {
          id:
            "property_market_count",

          type:
            "info",

          title:
            "房源市场",

          message:
            `当前筛选下共有${properties.length}套可租房源`,

          priority:
            40
        }
      ];

    const urgentCount =
      properties.filter(
        property =>
          Number.isInteger(
            property
              .competition
              ?.daysUntilPossibleClaim
          ) &&
          property
            .competition
            .daysUntilPossibleClaim <=
            3
      ).length;

    if (
      urgentCount >
      0
    ) {
      notices.push({
        id:
          "property_claim_risk",

        type:
          "warning",

        title:
          "热门房源",

        message:
          `${urgentCount}套房源存在3天内被其他经营者抢租的风险`,

        priority:
          100
      });
    }

    return {
      pageId: "properties",
      title: "城市与房源",

      topBar:
        buildGlobalTopBarModel({
          restaurantName:
            restaurant?.name ??
            "城市餐饮创业",

          balance:
            safeBalance(
              restaurantId
            ) ??
            0,

          storeLevel:
            restaurant?.level ??
            1,

          reputation:
            restaurant?.reputation ??
            0,

          time,

          runtime,

          currentStoreId:
            restaurantId
        }),

      noticeTicker:
        buildNoticeTickerModel(
          notices
        ),
      districts: allowedDistricts.map(item => ({
        id: item.id,
        name: item.name,
        trafficIndex: item.trafficIndex,
        spendingPower: item.spendingPower,
        competition:
          item.competition,

        rentMultiplier:
          item.rentMultiplier,

        deliveryDemand:
          item.deliveryDemand ??
          50,

        parkingConvenience:
          item
            .parkingConvenience ??
          50,

        transitAccess:
          item.transitAccess ??
          50,

        seasonality:
          item.seasonality ??
          1,

        opportunityScore:
          districtSystem
            .getOpportunityScore(
              item
            ),

        positioningAffinity:
          item
            .positioningAffinity ??
          null,

        mealPeriodWeights:
          item
            .mealPeriodWeights ??
          null,

        customerMix:
          item.customerMix ??
          null,

        propertyCount: properties.filter(
          property => property.districtId === item.id
        ).length
      })),
      properties,
      filters: {
        districtId:
          effectiveDistrictId ===
            "__unavailable__"
            ? null
            : effectiveDistrictId,

        plannedRegionId,
        minArea,
        maxArea,
        maxRent,
        availableOnly,
        foodServiceOnly,
        exhaustRequired
      },
      market: {
        dynamicListings: generateListings,
        targetPerDistrict: marketTarget,
        districts: marketDistricts.map(item =>
          propertyMarketSystem.getSummary(item.id)
        )
      },
      activeLease,
      balance: safeBalance(restaurantId),
      navigation: pageRegistry.mainNavigation().map(item => ({
        ...item,
        active: item.id === "city"
      }))
    };
  }

  getPropertyDetail(
    propertyId,
    restaurantId = null,
    months = 12,
    offerId = null
  ) {
    const property = propertyLeaseMarketSystem.ensureTerms(propertyId);
    const district = getDistrict(property);
    const normalizedMonths = Math.min(
      Math.max(
        months,
        property.leaseTerms.minMonths
      ),
      property.leaseTerms.maxMonths
    );
    const quote = this.getLeaseQuote(
      property,
      restaurantId,
      normalizedMonths,
      offerId
    );
    const activeLease = restaurantId
      ? leaseSystem.getByRestaurant(restaurantId) ?? null
      : null;
    const activeOffer = restaurantId
      ? propertyLeaseMarketSystem.getActiveOffer(
          restaurantId,
          propertyId
        )
      : null;
    const layout = propertySystem.getLayout(propertyId);

    return {
      pageId: "property_detail",
      property: this.buildPropertyCard(property, restaurantId),
      district,
      layout,
      landlord: structuredClone(property.landlord),
      leaseTerms: structuredClone(property.leaseTerms),
      activeOffer,
      suitability: {
        foodServiceAllowed: property.foodServiceAllowed !== false,
        exhaustAllowed: property.exhaustAllowed !== false,
        frontageMeters: property.frontageMeters ?? null,
        ceilingHeight: property.ceilingHeight ?? null,
        parkingSpaces: property.parkingSpaces ?? 0,
        renovationRules: structuredClone(property.renovationRules ?? {}),
        tags: [...(property.tags ?? [])]
      },
      quote,
      leaseState: {
        hasActiveLease: Boolean(activeLease),
        canNegotiate:
          property.status === "available" &&
          !activeLease &&
          property.leaseTerms.negotiable === true,
        canSign:
          property.status === "available" &&
          !activeLease &&
          quote.affordable !== false &&
          property.foodServiceAllowed !== false &&
          (!offerId || activeOffer?.status === "accepted"),
        activeLease
      },
      nextAfterLease: "renovation"
    };
  }

  negotiateLease({
    restaurantId,
    propertyId,
    months = 12,
    requestedRent = null,
    requestedRentFreeDays = 0
  }) {
    restaurantSystem.get(restaurantId);

    const offer = propertyLeaseMarketSystem.negotiate({
      restaurantId,
      propertyId,
      months,
      requestedRent,
      requestedRentFreeDays
    });

    return {
      offer,
      detail: this.getPropertyDetail(
        propertyId,
        restaurantId,
        months,
        offer.status === "accepted"
          ? offer.id
          : null
      )
    };
  }

  acceptCounter(offerId) {
    return propertyLeaseMarketSystem.acceptCounter(offerId);
  }

  signLease({
    restaurantId,
    propertyId,
    months = 12,
    offerId = null
  }) {
    restaurantSystem.get(restaurantId);
    const property = propertySystem.get(propertyId);

    if (property.foodServiceAllowed === false) {
      throw new Error("Property does not allow food service");
    }

    const lease = propertyLeaseMarketSystem.signLease({
      restaurantId,
      propertyId,
      months,
      offerId
    });

    return {
      lease,
      restaurant: restaurantSystem.get(restaurantId),
      property: propertySystem.get(propertyId),
      propertyLayout: propertySystem.getLayout(propertyId),
      nextPage: "renovation",
      signedAtDay: gameState.getSection("time").day
    };
  }

  getRenewalQuote(restaurantId, months = 12) {
    const lease = leaseSystem.getByRestaurant(restaurantId);

    if (!lease) {
      return null;
    }

    return propertyLeaseMarketSystem.getRenewalQuote(
      lease.id,
      months
    );
  }

  renewLease(restaurantId, months = 12) {
    const lease = leaseSystem.getByRestaurant(restaurantId);

    if (!lease) {
      throw new Error("Restaurant does not have an active lease");
    }

    return propertyLeaseMarketSystem.renewLease({
      leaseId: lease.id,
      months
    });
  }
}

export const cityPropertyPageSystem = new CityPropertyPageSystem();
export { CityPropertyPageSystem };
