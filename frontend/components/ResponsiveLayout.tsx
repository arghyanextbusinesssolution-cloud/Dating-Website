'use client';

import BottomNavigation from '@/components/BottomNavigation';
import SidebarNavigation from '@/components/SidebarNavigation';
import DesktopTopBar from '@/components/DesktopTopBar';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import UpgradeOverlay from '@/components/UpgradeOverlay';

interface ResponsiveLayoutProps {
    children: React.ReactNode;
    userProfilePhoto?: string | null;
}

export default function ResponsiveLayout({ children, userProfilePhoto }: ResponsiveLayoutProps) {
    return (
        <div className="min-h-screen relative flex text-gray-900 group/layout font-sans">
            {/* Background Image Layer (Cloudy sky) */}
            <div
                className="fixed inset-0 z-0 bg-cover bg-center pointer-events-none"
                style={{
                    backgroundImage: 'url("/dreamy-background.png")',
                    backgroundAttachment: 'fixed'
                }}
            />

            {/* Overlay for glassmorphism effect (if needed) */}
            <div className="fixed inset-0 z-0 bg-white/10 pointer-events-none" />

            {/* Desktop Sidebar - hidden on mobile */}
            <SidebarNavigation userProfilePhoto={userProfilePhoto} />

            {/* Main content area */}
            <div className="flex-1 flex flex-col md:ml-64 relative z-10">
                {/* Desktop Top Bar */}
                <DesktopTopBar userProfilePhoto={userProfilePhoto} />

                <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation - hidden on desktop */}
            <div className="md:hidden relative z-50">
                <BottomNavigation userProfilePhoto={userProfilePhoto} />
            </div>

            {/* Upgrade Overlay */}
            <UpgradeOverlay />
        </div>
    );
}
