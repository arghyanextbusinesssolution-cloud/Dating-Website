 'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import api from '@/lib/api';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      fetchData();
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (usersRes.data.success) {
        setUsers(usersRes.data.users);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (userId: string, suspend: boolean) => {
    try {
      await api.post(`/admin/users/${userId}/suspend`, { suspend });
      fetchData();
    } catch (error) {
      alert('Error suspending user');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      fetchData();
    } catch (error) {
      alert('Error deleting user');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-spiritual-gradient-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spiritual-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-spiritual-gradient-light py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-spiritual-violet-700 mb-8">
          Admin Dashboard
        </h1>

        {/* Stats */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-sm text-gray-600 mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-spiritual-violet-700">
                {stats.users.total}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-sm text-gray-600 mb-2">Active Subscriptions</h3>
              <p className="text-3xl font-bold text-spiritual-violet-700">
                {stats.subscriptions.total}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-sm text-gray-600 mb-2">Total Matches</h3>
              <p className="text-3xl font-bold text-spiritual-violet-700">
                {stats.engagement.matches}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-sm text-gray-600 mb-2">Total Messages</h3>
              <p className="text-3xl font-bold text-spiritual-violet-700">
                {stats.engagement.messages}
              </p>
            </motion.div>
          </div>
        )}

        {/* Admin tools */}
        <div className="mt-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 flex items-center justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold">Events</h3>
              <p className="text-sm text-gray-500">Create and manage site events (admin only)</p>
            </div>
            <div>
              <Link href="/admin/events" className="px-4 py-2 bg-purple-600 text-white rounded-md">Manage Events</Link>
            </div>
          </motion.div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-spiritual-violet-700 mb-4">
            All Users
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Profile</th>
                  <th className="text-left py-3 px-4">Subscription</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b">
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      {user.profileApproved ? (
                        <span className="text-green-600">✓ Approved</span>
                      ) : (
                        <span className="text-yellow-600">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {user.subscription ? (
                        <span className="capitalize">{user.subscription.plan}</span>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSuspend(user._id, !user.isSuspended)}
                          className="text-sm px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                        >
                          {user.isSuspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

