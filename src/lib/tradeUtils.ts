import { AnalysisHistoryItem } from '../types';

export function calculateRMultiple(item: AnalysisHistoryItem): number {
  const entry = item.levels.entry || 0;
  const sl = item.levels.stopLoss || 0;
  const tp = item.levels.takeProfit || 0;

  const risk = Math.abs(entry - sl);
  const reward = Math.abs(tp - entry);
  const rr = risk > 0 ? reward / risk : 0;

  if (item.status === 'Win') return rr;
  if (item.status === 'Loss') return -1;
  if (item.status === 'BE') return 0;
  return 0; // Pending or Neutral
}

const GMT7_OFFSET_MS = 7 * 60 * 60 * 1000;

// Shift a UTC instant into GMT+7 wall-clock. Read fields via getUTC* on the
// result (matches the convention used in statsEngine.ts session/day bucketing).
export function toGmt7(date: Date): Date {
  return new Date(date.getTime() + GMT7_OFFSET_MS);
}

// 'YYYY-MM-DD' trading-day key in GMT+7. Returns null for unparseable input.
export function gmt7DayKey(input: string | Date): string | null {
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return null;
  return toGmt7(d).toISOString().slice(0, 10);
}

// 'YYYY-MM' month key in GMT+7 (streak-freeze monthly reset).
export function gmt7MonthKey(input: string | Date): string | null {
  const key = gmt7DayKey(input);
  return key ? key.slice(0, 7) : null;
}
