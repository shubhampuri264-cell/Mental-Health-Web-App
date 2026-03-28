-- 1. SECURE LIBRARY CONTENT (Read-Only)
ALTER TABLE public.library_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "library_public_read" ON public.library_content;

CREATE POLICY "Anyone can read library content" 
  ON public.library_content FOR SELECT USING (true);
-- (Because no INSERT/UPDATE/DELETE policies exist, nobody but you using the dashboard can edit it)

-- 2. SECURE USER CHECKINS (Absolute Privacy)
ALTER TABLE public.user_checkins ENABLE ROW LEVEL SECURITY;

-- If you ran the last script, drop those policies to upgrade them to strictly 'authenticated' role
DROP POLICY IF EXISTS "Users can only read their own checkins" ON public.user_checkins;
DROP POLICY IF EXISTS "Users can only insert their own checkins" ON public.user_checkins;

CREATE POLICY "Checkins are strictly private for reading" 
  ON public.user_checkins FOR SELECT TO authenticated USING (auth.uid() = user_id);
  
CREATE POLICY "Checkins are strictly private for inserting" 
  ON public.user_checkins FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 3. SECURE SUPPORT GROUP MESSAGES (Block Unauthenticated Trolls & Bots)
ALTER TABLE public.support_group_messages ENABLE ROW LEVEL SECURITY;

-- Assuming from Phase 1, you might have wide open policies. Let's drop them.
DROP POLICY IF EXISTS "Allow public read access" ON public.support_group_messages;
DROP POLICY IF EXISTS "Allow public insert access" ON public.support_group_messages;

-- Everyone with a valid session (Anonymous OR Signed In) can read community messages
CREATE POLICY "Valid sessions can read group messages" 
  ON public.support_group_messages FOR SELECT TO authenticated USING (true);

-- Everyone with a valid session can insert messages
CREATE POLICY "Valid sessions can send group messages" 
  ON public.support_group_messages FOR INSERT TO authenticated WITH CHECK (true);
