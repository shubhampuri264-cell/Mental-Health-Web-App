

-- 1. Create the Library Content Table
CREATE TABLE public.library_content (
  id text PRIMARY KEY,
  category text NOT NULL, -- 'exercise', 'journal', 'learn'
  title_ne text NOT NULL,
  title_en text NOT NULL,
  desc_ne text,
  desc_en text,
  icon text,
  interactive boolean DEFAULT false,
  content jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security (RLS) but allow public read access for now
ALTER TABLE public.library_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to library content" 
  ON public.library_content FOR SELECT 
  USING (true);

-- 2. Create Support Group Messages Table (For Realtime feature)
CREATE TABLE public.support_group_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id text NOT NULL, -- matches the chat rooms (e.g., 'stress', 'family')
  text_ne text NOT NULL,
  text_en text,
  sender_avatar text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and allow public insert and read (Anonymous support groups)
ALTER TABLE public.support_group_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to messages" 
  ON public.support_group_messages FOR SELECT USING (true);
CREATE POLICY "Allow public inserts to messages" 
  ON public.support_group_messages FOR INSERT WITH CHECK (true);

-- Enable Supabase Realtime for the messages table!
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.support_group_messages;
COMMIT;


-- ==========================================
-- SEED DATA (Populating with our existing content)
-- ==========================================
INSERT INTO public.library_content (id, category, title_ne, title_en, desc_ne, desc_en, icon, interactive, content) VALUES
('breathing', 'exercise', 'श्वासप्रश्वास अभ्यास', 'Breathing Exercise', '५ मिनेटको श्वासप्रश्वास अभ्यासले तनाव कम गर्छ।', 'A 5-minute breathing practice to reduce stress.', '🌬', true, '{}'::jsonb),
('grounding', 'exercise', '५-४-३-२-१ ग्राउन्डिङ', '5-4-3-2-1 Grounding', 'चिन्ता कम गर्न इन्द्रिय अभ्यास।', 'Sensory exercise to reduce anxiety.', '🖐', false, '{
  "stepsNe": ["५ कुरा हेर्नुहोस् — तपाईंको वरिपरि ५ कुरा नाम दिनुहोस्", "४ कुरा छुनुहोस् — ४ फरक texture महसुस गर्नुहोस्", "३ कुरा सुन्नुहोस् — ३ आवाज पहिचान गर्नुहोस्", "२ कुरा सुँघ्नुहोस् — २ गन्ध फेला पार्नुहोस्", "१ कुरा चाख्नुहोस् — १ स्वाद महसुस गर्नुहोस्"],
  "stepsEn": ["See 5 things — name 5 things around you", "Touch 4 things — feel 4 different textures", "Hear 3 things — identify 3 sounds", "Smell 2 things — find 2 scents", "Taste 1 thing — notice 1 taste"]
}'::jsonb),
('journal', 'journal', 'जर्नलिङ प्रम्प्ट', 'Journaling Prompts', 'आफ्नो मन खोल्न लेख्नुहोस्।', 'Write to open your mind.', '📝', false, '{
  "promptsNe": ["आज मलाई कस्तो लाग्यो?", "मलाई खुसी बनाउने एउटा कुरा के हो?", "मैले आज आफ्नो लागि के गरें?", "मैले कसैलाई धन्यवाद भन्न चाहन्छु किनभने...", "मलाई चिन्ता लाग्ने कुरा के हो? म के गर्न सक्छु?", "अर्को हप्ता म एउटा कुरा गर्न चाहन्छु:"],
  "promptsEn": ["How did I feel today?", "One thing that makes me happy?", "What did I do for myself today?", "I want to thank someone because...", "What worries me? What can I do about it?", "One thing I want to do next week:"]
}'::jsonb),
('feelings', 'learn', 'भावनाहरू बुझ्ने', 'Understanding Feelings', 'भावनाहरू अस्थायी हुन्छन्।', 'Feelings are temporary.', '💭', false, '{
  "sectionsNe": [
    {"title": "भावना के हो?", "body": "भावना तपाईंको शरीर र मनले दिने सन्देश हो।"},
    {"title": "भावना अस्थायी हुन्छ", "body": "कुनै पनि भावना सधैंको लागि रहँदैन।"}
  ],
  "sectionsEn": [
    {"title": "What are feelings?", "body": "Feelings are messages from your body and mind."},
    {"title": "Feelings are temporary", "body": "No feeling lasts forever."}
  ]
}'::jsonb),
('sleep', 'learn', 'राम्रो निद्राको लागि', 'Better Sleep Tips', 'निद्रा सुधार्ने व्यावहारिक सुझावहरू।', 'Practical tips to improve your sleep.', '🌙', false, '{
  "tipsNe": ["सुत्नु अघि १ घण्टा फोन नहेर्नुहोस्", "हरेक दिन एउटै समयमा सुत्नुहोस् र उठ्नुहोस्", "सुत्नु अघि गहिरो सास लिने अभ्यास गर्नुहोस्"],
  "tipsEn": ["Don''t look at your phone 1 hour before bed", "Sleep and wake at the same time every day", "Practice deep breathing before sleeping"]
}'::jsonb);
