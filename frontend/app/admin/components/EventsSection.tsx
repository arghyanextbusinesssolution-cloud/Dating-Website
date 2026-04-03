'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Trash2 } from 'lucide-react';

export default function EventsSection() {
  const [events, setEvents] = useState([
    { id: 1, title: 'Spiritual Meditation', date: '2025-02-15', time: '10:00 AM', location: 'Online', attendees: 45, status: 'Upcoming' },
    { id: 2, title: 'Speed Dating Event', date: '2025-02-20', time: '6:00 PM', location: 'New York', attendees: 32, status: 'Upcoming' },
    { id: 3, title: 'Soul Connection Workshop', date: '2025-02-10', time: '2:00 PM', location: 'Los Angeles', attendees: 28, status: 'Past' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
  });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.date && formData.time && formData.location) {
      const newEvent = {
        id: events.length + 1,
        ...formData,
        attendees: 0,
        status: 'Upcoming',
      };
      setEvents([...events, newEvent]);
      setFormData({ title: '', date: '', time: '', location: '' });
      setShowAddModal(false);
    }
  };

  const handleDeleteEvent = (id: number) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter((event) => event.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Event Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Events</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">{events.length}</p>
            </div>
            <Calendar className="text-blue-600" size={32} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Upcoming Events</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">
                {events.filter((e) => e.status === 'Upcoming').length}
              </p>
            </div>
            <Calendar className="text-green-600" size={32} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Attendees</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">
                {events.reduce((sum, e) => sum + e.attendees, 0)}
              </p>
            </div>
            <Calendar className="text-purple-600" size={32} />
          </div>
        </motion.div>
      </div>

      {/* Add Event Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={() => setShowAddModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-spiritual-violet-600 hover:bg-spiritual-violet-700 text-white rounded-lg transition-colors"
      >
        <Plus size={20} />
        Add New Event
      </motion.button>

      {/* Events Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden border border-neutral-200 dark:border-neutral-700"
      >
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Events</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-700/50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-semibold text-neutral-900 dark:text-white">Title</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-neutral-900 dark:text-white">Date & Time</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-neutral-900 dark:text-white">Location</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-neutral-900 dark:text-white">Attendees</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-neutral-900 dark:text-white">Status</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-neutral-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {events.map((event: any) => (
                <tr key={event.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-neutral-900 dark:text-neutral-100">{event.title}</td>
                  <td className="py-4 px-6 text-neutral-700 dark:text-neutral-300">
                    {event.date} at {event.time}
                  </td>
                  <td className="py-4 px-6 text-neutral-700 dark:text-neutral-300">{event.location}</td>
                  <td className="py-4 px-6 text-neutral-700 dark:text-neutral-300">{event.attendees}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        event.status === 'Upcoming'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl p-6 max-w-md w-full border border-neutral-200 dark:border-neutral-700"
          >
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Add New Event</h2>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">Event Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg border border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-spiritual-violet-600"
                  placeholder="e.g., Spiritual Meditation"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg border border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-spiritual-violet-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg border border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-spiritual-violet-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg border border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-spiritual-violet-600"
                  placeholder="e.g., New York"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-spiritual-violet-600 hover:bg-spiritual-violet-700 text-white rounded-lg transition-colors font-medium"
                >
                  Add Event
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
