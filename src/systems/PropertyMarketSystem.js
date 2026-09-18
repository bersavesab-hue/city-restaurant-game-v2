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

for (
  const template
  of PROPERTY_TEMPLATES_V1
) {
  validatePropertyTemplate(
    template
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

  createListing(
    districtId,
    sequence,
    day = currentDay()
  ) {
    const district =
      districtSystem.get(
        districtId
      );

    if (!district) {
      throw new Error(
        `District "${districtId}" does not exist`
      );
    }

    const seed =
      hashString(
        `${districtId}:${sequence}:${day}`
      );

    const rng =
      createRng(
        seed
      );

    const template =
      choosePropertyTemplate(
        districtId,
        rng
      );

    const templateId =
      template.id;

    const area =
      randomInt(
        rng,
        template.areaRange.min,
        template.areaRange.max
      );

    const floorCount =
      choose(
        rng,
        template.floorOptions
      );

    const floorAreas =
      splitArea(
        area,
        floorCount
      );

    const usableRatio =
      randomFloat(
        rng,
        template
          .usableRatioRange
          .min,
        template
          .usableRatioRange
          .max
      );

    const floorUsableAreas =
      floorAreas.map(
        value =>
          Math.max(
            1,
            Math.min(
              value,
              Math.floor(
                value *
                usableRatio
              )
            )
          )
      );

    const usableArea =
      floorUsableAreas.reduce(
        (
          sum,
          value
        ) =>
          sum +
          value,
        0
      );

    const preferredShape =
      chooseTemplateShape(
        template,
        rng
      );

    const entranceCount =
      randomInt(
        rng,
        template
          .entranceCountRange
          .min,
        template
          .entranceCountRange
          .max
      );

    const naturalLightScore =
      randomInt(
        rng,
        template
          .naturalLightRange
          .min,
        template
          .naturalLightRange
          .max
      );

    const columnDensityPer1000 =
      Number(
        randomFloat(
          rng,
          template
            .columnDensityPer1000Range
            .min,
          template
            .columnDensityPer1000Range
            .max
        ).toFixed(
          2
        )
      );

    const foodServiceAllowed =
      rng() <
      template
        .foodServiceProbability;

    const effectiveExhaustProbability =
      clamp(
        template
          .exhaustProbability *
          0.75 +
        (
          template
            .kitchenProfile
            .exhaustPotential /
          100
        ) *
          0.25,
        0,
        1
      );

    const exhaustAllowed =
      foodServiceAllowed &&
      rng() <
        effectiveExhaustProbability;

    const floors =
      floorAreas.map(
        (
          floorArea,
          floorIndex
        ) =>
          buildFloor({
            propertySequence:
              `${hashString(
                districtId
              ).toString(
                36
              )}_${sequence}`,

            floorIndex,
            floorArea,

            usableArea:
              floorUsableAreas[
                floorIndex
              ],

            floorCount,
            rng,
            foodServiceAllowed,
            exhaustAllowed,
            preferredShape,

            entranceCount,

            naturalLightScore,

            columnDensityPer1000,

            kitchenProfile:
              template
                .kitchenProfile
          })
      );

    const districtRate =
      28 +
      district.trafficIndex *
        0.28 +
      district.spendingPower *
        0.22 +
      district.competition *
        0.06;

    const variance =
      0.88 +
      rng() *
      0.28;

    const baseMonthlyRent =
      Math.max(
        1200,
        Math.round(
          area *
          districtRate *
          template
            .rentRateMultiplier *
          variance
        )
      );

    const frontageMeters =
      Number(
        randomFloat(
          rng,
          template
            .frontageRange
            .min,
          template
            .frontageRange
            .max
        ).toFixed(
          1
        )
      );

    const ceilingHeight =
      Number(
        randomFloat(
          rng,
          template
            .ceilingHeightRange
            .min,
          template
            .ceilingHeightRange
            .max
        ).toFixed(
          1
        )
      );

    const parkingConvenience =
      district
        .parkingConvenience ??
      50;

    const parkingBase =
      randomInt(
        rng,
        template
          .parkingRange
          .min,
        template
          .parkingRange
          .max
      );

    const parkingSpan =
      template
        .parkingRange
        .max -
      template
        .parkingRange
        .min;

    const parkingAdjustment =
      Math.round(
        (
          parkingConvenience -
          50
        ) /
        50 *
        parkingSpan *
        template
          .parkingDistrictInfluence *
        0.45
      );

    const parkingSpaces =
      clamp(
        parkingBase +
        parkingAdjustment,
        template
          .parkingRange
          .min,
        template
          .parkingRange
          .max
      );

    const depositMonths =
      randomInt(
        rng,
        template
          .depositMonthsRange
          .min,
        template
          .depositMonthsRange
          .max
      );

    const listingLife =
      randomInt(
        rng,
        template
          .listingLifeDaysRange
          .min,
        template
          .listingLifeDaysRange
          .max
      );

    const kitchenReadinessScore =
      Math.round(
        (
          template
            .kitchenProfile
            .waterDrainQuality +
          template
            .kitchenProfile
            .gasAvailability +
          template
            .kitchenProfile
            .powerCapacity +
          template
            .kitchenProfile
            .exhaustPotential
        ) /
        4
      );

    const qualityScore =
      clamp(
        Math.round(
          28 +
          district.trafficIndex *
            0.18 +
          district.spendingPower *
            0.12 +
          (
            district
              .transitAccess ??
            50
          ) *
            0.05 +
          (
            district
              .parkingConvenience ??
            50
          ) *
            0.04 +
          naturalLightScore *
            0.08 +
          kitchenReadinessScore *
            0.07 +
          frontageMeters *
            0.55 +
          (
            exhaustAllowed
              ? 5
              : 0
          ) +
          Math.min(
            7,
            parkingSpaces *
            0.18
          )
        ),
        35,
        96
      );

    const tags = [
      template.name
    ];

    if (
      floorCount >
      1
    ) {
      tags.push(
        `${floorCount}层`
      );
    }

    if (
      exhaustAllowed
    ) {
      tags.push(
        "可排烟"
      );
    }

    if (
      parkingSpaces >
      0
    ) {
      tags.push(
        "有停车位"
      );
    }

    if (
      naturalLightScore >=
      80
    ) {
      tags.push(
        "采光优秀"
      );
    }

    if (
      frontageMeters >=
      12
    ) {
      tags.push(
        "宽门面"
      );
    }

    if (
      kitchenReadinessScore >=
      85
    ) {
      tags.push(
        "厨房基础条件好"
      );
    }

    if (
      parkingConvenience >=
      75
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
      ) >=
      80
    ) {
      tags.push(
        "公共交通便利"
      );
    }

    if (
      floors.some(
        floor =>
          floor.shape !==
          "rectangle"
      )
    ) {
      tags.push(
        "异形户型"
      );
    }

    const created =
      propertySystem.create({
        districtId,

        name:
          `${district.name}·${template.name}${String(
            sequence
          ).padStart(
            2,
            "0"
          )}`,

        area,
        usableArea,
        baseMonthlyRent,

        seats:
          Math.max(
            2,
            Math.floor(
              usableArea /
              4.2
            )
          ),

        depositMonths,
        floors,
        frontageMeters,
        ceilingHeight,
        parkingSpaces,
        foodServiceAllowed,
        exhaustAllowed,

        renovationRules: {
          allowPartitions:
            area >=
            80 &&
            usableRatio >=
            0.72,

          allowWallFinish:
            true,

          allowFloorFinish:
            true,

          allowCeilingFinish:
            ceilingHeight >=
            3
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

    const property =
      entitySystem.update(
        "property",
        created.id,
        {
          source:
            "market",

          propertyType:
            templateId,

          listedDay:
            day,

          expiresDay:
            day +
            listingLife,

          marketMeta: {
            templateId,

            templateName:
              template.name,

            qualityScore,
            seed,
            listingLife,

            propertyFeatures: {
              preferredShape,

              usableRatio:
                Number(
                  usableRatio
                    .toFixed(
                      3
                    )
                ),

              entranceCount,

              naturalLightScore,

              columnDensityPer1000,

              kitchenReadinessScore,

              kitchenProfile:
                structuredClone(
                  template
                    .kitchenProfile
                ),

              foodServiceProbability:
                template
                  .foodServiceProbability,

              exhaustProbability:
                effectiveExhaustProbability
            },

            leaseProfile:
              structuredClone(
                template
                  .leaseProfile
              ),

            recommendedVenueTypes:
              recommendedVenueTypes
                .map(
                  item => ({
                    id:
                      item
                        .venueTypeId,

                    name:
                      item
                        .venueName,

                    score:
                      item
                        .score,

                    districtAffinity:
                      item
                        .districtAffinity
                  })
                )
          }
        }
      );

    eventBus.emit(
      "propertyMarket:listed",
      {
        districtId,

        property:
          structuredClone(
            property
          )
      }
    );

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
  PROPERTY_TEMPLATES_V1 as PROPERTY_GENERATION_TEMPLATES,
  DEFAULT_TARGET as DEFAULT_PROPERTY_MARKET_TARGET,
  REFRESH_DAYS as PROPERTY_MARKET_REFRESH_DAYS
};
