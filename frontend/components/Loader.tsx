'use client';

import { motion } from 'framer-motion';

export function Loader() {
  return (
    <div className="min-h-screen bg-spiritual-gradient-light flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* Three Dot Loader */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-4 h-4 bg-spiritual-violet-600 rounded-full"
              animate={{
                y: [0, -10, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: index * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Loading Text */}
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="mt-6 text-spiritual-violet-700 font-semibold"
        >
          Connecting to the Universe...
        </motion.p>
      </motion.div>
    </div>
  );
}

