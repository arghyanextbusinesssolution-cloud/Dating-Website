'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/api';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface Match {
  userId: string;
  profile: any;
  matchScore: number;
  matchLabels: string[];
  compatibility: any;
  genderPreference?: string;
  commonInterests?: {
    beliefs: string[];
    practices: string[];
    lifestyle: string[];
  };
  matchExplanation?: string;
}

export default function SuggestedMatchesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showUpgradeModal } = useSubscription();
  const isBasic = user?.role === 'basic';
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'for-you' | 'nearby'>('for-you');
  const [isLiking, setIsLiking] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [mutualMatchData, setMutualMatchData] = useState<{ userId: string, profile: any } | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;

    }

    if (user) {
      fetchMatches();
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

  const fetchMatches = async () => {
    try {
      const response = await api.get('/matches/suggested');
      if (response.data.success) {
        setMatches(response.data.matches);
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        showUpgradeModal();
      }
    } finally {
      setLoading(false);
    }
  };

  const advanceToNext = (removedUserId?: string) => {
    const userIdToRemove = removedUserId || matches[currentIndex]?.userId;
    setMatches((prevMatches) => {
      const newMatches = prevMatches.filter((m) => m.userId !== userIdToRemove);

      // If we are about to run out of matches, fetch more
      if (newMatches.length <= 1) {
        fetchMatches();
      }

      // Adjust index if we removed the last item
      setCurrentIndex((prevIndex) => {
        if (prevIndex >= newMatches.length && newMatches.length > 0) {
          return newMatches.length - 1;
        }
        return prevIndex;
      });

      return newMatches;
    });
  };

  const handleLike = async (userId: string) => {
    try {
      setIsLiking(true);
      const response = await api.post(`/matches/like/${userId}`);
      if (response.data.success) {
        if (response.data.isMutualMatch) {
          // Show beautiful popup instead of alert
          setMutualMatchData({
            userId: userId,
            profile: matches.find(m => m.userId === userId)?.profile || {}
          });
        } else {
          advanceToNext(userId);
        }
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error liking user', 'error');
    } finally {
      setIsLiking(false);
    }
  };

  const handlePass = () => {
    advanceToNext();
  };

  const handleReject = async (userId: string) => {
    try {
      setIsRejecting(true);
      const response = await api.post(`/matches/reject/${userId}`);
      if (response.data.success) {
        advanceToNext(userId);
      }
    } catch (error: any) {
      console.error('Reject error:', error);
      showToast(error.response?.data?.message || 'Error rejecting user', 'error');
    } finally {
      setIsRejecting(false);
    }
  };

  const getDistance = (match: Match) => {
    // Calculate distance if location data is available
    if (userProfile?.location?.coordinates && match.profile?.location?.coordinates) {
      const lat1 = userProfile.location.coordinates.latitude;
      const lon1 = userProfile.location.coordinates.longitude;
      const lat2 = match.profile.location.coordinates.latitude;
      const lon2 = match.profile.location.coordinates.longitude;

      if (lat1 && lon1 && lat2 && lon2) {
        const R = 3959; // Earth radius in miles
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        if (distance < 1) {
          return `${Math.round(distance * 10) / 10} miles`;
        }
        return `${Math.round(distance)} miles`;
      }
    }
    return 'Nearby';
  };

  const getHeight = (match: Match) => {
    // Height data would need to be added to the profile model
    // For now, return a placeholder or check if it exists
    return match.profile?.height || 'N/A';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const currentMatch = matches[currentIndex];
  const userProfilePhoto = userProfile?.photos?.find((p: any) => p.isPrimary)?.url || userProfile?.photos?.[0]?.url;

  return (
    <ResponsiveLayout userProfilePhoto={userProfilePhoto}>
      {/* ═══ DESKTOP VIEW (3-Section Layout) — hidden on mobile ═══ */}
      <div className="hidden md:flex h-full gap-8 px-8 py-6">
        {/* SECTION 2: Discovery Sidebar (Middle) */}
        <aside className="w-80 flex flex-col gap-6 shrink-0">
          <div className="bg-white/40 backdrop-blur-xl rounded-[32px] p-6 border border-white/20 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-6 font-sans">Discover</h2>

            {/* Range Filters */}
            <div className="space-y-6 mb-8">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[15px] font-semibold text-gray-700">Age Range</span>
                  <span className="text-[13px] font-bold text-gray-400">22 — 30</span>
                </div>
                <div className="h-1.5 bg-gray-200/50 rounded-full relative">
                  <div className="absolute inset-y-0 left-1/4 right-1/4 bg-[#8b5cf6]/40 rounded-full" />
                  <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#8b5cf6] rounded-full shadow-sm" />
                  <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#8b5cf6] rounded-full shadow-sm" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[15px] font-semibold text-gray-700">Distance</span>
                  <span className="text-[13px] font-bold text-gray-400">25 km</span>
                </div>
                <div className="h-1.5 bg-gray-200/50 rounded-full relative">
                  <div className="absolute inset-y-0 left-0 right-1/3 bg-[#8b5cf6]/40 rounded-full" />
                  <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#8b5cf6] rounded-full shadow-sm" />
                </div>
              </div>
            </div>

            {/* Spiritual Interests */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Spiritual Interests</h3>
              {['Meditation', 'Yoga', 'Mindfulness'].map((interest, i) => (
                <label key={interest} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${i === 0 ? 'bg-[#8b5cf6] border-[#8b5cf6]' : 'border-gray-200 bg-white/50'
                      }`}>
                      {i === 0 && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-[14px] text-gray-600 font-medium group-hover:text-gray-900 transition-colors">{interest}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${i === 0 ? 'bg-[#3b82f6] border-[#3b82f6]' : 'bg-[#3b82f6]/80 border-[#3b82f6]/80'
                    }`}>
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Nearby Souls List */}
          <div className="bg-white/40 backdrop-blur-xl rounded-[32px] p-6 border border-white/20 shadow-sm flex-1">
            <h2 className="text-lg font-bold text-gray-800 mb-5">Nearby Souls</h2>
            <div className="space-y-5 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              {[
                { name: 'Maya', age: 25, dist: '1 km', img: 'https://i.pravatar.cc/150?u=maya' },
                { name: 'Rahul', age: 28, dist: '3 km', img: 'https://i.pravatar.cc/150?u=rahul' },
                { name: 'Priya', age: 24, dist: '5 km', img: 'https://i.pravatar.cc/150?u=priya' }
              ].map((soul) => (
                <div key={soul.name} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <img src={soul.img} alt={soul.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-gray-100" />
                    <div>
                      <h4 className="text-[14px] font-bold text-gray-800">{soul.name}, {soul.age}</h4>
                      <p className="text-[12px] text-gray-400 font-medium">Kolkata • {soul.dist} away</p>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white transition-all shadow-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* SECTION 3: Main Matching Card (Right) */}
        <section className="flex-1 flex flex-col items-center justify-start pt-4">
          {matches.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-xl rounded-[40px] p-12 text-center shadow-xl border border-white/40">
              <div className="text-6xl mb-6">💜</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Matches Found</h2>
              <p className="text-gray-500 mb-8">Check back later for new matches!</p>
              <button onClick={fetchMatches} className="bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all">
                Refresh
              </button>
            </div>
          ) : currentMatch ? (
            <div className="w-full max-w-[480px] relative group h-[620px]">
              <motion.div
                key={currentMatch.userId}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full h-full bg-white/40 backdrop-blur-md rounded-[48px] p-3 shadow-2xl border border-white/60 overflow-hidden relative"
              >
                {/* Image Container */}
                <div className="w-full h-full rounded-[40px] overflow-hidden relative shadow-inner">
                  {currentMatch.profile?.photos?.length > 0 ? (
                    <img
                      src={currentMatch.profile.photos.find((p: any) => p.isPrimary)?.url || currentMatch.profile.photos[0].url}
                      alt={currentMatch.profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-50 flex items-center justify-center">
                      <span className="text-6xl font-bold text-[#8b5cf6]/30">{currentMatch.profile?.name?.[0]}</span>
                    </div>
                  )}

                  {/* Badges Overlay */}
                  <div className="absolute top-6 left-6 flex flex-col gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#8b5cf6]/80 backdrop-blur-md border border-white/50 flex items-center justify-center shadow-lg">
                      <span className="text-lg">✨</span>
                    </div>
                  </div>

                  <div className="absolute top-6 right-6">
                    <div className="bg-white/30 backdrop-blur-xl rounded-full px-4 py-2 border border-white/40 shadow-lg text-center flex flex-col">
                      <span className="text-[14px] font-bold text-white drop-shadow-md">{currentMatch.matchScore}% Match</span>
                      <span className="text-[8px] font-bold text-white/90 uppercase tracking-widest drop-shadow-sm">Highly Compatible</span>
                    </div>
                  </div>

                  {/* Profile Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 via-black/30 to-transparent pt-32">
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <h2 className="text-4xl font-bold text-white mb-1 drop-shadow-lg">{currentMatch.profile?.name}, {currentMatch.profile?.age}</h2>
                        <p className="text-lg text-white/90 font-medium drop-shadow-md">Kolkata • {getDistance(currentMatch)} away</p>
                      </div>
                    </div>

                    {/* Interests Badges */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {['Mediation', 'Yoga', 'Music'].map((tag) => (
                        <div key={tag} className="px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-[13px] font-semibold flex items-center gap-2">
                          <span className="text-[12px] opacity-70">✦</span> {tag}
                        </div>
                      ))}
                    </div>

                    {/* Buttons Row - Fixed Position matching mockup */}
                    <div className="flex items-center justify-center gap-10 mt-4">
                      <button
                        onClick={() => handleReject(currentMatch.userId)}
                        className="w-16 h-16 rounded-full bg-pink-500/20 backdrop-blur-xl border-2 border-pink-400 flex items-center justify-center text-pink-500 hover:bg-pink-500 hover:text-white transition-all shadow-lg active:scale-95"
                      >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleLike(currentMatch.userId)}
                        className="w-20 h-20 rounded-full bg-[#f472b6] flex items-center justify-center text-white shadow-[0_0_20px_rgba(244,114,182,0.4)] hover:shadow-[0_0_30px_rgba(244,114,182,0.6)] hover:scale-110 active:scale-95 transition-all"
                      >
                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status Overlays */}
                {isLiking && (
                  <div className="absolute inset-0 z-50 bg-[#f472b6]/20 backdrop-blur-sm flex items-center justify-center rounded-[48px]">
                    <div className="bg-white/90 p-6 rounded-full shadow-2xl animate-bounce">
                      <span className="text-4xl">💖</span>
                    </div>
                  </div>
                )}
                {isRejecting && (
                  <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-[48px]">
                    <div className="bg-white/90 p-6 rounded-full shadow-2xl animate-shake">
                      <span className="text-4xl">❌</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          ) : (
            <div className="bg-white/40 backdrop-blur-xl rounded-[40px] p-12 text-center shadow-xl border border-white/40">
              <p className="text-gray-500 text-lg">No more matches. Check back later!</p>
            </div>
          )}
        </section>

        {/* SECTION 4: Next Matches (Far Right - Optional padding placeholder or mini card) */}
        <div className="w-56 flex flex-col gap-6 pt-4">
          <div className="bg-white/20 backdrop-blur-md rounded-3xl p-5 border border-white/10 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-gray-800">Next Matches</span>
              <span className="text-gray-400">→</span>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { n: 'Asha', p: '82%', img: 'https://i.pravatar.cc/100?u=asha' },
                { n: 'Ravi', p: '76%', img: 'https://i.pravatar.cc/100?u=ravi' },
                { n: 'Sneha', p: '70%', img: 'https://i.pravatar.cc/100?u=sneha' }
              ].map(m => (
                <div key={m.n} className="flex flex-col items-center gap-1 group cursor-pointer">
                  <img src={m.img} className="w-12 h-12 rounded-full object-cover border-2 border-white group-hover:scale-110 transition-all shadow-sm" />
                  <span className="text-[11px] font-bold text-gray-700">{m.n}</span>
                  <span className="text-[10px] font-bold text-[#8b5cf6]/60">{m.p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MOBILE VIEW (unchanged) — hidden on md+ ═══ */}
      <div className="md:hidden min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 flex flex-col max-w-md mx-auto pb-20">
        {/* Top Navigation Bar */}
        <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
          <Link href="/profile" className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {userProfilePhoto ? (
              <img src={userProfilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-600 text-lg">👤</span>
            )}
          </Link>

          {/* Tabs */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('for-you')}
              className={`relative pb-1 text-base font-medium ${activeTab === 'for-you' ? 'text-gray-900' : 'text-gray-400'
                }`}
            >
              For You
              {activeTab === 'for-you' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('nearby')}
              className={`relative pb-1 text-base font-medium ${activeTab === 'nearby' ? 'text-gray-900' : 'text-gray-400'
                }`}
            >
              Nearby
              {activeTab === 'nearby' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500"
                />
              )}
            </button>
          </div>

          {/* Flame Icon Button */}
          <button className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
            </svg>
          </button>
        </div>

        {/* Main Content - Profile Card */}
        <div className="flex-1 flex items-center justify-center px-4 py-6">
          {matches.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">💜</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Matches Found</h2>
              <p className="text-gray-600 mb-6">Check back later for new matches!</p>
              <button
                onClick={fetchMatches}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-full font-semibold"
              >
                Refresh
              </button>
            </div>
          ) : currentMatch ? (
            <motion.div
              key={currentMatch.userId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Liking Loader */}
              {isLiking && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center rounded-3xl">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-white font-semibold text-lg">Liking...</p>
                  </motion.div>
                </div>
              )}

              {/* Disliking Loader */}
              {isRejecting && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center rounded-3xl">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 text-gray-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <p className="text-white font-semibold text-lg">Disliking...</p>
                  </motion.div>
                </div>
              )}
              {/* Profile Photo */}
              <div className="relative h-[600px] bg-gradient-to-br from-gray-100 to-gray-200">
                {currentMatch.profile?.photos && currentMatch.profile.photos.length > 0 ? (
                  <img
                    src={currentMatch.profile.photos.find((p: any) => p.isPrimary)?.url || currentMatch.profile.photos[0].url}
                    alt={currentMatch.profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
                    <div className="w-32 h-32 rounded-full bg-purple-200 flex items-center justify-center">
                      <span className="text-5xl text-purple-600 font-bold">
                        {currentMatch.profile?.name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Spiritual Badge (Top Left) - Tree/Nature Icon */}
                <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-green-500 border-2 border-white flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">🌳</span>
                </div>

                {/* Match Score Badge (Top Right) */}
                {currentMatch.matchScore && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
                    <span className="text-sm font-bold text-gray-800">
                      {currentMatch.matchScore}% Match
                    </span>
                  </div>
                )}


                {/* Profile Info Overlay (Bottom Left) - Clickable */}
                <div
                  onClick={() => router.push(`/profile/${currentMatch.userId}`)}
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-12 cursor-pointer"
                >
                  <div className="text-white">
                    <h2 className="text-3xl font-bold mb-1">
                      {currentMatch.profile?.name || 'Anonymous'}
                    </h2>
                    <p className="text-base mb-2 opacity-90">
                      {currentMatch.profile?.age || 'N/A'} y.o. • {getHeight(currentMatch)} • {getDistance(currentMatch)}
                    </p>

                    {/* Audio Waveform (Optional - placeholder) */}
                    <div className="flex items-center gap-2 mt-3">
                      <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.617l3.766-3.793a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <div className="flex-1 h-2 bg-white/20 rounded-full flex items-center gap-1 px-2">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1.5 bg-white rounded-full"></div>
                        <div className="w-1 h-2 bg-white rounded-full"></div>
                        <div className="w-1 h-1.5 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons (Right Side) */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10">
                  {/* Cross/Reject Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(currentMatch.userId);
                    }}
                    className="w-14 h-14 rounded-full bg-gray-600 shadow-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Like Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(currentMatch.userId);
                    }}
                    className="w-14 h-14 rounded-full bg-red-500 shadow-lg flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
              <p className="text-gray-600">No more matches. Check back later!</p>
            </div>
          )}
        </div>

      </div>

      {/* Mutual Match Popup Overlay */}
      {mutualMatchData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-[40px] p-8 text-center shadow-2xl border border-white/40 overflow-hidden"
          >
            {/* Celebration particles/glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-b from-[#f472b6]/20 to-transparent pointer-events-none" />

            <div className="flex justify-center mb-6 relative z-10">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#f472b6] p-1 shadow-xl z-20 relative">
                  <img
                    src={mutualMatchData.profile?.photos?.find((p: any) => p.isPrimary)?.url || mutualMatchData.profile?.photos?.[0]?.url || 'https://via.placeholder.com/150'}
                    alt="Match"
                    className="w-full h-full rounded-full object-cover border-4 border-white"
                  />
                </div>

                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg z-30 animate-bounce">
                  <span className="text-2xl">💖</span>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#f472b6] mb-2 font-serif tracking-tight">
              It's a Match!
            </h2>
            <p className="text-gray-600 font-medium mb-8 text-[15px]">
              Spirituality found a match for you. Message each other!
            </p>

            <div className="flex flex-col gap-3 relative z-10">
              <button
                onClick={() => router.push(`/messages/${mutualMatchData.userId}`)}
                className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#f472b6] text-white py-4 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95"
              >
                Message Now
              </button>
              <button
                onClick={() => {
                  advanceToNext(mutualMatchData.userId);
                  setMutualMatchData(null);
                }}
                className="w-full bg-white/50 text-gray-700 py-4 rounded-full font-bold border border-gray-200 hover:bg-white hover:shadow-md transition-all active:scale-95"
              >
                Keep Swiping
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200]">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border border-white/40 flex items-center gap-3 text-white font-semibold text-sm
              ${toast.type === 'error' ? 'bg-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-green-500/80 shadow-[0_0_20px_rgba(34,197,94,0.4)]'}`}
          >
            {toast.type === 'error' ? '⚠️' : '✅'} {toast.message}
          </motion.div>
        </div>
      )}
    </ResponsiveLayout>
  );
}
