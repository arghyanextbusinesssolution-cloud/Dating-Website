'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, TrendingUp, Sparkles } from 'lucide-react';
import api from '@/lib/api';

interface MatchPair {
  _id: string;
  user1Email: string;
  user2Email: string;
  user1Liked: boolean;
  user2Liked: boolean;
  isMatch: boolean;
  matchScore: number;
  matchLabels: string[];
  matchedAt: string | null;
  createdAt: string;
}

interface MatchStats {
  totalInteractions: number;
  totalMatches: number;
  totalLikes: number;
  matchRate: string;
}

const labelColors: Record<string, string> = {
  'aligned-in-purpose': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  'aligned-in-spiritual-rhythm': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  'similar-lifestyle': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  'compatible-intent': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  'spiritual-synergy': 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
};

function Avatar({ email }: { email: string }) {
  const initials = email.slice(0, 2).toUpperCase();
  const colors = [
    'from-spiritual-violet-400 to-spiritual-violet-600',
    'from-pink-400 to-rose-500',
    'from-blue-400 to-indigo-500',
    'from-emerald-400 to-teal-500',
    'from-amber-400 to-orange-500',
  ];
  const color = colors[email.charCodeAt(0) % colors.length];
  return (
    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md`}>
      {initials}
    </div>
  );
}

export default function MatchesSection() {
  const [matches, setMatches] = useState<MatchPair[]>([]);
  const [stats, setStats] = useState<MatchStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'matched' | 'liked'>('all');

  useEffect(() => {
    api.get('/admin/matches').then(res => {
      if (res.data.success) {
        setMatches(res.data.matches);
        setStats(res.data.stats);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = matches.filter(m => {
    if (filter === 'matched') return m.isMatch;
    if (filter === 'liked') return (m.user1Liked || m.user2Liked) && !m.isMatch;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-spiritual-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Interactions', value: stats?.totalInteractions ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Total Likes', value: stats?.totalLikes ?? 0, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
          { label: 'Mutual Matches', value: stats?.totalMatches ?? 0, icon: Sparkles, color: 'text-spiritual-violet-600', bg: 'bg-spiritual-violet-50 dark:bg-spiritual-violet-900/20' },
          { label: 'Match Rate', value: `${stats?.matchRate ?? '0.0'}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-5 border border-neutral-200 dark:border-neutral-700"
          >
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'matched', label: '💞 Matched' },
          { key: 'liked', label: '❤️ Liked (Pending)' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === key
                ? 'bg-spiritual-violet-600 text-white'
                : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Match Pair Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-neutral-400 dark:text-neutral-500 gap-2">
          <Heart size={32} />
          <p>No matches found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((m, i) => (
            <motion.div
              key={m._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`bg-white dark:bg-neutral-800 rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow ${m.isMatch
                  ? 'border-spiritual-violet-300 dark:border-spiritual-violet-700'
                  : 'border-neutral-200 dark:border-neutral-700'
                }`}
            >
              {/* Pair Row */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-0.5 flex-1 min-w-0">
                  <Avatar email={m.user1Email} />
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 truncate w-full text-center">{m.user1Email}</p>
                  {m.user1Liked && (
                    <span className="text-xs text-rose-500">❤️ liked</span>
                  )}
                </div>

                {/* Center connector */}
                <div className="flex flex-col items-center flex-shrink-0">
                  {m.isMatch ? (
                    <div className="flex flex-col items-center gap-1">
                      <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-spiritual-violet-500 to-pink-500 text-white text-xs font-bold shadow">
                        💞 Match!
                      </div>
                      {m.matchScore > 0 && (
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">{m.matchScore}% compat.</span>
                      )}
                    </div>
                  ) : (
                    <div className="text-neutral-300 dark:text-neutral-600 text-lg">→</div>
                  )}
                </div>

                <div className="flex flex-col items-center gap-0.5 flex-1 min-w-0">
                  <Avatar email={m.user2Email} />
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 truncate w-full text-center">{m.user2Email}</p>
                  {m.user2Liked && (
                    <span className="text-xs text-rose-500">❤️ liked</span>
                  )}
                </div>
              </div>

              {/* Labels */}
              {m.matchLabels && m.matchLabels.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-700">
                  {m.matchLabels.map(label => (
                    <span key={label} className={`text-xs px-2 py-0.5 rounded-full font-medium ${labelColors[label] || 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'}`}>
                      {label.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              )}

              {/* Date */}
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">
                {m.isMatch && m.matchedAt
                  ? `Matched on ${new Date(m.matchedAt).toLocaleDateString()}`
                  : `Interaction: ${new Date(m.createdAt).toLocaleDateString()}`}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
