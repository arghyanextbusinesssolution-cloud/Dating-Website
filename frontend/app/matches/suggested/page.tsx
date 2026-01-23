'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/api';
import BottomNavigation from '@/components/BottomNavigation';

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
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'for-you' | 'nearby'>('for-you');
  const [isLiking, setIsLiking] = useState(false);

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
        router.push('/plans');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (userId: string) => {
    try {
      setIsLiking(true);
      const response = await api.post(`/matches/like/${userId}`);
      if (response.data.success) {
        if (response.data.isMutualMatch) {
          alert('🎉 It\'s a match! You can now message each other.');
          router.push(`/messages/${userId}`);
        } else {
          // Move to next match
          if (currentIndex < matches.length - 1) {
            setCurrentIndex(currentIndex + 1);
          } else {
            // No more matches, refresh
            fetchMatches();
            setCurrentIndex(0);
          }
        }
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error liking user');
    } finally {
      setIsLiking(false);
    }
  };

  const handlePass = async () => {
    // Move to next match
    if (currentIndex < matches.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // No more matches, refresh
      fetchMatches();
      setCurrentIndex(0);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      const response = await api.post(`/matches/reject/${userId}`);
      if (response.data.success) {
        // Remove from current matches and move to next
        setMatches(prevMatches => prevMatches.filter(m => m.userId !== userId));
        if (currentIndex >= matches.length - 1) {
          setCurrentIndex(Math.max(0, currentIndex - 1));
        }
      }
    } catch (error: any) {
      console.error('Reject error:', error);
      alert(error.response?.data?.message || 'Error rejecting user');
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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 flex flex-col max-w-md mx-auto pb-20">
      {/* Top Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        {/* Profile Icon */}
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
            className={`relative pb-1 text-base font-medium ${
              activeTab === 'for-you' ? 'text-gray-900' : 'text-gray-400'
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
            className={`relative pb-1 text-base font-medium ${
              activeTab === 'nearby' ? 'text-gray-900' : 'text-gray-400'
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
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white border-r-white animate-spin"></div>
                  </div>
                  <p className="text-white font-semibold text-lg">liking him ok</p>
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

      {/* Bottom Navigation */}
      <BottomNavigation userProfilePhoto={userProfilePhoto} />
    </div>
  );
}
