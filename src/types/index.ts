export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  // Student-specific fields
  studentId?: string;
  major?: string;
  academicYear?: string;
}

export interface Material {
  id: string;
  teacher_id: string;
  content: string;
  created_at: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  role: UserRole;
}
