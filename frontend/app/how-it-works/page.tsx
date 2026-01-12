'use client';

import { motion } from 'framer-motion';
import { SpiritualUnityLogo } from '@/components/SpiritualUnityLogo';
import Link from 'next/link';

export default function HowItWorksPage() {
  const steps = [
    {
      step: 1,
      title: 'Create Your Spiritual Profile',
      description: 'Begin your journey by creating a profile that reflects your authentic self. Share your spiritual beliefs, practices, and what you seek in a partner.',
      icon: '✨',
      details: [
        'Personal information and preferences',
        'Spiritual background and practices',
        'Relationship goals and values',
        'Profile photos and bio'
      ],
      color: 'from-purple-500 to-purple-600'
    },
    {
      step: 2,
      title: 'Complete Soul Assessment',
      description: 'Take our comprehensive spiritual compatibility assessment to understand your soul\'s journey and find your perfect match.',
      icon: '🧘‍♀️',
      details: [
        'Spiritual readiness evaluation',
        'Compatibility preferences',
        'Communication style assessment',
        'Values and beliefs alignment'
      ],
      color: 'from-pink-500 to-pink-600'
    },
    {
      step: 3,
      title: 'AI-Powered Matching',
      description: 'Our advanced algorithm analyzes spiritual compatibility, values, and life goals to suggest meaningful connections.',
      icon: '🔮',
      details: [
        'Spiritual compatibility matching',
        'Values and beliefs alignment',
        'Lifestyle and goals matching',
        'Personality trait analysis'
      ],
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      step: 4,
      title: 'Connect & Communicate',
      description: 'Start meaningful conversations with spiritually aligned matches. Use our guided conversation starters and spiritual prompts.',
      icon: '💬',
      details: [
        'Safe messaging platform',
        'Spiritual conversation guides',
        'Video and voice calls',
        'Shared spiritual activities'
      ],
      color: 'from-teal-500 to-teal-600'
    },
    {
      step: 5,
      title: 'Build Soul Connections',
      description: 'Nurture relationships through shared spiritual practices, meditation sessions, and meaningful experiences together.',
      icon: '💑',
      details: [
        'Joint meditation sessions',
        'Spiritual date ideas',
        'Community events',
        'Ongoing compatibility growth'
      ],
      color: 'from-emerald-500 to-emerald-600'
    }
  ];

  const features = [
    {
      icon: '🔒',
      title: 'Safe & Secure',
      description: 'Advanced security measures and privacy protection for your spiritual journey.'
    },
    {
      icon: '📱',
      title: 'Mobile Optimized',
      description: 'Access your spiritual connections anywhere with our responsive mobile app.'
    },
    {
      icon: '🤖',
      title: 'Smart Matching',
      description: 'AI-powered algorithm that learns and improves your match suggestions.'
    },
    {
      icon: '🌟',
      title: 'Spiritual Growth',
      description: 'Tools and resources to support your spiritual development within relationships.'
    },
    {
      icon: '💝',
      title: 'Meaningful Connections',
      description: 'Focus on deep, soul-level connections rather than superficial attraction.'
    },
    {
      icon: '🌍',
      title: 'Global Community',
      description: 'Connect with spiritually aligned individuals from around the world.'
    }
  ];

  return (
    <div className="min-h-screen bg-spiritual-gradient-light">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <SpiritualUnityLogo className="mx-auto mb-6" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-spiritual-violet-700 mb-6"
          >
            How Spiritual Unity Match Works
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-spiritual-violet-600 max-w-2xl mx-auto leading-relaxed"
          >
            Discover how our unique approach combines ancient wisdom with modern technology
            to help you find your perfect spiritual partner.
          </motion.p>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-spiritual-violet-700 mb-6">
              Your Spiritual Journey in 5 Steps
            </h2>
            <div className="w-24 h-1 bg-spiritual-gradient mx-auto rounded-full"></div>
          </motion.div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-24 left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
              <div className="h-1 bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 rounded-full"></div>
            </div>

            <div className="space-y-12 md:space-y-0">
              {steps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className={`flex flex-col md:flex-row items-center gap-8 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Step Number & Icon */}
                  <div className="flex-shrink-0 relative">
                    <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-3xl md:text-4xl shadow-lg relative z-10`}>
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -left-2 w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-r from-purple-200 to-pink-200 opacity-30"></div>
                    <div className="absolute -bottom-4 -right-4 bg-spiritual-violet-600 text-white text-sm font-bold w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center">
                      {step.step}
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`flex-1 text-center md:text-left ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                    <h3 className="text-2xl md:text-3xl font-bold text-spiritual-violet-700 mb-4">
                      {step.title}
                    </h3>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Details List */}
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <ul className="space-y-3">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-center">
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${step.color} mr-3 flex-shrink-0`}></div>
                            <span className="text-gray-700">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-spiritual-violet-700 mb-6">
              Why Choose Spiritual Unity Match?
            </h2>
            <div className="w-24 h-1 bg-spiritual-gradient mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-spiritual-gradient-light rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-spiritual-violet-700 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 px-4 bg-spiritual-gradient-light">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-spiritual-violet-700 mb-6">
              Advanced Spiritual Technology
            </h2>
            <div className="w-24 h-1 bg-spiritual-gradient mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-spiritual-violet-700">
                Soul Compatibility Algorithm
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our proprietary algorithm analyzes over 50 spiritual and compatibility factors
                to find your perfect match. We consider everything from meditation practices
                to life philosophies, ensuring deep, meaningful connections.
              </p>

              <div className="space-y-4">
                {[
                  'Spiritual belief systems analysis',
                  'Meditation and mindfulness compatibility',
                  'Life purpose and goal alignment',
                  'Communication style matching',
                  'Emotional intelligence assessment'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className="w-2 h-2 bg-spiritual-violet-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white rounded-2xl p-8 shadow-xl">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔮</div>
                  <h4 className="text-xl font-semibold text-spiritual-violet-700 mb-4">
                    AI-Powered Insights
                  </h4>
                  <p className="text-gray-600 mb-6">
                    Get personalized spiritual insights and relationship guidance
                    based on your unique compatibility profile.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-spiritual-violet-600">98%</div>
                      <div className="text-sm text-gray-600">Match Accuracy</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-spiritual-violet-600">24/7</div>
                      <div className="text-sm text-gray-600">Spiritual Support</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-spiritual-gradient">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Find Your Spiritual Match?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join thousands of spiritually aligned individuals who have found meaningful
              connections through our unique platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="bg-white text-spiritual-violet-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Start Your Journey
              </Link>
              <Link
                href="/plans"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                View Plans
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}