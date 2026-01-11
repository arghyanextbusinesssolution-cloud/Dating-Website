'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export function Loader() {
  return (
    <div className="min-h-screen bg-spiritual-gradient-light flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* Spinning Logo */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="relative w-20 h-20 mx-auto mb-6"
        >
          <Image
            src="/logo.webp"
            alt="SoulAlign Logo"
            width={80}
            height={80}
            className="object-contain"
          />
        </motion.div>

        {/* Pulsing Circles */}
        <div className="relative w-32 h-32 mx-auto">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="absolute inset-0 border-4 border-spiritual-violet-500 rounded-full"
              animate={{
                scale: [1, 1.5, 1.5],
                opacity: [1, 0, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.5,
                ease: 'easeOut'
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

