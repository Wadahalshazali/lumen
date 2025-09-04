import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message.includes('Email not confirmed')) {
        setError('Please confirm your email before logging in. / يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول.');
      } else {
        setError(error.message || 'Login failed. Please check your credentials. / فشل تسجيل الدخول. يرجى التحقق من بياناتك.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-blue-600 mb-3">Lumen</h1>
          <p className="text-xl text-black font-medium">Smart Learning Hub</p>
          <div className="w-20 h-1 bg-blue-600 mx-auto mt-4"></div>
        </div>
        
        <div className="bg-white border-2 border-black rounded-lg p-8 shadow-lg">
          <div className="flex items-center justify-center mb-6">
            <LogIn className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold text-black">Login / تسجيل دخول</h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Enter your email / أدخل بريدك الإلكتروني"
                />
              </div>
            </div>

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
                  placeholder="Enter your password / أدخل كلمة المرور"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white text-lg font-bold py-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {loading ? 'Logging in... / جاري تسجيل الدخول...' : 'Login / تسجيل دخول'}
            </button>
          </form>

          <div className="text-center mt-6 pt-6 border-t-2 border-gray-200">
            <p className="text-black text-lg">
              Don't have an account? / ليس لديك حساب؟{' '}
              <Link 
                to="/register" 
                className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
              >
                Register / سجل الآن
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
