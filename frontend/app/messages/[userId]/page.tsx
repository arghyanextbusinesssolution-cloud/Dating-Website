'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { motion } from 'framer-motion';
import api from '@/lib/api';

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const otherUserId = params.userId as string;
  const { user, loading: authLoading } = useAuth();
  const { socket, connected, joinConversation, leaveConversation, sendTypingIndicator, markMessageAsRead } = useSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string>('');
  const [otherUserProfile, setOtherUserProfile] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingMessagesRef = useRef<Map<string, { content: string; timestamp: Date }>>(new Map());
  const processedMessageIdsRef = useRef<Set<string>>(new Set());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && otherUserId) {
      fetchMessages();
      fetchOtherUserProfile();
    }
  }, [user, authLoading, router, otherUserId]);

  const fetchOtherUserProfile = async () => {
    try {
      const response = await api.get(`/profiles/${otherUserId}`);
      if (response.data.success) {
        setOtherUserProfile(response.data.profile);
      }
    } catch (error) {
      // Profile might not be available, that's okay
      console.error('Fetch other user profile error:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/conversation/${otherUserId}`);
      if (response.data.success) {
        setMessages(response.data.messages);
        
        const loadedIds = new Set<string>();
        response.data.messages.forEach((msg: any) => {
          const msgId = msg._id?.toString() || msg._id;
          if (msgId) {
            loadedIds.add(msgId);
            processedMessageIdsRef.current.add(msgId);
          }
          
          if (!msg.isRead && (msg.sender._id?.toString() === otherUserId || msg.sender === otherUserId)) {
            markMessageAsRead(msg._id, otherUserId);
          }
        });
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        if (error.response?.data?.requiresMatch) {
          setError('You must match with this user before messaging. Both users need to like each other.');
          setTimeout(() => {
            router.push('/matches/likes');
          }, 3000);
        } else if (error.response?.data?.requiresUpgrade) {
          router.push('/plans');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected && user && otherUserId) {
      joinConversation(otherUserId);
    }

    return () => {
      if (otherUserId) {
        leaveConversation(otherUserId);
      }
    };
  }, [connected, user, otherUserId, joinConversation, leaveConversation]);

  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewMessage = (data: { message: any }) => {
      const incomingMessage = data.message;
      const senderId = incomingMessage.sender?.toString() || incomingMessage.sender;
      const recipientId = incomingMessage.recipient?.toString() || incomingMessage.recipient;
      
      if (!user?.id || !otherUserId) return;
      
      const currentUserId = user.id.toString();
      const otherUserIdStr = otherUserId.toString();
      
      if (
        (senderId === otherUserIdStr && recipientId === currentUserId) ||
        (senderId === currentUserId && recipientId === otherUserIdStr)
      ) {
        const messageId = incomingMessage._id?.toString() || incomingMessage._id;
        const content = incomingMessage.content?.toString().trim();
        
        if (messageId && processedMessageIdsRef.current.has(messageId)) {
          return;
        }
        
        setMessages((prevMessages) => {
          const existsById = prevMessages.some((msg) => {
            const msgId = msg._id?.toString() || msg._id;
            if (msgId && msgId === messageId && !msgId.toString().startsWith('temp-')) {
              return true;
            }
            return false;
          });
          
          if (existsById) {
            if (messageId) {
              processedMessageIdsRef.current.add(messageId);
            }
            return prevMessages;
          }
          
          if (senderId === currentUserId) {
            const timestamp = incomingMessage.createdAt ? new Date(incomingMessage.createdAt).getTime() : Date.now();
            
            let foundTempToReplace = false;
            const updatedMessages = prevMessages.map((msg) => {
              const msgId = msg._id?.toString() || msg._id;
              
              if (msgId && msgId.toString().startsWith('temp-')) {
                const msgContent = (msg.content?.toString() || '').trim();
                const msgTime = msg.createdAt ? new Date(msg.createdAt).getTime() : 0;
                
                if (msgContent === content && Math.abs(msgTime - timestamp) < 10000 && !foundTempToReplace) {
                  foundTempToReplace = true;
                  
                  if (messageId) {
                    processedMessageIdsRef.current.add(messageId);
                  }
                  
                  return {
                    ...incomingMessage,
                    _id: messageId,
                    sender: { _id: senderId },
                    recipient: { _id: recipientId },
                    createdAt: incomingMessage.createdAt || new Date(),
                    isRead: incomingMessage.isRead || false
                  };
                }
              }
              return msg;
            });
            
            if (foundTempToReplace) {
              if (messageId) {
                processedMessageIdsRef.current.add(messageId);
              }
              
              return updatedMessages.filter((msg) => {
                const msgId = msg._id?.toString() || msg._id;
                if (msgId === messageId) return true;
                if (msgId && msgId.toString().startsWith('temp-')) {
                  const msgContent = (msg.content?.toString() || '').trim();
                  return msgContent !== content;
                }
                return true;
              });
            }
          }
          
          const formattedMessage = {
            ...incomingMessage,
            _id: messageId,
            sender: { _id: senderId },
            recipient: { _id: recipientId },
            createdAt: incomingMessage.createdAt || new Date(),
            isRead: incomingMessage.isRead || false
          };
          
          if (messageId) {
            processedMessageIdsRef.current.add(messageId);
          }
          
          return [...prevMessages, formattedMessage];
        });

        if (senderId === otherUserIdStr) {
          const messageId = incomingMessage._id?.toString() || incomingMessage._id;
          markMessageAsRead(messageId, otherUserIdStr);
        }
      }
    };

    const handleMessageReadStatus = (data: { messageId: string; readAt: Date }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, isRead: true, readAt: data.readAt }
            : msg
        )
      );
    };

    const handleUserTyping = (data: { userId: string; isTyping: boolean }) => {
      if (data.userId === otherUserId) {
        setIsTyping(data.isTyping);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_read_status', handleMessageReadStatus);
    socket.on('user_typing', handleUserTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_read_status', handleMessageReadStatus);
      socket.off('user_typing', handleUserTyping);
    };
  }, [socket, connected, otherUserId, user?.id, markMessageAsRead]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || error || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);
    
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const tempTimestamp = new Date();
    
    pendingMessagesRef.current.set(tempId, {
      content: messageContent,
      timestamp: tempTimestamp
    });
    
    const optimisticMessage = {
      _id: tempId,
      content: messageContent,
      sender: { _id: user?.id, email: user?.email },
      recipient: { _id: otherUserId },
      createdAt: tempTimestamp,
      isRead: false
    };
    
    setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
    
    sendTypingIndicator(otherUserId, false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    try {
      const response = await api.post('/messages', {
        recipientId: otherUserId,
        content: messageContent,
      });
      
      if (response.data.success) {
        const realMessage = response.data.message;
        const realMessageId = realMessage?._id?.toString() || realMessage?._id;
        
        if (realMessageId && realMessageId !== tempId) {
          if (processedMessageIdsRef.current.has(realMessageId)) {
            setMessages((prevMessages) => 
              prevMessages.filter(msg => msg._id !== tempId)
            );
            pendingMessagesRef.current.delete(tempId);
          } else {
            processedMessageIdsRef.current.add(realMessageId);
            
            setMessages((prevMessages) => {
              const tempExists = prevMessages.some(msg => msg._id === tempId);
              
              if (!tempExists) {
                return prevMessages;
              }
              
              return prevMessages.map((msg) => {
                if (msg._id === tempId) {
                  return {
                    ...realMessage,
                    _id: realMessageId,
                    sender: { _id: user?.id, email: user?.email },
                    recipient: { _id: otherUserId },
                    createdAt: realMessage.createdAt || new Date(),
                    isRead: realMessage.isRead || false
                  };
                }
                return msg;
              });
            });
            pendingMessagesRef.current.delete(tempId);
          }
        } else {
          setTimeout(() => {
            pendingMessagesRef.current.delete(tempId);
          }, 5000);
        }
      } else {
        setMessages((prevMessages) => 
          prevMessages.filter(msg => msg._id !== tempId)
        );
        setNewMessage(messageContent);
        pendingMessagesRef.current.delete(tempId);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error sending message';
      
      setMessages((prevMessages) => 
        prevMessages.filter(msg => msg._id !== tempId)
      );
      setNewMessage(messageContent);
      pendingMessagesRef.current.delete(tempId);
      
      alert(errorMessage);
      
      if (error.response?.data?.message?.includes('match') || error.response?.status === 403) {
        setError('You must match with this user before messaging. Both users need to like each other.');
      }
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (e.target.value.trim()) {
      sendTypingIndicator(otherUserId, true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(otherUserId, false);
      }, 3000);
    } else {
      sendTypingIndicator(otherUserId, false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const profilePhoto = otherUserProfile?.photos?.find((p: any) => p.isPrimary)?.url || otherUserProfile?.photos?.[0]?.url;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 flex flex-col max-w-md mx-auto">
      {/* Top Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3 shadow-sm flex items-center gap-3">
        <button
          onClick={() => router.push('/messages')}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {profilePhoto && (
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            <img src={profilePhoto} alt={otherUserProfile?.name} className="w-full h-full object-cover" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-gray-800 truncate">
            {otherUserProfile?.name || 'Conversation'}
          </h1>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 m-4 rounded-xl">
          <p className="font-semibold mb-1">⚠️ Cannot Start Conversation</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => router.push('/matches/likes')}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm"
          >
            Go to Likes
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && !error && !loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              It's a Match!
            </h3>
            <p className="text-gray-600 mb-4 max-w-xs">
              You and this person liked each other. Start the conversation with a meaningful message!
            </p>
            <p className="text-sm text-gray-400 italic">
              Break the ice with something genuine and spiritual
            </p>
          </div>
        ) : (
          <>
            {(() => {
              const seenIds = new Set<string>();
              const deduplicatedMessages = messages.filter((message) => {
                const messageId = message._id?.toString() || message._id;
                
                if (!messageId || messageId.toString().startsWith('temp-')) {
                  return true;
                }
                
                if (seenIds.has(messageId)) {
                  return false;
                }
                
                seenIds.add(messageId);
                return true;
              });
              
              return deduplicatedMessages.map((message, index) => {
                const isOwn = message.sender?._id?.toString() === user?.id || 
                              message.sender === user?.id || 
                              (typeof message.sender === 'object' && message.sender?._id?.toString() === user?.id);
                
                const messageId = message._id?.toString() || message._id;
                const uniqueKey = messageId || `temp-${index}-${message.createdAt?.getTime() || Date.now()}`;
              
                return (
                  <motion.div
                    key={uniqueKey}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.02, 0.2) }}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                        isOwn
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-tr-sm'
                          : 'bg-white text-gray-800 shadow-sm rounded-tl-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p
                        className={`text-xs mt-1.5 ${
                          isOwn ? 'text-white/70' : 'text-gray-400'
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isOwn && message.isRead && (
                          <span className="ml-1.5">✓✓</span>
                        )}
                      </p>
                    </div>
                  </motion.div>
                );
              });
            })()}
          </>
        )}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 max-w-[75%] px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!error && (
        <form onSubmit={handleSend} className="bg-white/80 backdrop-blur-md px-4 py-3 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              disabled={!connected || error.length > 0}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim() || error.length > 0}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-5 py-2.5 rounded-full font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
