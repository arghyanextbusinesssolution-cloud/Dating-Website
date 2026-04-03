'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import {
    LayoutDashboard,
    Users,
    BarChart3,
    Settings,
    LogOut,
    CreditCard,
    Heart,
    MessageSquare,
    Wrench,
    Calendar,
} from 'lucide-react';

const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'User Management', icon: Users },
    { href: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
    { href: '/admin/matches', label: 'Matches', icon: Heart },
    { href: '/admin/events', label: 'Events', icon: Calendar },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
    { href: '/admin/system-messages', label: 'System Messages', icon: MessageSquare },
    { href: '/admin/stripe-settings', label: 'Stripe Settings', icon: Wrench },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'admin') {
                router.push('/dashboard');
            }
        }
    }, [user, authLoading, router]);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch { }
        router.push('/auth/login');
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-spiritual-gradient-light flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spiritual-violet-600" />
            </div>
        );
    }

    if (!user || user.role !== 'admin') return null;

    return (
        <div className="flex min-h-screen w-full bg-neutral-50 dark:bg-neutral-950">
            {/* Fixed Sidebar */}
            <aside className="fixed top-0 left-0 h-screen w-56 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-700 flex flex-col z-40 overflow-y-auto">
                {/* Brand */}
                <div className="px-5 pt-8 pb-6 border-b border-neutral-200 dark:border-neutral-700">
                    <h2 className="text-xl font-bold text-spiritual-violet-700 dark:text-spiritual-violet-400">
                        Admin Panel
                    </h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Spiritual Dating</p>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href || pathname.startsWith(href + '/');
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-spiritual-violet-600 text-white'
                                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                                    }`}
                            >
                                <Icon size={18} />
                                <span>{label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="px-3 py-4 border-t border-neutral-200 dark:border-neutral-700 space-y-2">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-spiritual-violet-600 flex items-center justify-center text-white text-sm font-semibold">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{user?.email}</p>
                    </div>
                </div>
            </aside>

            {/* Main Content — offset by sidebar width */}
            <main className="ml-56 flex-1 min-h-screen overflow-auto">
                {/* Top bar */}
                <div className="sticky top-0 z-30 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
                    <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                        {navItems.find(n => pathname === n.href || pathname.startsWith(n.href + '/'))?.label || 'Admin'}
                    </h1>
                </div>

                {/* Page content */}
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
