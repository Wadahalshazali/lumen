import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DatabaseUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
  student_id?: string;
  major?: string;
  academic_year?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseMaterial {
  id: string;
  teacher_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}
