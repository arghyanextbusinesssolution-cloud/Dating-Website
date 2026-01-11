'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ReactNode } from 'react';

interface AnimatedButtonProps {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export function AnimatedButton({
  href,
  onClick,
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
}: AnimatedButtonProps) {
  const baseClasses = 'relative px-8 py-4 rounded-lg font-semibold overflow-hidden transition-all duration-300 flex items-center justify-center space-x-2';
  
  const variants = {
    primary: 'bg-spiritual-gradient text-white shadow-lg shadow-spiritual-violet-500/50',
    secondary: 'bg-white border-2 border-spiritual-violet-200 text-spiritual-violet-700',
    outline: 'bg-transparent border-2 border-spiritual-violet-600 text-spiritual-violet-700',
  };

  const buttonContent = (
    <>
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1,
          ease: 'linear',
        }}
      />

      {/* Ripple effect on hover */}
      <motion.div
        className="absolute inset-0 bg-white/20 rounded-full"
        initial={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 4, opacity: [0, 0.3, 0] }}
        transition={{ duration: 0.6 }}
      />

      {/* Content */}
      <span className="relative z-10">{children}</span>

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-lg bg-spiritual-gradient opacity-0 blur-xl"
        whileHover={{ opacity: 0.5 }}
        transition={{ duration: 0.3 }}
      />
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`${baseClasses} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}`}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full h-full"
        >
          {buttonContent}
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      whileHover={disabled ? {} : { scale: 1.05, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      {buttonContent}
    </motion.button>
  );
}

