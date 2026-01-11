'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/api';
import BottomNavigation from '@/components/BottomNavigation';
import CheckInCalendar from '@/components/CheckInCalendar';

/**
 * ✨ Soul Button - Your Inner Work Space
 * 
 * The Soul button represents your journey of inner growth and conscious connection.
 * This is where you prepare yourself for meaningful love - not just swipe for it.
 */

type PathChoice = 'check-in' | 'reflect' | 'grow' | null;
type Section = 'check-in' | 'journal' | 'readiness' | 'rituals' | 'growth' | 'library';
type Emotion = 'calm' | 'heavy' | 'open' | 'confused' | 'hopeful';
type Need = 'connection' | 'healing' | 'clarity' | 'growth' | 'rest';
type Energy = 'low' | 'balanced' | 'high';

export default function SoulPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);
  const [pathChoice, setPathChoice] = useState<PathChoice>(null);
  const [activeSection, setActiveSection] = useState<Section>('check-in');
  const [hasMatches, setHasMatches] = useState(false);
  const [userProfilePhoto, setUserProfilePhoto] = useState<string | null>(null);
  const [checkInData, setCheckInData] = useState({
    emotion: null as Emotion | null,
    need: null as Need | null,
    energy: null as Energy | null,
  });
  const [todayCheckIn, setTodayCheckIn] = useState<any>(null);
  const [savingCheckIn, setSavingCheckIn] = useState(false);
  const [soulScore, setSoulScore] = useState<number | null>(null);
  const [loadingCheckIn, setLoadingCheckIn] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    // Check if user has matches
    checkMatches();
    // Fetch user profile photo
    fetchUserProfile();
    // Fetch today's check-in and soul score
    fetchTodayCheckIn();
    fetchSoulScore();
  }, [user, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/profiles/me');
      if (response.data.success && response.data.profile) {
        const photo = response.data.profile.photos?.find((p: any) => p.isPrimary)?.url || response.data.profile.photos?.[0]?.url;
        setUserProfilePhoto(photo || null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const checkMatches = async () => {
    try {
      const response = await api.get('/matches/my-matches');
      if (response.data.success && response.data.matches?.length > 0) {
        setHasMatches(true);
      }
    } catch (error) {
      console.error('Error checking matches:', error);
    }
  };

  const handlePathChoice = (path: PathChoice) => {
    setPathChoice(path);
    setShowWelcome(false);
    if (path === 'check-in') {
      setActiveSection('check-in');
    } else if (path === 'reflect') {
      setActiveSection('journal');
    } else if (path === 'grow') {
      setActiveSection('readiness');
    }
  };

  const fetchTodayCheckIn = async () => {
    try {
      setLoadingCheckIn(true);
      const response = await api.get('/soul/check-in');
      if (response.data.success && response.data.checkIn) {
        setTodayCheckIn(response.data.checkIn);
        setCheckInData({
          emotion: response.data.checkIn.emotion,
          need: response.data.checkIn.need,
          energy: response.data.checkIn.energy,
        });
      }
    } catch (error) {
      console.error('Error fetching check-in:', error);
    } finally {
      setLoadingCheckIn(false);
    }
  };

  const fetchSoulScore = async () => {
    try {
      const response = await api.get('/soul/score');
      if (response.data.success) {
        setSoulScore(response.data.score);
      }
    } catch (error) {
      console.error('Error fetching soul score:', error);
    }
  };

  const saveCheckIn = async () => {
    if (!checkInData.emotion || !checkInData.need || !checkInData.energy) {
      return;
    }

    setSavingCheckIn(true);
    try {
      const response = await api.post('/soul/check-in', {
        emotion: checkInData.emotion,
        need: checkInData.need,
        energy: checkInData.energy,
      });

      if (response.data.success) {
        setTodayCheckIn(response.data.checkIn);
        await fetchSoulScore();
        alert('You\'ve aligned with yourself today. ✨');
        // Don't clear check-in data since it's saved
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        alert(error.response.data.message || 'You have already checked in today.');
        await fetchTodayCheckIn(); // Refresh to show today's check-in
      } else {
        alert('Error saving check-in. Please try again.');
      }
    } finally {
      setSavingCheckIn(false);
    }
  };

  const journalPrompts = [
    "What did today teach you about love?",
    "What are you healing from right now?",
    "What does conscious connection mean to you?",
    "How do you want to show up in relationships?",
    "What boundaries are you learning to set?",
    "What are you grateful for in your journey?",
  ];

  const readinessStages = [
    {
      id: 'knowing-self',
      title: 'Knowing Self',
      description: 'Understanding who you are at your core',
      questions: [
        "What are my core values?",
        "What do I need to feel safe and loved?",
        "What are my relationship patterns?",
      ],
      status: 'completed',
    },
    {
      id: 'healing-patterns',
      title: 'Healing Patterns',
      description: 'Working through old wounds and patterns',
      questions: [
        "What patterns am I ready to release?",
        "What healing do I need to do?",
        "How can I love myself more fully?",
      ],
      status: 'in-progress',
    },
    {
      id: 'conscious-love',
      title: 'Conscious Love',
      description: 'Preparing for conscious relationships',
      questions: [
        "What does conscious love mean to me?",
        "How do I communicate my needs?",
        "What am I ready to give and receive?",
      ],
      status: 'locked',
    },
    {
      id: 'sacred-partnership',
      title: 'Sacred Partnership',
      description: 'Ready for deep, meaningful connection',
      questions: [
        "What does sacred partnership look like?",
        "How do I create intimacy safely?",
        "What does commitment mean to me?",
      ],
      status: 'locked',
    },
  ];

  if (!user) {
    return null;
  }

  // Welcome Screen
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50 flex flex-col max-w-md mx-auto pb-20">
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8 w-full"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-8xl mb-4"
            >
              ✨
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Come back to yourself.</h1>
            <p className="text-lg text-gray-600 mb-8">Choose today's path</p>

            <div className="space-y-4">
              {[
                { id: 'check-in' as PathChoice, label: 'Check In', icon: '💭', desc: 'Quick emotional check-in' },
                { id: 'reflect' as PathChoice, label: 'Reflect', icon: '📝', desc: 'Journal and reflect' },
                { id: 'grow' as PathChoice, label: 'Grow', icon: '🌱', desc: 'Continue your journey' },
              ].map((path) => (
                <motion.button
                  key={path.id}
                  onClick={() => handlePathChoice(path.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white rounded-2xl p-6 shadow-lg text-left flex items-center gap-4 hover:shadow-xl transition-shadow"
                >
                  <span className="text-4xl">{path.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{path.label}</h3>
                    <p className="text-sm text-gray-600">{path.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation userProfilePhoto={userProfilePhoto} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50 flex flex-col max-w-md mx-auto pb-20">
      {/* Top Navigation */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowWelcome(true)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-800">✨ Soul</h1>
          <div className="w-10" />
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'check-in' as Section, label: 'Check-In', icon: '💭' },
            { id: 'journal' as Section, label: 'Journal', icon: '📝' },
            { id: 'readiness' as Section, label: 'Readiness', icon: '🌱' },
            { id: 'rituals' as Section, label: 'Rituals', icon: '🕯️', show: hasMatches },
            { id: 'growth' as Section, label: 'Growth', icon: '✨' },
            { id: 'library' as Section, label: 'Library', icon: '📚' },
          ].filter(s => s.show !== false).map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-1">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Daily Check-In Section */}
          {activeSection === 'check-in' && (
            <motion.div
              key="check-in"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Calendar View */}
              <CheckInCalendar />

              {/* Soul Score Display */}
              {soulScore !== null && (
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl shadow-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Your Soul Score</h3>
                      <p className="text-sm opacity-90">Based on your recent check-ins and journal entries</p>
                    </div>
                    <div className="text-5xl font-bold">{soulScore}</div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-3xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-800">Daily Check-In</h2>
                  {todayCheckIn && (
                    <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                      ✓ Checked in today
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-6">
                  Quick 1-2 minute ritual to align with yourself
                </p>

                {/* Current Emotion */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">How are you feeling?</label>
                  <div className="grid grid-cols-5 gap-3">
                    {(['calm', 'heavy', 'open', 'confused', 'hopeful'] as Emotion[]).map((emotion) => (
                      <button
                        key={emotion}
                        onClick={() => !todayCheckIn && setCheckInData({ ...checkInData, emotion })}
                        disabled={!!todayCheckIn}
                        className={`aspect-square rounded-xl text-2xl transition-transform ${
                          todayCheckIn ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                        } ${
                          checkInData.emotion === emotion ? 'ring-4 ring-purple-500 bg-purple-50' : 'bg-gray-50'
                        }`}
                      >
                        {emotion === 'calm' && '😌'}
                        {emotion === 'heavy' && '😔'}
                        {emotion === 'open' && '😊'}
                        {emotion === 'confused' && '😕'}
                        {emotion === 'hopeful' && '✨'}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center capitalize">{checkInData.emotion || 'Select emotion'}</p>
                </div>

                {/* Current Need */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">What do you need?</label>
                  <div className="space-y-2">
                    {(['connection', 'healing', 'clarity', 'growth', 'rest'] as Need[]).map((need) => (
                      <button
                        key={need}
                        onClick={() => !todayCheckIn && setCheckInData({ ...checkInData, need })}
                        disabled={!!todayCheckIn}
                        className={`w-full p-3 rounded-xl text-left transition-all ${
                          todayCheckIn ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          checkInData.need === need
                            ? 'bg-purple-500 text-white shadow-lg'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="capitalize">{need}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Energy Level */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">What's your energy today?</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['low', 'balanced', 'high'] as Energy[]).map((energy) => (
                      <button
                        key={energy}
                        onClick={() => !todayCheckIn && setCheckInData({ ...checkInData, energy })}
                        disabled={!!todayCheckIn}
                        className={`p-4 rounded-xl font-medium transition-all ${
                          todayCheckIn ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          checkInData.energy === energy
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="capitalize">{energy}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {!todayCheckIn && checkInData.emotion && checkInData.need && checkInData.energy && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={saveCheckIn}
                    disabled={savingCheckIn}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
                  >
                    {savingCheckIn ? 'Saving...' : 'Complete Check-In ✨'}
                  </motion.button>
                )}
                {todayCheckIn && (
                  <div className="w-full bg-green-50 border-2 border-green-200 text-green-700 py-4 rounded-xl font-medium text-center">
                    You've already checked in today. Check-ins cannot be modified once saved.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Journal Section */}
          {activeSection === 'journal' && (
            <motion.div
              key="journal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Reflection & Journaling</h2>
                <p className="text-gray-600 mb-6">
                  Your private space for reflection, gratitude, and growth
                </p>

                {/* Daily Prompts */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Today's Reflection Prompts</h3>
                  <div className="space-y-3">
                    {journalPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => {/* Set prompt as active */}}
                        className="w-full p-4 bg-purple-50 rounded-xl text-left hover:bg-purple-100 transition-colors"
                      >
                        <p className="text-gray-700 font-medium">{prompt}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Free Journaling */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Free Journal</h3>
                  <textarea
                    rows={8}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
                    placeholder="Write freely about your journey, insights, or anything on your heart..."
                  />
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 bg-purple-500 text-white py-2 rounded-xl font-medium">Save Entry</button>
                    <button className="px-4 bg-gray-100 text-gray-700 py-2 rounded-xl font-medium">Gratitude Note</button>
                  </div>
                </div>

                {/* Relationship Lessons */}
                <div className="p-4 bg-blue-50 rounded-xl">
                  <h4 className="font-semibold text-gray-800 mb-2">💜 Relationship Lessons</h4>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none text-sm"
                    placeholder="What are you learning about love and relationships?"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Spiritual Readiness Path */}
          {activeSection === 'readiness' && (
            <motion.div
              key="readiness"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Spiritual Readiness Path</h2>
                <p className="text-gray-600 mb-6">
                  A guided inner journey to prepare you for meaningful connection
                </p>
              </div>

              {readinessStages.map((stage, index) => (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-2xl p-6 shadow-lg ${
                    stage.status === 'locked' ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{stage.title}</h3>
                      <p className="text-sm text-gray-600">{stage.description}</p>
                    </div>
                    {stage.status === 'completed' && <span className="text-2xl">✅</span>}
                    {stage.status === 'in-progress' && <span className="text-2xl">🌱</span>}
                    {stage.status === 'locked' && <span className="text-2xl">🔒</span>}
                  </div>

                  {stage.status !== 'locked' && (
                    <div className="space-y-2 mt-4">
                      {stage.questions.map((q, qIndex) => (
                        <div key={qIndex} className="p-3 bg-purple-50 rounded-lg text-sm text-gray-700">
                          {q}
                        </div>
                      ))}
                      <button className="w-full mt-3 bg-purple-500 text-white py-2 rounded-xl font-medium">
                        {stage.status === 'completed' ? 'Review' : 'Continue'}
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Connection Rituals (For Matched Users) */}
          {activeSection === 'rituals' && hasMatches && (
            <motion.div
              key="rituals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Rituals</h2>
                <p className="text-gray-600 mb-6">
                  7-day connection journey to deepen your bond with your match
                </p>

                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                    <h3 className="font-semibold text-gray-800 mb-2">Day 1: Setting Intentions Together</h3>
                    <p className="text-sm text-gray-600 mb-3">Today's shared prompt:</p>
                    <p className="text-gray-700 font-medium mb-3">"What makes you feel safe with someone?"</p>
                    <button className="w-full bg-purple-500 text-white py-2 rounded-xl font-medium">
                      Start Day 1
                    </button>
                  </div>

                  {[
                    { day: 2, prompt: "What does commitment mean to you?", icon: '💜' },
                    { day: 3, prompt: "How do you express love?", icon: '🌙' },
                    { day: 4, prompt: "What are your relationship dreams?", icon: '✨' },
                  ].map((ritual) => (
                    <div key={ritual.day} className="p-4 bg-gray-50 rounded-xl opacity-60">
                      <div className="flex items-center gap-2 mb-2">
                        <span>{ritual.icon}</span>
                        <h3 className="font-semibold text-gray-800">Day {ritual.day}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{ritual.prompt}</p>
                      <p className="text-xs text-gray-500 mt-2">Locked - Complete previous days</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Solo Growth Mode */}
          {activeSection === 'growth' && (
            <motion.div
              key="growth"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Solo Growth Mode</h2>
                <p className="text-gray-600 mb-6">
                  Even without matches, your growth journey continues. Focus on becoming the person you want to attract.
                </p>

                <div className="space-y-4">
                  {[
                    { icon: '💜', title: 'Healing Prompts', desc: 'Work through patterns and old wounds', className: 'bg-purple-50' },
                    { icon: '🌿', title: 'Self-Love Rituals', desc: 'Daily practices to love yourself more', className: 'bg-pink-50' },
                    { icon: '🕊️', title: 'Letting-Go Exercises', desc: 'Release what no longer serves you', className: 'bg-blue-50' },
                    { icon: '🧘', title: 'Inner Peace Practices', desc: 'Find calm and center within yourself', className: 'bg-green-50' },
                  ].map((activity, index) => (
                    <div key={index} className={`p-5 ${activity.className} rounded-xl`}>
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{activity.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">{activity.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">{activity.desc}</p>
                          <button className="text-purple-600 font-medium text-sm">Explore →</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Soul Library */}
          {activeSection === 'library' && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Soul Library</h2>
                <p className="text-gray-600 mb-6">
                  Learning & inspiration space for your journey
                </p>

                <div className="space-y-4">
                  {[
                    { icon: '📖', title: 'Spiritual Unity Match Guides', desc: 'How to date consciously and intentionally' },
                    { icon: '💬', title: 'Conscious Communication Tips', desc: 'Learn to communicate with depth and clarity' },
                    { icon: '🌱', title: 'Healing Content', desc: 'Resources for emotional and spiritual healing' },
                    { icon: '🧘', title: 'Meditations & Reflections', desc: 'Guided practices for inner work' },
                  ].map((resource, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{resource.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">{resource.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">{resource.desc}</p>
                          <button className="text-purple-600 font-medium text-sm">Read More →</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation userProfilePhoto={userProfilePhoto} />
    </div>
  );
}