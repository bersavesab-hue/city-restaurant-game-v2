import { entitySystem } from "../core/EntitySystem.js";
import { gameState } from "../core/GameState.js";
import { eventBus } from "../core/EventBus.js";
import { districtSystem } from "./DistrictSystem.js";
import {
  propertySystem,
  PROPERTY_STATUS,
  getDefaultGridSize
} from "./PropertySystem.js";
import { venueTypeSystem } from "./VenueTypeSystem.js";
import {
  PROPERTY_TEMPLATES_V1
} from "../data/propertyTemplates.v1.js";
import {
  validatePropertyTemplate
} from "../data/propertyTemplateRules.js";

const DEFAULT_TARGET = 18;
const REFRESH_DAYS = 7;



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

function randomFloat(
  rng,
  min,
  max
) {
  return min +
    rng() *
    (
      max -
      min
    );
}

function chooseWeighted(
  rng,
  entries
) {
  const valid =
    entries.filter(
      item =>
        Number.isFinite(
          item.weight
        ) &&
        item.weight > 0
    );

  if (
    valid.length === 0
  ) {
    throw new Error(
      "Weighted choice requires at least one positive weight"
    );
  }

  const total =
    valid.reduce(
      (
        sum,
        item
      ) =>
        sum +
        item.weight,
      0
    );

  let roll =
    rng() *
    total;

  for (
    const item
    of valid
  ) {
    roll -=
      item.weight;

    if (
      roll <= 0
    ) {
      return item.value;
    }
  }

  return valid[
    valid.length -
    1
  ].value;
}

function choosePropertyTemplate(
  districtId,
  rng
) {
  return chooseWeighted(
    rng,
    PROPERTY_TEMPLATES_V1.map(
      template => ({
        value: template,
        weight:
          template.baseWeight *
          (
            template
              .districtWeights?.[
                districtId
              ] ??
            1
          )
      })
    )
  );
}

function chooseTemplateShape(
  template,
  rng
) {
  return chooseWeighted(
    rng,
    Object.entries(
      template.shapeWeights
    ).map(
      (
        [
          shape,
          weight
        ]
      ) => ({
        value: shape,
        weight
      })
    )
  );
}

function splitArea(total, count) {
  const base = Math.floor(total / count);
  const remainder = total % count;

  return Array.from({ length: count }, (_, index) =>
    base + (index < remainder ? 1 : 0)
  );
}

function buildPolygon(
  width,
  height,
  rng,
  preferredShape =
    "rectangle"
) {
  if (
    width < 8 ||
    height < 8 ||
    preferredShape !==
      "l_shape"
  ) {
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
  exhaustAllowed,
  preferredShape,
  entranceCount,
  naturalLightScore,
  columnDensityPer1000,
  kitchenProfile
}) {
  const grid =
    getDefaultGridSize(
      usableArea
    );

  const width =
    grid.width;

  const height =
    grid.height;

  const geometry =
    buildPolygon(
      width,
      height,
      rng,
      preferredShape
    );

  const floorId =
    `market_${propertySequence}_f${floorIndex + 1}`;

  const windowTarget =
    naturalLightScore >= 82
      ? 3
      : naturalLightScore >= 55
        ? 2
        : 1;

  const windows = [
    {
      id:
        `${floorId}_window_1`,
      x:
        clamp(
          Math.floor(
            width *
            0.55
          ),
          1,
          width - 1
        ),
      y: 0,
      side: "north",
      length:
        Math.max(
          1,
          Math.min(
            4,
            Math.floor(
              width /
              5
            )
          )
        )
    }
  ];

  if (
    windowTarget >= 2 &&
    width >= 8
  ) {
    windows.push({
      id:
        `${floorId}_window_2`,
      x: 0,
      y:
        clamp(
          Math.floor(
            height *
            0.45
          ),
          1,
          height - 1
        ),
      side: "west",
      length: 2
    });
  }

  if (
    windowTarget >= 3 &&
    height >= 8
  ) {
    windows.push({
      id:
        `${floorId}_window_3`,
      x:
        clamp(
          Math.floor(
            width *
            0.35
          ),
          1,
          width - 1
        ),
      y:
        height,
      side: "south",
      length:
        Math.max(
          1,
          Math.min(
            3,
            Math.floor(
              width /
              6
            )
          )
        )
    });
  }

  const columnCount =
    clamp(
      Math.round(
        usableArea /
        1000 *
        columnDensityPer1000
      ),
      0,
      12
    );

  const columns = [];

  for (
    let index = 0;
    index < columnCount;
    index += 1
  ) {
    const x =
      clamp(
        2 +
        (
          index *
          4
        ) %
        Math.max(
          2,
          geometry.safeWidth -
          3
        ),
        1,
        Math.max(
          1,
          geometry.safeWidth -
          2
        )
      );

    const y =
      clamp(
        2 +
        Math.floor(
          index /
          Math.max(
            1,
            Math.floor(
              geometry.safeWidth /
              4
            )
          )
        ) *
        4,
        1,
        Math.max(
          1,
          geometry.safeHeight -
          2
        )
      );

    columns.push({
      id:
        `${floorId}_column_${index + 1}`,
      type: "column",
      x,
      y,
      width: 1,
      height: 1
    });
  }

  const fixedStructures = [];

  if (
    floorCount >
    1
  ) {
    fixedStructures.push({
      id:
        `${floorId}_stair`,
      type: "stair",
      x: 1,
      y:
        clamp(
          height -
          3,
          1,
          height -
          2
        ),
      width: 2,
      height: 2
    });
  }

  if (
    floorCount >= 3 &&
    width >= 10
  ) {
    fixedStructures.push({
      id:
        `${floorId}_elevator`,
      type: "elevator",
      x: 4,
      y:
        clamp(
          height -
          3,
          1,
          height -
          2
        ),
      width: 2,
      height: 2
    });
  }

  const utilityPoints = [
    {
      id:
        `${floorId}_power`,
      type: "power",
      x: 1,
      y: 1
    }
  ];

  if (
    kitchenProfile
      .powerCapacity >=
      85 &&
    width >= 8
  ) {
    utilityPoints.push({
      id:
        `${floorId}_power_2`,
      type: "power",
      x:
        clamp(
          width -
          2,
          1,
          width -
          1
        ),
      y:
        clamp(
          height -
          2,
          1,
          height -
          1
        )
    });
  }

  if (
    foodServiceAllowed
  ) {
    utilityPoints.push(
      {
        id:
          `${floorId}_water`,
        type: "water",
        x:
          clamp(
            width -
            2,
            1,
            width -
            1
          ),
        y: 1
      },
      {
        id:
          `${floorId}_drain`,
        type: "drain",
        x:
          clamp(
            width -
            3,
            1,
            width -
            1
          ),
        y: 1
      }
    );

    if (
      floorIndex === 0 &&
      rng() *
        100 <
        kitchenProfile
          .gasAvailability
    ) {
      utilityPoints.push({
        id:
          `${floorId}_gas`,
        type: "gas",
        x:
          clamp(
            width -
            4,
            1,
            width -
            1
          ),
        y: 1
      });
    }
  }

  if (
    exhaustAllowed
  ) {
    utilityPoints.push({
      id:
        `${floorId}_exhaust`,
      type: "exhaust",
      x:
        clamp(
          width -
          2,
          1,
          width -
          1
        ),
      y: 2
    });
  }

  const entrances = [];

  const actualEntranceCount =
    floorIndex === 0
      ? Math.max(
          1,
          entranceCount
        )
      : 1;

  const entranceSpecs = [
    {
      side: "north",
      x:
        clamp(
          Math.floor(
            width *
            0.25
          ),
          1,
          width - 2
        ),
      y: 0
    },
    {
      side: "south",
      x:
        clamp(
          Math.floor(
            width *
            0.7
          ),
          1,
          width - 2
        ),
      y: height
    },
    {
      side: "east",
      x: width,
      y:
        clamp(
          Math.floor(
            height *
            0.4
          ),
          1,
          height - 2
        )
    },
    {
      side: "west",
      x: 0,
      y:
        clamp(
          Math.floor(
            height *
            0.65
          ),
          1,
          height - 2
        )
    },
    {
      side: "north",
      x:
        clamp(
          Math.floor(
            width *
            0.72
          ),
          1,
          width - 2
        ),
      y: 0
    }
  ];

  for (
    let index = 0;
    index <
      actualEntranceCount;
    index += 1
  ) {
    const spec =
      entranceSpecs[
        Math.min(
          index,
          entranceSpecs.length -
          1
        )
      ];

    entrances.push({
      id:
        `${floorId}_entrance_${index + 1}`,
      type:
        floorIndex === 0
          ? (
              index === 0
                ? "main"
                : "secondary"
            )
          : "stair_lobby",
      x:
        spec.x,
      y:
        spec.y,
      side:
        spec.side,
      width:
        index === 0
          ? 2
          : 1
    });
  }

  return {
    id: floorId,
    label:
      `${floorIndex + 1}F`,
    floorNumber:
      floorIndex +
      1,
    area:
      floorArea,
    usableArea,
    width,
    height,
    shape:
      geometry.shape,
    polygon:
      geometry.polygon,
    entrances,
    windows,
    columns,
    fixedStructures,
    utilityPoints,
    notes:
      `natural_light_${naturalLightScore}`
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

    const recommendedVenueTypes =
      venueTypeSystem
        .recommendForProperty(
          created,
          district,
          {
            limit: 3
          }
        );

    const property = entitySystem.update(
      "property",
      created.id,
      {
        source: "market",
        propertyType: profileId,
        listedDay: day,
        expiresDay:
          day +
          listingLife,
        marketMeta: {
          profileId,
          qualityScore,
          seed,
          listingLife,

          recommendedVenueTypes:
            recommendedVenueTypes
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
        }
      }
    );

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
