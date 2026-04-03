'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import DashboardOverview from '../components/DashboardOverview';

interface Stats {
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
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/stats').then(res => {
            if (res.data.success) setStats(res.data.stats);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-spiritual-violet-600" />
            </div>
        );
    }

    return <DashboardOverview stats={stats} />;
}
