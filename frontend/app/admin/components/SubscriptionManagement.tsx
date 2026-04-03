'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

interface Subscription {
  _id: string;
  email: string;
  plan: string;
  status: string;
  billingCycle: string;
  startDate: string;
  endDate?: string;
  cancelAtPeriodEnd: boolean;
  amount: number;
}

interface SubStats {
  activeCount: number;
  canceledCount: number;
  monthlyRevenue: number;
  churnRate: string;
}

export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/subscriptions');
      if (res.data.success) {
        setSubscriptions(res.data.subscriptions);
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Fetch subscriptions error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubscriptions(); }, []);

  const planColor = (plan: string) => {
    if (plan === 'premium') return 'text-purple-700 dark:text-purple-400 font-semibold capitalize';
    if (plan === 'standard') return 'text-blue-700 dark:text-blue-400 font-semibold capitalize';
    return 'text-neutral-700 dark:text-neutral-300 capitalize';
  };

  const statusBadge = (status: string, cancelAtPeriodEnd: boolean) => {
    if (cancelAtPeriodEnd) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
    if (status === 'active') return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    if (status === 'canceled') return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    if (status === 'past_due') return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
    return 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300';
  };

  const statusLabel = (status: string, cancelAtPeriodEnd: boolean) => {
    if (cancelAtPeriodEnd) return 'Cancels Soon';
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-spiritual-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Active Subscriptions</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">{stats?.activeCount ?? 0}</p>
            </div>
            <CreditCard className="text-green-600" size={32} />
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
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Monthly Revenue (MRR)</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">
                ${stats?.monthlyRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
              </p>
            </div>
            <TrendingUp className="text-blue-600" size={32} />
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
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Churn Rate</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">{stats?.churnRate ?? '0.0'}%</p>
            </div>
            <TrendingDown className="text-orange-600" size={32} />
          </div>
        </motion.div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden border border-neutral-200 dark:border-neutral-700"
      >
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">All Subscriptions</h3>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">{subscriptions.length} total</span>
        </div>

        {subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-neutral-400 dark:text-neutral-500">
            <AlertCircle size={32} />
            <p>No subscriptions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 dark:bg-neutral-700/50">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-neutral-900 dark:text-white">Email</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-neutral-900 dark:text-white">Plan</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-neutral-900 dark:text-white">Billing</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-neutral-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-neutral-900 dark:text-white">Start Date</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-neutral-900 dark:text-white">End Date</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-neutral-900 dark:text-white">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {subscriptions.map(sub => (
                  <tr key={sub._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors">
                    <td className="py-4 px-6 text-sm text-neutral-900 dark:text-neutral-100">{sub.email}</td>
                    <td className="py-4 px-6 text-sm">
                      <span className={planColor(sub.plan)}>{sub.plan}</span>
                    </td>
                    <td className="py-4 px-6 text-sm text-neutral-600 dark:text-neutral-400 capitalize">{sub.billingCycle}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(sub.status, sub.cancelAtPeriodEnd)}`}>
                        {statusLabel(sub.status, sub.cancelAtPeriodEnd)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-neutral-600 dark:text-neutral-400">
                      {sub.startDate ? new Date(sub.startDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-4 px-6 text-sm text-neutral-600 dark:text-neutral-400">
                      {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      ${sub.amount.toFixed(2)}/{sub.billingCycle === 'yearly' ? 'yr' : 'mo'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
