import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { UserPlus, Mail, Lock, User, FileText, Hash, GraduationCap, Calendar, CheckCircle } from 'lucide-react';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  
  // Student-specific fields
  const [studentId, setStudentId] = useState('');
  const [major, setMajor] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { register, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match / كلمات المرور غير متطابقة');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters / كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (role === 'student') {
      if (!studentId.trim() || !major.trim() || !academicYear.trim()) {
        setError('All student fields are required / جميع حقول الطالب مطلوبة');
        return;
      }
    }

    try {
      const studentData = role === 'student' ? { studentId, major, academicYear } : undefined;
      await register(name, email, password, role, studentData);
      setSuccessMessage('Registration successful! Please check your email to confirm your account. / تم التسجيل بنجاح! يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك.');
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again. / فشل في التسجيل. يرجى المحاولة مرة أخرى.');
    }
  };

  if (successMessage) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white border-2 border-black rounded-lg p-8 shadow-lg">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-black mb-4">Check Your Email / تحقق من بريدك الإلكتروني</h2>
            <p className="text-lg text-gray-700">{successMessage}</p>
            <Link 
              to="/"
              className="mt-8 inline-block bg-blue-600 text-white text-lg font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Login / العودة لتسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-blue-600 mb-3">Lumen</h1>
          <p className="text-xl text-black font-medium">Smart Learning Hub</p>
          <div className="w-20 h-1 bg-blue-600 mx-auto mt-4"></div>
        </div>
        
        <div className="bg-white border-2 border-black rounded-lg p-8 shadow-lg">
          <div className="flex items-center justify-center mb-6">
            <UserPlus className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold text-black">Register / إنشاء حساب</h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Type, Name, Email... */}
            {/* ... (rest of the form is identical to the previous version, no changes needed here) ... */}
             <div>
              <label htmlFor="role" className="block text-lg font-semibold text-black mb-2">
                Account Type / نوع الحساب
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full pl-12 pr-4 py-3 text-lg border-2 border-black rounded-lg focus:outline-none focus:border-blue-600 transition-colors appearance-none bg-white"
                >
                  <option value="student">Student / طالب</option>
                  <option value="teacher">Teacher / معلم</option>
                  <option value="admin">Admin / مدير</option>
                </select>
              </div>
            </div>

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-lg font-semibold text-black mb-2">
                Full Name / الاسم الكامل
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 text-lg border-2 border-black rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
                  placeholder="Enter your full name / أدخل الاسم الكامل"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-lg font-semibold text-black mb-2">
                Email / البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 text-lg border-2 border-black rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
                  placeholder="Enter your email / أدخل البريد الإلكتروني"
                />
              </div>
            </div>

            {/* Student-Specific Fields */}
            {role === 'student' && (
              <>
                {/* Student ID */}
                <div>
                  <label htmlFor="studentId" className="block text-lg font-semibold text-black mb-2">
                    Student ID / الرقم الجامعي
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                    <input
                      type="text"
                      id="studentId"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      required={role === 'student'}
                      className="w-full pl-12 pr-4 py-3 text-lg border-2 border-black rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
                      placeholder="Enter student ID / أدخل الرقم الجامعي"
                    />
                  </div>
                </div>

                {/* Major */}
                <div>
                  <label htmlFor="major" className="block text-lg font-semibold text-black mb-2">
                    Major / التخصص
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                    <select
                      id="major"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      required={role === 'student'}
                      className="w-full pl-12 pr-4 py-3 text-lg border-2 border-black rounded-lg focus:outline-none focus:border-blue-600 transition-colors appearance-none bg-white"
                    >
                      <option value="">Select Major / اختر التخصص</option>
                      <option value="ict">تكنولوجيا المعلومات والاتصالات / ICT</option>
                      <option value="it">تقنية المعلومات / IT</option>
                      <option value="cs">علوم الحاسوب / CS</option>
                      <option value="is">نظم المعلومات / IS</option>
                      <option value="dip-it">دبلوم تقنية المعلومات / DIP.IT</option>
                    </select>
                  </div>
                </div>

                {/* Academic Year */}
                <div>
                  <label htmlFor="academicYear" className="block text-lg font-semibold text-black mb-2">
                    Academic Year / السنة الدراسية
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                    <select
                      id="academicYear"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      required={role === 'student'}
                      className="w-full pl-12 pr-4 py-3 text-lg border-2 border-black rounded-lg focus:outline-none focus:border-blue-600 transition-colors appearance-none bg-white"
                    >
                      <option value="">Select Academic Year / اختر السنة الدراسية</option>
                      <option value="first">First Year / السنة الأولى</option>
                      <option value="second">Second Year / السنة الثانية</option>
                      <option value="third">Third Year / السنة الثالثة</option>
                      <option value="fourth">Fourth Year / السنة الرابعة</option>
                      <option value="fifth">Fifth Year / السنة الخامسة</option>
                      <option value="graduate">Graduate / دراسات عليا</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-lg font-semibold text-black mb-2">
                Password / كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 text-lg border-2 border-black rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
                  placeholder="Enter password / أدخل كلمة المرور"
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-lg font-semibold text-black mb-2">
                Confirm Password / تأكيد كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 text-lg border-2 border-black rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
                  placeholder="Confirm password / أعد إدخال كلمة المرور"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white text-lg font-bold py-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {loading ? 'Creating Account... / جاري إنشاء الحساب...' : 'Register / إنشاء حساب'}
            </button>
          </form>

          <div className="text-center mt-6 pt-6 border-t-2 border-gray-200">
            <p className="text-black text-lg">
              Already have an account? / لديك حساب بالفعل؟{' '}
              <Link 
                to="/" 
                className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
              >
                Login / تسجيل دخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
