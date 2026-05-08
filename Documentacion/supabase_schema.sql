-- SQL Script for Supabase Setup

-- 1. Create Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('reclutador', 'candidato')),
    avatar_seed VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Recruiters table
CREATE TABLE IF NOT EXISTS public.recruiters (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name VARCHAR(150),
    company_name VARCHAR(150),
    position VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Candidates table
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    skills TEXT[],
    experience_years INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Policies for Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies for Recruiters
DROP POLICY IF EXISTS "Recruiters can view their own data" ON public.recruiters;
CREATE POLICY "Recruiters can view their own data" ON public.recruiters
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Recruiters can update their own data" ON public.recruiters;
CREATE POLICY "Recruiters can update their own data" ON public.recruiters
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Recruiters can insert their own data" ON public.recruiters;
CREATE POLICY "Recruiters can insert their own data" ON public.recruiters
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies for Candidates
DROP POLICY IF EXISTS "Candidates can view their own data" ON public.candidates;
CREATE POLICY "Candidates can view their own data" ON public.candidates
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Candidates can update their own data" ON public.candidates;
CREATE POLICY "Candidates can update their own data" ON public.candidates
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Candidates can insert their own data" ON public.candidates;
CREATE POLICY "Candidates can insert their own data" ON public.candidates
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to handle new user signup automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into profiles correctly extracting role from metadata
  INSERT INTO public.profiles (id, email, role, avatar_seed)
  VALUES (
    new.id, 
    new.email, 
    (new.raw_user_meta_data->>'role')::varchar,
    new.id::text -- Default seed is the user id
  );

  -- Insert into specific tables based on role
  IF (new.raw_user_meta_data->>'role' = 'reclutador') THEN
    INSERT INTO public.recruiters (id, full_name, company_name)
    VALUES (
      new.id, 
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'company_name'
    );
  ELSIF (new.raw_user_meta_data->>'role' = 'candidato') THEN
    INSERT INTO public.candidates (id, full_name)
    VALUES (
      new.id, 
      new.raw_user_meta_data->>'full_name'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
