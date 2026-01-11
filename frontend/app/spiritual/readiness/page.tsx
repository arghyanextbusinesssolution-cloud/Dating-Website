'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import api from '@/lib/api';

export default function SpiritualReadinessPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    spiritualGrowth: { stage: '', description: '' },
    conflictHandling: { approach: '', description: '' },
    lifePurpose: { clarity: '', description: '' },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/spiritual/readiness', formData);
      alert('Spiritual readiness saved!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-spiritual-gradient-light py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h1 className="text-3xl font-bold text-spiritual-violet-700 mb-8 text-center">
            Spiritual Readiness Path
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Answer these questions to help us find better matches for you
          </p>

          <div className="space-y-8">
            {/* Spiritual Growth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spiritual Growth Stage
              </label>
              <select
                value={formData.spiritualGrowth.stage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    spiritualGrowth: { ...formData.spiritualGrowth, stage: e.target.value },
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spiritual-violet-500"
              >
                <option value="">Select</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="teacher">Teacher</option>
              </select>
              <textarea
                value={formData.spiritualGrowth.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    spiritualGrowth: { ...formData.spiritualGrowth, description: e.target.value },
                  })
                }
                rows={3}
                className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spiritual-violet-500"
                placeholder="Tell us about your spiritual journey..."
              />
            </div>

            {/* Conflict Handling */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conflict Handling Approach
              </label>
              <select
                value={formData.conflictHandling.approach}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    conflictHandling: { ...formData.conflictHandling, approach: e.target.value },
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spiritual-violet-500"
              >
                <option value="">Select</option>
                <option value="avoidant">Avoidant</option>
                <option value="confrontational">Confrontational</option>
                <option value="collaborative">Collaborative</option>
                <option value="mindful">Mindful</option>
              </select>
              <textarea
                value={formData.conflictHandling.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    conflictHandling: { ...formData.conflictHandling, description: e.target.value },
                  })
                }
                rows={3}
                className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spiritual-violet-500"
                placeholder="How do you handle conflicts in relationships?"
              />
            </div>

            {/* Life Purpose */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Life Purpose Clarity
              </label>
              <select
                value={formData.lifePurpose.clarity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lifePurpose: { ...formData.lifePurpose, clarity: e.target.value },
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spiritual-violet-500"
              >
                <option value="">Select</option>
                <option value="very-clear">Very Clear</option>
                <option value="somewhat-clear">Somewhat Clear</option>
                <option value="exploring">Exploring</option>
                <option value="uncertain">Uncertain</option>
              </select>
              <textarea
                value={formData.lifePurpose.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lifePurpose: { ...formData.lifePurpose, description: e.target.value },
                  })
                }
                rows={3}
                className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spiritual-violet-500"
                placeholder="What is your life purpose or mission?"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-spiritual-gradient text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Responses'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

