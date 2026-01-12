'use client';

import { motion } from 'framer-motion';
import { SpiritualUnityLogo } from '@/components/SpiritualUnityLogo';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const contactMethods = [
    {
      icon: '📧',
      title: 'Email Us',
      description: 'Send us an email and we\'ll respond within 24 hours',
      contact: 'support@spiritualunitymatch.com',
      action: 'mailto:support@spiritualunitymatch.com'
    },
    {
      icon: '💬',
      title: 'Live Chat',
      description: 'Chat with our spiritual support team',
      contact: 'Available 24/7',
      action: '#'
    },
    {
      icon: '📞',
      title: 'Phone Support',
      description: 'Speak directly with our relationship experts',
      contact: '+1 (555) 123-LOVE',
      action: 'tel:+15551235683'
    },
    {
      icon: '📍',
      title: 'Visit Us',
      description: 'Our spiritual headquarters',
      contact: '123 Enlightenment Way, Spiritual City, SC 12345',
      action: '#'
    }
  ];

  const faqs = [
    {
      question: 'How do I create my spiritual profile?',
      answer: 'Creating your profile is simple! Sign up, complete our soul assessment, and share your spiritual journey. Our AI will help match you with compatible partners.'
    },
    {
      question: 'Is my personal information safe?',
      answer: 'Absolutely! We use bank-level encryption and never share your personal information. Your spiritual journey remains private and sacred.'
    },
    {
      question: 'How does the matching algorithm work?',
      answer: 'Our proprietary algorithm analyzes over 50 spiritual and compatibility factors, including beliefs, practices, values, and life goals to find your perfect match.'
    },
    {
      question: 'Can I change my subscription plan?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any differences.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day satisfaction guarantee. If you\'re not finding meaningful connections, we\'ll refund your subscription.'
    },
    {
      question: 'How do I report inappropriate behavior?',
      answer: 'Use the report button on any profile or message. Our team reviews all reports within 24 hours and takes appropriate action.'
    }
  ];

  const socialLinks = [
    { name: 'Facebook', icon: '📘', url: '#' },
    { name: 'Instagram', icon: '📷', url: '#' },
    { name: 'Twitter', icon: '🐦', url: '#' },
    { name: 'LinkedIn', icon: '💼', url: '#' },
    { name: 'YouTube', icon: '📺', url: '#' }
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
            Contact Us
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-spiritual-violet-600 max-w-2xl mx-auto leading-relaxed"
          >
            We're here to support your spiritual journey. Reach out to us anytime -
            we're committed to helping you find meaningful connections.
          </motion.p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-spiritual-violet-700 mb-6">
              Get In Touch
            </h2>
            <div className="w-24 h-1 bg-spiritual-gradient mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">{method.icon}</div>
                <h3 className="text-xl font-semibold text-spiritual-violet-700 mb-2">
                  {method.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {method.description}
                </p>
                <a
                  href={method.action}
                  className="text-spiritual-violet-600 font-semibold hover:text-spiritual-violet-800 transition-colors"
                >
                  {method.contact}
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-spiritual-violet-700 mb-6">
                Send Us a Message
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Have a question about spiritual dating? Need help with your profile?
                We're here to help you on your journey.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spiritual-violet-500 focus:border-transparent transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spiritual-violet-500 focus:border-transparent transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spiritual-violet-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select a topic</option>
                    <option value="technical">Technical Support</option>
                    <option value="account">Account Issues</option>
                    <option value="billing">Billing & Subscriptions</option>
                    <option value="matching">Matching Questions</option>
                    <option value="spiritual">Spiritual Guidance</option>
                    <option value="partnership">Partnership Inquiries</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spiritual-violet-500 focus:border-transparent transition-colors resize-vertical"
                    placeholder="Tell us how we can help you on your spiritual journey..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-spiritual-gradient text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </motion.div>

            {/* Contact Info & Map */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-spiritual-violet-700 mb-6">
                  Our Spiritual Headquarters
                </h2>
                <div className="bg-spiritual-gradient-light rounded-xl p-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="text-2xl mr-4">📍</div>
                      <div>
                        <h3 className="font-semibold text-spiritual-violet-700">Address</h3>
                        <p className="text-gray-600">123 Enlightenment Way<br />Spiritual City, SC 12345<br />United States</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="text-2xl mr-4">🕒</div>
                      <div>
                        <h3 className="font-semibold text-spiritual-violet-700">Business Hours</h3>
                        <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM EST<br />Weekend Support: 10:00 AM - 4:00 PM EST</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="text-2xl mr-4">🌟</div>
                      <div>
                        <h3 className="font-semibold text-spiritual-violet-700">Response Time</h3>
                        <p className="text-gray-600">Email: Within 24 hours<br />Live Chat: Immediate<br />Phone: Immediate during business hours</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="text-xl font-semibold text-spiritual-violet-700 mb-4">
                  Follow Our Spiritual Journey
                </h3>
                <div className="flex flex-wrap gap-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:border-spiritual-violet-300 hover:shadow-md transition-all"
                    >
                      <span className="text-xl">{social.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{social.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-spiritual-gradient-light">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-spiritual-violet-700 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="w-24 h-1 bg-spiritual-gradient mx-auto rounded-full"></div>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <h3 className="text-lg font-semibold text-spiritual-violet-700 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
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
              Ready to Start Your Spiritual Journey?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join our community of spiritually aligned individuals and discover
              meaningful connections that nourish your soul.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/auth/register"
                className="bg-white text-spiritual-violet-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Create Your Profile
              </a>
              <a
                href="/how-it-works"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Learn More
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}