export const LATE_GAME_INVESTMENT_SCHEMA_VERSION = 1;

export const LATE_GAME_INVESTMENTS =
  Object.freeze([
    Object.freeze({
      id: "crm_center",
      name: "熟客CRM中心",
      requiredLevel: 7,
      cost: 80000,
      description: "扩充可识别熟客容量，提高真实熟客识别率。",
      modifiers: Object.freeze({
        customerRecognitionRateBonus: 0.04,
        recognizedCustomerCapacityBonus: 2
      })
    }),
    Object.freeze({
      id: "member_service_center",
      name: "会员服务中心",
      requiredLevel: 8,
      cost: 160000,
      description: "提升会员维护效率，改善成熟会员的留存表现。",
      modifiers: Object.freeze({
        customerRecognitionRateBonus: 0.02,
        memberRetentionMultiplierBonus: 0.02,
        relationshipRiskGraceDays: 7
      })
    }),
    Object.freeze({
      id: "cold_chain_upgrade",
      name: "冷链仓配升级",
      requiredLevel: 9,
      cost: 260000,
      description: "中央厨房冷链升级，延长集中库存有效期。",
      modifiers: Object.freeze({
        centralKitchenShelfLifeMultiplier: 1.2
      })
    }),
    Object.freeze({
      id: "regional_brand_hq",
      name: "区域品牌总部",
      requiredLevel: 10,
      cost: 480000,
      description: "建立区域总部，降低后续进入新经营区的扩张成本。",
      modifiers: Object.freeze({
        regionUnlockCostMultiplier: 0.85
      })
    })
  ]);

export function getLateGameInvestment(
  investmentId
) {
  return (
    LATE_GAME_INVESTMENTS.find(
      item =>
        item.id ===
        investmentId
    ) ??
    null
  );
}
