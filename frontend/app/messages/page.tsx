'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/api';
import BottomNavigation from '@/components/BottomNavigation';

interface Conversation {
  userId: string;
  profile: any;
  lastMessage: any;
  unreadCount: number;
  matchedAt?: string | Date;
}

export default function MessagesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { socket, connected } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
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

  const fetchConversations = useCallback(async () => {
    try {
      const response = await api.get('/messages/conversations');
      if (response.data.success) {
        const formattedConversations = response.data.conversations.map((conv: any) => ({
          userId: conv.userId?.toString() || conv.userId,
          profile: conv.profile,
          lastMessage: conv.lastMessage || null,
          unreadCount: conv.unreadCount || 0,
          matchedAt: conv.matchedAt || null
        }));
        setConversations(formattedConversations);
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        router.push('/plans');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      fetchConversations();
    }
  }, [user, authLoading, router, fetchConversations]);

  useEffect(() => {
    if (!socket || !connected || !user) return;

    const handleNewMessageNotification = async (data: {
      message: any;
      conversationUpdate: boolean;
    }) => {
      if (data.conversationUpdate) {
        fetchConversations();
      }
    };

    const handleNewMatch = async (data: {
      userId: string;
      message: string;
      actionUrl: string;
    }) => {
      setTimeout(() => {
        fetchConversations();
      }, 500);
    };

    socket.on('new_message_notification', handleNewMessageNotification);
    socket.on('new_match', handleNewMatch);

    return () => {
      socket.off('new_message_notification', handleNewMessageNotification);
      socket.off('new_match', handleNewMatch);
    };
  }, [socket, connected, user, fetchConversations]);

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
        className="sticky top-0 z-50 px-4 py-4 bg-white/40 backdrop-blur-md border-b border-purple-200"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">💬 Messages</h1>
          <div className="text-sm font-semibold text-purple-600 bg-purple-100/60 px-3 py-1 rounded-full">
            {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {conversations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex items-center justify-center h-full min-h-[500px]"
          >
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-8 text-center w-full border border-purple-200">
              {/* Animated Chat Bubble Icon */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-7xl mb-6"
              >
                💜
              </motion.div>

              <h2 className="text-3xl font-bold text-gray-800 mb-3">No Connections Yet</h2>
              <p className="text-gray-600 text-center mb-2">
                Start matching with kindred spirits to begin your meaningful conversations.
              </p>
              <p className="text-sm text-purple-600 font-medium mb-8">
                When you both like each other, you'll unlock the power of connection! ✨
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
                    🔥 Find Matches
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/matches/likes"
                    className="block bg-white/70 backdrop-blur-md text-purple-600 py-4 rounded-2xl font-bold text-lg border-2 border-purple-300 hover:bg-white hover:shadow-lg transition-all"
                  >
                    ❤️ See Who Likes You
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
                  <span className="font-bold">💡 Tip:</span> Mutual likes open the door to meaningful connections and spiritual growth together!
                </p>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv, index) => {
              const profilePhoto = conv.profile?.photos?.find((p: any) => p.isPrimary)?.url || conv.profile?.photos?.[0]?.url;
              const lastMessageTime = conv.lastMessage 
                ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : conv.matchedAt
                ? new Date(conv.matchedAt).toLocaleDateString()
                : '';

              return (
                <motion.div
                  key={conv.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Link
                    href={`/messages/${conv.userId}`}
                    className="block bg-white/70 backdrop-blur-md rounded-2xl shadow-md hover:shadow-xl hover:bg-white transition-all border border-purple-200 p-4"
                  >
                    <div className="flex items-center gap-4">
                      {/* Profile Photo */}
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-300 to-pink-300 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-purple-300 shadow-md">
                          {profilePhoto ? (
                            <img
                              src={profilePhoto}
                              alt={conv.profile?.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl text-white font-bold">
                              {(conv.profile?.name || '?').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        {/* Online Indicator */}
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-md"></div>
                      </div>

                      {/* Conversation Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-base font-bold text-gray-800 truncate">
                            {conv.profile?.name || 'Anonymous'}
                          </h3>
                          {lastMessageTime && (
                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2 font-medium">
                              {lastMessageTime}
                            </span>
                          )}
                        </div>

                        {conv.lastMessage ? (
                          <div className="space-y-1">
                            <p className={`text-sm truncate ${
                              conv.unreadCount > 0 ? 'font-bold text-gray-800' : 'text-gray-600'
                            }`}>
                              {conv.lastMessage.content}
                            </p>
                            {conv.unreadCount > 0 && (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-semibold text-purple-600">
                                  {conv.unreadCount} new message{conv.unreadCount > 1 ? 's' : ''}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <motion.span
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="text-sm font-bold text-purple-600 bg-purple-100/60 px-2 py-1 rounded-full"
                            >
                              ✨ New Match
                            </motion.span>
                            <span className="text-sm text-gray-500">Start chatting!</span>
                          </div>
                        )}
                      </div>

                      {/* Arrow Indicator */}
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
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
