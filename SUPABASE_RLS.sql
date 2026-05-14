-- RUN THIS IN YOUR SUPABASE SQL EDITOR --

-- 1. Create the trades table with all columns
CREATE TABLE IF NOT EXISTS public.trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    symbol TEXT NOT NULL,
    side TEXT NOT NULL,
    entry_price NUMERIC,
    stop_loss NUMERIC,
    take_profit NUMERIC,
    fibo_target TEXT,
    image_url TEXT,
    trade_status TEXT,
    timestamp TEXT,
    confidence NUMERIC DEFAULT 1,
    trading_mode TEXT DEFAULT 'live',
    trade_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Grant access to roles for the Data API (Essential for new Supabase projects)
GRANT SELECT ON public.trades TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trades TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trades TO service_role;

-- 3. Enable Row Level Security
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Drop first if they exist for clean re-run)
DROP POLICY IF EXISTS "Users can view their own trades" ON public.trades;
CREATE POLICY "Users can view their own trades" ON public.trades
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own trades" ON public.trades;
CREATE POLICY "Users can insert their own trades" ON public.trades
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own trades" ON public.trades;
CREATE POLICY "Users can update their own trades" ON public.trades
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own trades" ON public.trades;
CREATE POLICY "Users can delete their own trades" ON public.trades
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 5. Add strategy columns (Migration)
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS strategy_name TEXT;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS strategy_id UUID;

-- 6. Create strategies table
CREATE TABLE IF NOT EXISTS public.strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6366f1',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Add foreign key if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_trades_strategy') THEN
        ALTER TABLE public.trades 
        ADD CONSTRAINT fk_trades_strategy 
        FOREIGN KEY (strategy_id) REFERENCES public.strategies(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- 8. Enable Row Level Security for strategies
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;

-- 9. Strategies Policies
DROP POLICY IF EXISTS "Users can manage their own strategies" ON public.strategies;
CREATE POLICY "Users can manage their own strategies" ON public.strategies
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 10. Grant access to strategies table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.strategies TO authenticated;
GRANT SELECT ON public.strategies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.strategies TO service_role;
