'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import Link from 'next/link';

interface Plan {
  name: string;
  plan: 'basic' | 'standard' | 'premium';
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    name: 'Basic',
    plan: 'basic',
    price: { monthly: 9.99, yearly: 99.99 },
    features: [
      'Create profile',
      'View own profile',
      'Limited profile browsing',
      'Limited likes',
      'Restricted messaging',
      'Limited visibility',
    ],
  },
  {
    name: 'Standard',
    plan: 'standard',
    price: { monthly: 19.99, yearly: 199.99 },
    features: [
      'Unlimited profile browsing',
      'Send & receive messages',
      'See who liked you',
      'Basic match suggestions',
      'Improved profile visibility',
    ],
    popular: true,
  },
  {
    name: 'Premium',
    plan: 'premium',
    price: { monthly: 39.99, yearly: 399.99 },
    features: [
      'Priority search placement',
      'Advanced spiritual & compatibility filters',
      'See profile views',
      'Unlimited messaging',
      'Profile boost',
      'Match insights & reflections',
    ],
  },
];

export default function PlansPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
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
        billingCycle,
      });

      if (response.data.success) {
        // TEST MODE: Direct redirect to success page (no Stripe checkout)
        if (response.data.redirectUrl) {
          router.push(response.data.redirectUrl);
        } else {
          // Fallback to success page
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

  const getFeatureStatus = (plan: Plan, feature: string) => {
    return plan.features.includes(feature);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-spiritual-gradient-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spiritual-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-spiritual-gradient-light py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-spiritual-violet-700 mb-4">
            Choose Your Spiritual Path
          </h1>
          <p className="text-xl text-spiritual-violet-600 mb-8">
            Find the perfect plan for your journey of love and connection
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-spiritual-violet-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-spiritual-violet-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Yearly
              <span className="ml-2 text-sm text-green-600 font-medium">Save 17%</span>
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.plan}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-2xl shadow-xl p-8 relative ${
                plan.popular ? 'ring-2 ring-spiritual-violet-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-spiritual-gradient text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <h2 className="text-2xl font-bold text-spiritual-violet-700 mb-2">
                {plan.name}
              </h2>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ${billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly}
                </span>
                <span className="text-gray-600">
                  /{billingCycle === 'monthly' ? 'month' : 'year'}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-spiritual-violet-500 mr-2 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.plan)}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold transition-opacity ${
                  plan.popular
                    ? 'bg-spiritual-gradient text-white'
                    : 'bg-spiritual-violet-100 text-spiritual-violet-700 hover:bg-spiritual-violet-200'
                } disabled:opacity-50`}
              >
                {loading ? 'Processing...' : 'Select Plan'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-lg text-spiritual-violet-600 mb-6">
            Ready to find your spiritual connection?
          </p>
          <Link
            href="/auth/register"
            className="inline-block bg-spiritual-gradient text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Start Your Journey Today
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

