'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/api';
import BottomNavigation from '@/components/BottomNavigation';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [stats, setStats] = useState({ activities: 0, likes: 0, moments: 0 });
  const [events, setEvents] = useState<any[]>([]);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      fetchProfile();
      fetchUserProfile();
      fetchStats();
      fetchUserEvents();
      fetchSubscription();
    }
  }, [user, authLoading, router]);

  const fetchUserEvents = async () => {
    try {
      const response = await api.get('/events/user/registered');
      if (response.data.success) {
        setEvents(response.data.events);
      }
    } catch (error) {
      console.error('Fetch events error:', error);
      // Silently fail - events section just won't show
      setEvents([]);
    }
  };

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

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profiles/me');
      if (response.data.success) {
        setProfile(response.data.profile);
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/profiles/stats');
      if (response.data.success) {
        setStats({
          activities: response.data.stats?.activities || 0,
          likes: response.data.stats?.likes || 0,
          moments: response.data.stats?.moments || 0
        });
      }
    } catch (error) {
      // If endpoint doesn't exist, use defaults
      console.log('Stats endpoint not available, using defaults');
    }
  };

  const fetchSubscription = async () => {
    try {
      const response = await api.get('/subscriptions/my-subscription');
      if (response.data.success) {
        setSubscription(response.data.subscription);
      }
    } catch (error) {
      console.error('Fetch subscription error:', error);
    }
  };;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-purple-50 flex flex-col max-w-md mx-auto">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-8 text-center w-full border border-purple-200">
            <div className="text-6xl mb-4">💜</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Profile Found</h2>
            <p className="text-gray-600 mb-6">Create your profile to start matching!</p>
            <Link
              href="/profile/setup"
              className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              Create Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const userProfilePhoto = userProfile?.photos?.find((p: any) => p.isPrimary)?.url || userProfile?.photos?.[0]?.url;
  const profilePhoto = profile?.photos?.find((p: any) => p.isPrimary)?.url || profile?.photos?.[0]?.url;

  const menuItems = [
    { label: 'Events', icon: '📅', href: '/events' },
    { label: 'Subscription', icon: '💳', href: '/plans' },
    { label: 'Restore Subscription', icon: '↩️', href: '/subscription' },
    { label: 'Terms of use', icon: '📋', href: '#terms' },
    { label: 'Privacy policy', icon: '🔒', href: '#privacy' },
    { label: 'Rate app', icon: '⭐', href: '#rate' },
    { label: 'Contact us', icon: '💬', href: '#contact' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-purple-50 flex flex-col max-w-md mx-auto pb-24">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 px-4 py-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center hover:bg-white transition-colors border border-purple-200 shadow-sm"
        >
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h1 className="text-xl font-bold text-gray-800">Profile</h1>
        
        <Link
          href="/profile/edit"
          className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center hover:bg-white transition-colors border border-purple-200 shadow-sm"
        >
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {/* Profile Photo - Centered Circle */}
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-400 shadow-xl">
              {profilePhoto ? (
                <img src={profilePhoto} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-300 to-pink-300 flex items-center justify-center">
                  <span className="text-5xl font-bold text-white">
                    {profile.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Name and Title */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-3xl font-bold text-gray-800">{profile.name}</h1>
            {profile.isApproved && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                className="text-xl"
                title="Verified Profile"
              >
                ✅
              </motion.div>
            )}
          </div>
          {profile.user?.email && (
            <p className="text-sm text-gray-600 mb-1">
              <a href={`mailto:${profile.user.email}`} className="text-gray-700 underline">
                {profile.user.email}
              </a>
            </p>
          )}
          <p className="text-purple-600 text-lg font-medium mb-6">{profile.nickname || 'Spiritual Seeker'}</p>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-purple-200 shadow-sm">
              <p className="text-2xl font-bold text-purple-600">{stats.activities}</p>
              <p className="text-sm text-gray-600 mt-1">Activities</p>
            </div>
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-purple-200 shadow-sm">
              <p className="text-2xl font-bold text-purple-600">{stats.likes}</p>
              <p className="text-sm text-gray-600 mt-1">Like</p>
            </div>
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-purple-200 shadow-sm">
              <p className="text-2xl font-bold text-purple-600">{stats.moments}</p>
              <p className="text-sm text-gray-600 mt-1">Life Moment</p>
            </div>
          </div>
        </motion.div>

        {/* Subscription Card */}
        {subscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-2xl p-4 shadow-lg border border-purple-300"
          >
            <Link
              href="/subscription"
              className="block group"
            >
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <p className="text-xs uppercase tracking-wider font-semibold opacity-90">Current Plan</p>
                  <h3 className="text-lg font-bold capitalize flex items-center gap-2 mt-1">
                    {subscription.plan === 'basic' && '🌙 Starter'}
                    {subscription.plan === 'standard' && '⭐ Seeker'}
                    {subscription.plan === 'premium' && '👑 Premium'}
                  </h3>
                  <p className="text-sm opacity-90 mt-1">
                    {subscription.billingCycle === 'monthly' ? '📅 Monthly' : '📆 Yearly'}
                  </p>
                </div>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-white text-3xl"
                >
                  ✨
                </motion.div>
              </div>
              <div className="mt-3 bg-white/20 rounded-lg px-3 py-2 group-hover:bg-white/30 transition-colors">
                <p className="text-white text-sm font-semibold text-center">Tap to manage →</p>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {item.href?.startsWith('#') ? (
                <button
                  onClick={() => {
                    if (item.label === 'Contact us') {
                      window.location.href = 'mailto:support@spiritualunitymatch.com';
                    }
                  }}
                  className="w-full bg-white/60 backdrop-blur-md hover:bg-white transition-colors border border-purple-200 rounded-2xl p-4 flex items-center justify-between group shadow-sm"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-gray-800 font-medium">{item.label}</span>
                  </span>
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className="w-full bg-white/60 backdrop-blur-md hover:bg-white transition-colors border border-purple-200 rounded-2xl p-4 flex items-center justify-between group shadow-sm"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-gray-800 font-medium">{item.label}</span>
                  </span>
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </motion.div>
          ))}

          {/* Logout Button */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={async () => {
              setLoggingOut(true);
              await logout();
            }}
            disabled={loggingOut}
            className="w-full bg-red-100/60 backdrop-blur-md hover:bg-red-100 transition-colors border border-red-300 rounded-2xl p-4 flex items-center justify-between group shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-3">
              {loggingOut ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></span>
                  <span className="text-red-700 font-medium">Logging out...</span>
                </>
              ) : (
                <>
                  <span className="text-xl">🚪</span>
                  <span className="text-red-700 font-medium">Logout</span>
                </>
              )}
            </span>
            {!loggingOut && (
              <svg className="w-5 h-5 text-red-600 group-hover:text-red-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </motion.button>
        </div>

        {/* Events Section */}
        {events.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 backdrop-blur-md border border-purple-200 rounded-2xl p-4 shadow-sm"
          >
            <p className="text-xs text-gray-600 uppercase tracking-wide mb-4 font-semibold">Registered Events</p>
            <div className="space-y-3">
              {events.map((event: any, idx: number) => (
                <Link
                  key={event._id}
                  href={`/events/${event._id}`}
                  className="block bg-white/50 hover:bg-white transition-colors rounded-xl p-3 border border-purple-100 hover:border-purple-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-gray-800 font-medium text-sm mb-1">{event.title}</h3>
                      <p className="text-gray-600 text-xs flex items-center gap-1">
                        <span>📍</span> {event.location}
                      </p>
                      <p className="text-gray-600 text-xs flex items-center gap-1 mt-1">
                        <span>🕐</span> {new Date(event.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Profile Details Section - Hidden but available */}
        {(profile.bio || profile.spiritualBeliefs?.length > 0 || profile.spiritualPractices?.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 backdrop-blur-md border border-purple-200 rounded-2xl p-4 shadow-sm"
          >
            {profile.bio && (
              <div className="mb-4">
                <p className="text-xs text-gray-600 uppercase tracking-wide mb-2 font-semibold">About</p>
                <p className="text-gray-700 text-sm leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {profile.spiritualBeliefs && profile.spiritualBeliefs.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-600 uppercase tracking-wide mb-2 font-semibold">Spiritual Beliefs</p>
                <div className="flex flex-wrap gap-2">
                  {profile.spiritualBeliefs.map((belief: string, idx: number) => (
                    <span
                      key={idx}
                      className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs border border-purple-300"
                    >
                      {belief.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.spiritualPractices && profile.spiritualPractices.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide mb-2 font-semibold">Practices</p>
                <div className="flex flex-wrap gap-2">
                  {profile.spiritualPractices.map((practice: string, idx: number) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs border border-blue-300"
                    >
                      {practice.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation userProfilePhoto={userProfilePhoto} />
    </div>
  );
}
