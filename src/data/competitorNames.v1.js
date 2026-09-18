const ROOTS = Object.freeze([
  "禾味", "拾味", "家宴", "春禾", "灶里", "巷里", "老街", "邻里", "百味", "食光",
  "烟火", "小满", "丰年", "四季", "一桌", "好食", "谷香", "鲜作", "暖食", "悦味",
  "青禾", "云味", "山野", "江畔", "海棠", "南巷", "北里", "东门", "西桥", "长街",
  "合味", "同席", "盛筵", "味来", "食集", "食里", "味坊", "味庭", "食序", "食刻",
  "晨味", "晚风", "月下", "日常", "新禾", "乐食", "简味", "真味", "原味", "香满",
  "福膳", "知味", "悦席", "丰味", "安食", "和膳", "有味", "好邻", "慢食", "聚味"
]);

const SUFFIXES = Object.freeze([
  "小馆",
  "食堂",
  "厨房",
  "餐厅",
  "饭馆"
]);

export const COMPETITOR_NAME_POOL_V1 =
  Object.freeze(
    ROOTS.flatMap(
      root =>
        SUFFIXES.map(
          suffix =>
            `${root}${suffix}`
        )
    )
  );

export const COMPETITOR_NAME_DATASET_META =
  Object.freeze({
    datasetVersion: "1.0.0",
    total:
      COMPETITOR_NAME_POOL_V1.length,
    rootCount: ROOTS.length,
    suffixCount: SUFFIXES.length
  });
