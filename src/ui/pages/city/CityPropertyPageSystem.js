import { gameState } from "../../../core/GameState.js";
import { districtSystem } from "../../../systems/DistrictSystem.js";
import { propertySystem } from "../../../systems/PropertySystem.js";
import { propertyMarketSystem } from "../../../systems/PropertyMarketSystem.js";
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
  getLeaseQuote(property, restaurantId = null, months = 12) {
    const deposit = property.monthlyRent * property.depositMonths;
    const upfront = deposit + property.monthlyRent;
    const balance = safeBalance(restaurantId);

    return {
      months,
      monthlyRent: property.monthlyRent,
      depositMonths: property.depositMonths,
      deposit,
      upfront,
      totalContractRent: property.monthlyRent * months,
      balance,
      affordable: balance === null ? null : balance >= upfront
    };
  }

  buildPropertyCard(property, restaurantId = null) {
    const district = getDistrict(property);
    const quote = this.getLeaseQuote(property, restaurantId);
    const day = gameState.getSection("time")?.day ?? 1;

    return {
      id: property.id,
      name: property.name,
      districtId: property.districtId,
      districtName: district?.name ?? property.districtId,
      area: property.area,
      usableArea: property.usableArea ?? property.area,
      floorCount: property.floorCount ?? property.floors?.length ?? 1,
      seats: property.seats,
      monthlyRent: property.monthlyRent,
      depositMonths: property.depositMonths,
      status: property.status,
      available: property.status === "available",
      frontageMeters: property.frontageMeters ?? null,
      ceilingHeight: property.ceilingHeight ?? null,
      parkingSpaces: property.parkingSpaces ?? 0,
      foodServiceAllowed: property.foodServiceAllowed !== false,
      exhaustAllowed: property.exhaustAllowed !== false,
      tags: [...(property.tags ?? [])],
      floors: buildFloorSummary(property),
      source: property.source ?? "manual",
      propertyType: property.propertyType ?? null,
      qualityScore: property.marketMeta?.qualityScore ?? null,
      listing: {
        listedDay: property.listedDay ?? null,
        expiresDay: property.expiresDay ?? null,
        remainingDays:
          Number.isInteger(property.expiresDay)
            ? Math.max(0, property.expiresDay - day)
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

  getPropertyDetail(propertyId, restaurantId = null, months = 12) {
    const property = propertySystem.get(propertyId);
    const district = getDistrict(property);
    const quote = this.getLeaseQuote(property, restaurantId, months);
    const activeLease = restaurantId
      ? leaseSystem.getByRestaurant(restaurantId) ?? null
      : null;
    const layout = propertySystem.getLayout(propertyId);

    return {
      pageId: "property_detail",
      property: this.buildPropertyCard(property, restaurantId),
      district,
      layout,
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
        canSign:
          property.status === "available" &&
          !activeLease &&
          quote.affordable !== false &&
          property.foodServiceAllowed !== false,
        activeLease
      },
      nextAfterLease: "renovation"
    };
  }

  signLease({ restaurantId, propertyId, months = 12 }) {
    restaurantSystem.get(restaurantId);
    const property = propertySystem.get(propertyId);

    if (property.foodServiceAllowed === false) {
      throw new Error("Property does not allow food service");
    }

    const lease = leaseSystem.sign({
      restaurantId,
      propertyId,
      months
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
}

export const cityPropertyPageSystem = new CityPropertyPageSystem();
export { CityPropertyPageSystem };
