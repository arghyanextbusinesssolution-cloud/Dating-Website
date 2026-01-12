'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/api';
import BottomNavigation from '@/components/BottomNavigation';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      fetchData();
      fetchUserProfile();
    }
  }, [user, authLoading, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/profiles/me');
      if (response.data.success) {
        setUserProfile(response.data.profile);
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [subRes, profileRes] = await Promise.all([
        api.get('/subscriptions/my-subscription'),
        api.get('/profiles/me'),
      ]);

      if (subRes.data.success) {
        setSubscription(subRes.data.subscription);
      }
      if (profileRes.data.success) {
        setProfile(profileRes.data.profile);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const userProfilePhoto = userProfile?.photos?.find((p: any) => p.isPrimary)?.url || userProfile?.photos?.[0]?.url;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 flex flex-col max-w-md mx-auto pb-20">
      {/* Top Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">spiritualunitymatch</h1>
        <Link href="/profile" className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {userProfilePhoto ? (
            <img src={userProfilePhoto} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-600 text-lg">👤</span>
          )}
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6">
        {!subscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-2">Choose Your Plan</h2>
            <p className="text-gray-600 mb-4 text-sm">Select a membership plan to unlock all features</p>
            <Link
              href="/plans"
              className="block text-center bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-full font-semibold"
            >
              View Plans
            </Link>
          </motion.div>
        )}

        {!profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-2">Complete Your Profile</h2>
            <p className="text-gray-600 mb-4 text-sm">Create your profile to start matching</p>
            <Link
              href="/profile/setup"
              className="block text-center bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-full font-semibold"
            >
              Setup Profile
            </Link>
          </motion.div>
        )}

        {subscription && profile && (
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/matches/suggested"
              className="bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center justify-center min-h-[140px] hover:shadow-2xl transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 text-center">Browse Matches</h3>
            </Link>

            <Link
              href="/matches/likes"
              className="bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center justify-center min-h-[140px] hover:shadow-2xl transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 text-center">Likes You</h3>
            </Link>

            <Link
              href="/messages"
              className="bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center justify-center min-h-[140px] hover:shadow-2xl transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 text-center">Messages</h3>
            </Link>

            <Link
              href="/profile"
              className="bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center justify-center min-h-[140px] hover:shadow-2xl transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 text-center">Profile</h3>
            </Link>
          </div>
        )}

        {user?.role === 'admin' && (
          <Link
            href="/admin"
            className="block mt-6 bg-white rounded-3xl shadow-xl p-4 text-center font-semibold text-gray-800"
          >
            Admin Panel
          </Link>
        )}

        <button
          onClick={logout}
          className="block mt-4 w-full bg-gray-100 rounded-3xl shadow-lg p-4 text-center font-semibold text-gray-700"
        >
          Logout
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation userProfilePhoto={userProfilePhoto} />
    </div>
  );
}
