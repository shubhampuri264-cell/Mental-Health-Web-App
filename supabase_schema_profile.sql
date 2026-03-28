-- 1. Alter the existing user_checkins table to bind heavily to the Auth System
ALTER TABLE public.user_checkins 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();

-- 2. Drop the old wide-open public policies from Phase 2
DROP POLICY IF EXISTS "Allow public read access to checkins" ON public.user_checkins;
DROP POLICY IF EXISTS "Allow public inserts to checkins" ON public.user_checkins;

-- 3. Instate ultra-secure RLS (Row Level Security) 
--    This ensures that when MoodChart.js queries the data, it ONLY gets 
--    the data for the specific Anonymous or Logged In User, preventing data leaks.
CREATE POLICY "Users can only read their own checkins" 
  ON public.user_checkins FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own checkins" 
  ON public.user_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
