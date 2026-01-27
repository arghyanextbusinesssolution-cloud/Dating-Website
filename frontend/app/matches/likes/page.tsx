'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import Link from 'next/link';
import BottomNavigation from '@/components/BottomNavigation';

interface Like {
  userId: string;
  profile: any;
  likedAt: string;
}

export default function LikesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { socket, connected } = useSocket();
  const [likes, setLikes] = useState<Like[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchUserProfile();
    }
  }, [user, authLoading]);

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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      fetchLikes();
    }
  }, [user, authLoading, router]);

  // Listen for real-time match notifications
  useEffect(() => {
    if (!socket || !connected || !user) return;

    const handleNewMatch = (data: { userId: string; message: string; actionUrl: string }) => {
      console.log('🎉 [Likes] New match received:', data);
      
      // Remove from likes list (now it's a mutual match)
      setLikes(prevLikes => 
        prevLikes.filter(like => like.userId !== data.userId)
      );
      
      // Show notification and redirect to messages
      alert(data.message || '🎉 It\'s a match! You can now message each other.');
      router.push(data.actionUrl || `/messages/${data.userId}`);
    };

    socket.on('new_match', handleNewMatch);

    return () => {
      socket.off('new_match', handleNewMatch);
    };
  }, [socket, connected, user, router]);

  const fetchLikes = async () => {
    try {
      const response = await api.get('/matches/likes');
      if (response.data.success) {
        setLikes(response.data.likes);
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        setError('Standard or Premium plan required to see who liked you');
      } else {
        setError(error.response?.data?.message || 'Error fetching likes');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (userId: string | any) => {
    try {
      // Ensure userId is a string - extract _id if it's an object
      let userIdString: string;
      if (typeof userId === 'string') {
        userIdString = userId;
      } else if (userId && typeof userId === 'object' && userId._id) {
        // If it's an object with _id, extract the _id
        userIdString = typeof userId._id === 'string' ? userId._id : userId._id.toString();
      } else {
        // Fallback to toString
        userIdString = userId?.toString() || String(userId);
      }
      
      const response = await api.post(`/matches/like/${userIdString}`);
      if (response.data.success) {
        // If mutual match, redirect to messages
        if (response.data.isMutualMatch) {
          // Remove from likes list (now it's a mutual match)
          setLikes(likes.filter(like => like.userId !== userIdString));
          
          // Show success and redirect to messages
          alert('🎉 It\'s a match! You can now message each other.');
          router.push(`/messages/${userIdString}`);
        } else {
          // Remove from likes list (just liked back)
          setLikes(likes.filter(like => like.userId !== userIdString));
          alert('Like sent! Wait for them to like you back to start messaging.');
        }
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error liking user');
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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-purple-50 flex flex-col max-w-md mx-auto pb-24">
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 px-4 py-5 bg-white/40 backdrop-blur-md border-b border-purple-200"
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">❤️ Admirers</h1>
            <p className="text-sm font-medium text-purple-600 mt-1">
              {likes.length > 0 
                ? `${likes.length} ${likes.length === 1 ? 'spirit' : 'spirits'} adore you`
                : 'waiting for hearts'}
            </p>
          </div>
          {likes.length > 0 && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl"
            >
              💕
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-4 bg-gradient-to-r from-red-100/60 to-pink-100/60 backdrop-blur-md border border-red-300 text-red-700 px-4 py-3 rounded-2xl font-medium"
        >
          {error}
          {error.includes('Standard or Premium') && (
            <Link href="/plans" className="block mt-2 text-red-600 underline font-bold">
              ✨ Upgrade Now
            </Link>
          )}
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {likes.length === 0 && !error ? (
          /* Premium Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex items-center justify-center h-full min-h-[500px]"
          >
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-8 text-center w-full border border-purple-200">
              {/* Animated Heart */}
              <motion.div
                animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-7xl mb-6"
              >
                💜
              </motion.div>

              <h2 className="text-3xl font-bold text-gray-800 mb-3">Hearts Waiting</h2>
              <p className="text-gray-600 text-center mb-2">
                Build your spiritual presence and attract meaningful connections.
              </p>
              <p className="text-sm text-purple-600 font-medium mb-8">
                Each like brings you closer to your soul's match ✨
              </p>

              {/* Action Buttons */}
              <div className="space-y-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/matches/suggested"
                    className="block bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                  >
                    🔥 Browse Matches
                  </Link>
                </motion.div>
              </div>

              {/* Info Card */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 bg-gradient-to-r from-blue-100/60 to-purple-100/60 rounded-2xl p-4 border border-purple-200"
              >
                <p className="text-sm text-gray-700">
                  <span className="font-bold">💡 Insight:</span> The more you engage, the more likes you'll receive!
                </p>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          /* Premium Likes List */
          <div className="space-y-4">
            {likes.map((like, index) => {
              const profilePhoto = like.profile?.photos?.find((p: any) => p.isPrimary)?.url || like.profile?.photos?.[0]?.url;
              const likedDate = new Date(like.likedAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              });

              return (
                <motion.div
                  key={like.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/70 backdrop-blur-md rounded-2xl shadow-md hover:shadow-xl hover:bg-white transition-all border border-purple-200 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4 mb-4">
                      {/* Profile Photo */}
                      <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-300 to-pink-300 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-purple-300 shadow-md">
                          {profilePhoto ? (
                            <img
                              src={profilePhoto}
                              alt={like.profile?.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl text-white font-bold">
                              {(like.profile?.name || '?').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        {/* Heart Badge */}
                        <motion.div
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="absolute -bottom-1 -right-1 bg-red-500 text-white text-lg rounded-full w-7 h-7 flex items-center justify-center shadow-lg border-2 border-white"
                        >
                          ❤️
                        </motion.div>
                      </div>

                      {/* Profile Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-800 truncate">
                            {like.profile?.name || 'Anonymous'}
                          </h3>
                          {like.profile?.isApproved && (
                            <span className="text-lg">✅</span>
                          )}
                        </div>
                        
                        {/* Age & Location */}
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          {like.profile?.age && `${like.profile.age}`}
                          {like.profile?.location?.city && ` • ${like.profile.location.city}`}
                        </p>

                        {/* Liked Date */}
                        <div className="flex items-center gap-1 text-xs text-purple-600 font-semibold">
                          <span>💗</span>
                          <span>Liked {likedDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio Preview */}
                    {like.profile?.bio && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2 italic px-2 py-2 bg-white/40 rounded-lg border border-purple-100">
                        "{like.profile.bio}"
                      </p>
                    )}

                    {/* Spiritual Beliefs Preview */}
                    {like.profile?.spiritualBeliefs && like.profile.spiritualBeliefs.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {like.profile.spiritualBeliefs.slice(0, 2).map((belief: string, idx: number) => (
                            <motion.span
                              key={idx}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.05 }}
                              className="text-xs bg-purple-100/60 text-purple-700 px-3 py-1 rounded-full font-semibold border border-purple-200"
                            >
                              🔮 {belief.replace(/-/g, ' ')}
                            </motion.span>
                          ))}
                          {like.profile.spiritualBeliefs.length > 2 && (
                            <span className="text-xs text-gray-500 px-2 py-1">+{like.profile.spiritualBeliefs.length - 2}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleLike(like.userId)}
                        className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-pink-500/50 transition-all flex items-center justify-center gap-2"
                      >
                        <span>❤️</span>
                        <span>Like Back</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push(`/profile/${like.userId}`)}
                        className="px-4 py-3 bg-white/70 backdrop-blur-md border-2 border-purple-300 text-purple-600 rounded-xl font-bold hover:bg-white hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <span>👁️</span>
                        <span>View</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation userProfilePhoto={userProfilePhoto} />
    </div>
  );
}
