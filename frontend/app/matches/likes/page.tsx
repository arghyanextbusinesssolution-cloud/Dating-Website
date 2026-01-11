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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 flex flex-col max-w-md mx-auto">
      {/* Top Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">People Who Liked You</h1>
        <p className="text-sm text-gray-600 mt-1">
          {likes.length > 0 
            ? `${likes.length} ${likes.length === 1 ? 'person' : 'people'} liked your profile`
            : 'No likes yet'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
          {error.includes('Standard or Premium') && (
            <Link href="/plans" className="block mt-2 text-red-600 underline font-semibold">
              Upgrade Now
            </Link>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {likes.length === 0 && !error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center w-full">
              <div className="text-6xl mb-4">💜</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Likes Yet</h2>
              <p className="text-gray-600 mb-6">
                Complete your profile and start browsing to get more likes!
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/profile"
                  className="block bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-full font-semibold text-center"
                >
                  Complete Profile
                </Link>
                <Link
                  href="/matches/suggested"
                  className="block bg-white text-purple-600 py-3 rounded-full border-2 border-purple-300 font-semibold text-center"
                >
                  Browse Matches
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {likes.map((like, index) => {
              const profilePhoto = like.profile?.photos?.find((p: any) => p.isPrimary)?.url || like.profile?.photos?.[0]?.url;
              const likedDate = new Date(like.likedAt).toLocaleDateString();

              return (
                <motion.div
                  key={like.userId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-4">
                      {/* Profile Photo */}
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {profilePhoto ? (
                          <img
                            src={profilePhoto}
                            alt={like.profile?.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl text-purple-600 font-bold">
                            {(like.profile?.name || '?').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Profile Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-800 truncate">
                            {like.profile?.name || 'Anonymous'}
                          </h3>
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                            ❤️ Liked You
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {like.profile?.age && `${like.profile.age} years old`}
                          {like.profile?.location?.city && ` • ${like.profile.location.city}`}
                        </p>
                        <p className="text-xs text-gray-400">
                          Liked {likedDate}
                        </p>
                      </div>
                    </div>

                    {/* Bio Preview */}
                    {like.profile?.bio && (
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2 italic px-1">
                        "{like.profile.bio}"
                      </p>
                    )}

                    {/* Spiritual Beliefs Preview */}
                    {like.profile?.spiritualBeliefs && like.profile.spiritualBeliefs.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {like.profile.spiritualBeliefs.slice(0, 3).map((belief: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                            >
                              {belief.replace(/-/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLike(like.userId)}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
                      >
                        Like Back
                      </button>
                      <button
                        onClick={() => {
                          // Navigate to profile or show profile modal
                          alert('Profile view coming soon!');
                        }}
                        className="px-4 py-3 bg-white border-2 border-purple-300 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
                      >
                        View
                      </button>
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
