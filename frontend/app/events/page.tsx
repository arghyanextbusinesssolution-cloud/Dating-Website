'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function EventsPage() {
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) fetchEvents();
  }, [authLoading]);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      if (res.data.success) setEvents(res.data.events || []);
    } catch (err) {
      console.error('Fetch events error', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading...</div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Events</h1>
      <div className="grid gap-4">
        {events.length === 0 && <div className="p-6 bg-white rounded-lg shadow">No upcoming events</div>}
        {events.map(evt => (
          <div key={evt._id} className="bg-white rounded-lg shadow p-4 flex gap-4">
            <div className="w-28 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
              {evt.image ? <img src={evt.image} alt={evt.title} className="w-full h-full object-cover" /> : null}
            </div>
            <div className="flex-1">
              <Link href={`/events/${evt._id}`} className="text-lg font-semibold">{evt.title}</Link>
              <div className="text-sm text-gray-600">{new Date(evt.startDate).toLocaleString()}</div>
              <p className="text-sm mt-2 text-gray-700 line-clamp-2">{evt.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
