'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<any>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    capacity: '',
    visibleToPlans: []
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events/admin/list');
      if (res.data.success) setEvents(res.data.events || []);
    } catch (err) {
      console.error('Fetch admin events', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: any) => {
    setImageFile(e.target.files?.[0] || null);
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    try {
      const fd = new FormData();
      fd.append('image', imageFile);
      const res = await api.post('/events/upload-image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.success ? res.data.url : null;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  };

  const handleCreate = async (e: any) => {
    e.preventDefault();
    try {
      setSaving(true);
      let imageUrl = form.image || '';
      if (imageFile) {
        try {
          const url = await uploadImage();
          if (url) imageUrl = url;
        } catch {
          console.error('Image upload failed, continuing without image');
        }
      }

      const payload = {
        title: form.title,
        description: form.description,
        image: imageUrl,
        startDate: form.startDate,
        endDate: form.endDate || null,
        location: form.location,
        capacity: form.capacity ? parseInt(form.capacity) : undefined,
        visibleToPlans: form.visibleToPlans
      };

      const res = await api.post('/events', payload);
      if (res.data.success) {
        setForm({ title: '', description: '', startDate: '', endDate: '', location: '', capacity: '', visibleToPlans: [] });
        setImageFile(null);
        setIsModalOpen(false);
        fetchEvents();
      }
    } catch (err: any) {
      alert('Error creating event: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try {
      const res = await api.delete(`/events/${id}`);
      if (res.data.success) fetchEvents();
    } catch {
      alert('Error deleting');
    }
  };

  const handlePlanToggle = (plan: string) => {
    setForm((prev: any) => {
      const plans = [...(prev.visibleToPlans || [])];
      if (plans.includes(plan)) {
        return { ...prev, visibleToPlans: plans.filter(p => p !== plan) };
      } else {
        return { ...prev, visibleToPlans: [...plans, plan] };
      }
    });
  };

  return (
    <div className="space-y-10 pb-20 p-4 min-h-screen">
      {/* Existing Events List Header */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-white/40 backdrop-blur-2xl rounded-[40px] border border-white/70 p-8 md:p-12 shadow-2xl relative overflow-hidden group mb-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6] border border-[#8b5cf6]/20 shadow-inner">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Event Management</h1>
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-1 opacity-70">Curate soulful gatherings for your community</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-6 md:mt-0 px-10 py-4 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:shadow-purple-500/30 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
          Add New Event
        </button>
      </div>

      {/* Events List Grid */}
      <div className="bg-white/40 backdrop-blur-2xl rounded-[40px] border border-white/70 p-8 md:p-12 shadow-2xl">
        <div className="flex items-center justify-between mb-10 border-b border-white/40 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 border border-blue-500/20 shadow-inner">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Existing Events</h2>
          </div>
          <div className="px-5 py-2 rounded-full bg-white/60 border border-white text-gray-500 font-black text-[9px] uppercase tracking-widest shadow-sm">
            Total Active: {events.length}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8b5cf6]" />
            <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Consulting the Stars...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((evt, idx) => (
              <motion.div
                key={evt._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="p-8 bg-white/50 border border-white/80 rounded-[40px] hover:shadow-2xl hover:bg-white/80 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-2xl">✨</span>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-black text-gray-900 mb-2 truncate pr-6 group-hover:text-[#8b5cf6] transition-colors tracking-tight">
                    {evt.title}
                  </h3>
                  <div className="space-y-2 opacity-80">
                    <div className="flex items-center gap-3 text-[12px] font-bold text-gray-600">
                      <div className="w-7 h-7 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6]">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      {new Date(evt.startDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-3 text-[12px] font-bold text-gray-600">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      {new Date(evt.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-3 text-[12px] font-bold text-gray-600">
                      <div className="w-7 h-7 rounded-lg bg-orange-400/10 flex items-center justify-center text-orange-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>
                      <span className="truncate">{evt.location}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => window.open(`/events/${evt._id}`, '_blank')}
                    className="px-4 py-3 bg-white/80 border border-white text-[#8b5cf6] rounded-2xl hover:bg-[#8b5cf6] hover:text-white transition-all text-xs font-black uppercase tracking-widest shadow-sm active:scale-95"
                  >
                    View Detail
                  </button>
                  <button
                    onClick={() => handleDelete(evt._id)}
                    className="px-4 py-3 bg-red-400/10 border border-red-100 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest shadow-sm active:scale-95"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 space-y-6 opacity-40 grayscale">
            <span className="text-7xl">🌌</span>
            <p className="font-bold text-gray-500 tracking-widest uppercase text-lg">The universe is quiet...</p>
          </div>
        )}
      </div>

      {/* Pop-up Modal for Create Event */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-4xl bg-white/60 backdrop-blur-3xl rounded-[48px] border border-white/80 p-8 md:p-14 shadow-2xl max-h-[90vh] overflow-y-auto spiritual-scrollbar"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-white/40 border border-white/60 flex items-center justify-center hover:bg-white transition-all group active:scale-95"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-5 mb-12">
                <div className="w-14 h-14 rounded-2xl bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6] border border-[#8b5cf6]/20 shadow-inner">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Create New Gathering</h2>
                  <p className="text-[#8b5cf6] font-black text-[10px] uppercase tracking-[0.2em] mt-1">Manifest a new spiritual journey</p>
                </div>
              </div>

              <form onSubmit={handleCreate} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Event Title *</label>
                    <input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Enter a soulful title..."
                      className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-white/60 text-gray-900 font-bold placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 focus:border-[#8b5cf6]/30 transition-all text-base shadow-sm"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Location *</label>
                    <input
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="Where will it take place?"
                      className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-white/60 text-gray-900 font-bold placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all text-base shadow-sm"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Start Date *</label>
                    <input
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      type="datetime-local"
                      className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-white/60 text-gray-900 font-bold focus:outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 focus:border-[#8b5cf6]/30 transition-all cursor-pointer shadow-sm text-base"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">End Date</label>
                    <input
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      type="datetime-local"
                      className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-white/60 text-gray-900 font-bold focus:outline-none focus:ring-4 focus:ring-gray-500/10 focus:border-gray-500/30 transition-all cursor-pointer shadow-sm text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Capacity</label>
                    <input
                      value={form.capacity}
                      onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                      placeholder="How many souls?"
                      type="number"
                      className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-white/60 text-gray-900 font-bold placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/30 transition-all shadow-sm text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Event Image</label>
                    <div className="relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-white/60 text-gray-400 group-hover:text-gray-600 transition-all flex items-center gap-4 shadow-sm text-base">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span className="font-bold truncate">{imageFile ? imageFile.name : 'Choose an image file...'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Visible to Plans</label>
                  <div className="flex flex-wrap gap-5">
                    {['basic', 'standard', 'premium'].map(plan => {
                      const isChecked = form.visibleToPlans.includes(plan);
                      return (
                        <button
                          key={plan}
                          type="button"
                          onClick={() => handlePlanToggle(plan as 'basic' | 'standard' | 'premium')}
                          className={`px-10 py-4 rounded-[20px] font-black text-[13px] uppercase tracking-widest border transition-all duration-300 flex items-center gap-4 shadow-sm ${isChecked
                            ? 'bg-[#8b5cf6] text-white border-[#8b5cf6] shadow-purple-500/20 scale-105'
                            : 'bg-white/40 text-gray-500 border-white/60 hover:bg-white/60'
                            }`}
                        >
                          <div className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center ${isChecked ? 'bg-white border-white text-[#8b5cf6]' : 'border-gray-300 bg-white/20'
                            }`}>
                            {isChecked && (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          {plan}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Share the energy and purpose of this gathering..."
                    className="w-full px-7 py-5 rounded-[32px] bg-white/50 border border-white/60 text-gray-900 font-bold placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 focus:border-[#8b5cf6]/30 transition-all h-40 resize-none shadow-sm text-base leading-relaxed"
                  />
                </div>

                <div className="flex justify-end pt-6">
                  <button
                    disabled={saving}
                    type="submit"
                    className="w-full md:w-auto px-16 py-6 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-5"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        Manifesting...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Gathering
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .spiritual-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .spiritual-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .spiritual-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.2);
          border-radius: 10px;
        }
        .spiritual-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.4);
        }
      `}</style>
    </div>
  );
}
