export const LATE_GAME_INVESTMENT_SCHEMA_VERSION = 2;

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
