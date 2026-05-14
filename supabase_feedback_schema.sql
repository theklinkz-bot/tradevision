-- RUN THIS IN YOUR SUPABASE SQL EDITOR --

-- 1. Grant access to public roles for the Data API
GRANT SELECT ON public.system_feedback TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_feedback TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_feedback TO service_role;

-- 2. Create the system_feedback table
CREATE TABLE IF NOT EXISTS public.system_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('Bug', 'Feature', 'General', 'Question')),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'fixed', 'closed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    system_info JSONB
);

-- 2. Enable Row Level Security
ALTER TABLE public.system_feedback ENABLE ROW LEVEL SECURITY;

-- 3. Create Policy: Users can view their own feedback
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.system_feedback;
CREATE POLICY "Users can view their own feedback" ON public.system_feedback
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 4. Create Policy: Users can insert their own feedback
DROP POLICY IF EXISTS "Users can insert their own feedback" ON public.system_feedback;
CREATE POLICY "Users can insert their own feedback" ON public.system_feedback
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 5. Create Policy: Admins can view and update all feedback
-- Note: This assumes you have a way to identify admins, 
-- or you can use a simple check for a specific email or role if configured.
-- For now, we'll keep it simple. If you have an 'admins' table or similar, 
-- you can join it here.

-- Example for a simple admin role (if you add a role column to your profiles)
-- CREATE POLICY "Admins can view all feedback" ON public.system_feedback
-- FOR ALL TO authenticated
-- USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
