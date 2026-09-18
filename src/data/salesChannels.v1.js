import {
  SALES_CHANNEL_SCHEMA_VERSION
} from "./salesChannelRules.js";

function channel({
  id,
  name,
  description,
  defaultActive,
  commissionRate,
  packagingCostPerOrder,
  capacityMultiplier,
  demandMultiplier,
  defaultOrderLimitPerHour,
  defaultPriorityMultiplier = 1,
  onPremiseShare,
  requirement
}) {
  return Object.freeze({
    schemaVersion:
      SALES_CHANNEL_SCHEMA_VERSION,
    id,
    name,
    description,
    defaultActive,
    commissionRate,
    packagingCostPerOrder,
    capacityMultiplier,
    demandMultiplier,
    defaultOrderLimitPerHour,
    defaultPriorityMultiplier,
    onPremiseShare,
    requirement:
      Object.freeze({
        ...requirement
      })
  });
}

export const SALES_CHANNELS_V1 =
  Object.freeze([
    channel({
      id: "dine_in",
      name: "堂食",
      description: "门店现场用餐，依赖座位与前厅服务能力。",
      defaultActive: true,
      commissionRate: 0,
      packagingCostPerOrder: 0,
      capacityMultiplier: 1,
      demandMultiplier: 1,
      defaultOrderLimitPerHour: 36,
      onPremiseShare: 1,
      requirement: {
        restaurantLevel: 1,
        reputation: 0,
        satisfaction: 0
      }
    }),
    channel({
      id: "pickup",
      name: "到店自取",
      description: "顾客提前下单后到店取餐，不占用座位但消耗后厨和取餐能力。",
      defaultActive: false,
      commissionRate: 0,
      packagingCostPerOrder: 120,
      capacityMultiplier: 1.15,
      demandMultiplier: 0.22,
      defaultOrderLimitPerHour: 24,
      onPremiseShare: 0,
      requirement: {
        restaurantLevel: 1,
        reputation: 3,
        satisfaction: 45
      }
    }),
    channel({
      id: "delivery",
      name: "外卖",
      description: "第三方配送渠道，承担平台抽佣与包装成本，不占用门店座位。",
      defaultActive: false,
      commissionRate: 18,
      packagingCostPerOrder: 180,
      capacityMultiplier: 1.35,
      demandMultiplier: 0.38,
      defaultOrderLimitPerHour: 30,
      onPremiseShare: 0,
      requirement: {
        restaurantLevel: 2,
        reputation: 8,
        satisfaction: 50
      }
    }),
    channel({
      id: "reservation",
      name: "预约",
      description: "提前锁定座位和到店时间，适合高客单与多人就餐。",
      defaultActive: false,
      commissionRate: 0,
      packagingCostPerOrder: 0,
      capacityMultiplier: 0.92,
      demandMultiplier: 0.12,
      defaultOrderLimitPerHour: 12,
      onPremiseShare: 1,
      requirement: {
        restaurantLevel: 2,
        reputation: 12,
        satisfaction: 60
      }
    })
  ]);

export const SALES_CHANNEL_DATASET_META =
  Object.freeze({
    schemaVersion:
      SALES_CHANNEL_SCHEMA_VERSION,
    datasetVersion:
      "1.0.0",
    total:
      SALES_CHANNELS_V1.length
  });
