'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: string;
}

export default function ComingSoonModal({ isOpen, onClose, provider }: ComingSoonModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full relative"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Content */}
              <div className="text-center">
                <div className="text-6xl mb-4">🚀</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon!</h2>
                <p className="text-gray-600 mb-6">
                  {provider} login will be available soon. For now, please use email and password to sign in.
                </p>
                <button
                  onClick={onClose}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}