import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Material } from '../types';
import { BookOpen, Plus, LogOut, User, Calendar } from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  const [content, setContent] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const { user, logout } = useAuth();

  // Load materials from Supabase
  useEffect(() => {
    const loadMaterials = async () => {
      if (!user) return;
      
      try {
        setFetchLoading(true);
        const { data, error } = await supabase
          .from('materials')
          .select('*')
          .eq('teacher_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        const formattedMaterials: Material[] = data.map(item => ({
          id: item.id,
          teacher_id: item.teacher_id,
          content: item.content,
          created_at: item.created_at
        }));

        setMaterials(formattedMaterials);
      } catch (error) {
        console.error('Error loading materials:', error);
      } finally {
        setFetchLoading(false);
      }
    };

    loadMaterials();
  }, [user]);

  const handleAddMaterial = async () => {
    if (!content.trim() || !user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('materials')
        .insert([{
          teacher_id: user.id,
          content: content.trim()
        }])
        .select()
        .limit(1);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const newMaterial: Material = {
          id: data[0].id,
          teacher_id: data[0].teacher_id,
          content: data[0].content,
          created_at: data[0].created_at
        };

        setMaterials([newMaterial, ...materials]);
        setContent('');
      }
    } catch (error) {
      console.error('Error adding material:', error);
      alert('Failed to add material. Please try again. / فشل في إضافة المادة. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b-2 border-black">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <User className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-black">
                  Welcome Teacher to <span className="text-blue-600">Lumen</span>
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Add Material Section */}
        <div className="bg-white border-2 border-black rounded-lg p-8 shadow-lg mb-8">
          <div className="flex items-center mb-6">
            <Plus className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-black">Add Material / إضافة مادة تعليمية</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="content" className="block text-lg font-semibold text-black mb-3">
                Material Content / محتوى المادة
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your educational material here... / أدخل المادة التعليمية هنا..."
                className="w-full h-32 px-4 py-3 text-lg border-2 border-black rounded-lg resize-none focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            <button
              onClick={handleAddMaterial}
              disabled={!content.trim() || loading}
              className="flex items-center justify-center bg-blue-600 text-white text-lg font-bold px-8 py-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Adding... / جاري الإضافة...
                </div>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Add Material / إضافة مادة
                </>
              )}
            </button>
          </div>
        </div>

        {/* Materials List */}
        <div className="bg-white border-2 border-black rounded-lg p-8 shadow-lg">
          <div className="flex items-center mb-6">
            <BookOpen className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-2xl font-bold text-black">Your Materials / موادك التعليمية</h3>
          </div>
          
          {fetchLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading materials... / جاري تحميل المواد...</p>
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">No materials added yet / لم تتم إضافة مواد بعد</p>
              <p className="text-lg text-gray-500 mt-2">Start by adding your first educational material above / ابدأ بإضافة أول مادة تعليمية أعلاه</p>
            </div>
          ) : (
            <div className="space-y-4">
              {materials.map((material, index) => (
                <div key={material.id} className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-600 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      Material #{index + 1} / المادة رقم {index + 1}
                    </span>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(material.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-lg text-black leading-relaxed">
                    {material.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
