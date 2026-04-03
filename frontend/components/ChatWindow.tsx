'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';

interface ChatWindowProps {
    otherUserId: string;
    onClose?: () => void;
    isEmbedded?: boolean;
}

export default function ChatWindow({ otherUserId, onClose, isEmbedded = false }: ChatWindowProps) {
    const { user } = useAuth();
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
    const processedMessageIdsRef = useRef<Set<string>>(new Set());

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (user && otherUserId) {
            setLoading(true);
            setError('');
            setMessages([]);
            processedMessageIdsRef.current.clear();
            fetchMessages();
            fetchOtherUserProfile();
        }
    }, [user, otherUserId]);

    const fetchOtherUserProfile = async () => {
        try {
            const response = await api.get(`/profiles/${otherUserId}`);
            if (response.data.success) {
                setOtherUserProfile(response.data.profile);
            }
        } catch (error) {
            console.error('Fetch other user profile error:', error);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await api.get(`/messages/conversation/${otherUserId}`);
            if (response.data.success) {
                setMessages(response.data.messages);
                response.data.messages.forEach((msg: any) => {
                    const msgId = msg._id?.toString() || msg._id;
                    if (msgId) processedMessageIdsRef.current.add(msgId);
                    if (!msg.isRead && (msg.sender._id?.toString() === otherUserId || msg.sender === otherUserId)) {
                        markMessageAsRead(msg._id, otherUserId);
                    }
                });
            }
        } catch (error: any) {
            if (error.response?.status === 403) {
                if (error.response?.data?.requiresMatch) {
                    setError('Mutual match required to chat.');
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
            if (otherUserId) leaveConversation(otherUserId);
        };
    }, [connected, user, otherUserId, joinConversation, leaveConversation]);

    useEffect(() => {
        if (!socket || !connected || !otherUserId) return;

        const handleNewMessage = (data: { message: any }) => {
            const incomingMessage = data.message;
            const senderId = incomingMessage.sender?.toString() || incomingMessage.sender;
            const recipientId = incomingMessage.recipient?.toString() || incomingMessage.recipient;
            const currentUserId = user?.id?.toString();
            const otherUserIdStr = otherUserId.toString();

            if ((senderId === otherUserIdStr && recipientId === currentUserId) ||
                (senderId === currentUserId && recipientId === otherUserIdStr)) {

                const messageId = incomingMessage._id?.toString() || incomingMessage._id;
                if (messageId && processedMessageIdsRef.current.has(messageId)) return;

                setMessages((prev) => [...prev, incomingMessage]);
                if (messageId) processedMessageIdsRef.current.add(messageId);

                if (senderId === otherUserIdStr) {
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
            if (data.userId === otherUserId) setIsTyping(data.isTyping);
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

        const content = newMessage.trim();
        setNewMessage('');
        setSending(true);

        try {
            const response = await api.post('/messages', { recipientId: otherUserId, content });
            if (response.data.success) {
                const msg = response.data.message;
                const msgId = msg._id?.toString() || msg._id;
                if (msgId && !processedMessageIdsRef.current.has(msgId)) {
                    setMessages((prev) => [...prev, msg]);
                    processedMessageIdsRef.current.add(msgId);
                }
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error sending message');
        } finally {
            setSending(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);
        sendTypingIndicator(otherUserId, e.target.value.trim().length > 0);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => sendTypingIndicator(otherUserId, false), 3000);
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-white/10 backdrop-blur-md h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    const profilePhoto = otherUserProfile?.photos?.find((p: any) => p.isPrimary)?.url || otherUserProfile?.photos?.[0]?.url;

    return (
        <div className={`flex flex-col h-full w-full ${isEmbedded ? 'bg-transparent' : 'bg-white/20 backdrop-blur-xl min-h-screen border-l border-white/20'}`}>
            {/* Header */}
            <div className="p-4 border-b border-white/20 flex items-center justify-between bg-white/40 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 overflow-hidden border-2 border-white/50 shadow-sm transition-transform hover:scale-110">
                        {profilePhoto ? <img src={profilePhoto} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full text-white font-bold">{(otherUserProfile?.name || 'S').charAt(0).toUpperCase()}</span>}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 leading-tight capitalize">{otherUserProfile?.name || 'Spirit Companion'}</h3>
                        <p className="text-[10px] text-purple-600 font-black uppercase tracking-widest">{isTyping ? 'Typing Energy...' : 'Conscious Presence'}</p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-2 hover:bg-white/40 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-white/5">
                {error ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="text-4xl mb-4">🔒</div>
                        <p className="text-gray-600 font-medium">{error}</p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, idx) => {
                            const isOwn = msg.sender?._id?.toString() === user?.id || msg.sender === user?.id || (typeof msg.sender === 'object' && msg.sender?._id?.toString() === user?.id);
                            return (
                                <motion.div
                                    key={msg._id || idx}
                                    initial={{ opacity: 0, x: isOwn ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${isOwn ? 'bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white rounded-tr-sm' : 'bg-white/60 backdrop-blur-md text-gray-800 rounded-tl-sm border border-white/40'}`}>
                                        <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] opacity-70">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {isOwn && (msg.isRead ? <span className="text-blue-200">✓✓</span> : <span>✓</span>)}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input */}
            {!error && (
                <div className="p-4 bg-white/40 border-t border-white/20 backdrop-blur-xl">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={handleInputChange}
                            placeholder="Communicate your truth..."
                            className="flex-1 bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-400 font-medium"
                        />
                        <button
                            type="submit"
                            disabled={sending || !newMessage.trim()}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-2xl shadow-lg shadow-purple-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                            <svg className="w-6 h-6" fill="fill" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
