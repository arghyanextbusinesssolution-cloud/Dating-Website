'use client';

import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

export default function MessagesSection() {
  const messages = [
    { id: 1, from: 'samant455@gmail.com', to: 'aa@email.com', preview: 'Hey, how are you doing?', date: '2025-01-15', read: false },
    { id: 2, from: 'aa@email.com', to: 'samant455@gmail.com', preview: 'I am doing great! How about you?', date: '2025-01-15', read: true },
    { id: 3, from: 'x@as.in', to: 'ana@a.in', preview: 'Would love to meet sometime', date: '2025-01-14', read: true },
  ];

  return (
    <div className="space-y-6">
      {/* Message Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Messages</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">27</p>
            </div>
            <MessageSquare className="text-blue-600" size={32} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Unread Messages</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">4</p>
            </div>
            <MessageSquare className="text-orange-600" size={32} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Avg. Response Time</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">2h 15m</p>
            </div>
            <MessageSquare className="text-green-600" size={32} />
          </div>
        </motion.div>
      </div>

      {/* Messages List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden border border-neutral-200 dark:border-neutral-700"
      >
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Recent Messages</h3>
        </div>
        <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {messages.map((msg) => (
            <div key={msg.id} className={`p-6 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors cursor-pointer ${!msg.read ? 'bg-spiritual-violet-50 dark:bg-spiritual-violet-900/10' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    {msg.from} → {msg.to}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">{msg.preview}</p>
                </div>
                {!msg.read && <div className="w-2 h-2 bg-spiritual-violet-600 rounded-full ml-4 mt-1"></div>}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-500">{msg.date}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
