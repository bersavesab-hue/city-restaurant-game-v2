import { buildGameClockModel } from "./GameClockModel.js";

function safeName(value, fallback) {
  const text = String(value ?? "").trim();
  return text || fallback;
}

export function buildGlobalTopBarModel({
  restaurantName,
  brandName = null,
  balance = 0,
  storeLevel = 1,
  reputation = null,
  time,
  runtime,
  weather = null,
  currentStoreId = null
}) {
  const clock = buildGameClockModel(time, runtime);

  return {
    restaurantName: safeName(restaurantName, "未命名餐厅"),
    brandName: brandName ? safeName(brandName, null) : null,
    currentStoreId,
    balance,
    storeLevel,
    reputation,
    clock,
    weather: weather
      ? {
          icon: weather.icon ?? null,
          label: weather.label ?? null,
          temperature: weather.temperature ?? null
        }
      : null,
    actions: {
      canRename: true,
      canSwitchStore: true,
      canPause: true,
      speeds: clock.speedOptions
    }
  };
}

export function buildNoticeTickerModel(notices = []) {
  const normalized = notices
    .filter(Boolean)
    .map((notice, index) => ({
      id: notice.id ?? `notice_${index + 1}`,
      type: notice.type ?? "info",
      title: notice.title ?? "经营通报",
      message: String(notice.message ?? ""),
      timeLabel: notice.timeLabel ?? null,
      priority: Number.isFinite(notice.priority) ? notice.priority : 0,
      unread: notice.unread !== false,
      action: notice.action ?? null
    }))
    .sort((a, b) => b.priority - a.priority);

  return {
    current: normalized[0] ?? null,
    unreadCount: normalized.filter(item => item.unread).length,
    items: normalized.slice(0, 50)
  };
}
