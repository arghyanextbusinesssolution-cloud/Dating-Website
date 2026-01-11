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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 flex flex-col max-w-md mx-auto pb-20">
      {/* Top Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Messages</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {conversations.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center w-full">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Matches Yet</h2>
              <p className="text-gray-600 mb-6">
                Start matching with people to begin messaging! When you both like each other, you'll be able to chat.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/matches/suggested"
                  className="block bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-full font-semibold text-center"
                >
                  Find Matches
                </Link>
                <Link
                  href="/matches/likes"
                  className="block bg-white text-purple-600 py-3 rounded-full border-2 border-purple-300 font-semibold text-center"
                >
                  See Who Liked You
                </Link>
              </div>
            </div>
          </div>
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/messages/${conv.userId}`}
                    className="block bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      {/* Profile Photo */}
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {profilePhoto ? (
                          <img
                            src={profilePhoto}
                            alt={conv.profile?.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl text-purple-600 font-bold">
                            {(conv.profile?.name || '?').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Conversation Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-base font-semibold text-gray-800 truncate">
                            {conv.profile?.name || 'Anonymous'}
                          </h3>
                          {lastMessageTime && (
                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                              {lastMessageTime}
                            </span>
                          )}
                        </div>
                        {conv.lastMessage ? (
                          <p className={`text-sm truncate ${
                            conv.unreadCount > 0 ? 'font-semibold text-gray-800' : 'text-gray-600'
                          }`}>
                            {conv.lastMessage.content}
                          </p>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                              ✨ New Match
                            </span>
                            <span className="text-sm text-gray-500 italic">Tap to start conversation</span>
                          </div>
                        )}
                      </div>

                      {/* Unread Badge */}
                      {conv.unreadCount > 0 && (
                        <div className="flex-shrink-0">
                          <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center inline-block">
                            {conv.unreadCount}
                          </span>
                        </div>
                      )}
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
