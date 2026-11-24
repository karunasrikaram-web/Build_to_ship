-- ==============================================================================
-- CampusConnect - Database Schema & Row Level Security (RLS) Setup
-- ==============================================================================
-- Run this entire script in your Supabase SQL Editor.

-- 1. Create profiles table linked to Supabase auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin')) DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create complaints table
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Hostel', 'Infrastructure', 'Transport', 'Canteen', 'Academics', 'Other')),
  location TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'In Progress', 'Resolved')) DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS) on both tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- 4. Helper function to check if the current user is an administrator
-- SECURITY DEFINER ensures this function runs with elevated privileges to check role securely
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Profiles RLS Policies
-- Allow users to view their own profile or allow admins to view all profiles
DROP POLICY IF EXISTS "Users can read own profile or admins can read all" ON public.profiles;
CREATE POLICY "Users can read own profile or admins can read all"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id OR public.is_admin()
);

-- Allow authenticated users to insert their own profile on registration
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (
  auth.uid() = id
);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- 6. Complaints RLS Policies
-- Students can only view their own complaints; Admins can view all complaints
DROP POLICY IF EXISTS "Students see own complaints, admins see all" ON public.complaints;
CREATE POLICY "Students see own complaints, admins see all"
ON public.complaints FOR SELECT
USING (
  auth.uid() = student_id OR public.is_admin()
);

-- Students can insert complaints for themselves
DROP POLICY IF EXISTS "Students can insert complaints" ON public.complaints;
CREATE POLICY "Students can insert complaints"
ON public.complaints FOR INSERT
WITH CHECK (
  auth.uid() = student_id
);

-- Admins can update complaint status (and any complaint fields)
DROP POLICY IF EXISTS "Admins can update complaints" ON public.complaints;
CREATE POLICY "Admins can update complaints"
ON public.complaints FOR UPDATE
USING (
  public.is_admin()
);

-- 7. Trigger to automatically create a profile row when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    name = EXCLUDED.name,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Trigger to automatically update updated_at timestamp on complaint modification
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_complaint_updated ON public.complaints;
CREATE TRIGGER on_complaint_updated
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Note on Creating Admin User:
-- You can sign up normally with an admin email, then run:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@college.edu';

