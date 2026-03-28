TRUNCATE TABLE public.user_checkins; 

-- 2. CREATE DYNAMIC FORUM TOPICS TABLE
CREATE TABLE public.support_group_topics (
  id text PRIMARY KEY,
  title_en text NOT NULL,
  title_ne text NOT NULL,
  icon text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. SECURE THE TABLE (Admin-Only Writes)
ALTER TABLE public.support_group_topics ENABLE ROW LEVEL SECURITY;

-- Anyone with the App can READ the topics
CREATE POLICY "Public can view support topics" 
  ON public.support_group_topics FOR SELECT USING (true);

-- NO insert/update/delete policy exists!
-- This means NO USER IN THE APP CAN CREATE A GROUP. 
-- Only YOU (the admin) can add groups directly from inside your Supabase interface.

-- 4. MIGRATE INITIAL TOPICS
-- Let's populate the 4 default topics so your App doesn't crash empty.
INSERT INTO public.support_group_topics (id, title_en, title_ne, icon) VALUES 
('anxiety', 'Anxiety Support', 'चिन्ता सहयोग', '🌊'),
('depression', 'Depression Support', 'डिप्रेसन सहयोग', '🌧️'),
('academics', 'Academic Stress', 'शैक्षिक तनाव', '📚'),
('relationships', 'Relationships', 'सम्बन्ध', '🤝')
ON CONFLICT (id) DO NOTHING;
