'use client';

import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">User Growth</h3>
                    <div className="h-40 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                        <BarChart3 size={32} className="mr-2 opacity-50" />
                        Chart coming soon
                    </div>
                </div>
                <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Subscription Revenue</h3>
                    <div className="h-40 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-900/10 rounded-lg flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                        <BarChart3 size={32} className="mr-2 opacity-50" />
                        Chart coming soon
                    </div>
                </div>
            </div>
        </div>
    );
}
