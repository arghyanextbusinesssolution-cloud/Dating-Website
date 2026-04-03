'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface DesktopTopBarProps {
    userProfilePhoto?: string | null;
}

export default function DesktopTopBar({ userProfilePhoto }: DesktopTopBarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const { user } = useAuth();
    const { showUpgradeModal, hideUpgradeModal } = useSubscription();
    const isBasic = user?.role === 'basic';

    return (
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/20 backdrop-blur-md sticky top-0 z-40 border-b border-white/10">
            {/* Search Bar */}
            <div className="flex-1 max-w-lg relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#8b5cf6] transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search People"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/60 backdrop-blur-sm border border-transparent focus:border-[#8b5cf6]/30 focus:bg-white/90 rounded-2xl py-2.5 pl-12 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all shadow-sm"
                />
            </div>

            {/* Icons Section */}
            <div className="flex items-center gap-5 ml-auto">
                {/* Category Filter Icons (Mockup style) */}
                <div className="flex items-center gap-2 pr-4 border-r border-gray-200/50">
                    <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/40 text-gray-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                    </button>
                    <button
                        onClick={() => {
                            if (isBasic) {
                                console.log(`[TopBar] Access to Likes DENIED. User role: ${user?.role}. Showing upgrade modal.`);
                                showUpgradeModal();
                            } else {
                                console.log(`[TopBar] Access to Likes GRANTED. User role: ${user?.role}. Navigating to /matches/likes.`);
                                router.push('/matches/likes');
                            }
                        }}
                        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/40 text-[#8b5cf6] relative transition-colors shadow-sm bg-white/40"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-400 rounded-full border border-white"></div>
                        {isBasic && (
                            <span className="absolute -top-1 -right-1 text-[8px]">🔒</span>
                        )}
                    </button>
                </div>

                {/* Main Action Icons */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            if (isBasic) {
                                console.log(`[TopBar] Access to Messages DENIED. User role: ${user?.role}. Showing upgrade modal.`);
                                showUpgradeModal();
                            } else {
                                console.log(`[TopBar] Access to Messages GRANTED. User role: ${user?.role}. Navigating to /messages.`);
                                router.push('/messages');
                            }
                        }}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/40 text-gray-500 transition-colors relative"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {isBasic && (
                            <span className="absolute top-0 right-0 text-[8px]">🔒</span>
                        )}
                    </button>
                </div>

                {/* Profile Widget */}
                <button
                    onClick={() => {
                        hideUpgradeModal();
                        router.push('/profile');
                    }}
                    className="flex items-center ml-2 border-l border-gray-200/50 pl-5 group cursor-pointer"
                >
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100 group-hover:ring-[#8b5cf6]/30 transition-all">
                        {userProfilePhoto ? (
                            <img src={userProfilePhoto} alt="User Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                                👤
                            </div>
                        )}
                    </div>
                </button>
            </div>
        </header>
    );
}
