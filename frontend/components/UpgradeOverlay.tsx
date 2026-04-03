'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/contexts/SubscriptionContext';
import api from '@/lib/api';
import { useState } from 'react';

const plans = [
    {
        name: 'Standard',
        plan: 'standard',
        price: '$19',
        description: 'Awaken your journey with essential divine features.',
        features: [
            'Unlimited profile browsing',
            'Full messaging capabilities',
            'Reveal who liked your soul',
            'Advanced match filters',
            'Daily profile boost',
        ],
        popular: true,
        icon: '✨',
        gradient: 'from-[#8b5cf6] via-[#7c3aed] to-[#6d28d9]',
        bgBlur: 'bg-purple-500/10',
        borderColor: 'border-purple-400/30',
        shadow: 'shadow-purple-500/20',
    },
    {
        name: 'Premium',
        plan: 'premium',
        price: '$39',
        description: 'The ultimate path to spiritual alignment.',
        features: [
            'Priority search placement',
            'Divine compatibility reports',
            'See detailed profile visits',
            'Ghost mode browsing',
            'Exclusive event access',
            'Infinite soul reach',
        ],
        icon: '👑',
        gradient: 'from-[#f59e0b] via-[#d97706] to-[#b45309]',
        bgBlur: 'bg-amber-500/10',
        borderColor: 'border-amber-400/30',
        shadow: 'shadow-amber-500/20',
    },
];

export default function UpgradeOverlay() {
    const { isUpgradeModalOpen, hideUpgradeModal } = useSubscription();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSelectPlan = async (plan: string) => {
        setLoading(true);
        try {
            const response = await api.post('/subscriptions/create-checkout', {
                plan,
                billingCycle: 'monthly',
            });

            if (response.data.success) {
                if (response.data.redirectUrl) {
                    router.push(response.data.redirectUrl);
                } else {
                    router.push('/subscription/success');
                }
                hideUpgradeModal();
            }
        } catch (error: any) {
            console.error('Checkout error:', error);
            alert(error.response?.data?.message || 'Error activating subscription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isUpgradeModalOpen && (
                <div className="fixed inset-0 md:left-64 z-[100] flex items-center justify-center p-4 md:p-8 lg:p-12 overflow-hidden">
                    {/* Immersive Background */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-[20px]"
                    />

                    {/* Glowing Orbs */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                            x: [0, 50, 0],
                            y: [0, -50, 0]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"
                    />
                    <motion.div
                        animate={{
                            scale: [1.2, 1, 1.2],
                            opacity: [0.3, 0.5, 0.3],
                            x: [0, -50, 0],
                            y: [0, 50, 0]
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        transition={{ type: 'spring', duration: 0.8, bounce: 0.2 }}
                        className="relative w-full max-w-6xl max-h-[90vh] flex flex-col items-center z-10"
                    >
                        {/* Header Area */}
                        <div className="text-center mb-6 md:mb-10">
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
                                    Unlock Your <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">Divine Potential</span>
                                </h2>
                                <div className="flex items-center justify-center gap-4">
                                    <div className="h-px w-10 bg-gradient-to-r from-transparent to-white/30" />
                                    <p className="text-[10px] md:text-xs text-white/60 font-medium uppercase tracking-[0.4em]">
                                        Infinite Connection Awaits
                                    </p>
                                    <div className="h-px w-10 bg-gradient-to-l from-transparent to-white/30" />
                                </div>
                            </motion.div>
                        </div>

                        {/* Plans Grid */}
                        <div className="w-full flex flex-col md:flex-row gap-6 lg:gap-10 items-stretch justify-center px-4 overflow-y-auto custom-scrollbar pb-8">
                            {plans.map((plan, index) => (
                                <motion.div
                                    key={plan.plan}
                                    initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                                    whileHover={{ y: -10 }}
                                    className={`flex-1 max-w-sm relative flex flex-col bg-white/5 backdrop-blur-[40px] rounded-[32px] p-6 lg:p-8 border ${plan.borderColor} ${plan.shadow} hover:shadow-2xl transition-all duration-500 overflow-hidden group`}
                                >
                                    {/* Internal Glow */}
                                    <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${plan.gradient} opacity-20 blur-3xl rounded-full group-hover:opacity-40 transition-opacity`} />

                                    {plan.popular && (
                                        <div className="absolute top-6 left-1/2 -translate-x-1/2">
                                            <span className="bg-white/10 backdrop-blur-md text-white/90 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/20">
                                                Highly Aligned
                                            </span>
                                        </div>
                                    )}

                                    <div className="text-center mb-4 relative z-10 pt-1">
                                        <span className="text-4xl mb-3 block drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{plan.icon}</span>
                                        <h3 className="text-xl font-black text-white mb-0.5">{plan.name}</h3>
                                        <p className="text-white/50 text-[9px] font-bold uppercase tracking-widest mb-3 px-4 leading-relaxed">{plan.description}</p>
                                        <div className="flex items-baseline justify-center gap-1 mb-1">
                                            <span className="text-white/40 text-lg font-bold">$</span>
                                            <span className="text-3xl font-black text-white">{plan.price.replace('$', '')}</span>
                                            <span className="text-white/30 font-bold text-[8px] uppercase tracking-widest ml-1">/ mo</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 mb-8 relative z-10">
                                        <ul className="space-y-3">
                                            {plan.features.map((feature, idx) => (
                                                <motion.li
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.6 + idx * 0.05 }}
                                                    className="flex items-center gap-2.5 group/item"
                                                >
                                                    <div className={`w-5 h-5 rounded-full ${plan.bgBlur} flex items-center justify-center border border-white/10 group-hover/item:border-white/30 transition-colors flex-shrink-0`}>
                                                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-[11px] font-bold text-white/70 group-hover/item:text-white transition-colors">{feature}</span>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSelectPlan(plan.plan)}
                                        disabled={loading}
                                        className={`relative w-full py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-[0.3em] overflow-hidden group/btn ${loading ? 'opacity-70 pointer-events-none' : ''}`}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-r ${plan.gradient} transition-transform group-hover/btn:scale-110`} />
                                        <span className="relative z-10 text-white flex items-center justify-center gap-2">
                                            {loading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>Manifesting...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Choose {plan.name}</span>
                                                    <svg className="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                    </svg>
                                                </>
                                            )}
                                        </span>
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>

                        {/* Trusted Text */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="mt-8 text-[10px] text-white/20 font-bold uppercase tracking-[0.5em] text-center"
                        >
                            Secure Sacred Connection • Advanced Soul Matching • Divine Support
                        </motion.p>
                    </motion.div>
                </div>
            )}
            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
        </AnimatePresence>
    );
}
