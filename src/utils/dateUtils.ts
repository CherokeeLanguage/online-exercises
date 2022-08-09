export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;

export function dayTrunc(timestamp: number) {
  return Math.floor(timestamp / DAY) * DAY;
}

export function getToday() {
  return dayTrunc(Date.now());
}
