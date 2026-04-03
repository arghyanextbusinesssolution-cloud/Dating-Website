'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, MessageSquare, CreditCard, TrendingUp } from 'lucide-react';

interface DashboardOverviewProps {
  stats: {
    users: { total: number };
    subscriptions: { total: number };
    engagement: { matches: number; messages: number };
    earnings?: {
      total: number;
      revenueData: { month: string; revenue: number }[];
      userGrowthData: { month: string; users: number }[];
    };
    subscriptionDistribution?: { name: string; value: number }[];
    quickStats?: {
      newUsersThisMonth: number;
      activeMatches: number;
      pendingApprovals: number;
      mrr: number;
    };
  } | null;
}

export default function DashboardOverview({ stats }: DashboardOverviewProps) {
  // Mock data for charts if API data is missing
  const userGrowthData = stats?.earnings?.userGrowthData || [
    { month: 'Jan', users: 12 },
    { month: 'Feb', users: 19 },
    { month: 'Mar', users: 15 },
    { month: 'Apr', users: 28 },
  ];

  const revenueData = stats?.earnings?.revenueData || [
    { month: 'Jan', revenue: 2400 },
    { month: 'Feb', revenue: 1398 },
    { month: 'Mar', revenue: 9800 },
    { month: 'Apr', revenue: 3908 },
  ];

  const subscriptionData = stats?.subscriptionDistribution || [
    { name: 'Free', value: 5 },
    { name: 'Premium', value: 27 },
  ];

  const COLORS = ['#e0e7ff', '#7c3aed'];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Users</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">
                  {stats?.users?.total || 0}
                </p>
              </div>
              <Users className="text-spiritual-violet-600 dark:text-spiritual-violet-400" size={32} />
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
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Active Subscriptions</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">
                  {stats?.subscriptions?.total || 0}
                </p>
              </div>
              <CreditCard className="text-blue-600 dark:text-blue-400" size={32} />
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
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Messages</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">
                  {stats?.engagement?.messages || 0}
                </p>
              </div>
              <MessageSquare className="text-green-600 dark:text-green-400" size={32} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Earnings</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">
                  ${stats?.earnings?.total.toLocaleString() || '12,450'}
                </p>
              </div>
              <TrendingUp className="text-orange-600 dark:text-orange-400" size={32} />
            </div>
          </motion.div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700"
        >
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Line type="monotone" dataKey="users" stroke="#7c3aed" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700"
        >
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="revenue" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Subscription Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700"
        >
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Subscription Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={subscriptionData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={100} fill="#8884d8" dataKey="value">
                {subscriptionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700"
        >
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200 dark:border-neutral-700">
              <span className="text-neutral-600 dark:text-neutral-400">New Users (This Month)</span>
              <span className="font-bold text-neutral-900 dark:text-white">{stats?.quickStats?.newUsersThisMonth || 0}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200 dark:border-neutral-700">
              <span className="text-neutral-600 dark:text-neutral-400">Active Matches</span>
              <span className="font-bold text-neutral-900 dark:text-white">{stats?.quickStats?.activeMatches || 0}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200 dark:border-neutral-700">
              <span className="text-neutral-600 dark:text-neutral-400">Pending Approvals</span>
              <span className="font-bold text-neutral-900 dark:text-white">{stats?.quickStats?.pendingApprovals || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600 dark:text-neutral-400">MRR (Monthly Recurring)</span>
              <span className="font-bold text-neutral-900 dark:text-white">${stats?.quickStats?.mrr?.toLocaleString() || '0'}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
