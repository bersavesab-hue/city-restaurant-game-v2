import {
  MEMBER_PROGRAM_SCHEMA_VERSION
} from "./memberProgramRules.js";

function level({
  id,
  name,
  minVisits,
  minSpend,
  minLifetimePoints,
  discount,
  pointMultiplier,
  inactivityDowngradeDays
}) {
  return Object.freeze({
    schemaVersion:
      MEMBER_PROGRAM_SCHEMA_VERSION,
    id,
    name,
    minVisits,
    minSpend,
    minLifetimePoints,
    minPoints:
      minLifetimePoints,
    discount,
    pointMultiplier,
    inactivityDowngradeDays
  });
}

export const MEMBER_LEVELS_V1 =
  Object.freeze([
    level({
      id: "member",
      name: "注册会员",
      minVisits: 0,
      minSpend: 0,
      minLifetimePoints: 0,
      discount: 0,
      pointMultiplier: 1,
      inactivityDowngradeDays: null
    }),
    level({
      id: "silver",
      name: "银卡会员",
      minVisits: 3,
      minSpend: 3000,
      minLifetimePoints: 30,
      discount: 2,
      pointMultiplier: 1.1,
      inactivityDowngradeDays: 120
    }),
    level({
      id: "gold",
      name: "金卡会员",
      minVisits: 8,
      minSpend: 12000,
      minLifetimePoints: 120,
      discount: 4,
      pointMultiplier: 1.25,
      inactivityDowngradeDays: 150
    }),
    level({
      id: "black",
      name: "黑金会员",
      minVisits: 20,
      minSpend: 40000,
      minLifetimePoints: 400,
      discount: 6,
      pointMultiplier: 1.5,
      inactivityDowngradeDays: 180
    })
  ]);

export const MEMBER_PROGRAM_DATASET_META =
  Object.freeze({
    schemaVersion:
      MEMBER_PROGRAM_SCHEMA_VERSION,
    datasetVersion: "1.0.0",
    levels:
      MEMBER_LEVELS_V1.length,
    pointExpiryDays: 180
  });
