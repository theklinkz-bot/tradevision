import assert from 'node:assert/strict';
import {
  formatShareDecimal,
  formatShareInteger,
  formatShareSigned,
  getShareStatValues,
  SHARE_CARD_COPY,
} from './PerformanceShareCard';
import { TradeStats } from '../types';

const baseStats: TradeStats = {
  winRate: 80,
  avgRR: 2.1,
  expectancy: 49.5,
  maxDrawdown: 1,
  totalTrades: 5,
  profitFactor: 2.48,
  recoveryFactor: 3.2,
  avgDuration: '12m',
  maxConsecutiveLosses: 1,
  symbolEfficiency: [],
  biasAnalysis: {
    long: { winRate: 75, count: 4 },
    short: { winRate: 100, count: 1 },
  },
  equityCurve: [
    { trade: 1, equity: 0, drawdown: 0 },
    { trade: 2, equity: 1.2, drawdown: 0 },
    { trade: 3, equity: 0.8, drawdown: -0.4 },
    { trade: 4, equity: 2.1, drawdown: 0 },
    { trade: 5, equity: 2.48, drawdown: 0 },
  ],
  performanceByDay: [],
  performanceBySession: [],
};

assert.equal(formatShareInteger(80.4), '80');
assert.equal(formatShareInteger(Number.NaN), '--');
assert.equal(formatShareDecimal(2.481, 2), '2.48');
assert.equal(formatShareDecimal(Infinity, 2), '--');
assert.equal(formatShareSigned(248.48, 2), '+248.48');
assert.equal(formatShareSigned(-1, 1), '-1.0');
assert.equal(formatShareSigned(Number.NaN, 1), '--');

assert.deepEqual(getShareStatValues(baseStats), {
  winRate: '80',
  profitFactor: '2.48',
  netProfit: '+2.48',
  maxDrawdown: '-1.0',
  avgRR: '1:2.1',
  expectancy: '+49.5',
  totalTrades: '5',
  wins: '4',
  losses: '1',
});

assert.equal(SHARE_CARD_COPY.headline, 'I BROKE THE CURVE.');
assert.equal(SHARE_CARD_COPY.mode, 'AFTERBURNER MODE');
assert.equal(SHARE_CARD_COPY.heroLabel, 'WIN RATE');

console.log('PerformanceShareCard formatter tests passed');
