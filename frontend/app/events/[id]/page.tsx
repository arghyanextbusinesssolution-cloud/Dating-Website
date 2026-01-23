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
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (id) fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      if (res.data.success) setEvent(res.data.event);
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

  return (
    <div className="min-h-screen p-4 max-w-3xl mx-auto bg-gradient-to-b from-green-50 to-yellow-50">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
        <div className="text-sm text-gray-600 mb-4">{new Date(event.startDate).toLocaleString()}</div>
        {event.image && <img src={event.image} alt={event.title} className="w-full h-64 object-cover rounded mb-4" />}
        <p className="text-gray-800 mb-4">{event.description}</p>

        <div className="flex items-center gap-3">
          <button onClick={handleRegister} disabled={registering} className="bg-blue-600 text-white px-4 py-2 rounded">
            {registering ? 'Registering...' : 'Register'}
          </button>
          <a href={googleCalendarLink(event)} target="_blank" rel="noreferrer" className="text-sm text-blue-700 underline">
            Add to Google Calendar
          </a>
        </div>
      </div>
    </div>
  );
}
