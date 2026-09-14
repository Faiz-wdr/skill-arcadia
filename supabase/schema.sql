-- ==============================================================================
-- Supabase Schema: Webinar Landing Page (Phase 2)
-- Tables: webinars, registrations
-- Security: Row Level Security (RLS) with restricted public access
-- ==============================================================================

-- 1. Create Webinars Table
CREATE TABLE IF NOT EXISTS public.webinars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  date TEXT,
  time TEXT,
  speaker_name TEXT,
  speaker_designation TEXT,
  speaker_image TEXT,
  logo TEXT,
  registration_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by slug
CREATE INDEX IF NOT EXISTS webinars_slug_idx ON public.webinars (slug);

-- 2. Create Registrations Table
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id UUID NOT NULL REFERENCES public.webinars(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  course TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for webinar registration lookups
CREATE INDEX IF NOT EXISTS registrations_webinar_id_idx ON public.registrations (webinar_id);

-- 3. Duplicate Registration Protection (Case-insensitive unique email per webinar)
CREATE UNIQUE INDEX IF NOT EXISTS registrations_webinar_email_idx 
ON public.registrations (webinar_id, lower(trim(email)));

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Webinars
-- Public users can view active webinars
DROP POLICY IF EXISTS "Public can view active webinars" ON public.webinars;
CREATE POLICY "Public can view active webinars" 
ON public.webinars 
FOR SELECT 
TO anon, authenticated 
USING (registration_enabled = true);

-- Authenticated admins can update webinars (e.g. changing webinar date)
DROP POLICY IF EXISTS "Authenticated admins can update webinars" ON public.webinars;
CREATE POLICY "Authenticated admins can update webinars" 
ON public.webinars 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 6. RLS Policies for Registrations
-- Public users can insert a new registration
DROP POLICY IF EXISTS "Public can insert registration" ON public.registrations;
CREATE POLICY "Public can insert registration" 
ON public.registrations 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Authenticated admins can view all registrations
DROP POLICY IF EXISTS "Authenticated admins can view registrations" ON public.registrations;
CREATE POLICY "Authenticated admins can view registrations" 
ON public.registrations 
FOR SELECT 
TO authenticated 
USING (true);

-- Authenticated admins can delete registrations
DROP POLICY IF EXISTS "Authenticated admins can delete registrations" ON public.registrations;
CREATE POLICY "Authenticated admins can delete registrations" 
ON public.registrations 
FOR DELETE 
TO authenticated 
USING (true);

-- IMPORTANT SECURITY NOTE:
-- There is deliberately NO public SELECT, UPDATE, or DELETE policy on registrations.
-- This strictly protects attendee personal data from public exposure.

-- 7. Initial Seed Data (Current Webinar)
INSERT INTO public.webinars (
  id,
  title,
  slug,
  description,
  date,
  time,
  speaker_name,
  speaker_designation,
  speaker_image,
  logo,
  registration_enabled
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'GROW THROUGH INDUSTRY',
  'grow-through-industry-2026',
  'Where commerce education meets global industry expertise — building practical skills, industry exposure, and future-ready finance professionals.',
  'September 23, 2026',
  '7:30 PM IST',
  'Skill Arcadia × Grant Thornton',
  'Executive Certificate in AI Finance Modeling & Forensic Accounting',
  'assets/img/grant-thornton-logo.png',
  'assets/img/skill-arcadia-logo.png',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  date = EXCLUDED.date,
  time = EXCLUDED.time,
  speaker_name = EXCLUDED.speaker_name,
  speaker_designation = EXCLUDED.speaker_designation,
  registration_enabled = EXCLUDED.registration_enabled;
