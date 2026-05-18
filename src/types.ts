export type TradeStatus = "Win" | "Loss" | "BE" | "Pending";

export interface TradeLevels {
  entry: number | null;
  stopLoss: number | null;
  takeProfit: number | null;
}

export interface TradeAnalysis {
  symbol: string;
  side: "Long" | "Short" | "Neutral";
  levels: TradeLevels;
  timestamp: string;
  fiboTarget: string;
  confidence: number;
}

export interface Strategy {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  tradeCount?: number;
}

export interface AnalysisHistoryItem extends TradeAnalysis {
  id: string;
  imageUrl: string;
  date: string;
  exitDate?: string;
  status: TradeStatus;
  savedToDb?: boolean;
  tradingMode?: 'live' | 'backtest';
  notes?: string;
  strategyId?: string;
  strategyName?: string;
  strategyColor?: string;
}

export interface TradeStats {
  winRate: number;
  avgRR: number;
  expectancy: number;
  maxDrawdown: number;
  totalTrades: number;
  profitFactor: number;
  recoveryFactor: number;
  avgDuration: string;
  maxConsecutiveLosses: number;
  symbolEfficiency: { symbol: string; winRate: number; profit: number; count: number }[];
  biasAnalysis: {
    long: { winRate: number; count: number };
    short: { winRate: number; count: number };
  };
  equityCurve: { 
    trade: number; 
    equity: number; 
    drawdown: number;
    tradeId?: string;
    date?: string;
    symbol?: string;
    rMultiple?: number;
  }[];
  performanceByDay: { day: string; winRate: number; profit: number; count: number }[];
  performanceBySession: { session: string; winRate: number; profit: number; count: number }[];
  strategyAnalysis?: { 
    id?: string;
    name: string; 
    color?: string;
    count: number; 
    winRate: number; 
    avgR: number; 
    profit: number 
  }[];
}

export interface TranslationSchema {
  modes: {
    live: string;
    backtest: string;
  };
  status: {
    win: string;
    loss: string;
    be: string;
    pending: string;
  };
  ui: {
    dashboard: string;
    log: string;
    analytics: string;
    gallery: string;
    system: string;
    admin: string;
    save: string;
    delete: string;
    upload: string;
    confirm: string;
    cancel: string;
    performance_stats: string;
    no_trades: string;
    recent_extractions: string;
    no_signals: string;
    engine_processing: string;
    engine_online: string;
    theme: string;
    new_scan: string;
    system_status: string;
    environment_matrix: string;
    identity_management: string;
    active_pilot: string;
    unique_neural_id: string;
    deauthorize_session: string;
    trade_intelligence_log: string;
    export_csv: string;
    result: string;
    source_image: string;
    system_warnings: string;
    gemini_vision_guide: string;
    raw_output: string;
    back: string;
    save_success: string;
    capture_guide: string;
    examine_setup: string;
    live_mode: string;
    backtest_mode: string;
    visual_repository: string;
    insufficient_data: string;
    stats_engine_requirement: string;
    neural_visual_input: string;
    validate_levels_desc: string;
    signal_validation_protocol: string;
    manual_calibration: string;
    pair_ticker: string;
    bias_direction: string;
    strategy_mapping: string;
    new_strategy: string;
    no_strategies: string;
    execution_levels: string;
    entry_matrix: string;
    profit_goal: string;
    risk_threshold: string;
    signal_outcome: string;
    authorize_save: string;
    abort_interface: string;
    extraction_protocol_desc: string;
    purge_node: string;
    confirm_purge: string;
    edit_node: string;
    edit_protocol: string;
    slide_to_purge: string;
    neural_hub: string;
    navigation_matrix: string;
    show_insights: string;
    hide_insights: string;
    how_to_capture: string;
    offline_warning: string;
    byok_required: string;
    authorize_node: string;
    ingest_visual: string;
    drop_image: string;
    extraction_pipeline: string;
    visual_output: string;
    json_model: string;
    validated_persistence: string;
    syncing: string;
    committed: string;
    performance: string;
    privacy_policy_notice: string;
    close_guide: string;
    feedback_title: string;
    feedback_subtitle: string;
    feedback_label_category: string;
    feedback_label_subject: string;
    feedback_placeholder_subject: string;
    feedback_label_details: string;
    feedback_placeholder_details: string;
    feedback_success: string;
    feedback_button: string;
    ai_neural_insights: string;
    probability_spectrum: string;
    system_accuracy: string;
    profit_factor: string;
    eff_coeff: string;
    risk_reward: string;
    statistical_edge: string;
    yield_node: string;
    max_drawdown_label: string;
    risk_boundary: string;
    leading_symbols: string;
    directional_bias: string;
    day_profile: string;
    performance_architecture: string;
    resistance: string;
    trades_to_recover: string;
    strict_delta_excursion: string;
    peak_decay: string;
  };
  performance: {
    net_profit: string;
    expectancy: string;
    max_drawdown: string;
    win_rate: string;
    equity_curve: string;
    drawdown_chart: string;
    edge_analysis: string;
    setup_performance: string;
    session_performance: string;
    time_analysis: string;
    risk_behavior: string;
    discipline_rate: string;
    revenge_trading: string;
    overtrading_indicator: string;
    consecutive_losses: string;
    best_category: string;
    worst_category: string;
    high_risk: string;
    stable: string;
    needs_attention: string;
    net_profit_desc: string;
    expectancy_desc: string;
    max_dd_desc: string;
    win_rate_desc: string;
    drawdown_recovery: string;
    asia: string;
    london: string;
    new_york: string;
    ai_insights: string;
    best_setup_insight: string;
    best_session_insight: string;
    risk_warning_insight: string;
    high_drawdown_warning: string;
    low_discipline_warning: string;
    system_edge: string;
    trade_more: string;
    avoid: string;
    risk_low: string;
    risk_medium: string;
    risk_high: string;
    prop_firm_warning: string;
    suggested_action: string;
    lockdown_timer: string;
    lockdown_trigger: string;
    peak_equity: string;
    current_equity: string;
    initiate_lockdown: string;
  };
  guide: {
    title: string;
    step1_title: string;
    step1_sub: string;
    step2_title: string;
    step2_sub: string;
    step3_title: string;
    step3_sub: string;
    step4_title: string;
    step4_sub: string;
    privacy: string;
    close: string;
  };
  analytics: {
    winrate: string;
    pf: string;
    avgrr: string;
    expectancy: string;
    maxdd: string;
    recovery: string;
    consecutive_loss: string;
    total_trades: string;
  };
  system: {
    title: string;
    description: string;
    label: string;
    guide: string;
    verify: string;
    verified: string;
    neural_active: string;
    get_key: string;
    persistence_title: string;
    persistence_subtitle: string;
    persistence_protocol: string;
    persistence_item1: string;
    persistence_item2: string;
    persistence_item3: string;
    persistence_sync: string;
    persistence_encryption: string;
  };
  capture: {
    title: string;
    how: string;
    guide_btn: string;
    step1: string;
    step1_sub: string;
    step2: string;
    step2_sub: string;
    step3: string;
    step3_sub: string;
    trade_notes: string;
    notes_placeholder: string;
  };
}
