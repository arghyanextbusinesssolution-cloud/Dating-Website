'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import api from '@/lib/api';

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
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-purple-50 flex flex-col max-w-md mx-auto pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 px-4 py-4 flex items-center justify-between bg-white/40 backdrop-blur-md border-b border-purple-200"
      >
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center hover:bg-white transition-colors border border-purple-200 shadow-sm"
        >
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-800">Edit Profile</h1>
        <div className="w-10" />
      </motion.div>

      {/* Form Container */}
      <div className="flex-1 px-4 py-8 overflow-y-auto">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-100/60 backdrop-blur-md border border-green-300 rounded-2xl p-4 text-green-700 font-medium text-center"
            >
              {successMessage}
            </motion.div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-100/60 backdrop-blur-md border border-red-300 rounded-2xl p-4 text-red-700 font-medium text-center"
            >
              {errors.submit}
            </motion.div>
          )}

          {/* Premium Header Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl border border-purple-300"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">Update Your Essence</h2>
              <span className="text-3xl">✨</span>
            </div>
            <p className="text-purple-100 text-sm">
              Keep your spiritual profile fresh and authentic
            </p>
          </motion.div>

          {/* Name Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Your name"
              className={`w-full bg-white/70 backdrop-blur-md border rounded-2xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-sm ${
                errors.name ? 'border-red-500 bg-red-50/70' : 'border-purple-200'
              }`}
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </motion.div>

          {/* Email Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="your@email.com"
              className={`w-full bg-white/70 backdrop-blur-md border rounded-2xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-sm ${
                errors.email ? 'border-red-500 bg-red-50/70' : 'border-purple-200'
              }`}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </motion.div>

          {/* Spiritual Beliefs Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Spiritual Beliefs 🙏
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SPIRITUAL_BELIEFS.map((belief) => (
                <button
                  key={belief}
                  type="button"
                  onClick={() => toggleBeliefs(belief)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                    formData.spiritualBeliefs.includes(belief)
                      ? 'bg-purple-500 text-white border-purple-600 shadow-lg shadow-purple-500/30'
                      : 'bg-white/60 text-gray-700 border-purple-200 hover:bg-purple-100/40'
                  }`}
                >
                  {belief.replace(/-/g, ' ')}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Spiritual Practices Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Spiritual Practices 🧘
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SPIRITUAL_PRACTICES.map((practice) => (
                <button
                  key={practice}
                  type="button"
                  onClick={() => togglePractices(practice)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                    formData.spiritualPractices.includes(practice)
                      ? 'bg-blue-500 text-white border-blue-600 shadow-lg shadow-blue-500/30'
                      : 'bg-white/60 text-gray-700 border-purple-200 hover:bg-blue-100/40'
                  }`}
                >
                  {practice.replace(/-/g, ' ')}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8"
          >
            {saving ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </div>
            ) : (
              'Save Changes ✨'
            )}
          </motion.button>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-blue-100/60 backdrop-blur-md border border-blue-300 rounded-2xl p-4"
          >
            <p className="text-blue-900 text-sm">
              <span className="font-semibold">💡 Tip:</span> These fields help us match you with compatible souls. Keep them updated!
            </p>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
}
