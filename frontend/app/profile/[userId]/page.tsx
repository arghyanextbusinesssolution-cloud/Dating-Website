'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/api';
import BottomNavigation from '@/components/BottomNavigation';

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && userId) {
      fetchProfile();
      fetchUserProfile();
    }
  }, [user, authLoading, router, userId]);

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

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/profiles/${userId}`);
      if (response.data.success) {
        setProfile(response.data.profile);
      }
    } catch (error: any) {
      console.error('Fetch profile error:', error);
      if (error.response?.status === 404) {
        setError('Profile not found');
      } else if (error.response?.status === 403) {
        setError('You need a subscription to view profiles');
        setTimeout(() => router.push('/plans'), 2000);
      } else {
        setError('Error loading profile');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 flex flex-col max-w-md mx-auto">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center w-full">
            <div className="text-6xl mb-4">💜</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 flex flex-col max-w-md mx-auto">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center w-full">
            <div className="text-6xl mb-4">💜</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-6">This profile could not be found.</p>
            <Link
              href="/matches/suggested"
              className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 rounded-full font-semibold"
            >
              Back to Matches
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const userProfilePhoto = userProfile?.photos?.find((p: any) => p.isPrimary)?.url || userProfile?.photos?.[0]?.url;
  const profilePhoto = profile?.photos?.find((p: any) => p.isPrimary)?.url || profile?.photos?.[0]?.url;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 flex flex-col max-w-md mx-auto pb-20">
      {/* Top Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-sm">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-800">Profile</h1>
        <div className="w-10" />
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden mb-4"
        >
          {/* Profile Photo */}
          <div className="relative h-80 bg-gradient-to-br from-purple-100 to-blue-100">
            {profilePhoto ? (
              <img src={profilePhoto} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-purple-200 flex items-center justify-center">
                  <span className="text-5xl text-purple-600 font-bold">
                    {profile.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-1">{profile.name}</h1>
            {profile.user?.email && (
              <p className="text-sm text-gray-600 mb-1">
                <a href={`mailto:${profile.user.email}`} className="text-gray-700 underline">
                  {profile.user.email}
                </a>
              </p>
            )}
            {profile.nickname && <p className="text-gray-600 mb-4">@{profile.nickname}</p>}
            {profile.age && (
              <p className="text-gray-600 mb-4">{profile.age} years old</p>
            )}

            {profile.bio && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">About</h2>
                <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {profile.relationshipIntention && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Looking For</h2>
                <span className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                  {profile.relationshipIntention.replace(/-/g, ' ')}
                </span>
              </div>
            )}

            {profile.spiritualBeliefs && profile.spiritualBeliefs.length > 0 && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Spiritual Beliefs</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.spiritualBeliefs.map((belief: string, idx: number) => (
                    <span
                      key={idx}
                      className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                    >
                      {belief.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.spiritualPractices && profile.spiritualPractices.length > 0 && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Spiritual Practices</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.spiritualPractices.map((practice: string, idx: number) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      {practice.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.lifestyleChoices && profile.lifestyleChoices.length > 0 && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Lifestyle</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.lifestyleChoices.map((choice: string, idx: number) => (
                    <span
                      key={idx}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                    >
                      {choice.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation userProfilePhoto={userProfilePhoto} />
    </div>
  );
}
