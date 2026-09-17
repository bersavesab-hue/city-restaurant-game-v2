const WEEKDAYS = Object.freeze(["周一", "周二", "周三", "周四", "周五", "周六", "周日"]);

function pad2(value) {
  return String(value).padStart(2, "0");
}

export function toCalendarDate(day) {
  if (!Number.isInteger(day) || day < 1) {
    throw new RangeError("day must be a positive integer");
  }

  const zeroBased = day - 1;
  const year = Math.floor(zeroBased / 360) + 1;
  const dayOfYear = zeroBased % 360;
  const month = Math.floor(dayOfYear / 30) + 1;
  const dayOfMonth = dayOfYear % 30 + 1;
  const weekday = WEEKDAYS[zeroBased % 7];

  return { year, month, dayOfMonth, weekday };
}

export function buildGameClockModel(time, runtime = {}) {
  const calendar = toCalendarDate(time.day);
  const speed = [1, 2, 4].includes(runtime.speed) ? runtime.speed : 1;
  const paused = Boolean(runtime.paused);

  return {
    ...calendar,
    hour: time.hour,
    minute: time.minute,
    clockText: `${pad2(time.hour)}:${pad2(time.minute)}`,
    dateText: `第${calendar.year}年 ${calendar.month}月${calendar.dayOfMonth}日 ${calendar.weekday}`,
    speed,
    paused,
    speedOptions: [1, 2, 4],
    statusText: paused ? "已暂停" : `${speed}×`
  };
}
