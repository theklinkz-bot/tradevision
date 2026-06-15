import assert from 'node:assert/strict';
import { getNinjaAdvisorCopy } from './AnalyticsCommandCenter';
import { TradeStats } from '../types';

const baseStats: TradeStats = {
  winRate: 50,
  avgRR: 1.5,
  expectancy: 0.2,
  maxDrawdown: 1,
  totalTrades: 20,
  profitFactor: 1.4,
  recoveryFactor: 1,
  avgDuration: 'N/A',
  maxConsecutiveLosses: 1,
  symbolEfficiency: [],
  biasAnalysis: {
    long: { winRate: 50, count: 10 },
    short: { winRate: 50, count: 10 },
  },
  equityCurve: [],
  performanceByDay: [],
  performanceBySession: [],
};

const scenarios: Array<TradeStats | undefined> = [
  undefined,
  { ...baseStats, totalTrades: 5, winRate: 85 },
  { ...baseStats, totalTrades: 10 },
  { ...baseStats, maxDrawdown: 6 },
  { ...baseStats, expectancy: 0.5, profitFactor: 2.2, winRate: 60 },
  { ...baseStats, avgRR: 0.8 },
  { ...baseStats, expectancy: -0.3 },
  baseStats,
];

const bannedWords = [
  'ด่า',
  'มึง',
  'ว่ะ',
  'ซ่า',
  'โหด',
  'รวยไม่ไหว',
];

for (const stats of scenarios) {
  const advice = getNinjaAdvisorCopy(stats);
  const copy = `${advice.title} ${advice.message}`;

  for (const word of bannedWords) {
    assert.equal(copy.includes(word), false, `Advisor copy should not include "${word}": ${copy}`);
  }
}

console.log('Analytics advisor copy tests passed');
