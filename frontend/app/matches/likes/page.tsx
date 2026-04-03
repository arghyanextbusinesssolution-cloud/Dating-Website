'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import Link from 'next/link';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface Like {
  userId: string;
  profile: any;
  likedAt: string;
}

export default function LikesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showUpgradeModal } = useSubscription();
  const isBasic = user?.role === 'basic';
  const { socket, connected } = useSocket();
  const [likes, setLikes] = useState<Like[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const listRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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
      if (isBasic) {
        console.log(`[LikesPage] Unauthorized access attempt by ${user.role} user. Showing upgrade modal.`);
        showUpgradeModal();
        return;
      }
      console.log(`[LikesPage] Access granted for ${user.role} user.`);
      fetchLikes();
    }
  }, [user, authLoading, router, isBasic, showUpgradeModal]);

  // Listen for real-time match notifications
  useEffect(() => {
    if (!socket || !connected || !user) return;

    const handleNewMatch = (data: { userId: string; message: string; actionUrl: string }) => {
      console.log('🎉 [Likes] New match received:', data);

      // Remove from likes list (now it's a mutual match)
      setLikes(prevLikes => {
        const updated = prevLikes.filter(like => like.userId !== data.userId);
        if (selectedUserId === data.userId) {
          setSelectedUserId(updated.length > 0 ? updated[0].userId : null);
        }
        return updated;
      });

      // Show notification and redirect to messages
      alert(data.message || '🎉 It\'s a match! You can now message each other.');
      router.push(data.actionUrl || `/messages/${data.userId}`);
    };

    socket.on('new_match', handleNewMatch);

    return () => {
      socket.off('new_match', handleNewMatch);
    };
  }, [socket, connected, user, router, selectedUserId]);

  const fetchLikes = async () => {
    try {
      const response = await api.get('/matches/likes');
      if (response.data.success) {
        setLikes(response.data.likes);
        if (response.data.likes.length > 0) {
          setSelectedUserId(response.data.likes[0].userId);
        }
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
      let userIdString: string;
      if (typeof userId === 'string') {
        userIdString = userId;
      } else if (userId && typeof userId === 'object' && userId._id) {
        userIdString = typeof userId._id === 'string' ? userId._id : userId._id.toString();
      } else {
        userIdString = userId?.toString() || String(userId);
      }

      const response = await api.post(`/matches/like/${userIdString}`);
      if (response.data.success) {
        const updatedLikes = likes.filter(like => like.userId !== userIdString);
        setLikes(updatedLikes);
        if (selectedUserId === userIdString) {
          setSelectedUserId(updatedLikes.length > 0 ? updatedLikes[0].userId : null);
        }

        if (response.data.isMutualMatch) {
          alert('🎉 It\'s a match! You can now message each other.');
          router.push(`/messages/${userIdString}`);
        } else {
          alert('Like sent! Wait for them to like you back to start messaging.');
        }
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error liking user');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const userProfilePhoto = userProfile?.photos?.find((p: any) => p.isPrimary)?.url || userProfile?.photos?.[0]?.url;
  const selectedLike = likes.find(l => l.userId === selectedUserId);

  return (
    <ResponsiveLayout userProfilePhoto={userProfilePhoto}>
      {/* ═══ DESKTOP VIEW (70/30 Layout) — hidden on mobile ═══ */}
      <div className="hidden md:flex h-[calc(100vh-100px)] overflow-hidden gap-10 px-12 py-8 relative z-10">

        {/* MASTER: Admirers (Left Side - 70%) */}
        <section className="flex-[7] flex flex-col min-w-0">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-3">
                <span>❤️</span> Admirers
              </h1>
              <p className="text-[#8b5cf6]/80 font-bold text-sm mt-1 ml-9">
                {likes.length > 0 ? `${likes.length} spirits find you radiant` : 'waiting for a spark'}
              </p>
            </div>
            {likes.length > 0 && (
              <div className="bg-white/40 backdrop-blur-md px-4 py-1.5 rounded-xl border border-white/20 text-xs font-black text-[#8b5cf6]">
                TOP CONNECTION RATE 🔥
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
            {likes.length === 0 && !error ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto py-8">
                <div className="text-7xl mb-6 animate-bounce-slow">💜</div>
                <h2 className="text-xl font-black text-gray-800 mb-3">The Universe Awaits</h2>
                <p className="text-gray-500 font-bold text-sm leading-relaxed mb-6">
                  Your energy is ready to be discovered. Build your presence and let the souls find their way to you.
                </p>
                <Link href="/matches/suggested" className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white py-4 rounded-2xl font-black text-base shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center">
                  ✨ Browse Matches
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
                {likes.map((like) => {
                  const isSelected = selectedUserId === like.userId;
                  const profilePhoto = like.profile?.photos?.find((p: any) => p.isPrimary)?.url || like.profile?.photos?.[0]?.url;

                  return (
                    <motion.div
                      key={like.userId}
                      ref={(el) => { if (el) listRefs.current[like.userId] = el; }}
                      layoutId={`admirer-${like.userId}`}
                      onClick={() => setSelectedUserId(like.userId)}
                      className={`p-6 rounded-[32px] cursor-pointer transition-all border-2 flex items-center gap-6 group relative ${isSelected
                        ? 'bg-white border-[#8b5cf6] shadow-xl scale-[1.02]'
                        : 'bg-white/40 border-transparent hover:bg-white/60 hover:scale-[1.01]'
                        }`}
                    >
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-md shrink-0 relative">
                        {profilePhoto ? (
                          <img src={profilePhoto} className="w-full h-full object-cover" alt={like.profile?.name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-black text-3xl text-purple-400 bg-purple-100">
                            {(like.profile?.name || '?').charAt(0)}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-black text-gray-800 text-xl truncate">
                            {like.profile?.name || 'Anonymous'}, {like.profile?.age}
                          </h4>
                        </div>
                        <p className="text-[14px] text-[#8b5cf6] font-black uppercase tracking-wider mb-2">
                          {like.profile?.location?.city || 'Kolkata'}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                            {new Date(like.likedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <motion.div
                          layoutId="selection-bubble"
                          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#8b5cf6] rounded-full border-4 border-white shadow-lg flex items-center justify-center"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* DETAIL: Profile Detail (Right Side - 30%) with Pinpoint Edge */}
        <aside className="flex-[3] relative min-w-[320px]">
          <AnimatePresence mode="wait">
            {!selectedLike ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full bg-white/20 backdrop-blur-xl rounded-[40px] border border-white/20 flex flex-col items-center justify-center p-10 text-center"
              >
                <div className="text-5xl mb-4 opacity-30">✨</div>
                <h3 className="text-sm font-black text-gray-400 leading-tight uppercase tracking-widest">Pick a soul to explore their energy</h3>
              </motion.div>
            ) : (
              <motion.div
                key={selectedUserId}
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                transition={{ duration: 0.4, ease: "backOut" }}
                className="h-full flex flex-col bg-white/60 backdrop-blur-2xl rounded-[40px] border-2 border-white shadow-2xl relative"
              >
                {/* Pinpoint Edge (Arrow pointing left) */}
                <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[16px] border-t-transparent border-b-[16px] border-b-transparent"
                  style={{ borderRightWidth: '16px', borderRightStyle: 'solid', borderRightColor: 'white' }}
                />

                {/* Profile Header Image */}
                <div className="relative h-64 shrink-0 rounded-t-[40px] overflow-hidden border-b-4 border-white">
                  <img
                    src={selectedLike.profile?.photos?.find((p: any) => p.isPrimary)?.url || selectedLike.profile?.photos?.[0]?.url}
                    className="w-full h-full object-cover"
                    alt={selectedLike.profile?.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h2 className="text-3xl font-black text-white drop-shadow-lg">{selectedLike.profile?.name}, {selectedLike.profile?.age}</h2>
                    <p className="text-white/80 font-bold text-sm">📍 {selectedLike.profile?.location?.city || 'Nearby'}</p>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar space-y-8">
                  {/* Bio Section */}
                  <section>
                    <h3 className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-[0.2em] mb-3">Vibe & Bio</h3>
                    <p className="text-gray-600 font-medium leading-relaxed italic text-[15px]">
                      "{selectedLike.profile?.bio || 'Ready to share my spiritual journey...'}"
                    </p>
                  </section>

                  {/* spiritualBeliefs Section */}
                  <section>
                    <h3 className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-[0.2em] mb-4">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedLike.profile?.spiritualBeliefs?.map((belief: string) => (
                        <span key={belief} className="px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-[12px] font-black text-gray-700 shadow-sm">
                          ✨ {belief.replace(/-/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </section>

                  {/* Compatibility Snapshot */}
                  <section className="bg-gray-50/50 rounded-3xl p-6 border border-white shadow-inner">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Compatibility</h3>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-purple-200">
                        88%
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-gray-700 mb-1">High Resonance</p>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '88%' }}
                            className="h-full bg-[#8b5cf6]"
                          />
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Action Footer */}
                <div className="p-6 bg-white/40 border-t border-white flex flex-col gap-3">
                  <button
                    onClick={() => handleLike(selectedLike.userId)}
                    className="w-full bg-[#8346f0] text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    ❤️ Like Back
                  </button>
                  <button
                    onClick={() => router.push(`/messages/${selectedLike.userId}`)}
                    className="w-full bg-white text-[#8346f0] py-3 rounded-2xl font-black text-sm border-2 border-[#8346f0]/10 hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
                  >
                    💬 Message
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>

      {/* ═══ MOBILE VIEW ═══ */}
      <div className="md:hidden min-h-screen bg-transparent flex flex-col max-w-md mx-auto pb-24 relative z-10">
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
              <button onClick={() => showUpgradeModal()} className="block mt-2 text-red-600 underline font-bold">
                ✨ Upgrade Now
              </button>
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
                <div className="space-y-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/matches/suggested"
                      className="block bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all font-black flex items-center justify-center"
                    >
                      🔥 Browse Matches
                    </Link>
                  </motion.div>
                </div>
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
                        <div className="relative">
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-300 to-pink-300 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-purple-300 shadow-md">
                            {profilePhoto ? (
                              <img src={profilePhoto} alt={like.profile?.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-3xl text-white font-bold">{(like.profile?.name || '?').charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <motion.div
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute -bottom-1 -right-1 bg-red-500 text-white text-lg rounded-full w-7 h-7 flex items-center justify-center shadow-lg border-2 border-white"
                          >
                            ❤️
                          </motion.div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-800 truncate">{like.profile?.name || 'Anonymous'}</h3>
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            {like.profile?.age && `${like.profile.age}`} • {like.profile?.location?.city || 'Nearby'}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-purple-600 font-semibold">
                            <span>💗</span><span>Liked {likedDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          onClick={() => handleLike(like.userId)}
                          className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-pink-500/50 transition-all flex items-center justify-center gap-2"
                        >
                          <span>❤️</span><span>Like Back</span>
                        </motion.button>
                        <motion.button
                          onClick={() => router.push(`/profile/${like.userId}`)}
                          className="px-4 py-3 bg-white/70 backdrop-blur-md border-2 border-purple-300 text-purple-600 rounded-xl font-bold hover:bg-white hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          👁️
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
}
