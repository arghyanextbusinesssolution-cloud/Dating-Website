'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/api';

interface Match {
  matchId: string;
  userId: string;
  profile: any;
  matchScore: number;
  matchLabels: string[];
  compatibility: any;
  matchedAt: string;
}

export default function MyMatchesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { socket, connected } = useSocket();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      fetchMatches();
    }
  }, [user, authLoading, router]);

  // Listen for real-time match notifications
  useEffect(() => {
    if (!socket || !connected || !user) return;

    const handleNewMatch = async (data: {
      userId: string;
      message: string;
      actionUrl: string;
    }) => {
      console.log('🎉 [My Matches] New match received:', data);
      
      // Refresh matches list to show new match
      await fetchMatches();
    };

    socket.on('new_match', handleNewMatch);

    return () => {
      socket.off('new_match', handleNewMatch);
    };
  }, [socket, connected, user]);

  const fetchMatches = async () => {
    try {
      const response = await api.get('/matches/my-matches');
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-spiritual-gradient-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spiritual-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-spiritual-gradient-light py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-spiritual-violet-700 mb-2">
              My Matches
            </h1>
            <p className="text-gray-600">
              {matches.length > 0 
                ? `${matches.length} ${matches.length === 1 ? 'match' : 'matches'} - Start chatting!`
                : 'No matches yet. Start liking people to get matches!'}
            </p>
          </div>
          <Link
            href="/messages"
            className="px-4 py-2 bg-spiritual-gradient text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Go to Messages
          </Link>
        </div>

        {/* Matches List */}
        {matches.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">💜</div>
            <h2 className="text-2xl font-bold text-spiritual-violet-700 mb-2">
              No Matches Yet
            </h2>
            <p className="text-gray-600 mb-6">
              When you both like each other, you'll appear here and can start messaging!
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/matches/suggested"
                className="px-6 py-3 bg-spiritual-gradient text-white rounded-lg font-semibold hover:opacity-90"
              >
                Find Matches
              </Link>
              <Link
                href="/matches/likes"
                className="px-6 py-3 bg-white text-spiritual-violet-700 rounded-lg border-2 border-spiritual-violet-300 font-semibold hover:bg-spiritual-violet-50"
              >
                See Who Liked You
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, index) => (
              <motion.div
                key={match.matchId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow"
              >
                {/* Profile Photo Section */}
                <div className="relative h-64 bg-spiritual-gradient-light">
                  {match.profile?.photos && match.profile.photos.length > 0 ? (
                    <img
                      src={match.profile.photos.find((p: any) => p.isPrimary)?.url || match.profile.photos[0].url}
                      alt={match.profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-spiritual-violet-200 flex items-center justify-center">
                        <span className="text-3xl text-spiritual-violet-600 font-bold">
                          {match.profile?.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Match Badge */}
                  <div className="absolute top-4 right-4 bg-spiritual-gradient rounded-full px-3 py-1 shadow-lg">
                    <span className="text-sm font-bold text-white">
                      {match.matchScore}% Match
                    </span>
                  </div>
                </div>

                {/* Profile Info Section */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-spiritual-violet-700 mb-1">
                      {match.profile?.name || 'Anonymous'}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {match.profile?.age} years old
                      {match.profile?.location?.city && ` • ${match.profile.location.city}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Matched {new Date(match.matchedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Match Labels */}
                  {match.matchLabels && match.matchLabels.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {match.matchLabels.slice(0, 2).map((label: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded"
                          >
                            {label.replace(/-/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bio Preview */}
                  {match.profile?.bio && (
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2 italic">
                      "{match.profile.bio}"
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/messages/${match.userId}`}
                      className="flex-1 bg-spiritual-gradient text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity text-center"
                    >
                      Message
                    </Link>
                    <button
                      onClick={() => {
                        // TODO: Navigate to profile view page when implemented
                        alert('Profile view coming soon!');
                      }}
                      className="px-4 py-3 border-2 border-spiritual-violet-300 text-spiritual-violet-700 rounded-lg font-semibold hover:bg-spiritual-violet-50 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
