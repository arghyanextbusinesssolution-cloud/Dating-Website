'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ResponsiveLayout from '@/components/ResponsiveLayout';

export default function EventDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchEvent();
      fetchUserProfile();
    }
  }, [id, user]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/profiles/me');
      if (response.data.success) {
        setUserProfile(response.data.profile);
      }
    } catch (error) {
      console.error('Fetch profile photo error:', error);
    }
  };

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      if (res.data.success) {
        setEvent(res.data.event);
        setRegistrations(res.data.registrations || []);
        // Check if user is registered
        if (user && res.data.registrations) {
          const userRegistered = res.data.registrations.some((r: any) => r.user._id === user.id);
          setIsUserRegistered(userRegistered);
        }
      }
    } catch (err) {
      console.error('Fetch event', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) return router.push('/auth/login');
    try {
      setRegistering(true);
      const res = await api.post(`/events/${id}/register`);
      if (res.data.success) {
        fetchEvent();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error registering');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel your registration for this spiritual gathering?')) return;
    try {
      setCancelling(true);
      const res = await api.delete(`/events/${id}/register`);
      if (res.data.success) {
        fetchEvent();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error cancelling registration');
    } finally {
      setCancelling(false);
    }
  };

  const googleCalendarLink = (evt: any) => {
    if (!evt) return '#';
    const start = new Date(evt.startDate).toISOString().replace(/[-:]|\.\d{3}/g, '');
    const end = evt.endDate ? new Date(evt.endDate).toISOString().replace(/[-:]|\.\d{3}/g, '') : '';
    const dates = end ? `${start}/${end}` : `${start}`;
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: evt.title,
      dates: dates,
      details: evt.description || '',
      location: evt.location || ''
    });
    return `https://www.google.com/calendar/render?${params.toString()}`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8b5cf6]" />
      </div>
    );
  }

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center bg-white/40 backdrop-blur-xl p-10 rounded-[40px] border border-white/60">
        <span className="text-4xl mb-4 block">🕯️</span>
        <h2 className="text-xl font-black text-gray-900">Event not found</h2>
        <button onClick={() => router.back()} className="mt-4 text-[#8b5cf6] font-bold">Return to Events</button>
      </div>
    </div>
  );

  const isEventPassed = new Date() > new Date(event.startDate);
  const userProfilePhoto = userProfile?.photos?.find((p: any) => p.isPrimary)?.url || userProfile?.photos?.[0]?.url;

  return (
    <ResponsiveLayout userProfilePhoto={userProfilePhoto}>
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Navigation Header */}
        <div className="flex items-center gap-6 mb-10">
          <button
            onClick={() => router.back()}
            className="w-12 h-12 rounded-[20px] bg-white/40 backdrop-blur-xl border border-white/60 shadow-sm flex items-center justify-center hover:bg-white/60 transition-all group active:scale-95"
          >
            <svg className="w-5 h-5 text-gray-800 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-sm font-black text-[#8b5cf6] uppercase tracking-[0.2em] mb-1">Event Details</h1>
            <p className="text-gray-900 text-3xl font-black tracking-tight">{event.title}</p>
          </div>
        </div>

        {/* Main Event Card */}
        <div className="bg-white/40 backdrop-blur-2xl rounded-[48px] border border-white/70 overflow-hidden shadow-2xl relative">
          {/* Hero Image Section */}
          <div className="w-full h-96 relative group">
            {event.image ? (
              <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-50 flex items-center justify-center">
                <span className="text-8xl drop-shadow-2xl">✨</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            {/* Joined Overlay */}
            {isUserRegistered && (
              <div className="absolute top-8 right-8 z-10">
                <span className="bg-[#10b981] text-white text-[11px] px-6 py-2.5 rounded-full font-black uppercase tracking-widest shadow-2xl shadow-green-500/30 animate-pulse border border-white/20">
                  ✓ Joined Gathering
                </span>
              </div>
            )}
          </div>

          <div className="p-10 md:p-14">
            {/* Info Grid */}
            <div className="flex flex-wrap gap-8 mb-12">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6] border border-[#8b5cf6]/20 shadow-inner">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">When</p>
                  <p className="text-gray-900 font-bold text-lg">{new Date(event.startDate).toLocaleString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              {event.location && (
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 border border-blue-500/20 shadow-inner">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Where</p>
                    <p className="text-gray-900 font-bold text-lg">{event.location}</p>
                  </div>
                </div>
              )}

              {event.capacity && (
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 border border-orange-500/20 shadow-inner">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Capacity</p>
                    <p className="text-gray-900 font-bold text-lg">{registrations.length} / {event.capacity} souls</p>
                  </div>
                </div>
              )}
            </div>

            <div className="prose prose-spiritual max-w-none mb-12">
              <h3 className="text-xl font-black text-gray-900 mb-4">About this Journey</h3>
              <p className="text-gray-600 font-semibold leading-relaxed text-lg opacity-80 whitespace-pre-wrap">{event.description}</p>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-5 items-center pt-8 border-t border-white/40">
              {!isEventPassed ? (
                isUserRegistered ? (
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="w-full sm:w-auto bg-white/60 backdrop-blur-xl text-red-500 px-10 py-4 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] border border-red-100 shadow-xl hover:bg-red-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                  >
                    {cancelling ? 'Refining...' : 'Cancel Registration'}
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={registering || (event.capacity && registrations.length >= event.capacity)}
                    className="w-full sm:w-auto bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-white px-12 py-4 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
                  >
                    {registering ? 'Aligning...' : (event.capacity && registrations.length >= event.capacity ? 'Full Capacity' : 'Join Gathering')}
                  </button>
                )
              ) : (
                <div className="bg-gray-100/50 backdrop-blur-md px-10 py-4 rounded-[24px] border border-gray-200">
                  <span className="text-gray-400 font-black text-xs uppercase tracking-[0.2em]">Past Event</span>
                </div>
              )}

              {!isEventPassed && (
                <a
                  href={googleCalendarLink(event)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 rounded-[24px] bg-white/40 backdrop-blur-xl text-gray-700 font-black text-xs uppercase tracking-[0.2em] border border-white hover:bg-white/80 transition-all shadow-lg group active:scale-95"
                >
                  <svg className="w-5 h-5 text-[#8b5cf6] group-hover:scale-125 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                  </svg>
                  Sync to Calendar
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Admin: Show Registrations */}
        {user?.role === 'admin' && (
          <div className="mt-12 bg-white/30 backdrop-blur-xl rounded-[40px] border border-white/60 p-10 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Souls Registered ({registrations.length})</h2>
            </div>

            {registrations.length === 0 ? (
              <p className="text-gray-500 font-bold opacity-60">No souls joined this journey yet.</p>
            ) : (
              <div className="grid gap-3">
                {registrations.map((reg, idx) => (
                  <div key={reg._id} className="flex items-center justify-between p-5 bg-white/40 rounded-[24px] border border-white/60 hover:bg-white/60 hover:border-white transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-blue-50 flex items-center justify-center text-[#8b5cf6] font-black text-sm border-2 border-white shadow-sm">
                        {reg.user.name ? reg.user.name[0].toUpperCase() : idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 tracking-tight">
                          {reg.user.name || 'Anonymous Soul'}
                        </p>
                        <p className="text-[11px] font-black text-[#8b5cf6] tracking-widest opacity-60">
                          {reg.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white/60 px-4 py-2 rounded-full border border-white/60 group-hover:bg-[#8b5cf6] group-hover:text-white transition-all">
                      {new Date(reg.registeredAt || reg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
}
