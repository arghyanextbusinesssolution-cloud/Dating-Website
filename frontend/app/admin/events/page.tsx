'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminEventsPage() {
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>({ title: '', description: '', startDate: '', endDate: '', location: '', capacity: '', visibleToPlans: [] });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading) fetchEvents();
  }, [authLoading]);

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
    const file = e.target.files?.[0] || null;
    console.log('📁 [Events] File selected:', {
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      file: file
    });
    setImageFile(file);
  };

  const uploadImage = async () => {
    console.log('🚀 [Events] Starting image upload:', {
      hasFile: !!imageFile,
      fileName: imageFile?.name,
      fileType: imageFile?.type,
      fileSize: imageFile?.size
    });

    if (!imageFile) {
      console.warn('⚠️ [Events] No image file selected');
      return null;
    }

    try {
      const fd = new FormData();
      fd.append('image', imageFile);
      
      console.log('📤 [Events] FormData prepared, sending request...');
      
      const res = await api.post('/events/upload-image', fd, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      
      console.log('✅ [Events] Upload response received:', {
        success: res.data.success,
        url: res.data.url,
        status: res.status,
        data: res.data
      });
      
      if (res.data.success) {
        console.log('🎉 [Events] Image upload successful:', res.data.url);
        return res.data.url;
      } else {
        console.error('❌ [Events] Upload failed:', res.data.message);
        return null;
      }
    } catch (error: any) {
      console.error('❌ [Events] Upload error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        error: error
      });
      throw error;
    }
  };

  const handleCreate = async (e: any) => {
    e.preventDefault();
    console.log('📝 [ADMIN EVENT CREATION] Starting event creation...');
    
    try {
      setSaving(true);
      let imageUrl = form.image || '';
      
      const startDateObj = new Date(form.startDate);
      const endDateObj = form.endDate ? new Date(form.endDate) : null;
      
      console.log('📅 [ADMIN EVENT CREATION] Event date/time details:', {
        title: form.title,
        hasImage: !!imageFile,
        rawStartDate: form.startDate,
        startDateFormatted: startDateObj.toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'UTC'
        }),
        rawEndDate: form.endDate,
        endDateFormatted: endDateObj ? endDateObj.toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'UTC'
        }) : 'Not specified',
        location: form.location,
        capacity: form.capacity,
        visibleToPlans: form.visibleToPlans,
        submittedAt: new Date().toISOString()
      });
      
      if (imageFile) {
        console.log('📸 [Events] Image file present, uploading...');
        try {
          const url = await uploadImage();
          if (url) {
            imageUrl = url;
            console.log('✅ [Events] Image URL set:', imageUrl);
          } else {
            console.warn('⚠️ [Events] Image upload returned null');
          }
        } catch (uploadErr) {
          console.error('❌ [Events] Image upload failed, continuing without image:', uploadErr);
        }
      } else {
        console.log('ℹ️ [Events] No image file selected');
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
      
      console.log('📤 [Events] Sending event creation payload:', payload);

      const res = await api.post('/events', payload);
      
      console.log('✅ [Events] Event creation response:', {
        success: res.data.success,
        status: res.status,
        eventId: res.data.event?._id
      });
      
      if (res.data.success) {
        console.log('🎉 [Events] Event created successfully:', res.data.event._id);
        alert('Event created');
        setForm({ title: '', description: '', startDate: '', endDate: '', location: '', capacity: '', visibleToPlans: [] });
        setImageFile(null);
        fetchEvents();
      }
    } catch (err: any) {
      console.error('❌ [Events] Create event error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        error: err
      });
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
    } catch (err) {
      console.error('Delete event', err);
      alert('Error deleting');
    }
  };

  if (authLoading) return <div>Loading...</div>;
  if (!user || user.role !== 'admin') return <div>Admin access required</div>;

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Events</h1>

      <form onSubmit={handleCreate} className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-2 gap-3">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="p-2 border" />
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="p-2 border" />
          <input value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} type="datetime-local" className="p-2 border" />
          <input value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} type="datetime-local" className="p-2 border" />
          <input value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="Capacity" className="p-2 border" />
          <div className="col-span-2">
            <label className="text-sm text-gray-600">Visible to plans (hold Ctrl / Cmd to multi-select)</label>
            <select
              multiple
              value={form.visibleToPlans}
              onChange={(e) => {
                const values = Array.from((e.target as HTMLSelectElement).selectedOptions).map(o => o.value);
                setForm({ ...form, visibleToPlans: values });
              }}
              className="p-2 border w-full h-32 mt-1"
            >
              <option value="basic">Basic</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="p-2 border col-span-2" />
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <div className="mt-3">
          <button disabled={saving} type="submit" className="px-4 py-2 bg-green-600 text-white rounded">{saving ? 'Saving...' : 'Create Event'}</button>
        </div>
      </form>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-3">Existing events</h2>
        {loading ? <div>Loading...</div> : (
          <div className="space-y-3">
            {events.map(evt => (
              <div key={evt._id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <div className="font-semibold">{evt.title}</div>
                  <div className="text-sm text-gray-600">{new Date(evt.startDate).toLocaleString()}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => window.open(`/events/${evt._id}`, '_blank')} className="px-2 py-1 border rounded">View</button>
                  <button onClick={() => handleDelete(evt._id)} className="px-2 py-1 bg-red-600 text-white rounded">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
