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
