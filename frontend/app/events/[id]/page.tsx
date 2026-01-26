'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

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

  useEffect(() => {
    if (id) fetchEvent();
  }, [id]);

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
        alert('Registered — check your calendar link below');
        fetchEvent();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error registering');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel your registration?')) return;
    try {
      setCancelling(true);
      const res = await api.delete(`/events/${id}/register`);
      if (res.data.success) {
        alert('Registration cancelled');
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

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!event) return <div className="min-h-screen flex items-center justify-center">Event not found</div>;

  const isEventPassed = new Date() > new Date(event.startDate);

  return (
    <div className="min-h-screen p-4 max-w-3xl mx-auto bg-gradient-to-b from-green-50 to-yellow-50 pb-20">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
            <div className="text-sm text-gray-600 mb-2">{new Date(event.startDate).toLocaleString()}</div>
            {event.location && <div className="text-sm text-gray-700 font-semibold">📍 {event.location}</div>}
          </div>
          {isUserRegistered && (
            <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-semibold">
              ✓ Registered
            </span>
          )}
        </div>

        {event.image && <img src={event.image} alt={event.title} className="w-full h-64 object-cover rounded mb-4" />}
        
        <p className="text-gray-800 mb-4">{event.description}</p>

        {event.capacity && (
          <div className="bg-blue-50 p-3 rounded mb-4">
            <p className="text-sm text-blue-900">
              Registered: <strong>{registrations.length}</strong> / <strong>{event.capacity}</strong> spots
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          {!isEventPassed ? (
            isUserRegistered ? (
              <button 
                onClick={handleCancel} 
                disabled={cancelling}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Registration'}
              </button>
            ) : (
              <button 
                onClick={handleRegister} 
                disabled={registering || (event.capacity && registrations.length >= event.capacity)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {registering ? 'Registering...' : 'Register'}
              </button>
            )
          ) : (
            <span className="text-gray-600 px-4 py-2">Event has ended</span>
          )}
          
          <a 
            href={googleCalendarLink(event)} 
            target="_blank" 
            rel="noreferrer" 
            className="text-sm text-blue-700 underline px-4 py-2 hover:text-blue-900"
          >
            📅 Add to Google Calendar
          </a>
        </div>
      </div>

      {/* Admin: Show Registrations */}
      {user?.role === 'admin' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Registrations ({registrations.length})</h2>
          
          {registrations.length === 0 ? (
            <p className="text-gray-600">No registrations yet</p>
          ) : (
            <div className="space-y-2">
              {registrations.map((reg, idx) => (
                <div key={reg._id} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {idx + 1}. {reg.user.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-600">{reg.user.email}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(reg.registeredAt || reg.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
