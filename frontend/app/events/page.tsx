'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function EventsPage() {
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'registered' | 'upcoming' | 'closed'>('all');
  const [registrations, setRegistrations] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading) fetchEvents();
  }, [authLoading]);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      if (res.data.success) {
        setEvents(res.data.events || []);
        
        // Log all events with their dates
        console.log('📅 [FRONTEND - EVENTS] Events fetched successfully:', {
          totalEvents: res.data.events?.length || 0,
          fetchedAt: new Date().toISOString(),
          events: res.data.events?.map((evt: any) => ({
            eventId: evt._id,
            title: evt.title,
            location: evt.location,
            startDate: evt.startDate,
            startDateFormatted: new Date(evt.startDate).toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'UTC'
            }),
            endDate: evt.endDate,
            endDateFormatted: evt.endDate ? new Date(evt.endDate).toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'UTC'
            }) : 'N/A',
            capacity: evt.capacity
          })) || []
        });
        
        // Store which events user is registered for
        if (res.data.registrations) {
          const registeredIds = new Set(res.data.registrations.map((r: any) => r.event));
          setRegistrations(registeredIds);
          console.log('✅ [FRONTEND - EVENTS] User registrations loaded:', {
            registeredCount: registeredIds.size,
            registeredEventIds: Array.from(registeredIds)
          });
        }
      }
    } catch (err) {
      console.error('❌ [FRONTEND - EVENTS] Fetch events error', err);
    } finally {
      setLoading(false);
    }
  };

  const isEventClosed = (event: any) => {
    const now = new Date();
    const eventStart = new Date(event.startDate);
    return now > eventStart;
  };

  const isUserRegistered = (eventId: string) => {
    return registrations.has(eventId);
  };

  const getFilteredEvents = () => {
    const now = new Date();
    
    return events.filter(evt => {
      const eventStart = new Date(evt.startDate);
      const isClosed = now > eventStart;
      const isRegistered = isUserRegistered(evt._id);

      switch (filter) {
        case 'registered':
          return isRegistered;
        case 'upcoming':
          return !isClosed;
        case 'closed':
          return isClosed;
        case 'all':
        default:
          return true;
      }
    });
  };

  const filteredEvents = getFilteredEvents();

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading...</div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 p-4 max-w-3xl mx-auto pb-24">
      <h1 className="text-2xl font-bold mb-4">Events</h1>
      
      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'upcoming', 'registered', 'closed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
              filter === f
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredEvents.length === 0 && (
          <div className="p-6 bg-white rounded-lg shadow text-center text-gray-600">
            {filter === 'all' && 'No events available'}
            {filter === 'upcoming' && 'No upcoming events'}
            {filter === 'registered' && 'You are not registered for any events'}
            {filter === 'closed' && 'No closed events'}
          </div>
        )}
        {filteredEvents.map(evt => {
          const isClosed = isEventClosed(evt);
          const isRegistered = isUserRegistered(evt._id);
          
          return (
            <div key={evt._id} className="bg-white rounded-lg shadow p-4 flex gap-4 relative hover:shadow-lg transition-shadow">
              {/* Status Badge */}
              <div className="absolute top-3 right-3 flex gap-2">
                {isRegistered && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">
                    ✓ Registered
                  </span>
                )}
                {isClosed && (
                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full font-semibold">
                    Closed
                  </span>
                )}
              </div>

              <div className="w-28 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                {evt.image ? <img src={evt.image} alt={evt.title} className="w-full h-full object-cover" /> : null}
              </div>
              
              <div className="flex-1 pr-32">
                <Link href={`/events/${evt._id}`} className="text-lg font-semibold hover:text-purple-600">
                  {evt.title}
                </Link>
                <div className="text-sm text-gray-600">{new Date(evt.startDate).toLocaleString()}</div>
                {evt.location && <div className="text-sm text-gray-600">📍 {evt.location}</div>}
                <p className="text-sm mt-2 text-gray-700 line-clamp-2">{evt.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
