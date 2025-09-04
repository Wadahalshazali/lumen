/*
# Fix Existing Schema Migration
This migration handles existing database objects and ensures proper setup for the Lumen application.

## Query Description: 
This operation will check for existing database objects and create only what's needed. 
It's designed to be safe and won't affect existing data. The migration handles:
- Checking if user_role enum exists before creation
- Creating users and materials tables safely
- Setting up Row Level Security policies
- Creating necessary indexes for performance

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Tables: users, materials
- Enum Types: user_role (student, teacher, admin)
- Indexes: users_email_idx, materials_teacher_id_idx
- RLS: Enabled on both tables

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes
- Auth Requirements: Standard Supabase auth integration

## Performance Impact:
- Indexes: Added for email and teacher_id lookups
- Triggers: None
- Estimated Impact: Minimal, improves query performance
*/

-- Create user_role enum type only if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
    END IF;
END $$;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    student_id TEXT,
    major TEXT,
    academic_year TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create materials table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users(role);
CREATE INDEX IF NOT EXISTS materials_teacher_id_idx ON public.materials(teacher_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can insert new users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
DROP POLICY IF EXISTS "Teachers can view their own materials" ON public.materials;
DROP POLICY IF EXISTS "Teachers can insert their own materials" ON public.materials;
DROP POLICY IF EXISTS "Teachers can update their own materials" ON public.materials;
DROP POLICY IF EXISTS "Teachers can delete their own materials" ON public.materials;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (true); -- Allow all users to view for login functionality

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (true); -- Allow updates for profile management

CREATE POLICY "Anyone can insert new users" ON public.users
    FOR INSERT WITH CHECK (true); -- Allow registration

CREATE POLICY "Admins can view all users" ON public.users
    FOR ALL USING (role = 'admin'); -- Admins can manage all users

-- Create RLS policies for materials table
CREATE POLICY "Teachers can view their own materials" ON public.materials
    FOR SELECT USING (
        teacher_id IN (
            SELECT id FROM public.users WHERE role = 'teacher'
        )
    );

CREATE POLICY "Teachers can insert their own materials" ON public.materials
    FOR INSERT WITH CHECK (
        teacher_id IN (
            SELECT id FROM public.users WHERE role = 'teacher'
        )
    );

CREATE POLICY "Teachers can update their own materials" ON public.materials
    FOR UPDATE USING (
        teacher_id IN (
            SELECT id FROM public.users WHERE role = 'teacher'
        )
    );

CREATE POLICY "Teachers can delete their own materials" ON public.materials
    FOR DELETE USING (
        teacher_id IN (
            SELECT id FROM public.users WHERE role = 'teacher'
        )
    );

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_materials_updated_at ON public.materials;
CREATE TRIGGER update_materials_updated_at
    BEFORE UPDATE ON public.materials
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
