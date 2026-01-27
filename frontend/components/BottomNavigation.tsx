'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BottomNavigationProps {
  userProfilePhoto?: string | null;
}

export default function BottomNavigation({ userProfilePhoto }: BottomNavigationProps) {
  const pathname = usePathname();

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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const active = isActive(item);
            const isCenter = item.isCenter;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 flex-1 min-w-0"
              >
                <div
                  className={`${
                    isCenter
                      ? 'w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg flex items-center justify-center'
                      : `w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          active
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
                    item.icon
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium leading-tight ${
                    active ? 'text-purple-600' : 'text-gray-600'
                  }`}
                  style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}