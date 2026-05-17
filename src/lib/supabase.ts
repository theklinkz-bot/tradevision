import { createClient, User } from '@supabase/supabase-js';
import { AnalysisHistoryItem, Strategy } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project-url');

if (!isSupabaseConfigured) {
  console.warn('Supabase configuration is missing or using placeholders. Database features will be disabled until configured in AI Studio Secrets Panel.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

export async function saveTradeToSupabase(data: AnalysisHistoryItem, userId?: string, mode: 'live' | 'backtest' = 'live') {
  if (!isSupabaseConfigured) {
    console.warn('Attempted to save trade but Supabase is not configured.');
    return;
  }
  const { error } = await supabase
    .from('trades')
    .insert([{
      user_id: userId,
      symbol: data.symbol,
      side: data.side,
      entry_price: data.levels.entry,
      stop_loss: data.levels.stopLoss,
      take_profit: data.levels.takeProfit,
      fibo_target: data.fiboTarget,
      image_url: data.imageUrl,
      trade_status: data.status,
      timestamp: data.date || data.timestamp,
      confidence: data.confidence,
      trading_mode: mode,
      trade_notes: data.notes,
      strategy_id: data.strategyId,
      strategy_name: data.strategyName,
      created_at: new Date().toISOString()
    }]);

  if (error) {
    console.error('Supabase save error:', error);
    const message = error.message?.toLowerCase().includes('fetch') 
      ? 'Network error: Could not connect to the database.' 
      : `Database error: ${error.message || 'Unknown save failure'}`;
    throw new Error(message);
  }
}

export async function fetchTradesFromSupabase(userId?: string, mode?: 'live' | 'backtest'): Promise<AnalysisHistoryItem[]> {
  if (!isSupabaseConfigured) {
    console.warn('Attempted to fetch trades but Supabase is not configured.');
    return [];
  }
  let query = supabase
    .from('trades')
    .select(`
      id, 
      user_id, 
      symbol, 
      side, 
      entry_price, 
      stop_loss, 
      take_profit, 
      fibo_target, 
      image_url, 
      trade_status, 
      timestamp, 
      confidence, 
      trading_mode, 
      trade_notes, 
      strategy_id,
      strategy_name,
      created_at,
      strategies (
        id,
        name,
        color
      )
    `);
    
  if (userId) {
    query = query.eq('user_id', userId);
  }

  if (mode) {
    query = query.eq('trading_mode', mode);
  }

  let { data, error }: { data: any, error: any } = await query
    .order('created_at', { ascending: false });

  // FALLBACK: If the join fails (likely due to missing foreign key relationship/schema cache), 
  // try fetching without the strategies join
  if (error && (error.message.includes('relationship') || error.message.includes('strategies') || error.message.includes('schema cache'))) {
    console.warn('Supabase join failed, attempting fallback fetch...', error.message);
    let fallbackQuery = supabase
      .from('trades')
      .select(`
        id, symbol, side, entry_price, stop_loss, take_profit, fibo_target, 
        image_url, trade_status, timestamp, confidence, trading_mode, 
        trade_notes, strategy_id, strategy_name, created_at
      `);
      
    if (userId) fallbackQuery = fallbackQuery.eq('user_id', userId);
    if (mode) fallbackQuery = fallbackQuery.eq('trading_mode', mode);
    
    const fallbackResult = await fallbackQuery.order('created_at', { ascending: false });
    data = fallbackResult.data;
    error = fallbackResult.error;
  }

  if (error) {
    console.error('Supabase fetch error:', error);
    const message = error.message?.toLowerCase().includes('fetch') 
      ? 'Network error: Could not connect to the database.' 
      : `Database error: ${error.message || 'Unknown fetch failure'}`;
    throw new Error(message);
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    symbol: row.symbol,
    side: row.side,
    levels: {
      entry: row.entry_price,
      stopLoss: row.stop_loss,
      takeProfit: row.take_profit
    },
    fiboTarget: row.fibo_target,
    imageUrl: row.image_url,
    status: row.trade_status,
    timestamp: row.timestamp,
    confidence: row.confidence || 1,
    date: row.timestamp || new Date(row.created_at).toLocaleString(),
    tradingMode: row.trading_mode,
    notes: row.trade_notes,
    strategyId: row.strategy_id,
    strategyName: (Array.isArray(row.strategies) ? row.strategies[0]?.name : row.strategies?.name) || row.strategy_name,
    strategyColor: Array.isArray(row.strategies) ? row.strategies[0]?.color : row.strategies?.color
  }));
}

export async function updateTradeInSupabase(id: string, data: Partial<AnalysisHistoryItem>) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase
    .from('trades')
    .update({
      symbol: data.symbol,
      side: data.side,
      entry_price: data.levels?.entry,
      stop_loss: data.levels?.stopLoss,
      take_profit: data.levels?.takeProfit,
      fibo_target: data.fiboTarget,
      trade_status: data.status,
      timestamp: data.date || data.timestamp,
      trade_notes: data.notes,
      strategy_id: data.strategyId ?? null,
      strategy_name: data.strategyName ?? null
    })
    .eq('id', id);

  if (error) {
    console.error('Supabase update error:', error);
    const message = error.message?.toLowerCase().includes('fetch') 
      ? 'Network error: Could not connect to the database.' 
      : `Database error: ${error.message || 'Unknown update failure'}`;
    throw new Error(message);
  }
}

export async function submitFeedbackToSupabase(data: {
  userId?: string;
  category: string;
  subject: string;
  message: string;
  systemInfo: any;
}) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase
    .from('system_feedback')
    .insert([
      {
        user_id: data.userId,
        category: data.category,
        subject: data.subject,
        message: data.message,
        system_info: data.systemInfo,
        created_at: new Date().toISOString()
      }
    ]);

  if (error) {
    console.error('Supabase feedback error:', error);
    throw new Error(`Database error: ${error.message || 'Feedback submission failed'}`);
  }
}

export async function fetchFeedbackFromSupabase(userId?: string) {
  if (!isSupabaseConfigured) return [];
  let query = supabase
    .from('system_feedback')
    .select('*');
    
  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase fetch feedback error:', error);
    throw new Error(`Database error: ${error.message}`);
  }

  return data || [];
}

export async function updateFeedbackStatus(id: string, status: string) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase
    .from('system_feedback')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Supabase feedback update error:', error);
    throw new Error(`Database error: ${error.message}`);
  }
}

export async function syncProfile(user: User) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email,
      last_sign_in_at: user.last_sign_in_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

  if (error) {
    console.error('Error syncing profile:', error);
  }
}

export async function fetchProfiles() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('last_sign_in_at', { ascending: false });

  if (error) {
    console.warn('Error fetching profiles:', error.message);
    // Return empty array instead of throwing to prevent crashing the UI if table doesn't exist
    const isMissingTable = 
      error.code === 'PGRST116' || 
      error.message.includes('not found') || 
      error.message.includes('relation "profiles" does not exist') ||
      error.message.includes('schema cache');
    
    if (isMissingTable) {
      return [];
    }
    throw new Error(`Database error: ${error.message}`);
  }

  return data || [];
}

export async function deleteTradeFromSupabase(id: string) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase
    .from('trades')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase delete error:', error);
    const message = error.message?.toLowerCase().includes('fetch') 
      ? 'Network error: Could not connect to the database.' 
      : `Database error: ${error.message || 'Unknown delete failure'}`;
    throw new Error(message);
  }
}

// Strategy Management Functions
export async function fetchStrategiesFromSupabase(userId?: string): Promise<Strategy[]> {
  if (!isSupabaseConfigured) return [];
  
  const { data, error } = await supabase
    .from('strategies')
    .select(`
      id,
      name,
      color,
      created_at,
      trades (count)
    `)
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) {
    // If table doesn't exist yet, return empty
    if (error.code === 'PGRST116' || error.message.includes('not found')) {
      return [];
    }
    console.error('Supabase fetch strategies error:', error);
    throw new Error(`Database error: ${error.message}`);
  }

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    color: row.color,
    createdAt: row.created_at,
    tradeCount: row.trades?.[0]?.count || 0
  }));
}

export async function saveStrategyToSupabase(name: string, color: string, userId: string): Promise<Strategy> {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured');
  
  const { data, error } = await supabase
    .from('strategies')
    .insert([{
      user_id: userId,
      name,
      color,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Supabase save strategy error:', error);
    throw new Error(`Database error: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    color: data.color,
    createdAt: data.created_at,
    tradeCount: 0
  };
}

export async function updateStrategyInSupabase(id: string, name: string, color: string) {
  if (!isSupabaseConfigured) return;
  
  const { error } = await supabase
    .from('strategies')
    .update({ name, color })
    .eq('id', id);

  if (error) {
    console.error('Supabase update strategy error:', error);
    throw new Error(`Database error: ${error.message}`);
  }
}

export async function deleteStrategyFromSupabase(id: string) {
  if (!isSupabaseConfigured) return;
  
  // RLS or a trigger should handle trade_id being set to null, 
  // but explicitly we do nothing to the trades table as requested.
  // The deletion of a strategy will cause foreign key issues if trades still reference it 
  // UNLESS the reference is set to ON DELETE SET NULL.
  // The user prompt says "Delete button (with confirm) — does NOT delete associated trades, just sets strategy_id = null"
  // So we should update trades first.
  
  await supabase
    .from('trades')
    .update({ strategy_id: null, strategy_name: null })
    .eq('strategy_id', id);

  const { error } = await supabase
    .from('strategies')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase delete strategy error:', error);
    throw new Error(`Database error: ${error.message}`);
  }
}
