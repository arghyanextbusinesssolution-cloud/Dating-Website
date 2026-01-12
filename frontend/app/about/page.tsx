'use client';

import { motion } from 'framer-motion';
import { SpiritualUnityLogo } from '@/components/SpiritualUnityLogo';

export default function AboutPage() {
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
            className="text-5xl font-bold text-spiritual-violet-700 mb-6"
          >
            About Spiritual Unity Match
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-spiritual-violet-600 max-w-2xl mx-auto leading-relaxed"
          >
            We believe that true love transcends the physical realm. Our mission is to connect souls
            who share spiritual values, creating meaningful relationships that nurture both the heart and spirit.
          </motion.p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-spiritual-violet-700 mb-6">Our Story</h2>
            <div className="w-24 h-1 bg-spiritual-gradient mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <p className="text-lg text-gray-700 leading-relaxed">
                Spiritual Unity Match was born from a simple yet profound realization: in our fast-paced,
                material world, many people yearn for deeper connections that nourish the soul.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Founded by spiritual practitioners who experienced the challenges of finding like-minded
                partners, we created a platform that prioritizes spiritual compatibility alongside
                emotional and physical attraction.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our journey began with a vision of fostering authentic relationships built on shared
                spiritual values, mutual respect, and genuine love that transcends the ordinary.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square bg-spiritual-gradient rounded-2xl p-8 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🙏</div>
                  <p className="text-xl font-semibold">Guided by Love & Light</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 px-4 bg-spiritual-gradient-light">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-spiritual-violet-700 mb-6">Our Core Values</h2>
            <div className="w-24 h-1 bg-spiritual-gradient mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '💜',
                title: 'Authenticity',
                description: 'We believe in genuine connections built on truth, transparency, and mutual respect.'
              },
              {
                icon: '🕉️',
                title: 'Spiritual Growth',
                description: 'Our platform supports personal and spiritual development within relationships.'
              },
              {
                icon: '🤝',
                title: 'Unity & Harmony',
                description: 'We foster environments where diverse spiritual paths can unite in love and understanding.'
              },
              {
                icon: '🌟',
                title: 'Conscious Love',
                description: 'We promote mindful relationships that honor both partners\' spiritual journeys.'
              },
              {
                icon: '🔒',
                title: 'Safety & Respect',
                description: 'Your spiritual journey and personal information are always protected and respected.'
              },
              {
                icon: '🌈',
                title: 'Inclusivity',
                description: 'We welcome all spiritual paths, beliefs, and backgrounds in our loving community.'
              }
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-spiritual-violet-700 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-4xl font-bold text-spiritual-violet-700 mb-6">Our Mission</h2>
            <div className="w-24 h-1 bg-spiritual-gradient mx-auto rounded-full mb-8"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-spiritual-gradient-light rounded-2xl p-8 md:p-12"
          >
            <p className="text-2xl text-spiritual-violet-700 font-medium leading-relaxed mb-6">
              "To create a sacred space where souls can find their perfect spiritual counterpart,
              fostering relationships that elevate consciousness and bring more love, light, and harmony into the world."
            </p>
            <div className="text-lg text-spiritual-violet-600">
              — The Spiritual Unity Match Team
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-spiritual-gradient">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-6">Our Community</h2>
            <div className="w-24 h-1 bg-white/30 mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: '10,000+', label: 'Spiritual Connections' },
              { number: '50+', label: 'Countries Represented' },
              { number: '95%', label: 'Satisfaction Rate' },
              { number: '24/7', label: 'Spiritual Support' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-white/80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-spiritual-violet-700 mb-6">
              Join Our Spiritual Community
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Ready to embark on a journey of spiritual love and connection?
              Join thousands of like-minded souls who have found meaningful relationships on our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/auth/register"
                className="bg-spiritual-gradient text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Start Your Journey
              </a>
              <a
                href="/plans"
                className="border-2 border-spiritual-violet-600 text-spiritual-violet-600 px-8 py-3 rounded-lg font-semibold hover:bg-spiritual-violet-50 transition-colors"
              >
                View Plans
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}