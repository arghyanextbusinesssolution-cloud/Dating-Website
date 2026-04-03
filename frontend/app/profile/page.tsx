'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/api';
import ResponsiveLayout from '@/components/ResponsiveLayout';

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
    <ResponsiveLayout userProfilePhoto={userProfilePhoto}>
      <div className="min-h-screen flex flex-col max-w-5xl mx-auto md:p-6 pb-24 md:pb-6 relative z-10">
        <div className="flex-1 flex flex-col md:flex-row gap-6">
          {/* Left Column: Profile Card */}
          <section className="md:w-1/3 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/30 backdrop-blur-xl rounded-[40px] border border-white/40 p-8 shadow-2xl text-center flex flex-col items-center"
            >
              {/* Profile Photo */}
              <div className="relative mb-6 group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/50 shadow-xl ring-4 ring-purple-500/20 transition-transform group-hover:scale-105">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <span className="text-5xl font-black text-white">
                        {profile.name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>
                {profile.isApproved && (
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg border border-purple-100 ring-2 ring-purple-500/20" title="Verified Soul">
                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Identity */}
              <h1 className="text-3xl font-black text-gray-800 tracking-tight uppercase mb-1">{profile.name}</h1>
              <p className="text-purple-600 text-[11px] font-black uppercase tracking-[0.2em] mb-4">{profile.nickname || 'Spiritual seeker'}</p>

              {/* Vital Details */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                <span className="bg-white/40 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-gray-600 border border-white/20 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="opacity-40 text-xs">⏳</span> {profile.age} Cycles
                </span>
                <span className="bg-white/40 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-gray-600 border border-white/20 uppercase tracking-widest flex items-center gap-1.5 capitalize">
                  <span className="opacity-40 text-xs">🌀</span> {profile.gender}
                </span>
                <span className="bg-white/40 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-gray-600 border border-white/20 uppercase tracking-widest flex items-center gap-1.5 capitalize">
                  <span className="opacity-40 text-xs">💖</span> Seeking {profile.genderPreference?.join(', ') || 'All'}
                </span>
              </div>

              {profile.user?.email && (
                <a href={`mailto:${profile.user.email}`} className="text-[10px] font-bold text-gray-400 hover:text-purple-500 transition-colors uppercase tracking-widest mb-8">
                  {profile.user.email}
                </a>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 w-full">
                <div className="bg-white/40 backdrop-blur-md rounded-2xl p-3 border border-white/20">
                  <p className="text-xl font-black text-purple-600">{stats.activities}</p>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">Tasks</p>
                </div>
                <div className="bg-white/40 backdrop-blur-md rounded-2xl p-3 border border-white/20">
                  <p className="text-xl font-black text-purple-600">{stats.likes}</p>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">Likes</p>
                </div>
                <div className="bg-white/40 backdrop-blur-md rounded-2xl p-3 border border-white/20">
                  <p className="text-xl font-black text-purple-600">{stats.moments}</p>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">Moments</p>
                </div>
              </div>

              <div className="mt-8 w-full">
                <Link
                  href="/profile/edit"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-purple-200 hover:scale-[1.02] transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit profile
                </Link>
              </div>
            </motion.div>

            {/* Subscription Section */}
            {subscription && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-purple-500/90 to-blue-600/90 backdrop-blur-xl rounded-[35px] p-6 shadow-2xl relative overflow-hidden group border border-white/20"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                  <span className="text-6xl">✨</span>
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] mb-1">Vibrational level</p>
                  <h3 className="text-xl font-black text-white capitalize flex items-center gap-2 mb-4">
                    {subscription.plan === 'basic' && '🌙 Starter soul'}
                    {subscription.plan === 'standard' && '⭐ Match seeker'}
                    {subscription.plan === 'premium' && '👑 Divine premium'}
                  </h3>
                  <Link
                    href="/subscription"
                    className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-[10px] font-black px-4 py-2 rounded-xl transition-colors uppercase tracking-widest"
                  >
                    Manage connection →
                  </Link>
                </div>
              </motion.div>
            )}
          </section>

          {/* Right Column: Menu & Details */}
          <section className="md:w-2/3 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/30 backdrop-blur-xl rounded-[40px] border border-white/40 overflow-hidden shadow-2xl flex flex-col h-full"
            >
              <div className="p-6 md:p-8 bg-white/40 border-b border-white/20">
                <h2 className="text-xl font-black text-gray-800 tracking-tight uppercase">Settings & connections</h2>
              </div>

              <div className="flex-1 p-6 md:p-8 space-y-3">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {item.href?.startsWith('#') ? (
                      <button
                        onClick={() => {
                          if (item.label === 'Contact us') {
                            window.location.href = 'mailto:support@spiritualunitymatch.com';
                          }
                        }}
                        className="w-full bg-white/40 hover:bg-white/60 transition-all border border-white/20 rounded-2xl p-4 flex items-center justify-between group"
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-base grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">{item.icon}</span>
                          <span className="text-gray-700 font-bold text-sm tracking-tight">{item.label}</span>
                        </span>
                        <svg className="w-4 h-4 text-gray-300 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className="w-full bg-white/40 hover:bg-white/60 transition-all border border-white/20 rounded-2xl p-4 flex items-center justify-between group"
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-base grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">{item.icon}</span>
                          <span className="text-gray-700 font-bold text-sm tracking-tight">{item.label}</span>
                        </span>
                        <svg className="w-4 h-4 text-gray-300 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    )}
                  </motion.div>
                ))}

                {/* Logout */}
                <motion.button
                  whileHover={{ x: 5 }}
                  onClick={async () => {
                    setLoggingOut(true);
                    await logout();
                  }}
                  disabled={loggingOut}
                  className="w-full bg-red-50/40 hover:bg-red-50/60 transition-all border border-red-100/40 rounded-2xl p-4 flex items-center justify-between group disabled:opacity-50"
                >
                  <span className="flex items-center gap-3">
                    {loggingOut ? (
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500" />
                    ) : (
                      <span className="text-base">🚪</span>
                    )}
                    <span className="text-red-600 font-bold text-sm tracking-tight">{loggingOut ? 'Ending session...' : 'Logout'}</span>
                  </span>
                  <svg className="w-4 h-4 text-red-300 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                  </svg>
                </motion.button>
              </div>

              {/* Bio / Beliefs area */}
              {(profile.bio || profile.spiritualBeliefs?.length > 0) && (
                <div className="p-8 bg-white/20 border-t border-white/20 space-y-6">
                  {profile.bio && (
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Soul mission</p>
                      <p className="text-sm font-medium text-gray-600 leading-relaxed italic">"{profile.bio}"</p>
                    </div>
                  )}
                  {profile.spiritualBeliefs?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Core vibrations</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.spiritualBeliefs.map((belief: string, idx: number) => (
                          <span key={idx} className="bg-purple-100/50 backdrop-blur-sm text-purple-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-purple-200">
                            {belief.replace(/-/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </section>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
