/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Activity,
  Code,
  Layout,
  Terminal,
  Database,
  Cpu,
  Save,
  CheckCircle2,
  BarChart3,
  PieChart,
  Filter,
  Palette,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  ShieldCheck,
  RefreshCcw,
  Download,
  Camera,
  Image as ImageIcon,
  Maximize2,
  X,
  HelpCircle,
  ExternalLink,
  Info,
  Search,
  Globe,
  Menu,
  Shield,
  Trash2,
  StickyNote,
  Plus
} from 'lucide-react';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { analyzeTradeScreenshot } from './services/geminiService';
import { GoogleGenAI } from '@google/genai';
import { AnalysisHistoryItem, TradeStatus, TradeStats, TranslationSchema } from './types';
import { calculateTradeStatistics } from './services/statsEngine';
import { calculateRMultiple } from './lib/tradeUtils';
import { TradeRow, MobileLogItem } from './components/TradeCard';
import { StatsPanel, DataCard, PriceLevel } from './components/StatsPanel';
import { EquityChart } from './components/EquityChart';
import { InsightPanel } from './components/InsightPanel';
import { PerformanceDashboard } from './components/PerformanceDashboard';
import { SignalValidationOverlay, ExpandedImageOverlay } from './components/UploadModal';
import { 
  fetchTradesFromSupabase, 
  saveTradeToSupabase, 
  updateTradeInSupabase, 
  deleteTradeFromSupabase,
  submitFeedbackToSupabase,
  fetchFeedbackFromSupabase,
  updateFeedbackStatus,
  syncProfile,
  fetchProfiles,
  fetchStrategiesFromSupabase,
  saveStrategyToSupabase,
  updateStrategyInSupabase,
  deleteStrategyFromSupabase,
  supabase
} from './lib/supabase';
import { User } from '@supabase/supabase-js';
import { Strategy } from './types';

const TRANSLATIONS: Record<'EN' | 'TH', TranslationSchema> = {
  EN: {
    modes: {
      live: "Live Matrix",
      backtest: "Backtest Node"
    },
    status: {
      win: "Win",
      loss: "Loss",
      be: "BE",
      pending: "Pending"
    },
    ui: {
      dashboard: "Dashboard",
      log: "Log",
      analytics: "Analytics (Reserve)",
      gallery: "Gallery",
      system: "System",
      admin: "Admin",
      save: "Save",
      delete: "Delete",
      upload: "Upload",
      confirm: "Confirm",
      cancel: "Cancel",
      performance_stats: "Analytics Stats",
      no_trades: "No trades yet",
      recent_extractions: "Recent Extractions",
      no_signals: "No signals detected",
      engine_processing: "ENGINE_PROCESSING",
      engine_online: "ENGINE_ONLINE",
      theme: "Theme",
      new_scan: "New Scan",
      system_status: "SYSTEM STATUS",
      environment_matrix: "Environment Matrix",
      identity_management: "Identity Management",
      active_pilot: "Active Pilot",
      unique_neural_id: "Unique Neural ID",
      deauthorize_session: "De-authorize Session",
      trade_intelligence_log: "Trade Intelligence Log",
      export_csv: "Export CSV",
      result: "Result",
      source_image: "Source Image",
      system_warnings: "System Warnings",
      gemini_vision_guide: "Establish Link Guide",
      raw_output: "RAW_OUTPUT.JSON",
      back: "Back",
      save_success: "Signal successfully persisted",
      capture_guide: "Optimal Capture Protocol",
      examine_setup: "Examine Setup",
      live_mode: "Live Mode",
      backtest_mode: "Backtest Mode",
      visual_repository: "Visual repository of analyzed market setups",
      insufficient_data: "Insufficient Ingestion",
      stats_engine_requirement: "The Statistics Engine requires closed trade state data for computation.",
      neural_visual_input: "Neural Visual Input",
      validate_levels_desc: "Validate that the AI's detected levels match the markers in your screenshot before adding to memory bank.",
      signal_validation_protocol: "Signal Validation Protocol",
      manual_calibration: "Manual Calibration Overwrite Required",
      pair_ticker: "Pair / Ticker",
      bias_direction: "Bias / Direction",
      strategy_mapping: "Strategy Mapping",
      new_strategy: "New Strategy",
      no_strategies: "No neural strategies found",
      execution_levels: "Execution Levels calibration",
      entry_matrix: "Entry Matrix",
      profit_goal: "Profit Goal",
      risk_threshold: "Risk Threshold",
      signal_outcome: "Signal Outcome",
      authorize_save: "AUTHORIZE SAVE",
      abort_interface: "Abort Interface / Manual Overlook",
      extraction_protocol_desc: "Extraction Protocol: Visual Requirements",
      purge_node: "PURGE NODE // IRREVERSIBLE",
      confirm_purge: "CONFIRM?",
      edit_node: "Edit Node",
      edit_protocol: "Edit Protocol",
      slide_to_purge: "Slide to Purge",
      neural_hub: "Neural Hub",
      navigation_matrix: "Navigation Matrix",
      show_insights: "Show Insights",
      hide_insights: "Hide Insights",
      how_to_capture: "How to capture?",
      offline_warning: "Neural Engine Offline",
      byok_required: "Personal Gemini API Key required for vision processing.",
      authorize_node: "Authorize Node",
      ingest_visual: "Neural Visual Input",
      drop_image: "Drop your screenshot here or click to browse",
      extraction_pipeline: "Extraction Pipeline",
      visual_output: "Visual Output",
      json_model: "JSON Model",
      validated_persistence: "Validated Persistence",
      syncing: "Syncing...",
      committed: "Committed",
      performance: "ANALYTICS",
      privacy_policy_notice: "Your API key is stored locally in your browser's encrypted matrix and is never transmitted to our central servers.",
      close_guide: "Protocol Acknowledged",
      feedback_title: "SUPPORT & FEEDBACK",
      feedback_subtitle: "Nexus Communications",
      feedback_label_category: "Transmission Category",
      feedback_label_subject: "Signal Subject",
      feedback_placeholder_subject: "Core identifier...",
      feedback_label_details: "Data Stream Details",
      feedback_placeholder_details: "Describe your feedback or technical issue in detail...",
      feedback_success: "Transmission Success",
      feedback_button: "TRANSMIT_SIGNAL",
      ai_neural_insights: "AI Neural Insights",
      probability_spectrum: "Probability Spectrum",
      system_accuracy: "System Accuracy",
      profit_factor: "Profit Factor",
      eff_coeff: "Eff. Coeff",
      risk_reward: "Risk:Reward",
      statistical_edge: "Statistical Edge",
      yield_node: "Yield Node",
      max_drawdown_label: "Max Drawdown",
      risk_boundary: "Risk Boundary",
      leading_symbols: "Leading Symbols",
      directional_bias: "Directional Bias",
      day_profile: "Day Profile",
      performance_architecture: "Analytics Architecture",
      resistance: "Resistance",
      strict_delta_excursion: "Strict Delta Excursion",
      peak_decay: "Peak Decay"
    },
    performance: {
      net_profit: "Net Profit (R)",
      expectancy: "Expectancy",
      max_drawdown: "Max Drawdown",
      win_rate: "Win Rate",
      equity_curve: "Equity Curve",
      drawdown_chart: "Drawdown Chart",
      edge_analysis: "Edge Analysis",
      setup_performance: "Setup Performance",
      session_performance: "Session Performance",
      time_analysis: "Time Analysis",
      risk_behavior: "Risk & Behavior",
      discipline_rate: "Discipline Rate",
      revenge_trading: "Revenge Trading",
      overtrading_indicator: "Overtrading Indicator",
      consecutive_losses: "Consecutive Losses",
      best_category: "Best Category",
      worst_category: "Worst Category",
      high_risk: "High Risk",
      stable: "Stable",
      needs_attention: "Needs Attention",
      net_profit_desc: "Cumulative R-units generated.",
      expectancy_desc: "Average R returned per trade.",
      max_dd_desc: "Peak-to-valley decline.",
      win_rate_desc: "Percentage of winning trades.",
      drawdown_recovery: "Recovery time observed for max drawdown.",
      asia: "Asia",
      london: "London",
      new_york: "New York",
      ai_insights: "AI Strategic Insights",
      best_setup_insight: "Optimized Protocol: Setup '{name}' yielding {winrate}% efficiency.",
      best_session_insight: "Efficiency Window: {session} session identified as highest yield zone.",
      risk_warning_insight: "Risk Protocol Warning: Current trajectory exceeds safe variance parameters.",
      high_drawdown_warning: "Critical Drawdown: {value}R excursion detected. Risk reduction mandatory.",
      low_discipline_warning: "Behavioral Alert: Discipline rate at {value}%. Protocol fatigue imminent.",
      system_edge: "SYSTEM EDGE",
      trade_more: "TRADE MORE",
      avoid: "AVOID",
      risk_low: "LOW",
      risk_medium: "MEDIUM",
      risk_high: "HIGH",
      prop_firm_warning: "This drawdown would violate standard prop firm risk limits.",
      suggested_action: "Suggested Action",
      lockdown_timer: "Lockdown Timer",
      lockdown_trigger: "Trigger: Max Daily Loss Reached",
      peak_equity: "Peak Equity",
      current_equity: "Current Equity",
      initiate_lockdown: "Initiate Lockdown"
    },
    guide: {
      title: "Google Gemini API Connection Protocol",
      step1_title: "Generate API Key",
      step1_sub: "Access the Google AI Studio decentralized hub to secure your personal neural token.",
      step2_title: "Copy Authorization Token",
      step2_sub: "Transfer the generated key into your local buffer for integration.",
      step3_title: "Neural Bridge Integration",
      step3_sub: "Paste the key into the 'System' matrix within this interface.",
      step4_title: "Verify Connection",
      step4_sub: "Initialize the 'Verify Link' sequence to activate the Gemini Vision Engine.",
      privacy: "Your core key remains isolated within your browser's local memory and never touches our global relay nodes.",
      close: "Protocol Acknowledged"
    },
    analytics: {
      winrate: "The percentage of profitable execution events relative to total recorded nodes.",
      pf: "Profit Factor: Gross Profit / Gross Loss. A value > 1.0 indicates a net positive system.",
      avgrr: "Average Risk to Reward ratio across all validated signals.",
      expectancy: "Statistical expectancy per node. Represents the average R-value returned per execution.",
      maxdd: "Maximum observed peak-to-valley decline in system equity represented in R-units.",
      recovery: "Recovery Factor: Net Profit / Maximum Drawdown. Measures system resilience.",
      consecutive_loss: "Maximum sequence of negative outcomes observed in the current matrix.",
      total_trades: "Total number of ingested and verified data nodes."
    },
    system: {
      title: "Bring Your Own Intelligence",
      description: "Supply your own Google Gemini API Key. This token is stored exclusively in your local storage matrix and never touches our central servers.",
      label: "Gemini API Key",
      guide: "Establish Link Guide",
      verify: "Verify Link",
      verified: "Link Verified",
      neural_active: "Neural Bridge Established // Encryption Active",
      get_key: "Get your key from",
      persistence_title: "Data Persistence & Privacy",
      persistence_subtitle: "Vector Matrix Security",
      persistence_protocol: "CORE_PRIVACY_PROTOCOL",
      persistence_item1: "Signal extraction is isolated to your Neural Profile and never shared across global nodes.",
      persistence_item2: "Storage persists in encrypted Supabase containers with strict Row-Level Security (RLS).",
      persistence_item3: "Neural feedback is audited only for system calibration and architectural debugging.",
      persistence_sync: "AUTO-SYNC",
      persistence_encryption: "E2E_ENCRYPTION"
    },
    capture: {
      title: "Optimal Capture Protocol",
      how: "How to capture?",
      guide_btn: "Optimal Capture Protocol",
      step1: "Visible Markers",
      step1_sub: "Verify SL, Entry, and TP lines are clearly visible on the chart canvas.",
      step2: "Axis Alignment",
      step2_sub: "Ensure both Price Axis (Right) and Time Axis (Bottom) are included for accurate timestamping.",
      step3: "Value Labels",
      step3_sub: "Enable price labels for tools like Support/Resistance or Fibonacci levels.",
      trade_notes: "Trade Notes // Observations",
      notes_placeholder: "Describe the market context, your emotional state, or logical thesis behind this signal..."
    }
  },
  TH: {
    modes: {
      live: "Live Matrix",
      backtest: "Backtest Node"
    },
    status: {
      win: "Win",
      loss: "Loss",
      be: "BE",
      pending: "รอดำเนินการ"
    },
    ui: {
      dashboard: "แดชบอร์ด",
      log: "บันทึกการเทรด",
      analytics: "วิเคราะห์ข้อมูล (สำรอง)",
      gallery: "แกลเลอรี",
      system: "ระบบกลไก",
      admin: "แอดมิน",
      save: "บันทึก",
      delete: "ลบ",
      upload: "อัปโหลด",
      confirm: "ยืนยัน",
      cancel: "ยกเลิก",
      performance_stats: "สถิติการวิเคราะห์",
      no_trades: "ยังไม่พบข้อมูลการเทรด",
      recent_extractions: "ประวัติการวิเคราะห์ล่าสุด",
      no_signals: "ไม่พบสัญญาณการวิเคราะห์",
      engine_processing: "กำลังประมวลผล",
      engine_online: "ระบบออนไลน์",
      theme: "ธีม",
      new_scan: "สแกนใหม่",
      system_status: "สถานะระบบ",
      environment_matrix: "การตั้งค่าสภาพแวดล้อม",
      identity_management: "จัดการข้อมูลตัวตน",
      active_pilot: "ผู้ใช้งานปัจจุบัน",
      unique_neural_id: "Neural ID เฉพาะตัว",
      deauthorize_session: "ลงชื่อออก",
      trade_intelligence_log: "บันทึกข้อมูลการเทรดเชิงลึก",
      export_csv: "ดาวน์โหลด CSV",
      result: "ผลลัพธ์",
      source_image: "รูปภาพต้นฉบับ",
      system_warnings: "คำเตือนจากระบบ",
      gemini_vision_guide: "คู่มือการเชื่อมต่อ",
      raw_output: "ข้อมูลดั้งเดิม .JSON",
      back: "กลับ",
      save_success: "บันทึกสัญญาณเรียบร้อยแล้ว",
      capture_guide: "คู่มือการระบุข้อมูลภาพ",
      examine_setup: "ตรวจสอบภาพแผนการเทรด",
      live_mode: "โหมด Live",
      backtest_mode: "โหมด Backtest",
      visual_repository: "คลังภาพจำลองแผนการเทรดที่ผ่านการวิเคราะห์แล้ว",
      insufficient_data: "ข้อมูลไม่เพียงพอ",
      stats_engine_requirement: "ระบบสถิติต้องการข้อมูลการเทรดที่สมบูรณ์เพื่อประมวลผล",
      neural_visual_input: "ข้อมูลภาพนำเข้า",
      validate_levels_desc: "ตรวจสอบระดับราคาที่ AI ตรวจพบให้ตรงกับภาพของคุณก่อนบันทึกข้อมูล",
      signal_validation_protocol: "โปรโตคอลการตรวจสอบสัญญาณ",
      manual_calibration: "จำเป็นต้องตรวจสอบความถูกต้องด้วยตนเอง",
      pair_ticker: "คู่เงิน / สินทรัพย์",
      bias_direction: "แนวโน้ม / ทิศทาง",
      strategy_mapping: "เลือกกลยุทธ์",
      new_strategy: "สร้างกลยุทธ์ใหม่",
      no_strategies: "ไม่พบกลยุทธ์ที่บันทึกไว้",
      execution_levels: "การปรับแต่งระดับราคา",
      entry_matrix: "จุดเข้าเทรด (Entry)",
      profit_goal: "เป้าหมายกำไร (Take Profit)",
      risk_threshold: "จุดตัดขาดทุน (Stop Loss)",
      signal_outcome: "ผลลัพธ์การเทรด",
      authorize_save: "ยืนยันการบันทึก",
      abort_interface: "ยกเลิก / ปิดหน้าต่าง",
      extraction_protocol_desc: "โปรโตคอลการดึงข้อมูล: ข้อกำหนดด้านภาพ",
      purge_node: "ลบข้อมูลโหนด // ไม่สามารถย้อนกลับได้",
      confirm_purge: "ยืนยัน?",
      edit_node: "แก้ไขโหนด",
      edit_protocol: "แก้ไขโปรโตคอล",
      slide_to_purge: "สไลด์เพื่อลบ",
      neural_hub: "ศูนย์ควบคุม",
      navigation_matrix: "เมนูหลัก",
      show_insights: "แสดงข้อมูลวิเคราะห์",
      hide_insights: "ซ่อนข้อมูลวิเคราะห์",
      how_to_capture: "แคปรูปยังไง?",
      offline_warning: "ระบบประมวลผลออฟไลน์",
      byok_required: "จำเป็นต้องใช้ Gemini API Key ส่วนตัวเพื่อประมวลผลภาพ",
      authorize_node: "อนุญาตสิทธิ์",
      ingest_visual: "ข้อมูลภาพนำเข้า",
      drop_image: "วางรูปภาพที่นี่หรือคลิกเพื่อเลือกไฟล์",
      extraction_pipeline: "กระบวนการดึงข้อมูล",
      visual_output: "ข้อมูลทัศนียภาพ",
      json_model: "โมเดล JSON",
      validated_persistence: "ยืนยันการบันทึกข้อมูล",
      syncing: "กำลังซิงค์...",
      committed: "บันทึกแล้ว",
      performance: "วิเคราะห์ข้อมูล",
      privacy_policy_notice: "API key ของคุณจะถูกเก็บไว้ในเบราว์เซอร์ของคุณเท่านั้นและจะไม่ถูกส่งไปที่เซิร์ฟเวอร์หลักของเรา",
      close_guide: "รับทราบความต้องการ",
      feedback_title: "การสนับสนุนและข้อเสนอแนะ",
      feedback_subtitle: "การสื่อสารเน็กซัส",
      feedback_label_category: "หมวดหมู่การส่ง",
      feedback_label_subject: "หัวข้อสัญญาณ",
      feedback_placeholder_subject: "รหัสหลัก...",
      feedback_label_details: "รายละเอียดสตรีมข้อมูล",
      feedback_placeholder_details: "อธิบายข้อเสนอแนะหรือปัญหาทางเทคนิคของคุณอย่างละเอียด...",
      feedback_success: "ส่งสำเร็จ",
      feedback_button: "ส่งสัญญาณ",
      ai_neural_insights: "ข้อมูลวิเคราะห์เชิงลึก AI",
      probability_spectrum: "สเปกตรัมความน่าจะเป็น",
      system_accuracy: "ความแม่นยำของระบบ",
      profit_factor: "Profit Factor",
      eff_coeff: "ตัวคูณประสิทธิภาพ",
      risk_reward: "Risk:Reward",
      statistical_edge: "ความได้เปรียบทางสถิติ",
      yield_node: "โหนดผลตอบแทน",
      max_drawdown_label: "Drawdown สูงสุด",
      risk_boundary: "ขอบเขตความเสี่ยง",
      leading_symbols: "สินทรัพย์ที่โดดเด่น",
      directional_bias: "ทิศทางความได้เปรียบ",
      day_profile: "โปรไฟล์รายวัน",
      performance_architecture: "โครงสร้างการวิเคราะห์ข้อมูล",
      resistance: "ความยืดหยุ่น",
      strict_delta_excursion: "การวิเคราะห์การลดลงสุทธิ",
      peak_decay: "การลดลงจากจุดสูงสุด"
    },
    performance: {
      net_profit: "กำไรสุทธิ (R)",
      expectancy: "ค่าคาดหวัง",
      max_drawdown: "Drawdown สูงสุด",
      win_rate: "อัตราการชนะ",
      equity_curve: "เส้นกราฟเงินทุน",
      drawdown_chart: "กราฟ Drawdown",
      edge_analysis: "การวิเคราะห์จุดได้เปรียบ",
      setup_performance: "ประสิทธิภาพตาม Setup",
      session_performance: "ประสิทธิภาพตามช่วงเวลา",
      time_analysis: "การวิเคราะห์เวลา",
      risk_behavior: "ความเสี่ยงและพฤติกรรม",
      discipline_rate: "อัตราความีวินัย",
      revenge_trading: "การเทรดแก้แค้น",
      overtrading_indicator: "ตัวบ่งชี้การเทรดมากเกินไป",
      consecutive_losses: "การขาดทุนต่อเนื่อง",
      best_category: "หมวดหมู่ที่ดีที่สุด",
      worst_category: "หมวดหมู่ที่แย่ที่สุด",
      high_risk: "ความเสี่ยงสูง",
      stable: "คงที่",
      needs_attention: "ต้องได้รับการดูแล",
      net_profit_desc: "หน่วย R สะสมที่สร้างได้",
      expectancy_desc: "ค่า R เฉลี่ยที่ได้รับต่อเทรด",
      max_dd_desc: "การลดลงจากจุดสูงสุดถึงจุดต่ำสุด",
      win_rate_desc: "เปอร์เซ็นต์ของเทรดที่ชนะ",
      drawdown_recovery: "เวลาที่ใช้ในการฟื้นตัวจาก Drawdown สูงสุด",
      asia: "เอเชีย",
      london: "ลอนดอน",
      new_york: "นิวยอร์ก",
      ai_insights: "ข้อมูลเชิงลึกเชิงกลยุทธ์ AI",
      best_setup_insight: "โปรโตคอลที่เหมาะสม: Setup '{name}' ให้ประสิทธิภาพ {winrate}%",
      best_session_insight: "หน้าต่างประสิทธิภาพ: เซสชัน {session} ถูกระบุว่าเป็นโซนที่ให้ผลตอบแทนสูงสุด",
      risk_warning_insight: "คำเตือนโปรโตคอลความเสี่ยง: วิถีปัจจุบันเกินพารามิเตอร์ความแปรปรวนที่ปลอดภัย",
      high_drawdown_warning: "Drawdown วิกฤต: ตรวจพบการเบี่ยงเบน {value}R จำเป็นต้องลดความเสี่ยงทันที",
      low_discipline_warning: "การแจ้งเตือนพฤติกรรม: อัตราวินัยอยู่ที่ {value}% ความเหนื่อยล้าของโปรโตคอลใกล้เข้ามาแล้ว",
      system_edge: "ความได้เปรียบของระบบ",
      trade_more: "เทรดเพิ่ม",
      avoid: "หลีกเลี่ยง",
      risk_low: "ต่ำ",
      risk_medium: "ปานกลาง",
      risk_high: "สูง",
      prop_firm_warning: "Drawdown นี้จะละเมิดขีดจำกัดความเสี่ยงของบริษัท Prop มาตรฐาน",
      suggested_action: "การดำเนินการที่แนะนำ",
      lockdown_timer: "ตัวจับเวลาล็อกดาวน์",
      lockdown_trigger: "ทริกเกอร์: ถึงขีดจำกัดการขาดทุนรายวันสูงสุด",
      peak_equity: "จุดสูงสุดของเงินทุน",
      current_equity: "เงินทุนปัจจุบัน",
      initiate_lockdown: "เริ่มการล็อกดาวน์"
    },
    guide: {
      title: "โปรโตคอลการเชื่อมต่อ Google Gemini API",
      step1_title: "สร้างคีย์ API",
      step1_sub: "เข้าถึงศูนย์กลาง Google AI Studio เพื่อรับโทเค็นประสาทส่วนตัวของคุณ",
      step2_title: "คัดลอกโทเค็นการอนุญาต",
      step2_sub: "โอนคีย์ที่สร้างขึ้นไปยังพื้นที่เก็บข้อมูลชั่วคราวของคุณเพื่อรวมระบบ",
      step3_title: "การรวมสะพานประสาท",
      step3_sub: "วางคีย์ลงในเมทริกซ์ 'ระบบ' ภายในอินเทอร์เฟซนี้",
      step4_title: "ตรวจสอบการเชื่อมต่อ",
      step4_sub: "เริ่มต้นลำดับ 'ตรวจสอบลิงก์' เพื่อเปิดใช้งาน Gemini Vision Engine",
      privacy: "คีย์หลักของคุณจะถูกแยกออกภายในหน่วยความจำในเครื่องเบราว์เซอร์ของคุณและจะไม่สัมผัสโหนดการถ่ายโอนส่วนกลางของเรา",
      close: "รับทราบโปรโตคอลการเชื่อมต่อ"
    },
    analytics: {
      winrate: "เปอร์เซ็นต์ของผลลัพธ์ที่เป็นบวกเมื่อเทียบกับจำนวนโหนดบันทึกทั้งหมด",
      pf: "Profit Factor: กำไรทั้งหมด / ขาดทุนทั้งหมด ค่าที่มากกว่า 1.0 บ่งบอกถึงระบบที่มีกำไรสุทธิ",
      avgrr: "อัตราส่วนความเสี่ยงต่อผลตอบแทนเฉลี่ยจากสัญญาณที่ตรวจสอบแล้วทั้งหมด",
      expectancy: "ค่าคาดหวังทางสถิติต่อโหนด แสดงถึงค่า R เฉลี่ยที่ได้รับต่อการดำเนินการ",
      maxdd: "การลดลงจากจุดสูงสุดถึงจุดต่ำสุดที่สังเกตได้สูงสุดในระบบหน่วย R",
      recovery: "Recovery Factor: กำไรสุทธิ / การลดลงสูงสุด วัดความยืดหยุ่นของระบบ",
      consecutive_loss: "ลำดับการขาดทุนต่อเนื่องสูงสุดที่สังเกตได้ในแมทริกซ์ปัจจุบัน",
      total_trades: "จำนวนโหนดข้อมูลที่นำเข้าและตรวจสอบแล้วทั้งหมด"
    },
    system: {
      title: "นำความฉลาดของคุณมาใช้",
      description: "ให้ Google Gemini API Key ของคุณเอง โทเค็นนี้จะถูกเก็บไว้ในที่เก็บข้อมูลในเครื่องของคุณเท่านั้นและจะไม่ส่งไปยังเซิร์ฟเวอร์หลักของเรา",
      label: "Gemini API Key",
      guide: "คู่มือการเชื่อมต่อ",
      verify: "ตรวจสอบการเชื่อมต่อ",
      verified: "เชื่อมต่อแล้ว",
      neural_active: "สะพานประสาทเชื่อมต่อแล้ว // การเข้ารหัสทำงาน",
      get_key: "รับคีย์ของคุณจาก",
      persistence_title: "การคงอยู่ของข้อมูลและความเป็นส่วนตัว",
      persistence_subtitle: "ความปลอดภัยของเวกเตอร์แมทริกซ์",
      persistence_protocol: "โปรโตคอลความเป็นส่วนตัวหลัก",
      persistence_item1: "การดึงสัญญาณจะแยกไปยังโปรไฟล์ของคุณและไม่แชร์ข้ามโหนดทั่วโลก",
      persistence_item2: "การจัดเก็บจะคงอยู่ในคอนเทนเนอร์ Supabase ที่เข้ารหัสด้วยการรักษาความปลอดภัยระดับแถว (RLS)",
      persistence_item3: "ข้อเสนอแนะจะถูกตรวจสอบเพื่อการสอบเทียบระบบและการแก้ปัญหาทางสถาปัตยกรรมเท่านั้น",
      persistence_sync: "ซิงค์อัตโนมัติ",
      persistence_encryption: "การเข้ารหัส E2E"
    },
    capture: {
      title: "โปรโตคอลการจับภาพที่เหมาะสมที่สุด",
      how: "แคปรูปยังไง?",
      guide_btn: "โปรโตคอลการจับภาพที่เหมาะสมที่สุด",
      step1: "มาร์กเกอร์ที่มองเห็นได้",
      step1_sub: "ตรวจสอบให้แน่ใจว่าเห็นเส้น SL, Entry และ TP ชัดเจนบนผืนผ้าใบแผนภูมิ",
      step2: "การจัดแนวแกน",
      step2_sub: "ตรวจสอบให้แน่ใจว่ามีทั้งแกนราคา (ขวา) และแกนเวลา (ล่าง) เพื่อการประทับเวลาที่แม่นยำ",
      step3: "ป้ายกำกับค่า",
      step3_sub: "เปิดใช้งานป้ายกำกับราคาสำหรับเครื่องมือต่างๆ เช่น แนวรับ/แนวต้าน หรือ Fibonacci",
      trade_notes: "บันทึกการเทรด // การสังเกต",
      notes_placeholder: "อธิบายบริบทของตลาด สถานะทางอารมณ์ หรือตรรกะเบื้องหลังสัญญาณนี้..."
    }
  }
};

import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine,
  Cell
} from 'recharts';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const ADMIN_EMAILS = ['theklinkz@gmail.com', 'ookami.0609@gmail.com'];
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisHistoryItem | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'visual' | 'json'>('visual');
  const [mainTab, setMainTab] = useState<'Dashboard' | 'Analytics' | 'Performance' | 'Log' | 'Gallery' | 'System' | 'Admin'>('Dashboard');
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<AnalysisHistoryItem | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<TradeStatus>("Pending");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [purgingId, setPurgingId] = useState<string | null>(null);
  const [showApiKeyGuide, setShowApiKeyGuide] = useState(false);
  const [showCaptureGuide, setShowCaptureGuide] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  
  // Feedback State
  const [feedbackCategory, setFeedbackCategory] = useState('General');
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [adminFeedback, setAdminFeedback] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [presenceUsers, setPresenceUsers] = useState<Record<string, any>>({});
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  // Strategy State
  const [strategies, setStrategies] = useState<Strategy[]>([]);

  const CAPTURE_GUIDE_IMAGE = "https://s3.tradingview.com/x/quCmWj8T.png";
  
  // Filter State
  const [filterSymbol, setFilterSymbol] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [theme, setTheme] = useState<'default' | 'light' | 'tactical' | 'cyber'>('default');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [language, setLanguage] = useState<'EN' | 'TH'>('EN');
  const [tradingMode, setTradingMode] = useState<'live' | 'backtest'>('live');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const t = TRANSLATIONS[language];

  // Edit State
  const [editingItem, setEditingItem] = useState<AnalysisHistoryItem | null>(null);
  const [editForm, setEditForm] = useState<AnalysisHistoryItem | null>(null);
  const [recentSymbols, setRecentSymbols] = useState<string[]>([]);

  // Load recent symbols from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nexus_recent_symbols');
    if (saved) {
      try {
        setRecentSymbols(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recent symbols', e);
      }
    }
  }, []);

  // Helper to save a new symbol to history
  const saveRecentSymbol = (symbol: string) => {
    if (!symbol) return;
    const normalized = symbol.toUpperCase().trim();
    setRecentSymbols(prev => {
      const filtered = prev.filter(s => s !== normalized);
      const next = [normalized, ...filtered].slice(0, 20); // Keep last 20
      localStorage.setItem('nexus_recent_symbols', JSON.stringify(next));
      return next;
    });
  };

  // Validation Overlay State
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [validationData, setValidationData] = useState<AnalysisHistoryItem | null>(null);

  // Load history, theme, and auth on mount
  React.useEffect(() => {
    // Check local storage for Gemini key
    const savedKey = localStorage.getItem('tradevision-gemini-key');
    if (savedKey) setGeminiKey(savedKey);

    // Auth listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        refreshFromDb(session.user.id);
        syncProfile(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        refreshFromDb(session.user.id);
        syncProfile(session.user);
      }
      else setHistory([]);
    });

    // Theme initialization
    const savedTheme = localStorage.getItem('tradevision-theme') as any;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    const savedLang = localStorage.getItem('tradevision-lang') as 'EN' | 'TH';
    if (savedLang) setLanguage(savedLang);

    const savedSidebar = localStorage.getItem('tradevision-sidebar-collapsed');
    if (savedSidebar) setSidebarCollapsed(savedSidebar === 'true');
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Real-time Presence
  React.useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        setPresenceUsers(channel.presenceState());
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId: user.id,
            email: user.email,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('tradevision-sidebar-collapsed', String(newState));
  };

  const changeTheme = (newTheme: 'default' | 'light' | 'tactical' | 'cyber') => {
    setTheme(newTheme);
    localStorage.setItem('tradevision-theme', newTheme);
    if (newTheme === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  // Filtered history for analytics
  const filteredHistory = React.useMemo(() => {
    return history.filter(item => {
      // If item has no tradingMode, assume it's live for backward compatibility
      const itemMode = item.tradingMode || 'live';
      if (itemMode !== tradingMode) return false;
      
      const matchesSymbol = filterSymbol === '' || item.symbol.toLowerCase().includes(filterSymbol.toLowerCase());
      const itemDate = new Date(item.date).getTime();
      const start = filterStartDate ? new Date(filterStartDate).getTime() : 0;
      const end = filterEndDate ? new Date(filterEndDate).getTime() : Infinity;
      const matchesDate = itemDate >= start && itemDate <= end;
      return matchesSymbol && matchesDate;
    });
  }, [history, filterSymbol, filterStartDate, filterEndDate]);

  // Compute stats reactively based on filtered history
  const stats = React.useMemo(() => calculateTradeStatistics(filteredHistory), [filteredHistory]);

  const refreshFromDb = useCallback(async (userId?: string, mode?: 'live' | 'backtest') => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;
    
    const targetMode = mode || tradingMode;
    setIsRefreshing(true);
    try {
      const dbTrades = await fetchTradesFromSupabase(targetUserId, targetMode);
      setHistory(dbTrades);
      
      // Also fetch strategies to keep trade counts in sync
      const dbStrategies = await fetchStrategiesFromSupabase(targetUserId);
      setStrategies(dbStrategies);
    } catch (err) {
      console.error("Supabase fetch failed:", err);
      setError("Database sync failed. Please check your Supabase configuration.");
    } finally {
      setIsRefreshing(false);
    }
  }, [user, tradingMode]);

  const handleAddStrategy = async (name: string, color: string) => {
    if (!user) throw new Error('Authentication required');
    const newStrategy = await saveStrategyToSupabase(name, color, user.id);
    setStrategies(prev => [...prev, newStrategy]);
    return newStrategy;
  };

  const handleUpdateStrategy = async (id: string, name: string, color: string) => {
    await updateStrategyInSupabase(id, name, color);
    setStrategies(prev => prev.map(s => s.id === id ? { ...s, name, color } : s));
    // Reactively update names and colors in history display
    setHistory(prev => prev.map(h => h.strategyId === id ? { ...h, strategyName: name, strategyColor: color } : h));
  };

  const handleDeleteStrategy = async (id: string) => {
    await deleteStrategyFromSupabase(id);
    setStrategies(prev => prev.filter(s => s.id !== id));
    // Unlink strategy from current history trades
    setHistory(prev => prev.map(h => h.strategyId === id ? { ...h, strategyId: undefined, strategyColor: undefined } : h));
  };

  // Handle mode change specifically to trigger a clean refresh
  const changeMode = (newMode: 'live' | 'backtest') => {
    setTradingMode(newMode);
    refreshFromDb(user?.id, newMode);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);
    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setHistory([]);
  };

  const saveGeminiKey = (key: string) => {
    setGeminiKey(key);
    localStorage.setItem('tradevision-gemini-key', key);
  };

  const saveLanguage = (lang: 'EN' | 'TH') => {
    setLanguage(lang);
    localStorage.setItem('tradevision-lang', lang);
  };

  const [isKeyVerified, setIsKeyVerified] = useState(false);

  const testGeminiKey = async () => {
    if (!geminiKey) {
      setError("Genetic Protocol Error: API Key missing.");
      return;
    }
    setAuthLoading(true);
    setError(null);
    setIsKeyVerified(false);
    try {
      const aiTest = new GoogleGenAI({ apiKey: geminiKey });
      await aiTest.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "ping",
      });
      setIsKeyVerified(true);
      setTimeout(() => {
        if (mainTab === 'System') alert("Neural Bridge Established: API connection verified.");
      }, 100);
    } catch (err: any) {
      setError(`Neural Calibration Failed: ${err.message}`);
      setIsKeyVerified(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const ProgressCircle = ({ value, size = 100, strokeWidth = 8, color = "var(--brand-accent)" }: { value: number, size?: number, strokeWidth?: number, color?: string }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-brand-border/30"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-xl font-bold font-mono tracking-tight text-brand-text-bright">{value.toFixed(1)}%</span>
        </div>
      </div>
    );
  };

  const Sparkline = ({ data, color = "var(--brand-accent)" }: { data: number[], color?: string }) => {
    if (!data || data.length < 2) return <div className="h-full w-full opacity-10 flex items-center justify-center">--</div>;
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 90 - ((val - min) / range) * 80;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <motion.polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            points={points}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </svg>
      </div>
    );
  };

const InfoTooltip = ({ content }: { content: string }) => {
  return (
    <RadixTooltip.Provider delayDuration={200}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>
          <button className="text-brand-text-dim hover:text-brand-accent transition-colors ml-1 focus:outline-none">
            <Info size={12} />
          </button>
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className="z-[100] select-none rounded-[4px] bg-brand-elevated px-[15px] py-[10px] text-[11px] leading-tight text-brand-text-bright shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] border border-brand-accent/20 animate-in fade-in zoom-in-95 duration-200"
            sideOffset={5}
          >
            <div className="max-w-[200px] uppercase font-mono tracking-tighter leading-relaxed">
              {content}
            </div>
            <RadixTooltip.Arrow className="fill-brand-elevated stroke-brand-accent/20" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

const NoteTooltip = ({ note }: { note: string }) => {
  return (
    <RadixTooltip.Provider delayDuration={200}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>
          <button className="text-brand-accent hover:text-brand-accent/80 transition-all flex items-center justify-center p-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            <StickyNote size={12} className="drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]" />
          </button>
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className="z-[150] select-none rounded bg-brand-bg/80 backdrop-blur-md px-4 py-3 text-[11px] leading-relaxed text-brand-text-bright shadow-2xl border border-brand-accent/30 animate-in fade-in zoom-in-95 duration-200 w-64"
            sideOffset={5}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 border-b border-brand-border/50 pb-2">
                <StickyNote size={12} className="text-brand-accent" />
                <span className="label-caps mb-0 text-[10px]">Trade Notes // Observations</span>
              </div>
              <p className="font-mono whitespace-pre-wrap break-words opacity-90">{note}</p>
            </div>
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};


  const onFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSaveSuccess(false);
    setIsAnalyzing(true);
    setSelectedStatus("Pending");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setPreview(base64);
      
      try {
        const result = await analyzeTradeScreenshot(base64, geminiKey);
        
        const validationItem: AnalysisHistoryItem = {
          ...result,
          id: Math.random().toString(36).substr(2, 9),
          imageUrl: base64,
          date: result.timestamp || new Date().toLocaleString(),
          status: "Pending",
          tradingMode: tradingMode,
        };
        
        setValidationData(validationItem);
        setIsValidationOpen(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to analyze image");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  }, [geminiKey]);

  const confirmValidation = async () => {
    if (!validationData) return;
    
    saveRecentSymbol(validationData.symbol);

    // Sync main UI state
    setCurrentAnalysis(validationData);
    setSelectedStatus(validationData.status);
    setIsValidationOpen(false);
    
    // Always proceed with save
    await executeSaveAction(validationData, validationData.status);
  };

  const executeSaveAction = async (analysis: AnalysisHistoryItem | null, status: TradeStatus) => {
    if (!analysis || !preview || isSaving) return;

    // Data Validation
    if (!analysis.symbol || analysis.symbol === "UNKNOWN") {
      setError("Validation Error: Please specify a ticker symbol before saving.");
      return;
    }
    if (isNaN(analysis.levels.entry) || analysis.levels.entry <= 0) {
      setError("Validation Error: Entry price must be a valid positive number.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const historyItem: AnalysisHistoryItem = {
        ...analysis,
        imageUrl: preview,
        status: status,
        savedToDb: true
      };

      // Save to Supabase
      await saveTradeToSupabase(historyItem, user?.id, tradingMode);
      
      setSaveSuccess(true);
      // Refresh to get the actual ID from DB
      await refreshFromDb(user?.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "System Error: Failed to transmit signal to database.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    await executeSaveAction(currentAnalysis, selectedStatus);
  };

  const exportToCSV = () => {
    if (history.length === 0) return;
    
    const headers = ['ID', 'Symbol', 'Side', 'Entry', 'TP', 'SL', 'Status', 'Date', 'ExitDate', 'Confidence'];
    const rows = history.map(item => [
      item.id,
      item.symbol,
      item.side,
      item.levels.entry,
      item.levels.takeProfit,
      item.levels.stopLoss,
      item.status,
      `"${item.date}"`,
      `"${item.exitDate || ''}"`,
      item.confidence
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `trade_vision_log_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdate = async () => {
    if (!editForm || isSaving) return;

    // Data Validation
    if (!editForm.symbol) {
      setError("Update Failed: Symbol cannot be empty.");
      return;
    }
    if (isNaN(editForm.levels.entry) || editForm.levels.entry <= 0) {
      setError("Update Failed: Entry price must be a valid number.");
      return;
    }

    setIsSaving(true);
    setError(null);
    saveRecentSymbol(editForm.symbol);

    try {
      await updateTradeInSupabase(editForm.id, editForm);
      setHistory(prev => prev.map(item => item.id === editForm.id ? editForm : item));
      setEditingItem(null);
    } catch (err) {
      console.error("Update failed:", err);
      setError(err instanceof Error ? err.message : "Update Failed: Database communication error.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    setPurgingId(id);
  };

  const confirmDelete = async () => {
    if (!purgingId || isSaving) return;
    const id = purgingId;
    
    setIsSaving(true);
    setError(null);

    try {
      // Persistent database update
      await deleteTradeFromSupabase(id);
      
      // Update state
      setHistory(prev => prev.filter(item => item.id !== id));
      
      // Close editor if we're deleting the item currently being edited
      if (editingItem?.id === id) {
        setEditingItem(null);
      }
      
      setPurgingId(null);
    } catch (err) {
      console.error("Delete failed:", err);
      setError(err instanceof Error ? err.message : "Deletion Failed: Database communication error.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackSubject || !feedbackMessage || isSubmittingFeedback) return;

    setIsSubmittingFeedback(true);
    setFeedbackSuccess(false);
    setError(null);

    const systemInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      appVersion: "1.0.0"
    };

    try {
      await submitFeedbackToSupabase({
        userId: user?.id,
        category: feedbackCategory,
        subject: feedbackSubject,
        message: feedbackMessage,
        systemInfo
      });

      setFeedbackSuccess(true);
      setFeedbackSubject('');
      setFeedbackMessage('');
      setFeedbackCategory('General');
      
      // Reset success message after 5 seconds
      setTimeout(() => setFeedbackSuccess(false), 5000);
    } catch (err) {
      console.error("Feedback submission failed:", err);
      setError(err instanceof Error ? err.message : "Submission Failed: Database synchronization error.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const loadAdminData = async () => {
    setIsAdminLoading(true);
    try {
      const [feedbackData, usersData] = await Promise.all([
        fetchFeedbackFromSupabase(),
        fetchProfiles()
      ]);
      setAdminFeedback(feedbackData);
      setAdminUsers(usersData);
    } catch (err) {
      console.error("Admin data fetch failed:", err);
    } finally {
      setIsAdminLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, nextStatus: string) => {
    try {
      await updateFeedbackStatus(id, nextStatus);
      // Refresh local state
      setAdminFeedback(prev => prev.map(item => item.id === id ? { ...item, status: nextStatus } : item));
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Operational Failure: Could not update record status.");
    }
  };

  React.useEffect(() => {
    if (mainTab === 'Admin') {
      loadAdminData();
    }
  }, [mainTab]);
 
   return (
    <div className="flex flex-col h-screen overflow-hidden bg-brand-bg relative">
      {/* Hidden Datalist for Symbols */}
      <datalist id="symbols-list">
        {recentSymbols.map(s => <option key={s} value={s} />)}
      </datalist>
      {!user ? (
        <div className="fixed inset-0 z-[100] bg-brand-bg flex items-center justify-center p-6">
          <div className="technical-panel w-full max-w-sm bg-brand-bg p-8 flex flex-col gap-6 shadow-2xl border-brand-accent/30">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent border border-brand-accent/20">
                <Cpu size={32} className="animate-pulse" />
              </div>
              <div>
                <h3 className="label-caps text-lg text-brand-text-bright mb-1">TradeVision <span className="opacity-50">PRO</span></h3>
                <p className="text-[10px] text-brand-text-dim uppercase tracking-widest">Authorized Access Only</p>
              </div>
            </div>

            <form onSubmit={handleAuth} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="label-caps text-[9px]">Neural ID (Email)</label>
                <input 
                  type="email"
                  required
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  className="bg-brand-elevated border border-brand-border p-3 text-sm monospace-data rounded focus:border-brand-accent transition-colors"
                  placeholder="name@nexus.com"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="label-caps text-[9px]">Access Key (Password)</label>
                <input 
                  type="password"
                  required
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  className="bg-brand-elevated border border-brand-border p-3 text-sm monospace-data rounded focus:border-brand-accent transition-colors"
                  placeholder="••••••••"
                />
              </div>
              
              {error && (
                <div className="p-2 bg-trade-short/10 border border-trade-short/30 text-trade-short text-[10px] font-bold uppercase tracking-tight flex items-center gap-2">
                  <AlertCircle size={12} />
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={authLoading}
                className="w-full py-4 bg-brand-accent text-white font-mono font-bold uppercase tracking-widest text-[11px] rounded hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-brand-accent/30 disabled:opacity-50 disabled:shadow-none group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                {authLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <motion.div
                    animate={{ 
                      scale: [1, 1.3, 1],
                      filter: ["drop-shadow(0 0 0px #fff)", "drop-shadow(0 0 8px #fff)", "drop-shadow(0 0 0px #fff)"]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2,
                      ease: "easeInOut"
                    }}
                  >
                    <Zap size={18} fill="currentColor" />
                  </motion.div>
                )}
                <span className="whitespace-nowrap relative z-10">
                  {authMode === 'login' ? 'Activate AI Engine' : 'Create new Account'}
                </span>
              </button>
            </form>

            <div className="flex justify-center flex-col gap-2">
              <button 
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-[9px] text-brand-text-dim hover:text-brand-accent font-bold uppercase tracking-[2px] transition-colors"
              >
                {authMode === 'login' ? 'Create new Account' : 'Already Linked? Access Portal'}
              </button>
            </div>
            
            <div className="pt-4 border-t border-brand-border text-center">
               <p className="text-[8px] text-brand-text-dim opacity-30 font-mono tracking-tighter uppercase">
                 Encrypted via Supabase Auth // Neural Bridge: Stable
               </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* API Key Guide Modal */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[120] lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-brand-bg/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-brand-elevated border-l border-brand-border shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-brand-border flex items-center justify-between">
                <h3 className="label-caps mb-0 text-brand-text-bright">{t.ui.navigation_matrix}</h3>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-brand-text-dim hover:text-brand-text-bright">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <h3 className="label-caps mb-0 text-[10px] text-brand-accent">{t.ui.neural_hub}</h3>
                  <nav className="flex flex-col gap-1">
                    {(isAdmin ? ['Dashboard', 'Performance', 'Log', 'Gallery', 'System', 'Admin'] : ['Dashboard', 'Performance', 'Log', 'Gallery', 'System']).map((tab) => (
                      <button 
                        key={tab} 
                        onClick={() => {
                          setMainTab(tab as any);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full p-3 text-left text-[11px] font-bold uppercase tracking-[2px] rounded transition-all flex items-center justify-between
                          ${mainTab === tab ? 'bg-brand-accent/20 text-brand-accent border border-brand-accent/20' : 'text-brand-text-dim hover:text-brand-text-bright'}`}
                      >
                        {(t.ui as any)[tab.toLowerCase()] || tab}
                        <div className={`w-1 h-1 rounded-full ${mainTab === tab ? 'bg-brand-accent animate-pulse' : 'bg-transparent'}`} />
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="h-px bg-brand-border" />

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="label-caps mb-0 text-[10px] text-brand-accent">{t.ui.recent_extractions}</h3>
                    <span className="text-[9px] font-mono opacity-40">{history.length} NODES</span>
                  </div>
                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                    {history.length === 0 ? (
                      <div className="py-8 text-center opacity-20 bg-brand-bg/50 rounded border border-dashed border-brand-border">
                        <p className="text-[9px] uppercase font-bold">{t.ui.no_trades}</p>
                      </div>
                    ) : (
                      history.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setCurrentAnalysis(item);
                            setPreview(item.imageUrl);
                            setIsMobileMenuOpen(false);
                            setMainTab('Dashboard');
                          }}
                          className={`w-full p-3 rounded border transition-all text-left bg-brand-bg/30
                            ${currentAnalysis?.id === item.id 
                              ? 'border-brand-accent' 
                              : 'border-brand-border/50 hover:border-brand-accent/50'}`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="monospace-data text-[10px] font-bold">{item.symbol}</span>
                            <span className={`text-[8px] px-1 py-0.5 rounded font-bold uppercase
                              ${item.side === 'Long' ? 'text-trade-long' : 'text-trade-short'}`}>
                              {item.side}
                            </span>
                          </div>
                          <span className="text-[8px] opacity-40 font-mono">{item.date}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                 <div className="h-px bg-brand-border" />

                <div className="flex flex-col gap-4">
                  <label className="label-caps text-[10px]">{t.ui.backtest_mode}</label>
                  <div className="flex bg-brand-bg border border-brand-border rounded p-1">
                    <button 
                      onClick={() => {
                        changeMode('live');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex-1 py-2 text-[10px] font-bold rounded ${tradingMode === 'live' ? 'bg-brand-accent text-white' : 'text-brand-text-dim'}`}
                    >
                      {t.modes.live}
                    </button>
                    <button 
                      onClick={() => {
                        changeMode('backtest');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex-1 py-2 text-[10px] font-bold rounded ${tradingMode === 'backtest' ? 'bg-brand-accent text-white' : 'text-brand-text-dim'}`}
                    >
                      {t.modes.backtest}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <label className="label-caps text-[10px]">Protocol Language</label>
                  <div className="flex bg-brand-bg border border-brand-border rounded p-1">
                    <button 
                      onClick={() => saveLanguage('EN')}
                      className={`flex-1 py-2 text-[10px] font-bold rounded ${language === 'EN' ? 'bg-brand-accent text-white' : 'text-brand-text-dim'}`}
                    >
                      ENGLISH
                    </button>
                    <button 
                      onClick={() => saveLanguage('TH')}
                      className={`flex-1 py-2 text-[10px] font-bold rounded ${language === 'TH' ? 'bg-brand-accent text-white' : 'text-brand-text-dim'}`}
                    >
                      ภาษาไทย
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <label className="label-caps text-[10px]">Environment Theme</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'default', name: 'Obsidian' },
                      { id: 'light', name: 'Light' },
                      { id: 'tactical', name: 'Tactical' },
                      { id: 'cyber', name: 'Cyber' }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => changeTheme(t.id as any)}
                        className={`p-3 text-[9px] font-bold uppercase border rounded text-center transition-all
                          ${theme === t.id ? 'bg-brand-accent/20 border-brand-accent text-brand-accent' : 'bg-brand-bg border-brand-border text-brand-text-dim'}`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-brand-border">
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-4 bg-trade-short/10 text-trade-short border border-trade-short/20 rounded font-bold uppercase tracking-widest text-[10px]"
                  >
                    Terminate Session
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* API Key Guide Modal */}
      <AnimatePresence>
        {showApiKeyGuide && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowApiKeyGuide(false)}
              className="absolute inset-0 bg-brand-bg/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="technical-panel w-full max-w-lg bg-brand-elevated p-8 relative z-10 border-brand-accent/30 shadow-2xl"
            >
              <button 
                onClick={() => setShowApiKeyGuide(false)}
                className="absolute top-4 right-4 text-brand-text-dim hover:text-brand-text-bright transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3 text-brand-accent border-b border-brand-border pb-4">
                  <Cpu size={24} />
                  <h2 className="label-caps text-lg mb-0">{t.guide.title}</h2>
                </div>

                <div className="grid gap-6">
                  {[
                    { step: 1, text: t.guide.step1_title, sub: t.guide.step1_sub, action: "Google AI Studio", link: "https://aistudio.google.com/app/apikey" },
                    { step: 2, text: t.guide.step2_title, sub: t.guide.step2_sub, action: null },
                    { step: 3, text: t.guide.step3_title, sub: t.guide.step3_sub, action: null },
                    { step: 4, text: t.guide.step4_title, sub: t.guide.step4_sub, action: null },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent font-bold font-mono text-xs shrink-0">
                        0{item.step}
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-bold text-brand-text-bright leading-none">{item.text}</p>
                        <p className="text-[11px] text-brand-text-dim leading-relaxed uppercase tracking-tighter">
                          {item.sub}
                          {item.link && (
                            <a href={item.link} target="_blank" rel="noreferrer" className="block mt-1 text-brand-accent hover:underline flex items-center gap-1">
                              {item.action} <ExternalLink size={10} />
                            </a>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-brand-accent/5 border border-brand-accent/20 rounded flex items-start gap-3">
                  <ShieldCheck size={18} className="text-brand-accent shrink-0 mt-0.5" />
                  <p className="text-[10px] text-brand-text-dim uppercase leading-relaxed tracking-wide font-medium">
                    <span className="text-brand-text-bright">Privacy Note:</span> {t.guide.privacy}
                  </p>
                </div>

                <button 
                  onClick={() => setShowApiKeyGuide(false)}
                  className="w-full py-4 bg-brand-accent text-white font-bold uppercase tracking-[4px] text-[10px] rounded hover:opacity-90 transition-all shadow-lg shadow-brand-accent/20"
                >
                  {t.guide.close}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Capture Guide Modal */}
      <AnimatePresence>
        {showCaptureGuide && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCaptureGuide(false)}
              className="absolute inset-0 bg-brand-bg/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="technical-panel w-full max-w-4xl bg-brand-elevated p-8 relative z-10 border-brand-accent/30 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setShowCaptureGuide(false)}
                className="absolute top-4 right-4 text-brand-text-dim hover:text-brand-text-bright transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-3 text-brand-accent border-b border-brand-border pb-4">
                  <Camera size={24} />
                  <h2 className="label-caps text-lg mb-0">{t.capture.title}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
                  {/* Left: Guide Visual (Larger) */}
                  <div className="md:col-span-3 flex flex-col gap-3">
                    <div 
                      onClick={() => setIsImageExpanded(true)}
                      className="relative aspect-video bg-[#0d1117] rounded-lg border border-brand-accent/30 overflow-hidden group cursor-zoom-in"
                    >
                      {/* SVG Mockup Chart */}
                      <svg viewBox="0 0 400 225" className="w-full h-full">
                        {/* Grid Lines */}
                        <g stroke="#ffffff10" strokeWidth="0.5">
                          {[...Array(10)].map((_, i) => (
                            <line key={`h-${i}`} x1="0" y1={i * 22.5} x2="400" y2={i * 22.5} />
                          ))}
                          {[...Array(10)].map((_, i) => (
                            <line key={`v-${i}`} x1={i * 40} y1="0" x2={40} y2="225" />
                          ))}
                        </g>

                        {/* Candlesticks */}
                        <g fill="#10b981">
                          <rect x="40" y="100" width="8" height="30" rx="1" />
                          <rect x="60" y="90" width="8" height="40" rx="1" />
                          <rect x="80" y="80" width="8" height="20" rx="1" />
                        </g>
                        <g fill="#ef4444">
                          <rect x="100" y="100" width="8" height="50" rx="1" />
                          <rect x="120" y="140" width="8" height="20" rx="1" />
                          <rect x="140" y="150" width="8" height="30" rx="1" />
                        </g>

                        {/* SL Line */}
                        <g className="opacity-90">
                          <line x1="0" y1="60" x2="400" y2="60" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />
                          <rect x="360" y="50" width="35" height="20" rx="4" fill="#ef4444" />
                          <text x="377.5" y="64" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">SL</text>
                        </g>

                        {/* Entry Line */}
                        <g className="opacity-90">
                          <line x1="0" y1="120" x2="400" y2="120" stroke="#94a3b8" strokeWidth="2" />
                          <rect x="350" y="110" width="45" height="20" rx="4" fill="#94a3b8" />
                          <text x="372.5" y="124" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">ENTRY</text>
                        </g>

                        {/* TP Line */}
                        <g className="opacity-90">
                          <line x1="0" y1="180" x2="400" y2="180" stroke="#10b981" strokeWidth="2" strokeDasharray="4 2" />
                          <rect x="360" y="170" width="35" height="20" rx="4" fill="#10b981" />
                          <text x="377.5" y="184" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">TP</text>
                        </g>

                        {/* Axis Labels */}
                        <text x="395" y="215" textAnchor="end" fill="#94a3b8" fontSize="8">PRICE AXIS</text>
                        <text x="5" y="215" textAnchor="start" fill="#94a3b8" fontSize="8">TIME AXIS</text>
                      </svg>
                      
                      <div className="absolute inset-0 bg-brand-accent/0 group-hover:bg-brand-accent/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40">
                        <div className="bg-brand-elevated/90 backdrop-blur-sm p-3 rounded-full border border-brand-accent/20">
                          <Maximize2 size={32} className="text-brand-accent" />
                        </div>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <p className="text-[10px] text-white uppercase font-bold tracking-widest flex items-center gap-2">
                          <ImageIcon size={12} />
                          Extraction Frame Blueprint
                        </p>
                      </div>
                    </div>
                    <p className="text-[10px] text-brand-text-dim text-center uppercase tracking-widest opacity-50 font-mono">
                      (Click to Expand Technical Blueprint)
                    </p>
                    <a 
                      href="https://www.tradingview.com/x/quCmWj8T/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[11px] text-brand-accent hover:text-white transition-colors text-center uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 mt-2 underline decoration-brand-accent/30 underline-offset-4"
                    >
                      <ExternalLink size={12} />
                      Example chart from Tradingview
                    </a>
                  </div>

                  {/* Right: Requirements */}
                  <div className="md:col-span-2 flex flex-col gap-6">
                    {[
                      { step: 1, title: t.capture.step1, sub: t.capture.step1_sub, icon: Target },
                      { step: 2, title: t.capture.step2, sub: t.capture.step2_sub, icon: Maximize2 },
                      { step: 3, title: t.capture.step3, sub: t.capture.step3_sub, icon: Info },
                      { step: 4, title: t.capture.step4, sub: t.capture.step4_sub, icon: Download },
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-4 group">
                        <div className="w-10 h-10 rounded-lg bg-brand-accent/5 border border-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0 group-hover:bg-brand-accent/10 transition-colors">
                          <item.icon size={18} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-[11px] font-bold text-brand-text-bright uppercase tracking-wider">{item.title}</p>
                          <p className="text-[10px] text-brand-text-dim leading-relaxed uppercase tracking-tighter opacity-80">
                            {item.sub}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setShowCaptureGuide(false)}
                  className="w-full py-4 bg-brand-accent text-white font-bold uppercase tracking-[4px] text-[10px] rounded hover:opacity-90 transition-all shadow-lg shadow-brand-accent/20"
                >
                  {t.capture.close}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Expanded Image Overlay */}
      <ExpandedImageOverlay 
        isOpen={isImageExpanded} 
        onClose={() => setIsImageExpanded(false)} 
        t={t}
      />

      {/* Signal Validation Overlay */}
      <SignalValidationOverlay 
        isOpen={isValidationOpen}
        onClose={() => setIsValidationOpen(false)}
        data={validationData}
        onConfirm={confirmValidation}
        onDataChange={(newData) => setValidationData(newData)}
        recentSymbols={recentSymbols}
        strategies={strategies}
        onAddStrategy={handleAddStrategy}
        t={t}
      />

      {/* Purge Confirmation Overlay */}
      <AnimatePresence>
        {purgingId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="technical-panel w-full max-w-sm bg-brand-bg p-8 flex flex-col gap-6 shadow-2xl border-trade-short/30"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-trade-short/10 flex items-center justify-center text-trade-short border border-trade-short/20">
                  <Activity size={32} className="rotate-45 animate-pulse" />
                </div>
                <div>
                  <h3 className="label-caps text-lg text-brand-text-bright mb-1">Purge Sequence</h3>
                  <p className="text-xs text-brand-text-dim leading-relaxed">
                    Confirm deletion of node <span className="monospace-data text-trade-short">{purgingId}</span>. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmDelete}
                  className="w-full py-3 bg-trade-short text-black font-bold uppercase tracking-widest text-[10px] rounded hover:opacity-90 transition-opacity"
                >
                  Confirm Permanent Purge
                </button>
                <button 
                  onClick={() => setPurgingId(null)}
                  className="w-full py-3 border border-brand-border text-brand-text-dim font-bold uppercase tracking-widest text-[10px] rounded hover:bg-brand-elevated transition-colors"
                >
                  Abort Mission
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal Overlay */}
      <AnimatePresence>
        {editingItem && editForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="technical-panel w-full max-w-lg bg-brand-bg p-8 flex flex-col gap-6 shadow-2xl border-brand-accent/30"
            >
              <div className="flex justify-between items-center border-b border-brand-border pb-4">
                <h3 className="label-caps mb-0 text-brand-text-bright flex items-center gap-2 text-sm">
                  <Terminal size={14} className="text-brand-accent" />
                  Manual Signal override // {editingItem.symbol}
                </h3>
                <button onClick={() => setEditingItem(null)} className="text-brand-text-dim hover:text-brand-text-bright">
                  <Activity size={18} className="rotate-45" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="label-caps text-[9px]">Symbol</label>
                  <input 
                    list="symbols-list"
                    className="bg-brand-elevated border border-brand-border p-2 monospace-data rounded uppercase"
                    value={editForm.symbol}
                    onChange={e => setEditForm({...editForm, symbol: e.target.value.toUpperCase()})}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="label-caps text-[9px]">Side</label>
                  <select 
                    className="bg-brand-elevated border border-brand-border p-2 monospace-data rounded text-xs"
                    value={editForm.side}
                    onChange={e => setEditForm({...editForm, side: e.target.value as any})}
                  >
                    <option value="Long">LONG</option>
                    <option value="Short">SHORT</option>
                    <option value="Neutral">NEUTRAL</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="label-caps text-[9px]">Entry</label>
                  <input 
                    type="number"
                    className="bg-brand-elevated border border-brand-border p-2 monospace-data rounded"
                    value={editForm.levels.entry || ''}
                    onChange={e => setEditForm({...editForm, levels: {...editForm.levels, entry: parseFloat(e.target.value)}})}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="label-caps text-[9px]">Take Profit</label>
                  <input 
                    type="number"
                    className="bg-brand-elevated border border-brand-border p-2 monospace-data rounded"
                    value={editForm.levels.takeProfit || ''}
                    onChange={e => setEditForm({...editForm, levels: {...editForm.levels, takeProfit: parseFloat(e.target.value)}})}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="label-caps text-[9px]">Stop Loss</label>
                  <input 
                    type="number"
                    className="bg-brand-elevated border border-brand-border p-2 monospace-data rounded"
                    value={editForm.levels.stopLoss || ''}
                    onChange={e => setEditForm({...editForm, levels: {...editForm.levels, stopLoss: parseFloat(e.target.value)}})}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="label-caps text-[9px]">Status</label>
                  <select 
                    className="bg-brand-elevated border border-brand-border p-2 monospace-data rounded text-xs"
                    value={editForm.status}
                    onChange={e => setEditForm({...editForm, status: e.target.value as any})}
                  >
                    <option value="Pending">PENDING</option>
                    <option value="Win">WIN</option>
                    <option value="Loss">LOSS</option>
                    <option value="BE">BE (BREAK EVEN)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="label-caps text-[9px]">Entry Date/Time (Chart Timestamp)</label>
                  <input 
                    type="datetime-local"
                    className="bg-brand-elevated border border-brand-border p-2 monospace-data rounded text-xs"
                    value={(() => {
                      try {
                        if (!editForm.date) return '';
                        const d = new Date(editForm.date);
                        if (isNaN(d.getTime())) return '';
                        return d.toISOString().slice(0, 16);
                      } catch (e) {
                        return '';
                      }
                    })()}
                    onChange={e => setEditForm({...editForm, date: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="label-caps text-[9px]">Exit Date/Time (For Duration)</label>
                  <input 
                    type="datetime-local"
                    className="bg-brand-elevated border border-brand-border p-2 monospace-data rounded text-xs"
                    value={editForm.exitDate ? new Date(editForm.exitDate).toISOString().slice(0, 16) : ''}
                    onChange={e => setEditForm({...editForm, exitDate: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="label-caps text-[9px]">Trade Notes // Observations</label>
                  <textarea 
                    className="bg-brand-elevated border border-brand-border p-3 monospace-data rounded text-xs min-h-[100px] resize-none focus:border-brand-accent transition-colors"
                    placeholder="Enter trade reasoning, emotions, or strategy nuances..."
                    value={editForm.notes || ''}
                    onChange={e => setEditForm({...editForm, notes: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border border-brand-border rounded hover:bg-brand-elevated transition-colors"
                >
                  Discard
                </button>
                <button 
                  onClick={handleUpdate}
                  className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest bg-brand-accent text-white rounded hover:opacity-80 transition-colors shadow-lg shadow-brand-accent/20"
                >
                  Commit changes
                </button>
              </div>

              <div className="pt-4 border-t border-brand-border">
                <button
                  onClick={() => handleDelete(editForm.id)}
                  className="w-full py-2 text-[9px] font-bold uppercase tracking-widest text-trade-short border border-trade-short/30 hover:bg-trade-short/10 transition-colors rounded"
                >
                  Terminate & Purge Node
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Top Navigation */}
      <header className="h-14 sm:h-16 border-b border-brand-border flex items-center justify-between px-4 sm:px-6 bg-brand-elevated shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-accent rounded flex items-center justify-center text-white font-bold shadow-lg shadow-brand-accent/20">
            <Cpu size={18} />
          </div>
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-brand-text-bright">
            TradeVision <span className="text-brand-text-dim/50 font-normal hidden sm:inline">v1.5 Flash</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-6">
          {/* Trading Mode Switcher - REPLACING Language Switcher */}
          <div className="hidden lg:flex items-center bg-brand-bg border border-brand-border rounded p-0.5 h-8">
            <button 
              onClick={() => changeMode('live')}
              className={`px-3 h-full text-[9px] font-bold transition-all rounded flex items-center gap-1.5 ${tradingMode === 'live' ? 'bg-brand-accent text-white shadow-sm' : 'text-brand-text-dim hover:text-brand-text-bright'}`}
            >
              <div className={`w-1 h-1 rounded-full ${tradingMode === 'live' ? 'bg-white animate-pulse' : 'bg-brand-accent'}`} />
              {t.modes.live}
            </button>
            <button 
              onClick={() => changeMode('backtest')}
              className={`px-3 h-full text-[9px] font-bold transition-all rounded flex items-center gap-1.5 ${tradingMode === 'backtest' ? 'bg-brand-warning text-white shadow-sm' : 'text-brand-text-dim hover:text-brand-text-bright'}`}
            >
              <RefreshCcw size={10} className={tradingMode === 'backtest' ? 'animate-spin-slow' : ''} />
              {t.modes.backtest}
            </button>
          </div>

          <nav className="hidden lg:flex gap-1 h-full items-center">
            {(isAdmin ? ['Dashboard', 'Performance', 'Log', 'Gallery', 'System', 'Admin'] : ['Dashboard', 'Performance', 'Log', 'Gallery', 'System']).map((tab) => (
              <button 
                key={tab} 
                onClick={() => setMainTab(tab as any)}
                className={`px-4 h-14 sm:h-16 text-xs font-bold uppercase tracking-wider transition-colors border-b-2
                  ${mainTab === tab ? 'text-brand-accent border-brand-accent' : 'text-brand-text-dim border-transparent hover:text-brand-text-bright'}`}
              >
                {(t.ui as any)[tab.toLowerCase()] || tab}
              </button>
            ))}
          </nav>
          <div className="hidden lg:block h-4 w-px bg-brand-border" />
          
          {/* Theme & Language Configuration */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Relocated Language Switcher */}
            <div className="flex items-center bg-brand-bg/50 border border-brand-border rounded p-0.5 h-8">
              <button 
                onClick={() => saveLanguage('EN')}
                className={`px-2.5 h-full text-[9px] font-bold transition-all rounded ${language === 'EN' ? 'bg-brand-accent/20 text-brand-accent' : 'text-brand-text-dim hover:text-brand-text-bright'}`}
              >
                EN
              </button>
              <button 
                onClick={() => saveLanguage('TH')}
                className={`px-2.5 h-full text-[9px] font-bold transition-all rounded ${language === 'TH' ? 'bg-brand-accent/20 text-brand-accent' : 'text-brand-text-dim hover:text-brand-text-bright'}`}
              >
                TH
              </button>
            </div>

            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded bg-brand-bg/50 border border-brand-border text-brand-text-dim hover:text-brand-accent hover:border-brand-accent transition-all">
                <Palette size={14} />
                <span className="text-[9px] font-bold uppercase tracking-widest">{t.ui.theme}</span>
              </button>
            <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="w-40 bg-brand-elevated border border-brand-border rounded-lg shadow-2xl overflow-hidden py-1">
                {[
                  { id: 'default', name: 'Obsidian' },
                  { id: 'light', name: 'Light' },
                  { id: 'tactical', name: 'Tactical Vanguard' },
                  { id: 'cyber', name: 'Cyberpunk' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => changeTheme(t.id as any)}
                    className={`w-full px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider transition-colors
                      ${theme === t.id ? 'bg-brand-accent/20 text-brand-accent' : 'text-brand-text-dim hover:bg-brand-bg hover:text-brand-text-bright'}`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setMainTab('Dashboard')}
          className="hidden sm:block bg-brand-accent hover:opacity-80 text-white text-[10px] font-bold px-4 py-2 rounded uppercase tracking-widest transition-all"
        >
            {t.ui.new_scan}
          </button>

          {/* Mobile Hamburguer Menu */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 text-brand-text-dim hover:text-brand-accent transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Migration / History */}
        <motion.aside 
          initial={false}
          animate={{ width: sidebarCollapsed ? 72 : 288 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="hidden lg:flex border-r border-brand-border bg-brand-bg flex-col shrink-0 relative"
        >
          {/* Sidebar Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-20 z-50 w-6 h-6 bg-brand-elevated border border-brand-border rounded-full flex items-center justify-center text-brand-text-dim hover:text-brand-accent shadow-lg transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          <div className={`p-4 border-b border-brand-border bg-brand-elevated/50 flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'justify-between'}`}>
            {!sidebarCollapsed && (
              <h2 className="label-caps mb-0 text-brand-text-bright flex items-center gap-2">
                <Database size={12} />
                {t.ui.recent_extractions}
              </h2>
            )}
            {sidebarCollapsed && <Database size={18} className="text-brand-accent/50" />}
          </div>

          <RadixTooltip.Provider delayDuration={100}>
            <div className={`flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 ${sidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
              {history.length === 0 ? (
                <div className={`p-8 text-center opacity-20 ${sidebarCollapsed ? 'px-0' : ''}`}>
                  <Layout size={sidebarCollapsed ? 20 : 32} className="mx-auto mb-2" />
                  {!sidebarCollapsed && <p className="text-[10px] uppercase font-bold">{t.ui.no_signals}</p>}
                </div>
              ) : (
                history.map((item) => {
                  const content = (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentAnalysis(item);
                        setPreview(item.imageUrl);
                      }}
                      className={`w-full rounded-lg border transition-all text-left group
                        ${sidebarCollapsed ? 'p-2 flex justify-center' : 'p-3'}
                        ${currentAnalysis?.id === item.id 
                          ? 'bg-brand-accent/10 border-brand-accent/50' 
                          : 'border-transparent hover:bg-brand-elevated hover:border-brand-border'}`}
                    >
                      {sidebarCollapsed ? (
                        <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-[10px] ring-1 ring-inset
                          ${item.side === 'Long' ? 'bg-trade-long/20 text-trade-long ring-trade-long/30' : 'bg-trade-short/20 text-trade-short ring-trade-short/30'}`}>
                          {item.symbol.substring(0, 2)}
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-1">
                            <span className="monospace-data text-xs">{item.symbol}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                              ${item.side === 'Long' ? 'bg-trade-long/20 text-trade-long' : 'bg-trade-short/20 text-trade-short'}`}>
                              {item.side}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[9px] text-brand-text-dim uppercase font-mono">
                            <Clock size={10} />
                            {item.date}
                          </div>
                        </>
                      )}
                    </button>
                  );

                  if (sidebarCollapsed) {
                    return (
                      <RadixTooltip.Root key={item.id}>
                        <RadixTooltip.Trigger asChild>
                          {content}
                        </RadixTooltip.Trigger>
                        <RadixTooltip.Portal>
                          <RadixTooltip.Content 
                            side="right" 
                            sideOffset={10}
                            className="z-[100] animate-in fade-in zoom-in-95 duration-200"
                          >
                            <div className="bg-brand-elevated/80 backdrop-blur-md border border-brand-accent/30 p-3 rounded-xl shadow-2xl min-w-[140px]">
                              <div className="flex justify-between items-center mb-2 gap-4">
                                <span className="text-xs font-bold text-brand-text-bright">{item.symbol}</span>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${item.side === 'Long' ? 'bg-trade-long/20 text-trade-long' : 'bg-trade-short/20 text-trade-short'}`}>
                                  {item.side}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[9px] text-brand-text-dim font-bold uppercase">
                                <Clock size={10} />
                                {item.date}
                              </div>
                              <RadixTooltip.Arrow className="fill-brand-elevated/80" />
                            </div>
                          </RadixTooltip.Content>
                        </RadixTooltip.Portal>
                      </RadixTooltip.Root>
                    );
                  }

                  return content;
                })
              )}
            </div>
          </RadixTooltip.Provider>

          <div className={`p-4 border-t border-brand-border bg-brand-elevated/80 flex flex-col gap-2 ${sidebarCollapsed ? 'items-center px-2' : ''}`}>
            <div className={`flex items-center gap-2 ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
              <div className={`shrink-0 w-2 h-2 rounded-full ${isAnalyzing ? 'bg-brand-warning animate-pulse' : 'bg-trade-long'}`} />
              {!sidebarCollapsed && (
                <span className="text-[10px] uppercase font-bold text-brand-text-dim/60">
                  {isAnalyzing ? t.ui.engine_processing : t.ui.engine_online}
                </span>
              )}
            </div>
            {!sidebarCollapsed ? (
              <div className="text-[10px] text-brand-text-dim font-mono tracking-tighter truncate">LATENCY: {isAnalyzing ? '...' : '42ms'} // REGION: US-EAST</div>
            ) : (
              <div className="text-[8px] text-brand-text-dim/50 font-mono tracking-tighter">42ms</div>
            )}
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-brand-bg">
          <div className={`p-6 mx-auto flex flex-col gap-6 transition-all duration-300 ${sidebarCollapsed ? 'max-w-7xl' : 'max-w-6xl'}`}>
            
            {error && !(!user) && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-brand-danger/10 border border-brand-danger/30 rounded text-brand-danger text-xs flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle size={16} />
                  <span className="font-bold uppercase tracking-widest">{error}</span>
                </div>
                <button onClick={() => setError(null)} className="opacity-50 hover:opacity-100">
                  <X size={14} />
                </button>
              </motion.div>
            )}

            {mainTab === 'Dashboard' ? (
              <>
                {!geminiKey && (
                  <div className="technical-panel p-4 bg-brand-accent/5 border-brand-accent/30 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex items-center gap-3">
                      <Zap className="text-brand-accent animate-pulse" size={20} />
                      <div>
                        <p className="text-xs font-bold text-brand-text-bright uppercase tracking-wider">{t.ui.offline_warning}</p>
                        <p className="text-[10px] text-brand-text-dim uppercase tracking-tighter">{t.ui.byok_required}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setMainTab('System')}
                      className="px-4 py-2 bg-brand-accent text-white text-[9px] font-bold uppercase tracking-widest rounded hover:opacity-80 transition-all"
                    >
                      {t.ui.authorize_node}
                    </button>
                  </div>
                )}
                {/* Stage: Upload Area */}
                <div className="relative group technical-panel h-[320px] flex flex-col items-center justify-center p-8 overflow-hidden">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-accent/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                   
                   <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                      <button 
                         onClick={() => setShowCaptureGuide(true)}
                         className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-brand-accent hover:text-white transition-colors bg-brand-bg/50 backdrop-blur px-3 py-1.5 rounded-full border border-brand-accent/20"
                      >
                         <HelpCircle size={12} />
                         {t.capture.how}
                      </button>
                   </div>

                   <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept="image/*"
                    onChange={onFileUpload}
                    disabled={isAnalyzing}
                  />
                  
                  <div className={`flex flex-col items-center text-center gap-4 transition-all duration-500 ${isAnalyzing ? 'scale-90 opacity-50' : 'group-hover:scale-110'}`}>
                    {isAnalyzing ? (
                      <div className="relative">
                        <Loader2 className="animate-spin text-brand-accent" size={48} />
                        <div className="absolute inset-0 blur-lg bg-brand-accent/20 animate-pulse" />
                      </div>
                    ) : (
                       <div className="p-6 rounded-full bg-brand-bg border border-brand-border shadow-2xl">
                         <Upload className="text-brand-accent" size={32} />
                       </div>
                    )}
                    <div>
                      <h3 className="text-xl font-medium text-brand-text-bright">{t.ui.ingest_visual}</h3>
                      <p className="text-xs text-brand-text-dim mt-2 uppercase tracking-widest font-mono opacity-50">{t.ui.drop_image}</p>
                    </div>
                  </div>
                </div>

                {/* Analysis Grid */}
                {(currentAnalysis || isAnalyzing) && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Left: Metadata & Levels */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                      {/* Summary Bar */}
                      <div className="flex items-center justify-between border-b border-brand-border pb-4">
                        <h3 className="label-caps mb-0 text-brand-text-bright flex items-center gap-2">
                           <Layout size={14} className="text-brand-accent" />
                           {t.ui.extraction_pipeline}
                        </h3>
                        <div className="flex gap-2">
                           <button 
                            onClick={() => setActiveTab('visual')}
                            className={`px-3 py-1 text-[10px] font-bold rounded uppercase tracking-wider transition-all 
                            ${activeTab === 'visual' ? 'bg-brand-accent text-white' : 'bg-brand-elevated text-brand-text-dim hover:text-brand-text-bright'}`}
                           >
                             {t.ui.visual_output}
                           </button>
                           <button 
                             onClick={() => setActiveTab('json')}
                             className={`px-3 py-1 text-[10px] font-bold rounded uppercase tracking-wider transition-all
                             ${activeTab === 'json' ? 'bg-brand-accent text-white' : 'bg-brand-elevated text-brand-text-dim hover:text-brand-text-bright'}`}
                           >
                             {t.ui.json_model}
                           </button>
                        </div>
                      </div>

                      {activeTab === 'visual' ? (
                        <div className="flex flex-col gap-6">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <DataCard label="Symbol" value={currentAnalysis?.symbol ?? '--'} subValue="Contract ID" />
                            <DataCard label="Side" value={currentAnalysis?.side ?? '--'} subValue="Bias" mono={false} />
                            <DataCard label="Fibo Target" value={currentAnalysis?.fiboTarget ?? '--'} subValue="Extension" />
                            <DataCard label="Confidence" value={currentAnalysis ? `${(currentAnalysis.confidence * 100).toFixed(1)}%` : '--'} subValue="ML Score" />
                          </div>

                          <div className="technical-panel p-6 flex flex-col gap-4">
                            <label className="label-caps block">Price Execution Clusters</label>
                            <div className="space-y-3">
                              <PriceLevel label="Entry Point" value={currentAnalysis?.levels.entry ?? 0} color="bg-brand-accent" icon={Terminal} />
                              <PriceLevel label="Take Profit" value={currentAnalysis?.levels.takeProfit ?? 0} color="bg-trade-long" icon={Target} />
                              <PriceLevel label="Stop Loss" value={currentAnalysis?.levels.stopLoss ?? 0} color="bg-trade-short" icon={AlertCircle} />
                            </div>
                          </div>

                          <div className="technical-panel p-4 flex items-center gap-4 bg-brand-accent/5 border-brand-accent/20">
                            <Activity className="text-brand-accent shrink-0" size={20} />
                            <div>
                              <p className="label-caps mb-0 text-brand-accent">Temporal Context</p>
                              <p className="monospace-data text-sm tracking-widest">{currentAnalysis?.timestamp ?? 'Stream sync required'}</p>
                            </div>
                          </div>

                          {/* Confirm & Save Section */}
                          <div className="technical-panel p-6 bg-brand-accent/5 border-brand-accent/30 border-t-2">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                              <div className="flex-1">
                                <label className="label-caps block text-brand-text-bright">{t.ui.validated_persistence}</label>
                                <p className="text-[10px] text-brand-text-dim uppercase tracking-wider mb-4">Select trade outcome to authorize database commit</p>
                                
                                <div className="flex flex-wrap gap-2">
                                  {(['Win', 'Loss', 'BE', 'Pending'] as TradeStatus[]).map((status) => (
                                    <button
                                      key={status}
                                      onClick={() => setSelectedStatus(status)}
                                      className={`flex-1 min-w-[70px] py-2 px-3 text-[10px] font-bold rounded border transition-all uppercase tracking-widest
                                        ${selectedStatus === status 
                                          ? (status === 'Win' ? 'bg-trade-long border-trade-long text-white' : 
                                             status === 'Loss' ? 'bg-trade-short border-trade-short text-white' :
                                             status === 'BE' ? 'bg-brand-text-bright border-brand-text-bright text-black' :
                                             'bg-brand-accent border-brand-accent text-white')
                                          : 'bg-brand-bg border-brand-border text-brand-text-dim hover:border-brand-text-bright'}`}
                                    >
                                      {status}
                                    </button>
                                  ))}
                                  <button
                                    onClick={() => {
                                      if (currentAnalysis) {
                                        setValidationData(currentAnalysis);
                                        setIsValidationOpen(true);
                                      }
                                    }}
                                    className="px-4 border border-brand-accent/30 text-brand-accent text-[9px] font-bold rounded hover:bg-brand-accent/10 transition-all uppercase flex items-center justify-center gap-2"
                                    title="Open Validation Overlay"
                                  >
                                    <Activity size={12} />
                                    {t.ui.validate}
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-end">
                                <button
                                  onClick={handleSave}
                                  disabled={isSaving || saveSuccess || !currentAnalysis}
                                  className={`h-12 px-8 rounded-lg flex items-center gap-3 font-bold uppercase tracking-widest text-xs transition-all
                                    ${saveSuccess 
                                      ? 'bg-trade-long text-white cursor-default' 
                                      : 'bg-brand-accent hover:opacity-90 text-white shadow-lg shadow-brand-accent/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                                >
                                  {isSaving ? (
                                    <Loader2 size={16} className="animate-spin" />
                                  ) : saveSuccess ? (
                                    <CheckCircle2 size={16} />
                                  ) : (
                                    <Save size={16} />
                                  )}
                                  {isSaving ? t.ui.syncing : saveSuccess ? t.ui.committed : t.ui.authorize_save}
                                </button>
                              </div>
                            </div>
                            
                            {saveSuccess && (
                              <motion.p 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[9px] text-trade-long font-mono mt-3 uppercase tracking-tighter"
                              >
                                {t.ui.save_success}: {currentAnalysis?.symbol} @ {selectedStatus}
                              </motion.p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="technical-panel p-6 bg-black/40 font-mono text-xs overflow-hidden relative min-h-[400px]">
                          <div className="flex items-center justify-between mb-4 pb-2 border-b border-brand-border">
                            <span className="text-brand-accent flex items-center gap-2">
                              <Code size={12} />
                              {t.ui.raw_output}
                            </span>
                            <button className="text-[10px] hover:text-brand-accent transition-colors uppercase">{t.ui.back} (DEBUG)</button>
                          </div>
                          <pre className="text-brand-accent leading-relaxed overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(currentAnalysis, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Right: Visual Reference */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                       <div className="flex items-center justify-between border-b border-brand-border pb-4">
                        <h3 className="label-caps mb-0 text-brand-text-bright flex items-center gap-2">
                           <Activity size={14} className="text-brand-accent" />
                           {t.ui.source_image}
                        </h3>
                      </div>
                      
                      <div className="technical-panel p-1.5 overflow-hidden group/img relative">
                        {preview ? (
                          <div className="relative">
                            <img 
                              src={preview} 
                              alt="Input stream" 
                              className="w-full h-auto grayscale group-hover/img:grayscale-0 transition-all duration-700 rounded" 
                            />
                            <div className="absolute inset-0 border-[20px] border-black/10 pointer-events-none" />
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-white flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                              LIVE_PREVIEW
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-video flex items-center justify-center opacity-10 grayscale">
                            <Layout size={48} />
                          </div>
                        )}
                      </div>

                      <div className="technical-panel p-4 flex flex-col gap-3">
                        <h4 className="label-caps">{t.ui.system_warnings}</h4>
                        <AnimatePresence mode="wait">
                          {error ? (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="flex items-start gap-2 p-3 bg-trade-short/10 border border-trade-short/30 rounded text-trade-short"
                            >
                              <AlertCircle size={14} className="shrink-0 mt-0.5" />
                              <p className="text-[10px] font-bold uppercase leading-tight">{error}</p>
                            </motion.div>
                          ) : (
                            <div className="flex items-start gap-2 p-3 bg-brand-accent/5 border border-brand-accent/20 rounded text-brand-text-dim">
                               <TrendingUp size={14} className="shrink-0 mt-0.5" />
                               <p className="text-[10px] font-medium leading-tight">Gemini Vision is currently monitoring TradingView screenshot patterns. Ensure high contrast for optimal extraction.</p>
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : mainTab === 'Log' ? (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between border-b border-brand-border pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-brand-text-bright">{t.ui.trade_intelligence_log}</h2>
                    <p className="text-xs text-brand-text-dim uppercase tracking-[3px] font-mono">Raw Signal Buffer // {history.length} Nodes</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={exportToCSV}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-elevated border border-brand-border rounded text-[10px] font-bold uppercase tracking-widest hover:border-brand-accent hover:text-brand-accent transition-all"
                    >
                      <Download size={14} />
                      {t.ui.export_csv}
                    </button>
                    <button className="p-2 technical-panel hover:bg-brand-accent/10 transition-colors text-brand-text-dim hover:text-brand-accent">
                      <Layout size={16} />
                    </button>
                  </div>
                </div>

                <div className="technical-panel overflow-hidden">
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-brand-elevated/50 border-b border-brand-border">
                          <th className="p-4 label-caps">Symbol</th>
                          <th className="p-4 label-caps">Side</th>
                          <th className="p-4 label-caps">Entry</th>
                          <th className="p-4 label-caps">SL / TP</th>
                          <th className="p-4 label-caps">Status</th>
                          <th className="p-4 label-caps">RR</th>
                          <th className="p-4 label-caps">Timestamp</th>
                          <th className="p-4 label-caps text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/50 relative">
                        <AnimatePresence mode="popLayout">
                          {history.map((item) => (
                            <TradeRow 
                              key={item.id} 
                              item={item} 
                              onEdit={(item) => {
                                setEditingItem(item);
                                setEditForm({ ...item });
                              }}
                              onDelete={handleDelete}
                              t={t}
                            />
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Swipeable List View */}
                  <div className="md:hidden divide-y divide-brand-border/30">
                    <AnimatePresence mode="popLayout">
                      {history.map((item) => (
                        <MobileLogItem 
                          key={item.id} 
                          item={item} 
                          onDelete={handleDelete} 
                          onEdit={(item) => {
                            setEditingItem(item);
                            setEditForm({ ...item });
                          }} 
                          t={t}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
                  
                  {history.length === 0 && (
                    <div className="p-20 text-center opacity-20 flex flex-col items-center gap-2">
                      <Code size={48} />
                      <p className="label-caps">{t.ui.no_trades}</p>
                    </div>
                  )}
                </div>
            ) : mainTab === 'Analytics' ? (
              <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between border-b border-brand-border pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-brand-text-bright uppercase tracking-tighter">{t.ui.performance_stats}</h2>
                    <p className="text-xs text-brand-text-dim uppercase tracking-[3px] font-mono">Statistical Oversight // Neural Signal Analysis</p>
                  </div>
                </div>

                {stats && stats.totalTrades > 0 ? (
                  <>
                    <InsightPanel stats={stats} t={t} />
                    <StatsPanel 
                      stats={stats} 
                      history={history} 
                      t={t}
                      tradingMode={tradingMode}
                      strategies={strategies}
                      onAddStrategy={handleAddStrategy}
                      onUpdateStrategy={handleUpdateStrategy}
                      onDeleteStrategy={handleDeleteStrategy}
                    />
                    <EquityChart stats={stats} t={t} />
                  </>
                ) : (
                  <div className="technical-panel p-20 flex flex-col items-center gap-4 text-center opacity-30">
                    <Database size={48} />
                    <div>
                      <h3 className="text-xl font-bold uppercase tracking-widest">{t.ui.insufficient_data}</h3>
                      <p className="text-sm font-mono mt-2">{t.ui.stats_engine_requirement}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : mainTab === 'Performance' ? (
              <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between border-b border-brand-border pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-brand-text-bright uppercase tracking-tighter">{t.ui.performance}</h2>
                    <p className="text-xs text-brand-text-dim uppercase tracking-[3px] font-mono">Analytics Architecture // Strategic Edge Evaluation</p>
                  </div>
                </div>
                <PerformanceDashboard stats={stats} t={t} isSidebarCollapsed={sidebarCollapsed} />
              </div>
            ) : mainTab === 'Gallery' ? (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-brand-text-bright">{t.ui.gallery}</h1>
                    <p className="text-sm text-brand-text-dim">{t.ui.visual_repository}</p>
                  </div>
                  <div className="px-3 py-1 bg-brand-elevated border border-brand-border rounded text-[10px] font-mono text-brand-accent">
                    STREAM_SIZE: {history.filter(h => h.imageUrl).length} NODES
                  </div>
                </div>

                <div className={`grid grid-cols-1 gap-6 transition-all duration-300 
                  ${sidebarCollapsed 
                    ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'md:grid-cols-2 lg:grid-cols-3'}`}>
                  {history.filter(item => item.imageUrl).map((item) => (
                    <motion.div 
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      className="technical-panel group cursor-pointer overflow-hidden border-brand-border/40 hover:border-brand-accent/50 transition-all bg-brand-elevated/40"
                      onClick={() => setSelectedGalleryItem(item)}
                    >
                      <div className="relative aspect-video overflow-hidden bg-black/20">
                        <img 
                          src={item.imageUrl} 
                          alt={item.symbol} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <div className="flex items-center gap-2 text-white">
                            <Maximize2 size={16} className="text-brand-accent" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{t.ui.examine_setup}</span>
                          </div>
                        </div>
                        <div className={`absolute top-2 right-2 flex items-center gap-1.5`}>
                          {item.notes && (
                            <div className="bg-brand-accent/80 border border-brand-accent/40 p-1 rounded backdrop-blur-sm">
                              <StickyNote size={10} className="text-white" />
                            </div>
                          )}
                          <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter ${
                            item.status === 'Win' ? 'bg-brand-success/80 border border-brand-success/40' : 
                            item.status === 'Loss' ? 'bg-brand-danger/80 border border-brand-danger/40' : 'bg-brand-accent/80 border border-brand-accent/40'
                          } text-white`}>
                            {item.symbol} • {item.side}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 flex justify-between items-center border-t border-brand-border/50">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-brand-text-dim uppercase font-bold tracking-wider">{item.date}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono text-brand-text-bright">
                              {item.status === 'Pending' ? (
                                <span className="text-brand-accent animate-pulse">STATUS: {t.status.pending}</span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <span>{t.ui.result}:</span>
                                  <span className={calculateRMultiple(item) >= 0 ? 'text-trade-long' : 'text-trade-short'}>
                                    {calculateRMultiple(item) >= 0 ? '+' : ''}{calculateRMultiple(item).toFixed(1)}R
                                  </span>
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                        {item.confidence && (
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(star => (
                              <div key={star} className={`w-1 h-3 rounded-full ${star <= (item.confidence || 0) ? 'bg-brand-accent' : 'bg-brand-border'}`} />
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {history.filter(item => item.imageUrl).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
                    <ImageIcon size={48} className="text-brand-accent mb-4" />
                    <h3 className="text-lg font-bold uppercase tracking-widest">{t.ui.no_trades}</h3>
                    <p className="text-xs font-mono mt-2">{t.ui.insufficient_data}</p>
                  </div>
                )}
              </div>
            ) : mainTab === 'System' ? (
              <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full p-4 lg:p-8">
                <div className="flex items-center justify-between border-b border-brand-border/30 pb-6 mb-2">
                  <div>
                    <h2 className="text-3xl font-bold text-brand-text-bright tracking-tight">{t.ui.system} Architecture</h2>
                    <p className="text-xs text-brand-text-dim uppercase tracking-[4px] font-mono mt-1 opacity-60">{t.ui.environment_matrix} // Pro Configuration Zone</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end">
                      <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">{t.ui.system_status}</span>
                      <span className="text-xs font-mono text-trade-long flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-trade-long animate-pulse" />
                        NODAL_LINK_STABLE
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Left Panel: Base Configuration */}
                  <div className="flex flex-col gap-10">
                    <div className="glass-card glow-border p-8 flex flex-col gap-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Cpu size={120} />
                      </div>
                      
                      {/* Bring Your Own Intelligence */}
                      <div className="flex flex-col gap-6 relative z-10">
                        <div className="flex items-center gap-4 text-brand-accent">
                          <div className="p-2 bg-brand-accent/10 rounded-lg">
                            <Zap size={24} />
                          </div>
                          <div>
                            <h3 className="label-caps mb-0 text-base text-brand-text-bright tracking-normal">{t.system.title}</h3>
                            <p className="text-[10px] text-brand-text-dim uppercase tracking-widest opacity-60">Neural Engine Matrix</p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-brand-text-dim leading-relaxed">
                          {t.system.description}
                        </p>
                        
                        <div className="flex flex-col gap-3">
                           <div className="flex items-center justify-between">
                             <label className="label-caps text-[10px] font-bold">{t.system.label}</label>
                             <button 
                               onClick={() => setShowApiKeyGuide(true)}
                               className="text-[10px] text-brand-accent hover:text-white transition-colors flex items-center gap-1.5 font-bold uppercase tracking-widest bg-brand-accent/10 px-2 py-1 rounded"
                             >
                               <HelpCircle size={12} />
                               {t.system.guide}
                             </button>
                           </div>
                           <div className="flex gap-2">
                             <input 
                               type="password"
                               className="flex-1 bg-brand-bg/50 border border-brand-border p-3 monospace-data rounded-lg text-sm focus:border-brand-accent transition-all duration-300 outline-none"
                               placeholder="AIzaSy..."
                               value={geminiKey}
                               onChange={e => {
                                 saveGeminiKey(e.target.value);
                                 setIsKeyVerified(false);
                               }}
                             />
                             <button 
                               onClick={testGeminiKey}
                               disabled={authLoading || !geminiKey}
                               className={`px-6 py-3 text-white text-[10px] font-bold uppercase tracking-[2px] rounded-lg transition-all flex items-center gap-2 ${
                                 isKeyVerified ? 'bg-trade-long shadow-lg shadow-trade-long/20' : 'bg-brand-accent hover:opacity-80 shadow-lg shadow-brand-accent/20'
                               } disabled:opacity-50 active:scale-95`}
                             >
                               {authLoading ? <Loader2 size={14} className="animate-spin" /> : (isKeyVerified ? <ShieldCheck size={14} /> : <Zap size={14} />)}
                               {isKeyVerified ? t.system.verified : t.system.verify}
                             </button>
                           </div>
                           {isKeyVerified && (
                             <div className="p-3 bg-trade-long/10 border border-trade-long/20 rounded-lg flex items-center gap-3 animate-in zoom-in-95 duration-300">
                               <div className="w-2 h-2 rounded-full bg-trade-long animate-pulse shadow-[0_0_8px_var(--trade-long)]" />
                               <span className="text-[10px] text-trade-long font-mono font-bold uppercase tracking-widest">{t.system.neural_active}</span>
                             </div>
                           )}
                           <p className="text-[10px] text-brand-text-dim opacity-50 font-mono tracking-tighter uppercase">{t.system.get_key} <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-brand-accent hover:underline">Google AI Studio</a></p>
                        </div>
                      </div>

                      <div className="h-px bg-brand-border/30 w-full" />

                      {/* Identity Management */}
                      <div className="flex flex-col gap-6 relative z-10">
                        <div className="flex items-center gap-4 text-trade-short">
                          <div className="p-2 bg-trade-short/10 rounded-lg">
                            <ShieldCheck size={24} />
                          </div>
                          <div>
                            <h3 className="label-caps mb-0 text-base text-brand-text-bright tracking-normal">{t.ui.identity_management}</h3>
                            <p className="text-[10px] text-brand-text-dim uppercase tracking-widest opacity-60">Authenticated Proxy Stream</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1 p-4 bg-brand-bg/40 rounded-xl border border-brand-border/50">
                            <span className="text-[10px] text-brand-text-dim uppercase font-bold tracking-widest opacity-60">{t.ui.active_pilot}</span>
                            <span className="text-sm font-mono text-brand-text-bright truncate">{user?.email}</span>
                          </div>
                          <div className="flex flex-col gap-1 p-4 bg-brand-bg/40 rounded-xl border border-brand-border/50">
                            <span className="text-[10px] text-brand-text-dim uppercase font-bold tracking-widest opacity-60">{t.ui.unique_neural_id}</span>
                            <span className="text-xs font-mono text-brand-text-dim truncate">{user?.id}</span>
                          </div>
                        </div>
                        
                        <button 
                          onClick={handleLogout}
                          className="w-full py-4 bg-trade-short/5 border border-trade-short/20 text-trade-short font-bold uppercase tracking-[4px] text-[10px] rounded-xl hover:bg-trade-short hover:text-white transition-all duration-500 shadow-xl shadow-trade-short/5 flex items-center justify-center gap-3 group"
                        >
                          <X size={16} className="group-hover:rotate-90 transition-transform duration-500" />
                          {t.ui.deauthorize_session}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Panel: Advanced Operations */}
                  <div className="flex flex-col gap-10">
                    <div className="glass-card glow-border p-8 flex flex-col gap-8">
                       {/* Data Persistence & Privacy */}
                       <div className="flex flex-col gap-6 opacity-90">
                        <div className="flex items-center gap-4 text-brand-accent">
                          <div className="p-2 bg-brand-accent/10 rounded-lg">
                            <Database size={24} />
                          </div>
                          <div>
                            <h3 className="label-caps mb-0 text-xl font-black text-brand-text-bright tracking-tight uppercase">{t.system.persistence_title}</h3>
                            <p className="text-[10px] text-brand-accent uppercase tracking-[4px] opacity-70 font-bold mt-0.5">{t.system.persistence_subtitle}</p>
                          </div>
                        </div>
                        
                        <div className="bg-brand-bg/30 p-5 rounded-2xl border border-brand-border/30 text-[11px] text-brand-text-dim leading-relaxed uppercase tracking-tight font-medium space-y-4">
                          <p className="text-brand-accent font-black tracking-[2px] border-l-2 border-brand-accent pl-3 text-[10px] sm:text-[11px]">{t.system.persistence_protocol}</p>
                          <ul className="grid grid-cols-1 gap-3 ml-1">
                            <li className="flex items-start gap-3">
                               <Shield className="shrink-0 mt-0.5 text-brand-accent" size={14} />
                               <span>{t.system.persistence_item1}</span>
                            </li>
                            <li className="flex items-start gap-3">
                               <Shield className="shrink-0 mt-0.5 text-brand-accent" size={14} />
                               <span>{t.system.persistence_item2}</span>
                            </li>
                            <li className="flex items-start gap-3">
                               <Shield className="shrink-0 mt-0.5 text-brand-accent" size={14} />
                               <span>{t.system.persistence_item3}</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="flex items-center justify-between p-1">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-2 text-[10px] font-bold text-brand-text-dim uppercase tracking-widest">
                              <span className="w-1.5 h-1.5 rounded-full bg-trade-long shadow-[0_0_8px_var(--trade-long)]" />
                              {t.system.persistence_sync}
                            </span>
                            <span className="flex items-center gap-2 text-[10px] font-bold text-brand-text-dim uppercase tracking-widest">
                              <span className="w-1.5 h-1.5 rounded-full bg-trade-long shadow-[0_0_8px_var(--trade-long)]" />
                              {t.system.persistence_encryption}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-brand-accent opacity-50 uppercase tracking-tighter">VERSION_1.0.4_PRO</span>
                        </div>
                      </div>

                      <div className="h-px bg-brand-border/30 w-full" />

                      {/* SUPPORT & FEEDBACK */}
                      <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-4 text-brand-accent">
                          <div className="p-2 bg-brand-accent/10 rounded-lg">
                            <HelpCircle size={24} />
                          </div>
                          <div>
                            <h3 className="label-caps mb-0 text-xl font-black text-brand-text-bright tracking-tight uppercase">{t.system.feedback_title}</h3>
                            <p className="text-[10px] text-brand-accent uppercase tracking-[4px] opacity-70 font-bold mt-0.5">{t.system.feedback_subtitle}</p>
                          </div>
                        </div>

                        <form onSubmit={handleFeedbackSubmit} className="flex flex-col gap-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-black uppercase tracking-[2px] text-brand-accent/80 ml-1">{t.system.feedback_label_category}</label>
                              <select 
                                value={feedbackCategory}
                                onChange={e => setFeedbackCategory(e.target.value)}
                                className="bg-brand-bg/50 border border-brand-border p-3.5 text-[10px] uppercase font-bold rounded-xl focus:border-brand-accent transition-all outline-none appearance-none cursor-pointer"
                              >
                                <option value="General">General</option>
                                <option value="Bug">Bug Report</option>
                                <option value="Feature">Feature Request</option>
                                <option value="Question">Question</option>
                              </select>
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-black uppercase tracking-[2px] text-brand-accent/80 ml-1">{t.system.feedback_label_subject}</label>
                              <input 
                                type="text"
                                required
                                placeholder={t.system.feedback_placeholder_subject}
                                value={feedbackSubject}
                                onChange={e => setFeedbackSubject(e.target.value)}
                                className="bg-brand-bg/50 border border-brand-border p-3.5 text-xs rounded-xl focus:border-brand-accent transition-all outline-none font-medium"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-[2px] text-brand-accent/80 ml-1">{t.system.feedback_label_details}</label>
                            <textarea 
                              required
                              rows={3}
                              placeholder={t.system.feedback_placeholder_details}
                              value={feedbackMessage}
                              onChange={e => setFeedbackMessage(e.target.value)}
                              className="bg-brand-bg/50 border border-brand-border p-4 text-xs rounded-xl focus:border-brand-accent transition-all outline-none resize-none font-medium leading-relaxed"
                            />
                          </div>

                          {feedbackSuccess && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="p-4 bg-trade-long/10 border border-trade-long/30 rounded-xl flex items-center justify-center gap-3"
                            >
                              <CheckCircle2 size={16} className="text-trade-long" />
                              <span className="text-[11px] text-trade-long font-black uppercase tracking-[3px]">{t.system.feedback_success}</span>
                            </motion.div>
                          )}

                          <button 
                            type="submit"
                            disabled={isSubmittingFeedback || !feedbackSubject || !feedbackMessage}
                            className="w-full py-5 bg-brand-accent text-white font-black uppercase tracking-[6px] text-xs rounded-xl hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl shadow-brand-accent/20 disabled:opacity-50 active:scale-[0.98]"
                          >
                            {isSubmittingFeedback ? <Loader2 size={18} className="animate-spin" /> : <RefreshCcw size={18} />}
                            {t.system.feedback_button}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : mainTab === 'Admin' ? (
              <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between border-b border-brand-border pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-brand-text-bright uppercase tracking-tighter">Admin Control Center</h2>
                    <p className="text-xs text-brand-text-dim uppercase tracking-[3px] font-mono">Central Oversight // Global Feedback Stream</p>
                  </div>
                  <button 
                    onClick={loadAdminData}
                    disabled={isAdminLoading}
                    className="p-3 bg-brand-accent/10 border border-brand-accent/20 text-brand-accent rounded hover:bg-brand-accent hover:text-white transition-all flex items-center gap-2"
                  >
                    <RefreshCcw size={16} className={isAdminLoading ? 'animate-spin' : ''} />
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2">Synchronize Repository</span>
                  </button>
                </div>

                {/* User Monitoring Console */}
                <div className="technical-panel overflow-hidden border-brand-accent/30 bg-brand-elevated/20">
                  <div className="bg-brand-accent/5 p-4 border-b border-brand-border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="label-caps mb-0 text-[10px]">User Monitoring Console</span>
                      <div className="h-4 w-px bg-brand-border" />
                      <span className="monospace-data text-[10px] text-brand-accent uppercase tracking-tighter">{adminUsers.length} REGISTERED NODES</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] text-brand-text-dim uppercase tracking-widest font-bold">Live Synced Entities</span>
                       <div className="w-1.5 h-1.5 rounded-full bg-trade-long animate-pulse" />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-brand-border bg-brand-bg/50">
                          <th className="p-4 label-caps text-[9px]">Status</th>
                          <th className="p-4 label-caps text-[9px]">Neural ID (Email)</th>
                          <th className="p-4 label-caps text-[9px]">Global Unique ID</th>
                          <th className="p-4 label-caps text-[9px]">Last Sync Matrix</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/50">
                        {adminUsers.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-12 text-center">
                              <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                                <Database size={24} className="text-brand-text-dim opacity-20" />
                                <p className="text-[10px] text-brand-text-dim uppercase tracking-widest leading-relaxed">
                                  Neural profiles table not detected or empty. 
                                  <br />
                                  To enable user monitoring, create a 'profiles' table in your Supabase Dashboard SQL Editor.
                                </p>
                                <div className="bg-brand-bg p-3 border border-brand-border rounded text-left w-full overflow-hidden">
                                  <pre className="text-[8px] text-brand-accent/70 font-mono overflow-x-auto">
                                    {`create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  last_sign_in_at timestamp with time zone,
  updated_at timestamp with time zone
);

alter table public.profiles enable row level security;
create policy "Allow public read" on profiles for select using (true);
create policy "Allow individual insert" on profiles for insert with check (auth.uid() = id);
create policy "Allow individual update" on profiles for update using (auth.uid() = id);`}
                                  </pre>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : adminUsers.map((u) => {
                          const isOnline = !!presenceUsers[u.id];
                          return (
                            <tr key={u.id} className="hover:bg-brand-accent/5 transition-colors group">
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-trade-long shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-brand-border'}`} />
                                  <span className={`text-[8px] font-bold uppercase ${isOnline ? 'text-trade-long' : 'text-brand-text-dim opacity-40'}`}>
                                    {isOnline ? 'Active' : 'Offline'}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-bold text-brand-text-bright">{u.email}</span>
                                </div>
                              </td>
                              <td className="p-4 font-mono text-[9px] opacity-40">
                                {u.id}
                              </td>
                              <td className="p-4">
                                <div className="flex flex-col font-mono text-[9px]">
                                   <span className="text-brand-text-dim uppercase">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : 'N/A'}</span>
                                   <span className="text-[8px] opacity-30">SYNCED_VIA_ nexus_v1.5</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="technical-panel overflow-hidden border-brand-accent/30">
                  <div className="bg-brand-accent/5 p-4 border-b border-brand-border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="label-caps mb-0 text-[10px]">Feedback Stream</span>
                      <div className="h-4 w-px bg-brand-border" />
                      <span className="monospace-data text-[10px] text-brand-accent uppercase tracking-tighter">{adminFeedback.length} INGESTED ENTRIES</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-brand-border bg-brand-bg/50">
                          <th className="p-4 label-caps text-[9px]">ID / Status</th>
                          <th className="p-4 label-caps text-[9px]">Category / Subject</th>
                          <th className="p-4 label-caps text-[9px]">Message Details</th>
                          <th className="p-4 label-caps text-[9px]">Neural Profile</th>
                          <th className="p-4 label-caps text-[9px]">Time Matrix</th>
                          <th className="p-4 label-caps text-[9px]">Management Console</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/50">
                        {adminFeedback.map((fb) => (
                          <tr key={fb.id} className="hover:bg-brand-accent/5 transition-colors">
                            <td className="p-4 font-mono">
                              <div className="flex flex-col gap-1">
                                <span className="text-[8px] opacity-40">{fb.id.slice(0,8)}...</span>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase inline-block w-fit ${
                                  fb.status === 'fixed' ? 'bg-trade-long/20 text-trade-long' : 
                                  fb.status === 'pending' ? 'bg-brand-warning/20 text-brand-warning' : 'bg-brand-accent/20 text-brand-accent'
                                }`}>
                                  {fb.status}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-brand-text-bright uppercase tracking-wider">{fb.category}</span>
                                <span className="text-brand-text-dim text-[11px] truncate max-w-[150px]">{fb.subject}</span>
                              </div>
                            </td>
                            <td className="p-4 text-brand-text-dim text-[11px] max-w-sm">
                              <p className="line-clamp-2">{fb.message}</p>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col gap-1 font-mono text-[9px] opacity-60">
                                <span>{fb.system_info?.platform || 'UNKNOWN'}</span>
                                <span>{fb.system_info?.screenSize || '0x0'}</span>
                              </div>
                            </td>
                            <td className="p-4 text-[9px] opacity-40 uppercase font-mono">
                              {new Date(fb.created_at).toLocaleString()}
                            </td>
                            <td className="p-4 bg-brand-bg/20">
                              <div className="flex gap-2">
                                {fb.status === 'pending' && (
                                  <button 
                                    onClick={() => handleUpdateStatus(fb.id, 'in-progress')}
                                    className="px-2 py-1 bg-brand-accent/20 text-brand-accent text-[9px] font-bold uppercase rounded hover:bg-brand-accent hover:text-white transition-all border border-brand-accent/30"
                                  >
                                    Mark Active
                                  </button>
                                )}
                                {fb.status !== 'fixed' && (
                                  <button 
                                    onClick={() => handleUpdateStatus(fb.id, 'fixed')}
                                    className="px-3 py-1 bg-trade-long/20 text-trade-long text-[9px] font-bold uppercase rounded hover:bg-trade-long hover:text-white transition-all flex items-center gap-1.5 border border-trade-long/30 shadow-lg shadow-trade-long/10"
                                  >
                                    <CheckCircle2 size={12} />
                                    Mark Managed
                                  </button>
                                )}
                                {fb.status !== 'closed' && (
                                  <button 
                                    onClick={() => handleUpdateStatus(fb.id, 'closed')}
                                    className="px-2 py-1 bg-white/10 text-brand-text-dim text-[9px] font-bold uppercase rounded hover:bg-white/20 transition-all border border-white/5"
                                  >
                                    Archive Entry
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {adminFeedback.length === 0 && !isAdminLoading && (
                    <div className="p-20 text-center opacity-20 flex flex-col items-center">
                       <Database size={48} className="mb-4" />
                       <p className="label-caps">No Data Ingested</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="technical-panel p-12 text-center opacity-30">
                <Terminal size={48} className="mx-auto mb-4" />
                <h3 className="text-xl font-bold uppercase tracking-widest leading-none">System Architecture</h3>
                <p className="text-xs font-mono mt-2 uppercase">Core Node Status: Operational // Gemini API Link: Active</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer Status Bar */}
      <footer className="h-8 bg-brand-elevated border-t border-brand-border flex items-center px-4 justify-between text-[10px] font-mono tracking-tighter text-brand-text-dim shrink-0">
        <div className="flex gap-6 items-center">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent shadow-[0_0_8px_var(--brand-accent)]" />
            WORKSPACE: TRADER_PRO_NODE_01
          </span>
          <span className="hidden md:inline">SYSTEM_UPTIME: 124:42:08</span>
          <span className="hidden md:inline text-brand-accent/50">SECURE_TUNNEL: ENABLED</span>
          {isRefreshing && <span className="animate-pulse text-brand-accent font-bold">// SYNCING_DB...</span>}
        </div>
        <div className="flex gap-4 items-center">
          <span className="hidden sm:inline">PROCESSED: {history.length} ITEMS</span>
          <span className="bg-brand-border/30 px-2 py-0.5 rounded text-brand-text-dim/80">2024-05-08 16:21:44 UTC</span>
        </div>
      </footer>

      {/* Gallery Lightbox */}
      <AnimatePresence>
        {selectedGalleryItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-bg/95 backdrop-blur-xl p-4 lg:p-10"
            onClick={() => setSelectedGalleryItem(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="technical-panel w-full max-w-6xl max-h-full overflow-hidden flex flex-col lg:flex-row bg-brand-elevated shadow-2xl border-brand-accent/30"
              onClick={e => e.stopPropagation()}
            >
              {/* Image Section */}
              <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px]">
                <img 
                  src={selectedGalleryItem.imageUrl} 
                  alt={selectedGalleryItem.symbol}
                  className="max-w-full max-h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                <button 
                  className="absolute top-4 right-4 p-2 bg-brand-bg/50 hover:bg-brand-danger rounded-full text-white transition-colors z-10"
                  onClick={() => setSelectedGalleryItem(null)}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Info Section */}
              <div className="w-full lg:w-80 p-6 flex flex-col gap-6 bg-brand-elevated border-l border-brand-border h-full overflow-y-auto custom-scrollbar">
                <header className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-brand-accent">{selectedGalleryItem.symbol}</h2>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      selectedGalleryItem.side === 'Long' ? 'text-brand-success bg-brand-success/10' : 'text-brand-danger bg-brand-danger/10'
                    }`}>
                      {selectedGalleryItem.side}
                    </span>
                  </div>
                  <p className="text-[10px] text-brand-text-dim uppercase font-bold tracking-widest">{selectedGalleryItem.date}</p>
                </header>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 p-3 bg-brand-bg/50 rounded border border-brand-border/50">
                    <span className="text-[9px] uppercase font-bold text-brand-text-dim">Entry</span>
                    <span className="text-sm font-mono text-brand-text-bright">{selectedGalleryItem.levels.entry || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col gap-1 p-3 bg-brand-bg/50 rounded border border-brand-border/50">
                    <span className="text-[9px] uppercase font-bold text-brand-text-dim">Take Profit</span>
                    <span className="text-sm font-mono text-brand-success">{selectedGalleryItem.levels.takeProfit || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col gap-1 p-3 bg-brand-bg/50 rounded border border-brand-border/50">
                    <span className="text-[9px] uppercase font-bold text-brand-text-dim">Stop Loss</span>
                    <span className="text-sm font-mono text-brand-danger">{selectedGalleryItem.levels.stopLoss || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col gap-1 p-3 bg-brand-bg/50 rounded border border-brand-border/50">
                    <span className="text-[9px] uppercase font-bold text-brand-text-dim">Status</span>
                    <span className={`text-sm font-bold ${selectedGalleryItem.status === 'Win' ? 'text-brand-success' : 'text-brand-danger'}`}>
                      {selectedGalleryItem.status}
                    </span>
                  </div>
                </div>

                {selectedGalleryItem.fiboTarget && (
                  <div className="flex flex-col gap-2 p-3 bg-brand-accent/5 rounded border border-brand-accent/20">
                    <span className="text-[9px] uppercase font-bold text-brand-accent">Fibonacci Expansion</span>
                    <span className="text-xs font-mono text-brand-text-bright leading-relaxed whitespace-pre-wrap">{selectedGalleryItem.fiboTarget}</span>
                  </div>
                )}

                <div className="mt-auto pt-6 border-t border-brand-border">
                  <button 
                    onClick={() => setSelectedGalleryItem(null)}
                    className="w-full py-3 bg-brand-bg border border-brand-border text-brand-text-dim hover:text-brand-text-bright text-[10px] font-bold uppercase tracking-widest rounded transition-all"
                  >
                    Close Review
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

