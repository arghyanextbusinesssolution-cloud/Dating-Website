'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/api';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(false);

  // TEST MODE: No need to wait for webhook, subscription is already activated
  useEffect(() => {
    // Just verify subscription exists
    const verifySubscription = async () => {
      try {
        await api.get('/subscriptions/my-subscription');
      } catch (error) {
        console.error('Error verifying subscription:', error);
      }
      setLoading(false);
    };
    
    verifySubscription();
  }, []);

  return (
    <div className="min-h-screen bg-spiritual-gradient-light flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-spiritual-violet-600 mx-auto mb-4"></div>
            <p className="text-spiritual-violet-700">Activating your subscription...</p>
          </>
        ) : (
          <>
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-12 h-12 text-green-600"
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
              </div>
              <h1 className="text-3xl font-bold text-spiritual-violet-700 mb-2">
                Welcome Aboard!
              </h1>
              <p className="text-gray-600">
                Your subscription has been activated successfully
              </p>
            </div>

            <div className="space-y-4">
              <Link
                href="/dashboard"
                className="block w-full bg-spiritual-gradient text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/matches/suggested"
                className="block w-full bg-spiritual-violet-100 text-spiritual-violet-700 py-3 rounded-lg font-semibold hover:bg-spiritual-violet-200 transition-colors"
              >
                Start Matching
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

