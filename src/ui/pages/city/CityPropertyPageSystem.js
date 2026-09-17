import { gameState } from "../../../core/GameState.js";
import { districtSystem } from "../../../systems/DistrictSystem.js";
import { propertySystem } from "../../../systems/PropertySystem.js";
import { propertyMarketSystem } from "../../../systems/PropertyMarketSystem.js";
import { propertyLeaseMarketSystem } from "../../../systems/PropertyLeaseMarketSystem.js";
import { financeSystem } from "../../../systems/FinanceSystem.js";
import { leaseSystem } from "../../../systems/LeaseSystem.js";
import { restaurantSystem } from "../../../systems/RestaurantSystem.js";
import { pageRegistry } from "../../registry/PageRegistry.js";

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
    const day = gameState.getSection("time")?.day ?? 1;

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
      propertyType: enriched.propertyType ?? null,
      qualityScore: enriched.marketMeta?.qualityScore ?? null,
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
            trafficIndex: district.trafficIndex,
            spendingPower: district.spendingPower,
            competition: district.competition,
            customerMix: district.customerMix ?? null
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

    if (generateListings) {
      if (districtId !== null) {
        propertyMarketSystem.ensureDistrictStock(
          districtId,
          { target: marketTarget }
        );
      } else {
        for (const district of districts) {
          propertyMarketSystem.ensureDistrictStock(
            district.id,
            { target: marketTarget }
          );
        }
      }
    }

    const properties = propertySystem
      .list({ districtId, availableOnly })
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
      .sort((a, b) => {
        const qualityA = a.qualityScore ?? 50;
        const qualityB = b.qualityScore ?? 50;

        if (qualityA !== qualityB) {
          return qualityB - qualityA;
        }

        return a.monthlyRent - b.monthlyRent;
      });

    const activeLease = restaurantId
      ? leaseSystem.getByRestaurant(restaurantId) ?? null
      : null;

    const marketDistricts = districtId === null
      ? districts
      : districts.filter(item => item.id === districtId);

    return {
      pageId: "properties",
      title: "城市与房源",
      districts: districts.map(item => ({
        id: item.id,
        name: item.name,
        trafficIndex: item.trafficIndex,
        spendingPower: item.spendingPower,
        competition: item.competition,
        customerMix: item.customerMix ?? null,
        propertyCount: properties.filter(
          property => property.districtId === item.id
        ).length
      })),
      properties,
      filters: {
        districtId,
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
