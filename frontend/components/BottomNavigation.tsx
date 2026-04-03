'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface BottomNavigationProps {
  userProfilePhoto?: string | null;
}

export default function BottomNavigation({ userProfilePhoto }: BottomNavigationProps) {
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 md:hidden">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const active = isActive(item);
            const isCenter = item.isCenter;
            const isRestricted = (item.label === 'Messages' || item.label === 'Likes') && isBasic;

            const handleClick = (e: React.MouseEvent) => {
              if (isRestricted) {
                console.log(`[BottomNav] Access to ${item.label} DENIED. User role: ${user?.role}. Showing upgrade modal.`);
                e.preventDefault();
                showUpgradeModal();
              } else {
                const isSecure = (item.label === 'Messages' || item.label === 'Likes');
                if (isSecure) {
                  console.log(`[BottomNav] Access to ${item.label} GRANTED. User role: ${user?.role}. Navigating to ${item.href}.`);
                } else {
                  console.log(`[BottomNav] Navigating to unrestricted route: ${item.href}`);
                }
                hideUpgradeModal();
                router.push(item.href);
              }
            };

            return (
              <button
                key={item.href}
                onClick={handleClick}
                className="flex flex-col items-center justify-center gap-1 flex-1 min-w-0"
              >
                <div
                  className={`${isCenter
                    ? 'w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg flex items-center justify-center'
                    : `w-10 h-10 rounded-full flex items-center justify-center transition-colors ${active
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`
                    } ${item.isProfile && !userProfilePhoto ? 'bg-gray-100' : ''}`}
                >
                  {item.isProfile && userProfilePhoto ? (
                    <div className="w-full h-full rounded-full overflow-hidden">
                      {item.icon}
                    </div>
                  ) : (
                    <div className="relative">
                      {item.icon}
                      {isRestricted && (
                        <span className="absolute -top-1.5 -right-1.5 text-[10px] filter saturate-0 opacity-70">🔒</span>
                      )}
                    </div>
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium leading-tight ${active ? 'text-purple-600' : 'text-gray-600'
                    }`}
                  style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}