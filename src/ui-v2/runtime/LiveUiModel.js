function safeCall(
  fallback,
  callback
) {
  try {
    const value =
      callback();

    return value ??
      fallback;
  } catch {
    return fallback;
  }
}

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

function formatCompactMoney(
  value
) {
  const amount =
    Math.max(
      0,
      Math.round(
        Number(
          value
        ) ||
        0
      )
    );

  if (
    amount <
    100000
  ) {
    return (
      "¥" +
      amount.toLocaleString(
        "zh-CN"
      )
    );
  }

  if (
    amount <
    100000000
  ) {
    const wan =
      amount /
      10000;

    return (
      "¥" +
      (
        wan >= 1000
          ? Math.round(
              wan
            )
          : Number(
              wan.toFixed(
                1
              )
            )
      ) +
      "万"
    );
  }

  const yi =
    amount /
    100000000;

  return (
    "¥" +
    (
      yi >= 100
        ? Math.round(
            yi
          )
        : Number(
            yi.toFixed(
              2
            )
          )
    ) +
    "亿"
  );
}

function formatFullMoney(
  value
) {
  return (
    "¥" +
    Math.max(
      0,
      Math.round(
        Number(
          value
        ) ||
        0
      )
    ).toLocaleString(
      "zh-CN"
    )
  );
}

function formatClock(
  time
) {
  return (
    String(
      time?.hour ??
      0
    ).padStart(
      2,
      "0"
    ) +
    ":" +
    String(
      time?.minute ??
      0
    ).padStart(
      2,
      "0"
    )
  );
}

function formatCalendar(
  calendar
) {
  if (!calendar) {
    return "第1年 1月1日 周一";
  }

  return (
    "第" +
    calendar.year +
    "年 " +
    calendar.month +
    "月" +
    calendar.dayOfMonth +
    "日 周" +
    String(
      calendar.weekday ??
      "星期一"
    ).slice(
      -1
    )
  );
}

function getRestaurantDistrictId(
  restaurant,
  propertySystem
) {
  if (
    !restaurant?.locationId
  ) {
    return null;
  }

  return safeCall(
    null,
    () =>
      propertySystem
        .get(
          restaurant.locationId
        )
        ?.districtId ??
      null
  );
}

function buildUnlockedDistrictIds(
  app,
  districts
) {
  const chains =
    safeCall(
      [],
      () =>
        app.core
          .entitySystem
          .list(
            "restaurant_chain"
          )
    );

  if (
    chains.length ===
    0
  ) {
    return new Set(
      districts.map(
        district =>
          district.id
      )
    );
  }

  const unlockedRegions =
    new Set(
      chains.flatMap(
        chain =>
          chain
            .unlockedRegionIds ??
          []
      )
    );

  if (
    unlockedRegions.size ===
    0
  ) {
    return new Set(
      districts.map(
        district =>
          district.id
      )
    );
  }

  return new Set(
    districts
      .filter(
        district =>
          unlockedRegions
            .has(
              safeCall(
                "",
                () =>
                  app.systems
                    .chainSystem
                    .getRegionIdForDistrict(
                      district.id
                    )
              )
            )
      )
      .map(
        district =>
          district.id
      )
  );
}

function getEventAdjustment(
  app,
  districtId
) {
  const state =
    safeCall(
      null,
      () =>
        app.core
          .gameState
          .getSection(
            "districtEvents"
          )
    );

  const currentDay =
    safeCall(
      1,
      () =>
        app.core
          .gameState
          .getSection(
            "time"
          )
          .day
    );

  const active =
    (
      state?.active ??
      []
    )
      .filter(
        event =>
          event.districtId ===
            districtId &&
          currentDay >=
            event.startDay &&
          currentDay <=
            event.endDay
      );

  let score = 0;
  let demandMultiplier = 1;
  let spendingMultiplier = 1;

  for (
    const event
    of active
  ) {
    const definition =
      safeCall(
        null,
        () =>
          app.systems
            .districtEventSystem
            .getDefinition(
              event.type
            )
      );

    if (!definition) {
      continue;
    }

    const polarity =
      definition.polarity;

    score +=
      polarity ===
        "positive"
        ? 5
        : polarity ===
            "negative"
          ? -5
          : 0;

    demandMultiplier *=
      Number(
        definition
          .modifiers
          ?.demandMultiplier ??
        1
      );

    spendingMultiplier *=
      Number(
        definition
          .modifiers
          ?.spendingMultiplier ??
        1
      );
  }

  return {
    score,
    demandMultiplier:
      clamp(
        demandMultiplier,
        0.6,
        1.8
      ),
    spendingMultiplier:
      clamp(
        spendingMultiplier,
        0.6,
        1.8
      ),
    active
  };
}

function buildHudModel(
  app
) {
  const restaurants =
    safeCall(
      [],
      () =>
        app.systems
          .restaurantSystem
          .list()
    );

  const time =
    safeCall(
      {
        day: 1,
        hour: 8,
        minute: 0
      },
      () =>
        app.core
          .gameState
          .getSection(
            "time"
          )
    );

  const runtime =
    safeCall(
      {
        paused: true,
        speed: 1
      },
      () =>
        app.core
          .gameState
          .getSection(
            "runtime"
          )
    );

  const calendar =
    safeCall(
      null,
      () =>
        app.systems
          .businessCalendarSystem
          .getCalendar(
            time.day
          )
    );

  const balances =
    restaurants.map(
      restaurant =>
        safeCall(
          0,
          () =>
            app.systems
              .financeSystem
              .findAccount(
                restaurant.id
              )
              ?.balance ??
            0
        )
    );

  const money =
    balances.reduce(
      (
        sum,
        value
      ) =>
        sum +
        value,
      0
    );

  const level =
    restaurants.length
      ? Math.max(
          ...restaurants.map(
            restaurant =>
              Number(
                restaurant.level
              ) ||
              1
          )
        )
      : null;

  const reviewed =
    restaurants.filter(
      restaurant =>
        (
          Number(
            restaurant.totalReviews
          ) ||
          0
        ) >
        0
    );

  const rating =
    reviewed.length
      ? (
          reviewed.reduce(
            (
              sum,
              restaurant
            ) =>
              sum +
              (
                Number(
                  restaurant.reviewScore
                ) ||
                0
              ) *
              (
                Number(
                  restaurant.totalReviews
                ) ||
                0
              ),
            0
          ) /
          reviewed.reduce(
            (
              sum,
              restaurant
            ) =>
              sum +
              (
                Number(
                  restaurant.totalReviews
                ) ||
                0
              ),
            0
          )
        )
      : restaurants.length
        ? (
            restaurants.reduce(
              (
                sum,
                restaurant
              ) =>
                sum +
                (
                  Number(
                    restaurant.reviewScore
                  ) ||
                  0
                ),
              0
            ) /
            restaurants.length
          )
        : null;

  return {
    scopeTitle:
      restaurants.length >
        1
        ? "集团视角"
        : restaurants[0]
          ?.name ??
          "单店视角",

    scopeSubtitle:
      restaurants.length
        ? (
            "管理旗下 " +
            restaurants.length +
            " 家门店"
          )
        : "尚未创建门店",

    date:
      formatCalendar(
        calendar
      ),

    time:
      formatClock(
        time
      ),

    paused:
      Boolean(
        runtime.paused
      ),

    speed:
      Number(
        runtime.speed
      ) ||
      1,

    money,
    moneyCompact:
      formatCompactMoney(
        money
      ),

    moneyFull:
      formatFullMoney(
        money
      ),

    level:
      level ===
        null
        ? "—"
        : String(
            level
          ),

    rating:
      rating ===
        null
        ? "—"
        : Number(
            rating
              .toFixed(
                1
              )
          ).toString(),

    storeCount:
      restaurants.length
  };
}

function getDistrictScore(
  app,
  district
) {
  const base =
    safeCall(
      0,
      () =>
        app.systems
          .districtSystem
          .getOpportunityScore(
            district
          )
    );

  const event =
    getEventAdjustment(
      app,
      district.id
    );

  return {
    score:
      clamp(
        Math.round(
          base +
          event.score
        ),
        0,
        100
      ),

    event
  };
}

function buildCityModel(
  app,
  selectedDistrictId =
    "cbd"
) {
  const districts =
    safeCall(
      [],
      () =>
        app.systems
          .districtSystem
          .getAll()
    );

  const properties =
    safeCall(
      [],
      () =>
        app.systems
          .propertySystem
          .list()
    );

  const restaurants =
    safeCall(
      [],
      () =>
        app.systems
          .restaurantSystem
          .list()
    );

  const availableProperties =
    properties.filter(
      property =>
        property.status ===
        "available"
    );

  const openedDistrictIds =
    new Set(
      restaurants
        .map(
          restaurant =>
            getRestaurantDistrictId(
              restaurant,
              app.systems
                .propertySystem
            )
        )
        .filter(
          Boolean
        )
    );

  const unlockedDistrictIds =
    buildUnlockedDistrictIds(
      app,
      districts
    );

  const propertyCountByDistrict =
    new Map();

  for (
    const property
    of availableProperties
  ) {
    propertyCountByDistrict.set(
      property.districtId,
      (
        propertyCountByDistrict
          .get(
            property.districtId
          ) ??
        0
      ) +
      1
    );
  }

  const decorated =
    districts.map(
      district => {
        const scoring =
          getDistrictScore(
            app,
            district
          );

        return {
          ...district,
          opportunityScore:
            scoring.score,

          event:
            scoring.event,

          opened:
            openedDistrictIds
              .has(
                district.id
              ),

          unlocked:
            unlockedDistrictIds
              .has(
                district.id
              ),

          availablePropertyCount:
            propertyCountByDistrict
              .get(
                district.id
              ) ??
            0
        };
      }
    );

  const highPotential =
    decorated.filter(
      district =>
        district.unlocked &&
        district
          .opportunityScore >=
          66
    );

  const selectable =
    decorated.filter(
      district =>
        district.unlocked &&
        !district.opened &&
        district
          .availablePropertyCount >
          0
    );

  const locked =
    decorated.filter(
      district =>
        !district.unlocked
    );

  const selected =
    decorated.find(
      district =>
        district.id ===
        selectedDistrictId
    ) ??
    decorated.find(
      district =>
        district.id ===
        "cbd"
    ) ??
    decorated[0] ??
    null;

  const selectedProperties =
    selected
      ? availableProperties
          .filter(
            property =>
              property
                .districtId ===
              selected.id
          )
      : [];

  const averageRentPerSqm =
    selectedProperties.length
      ? Math.round(
          selectedProperties
            .reduce(
              (
                sum,
                property
              ) =>
                sum +
                property.monthlyRent /
                Math.max(
                  1,
                  property.area
                ),
              0
            ) /
          selectedProperties.length
        )
      : selected
        ? Math.round(
            142 *
            selected
              .rentMultiplier
          )
        : 0;

  const demandMultiplier =
    selected
      ?.event
      ?.demandMultiplier ??
    1;

  const spendingMultiplier =
    selected
      ?.event
      ?.spendingMultiplier ??
    1;

  const dailyTraffic =
    selected
      ? Math.round(
          selected.trafficIndex *
          142 *
          demandMultiplier /
          100
        ) *
        100
      : 0;

  const spending =
    selected
      ? Math.max(
          1,
          Math.round(
            selected.spendingPower *
            0.8 *
            spendingMultiplier
          )
        )
      : 0;

  const competitionLabel =
    !selected
      ? "—"
      : selected.competition >=
          75
        ? "激烈"
        : selected.competition >=
            50
          ? "中等"
          : "较低";

  const deliveryLabel =
    !selected
      ? "—"
      : selected.deliveryDemand >=
          75
        ? "高"
        : selected.deliveryDemand >=
            50
          ? "中"
          : "低";

  const opportunities =
    (
      availableProperties.length
        ? availableProperties
            .map(
              property => {
                const district =
                  decorated.find(
                    item =>
                      item.id ===
                      property.districtId
                  );

                return {
                  id:
                    property.id,

                  districtId:
                    property.districtId,

                  title:
                    property.name,

                  badge:
                    district
                      ?.opportunityScore >=
                      66
                      ? "高潜力"
                      : "可选址",

                  body:
                    district
                      ? (
                          district.name +
                          " · " +
                          property.area +
                          "㎡"
                        )
                      : (
                          property.area +
                          "㎡"
                        ),

                  score:
                    (
                      district
                        ?.opportunityScore ??
                      0
                    ) +
                    Math.min(
                      12,
                      Number(
                        property
                          .marketMeta
                          ?.qualityScore ??
                        0
                      ) /
                      8
                    )
                };
              }
            )
        : decorated
            .filter(
              district =>
                district.unlocked &&
                !district.opened
            )
            .map(
              district => ({
                id:
                  "district:" +
                  district.id,

                districtId:
                  district.id,

                title:
                  district.name,

                badge:
                  district
                    .opportunityScore >=
                    66
                    ? "高潜力"
                    : "观察",

                body:
                  district.event
                    .active[0]
                    ?.name ??
                  (
                    "机会指数 " +
                    district
                      .opportunityScore
                  ),

                score:
                  district
                    .opportunityScore
              })
            )
    )
      .sort(
        (
          a,
          b
        ) =>
          b.score -
          a.score
      )
      .slice(
        0,
        3
      );

  const fixedMarkerIds =
    [
      "university",
      "cbd",
      "nightlife",
      "old_town",
      "waterfront_leisure"
    ];

  const markers =
    fixedMarkerIds
      .map(
        id => {
          const district =
            decorated.find(
              item =>
                item.id ===
                id
            );

          if (!district) {
            return null;
          }

          return {
            id:
              district.id,

            title:
              district.name,

            opened:
              district.opened,

            unlocked:
              district.unlocked,

            available:
              district
                .availablePropertyCount >
              0,

            highPotential:
              district
                .opportunityScore >=
              66,

            meta:
              district.opened
                ? "已开店"
                : !district.unlocked
                  ? "待解锁"
                  : district
                      .availablePropertyCount >
                      0
                    ? (
                        district
                          .availablePropertyCount +
                        "套房源"
                      )
                    : district
                        .opportunityScore >=
                        66
                      ? "高潜力"
                      : "观察中"
          };
        }
      )
      .filter(
        Boolean
      );

  const regionCount =
    new Set(
      districts.map(
        district =>
          safeCall(
            "unknown",
            () =>
              app.systems
                .chainSystem
                .getRegionIdForDistrict(
                  district.id
                )
          )
      )
    ).size;

  return {
    totalDistricts:
      decorated.length,

    regionCount,

    counts: {
      all:
        decorated.length,

      opened:
        openedDistrictIds
          .size,

      available:
        selectable.length,

      highPotential:
        highPotential.length,

      locked:
        locked.length
    },

    districts:
      decorated,

    markers,

    selected:
      selected
        ? {
            id:
              selected.id,

            name:
              selected.name,

            highPotential:
              selected
                .opportunityScore >=
              66,

            opened:
              selected.opened,

            unlocked:
              selected.unlocked,

            availablePropertyCount:
              selected
                .availablePropertyCount,

            opportunityScore:
              selected
                .opportunityScore,

            description:
              (
                selected.event
                  .active[0]
                  ?.description ??
                (
                  "客流指数" +
                  selected.trafficIndex +
                  "，消费力" +
                  selected.spendingPower +
                  "，当前机会指数" +
                  selected
                    .opportunityScore +
                  "。"
                )
              ),

            metrics: [
              {
                label:
                  "客流量",
                value:
                  dailyTraffic
                    .toLocaleString(
                      "zh-CN"
                    ) +
                  "/天"
              },
              {
                label:
                  "消费力",
                value:
                  "¥" +
                  spending +
                  "/人"
              },
              {
                label:
                  "平均租金",
                value:
                  "¥" +
                  averageRentPerSqm +
                  "/㎡/月"
              },
              {
                label:
                  "竞争度",
                value:
                  competitionLabel
              },
              {
                label:
                  "外卖需求",
                value:
                  deliveryLabel
              },
              {
                label:
                  "可租房源",
                value:
                  selectedProperties
                    .length +
                  "套"
              }
            ]
          }
        : null,

    opportunities
  };
}

export {
  formatCompactMoney,
  formatFullMoney,
  buildHudModel,
  buildCityModel
};
