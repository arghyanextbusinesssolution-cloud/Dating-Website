'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/api';
import BottomNavigation from '@/components/BottomNavigation';

const PLAN_COLORS: { [key: string]: { bg: string; border: string; badge: string; icon: string } } = {
  basic: {
    bg: 'from-blue-100 to-cyan-100',
    border: 'border-blue-300',
    badge: 'bg-blue-500',
    icon: '🌙'
  },
  standard: {
    bg: 'from-purple-100 to-pink-100',
    border: 'border-purple-300',
    badge: 'bg-purple-500',
    icon: '⭐'
  },
  premium: {
    bg: 'from-yellow-100 to-orange-100',
    border: 'border-yellow-300',
    badge: 'bg-yellow-500',
    icon: '👑'
  }
};

const PLAN_FEATURES: { [key: string]: { name: string; features: string[] } } = {
  basic: {
    name: 'Starter Spirit',
    features: [
      'Basic browsing (10 profiles/day)',
      'Create profile',
      'View matches',
      'Community access'
    ]
  },
  standard: {
    name: 'Spiritual Seeker',
    features: [
      'Unlimited browsing',
      'Full messaging',
      'See who likes you',
      'Basic filters',
      'Community events',
      'Soul check-ins'
    ]
  },
  premium: {
    name: 'Divine Connection',
    features: [
      'Everything in Standard',
      'Advanced filters',
      'Profile boost',
      'Priority placement',
      'See profile views',
      'Match insights',
      'VIP support',
      'Spiritual coaching'
    ]
  }
};

export default function SubscriptionPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userProfilePhoto, setUserProfilePhoto] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      fetchSubscription();
      fetchProfile();
    }
  }, [user, authLoading, router]);

  const fetchSubscription = async () => {
    try {
      const response = await api.get('/subscriptions/my-subscription');
      if (response.data.success) {
        setSubscription(response.data.subscription);
      }
    } catch (error) {
      console.error('Fetch subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profiles/me');
      if (response.data.success && response.data.profile) {
        setProfile(response.data.profile);
        const photo = response.data.profile?.photos?.find((p: any) => p.isPrimary)?.url || 
                     response.data.profile?.photos?.[0]?.url;
        setUserProfilePhoto(photo);
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const planName = subscription?.plan || 'basic';
  const colors = PLAN_COLORS[planName];
  const planDetails = PLAN_FEATURES[planName];
  const isActive = subscription?.isActive;
  const daysRemaining = subscription?.endDate 
    ? Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-purple-50 flex flex-col max-w-md mx-auto pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 px-4 py-4 bg-white/40 backdrop-blur-md border-b border-purple-200"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center hover:bg-white transition-colors border border-purple-200 shadow-sm"
          >
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-800">My Plan</h1>
          <div className="w-10" />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {subscription ? (
          <>
            {/* Current Plan Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-gradient-to-br ${colors.bg} rounded-3xl p-6 border-2 ${colors.border} shadow-xl`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-4xl">{PLAN_COLORS[planName].icon}</span>
                    <h2 className="text-3xl font-bold text-gray-800">{planDetails.name}</h2>
                  </div>
                  <p className="text-gray-700 font-semibold text-lg capitalize">
                    {planName} Plan
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-4xl"
                >
                  ✨
                </motion.div>
              </div>

              {/* Status Badge */}
              <div className={`inline-block ${colors.badge} text-white px-4 py-2 rounded-full font-bold text-sm mb-4`}>
                {isActive ? '🟢 Active' : '⏸️ Inactive'}
              </div>

              {/* Plan Details */}
              {isActive && subscription.endDate && (
                <div className="mt-4 bg-white/50 backdrop-blur-md rounded-2xl p-4 border border-white">
                  <p className="text-sm text-gray-700 mb-1">
                    <span className="font-semibold">Billing Cycle:</span> {subscription.billingCycle === 'monthly' ? 'Monthly 📅' : 'Yearly 📆'}
                  </p>
                  <p className="text-sm text-gray-700 mb-3">
                    <span className="font-semibold">Started:</span> {new Date(subscription.startDate).toLocaleDateString()}
                  </p>
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-3 text-white">
                    <p className="text-sm font-medium">Renews in</p>
                    <p className="text-3xl font-bold">{daysRemaining > 0 ? daysRemaining : 0} days</p>
                    <p className="text-xs mt-1">
                      {new Date(subscription.endDate).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/70 backdrop-blur-md border border-purple-200 rounded-2xl p-6 shadow-md"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">✨</span> Included Features
              </h3>
              <div className="space-y-3">
                {planDetails.features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    className="flex items-start gap-3 p-3 bg-white/50 rounded-xl"
                  >
                    <span className="text-lg mt-0.5">✅</span>
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Coming Soon Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-100/60 to-purple-100/60 backdrop-blur-md border border-blue-300 rounded-2xl p-6 shadow-md"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">🚀</span> Coming Soon
              </h3>
              <div className="space-y-3">
                {[
                  'AI-Powered Match Suggestions',
                  'Spirit Guide Consultations',
                  'Compatibility Reports',
                  'Energy Level Analysis',
                  'Spiritual Growth Tracking'
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-lg">🎯</span>
                    <span className="text-gray-700 font-medium opacity-70">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Upgrade Button */}
            {planName !== 'premium' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link
                  href="/plans"
                  className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-bold text-center hover:shadow-lg hover:shadow-purple-500/50 transition-all text-lg"
                >
                  🚀 Upgrade to {planName === 'basic' ? 'Standard' : 'Premium'}
                </Link>
              </motion.div>
            )}

            {/* Manage Subscription */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <button
                onClick={() => router.push('/subscription/cancel')}
                className="w-full bg-white/70 backdrop-blur-md text-red-600 py-4 rounded-2xl font-bold border-2 border-red-300 hover:bg-red-50 transition-all text-lg"
              >
                📋 Manage Subscription
              </button>
            </motion.div>

            {/* Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-purple-100/60 backdrop-blur-md border border-purple-300 rounded-2xl p-4"
            >
              <p className="text-sm text-gray-700">
                <span className="font-bold">💡 Pro Tip:</span> Your subscription helps us continuously improve the platform and bring you amazing new features to enhance your spiritual journey! 🌟
              </p>
            </motion.div>
          </>
        ) : (
          /* No Subscription State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex items-center justify-center h-full min-h-[400px]"
          >
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-8 text-center w-full border border-purple-200">
              <div className="text-6xl mb-4">🌙</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Free Plan Active</h2>
              <p className="text-gray-600 mb-6">
                Unlock premium features to boost your spiritual connections!
              </p>
              <Link
                href="/plans"
                className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Explore Plans ✨
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation userProfilePhoto={userProfilePhoto} />
    </div>
  );
}
