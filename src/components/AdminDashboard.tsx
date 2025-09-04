import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { User as UserType } from '../context/AuthContext'; // Use the new User type
import { Users, Trash2, LogOut, User, Settings, EyeOff } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const { user, logout } = useAuth();

  const loadUsers = async () => {
    try {
      setFetchLoading(true);
      const { data, error } = await supabase
        .from('profiles') // Query profiles table
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      setUsers(data as UserType[]);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Failed to load users. Please try again. / فشل في تحميل المستخدمين. يرجى المحاولة مرة أخرى.');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action is irreversible. / هل أنت متأكد من حذف هذا المستخدم؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      return;
    }

    try {
      setLoading(true);
      // Admin deletes user profile. The user in auth.users is orphaned but can't log in.
      // For full deletion, an edge function with the service_role key is required.
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again. / فشل في حذف المستخدم. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleManageUsers = () => {
    setShowUsers(true);
    loadUsers();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-green-100 text-green-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student': return '🎓';
      case 'teacher': return '👨‍🏫';
      case 'admin': return '⚙️';
      default: return '👤';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'student': return 'Student / طالب';
      case 'teacher': return 'Teacher / معلم';
      case 'admin': return 'Admin / مدير';
      default: return role;
    }
  };

    const getMajorDisplayName = (major?: string) => {
    if (!major) return '';
    const majorMap: { [key: string]: string } = {
      'ict': 'تكنولوجيا المعلومات والاتصالات / ICT',
      'it': 'تقنية المعلومات / IT',
      'cs': 'علوم الحاسوب / CS',
      'is': 'نظم المعلومات / IS',
      'dip-it': 'دبلوم تقنية المعلومات / DIP.IT'
    };
    return majorMap[major] || major;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b-2 border-black">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-black">
                  Welcome Admin to <span className="text-blue-600">Lumen</span>
                </h1>
                <p className="text-lg text-gray-600">مرحباً {user?.name} / Hello, {user?.name}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout / تسجيل خروج
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {!showUsers ? (
          <div className="bg-white border-2 border-black rounded-lg p-8 shadow-lg text-center">
            <Users className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-black mb-4">Manage Users / إدارة المستخدمين</h2>
            <p className="text-lg text-gray-600 mb-8">Manage all users in the Lumen system / إدارة جميع المستخدمين في نظام Lumen</p>
            <button
              onClick={handleManageUsers}
              className="flex items-center justify-center mx-auto bg-blue-600 text-white text-lg font-bold px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              <Users className="w-5 h-5 mr-2" />
              Manage Users / إدارة المستخدمين
            </button>
          </div>
        ) : (
          <div className="bg-white border-2 border-black rounded-lg p-8 shadow-lg">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center">
                <Users className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-2xl font-bold text-black">All Users ({users.length}) / جميع المستخدمين ({users.length})</h3>
              </div>
              <button
                onClick={() => setShowUsers(false)}
                className="flex items-center px-4 py-2 border-2 border-black text-black rounded-lg hover:bg-gray-100 transition-colors"
              >
                <EyeOff className="w-4 h-4 mr-2" />
                Hide Users / إخفاء المستخدمين
              </button>
            </div>
            
            {fetchLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Loading users... / جاري تحميل المستخدمين...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {users.map((userItem) => (
                  <div key={userItem.id} className="flex items-center justify-between p-6 border-2 border-gray-200 rounded-lg hover:border-blue-600 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                        {getRoleIcon(userItem.role)}
                      </div>
                      <div>
                        <div className="text-xl font-bold text-black">{userItem.name}</div>
                        <div className="text-lg text-gray-600">{userItem.email}</div>
                        {userItem.studentId && (
                          <div className="text-sm text-gray-500">
                            ID: {userItem.studentId} | {getMajorDisplayName(userItem.major)}
                          </div>
                        )}
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(userItem.role)}`}>
                            {getRoleDisplayName(userItem.role)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteUser(userItem.id)}
                      disabled={loading || userItem.id === user?.id} // Admin can't delete themselves
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete / حذف
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
