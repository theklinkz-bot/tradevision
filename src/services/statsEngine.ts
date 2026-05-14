import { AnalysisHistoryItem, TradeStats } from "../types";
import { calculateRMultiple } from "../lib/tradeUtils";

export function calculateTradeStatistics(trades: AnalysisHistoryItem[]): TradeStats {
  const closedTrades = trades.filter(t => t.status !== "Pending");
  const winningTrades = closedTrades.filter(t => t.status === "Win");
  const losingTrades = closedTrades.filter(t => t.status === "Loss");

  const totalTrades = closedTrades.length || 1; // Avoid division by zero
  const winRate = (winningTrades.length / totalTrades) * 100;

  // Calculate R:R and Profits in "R" units
  let totalRR = 0;
  let grossProfitR = 0;
  let grossLossR = 0;
  let maxR = 0;
  let currentR = 0;
  let maxDD = 0;
  let totalDurationMs = 0;
  let tradesWithDuration = 0;
  let currentConsecutiveLosses = 0;
  let maxConsecutiveLosses = 0;
  const equityCurve: TradeStats['equityCurve'] = [{ trade: 0, equity: 0, drawdown: 0 }];

  // Sort trades by timestamp to build a chronological equity curve
  const chronTrades = [...closedTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  chronTrades.forEach((trade, index) => {
    const entry = trade.levels.entry || 0;
    const sl = trade.levels.stopLoss || 0;
    const tp = trade.levels.takeProfit || 0;

    const rr = calculateRMultiple(trade);

    totalRR += Math.max(0, rr); // rr for avgRR is usually the planned one if pending, but here it's closed trades.
    // Actually totalRR should probably be the sum of all 'Win' rewards.

    if (trade.status === "Win") {
      currentR += rr;
      grossProfitR += rr;
      currentConsecutiveLosses = 0;
    } else if (trade.status === "Loss") {
      currentR += rr; // rr is -1
      grossLossR += 1;
      currentConsecutiveLosses++;
      if (currentConsecutiveLosses > maxConsecutiveLosses) {
        maxConsecutiveLosses = currentConsecutiveLosses;
      }
    }
    // BE status: currentR remains unchanged (0R)

    // Duration calculation
    if (trade.exitDate && trade.date) {
      const duration = new Date(trade.exitDate).getTime() - new Date(trade.date).getTime();
      if (duration > 0) {
        totalDurationMs += duration;
        tradesWithDuration++;
      }
    }

    if (currentR > maxR) maxR = currentR;
    const dd = maxR - currentR;
    if (dd > maxDD) maxDD = dd;

    equityCurve.push({
      trade: index + 1,
      equity: Number(currentR.toFixed(2)),
      drawdown: Number((-dd).toFixed(2)),
      tradeId: trade.id,
      date: trade.date,
      symbol: trade.symbol,
      rMultiple: rr
    });
  });

  const avgRR = winningTrades.length > 0 ? totalRR / winningTrades.length : 0;
  
  // Expectancy = (Win Rate * Avg Win) - (Loss Rate * Avg Loss)
  const avgWinR = avgRR;
  const avgLossR = 1; // We defined loss as 1R
  const lossRate = 1 - (winRate / 100);
  const expectancy = ((winRate / 100) * avgWinR) - (lossRate * avgLossR);

  // Advanced Metrics
  const profitFactor = grossLossR > 0 ? grossProfitR / grossLossR : grossProfitR;
  const recoveryFactor = maxDD > 0 ? currentR / maxDD : currentR;
  
  let avgDurationStr = "N/A";
  if (tradesWithDuration > 0) {
    const avgMs = totalDurationMs / tradesWithDuration;
    const hours = Math.floor(avgMs / (1000 * 60 * 60));
    const minutes = Math.floor((avgMs % (1000 * 60 * 60)) / (1000 * 60));
    avgDurationStr = `${hours}h ${minutes}m`;
  }

  // Symbol Efficiency
  const symbols = Array.from(new Set(closedTrades.map(t => t.symbol)));
  const symbolEfficiency = symbols.map(s => {
    const sTrades = closedTrades.filter(t => t.symbol === s);
    const sWins = sTrades.filter(t => t.status === "Win");
    const sWinRate = (sWins.length / sTrades.length) * 100;
    
    let sProfit = 0;
    sTrades.forEach(t => {
      sProfit += calculateRMultiple(t);
    });

    return { symbol: s, winRate: sWinRate, profit: sProfit, count: sTrades.length };
  }).sort((a, b) => b.profit - a.profit);

  // Bias Analysis
  const longTrades = closedTrades.filter(t => t.side === "Long");
  const shortTrades = closedTrades.filter(t => t.side === "Short");

  // Performance by Day
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const performanceByDay = days.map((day, index) => {
    const dTrades = closedTrades.filter(t => {
      const date = new Date(t.date);
      if (isNaN(date.getTime())) return false;
      
      // Convert UTC to GMT+7 (user timezone) to match day boundaries
      const gmt7Date = new Date(date.getTime() + (7 * 60 * 60 * 1000));
      return gmt7Date.getUTCDay() === index;
    });
    const dWins = dTrades.filter(t => t.status === "Win");
    const dWinRate = dTrades.length > 0 ? (dWins.length / dTrades.length) * 100 : 0;
    
    let dProfit = 0;
    dTrades.forEach(t => {
      dProfit += calculateRMultiple(t);
    });

    return { day, winRate: dWinRate, profit: dProfit, count: dTrades.length };
  });

  // Performance by Session (GMT+7)
  const sessions = [
    { name: "Asia", start: 7, end: 11 },    // 07:00 - 11:00 GMT+7
    { name: "London", start: 14, end: 17 },  // 14:00 - 17:00 GMT+7
    { name: "New York", start: 19, end: 22 } // 19:00 - 22:00 GMT+7
  ];

  const performanceBySession = sessions.map(session => {
    const sTrades = closedTrades.filter(t => {
      const date = new Date(t.date);
      if (isNaN(date.getTime())) return false;
      
      // Convert UTC to GMT+7 (user timezone) to match session boundaries
      const gmt7Date = new Date(date.getTime() + (7 * 60 * 60 * 1000));
      const hour = gmt7Date.getUTCHours();
      
      return hour >= session.start && hour < session.end;
    });

    const sWins = sTrades.filter(t => t.status === "Win");
    const sWinRate = sTrades.length > 0 ? (sWins.length / sTrades.length) * 100 : 0;
    
    let sProfit = 0;
    sTrades.forEach(t => {
      sProfit += calculateRMultiple(t);
    });

    return { session: session.name, winRate: sWinRate, profit: sProfit, count: sTrades.length };
  });

  return {
    winRate,
    avgRR,
    expectancy,
    maxDrawdown: maxDD,
    totalTrades: closedTrades.length,
    profitFactor,
    recoveryFactor,
    avgDuration: avgDurationStr,
    maxConsecutiveLosses,
    symbolEfficiency,
    biasAnalysis: {
      long: { 
        winRate: longTrades.length > 0 ? (longTrades.filter(t => t.status === "Win").length / longTrades.length) * 100 : 0,
        count: longTrades.length
      },
      short: { 
        winRate: shortTrades.length > 0 ? (shortTrades.filter(t => t.status === "Win").length / shortTrades.length) * 100 : 0,
        count: shortTrades.length
      }
    },
    equityCurve,
    performanceByDay,
    performanceBySession,
    strategyAnalysis: (() => {
      // Group trades by strategy ID or name (for backward compatibility)
      const strategyGroups: Record<string, { id?: string; name: string; color?: string; trades: AnalysisHistoryItem[] }> = {};
      
      closedTrades.forEach(t => {
        const strategyKey = t.strategyId || t.strategyName;
        if (!strategyKey) return;
        
        if (!strategyGroups[strategyKey]) {
          strategyGroups[strategyKey] = {
            id: t.strategyId,
            name: t.strategyName || 'Unnamed Strategy',
            color: t.strategyColor,
            trades: []
          };
        }
        strategyGroups[strategyKey].trades.push(t);
      });

      return Object.values(strategyGroups).map(group => {
        const sWins = group.trades.filter(t => t.status === "Win");
        const sWinRate = (sWins.length / group.trades.length) * 100;
        let sProfit = 0;
        let totalR = 0;
        group.trades.forEach(t => {
          const r = calculateRMultiple(t);
          sProfit += r;
          if (t.status === "Win") totalR += r;
        });
        const avgR = sWins.length > 0 ? totalR / sWins.length : 0;
        
        return { 
          id: group.id,
          name: group.name, 
          color: group.color,
          count: group.trades.length, 
          winRate: sWinRate, 
          avgR, 
          profit: sProfit 
        };
      }).sort((a, b) => b.profit - a.profit);
    })()
  };
}
