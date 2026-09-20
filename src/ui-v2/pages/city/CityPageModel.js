import {\n  getCityDistrictVisual\n} from "./CityMapVisualLayout.js";\n\nconst FILTER_IDS =
  Object.freeze([
    "all",
    "opened",
    "available",
    "high-potential",
    "locked"
  ]);

const FILTER_LABELS =
  Object.freeze({
    all: "全部",
    opened: "已开店",
    available: "可选址",
    "high-potential": "高潜力",
    locked: "待解锁"
  });

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

function formatInteger(
  value
) {
  return new Intl.NumberFormat(
    "zh-CN",
    {
      maximumFractionDigits: 0
    }
  ).format(
    Math.round(
      Number(value) ||
      0
    )
  );
}

function getCompetitionLabel(
  value
) {
  const score =
    Number(value) ||
    0;

  if (score >= 78) {
    return "高";
  }

  if (score >= 52) {
    return "中等";
  }

  return "较低";
}

function getDemandLabel(
  value
) {
  const score =
    Number(value) ||
    0;

  if (score >= 78) {
    return "高";
  }

  if (score >= 52) {
    return "中";
  }

  return "低";
}

function buildCityPageModel({
  districts = [],
  restaurants = [],
  properties = [],
  opportunityScore = null
} = {}) {
  const propertyById =
    new Map(
      properties.map(
        item => [
          item.id,
          item
        ]
      )
    );

  const openedDistrictIds =
    new Set(
      restaurants
        .map(
          restaurant =>
            propertyById.get(
              restaurant.locationId
            )?.districtId ??
            null
        )
        .filter(
          Boolean
        )
    );

  const availableByDistrict =
    new Map();

  const rentSamplesByDistrict =
    new Map();

  for (
    const property
    of properties
  ) {
    if (
      property.status ===
      "available"
    ) {
      availableByDistrict.set(
        property.districtId,
        (
          availableByDistrict.get(
            property.districtId
          ) ??
          0
        ) +
        1
      );
    }

    if (
      Number.isFinite(
        Number(
          property.monthlyRent
        )
      ) &&
      Number.isFinite(
        Number(
          property.area
        )
      ) &&
      Number(
        property.area
      ) > 0
    ) {
      const list =
        rentSamplesByDistrict.get(
          property.districtId
        ) ??
        [];

      list.push(
        Number(
          property.monthlyRent
        ) /
        Number(
          property.area
        )
      );

      rentSamplesByDistrict.set(
        property.districtId,
        list
      );
    }
  }

  const districtModels =
    districts.map(
      district => {
        const availableProperties =
          availableByDistrict.get(
            district.id
          ) ??
          0;

        const score =
          typeof opportunityScore ===
            "function"
            ? Number(
                opportunityScore(
                  district
                )
              ) ||
              0
            : Math.round(
                (
                  Number(
                    district.trafficIndex
                  ) ||
                  50
                ) *
                  0.38 +
                (
                  Number(
                    district.spendingPower
                  ) ||
                  50
                ) *
                  0.32 +
                (
                  100 -
                  (
                    Number(
                      district.competition
                    ) ||
                    50
                  )
                ) *
                  0.3
              );

        const rentSamples =
          rentSamplesByDistrict.get(
            district.id
          ) ??
          [];

        const rentPerSqm =
          rentSamples.length > 0
            ? Math.round(
                rentSamples.reduce(
                  (
                    total,
                    value
                  ) =>
                    total +
                    value,
                  0
                ) /
                rentSamples.length
              )
            : Math.max(
                1,
                Math.round(
                  (
                    Number(
                      district.rentMultiplier
                    ) ||
                    1
                  ) *
                    90
                )
              );

        const opened =
          openedDistrictIds.has(
            district.id
          );

        const locked =
          Boolean(
            district.locked
          );

        const highPotential =
          !locked &&
          score >= 66;

        const visual =
          getCityDistrictVisual(
            district.id,
            {
              x:
                district.mapPosition?.x,
              y:
                district.mapPosition?.y
            }
          );

        return {
          id:
            district.id,

          name:
            district.name,

          x:
            clamp(
              Number(
                visual.x
              ) ||
              50,
              7,
              93
            ),

          y:
            clamp(
              Number(
                visual.y
              ) ||
              50,
              8,
              90
            ),

          visualTheme:
            visual.theme,

          iconKey:
            visual.iconKey,

          opened,
          locked,
          highPotential,

          available:
            !locked &&
            availableProperties >
              0,

          availableProperties,
          opportunityScore:
            score,

          traffic:
            Math.max(
              0,
              Math.round(
                (
                  Number(
                    district.trafficIndex
                  ) ||
                  0
                ) *
                  140
              )
            ),

          spending:
            Math.max(
              0,
              Math.round(
                Number(
                  district.spendingPower
                ) ||
                0
              )
            ),

          rentPerSqm,

          competition:
            Number(
              district.competition
            ) ||
            0,

          deliveryDemand:
            Number(
              district.deliveryDemand
            ) ||
            0,

          description:
            buildDistrictDescription(
              district,
              score
            )
        };
      }
    );

  const counts = {
    all:
      districtModels.length,

    opened:
      districtModels.filter(
        item =>
          item.opened
      ).length,

    available:
      districtModels.filter(
        item =>
          item.available
      ).length,

    "high-potential":
      districtModels.filter(
        item =>
          item.highPotential
      ).length,

    locked:
      districtModels.filter(
        item =>
          item.locked
      ).length
  };

  const selectedDistrict =
    districtModels.find(
      item =>
        item.opened
    ) ??
    districtModels.find(
      item =>
        item.id ===
        "cbd"
    ) ??
    districtModels[0] ??
    null;

  const opportunities =
    districtModels
      .filter(
        item =>
          !item.locked
      )
      .sort(
        (a,b) =>
          b.opportunityScore -
          a.opportunityScore
      )
      .slice(
        0,
        3
      )
      .map(
        item => ({
          districtId:
            item.id,
          title:
            item.name,
          tag:
            item.opened
              ? "经营增长"
              : item.highPotential
                ? "高潜力"
                : "可选址",
          detail:
            buildOpportunityText(
              item
            )
        })
      );

  return {
    filters:
      FILTER_IDS.map(
        id => ({
          id,
          label:
            FILTER_LABELS[
              id
            ],
          count:
            counts[
              id
            ] ??
            0
        })
      ),

    totalDistricts:
      counts.all,

    openedDistricts:
      counts.opened,

    districts:
      districtModels,

    selectedDistrict,
    opportunities
  };
}

function buildDistrictDescription(
  district,
  score
) {
  const traffic =
    Number(
      district.trafficIndex
    ) ||
    0;

  const spending =
    Number(
      district.spendingPower
    ) ||
    0;

  if (
    traffic >= 82 &&
    spending >= 75
  ) {
    return "核心客流与消费能力都很强，适合打造品牌旗舰门店。";
  }

  if (
    score >= 66
  ) {
    return "当前综合机会突出，适合重点关注选址与门店扩张。";
  }

  if (
    spending >= 72
  ) {
    return "客群消费能力较强，更适合品质型和特色餐饮布局。";
  }

  return "客群结构稳定，可结合租金与竞争情况选择合适经营定位。";
}

function buildOpportunityText(
  district
) {
  if (
    district.availableProperties >=
    3
  ) {
    return (
      "当前有" +
      district.availableProperties +
      "个可租房源，选址空间充足。"
    );
  }

  if (
    district.deliveryDemand >=
    78
  ) {
    return "外卖需求活跃，适合布局高周转餐饮。";
  }

  if (
    district.traffic >=
    11000
  ) {
    return "客流表现突出，近期值得重点关注。";
  }

  return "综合机会正在上升，适合提前布局。";
}

function isDistrictVisibleForFilter(
  district,
  filterId
) {
  switch (
    filterId
  ) {
    case "opened":
      return district.opened;

    case "available":
      return district.available;

    case "high-potential":
      return district.highPotential;

    case "locked":
      return district.locked;

    default:
      return true;
  }
}

export {
  FILTER_IDS,
  buildCityPageModel,
  getCompetitionLabel,
  getDemandLabel,
  isDistrictVisibleForFilter,
  formatInteger
};
