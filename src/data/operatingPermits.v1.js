import {
  OPERATING_PERMIT_SCHEMA_VERSION
} from "./operatingPermitRules.js";

function permit({
  permitKind,
  name,
  description,
  applicationFee,
  processingDays,
  validityDays,
  renewalFee,
  inspectionIntervalDays
}) {
  return Object.freeze({
    schemaVersion:
      OPERATING_PERMIT_SCHEMA_VERSION,
    permitKind,
    name,
    description,
    applicationFee,
    processingDays,
    validityDays,
    renewalFee,
    inspectionIntervalDays
  });
}

export const OPERATING_PERMITS_V1 =
  Object.freeze([
    permit({
      permitKind:
        "business_registration",
      name:
        "经营登记",
      description:
        "确认经营主体、经营地址与租赁关系。",
      applicationFee: 300,
      processingDays: 1,
      validityDays: 720,
      renewalFee: 200,
      inspectionIntervalDays: 180
    }),
    permit({
      permitKind:
        "food_service",
      name:
        "餐饮经营许可",
      description:
        "确认经营场所、厨房与餐饮经营条件。",
      applicationFee: 800,
      processingDays: 2,
      validityDays: 365,
      renewalFee: 600,
      inspectionIntervalDays: 90
    }),
    permit({
      permitKind:
        "fire_safety",
      name:
        "消防与营业安全检查",
      description:
        "确认装修、通道、餐位与厨房基础安全条件。",
      applicationFee: 600,
      processingDays: 2,
      validityDays: 365,
      renewalFee: 450,
      inspectionIntervalDays: 120
    }),
    permit({
      permitKind:
        "exhaust",
      name:
        "排烟条件备案",
      description:
        "热厨经营时确认房源排烟与相关设施条件。",
      applicationFee: 400,
      processingDays: 1,
      validityDays: 365,
      renewalFee: 300,
      inspectionIntervalDays: 120
    })
  ]);

export const OPERATING_PERMIT_DATASET_META =
  Object.freeze({
    schemaVersion:
      OPERATING_PERMIT_SCHEMA_VERSION,
    datasetVersion:
      "1.0.0",
    total:
      OPERATING_PERMITS_V1.length
  });
