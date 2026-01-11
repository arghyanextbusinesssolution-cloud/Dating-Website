'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SubscriptionCancelPage() {
  return (
    <div className="min-h-screen bg-spiritual-gradient-light flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
      >
        <div className="mb-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-spiritual-violet-700 mb-2">
            Payment Canceled
          </h1>
          <p className="text-gray-600">
            Your subscription was not activated. You can try again anytime.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/plans"
            className="block w-full bg-spiritual-gradient text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            View Plans
          </Link>
          <Link
            href="/dashboard"
            className="block w-full bg-spiritual-violet-100 text-spiritual-violet-700 py-3 rounded-lg font-semibold hover:bg-spiritual-violet-200 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

