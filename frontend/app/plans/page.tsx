'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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

const allFeatures = [
  'Create profile',
  'View own profile',
  'Limited profile browsing',
  'Limited likes',
  'Restricted messaging',
  'Limited visibility',
  'Unlimited profile browsing',
  'Send & receive messages',
  'See who liked you',
  'Basic match suggestions',
  'Improved profile visibility',
  'Priority search placement',
  'Advanced spiritual & compatibility filters',
  'See profile views',
  'Unlimited messaging',
  'Profile boost',
  'Match insights & reflections',
];

export default function PlansPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const getFeatureStatus = (plan: Plan, feature: string) => {
    return plan.features.includes(feature);
  };

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

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Header */}
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-6 px-6 font-semibold text-gray-900">Features</th>
                  {plans.map((plan) => (
                    <th key={plan.plan} className="text-center py-6 px-6 min-w-[200px]">
                      <div className={`p-4 rounded-lg ${plan.popular ? 'bg-spiritual-gradient text-white' : 'bg-gray-50'}`}>
                        {plan.popular && (
                          <div className="text-xs font-semibold mb-2 text-yellow-300">
                            MOST POPULAR
                          </div>
                        )}
                        <div className={`text-xl font-bold ${plan.popular ? 'text-white' : 'text-spiritual-violet-700'}`}>
                          {plan.name}
                        </div>
                        <div className={`text-3xl font-bold mt-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                          ${billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly}
                          <span className={`text-sm font-normal ${plan.popular ? 'text-white/80' : 'text-gray-600'}`}>
                            /{billingCycle === 'monthly' ? 'month' : 'year'}
                          </span>
                        </div>
                        <Link
                          href="/auth/register"
                          className={`inline-block mt-4 px-6 py-2 rounded-lg font-semibold transition-colors ${
                            plan.popular
                              ? 'bg-white text-spiritual-violet-600 hover:bg-gray-100'
                              : 'bg-spiritual-violet-600 text-white hover:bg-spiritual-violet-700'
                          }`}
                        >
                          Get Started
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Features */}
              <tbody>
                {allFeatures.map((feature, index) => (
                  <tr key={feature} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
                    <td className="py-4 px-6 font-medium text-gray-900">
                      {feature}
                    </td>
                    {plans.map((plan) => (
                      <td key={plan.plan} className="text-center py-4 px-6">
                        {getFeatureStatus(plan, feature) ? (
                          <svg
                            className="w-6 h-6 text-green-500 mx-auto"
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
                        ) : (
                          <svg
                            className="w-6 h-6 text-gray-300 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

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

