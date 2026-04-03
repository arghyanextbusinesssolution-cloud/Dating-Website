'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface SidebarNavigationProps {
    userProfilePhoto?: string | null;
}

export default function SidebarNavigation({ userProfilePhoto }: SidebarNavigationProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const { showUpgradeModal, hideUpgradeModal } = useSubscription();
    const isBasic = user?.role === 'basic';

    const navItems = [
        {
            href: '/matches/suggested',
            label: 'Matches',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            activePaths: ['/matches/suggested', '/matches/my-matches'],
        },
        {
            href: '/matches/likes',
            label: 'Likes',
            icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
            ),
            activePaths: [],
        },
        {
            href: '/soul',
            label: 'Soul',
            icon: <span className="text-2xl">✨</span>,
            activePaths: ['/soul'],
            isCenter: true,
        },
        {
            href: '/messages',
            label: 'Messages',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
            activePaths: ['/messages'],
        },
        {
            href: '/events',
            label: 'Events',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            activePaths: ['/events'],
        },
        {
            href: '/profile',
            label: 'Profile',
            icon: userProfilePhoto ? (
                <img src={userProfilePhoto} alt="Profile" className="w-full h-full object-cover rounded-full" />
            ) : (
                <span className="text-gray-600 text-lg">👤</span>
            ),
            activePaths: ['/profile'],
            isProfile: true,
        },
    ];

    const isActive = (item: typeof navItems[0]) => {
        if (item.activePaths.length > 0) {
            return item.activePaths.some(path => pathname.startsWith(path));
        }
        return pathname === item.href;
    };

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen fixed top-0 left-0 bg-white/40 backdrop-blur-xl border-r border-white/20 z-50">
            <div className="flex flex-col h-full px-6 py-8">
                <div className="mb-10 px-2 font-bold text-xl tracking-tight flex items-center gap-1">
                    <span className="text-gray-900">spiritualunity</span>
                    <span className="text-[#8b5cf6]">match</span>
                </div>

                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => {
                        const active = isActive(item);
                        const isRestricted = (item.label === 'Messages' || item.label === 'Likes') && isBasic;

                        const handleClick = (e: React.MouseEvent) => {
                            if (isRestricted) {
                                e.preventDefault();
                                showUpgradeModal();
                            }
                        };

                        return (
                            <button
                                key={item.href}
                                onClick={(e) => {
                                    if (isRestricted) {
                                        console.log(`[Sidebar] Access to ${item.label} DENIED. User role: ${user?.role}. Showing upgrade modal.`);
                                        handleClick(e);
                                    } else {
                                        const isSecure = (item.label === 'Messages' || item.label === 'Likes');
                                        if (isSecure) {
                                            console.log(`[Sidebar] Access to ${item.label} GRANTED. User role: ${user?.role}. Navigating to ${item.href}.`);
                                        } else {
                                            console.log(`[Sidebar] Navigating to unrestricted route: ${item.href}`);
                                        }
                                        hideUpgradeModal();
                                        router.push(item.href);
                                    }
                                }}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${active
                                    ? 'bg-white/80 text-[#8b5cf6] shadow-sm'
                                    : 'text-gray-500 hover:bg-white/40 hover:text-gray-900'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-6 h-6 flex items-center justify-center transition-colors ${active ? 'text-[#8b5cf6]' : 'text-gray-400 group-hover:text-gray-600'
                                        }`}>
                                        {item.icon}
                                    </div>
                                    <span className={`text-[15px] font-medium ${active ? 'font-semibold' : ''}`}>
                                        {item.label}
                                    </span>
                                </div>
                                {item.label === 'Matches' && (
                                    <span className="bg-[#cc9b5d] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                        5
                                    </span>
                                )}
                                {isRestricted && (
                                    <span className="ml-auto text-[10px] opacity-40 grayscale group-hover:opacity-100 transition-opacity">🔒</span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Profile Strength Card */}
                <div className="mt-auto bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-white/40 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-sm font-bold text-gray-800 leading-tight">Profile Strength</h3>
                            <div className="relative w-12 h-12">
                                <svg className="w-12 h-12 transform -rotate-90">
                                    <circle
                                        cx="24"
                                        cy="24"
                                        r="20"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="transparent"
                                        className="text-gray-100"
                                    />
                                    <circle
                                        cx="24"
                                        cy="24"
                                        r="20"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="transparent"
                                        strokeDasharray={2 * Math.PI * 20}
                                        strokeDashoffset={2 * Math.PI * 20 * (1 - 0.6)}
                                        className="text-orange-400"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700">
                                    60%
                                </div>
                            </div>
                        </div>
                        <p className="text-[11px] text-gray-500 mb-0 leading-relaxed">
                            Add photos to increase matches
                        </p>
                    </div>
                    {/* Decorative subtle gradient background */}
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-orange-100/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                </div>
            </div>
        </aside>
    );
}
