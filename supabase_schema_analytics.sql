-- 1. Create the User Check-in Logging Table
CREATE TABLE public.user_checkins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  stress_score integer NOT NULL, -- Aggregated score from Questionnaire.js (0-20+)
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and allow public insert and read
ALTER TABLE public.user_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to checkins" 
  ON public.user_checkins FOR SELECT USING (true);

CREATE POLICY "Allow public inserts to checkins" 
  ON public.user_checkins FOR INSERT WITH CHECK (true);

-- Insert dummy historical data so the Home chart looks good immediately
INSERT INTO public.user_checkins (stress_score, created_at) VALUES 
(8, now() - interval '6 days'),
(12, now() - interval '5 days'),
(15, now() - interval '4 days'),
(11, now() - interval '3 days'),
(9, now() - interval '2 days'),
(6, now() - interval '1 days');
