import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';
import { Session } from '@supabase/supabase-js';

// The new User type combines Auth user and Profile data
export interface User {
  id: string; // from auth.users
  email?: string; // from auth.users
  name: string; // from profiles
  role: UserRole; // from profiles
  studentId?: string; // from profiles
  major?: string; // from profiles
  academicYear?: string; // from profiles
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole, studentData?: {studentId: string, major: string, academicYear: string}) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        // If user is logged in, fetch their profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          setUser(null);
        } else if (profile) {
          const fullUser: User = {
            id: session.user.id,
            email: session.user.email,
            name: profile.name,
            role: profile.role,
            studentId: profile.student_id,
            major: profile.major,
            academicYear: profile.academic_year,
          };
          setUser(fullUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Initial session check
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (name: string, email: string, password: string, role: UserRole, studentData?: {studentId: string, major: string, academicYear: string}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          name,
          role,
          ...(role === 'student' && studentData ? {
            student_id: studentData.studentId,
            major: studentData.major,
            academic_year: studentData.academicYear
          } : {})
        }
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error('Registration failed: No user returned');
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    session,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
