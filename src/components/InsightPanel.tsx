import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  BrainCircuit, 
  Zap,
  Target,
  ArrowUpRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff
} from 'lucide-react';
import { TradeStats } from '../types';

interface InsightPanelProps {
  stats: TradeStats;
  t: any;
}

interface Insight {
  id: string;
  type: 'positive' | 'warning' | 'neutral';
  icon: any;
  title: string;
  description: string;
  action?: string;
}

export const InsightPanel = ({ stats, t }: InsightPanelProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const isTH = t.ui.dashboard === "แดชบอร์ด";

  const insights = React.useMemo(() => {
    const list: Insight[] = [];

    // 1. Profit Leader
    if (stats.symbolEfficiency && stats.symbolEfficiency.length > 0) {
      const best = [...stats.symbolEfficiency].sort((a, b) => b.profit - a.profit)[0];
      if (best && best.profit > 0) {
        list.push({
          id: 'best-symbol',
          type: 'positive',
          icon: TrendingUp,
          title: isTH ? `พบสินทรัพย์ที่ทำกำไรสูงสุด: ${best.symbol}` : `Alpha Asset Identified: ${best.symbol}`,
          description: isTH 
            ? `ทำกำไรสุทธิได้ถึง ${best.profit.toFixed(2)}R แนะนำให้โฟกัสการเทรดสินทรัพย์นี้เป็นหลัก`
            : `Generating ${best.profit.toFixed(2)}R net yield. Focus on capturing high-probability flows for this node.`,
          action: isTH ? `เพิ่มสัดส่วนการเทรดใน ${best.symbol}` : 'Weight allocation towards ' + best.symbol
        });
      }
    }

    // 2. Winrate Consistency
    if (stats.winRate >= 60) {
      list.push({
        id: 'high-winrate',
        type: 'positive',
        icon: ShieldCheck,
        title: isTH ? 'ตรวจพบความได้เปรียบของระบบ' : 'Neural Edge Detected',
        description: isTH
          ? `Win Rate ปัจจุบันอยู่ที่ ${stats.winRate.toFixed(1)}% ระบบของคุณได้รับการปรับแต่งมาอย่างดีเยี่ยม`
          : `Current win probability is ${stats.winRate.toFixed(1)}%. Your execution matrix is highly calibrated for current volatility.`,
        action: isTH ? 'รักษาวินัยและแผนการเทรดอย่างเคร่งครัด' : 'Maintain strict risk parameters'
      });
    }

    // 3. Directional Bias
    const longWr = stats.biasAnalysis.long.winRate;
    const shortWr = stats.biasAnalysis.short.winRate;
    if (Math.abs(longWr - shortWr) > 15 && stats.totalTrades > 5) {
      const betterSide = longWr > shortWr ? (isTH ? 'ขาขึ้น (Long)' : 'Bullish') : (isTH ? 'ขาลง (Short)' : 'Bearish');
      list.push({
        id: 'bias-insight',
        type: 'neutral',
        icon: BrainCircuit,
        title: isTH ? `ความแม่นยำโน้มเอียงไปทางฝั่ง ${betterSide}` : `${betterSide} Efficiency Skew`,
        description: isTH
          ? `สถิติบ่งบอกถึงความน่าจะเป็นที่สูงกว่าในฝั่ง ${betterSide} (${Math.max(longWr, shortWr).toFixed(1)}% WR)`
          : `Probability distribution favors ${betterSide} expansions (${Math.max(longWr, shortWr).toFixed(1)}% WR).`,
        action: isTH ? `เน้นหาจังหวะเทรดฝั่ง ${betterSide} เป็นหลัก` : `Filter for ${betterSide} high-timeframe setups`
      });
    }

    // 4. Consecutive Loss Warning
    if (stats.maxConsecutiveLosses >= 3) {
      list.push({
        id: 'loss-streak',
        type: 'warning',
        icon: AlertTriangle,
        title: isTH ? 'คำเตือน: ความเสี่ยงจากการแพ้ติดกัน' : 'Sequential Failure Risk',
        description: isTH
          ? `พบการแพ้ติดต่อกันถึง ${stats.maxConsecutiveLosses} ครั้ง อาจเกิดจากความล้าในการเทรด`
          : `Peak sequence of ${stats.maxConsecutiveLosses} losses detected. Neural fatigue may be impacting execution quality.`,
        action: isTH ? 'ควรหยุดพักทันทีหากแพ้ติดต่อกันเกิน 2 ครั้ง' : 'Implement mandatory cooldown after 2 losses'
      });
    }

    // 5. Recovery / Resilience
    if (stats.recoveryFactor > 3) {
      list.push({
        id: 'recovery-strength',
        type: 'positive',
        icon: Zap,
        title: isTH ? 'ความแข็งแกร่งในการฟื้นตัว' : 'Architectural Resilience',
        description: isTH
          ? `ค่า Recovery Factor อยู่ที่ ${stats.recoveryFactor.toFixed(2)} แสดงถึงความสามารถในการทำกำไรคืนหลังจากขาดทุนได้เร็ว`
          : `Recovery Factor of ${stats.recoveryFactor.toFixed(2)} indicates high capacity to regain capital after drawdown events.`,
        action: isTH ? 'เทรดด้วยแผน R-multiple ต่อไป' : 'Continue disciplined R-multiple extraction'
      });
    }

    // 6. Low Volume Warning
    if (stats.totalTrades < 10) {
      list.push({
        id: 'low-data',
        type: 'neutral',
        icon: Target,
        title: isTH ? 'ข้อมูลยังไม่เพียงพอ' : 'Sparse Data Matrix',
        description: isTH 
          ? 'ชุดข้อมูลยังน้อยเกินไปสำหรับการวิเคราะห์ที่แม่นยำ แนะนำให้เพิ่มบันทึกการเทรด'
          : 'Dataset nodes are insufficient for high-confidence predictive modeling. Continued node entry required.',
        action: isTH ? 'สะสมบันทึกการเทรดเพิ่มเติม' : 'Acquire more trade event data'
      });
    }

    return list.slice(0, 4); // Show top 4 insights
  }, [stats, isTH]);

  if (insights.length === 0) return null;

  return (
    <div className="lg:col-span-6 mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-brand-accent/20 flex items-center justify-center border border-brand-accent/40">
            <Lightbulb size={14} className="text-brand-accent animate-pulse" />
          </div>
          <div>
            <h2 className="label-caps !mb-0 text-brand-text-bright flex items-center gap-2 text-[10px]">
              {t.ui.ai_neural_insights}
              <span className="text-[7px] bg-brand-accent/10 border border-brand-accent/20 px-1.5 py-0.5 rounded text-brand-accent">LIVE</span>
            </h2>
          </div>
        </div>

        <button 
          onClick={() => setIsVisible(!isVisible)}
          className="flex items-center gap-2 px-2 py-1 rounded bg-brand-elevated border border-brand-border/30 text-[8px] font-mono uppercase tracking-wider text-brand-text-dim hover:text-brand-accent hover:border-brand-accent/40 transition-all group"
        >
          {isVisible ? (
            <>
              <EyeOff size={12} className="opacity-40 group-hover:opacity-100" />
              {t.ui.hide_insights}
            </>
          ) : (
            <>
              <Eye size={12} className="opacity-40 group-hover:opacity-100" />
              {t.ui.show_insights}
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-1">
              {insights.map((insight, idx) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`technical-panel p-4 flex flex-col gap-3 relative overflow-hidden group transition-all hover:bg-brand-elevated/40 border-brand-border/40 ${
                    insight.type === 'positive' ? 'hover:border-trade-long/30' : 
                    insight.type === 'warning' ? 'hover:border-trade-short/30' : 
                    'hover:border-brand-accent/30'
                  }`}
                >
                  {/* Background Accent */}
                  <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none ${
                    insight.type === 'positive' ? 'bg-trade-long' : 
                    insight.type === 'warning' ? 'bg-trade-short' : 
                    'bg-brand-accent'
                  }`} />

                  <div className="flex items-start justify-between relative z-10">
                    <div className={`p-2 rounded-lg bg-brand-elevated border border-brand-border/30 shadow-inner ${
                      insight.type === 'positive' ? 'text-trade-long shadow-trade-long/5' : 
                      insight.type === 'warning' ? 'text-trade-short shadow-trade-short/5' : 
                      'text-brand-accent shadow-brand-accent/5'
                    }`}>
                      <insight.icon size={18} />
                    </div>
                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-20 transition-opacity" />
                  </div>

                  <div className="flex flex-col gap-1 relative z-10">
                    <h4 className="text-[11px] font-bold uppercase tracking-tight text-brand-text-bright/90 leading-tight">
                      {insight.title}
                    </h4>
                    <p className="text-[10px] text-brand-text-dim leading-relaxed font-mono opacity-60">
                      {insight.description}
                    </p>
                  </div>

                  {insight.action && (
                    <div className="mt-auto pt-3 border-t border-brand-border/10 flex items-center gap-2 relative z-10">
                      <div className={`w-1 h-1 rounded-full animate-pulse ${
                        insight.type === 'positive' ? 'bg-trade-long' : 
                        insight.type === 'warning' ? 'bg-trade-short' : 
                        'bg-brand-accent'
                      }`} />
                      <span className={`text-[8px] font-black uppercase tracking-widest opacity-80 ${
                        insight.type === 'positive' ? 'text-trade-long' : 
                        insight.type === 'warning' ? 'text-trade-short' : 
                        'text-brand-accent'
                      }`}>
                        Action: {insight.action}
                      </span>
                    </div>
                  )}

                  {/* Scanning line animation */}
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-brand-accent/20 to-transparent translate-y-[-100%] group-hover:animate-scan pointer-events-none" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
