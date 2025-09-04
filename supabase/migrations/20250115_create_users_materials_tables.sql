/*
# Create Users and Materials Tables for Lumen Learning Hub
Creates the core database structure for user management and educational materials storage.

## Query Description:
This migration creates the fundamental database structure for the Lumen Learning Hub application. It establishes user accounts with role-based access and academic information for students, plus a materials system for teachers to share educational content. This is a foundational setup that enables user registration, authentication, and content management.

## Metadata:
- Schema-Category: "Structural" 
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Creates 'users' table with: id (UUID PK), name, email, password, role, student_id, major, academic_year, created_at, updated_at
- Creates 'materials' table with: id (UUID PK), teacher_id (FK to users), content, created_at, updated_at
- Adds foreign key constraint between materials.teacher_id and users.id
- Creates indexes for email (unique) and teacher_id for performance

## Security Implications:
- RLS Status: Enabled on both tables
- Policy Changes: Yes - creates policies for user access control
- Auth Requirements: Users can only access their own data, teachers can manage their materials

## Performance Impact:
- Indexes: Added unique index on users.email, index on materials.teacher_id
- Triggers: None
- Estimated Impact: Minimal - standard table creation with appropriate indexing
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');

-- Create users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    student_id VARCHAR(50),
    major VARCHAR(100),
    academic_year VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create materials table
CREATE TABLE materials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_materials_teacher_id ON materials(teacher_id);
CREATE INDEX idx_materials_created_at ON materials(created_at DESC);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Allow user registration" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete users" ON users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Create RLS policies for materials table
CREATE POLICY "Teachers can manage their own materials" ON materials
    FOR ALL USING (teacher_id::text = auth.uid()::text);

CREATE POLICY "Students can view all materials" ON materials
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('student', 'admin')
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
