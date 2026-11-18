-- ==============================================================================
-- FITTING ROOM DATABASE SCHEMA & STORAGE POLICIES
-- ==============================================================================
-- Run this complete script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. PROFILES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',
    age INTEGER CHECK (age IS NULL OR (age >= 10 AND age <= 120)),
    height_cm NUMERIC CHECK (height_cm IS NULL OR (height_cm >= 50 AND height_cm <= 260)),
    weight_kg NUMERIC CHECK (weight_kg IS NULL OR (weight_kg >= 20 AND weight_kg <= 300)),
    body_type TEXT CHECK (body_type IN ('rectangle', 'pear', 'inverted_triangle', 'hourglass', 'round', 'athletic')),
    face_shape TEXT CHECK (face_shape IN ('oval', 'round', 'square', 'heart', 'oblong', 'diamond')),
    skin_tone TEXT,
    undertone TEXT CHECK (undertone IN ('warm', 'cool', 'neutral')),
    avatar_url TEXT,
    profile_completed BOOLEAN NOT NULL DEFAULT FALSE,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'unlimited')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure plan column exists if table was created previously
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'unlimited'));

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies: Users can only read and modify their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile"
    ON public.profiles FOR DELETE
    USING (auth.uid() = id);

-- ==============================================================================
-- 3. WARDROBE ITEMS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.wardrobe_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory')),
    subcategory TEXT,
    color TEXT NOT NULL,
    color_hex TEXT,
    occasion TEXT[] NOT NULL DEFAULT ARRAY['casual']::TEXT[],
    weather_suitability TEXT[] NOT NULL DEFAULT ARRAY['mild', 'warm']::TEXT[],
    image_url TEXT NOT NULL,
    storage_path TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for wardrobe_items
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;

-- Wardrobe Items RLS Policies: Strict user isolation
DROP POLICY IF EXISTS "Users can view own wardrobe items" ON public.wardrobe_items;
CREATE POLICY "Users can view own wardrobe items"
    ON public.wardrobe_items FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own wardrobe items" ON public.wardrobe_items;
CREATE POLICY "Users can insert own wardrobe items"
    ON public.wardrobe_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own wardrobe items" ON public.wardrobe_items;
CREATE POLICY "Users can update own wardrobe items"
    ON public.wardrobe_items FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own wardrobe items" ON public.wardrobe_items;
CREATE POLICY "Users can delete own wardrobe items"
    ON public.wardrobe_items FOR DELETE
    USING (auth.uid() = user_id);

-- Create index on user_id & category for fast lookups
CREATE INDEX IF NOT EXISTS idx_wardrobe_user_id ON public.wardrobe_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wardrobe_category ON public.wardrobe_items(category);

-- ==============================================================================
-- 4. SAVED OUTFITS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.saved_outfits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    occasion TEXT NOT NULL,
    weather TEXT NOT NULL,
    items JSONB NOT NULL,
    rationale TEXT NOT NULL,
    style_tips TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for saved_outfits
ALTER TABLE public.saved_outfits ENABLE ROW LEVEL SECURITY;

-- Saved Outfits RLS Policies
DROP POLICY IF EXISTS "Users can view own saved outfits" ON public.saved_outfits;
CREATE POLICY "Users can view own saved outfits"
    ON public.saved_outfits FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved outfits" ON public.saved_outfits;
CREATE POLICY "Users can insert own saved outfits"
    ON public.saved_outfits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved outfits" ON public.saved_outfits;
CREATE POLICY "Users can delete own saved outfits"
    ON public.saved_outfits FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_outfits_user ON public.saved_outfits(user_id);

-- ==============================================================================
-- 5. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, profile_completed)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        FALSE
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 6. STORAGE BUCKETS SETUP
-- ==============================================================================
-- Insert buckets if they don't already exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('wardrobe-images', 'wardrobe-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS: Users can only upload and manage files inside their own user folder: {user_id}/*
DROP POLICY IF EXISTS "User wardrobe images insert" ON storage.objects;
CREATE POLICY "User wardrobe images insert"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'wardrobe-images' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "User wardrobe images select" ON storage.objects;
CREATE POLICY "User wardrobe images select"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'wardrobe-images');

DROP POLICY IF EXISTS "User wardrobe images delete" ON storage.objects;
CREATE POLICY "User wardrobe images delete"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'wardrobe-images' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "User avatars insert" ON storage.objects;
CREATE POLICY "User avatars insert"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "User avatars select" ON storage.objects;
CREATE POLICY "User avatars select"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "User avatars delete" ON storage.objects;
CREATE POLICY "User avatars delete"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- ==============================================================================
-- 7. CASCADE DELETE ACCOUNT FUNCTION (PRIVACY / GDPR COMPLIANCE)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void AS $$
DECLARE
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Delete user files from storage
    DELETE FROM storage.objects WHERE bucket_id IN ('wardrobe-images', 'avatars') AND (storage.foldername(name))[1] = current_user_id::text;

    -- Delete profile, wardrobe items, saved outfits will automatically cascade from auth.users
    DELETE FROM auth.users WHERE id = current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

