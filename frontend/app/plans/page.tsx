'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import Link from 'next/link';
import DefaultNavbar from '@/components/DefaultNavbar';

interface Plan {
  name: string;
  plan: 'basic' | 'standard' | 'premium';
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon: string;
}

const plans: Plan[] = [
  {
    name: 'Basic',
    plan: 'basic',
    price: '$0',
    description: 'Start your spiritual journey',
    features: [
      'Create profile',
      'View own profile',
      '10 profile views/day',
      'Limited likes',
      'Basic community access',
    ],
    icon: '🌱',
  },
  {
    name: 'Standard',
    plan: 'standard',
    price: '$19',
    description: 'Our most popular choice',
    features: [
      'Unlimited profile browsing',
      'Full messaging',
      'See who liked you',
      'Basic match suggestions',
      'Improved profile visibility',
      'Community events access',
    ],
    popular: true,
    icon: '✨',
  },
  {
    name: 'Premium',
    plan: 'premium',
    price: '$39',
    description: 'Divine connection experience',
    features: [
      'Priority search placement',
      'Advanced spiritual filters',
      'See profile views',
      'Unlimited messaging',
      'Profile boost',
      'Soul compatibility reports',
    ],
    icon: '👑',
  },
];

export default function PlansPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  const handleSelectPlan = async (plan: 'basic' | 'standard' | 'premium') => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

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
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.message || 'Error activating subscription');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <DefaultNavbar />
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 font-serif">
            Choose Your <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Spiritual Path</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Find the perfect plan for your journey of love, alignment, and conscious connection.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.plan}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className={`bg-white rounded-[40px] shadow-2xl p-8 lg:p-10 relative flex flex-col transition-all duration-300 ${plan.popular ? 'ring-4 ring-purple-500/20 scale-105 z-10' : ''
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <div className="text-6xl mb-6">{plan.icon}</div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">{plan.name}</h2>
                <p className="text-gray-500 font-bold mb-6">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-6xl font-black text-gray-900">{plan.price}</span>
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">/ month</span>
                </div>
              </div>

              <div className="flex-1">
                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700 group">
                      <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center mr-4 group-hover:bg-purple-100 transition-colors">
                        <svg className="w-3.5 h-3.5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-base font-bold text-gray-600 group-hover:text-gray-900 transition-colors">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSelectPlan(plan.plan)}
                disabled={loading}
                className={`w-full py-5 rounded-[24px] font-black text-base uppercase tracking-widest transition-all duration-300 ${plan.popular
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02]'
                  : 'bg-gray-50 text-gray-900 border-2 border-gray-100 hover:bg-gray-100 hover:border-gray-200'
                  } disabled:opacity-50`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Select Plan'
                )}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-20"
        >
          <div className="bg-white/40 backdrop-blur-md rounded-[32px] p-8 inline-block border border-white/60 shadow-xl">
            <p className="text-xl font-bold text-gray-800 mb-6">
              Ready to find your spiritual connection?
            </p>
            <Link
              href="/auth/register"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-4 rounded-full font-black uppercase tracking-widest text-sm hover:shadow-2xl hover:shadow-purple-500/30 transition-all hover:scale-105"
            >
              Start Your Journey Today
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
