'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import ChatWindow from '@/components/ChatWindow';
import api from '@/lib/api';

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const otherUserId = params.userId as string;
  const { user, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    } else if (user) {
      fetchUserProfile();
    }
  }, [user, authLoading, router]);

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const userProfilePhoto = userProfile?.photos?.find((p: any) => p.isPrimary)?.url || userProfile?.photos?.[0]?.url;

  return (
    <ResponsiveLayout userProfilePhoto={userProfilePhoto}>
      <div className="h-screen md:h-[calc(100vh-40px)] flex flex-col pt-4">
        <ChatWindow
          otherUserId={otherUserId}
          onClose={() => router.push('/messages')}
          isEmbedded={true}
        />
      </div>
    </ResponsiveLayout>
  );
}
