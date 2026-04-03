'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';

export default function StripeSettings() {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stripeKey, setStripeKey] = useState('pk_live_51234567890abcdefghijklmnop');

  const handleCopyKey = () => {
    navigator.clipboard.writeText(stripeKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700"
      >
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Stripe API Keys</h3>

        {/* Publishable Key */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
            Publishable Key
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={stripeKey}
                readOnly
                className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg border border-neutral-300 dark:border-neutral-600"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button
              onClick={handleCopyKey}
              className="px-4 py-2 bg-spiritual-violet-600 hover:bg-spiritual-violet-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
            Use this key in your frontend application
          </p>
        </div>

        {/* Secret Key */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
            Secret Key
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type={showKey ? 'text' : 'password'}
                value="sk_live_••••••••••••••••••••••••"
                readOnly
                className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg border border-neutral-300 dark:border-neutral-600"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
            Keep this key secret. It's only visible in environment variables.
          </p>
        </div>

        {/* Webhook Settings */}
        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
          <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">Webhook Configuration</h4>
          <div>
            <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
              Webhook Endpoint URL
            </label>
            <input
              type="text"
              value="https://your-domain.com/api/webhooks/stripe"
              readOnly
              className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg border border-neutral-300 dark:border-neutral-600 mb-2"
            />
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Configure this URL in your Stripe Dashboard → Developers → Webhooks
            </p>
          </div>
        </div>
      </motion.div>

      {/* Key Rotation Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700"
      >
        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">🔐 Security Notes</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• Never commit secret keys to version control</li>
          <li>• Rotate keys periodically for security</li>
          <li>• Use restricted keys with appropriate permissions</li>
          <li>• Monitor webhook activity for suspicious attempts</li>
        </ul>
      </motion.div>
    </div>
  );
}
