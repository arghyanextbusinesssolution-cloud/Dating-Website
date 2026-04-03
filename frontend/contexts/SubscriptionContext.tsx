'use client';

import React, { createContext, useContext, useState } from 'react';

interface SubscriptionContextType {
    isUpgradeModalOpen: boolean;
    showUpgradeModal: () => void;
    hideUpgradeModal: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const showUpgradeModal = () => setIsUpgradeModalOpen(true);
    const hideUpgradeModal = () => setIsUpgradeModalOpen(false);

    return (
        <SubscriptionContext.Provider
            value={{
                isUpgradeModalOpen,
                showUpgradeModal,
                hideUpgradeModal,
            }}
        >
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
}
