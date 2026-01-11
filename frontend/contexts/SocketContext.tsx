'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  joinConversation: (otherUserId: string) => void;
  leaveConversation: (otherUserId: string) => void;
  sendTypingIndicator: (recipientId: string, isTyping: boolean) => void;
  markMessageAsRead: (messageId: string, senderId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!user) {
      // Disconnect if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Get token from cookie or localStorage
    const token = Cookies.get('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

    if (!token) {
      console.log('⚠️ [Socket] No token found, cannot connect');
      return;
    }

    // Initialize socket connection
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const socketUrl = API_URL.replace('/api', ''); // Remove /api if present

    console.log('🔌 [Socket] Connecting to:', socketUrl);

    const newSocket = io(socketUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      reconnectionDelayMax: 5000
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ [Socket] Connected:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ [Socket] Disconnected:', reason);
      setConnected(false);

      // Attempt to reconnect if not intentional
      if (reason === 'io server disconnect') {
        // Server disconnected, reconnect manually
        newSocket.connect();
      }
    });

    newSocket.on('connected', (data) => {
      console.log('✅ [Socket] Authenticated:', data);
      setConnected(true);
    });

    newSocket.on('error', (error) => {
      console.error('❌ [Socket] Error:', error);
    });

    // Connection error
    newSocket.on('connect_error', (error) => {
      console.error('❌ [Socket] Connection error:', error.message);
      setConnected(false);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Cleanup on unmount or user change
    return () => {
      console.log('🧹 [Socket] Cleaning up connection');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setConnected(false);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user]);

  // Join a conversation room
  const joinConversation = useCallback((otherUserId: string) => {
    if (!socketRef.current || !connected || !otherUserId) return;
    
    console.log('📥 [Socket] Joining conversation with:', otherUserId);
    socketRef.current.emit('join_conversation', { otherUserId });
  }, [connected]);

  // Leave a conversation room
  const leaveConversation = useCallback((otherUserId: string) => {
    if (!socketRef.current || !otherUserId) return;
    
    console.log('📤 [Socket] Leaving conversation with:', otherUserId);
    socketRef.current.emit('leave_conversation', { otherUserId });
  }, []);

  // Send typing indicator
  const sendTypingIndicator = useCallback((recipientId: string, isTyping: boolean) => {
    if (!socketRef.current || !connected || !recipientId) return;
    
    if (isTyping) {
      socketRef.current.emit('typing_start', { recipientId });
    } else {
      socketRef.current.emit('typing_stop', { recipientId });
    }
  }, [connected]);

  // Mark message as read
  const markMessageAsRead = useCallback((messageId: string, senderId: string) => {
    if (!socketRef.current || !connected || !messageId || !senderId) return;
    
    socketRef.current.emit('message_read', { messageId, senderId });
  }, [connected]);

  const value: SocketContextType = {
    socket: socketRef.current,
    connected,
    joinConversation,
    leaveConversation,
    sendTypingIndicator,
    markMessageAsRead
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
