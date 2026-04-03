'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import ResponsiveLayout from '@/components/ResponsiveLayout';

const SPIRITUAL_BELIEFS = [
  'buddhism', 'christianity', 'hinduism', 'islam', 'judaism',
  'spiritual-but-not-religious', 'atheist', 'agnostic', 'pagan',
  'new-age', 'yoga-practitioner', 'meditation', 'other'
];

const SPIRITUAL_PRACTICES = [
  'meditation', 'yoga', 'prayer', 'chanting', 'energy-healing',
  'astrology', 'tarot', 'crystals', 'breathwork', 'mindfulness',
  'nature-connection', 'rituals', 'ceremonies', 'other'
];

export default function EditProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    spiritualBeliefs: [] as string[],
    spiritualPractices: [] as string[]
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, router]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profiles/me');
      if (response.data.success && response.data.profile) {
        const profile = response.data.profile;
        setProfile(profile);
        setFormData({
          name: profile.name || '',
          email: profile.user?.email || user?.email || '',
          spiritualBeliefs: profile.spiritualBeliefs || [],
          spiritualPractices: profile.spiritualPractices || []
        });
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleBeliefs = (belief: string) => {
    setFormData((prev) => ({
      ...prev,
      spiritualBeliefs: prev.spiritualBeliefs.includes(belief)
        ? prev.spiritualBeliefs.filter((b) => b !== belief)
        : [...prev.spiritualBeliefs, belief]
    }));
  };

  const togglePractices = (practice: string) => {
    setFormData((prev) => ({
      ...prev,
      spiritualPractices: prev.spiritualPractices.includes(practice)
        ? prev.spiritualPractices.filter((p) => p !== practice)
        : [...prev.spiritualPractices, practice]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    // Validate
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    setSuccessMessage('');

    try {
      const response = await api.patch('/profiles/edit-basic-info', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        spiritualBeliefs: formData.spiritualBeliefs,
        spiritualPractices: formData.spiritualPractices
      });

      if (response.data.success) {
        setSuccessMessage('Profile updated successfully! ✨');
        setTimeout(() => {
          router.push('/profile');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Save error:', error);
      const errorData = error.response?.data;
      if (errorData?.errors) {
        setErrors(errorData.errors);
      } else {
        setErrors({
          submit: errorData?.message || 'Error saving profile'
        });
      }
    } finally {
      setSaving(false);
    }
  };
  if (authLoading || loading) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen flex items-center justify-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="min-h-screen flex flex-col max-w-2xl mx-auto md:p-6 pb-24 md:pb-6 relative z-10">

        {/* Form Container (Glassy Card) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/30 backdrop-blur-xl rounded-[40px] border border-white/40 shadow-2xl overflow-hidden flex flex-col flex-1"
        >
          {/* Header */}
          <div className="p-6 md:p-8 bg-white/40 border-b border-white/20 flex items-center justify-between sticky top-0 z-20">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-white/60 hover:bg-white/80 transition-colors flex items-center justify-center border border-white/40 shadow-sm group"
            >
              <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-black text-gray-800 tracking-tight uppercase">Edit Essence</h1>
            <div className="w-10" />
          </div>

          <div className="flex-1 p-6 md:p-8 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Success/Error Messages */}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-100/80 backdrop-blur-md border border-green-300 rounded-2xl p-4 text-green-800 font-bold text-sm tracking-tight text-center"
                >
                  {successMessage}
                </motion.div>
              )}
              {errors.submit && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-100/80 backdrop-blur-md border border-red-300 rounded-2xl p-4 text-red-800 font-bold text-sm tracking-tight text-center"
                >
                  {errors.submit}
                </motion.div>
              )}

              {/* Premium Header Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-purple-500/90 to-blue-600/90 rounded-[30px] p-6 text-white shadow-xl relative overflow-hidden group border border-white/20"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                  <span className="text-6xl">✨</span>
                </div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-black tracking-tight mb-1">Update Your Soul</h2>
                  <p className="text-white/80 text-xs font-bold uppercase tracking-widest">
                    Keep your vibrational frequency authentic
                  </p>
                </div>
              </motion.div>

              {/* Identity Fields */}
              <div className="space-y-6">
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 pl-4">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Your soul name"
                    className={`w-full bg-white/50 backdrop-blur-md border rounded-full px-6 py-4 text-gray-800 font-bold placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all shadow-inner ${errors.name ? 'border-red-400 bg-red-50/50' : 'border-white/40 focus:border-purple-300'
                      }`}
                  />
                  {errors.name && <p className="text-red-500 text-xs font-bold mt-2 pl-4">{errors.name}</p>}
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 pl-4">
                    Email Connection
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="your@email.com"
                    className={`w-full bg-white/50 backdrop-blur-md border rounded-full px-6 py-4 text-gray-800 font-bold placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all shadow-inner ${errors.email ? 'border-red-400 bg-red-50/50' : 'border-white/40 focus:border-purple-300'
                      }`}
                  />
                  {errors.email && <p className="text-red-500 text-xs font-bold mt-2 pl-4">{errors.email}</p>}
                </motion.div>
              </div>

              {/* Spiritual Beliefs */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="pt-4 border-t border-white/20">
                <label className="block text-sm font-black text-gray-800 tracking-tight uppercase mb-4">
                  Spiritual Path 🙏
                </label>
                <div className="flex flex-wrap gap-2">
                  {SPIRITUAL_BELIEFS.map((belief) => (
                    <button
                      key={belief}
                      type="button"
                      onClick={() => toggleBeliefs(belief)}
                      className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${formData.spiritualBeliefs.includes(belief)
                        ? 'bg-purple-500 text-white border-purple-600 shadow-lg shadow-purple-500/30 scale-105'
                        : 'bg-white/40 text-gray-600 border-white/40 hover:bg-white/60 hover:scale-105'
                        }`}
                    >
                      {belief.replace(/-/g, ' ')}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Spiritual Practices */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="pt-4 border-t border-white/20">
                <label className="block text-sm font-black text-gray-800 tracking-tight uppercase mb-4">
                  Daily Practices 🧘
                </label>
                <div className="flex flex-wrap gap-2">
                  {SPIRITUAL_PRACTICES.map((practice) => (
                    <button
                      key={practice}
                      type="button"
                      onClick={() => togglePractices(practice)}
                      className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${formData.spiritualPractices.includes(practice)
                        ? 'bg-blue-500 text-white border-blue-600 shadow-lg shadow-blue-500/30 scale-105'
                        : 'bg-white/40 text-gray-600 border-white/40 hover:bg-white/60 hover:scale-105'
                        }`}
                    >
                      {practice.replace(/-/g, ' ')}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="pt-8 w-full">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-xl hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                >
                  {saving ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Manifesting changes...
                    </div>
                  ) : (
                    'Save Essence ✨'
                  )}
                </button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </div>
    </ResponsiveLayout>
  );
}
