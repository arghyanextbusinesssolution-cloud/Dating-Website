'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from '@/components/Loader';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Auto-redirect logged-in users to matches section
      router.push('/matches/suggested');
    }
  }, [user, loading, router]);

  if (loading) {
    return <Loader />;
  }

  if (user) {
    // Show loader while redirecting
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50">
      {/* Desktop Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Container */}
        <div className="max-w-md mx-auto lg:max-w-none">
      {/* Top Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Spiritual Unity Match</h1>
          <Link
            href="/auth/register"
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full font-semibold text-sm"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="px-6 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-6xl mb-4">💜</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Find Alignment<br />Before Attraction
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Connect with souls who share your spiritual journey. Where depth meets intention, and conscious relationships begin.
          </p>
          <Link
            href="/auth/register"
            className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:opacity-90 transition-opacity mb-4"
          >
            Get Started Free
          </Link>
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-purple-600 font-semibold">
              Sign In
            </Link>
          </p>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="px-6 py-12 bg-white/50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">About Spiritual Unity Match</h2>
          <div className="space-y-4 text-gray-700">
            <p className="leading-relaxed">
              Spiritual Unity Match is a conscious dating platform designed for spiritual souls seeking meaningful connections. We prioritize depth, intention, and spiritual alignment over superficial connections.
            </p>
            <div className="bg-purple-50 rounded-2xl p-4">
              <h3 className="font-semibold text-purple-800 mb-2">Our Philosophy</h3>
              <p className="text-sm text-purple-700">
                "Find alignment before attraction" - We believe true connections come from shared values, spiritual paths, and conscious intentions, not just physical attraction.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Why Choose Spiritual Unity Match?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: '🧘',
                title: 'Spiritual Matching',
                description: 'Advanced algorithm matches based on spiritual beliefs, practices, and life intentions'
              },
              {
                icon: '💬',
                title: 'Meaningful Connections',
                description: 'Connect with people who share your values and spiritual journey'
              },
              {
                icon: '✨',
                title: 'Conscious Relationships',
                description: 'Build relationships based on depth, intention, and alignment'
              },
              {
                icon: '🔒',
                title: 'Safe & Secure',
                description: 'Verified profiles, privacy controls, and a respectful community'
              },
              {
                icon: '🌱',
                title: 'Growth-Oriented',
                description: 'Tools and features to support your personal and spiritual growth'
              },
              {
                icon: '💜',
                title: 'Authentic Profiles',
                description: 'Comprehensive profiles that reflect your true self and intentions'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-12 bg-white/50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">How It Works</h2>
          <div className="space-y-6">
            {[
              {
                step: '1',
                title: 'Create Your Profile',
                description: 'Share your spiritual beliefs, practices, and what you\'re looking for in a relationship'
              },
              {
                step: '2',
                title: 'Find Your Matches',
                description: 'Our algorithm connects you with people who share your spiritual path and values'
              },
              {
                step: '3',
                title: 'Connect & Message',
                description: 'When you both like each other, start meaningful conversations and build connections'
              },
              {
                step: '4',
                title: 'Build Relationships',
                description: 'Nurture conscious relationships based on alignment, depth, and mutual growth'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Membership Plans Preview */}
      <section className="px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Choose Your Path</h2>
          <p className="text-gray-600 text-center mb-8">Find the plan that aligns with your journey</p>
          
          <div className="space-y-4">
            {[
              {
                name: 'Basic',
                price: '$9.99/month',
                features: ['Create profile', 'Limited browsing', 'Basic features']
              },
              {
                name: 'Standard',
                price: '$19.99/month',
                features: ['Unlimited browsing', 'See who liked you', 'Full messaging', 'Popular'],
                popular: true
              },
              {
                name: 'Premium',
                price: '$39.99/month',
                features: ['Priority placement', 'Advanced filters', 'Unlimited everything']
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-2xl p-6 shadow-lg ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}
              >
                {plan.popular && (
                  <span className="inline-block bg-purple-500 text-white text-xs px-3 py-1 rounded-full mb-3 font-semibold">
                    Most Popular
                  </span>
                )}
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                <p className="text-2xl font-bold text-purple-600 mb-4">{plan.price}</p>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-6">
            <Link
              href="/plans"
              className="inline-block text-purple-600 font-semibold hover:underline"
            >
              View All Plans & Pricing →
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-12 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Begin Your Journey?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of conscious souls seeking meaningful connections
          </p>
          <Link
            href="/auth/register"
            className="inline-block bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:bg-gray-100 transition-colors"
          >
            Get Started Free
          </Link>
          <p className="text-sm mt-4 opacity-75">
            No credit card required to start
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-gray-900 text-white text-center">
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2">Spiritual Unity Match</h3>
          <p className="text-gray-400 text-sm">
            Where Spiritual Heritage Meets Modern Love
          </p>
        </div>
        <div className="flex justify-center gap-6 text-sm text-gray-400 mb-4">
          <Link href="/auth/login" className="hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/plans" className="hover:text-white transition-colors">
            Plans
          </Link>
        </div>
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} Spiritual Unity Match. All rights reserved.
        </p>
      </footer>
        </div>
      </div>
    </div>
  );
}
