'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/api';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import { useSubscription } from '@/contexts/SubscriptionContext';

import ChatWindow from '@/components/ChatWindow';

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
  const { showUpgradeModal } = useSubscription();
  const isBasic = user?.role === 'basic';
  const { socket, connected } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const autoSelectAttempted = useRef(false);

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

        // Auto-select first chat on desktop if none selected (only once)
        if (formattedConversations.length > 0 && !selectedUserId && !autoSelectAttempted.current && typeof window !== 'undefined' && window.innerWidth >= 768) {
          setSelectedUserId(formattedConversations[0].userId);
          autoSelectAttempted.current = true;
        }
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        showUpgradeModal();
      }
    } finally {
      setLoading(false);
    }
  }, [router, selectedUserId]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      if (isBasic) {
        console.log(`[MessagesPage] Unauthorized access attempt by ${user.role} user. Showing upgrade modal.`);
        showUpgradeModal();
        return;
      }
      console.log(`[MessagesPage] Access granted for ${user.role} user.`);
      fetchConversations();
    }
  }, [user, authLoading, router, fetchConversations, isBasic, showUpgradeModal]);

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
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const userProfilePhoto = userProfile?.photos?.find((p: any) => p.isPrimary)?.url || userProfile?.photos?.[0]?.url;

  return (
    <ResponsiveLayout userProfilePhoto={userProfilePhoto}>
      <div className="h-[calc(100vh-64px)] md:h-[calc(100vh-100px)] flex flex-col md:flex-row w-full mx-auto md:p-4 gap-4 overflow-hidden relative z-10">
        {/* Left Panel: Conversations List */}
        <section className={`flex-none md:w-[400px] flex flex-col bg-white/30 backdrop-blur-xl rounded-[40px] border border-white/40 overflow-hidden shadow-2xl ${selectedUserId ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="p-6 md:p-5 border-b border-white/20 bg-white/40 backdrop-blur-md">
            <h1 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-3">
              <span>💬</span> Messages
              <span className="text-xs bg-purple-500/20 text-purple-600 px-2.5 py-1 rounded-full border border-purple-400/30 ml-auto">
                {conversations.length} Active
              </span>
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {conversations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="text-6xl mb-4 grayscale opacity-30">💜</div>
                <h2 className="text-xl font-black text-gray-400 uppercase tracking-widest">No Connections</h2>
              </div>
            ) : (
              conversations.map((conv, index) => {
                const isSelected = selectedUserId === conv.userId;
                const profilePhoto = conv.profile?.photos?.find((p: any) => p.isPrimary)?.url || conv.profile?.photos?.[0]?.url;
                const lastMessageTime = conv.lastMessage
                  ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '';

                return (
                  <motion.div
                    key={conv.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        router.push(`/messages/${conv.userId}`);
                      } else {
                        setSelectedUserId(conv.userId);
                      }
                    }}
                    className={`p-4 rounded-[28px] cursor-pointer transition-all border-2 flex items-center gap-4 group relative ${isSelected
                      ? 'bg-gradient-to-r from-purple-500/80 to-blue-500/80 border-transparent shadow-lg text-white'
                      : 'bg-white/40 border-white/20 hover:bg-white/60 text-gray-800'
                      }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-purple-300 to-pink-300 flex items-center justify-center overflow-hidden border-2 ${isSelected ? 'border-white/50' : 'border-purple-200'}`}>
                        {profilePhoto ? (
                          <img src={profilePhoto} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl text-white font-bold">{conv.profile?.name?.charAt(0)}</span>
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <h3 className="font-black text-sm truncate uppercase tracking-wide">
                          {conv.profile?.name || 'Anonymous'}
                        </h3>
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                          {lastMessageTime}
                        </span>
                      </div>
                      <p className={`text-xs truncate ${isSelected ? 'text-white/80' : 'text-gray-500'} ${conv.unreadCount > 0 ? 'font-bold' : ''}`}>
                        {conv.lastMessage?.content || 'Start a soul session...'}
                      </p>
                    </div>

                    {conv.unreadCount > 0 && (
                      <div className="absolute right-4 bottom-4 w-5 h-5 bg-pink-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        {conv.unreadCount}
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </section>

        {/* Right Panel: Chat Window (Desktop) */}
        <section className={`flex-1 flex bg-white/30 backdrop-blur-xl rounded-[40px] border border-white/40 overflow-hidden shadow-2xl relative ${!selectedUserId ? 'hidden md:flex' : 'flex'}`}>
          {selectedUserId ? (
            <ChatWindow
              otherUserId={selectedUserId}
              onClose={() => setSelectedUserId(null)}
              isEmbedded={true}
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center text-center p-12 space-y-6">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-8xl"
              >
                ✨
              </motion.div>
              <div className="max-w-xs">
                <h3 className="text-xl font-black text-gray-800 mb-2 uppercase tracking-[0.2em]">Select a Soul</h3>
                <p className="text-gray-500 font-bold text-sm leading-relaxed">
                  Choose a companion from the list to begin your deep vibrational exchange.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </ResponsiveLayout>
  );
}
