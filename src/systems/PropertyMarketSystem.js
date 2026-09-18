import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";
import { eventBus } from "../core/EventBus.js";
import { districtSystem } from "./DistrictSystem.js";
import {
  propertySystem,
  PROPERTY_STATUS,
  getDefaultGridSize
} from "./PropertySystem.js";

const DEFAULT_TARGET = 18;
const REFRESH_DAYS = 7;

const AREA_PROFILES = Object.freeze({
  micro: { id: "micro", min: 30, max: 80, label: "街角小铺" },
  small: { id: "small", min: 81, max: 180, label: "社区底商" },
  medium: { id: "medium", min: 181, max: 500, label: "临街餐饮铺" },
  large: { id: "large", min: 501, max: 1200, label: "商业街大铺" },
  flagship: { id: "flagship", min: 1201, max: 3000, label: "餐饮旗舰铺" },
  complex: { id: "complex", min: 3001, max: 10000, label: "餐饮综合体" }
});

const PROFILE_CYCLE = Object.freeze([
  "micro",
  "small",
  "small",
  "medium",
  "micro",
  "medium",
  "large",
  "small",
  "medium",
  "flagship",
  "small",
  "large",
  "micro",
  "medium",
  "complex",
  "small",
  "large",
  "medium"
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

function createRng(seed) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function choose(rng, values) {
  return values[Math.min(values.length - 1, Math.floor(rng() * values.length))];
}

function splitArea(total, count) {
  const base = Math.floor(total / count);
  const remainder = total % count;

  return Array.from({ length: count }, (_, index) =>
    base + (index < remainder ? 1 : 0)
  );
}

function getFloorCount(area, rng) {
  if (area <= 800) {
    return 1;
  }

  if (area <= 1800) {
    return rng() < 0.32 ? 2 : 1;
  }

  if (area <= 4000) {
    return rng() < 0.72 ? 2 : 1;
  }

  if (area <= 7000) {
    return randomInt(rng, 2, 3);
  }

  return randomInt(rng, 2, 4);
}

function buildPolygon(width, height, rng) {
  if (width < 8 || height < 8 || rng() > 0.36) {
    return {
      shape: "rectangle",
      polygon: [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: width, y: height },
        { x: 0, y: height }
      ],
      safeWidth: width,
      safeHeight: height
    };
  }

  const cutX = clamp(
    Math.floor(width * (0.56 + rng() * 0.18)),
    4,
    width - 2
  );
  const cutY = clamp(
    Math.floor(height * (0.5 + rng() * 0.2)),
    4,
    height - 2
  );

  return {
    shape: "l_shape",
    polygon: [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: cutY },
      { x: cutX, y: cutY },
      { x: cutX, y: height },
      { x: 0, y: height }
    ],
    safeWidth: cutX,
    safeHeight: cutY
  };
}

function buildFloor({
  propertySequence,
  floorIndex,
  floorArea,
  usableArea,
  floorCount,
  rng,
  foodServiceAllowed,
  exhaustAllowed
}) {
  const grid = getDefaultGridSize(usableArea);
  const width = grid.width;
  const height = grid.height;
  const geometry = buildPolygon(width, height, rng);
  const floorId = `market_${propertySequence}_f${floorIndex + 1}`;
  const entranceX = clamp(Math.floor(width * 0.25), 1, width - 2);
  const windows = [
    {
      id: `${floorId}_window_1`,
      x: clamp(Math.floor(width * 0.55), 1, width - 1),
      y: 0,
      side: "north",
      length: Math.max(1, Math.min(3, Math.floor(width / 5)))
    }
  ];

  if (width >= 12) {
    windows.push({
      id: `${floorId}_window_2`,
      x: 0,
      y: clamp(Math.floor(height * 0.45), 1, height - 1),
      side: "west",
      length: 2
    });
  }

  const columnCount = clamp(
    Math.floor(usableArea / 650),
    0,
    8
  );
  const columns = [];

  for (let index = 0; index < columnCount; index += 1) {
    const x = clamp(
      2 + (index * 4) % Math.max(2, geometry.safeWidth - 3),
      1,
      Math.max(1, geometry.safeWidth - 2)
    );
    const y = clamp(
      2 + Math.floor(index / Math.max(1, Math.floor(geometry.safeWidth / 4))) * 4,
      1,
      Math.max(1, geometry.safeHeight - 2)
    );

    columns.push({
      id: `${floorId}_column_${index + 1}`,
      type: "column",
      x,
      y,
      width: 1,
      height: 1
    });
  }

  const fixedStructures = [];

  if (floorCount > 1) {
    fixedStructures.push({
      id: `${floorId}_stair`,
      type: "stair",
      x: 1,
      y: clamp(height - 3, 1, height - 2),
      width: 2,
      height: 2
    });
  }

  if (floorCount >= 3 && width >= 10) {
    fixedStructures.push({
      id: `${floorId}_elevator`,
      type: "elevator",
      x: 4,
      y: clamp(height - 3, 1, height - 2),
      width: 2,
      height: 2
    });
  }

  const utilityPoints = [
    {
      id: `${floorId}_power`,
      type: "power",
      x: 1,
      y: 1
    }
  ];

  if (foodServiceAllowed) {
    utilityPoints.push(
      {
        id: `${floorId}_water`,
        type: "water",
        x: clamp(width - 2, 1, width - 1),
        y: 1
      },
      {
        id: `${floorId}_drain`,
        type: "drain",
        x: clamp(width - 3, 1, width - 1),
        y: 1
      }
    );

    if (floorIndex === 0) {
      utilityPoints.push({
        id: `${floorId}_gas`,
        type: "gas",
        x: clamp(width - 4, 1, width - 1),
        y: 1
      });
    }
  }

  if (exhaustAllowed) {
    utilityPoints.push({
      id: `${floorId}_exhaust`,
      type: "exhaust",
      x: clamp(width - 2, 1, width - 1),
      y: 2
    });
  }

  return {
    id: floorId,
    label: `${floorIndex + 1}F`,
    floorNumber: floorIndex + 1,
    area: floorArea,
    usableArea,
    width,
    height,
    shape: geometry.shape,
    polygon: geometry.polygon,
    entrances: [
      {
        id: `${floorId}_main`,
        type: floorIndex === 0 ? "main" : "stair_lobby",
        x: entranceX,
        y: 0,
        side: "north",
        width: 2
      }
    ],
    windows,
    columns,
    fixedStructures,
    utilityPoints
  };
}

class PropertyMarketSystem {
  getState(districtId) {
    return entitySystem
      .list("property_market")
      .find(item => item.districtId === districtId) ?? null;
  }

  ensureState(districtId, { target = DEFAULT_TARGET, day = currentDay() } = {}) {
    if (!districtSystem.exists(districtId)) {
      throw new Error(`District "${districtId}" does not exist`);
    }

    if (!Number.isInteger(target) || target <= 0) {
      throw new RangeError("Property market target must be positive");
    }

    const existing = this.getState(districtId);

    if (existing) {
      if (existing.target !== target) {
        return entitySystem.update("property_market", existing.id, {
          target
        });
      }

      return existing;
    }

    return entitySystem.create("property_market", {
      districtId,
      target,
      nextSequence: 1,
      createdDay: day,
      lastRefreshDay: null,
      nextRefreshDay: day + REFRESH_DAYS
    });
  }

  listGenerated(districtId = null, { availableOnly = false } = {}) {
    return entitySystem
      .list("property")
      .filter(item => item.source === "market")
      .filter(item => districtId === null || item.districtId === districtId)
      .filter(
        item =>
          !availableOnly || item.status === PROPERTY_STATUS.AVAILABLE
      );
  }

  createListing(districtId, sequence, day = currentDay()) {
    const district = districtSystem.get(districtId);

    if (!district) {
      throw new Error(`District "${districtId}" does not exist`);
    }

    const seed = hashString(`${districtId}:${sequence}:${day}`);
    const rng = createRng(seed);
    const cycleOffset = hashString(districtId) % PROFILE_CYCLE.length;
    const profileId = PROFILE_CYCLE[
      (sequence - 1 + cycleOffset) % PROFILE_CYCLE.length
    ];
    const profile = AREA_PROFILES[profileId];
    const area = randomInt(rng, profile.min, profile.max);
    const floorCount = getFloorCount(area, rng);
    const floorAreas = splitArea(area, floorCount);
    const usableRatio = 0.8 + rng() * 0.14;
    const floorUsableAreas = floorAreas.map(value =>
      Math.max(1, Math.min(value, Math.floor(value * usableRatio)))
    );
    const usableArea = floorUsableAreas.reduce((sum, value) => sum + value, 0);
    const foodServiceAllowed = sequence % 9 !== 0;
    const exhaustAllowed = foodServiceAllowed && sequence % 6 !== 0;
    const floors = floorAreas.map((floorArea, floorIndex) =>
      buildFloor({
        propertySequence: `${hashString(districtId).toString(36)}_${sequence}`,
        floorIndex,
        floorArea,
        usableArea: floorUsableAreas[floorIndex],
        floorCount,
        rng,
        foodServiceAllowed,
        exhaustAllowed
      })
    );

    const districtRate =
      28 +
      district.trafficIndex * 0.28 +
      district.spendingPower * 0.22 +
      district.competition * 0.06;
    const profileRate = {
      micro: 1.18,
      small: 1.08,
      medium: 1,
      large: 0.92,
      flagship: 0.84,
      complex: 0.76
    }[profileId];
    const variance = 0.88 + rng() * 0.28;
    const baseMonthlyRent = Math.max(
      1200,
      Math.round(area * districtRate * profileRate * variance)
    );
    const frontageMeters = Number(
      clamp(
        Math.sqrt(area) * (0.42 + rng() * 0.18),
        2.5,
        36
      ).toFixed(1)
    );
    const ceilingHeight = Number(
      clamp(2.8 + rng() * (area > 1200 ? 2.4 : 1.3), 2.8, 5.8)
        .toFixed(1)
    );
    const parkingConvenience =
      district
        .parkingConvenience ??
      50;

    const smallParkingChance =
      clamp(
        0.06 +
        parkingConvenience /
        100 *
        0.42,
        0.06,
        0.48
      );

    const parkingDensityMin =
      Math.max(
        70,
        165 -
        Math.round(
          parkingConvenience *
          0.55
        )
      );

    const parkingDensityMax =
      Math.max(
        parkingDensityMin +
        30,
        225 -
        Math.round(
          parkingConvenience *
          0.45
        )
      );

    const parkingSpaces =
      area < 500
        ? (
            rng() <
              smallParkingChance
              ? randomInt(
                  rng,
                  1,
                  Math.max(
                    2,
                    Math.round(
                      2 +
                      parkingConvenience /
                      25
                    )
                  )
                )
              : 0
          )
        : clamp(
            Math.floor(
              area /
              randomInt(
                rng,
                parkingDensityMin,
                parkingDensityMax
              )
            ),
            0,
            160
          );
    const depositMonths = randomInt(rng, 1, 3);
    const listingLife = randomInt(rng, 14, 42);
    const qualityScore = clamp(
      Math.round(
        38 +
        district.trafficIndex * 0.22 +
        district.spendingPower * 0.16 +
        (
          district.transitAccess ??
          50
        ) * 0.06 +
        (
          district.parkingConvenience ??
          50
        ) * 0.04 +
        frontageMeters * 0.8 +
        (exhaustAllowed ? 6 : 0) +
        Math.min(8, parkingSpaces * 0.2)
      ),
      35,
      96
    );
    const tags = [profile.label];

    if (floorCount > 1) {
      tags.push(`${floorCount}层`);
    }

    if (exhaustAllowed) {
      tags.push("可排烟");
    }

    if (parkingSpaces > 0) {
      tags.push("有停车位");
    }

    if (
      (
        district
          .parkingConvenience ??
        0
      ) >= 75
    ) {
      tags.push(
        "停车便利"
      );
    }

    if (
      (
        district
          .transitAccess ??
        0
      ) >= 80
    ) {
      tags.push(
        "公共交通便利"
      );
    }

    if (floors.some(floor => floor.shape !== "rectangle")) {
      tags.push("异形户型");
    }

    const created = propertySystem.create({
      districtId,
      name: `${district.name}·${profile.label}${String(sequence).padStart(2, "0")}`,
      area,
      usableArea,
      baseMonthlyRent,
      seats: Math.max(2, Math.floor(usableArea / 4.2)),
      depositMonths,
      floors,
      frontageMeters,
      ceilingHeight,
      parkingSpaces,
      foodServiceAllowed,
      exhaustAllowed,
      renovationRules: {
        allowPartitions: area >= 80,
        allowWallFinish: true,
        allowFloorFinish: true,
        allowCeilingFinish: ceilingHeight >= 3
      },
      tags
    });

    const property = entitySystem.update("property", created.id, {
      source: "market",
      propertyType: profileId,
      listedDay: day,
      expiresDay: day + listingLife,
      marketMeta: {
        profileId,
        qualityScore,
        seed,
        listingLife
      }
    });

    eventBus.emit("propertyMarket:listed", {
      districtId,
      property: structuredClone(property)
    });

    return property;
  }

  pruneExpired(day = currentDay(), { districtId = null } = {}) {
    const expired = this.listGenerated(districtId, { availableOnly: true })
      .filter(item => Number.isInteger(item.expiresDay) && item.expiresDay <= day)
      .map(item => item.id);

    const removed = entitySystem.removeMany("property", expired);

    if (removed > 0) {
      eventBus.emit("propertyMarket:expired", {
        districtId,
        day,
        removed
      });
    }

    return removed;
  }

  rotateListings(districtId, day = currentDay(), count = null) {
    const state = this.ensureState(districtId, { day });
    const available = this.listGenerated(districtId, { availableOnly: true })
      .filter(item => (item.listedDay ?? day) <= day - REFRESH_DAYS)
      .sort((a, b) => (a.listedDay ?? 0) - (b.listedDay ?? 0));
    const rotateCount = count ?? Math.max(1, Math.floor(state.target * 0.12));
    const ids = available.slice(0, rotateCount).map(item => item.id);

    return entitySystem.removeMany("property", ids);
  }

  ensureDistrictStock(
    districtId,
    { target = DEFAULT_TARGET, day = currentDay() } = {}
  ) {
    let state = this.ensureState(districtId, { target, day });
    this.pruneExpired(day, { districtId });

    const availableBefore = this.listGenerated(
      districtId,
      { availableOnly: true }
    );
    const needed = Math.max(0, state.target - availableBefore.length);
    const created = [];
    let sequence = state.nextSequence ?? 1;

    for (let index = 0; index < needed; index += 1) {
      created.push(this.createListing(districtId, sequence, day));
      sequence += 1;
    }

    state = entitySystem.update("property_market", state.id, {
      nextSequence: sequence,
      lastEnsuredDay: day
    });

    return {
      districtId,
      target: state.target,
      created: created.length,
      availableGenerated: this.listGenerated(
        districtId,
        { availableOnly: true }
      ).length,
      nextRefreshDay: state.nextRefreshDay,
      properties: created
    };
  }

  ensureAllDistricts({ target = DEFAULT_TARGET, day = currentDay() } = {}) {
    return districtSystem.getAll().map(district =>
      this.ensureDistrictStock(district.id, { target, day })
    );
  }

  processDay(day = currentDay()) {
    const states = entitySystem.list("property_market");
    let removed = 0;
    let created = 0;
    let refreshed = 0;

    for (const state of states) {
      if (day < (state.nextRefreshDay ?? day)) {
        continue;
      }

      removed += this.pruneExpired(day, {
        districtId: state.districtId
      });
      removed += this.rotateListings(state.districtId, day);

      const result = this.ensureDistrictStock(
        state.districtId,
        { target: state.target ?? DEFAULT_TARGET, day }
      );
      created += result.created;
      refreshed += 1;

      entitySystem.update("property_market", state.id, {
        lastRefreshDay: day,
        nextRefreshDay: day + REFRESH_DAYS
      });
    }

    if (refreshed > 0) {
      eventBus.emit("propertyMarket:refreshed", {
        day,
        refreshed,
        removed,
        created
      });
    }

    return {
      day,
      refreshed,
      removed,
      created
    };
  }

  getSummary(districtId) {
    const state = this.getState(districtId);
    const generated = this.listGenerated(districtId);
    const available = generated.filter(
      item => item.status === PROPERTY_STATUS.AVAILABLE
    );

    return {
      districtId,
      active: Boolean(state),
      target: state?.target ?? 0,
      totalGenerated: generated.length,
      availableGenerated: available.length,
      nextRefreshDay: state?.nextRefreshDay ?? null,
      areaRange:
        available.length > 0
          ? {
              min: Math.min(...available.map(item => item.area)),
              max: Math.max(...available.map(item => item.area))
            }
          : null
    };
  }
}

export const propertyMarketSystem = new PropertyMarketSystem();

export {
  PropertyMarketSystem,
  AREA_PROFILES as PROPERTY_AREA_PROFILES,
  DEFAULT_TARGET as DEFAULT_PROPERTY_MARKET_TARGET,
  REFRESH_DAYS as PROPERTY_MARKET_REFRESH_DAYS
};
